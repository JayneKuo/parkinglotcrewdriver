<template>
  <div class="orders-page">
    <h1 class="page-title">My Orders</h1>

    <!-- Search and filter area -->
    <div class="sticky-header">
      <div class="search-filter-bar">
        <van-search
          v-model="searchText"
          placeholder="Search orders"
          shape="round"
          class="search-input"
        />
        <div class="filter-btn" @click="showStatusFilter">
          <van-icon name="filter-o" />
          <span>{{ status === 'all' ? 'All' : status }}</span>
        </div>
      </div>

      <!-- Service type tabs -->
      <div class="tab-group">
        <div 
          class="tab" 
          :class="{ active: activeTab === 'all' }" 
          @click="handleTabChange('all')"
        >
          All
          <span class="count">{{ getOrderCount('all') }}</span>
        </div>
        <div 
          class="tab" 
          :class="{ active: activeTab === 'valet' }" 
          @click="handleTabChange('valet')"
        >
          Valet
          <span class="count">{{ getOrderCount('valet') }}</span>
        </div>
        <div 
          class="tab" 
          :class="{ active: activeTab === 'parking' }" 
          @click="handleTabChange('parking')"
        >
          Parking
          <span class="count">{{ getOrderCount('parking') }}</span>
        </div>
        <div 
          class="tab" 
          :class="{ active: activeTab === 'dock' }" 
          @click="handleTabChange('dock')"
        >
          Dock
          <span class="count">{{ getOrderCount('dock') }}</span>
        </div>
      </div>
    </div>

    <!-- Order list -->
    <div class="order-list">
      <van-pull-refresh 
        v-model="refreshing" 
        @refresh="onRefresh"
        success-text="Refresh successful"
        pulling-text="Pull to refresh..."
        loosing-text="Release to refresh..."
        loading-text="Loading..."
      >
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="No more orders"
          loading-text="Loading..."
          error-text="Request failed, click to retry"
          @load="onLoad"
        >
          <div v-for="order in displayOrders" :key="order.id" class="order-card" @click="goToDetail(order.id)">
            <!-- Parking lot name and status -->
            <div class="card-header">
              <div class="header-left">
                <div class="title-row">
                  <h3 class="venue-name">{{ order.parkingLot.name }}</h3>
                  <span class="service-type" :class="order.serviceType">
                    {{ getServiceTypeText(order.serviceType) }}
                  </span>
                </div>
              </div>
              <div class="status-badge" :class="getStatusType(order.status)">
                {{ getStatusText(order.status) }}
              </div>
            </div>

            <!-- Address info -->
            <div class="location-info">
              <van-icon name="location-o" />
              <span>{{ order.parkingLot.address }}</span>
            </div>

            <!-- Time and reservation info -->
            <div class="time-info">
              <div class="time-row">
                <van-icon name="clock-o" />
                <span class="time">{{ formatTime(order.startTime) }}</span>
                <template v-if="order.status === 'Overtime'">
                  <span class="divider">·</span>
                  <span class="overtime">Overtime {{ getOvertimeDuration(order) }}</span>
                </template>
              </div>
              
              <!-- Duration or reservation info -->
              <div class="duration-row" v-if="isReservation(order)">
                <van-icon 
                  :name="getReservationIcon(order)" 
                  :class="getReservationIconClass(order)"
                />
                <span :class="getReservationTextClass(order)">
                  {{ getReservationText(order) }}
                </span>
              </div>

              <!-- Divider -->
              <div class="info-divider"></div>

              <!-- Spot info -->
              <div class="spot-info" v-if="shouldShowSpotInfo(order)">
                <div class="spot-row">
                  <van-icon name="location" />
                  <span class="spot-text">
                    <span class="zone">Zone {{ order.parkingLot.area || 'A' }}</span>
                    <span class="divider">·</span>
                    <span class="space">Space {{ order.spotNo || '1001' }}</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- License plate and price -->
            <div class="card-footer">
              <div class="car-plate-info">
                <van-icon name="car-o" />
                <span class="plate">{{ order.vehicles[0].licensePlate }}</span>
                <span class="price">${{ order.totalAmount.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- Status filter popup -->
    <van-popup
      v-model:show="showFilter"
      position="bottom"
      round
      class="status-popup"
    >
      <div class="popup-header">
        <span>Filter by Status</span>
        <van-icon name="cross" @click="showFilter = false" />
      </div>
      <div class="status-list">
        <!-- All Status 选项 -->
        <div
          class="status-item"
          :class="{ active: status === 'all' && activeTab === 'all' }"
          @click="selectStatus('all')"
        >
          All Status
        </div>

        <!-- 业务类型分组 -->
        <div
          v-for="group in allStatusOptions.slice(1)"
          :key="group.value"
          class="status-group"
        >
          <div class="group-title">{{ group.text }}</div>
          <div
            v-for="child in group.children"
            :key="child.value"
            class="status-item"
            :class="{
              active: (child.value === `${group.value}-all` && activeTab === group.value && status === 'all') ||
                     (child.value === `${group.value}-${status}` && activeTab === group.value)
            }"
            @click="selectStatus(child.value)"
          >
            {{ child.text }}
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import type { Order } from '@/types/orders';
import { formatTime } from '@/utils/format';
import { getStatusType, getStatusText, getStatusHint } from '@/types/orderStatus';

// Status management
const router = useRouter();
const route = useRoute();
const searchText = ref('');
const status = ref('all');
const activeTab = ref('all');
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const orders = ref<Order[]>([]);

// Filter options
interface StatusOption {
  text: string;
  value: string;
  children?: StatusOption[];
}

// 修改状态选项定义
const allStatusOptions: StatusOption[] = [
  { text: 'All Status', value: 'all' },
  { 
    text: 'Valet',
    value: 'valet',
    children: [
      { text: 'All Valet', value: 'valet-all' },
      { text: 'Reserved', value: 'valet-Reserved' },
      { text: 'Checked In', value: 'valet-CheckedIn' },
      { text: 'Parked', value: 'valet-Parked' },
      { text: 'Pickup Requested', value: 'valet-Requested' },
      { text: 'On The Way', value: 'valet-OnTheWay' },
      { text: 'Ready', value: 'valet-Ready' },
      { text: 'Completed', value: 'valet-Completed' },
      { text: 'Cancelled', value: 'valet-Cancelled' }
    ]
  },
  {
    text: 'Parking',
    value: 'parking',
    children: [
      { text: 'All Parking', value: 'parking-all' },
      { text: 'Pending Payment', value: 'parking-PendingPayment' },
      { text: 'Awaiting Use', value: 'parking-AwaitingUse' },
      { text: 'In Use', value: 'parking-InUse' },
      { text: 'Used', value: 'parking-Used' },
      { text: 'Overtime', value: 'parking-Overtime' },
      { text: 'Completed', value: 'parking-Completed' },
      { text: 'Cancelled', value: 'parking-Cancelled' }
    ]
  },
  {
    text: 'Dock',
    value: 'dock',
    children: [
      { text: 'All Dock', value: 'dock-all' },
      { text: 'Requested', value: 'dock-Requested' },
      { text: 'Scheduled', value: 'dock-Scheduled' },
      { text: 'Arrived', value: 'dock-Arrived' },
      { text: 'In Progress', value: 'dock-InProgress' },
      { text: 'Loading Completed', value: 'dock-LoadingCompleted' },
      { text: 'Payment Pending', value: 'dock-PaymentPending' },
      { text: 'Completed', value: 'dock-Completed' },
      { text: 'Cancelled', value: 'dock-Cancelled' }
    ]
  }
];

// Order status types
type ValetStatus = 
  | 'Reserved' 
  | 'CheckedIn' 
  | 'Pending' 
  | 'Parked' 
  | 'Requested' 
  | 'OnTheWay' 
  | 'Ready' 
  | 'Paid' 
  | 'Closed';

type ParkingStatus = 
  | 'PendingPayment'
  | 'PaymentFailed'
  | 'AwaitingUse'
  | 'InUse'
  | 'Used'
  | 'Completed'
  | 'Cancelled'
  | 'Expired'
  | 'RefundRequested'
  | 'ProcessingRefund'
  | 'Refunded'
  | 'RefundFailed'
  | 'Overtime';

type DockStatus = 
  | 'Requested'      // 已申请
  | 'Scheduled'      // 已预约
  | 'Arrived'        // 已到达
  | 'InProgress'     // 装卸中
  | 'LoadingCompleted' // 装卸完成
  | 'PaymentPending'   // 待支付
  | 'Completed'      // 已完成
  | 'Cancelled';     // 已取消

// Filtered order list
const displayOrders = computed(() => {
  return orders.value.filter((order: Order) => {
    // Service type filter (只在非 all 模式下过滤)
    if (activeTab.value !== 'all' && order.serviceType !== activeTab.value) {
      return false;
    }

    // Status filter
    if (status.value !== 'all' && order.status !== status.value) {
      return false;
    }

    // Search text filter
    if (searchText.value) {
      const searchLower = searchText.value.toLowerCase();
      const hasMatchingPlate = order.vehicles.some(
        (v: { licensePlate: string }) => v.licensePlate.toLowerCase().includes(searchLower)
      );
      if (!order.orderNo.toLowerCase().includes(searchLower) && !hasMatchingPlate) {
        return false;
      }
    }

    return true;
  });
});

// Search
function onSearch() {
  orders.value = []; // Clear list
  loading.value = true;
  onLoad();
}

// Load data
function onLoad() {
  setTimeout(() => {
    // 按业务流程顺序定义状态
    const valetStatuses: ValetStatus[] = [
      'Reserved',    // 已预订
      'CheckedIn',   // 已入场
      'Pending',     // 处理中
      'Parked',      // 已停放
      'Requested',   // 请求取车
      'OnTheWay',    // 取车中
      'Ready',       // 就绪
      'Paid',        // 已支付
      'Closed'       // 已完成
    ];
    
    const parkingStatuses: ParkingStatus[] = [
      'PendingPayment',   // 待支付
      'AwaitingUse',      // 待使用
      'InUse',            // 使用中
      'Used',             // 已使用
      'Cancelled',        // 已取消
      'Refunded',         // 已退款
      'Expired',          // 已过期
      'PaymentFailed',    // 支付失败
      'RefundFailed',     // 退款失败
      'RefundRequested',  // 申请退款
      'ProcessingRefund', // 退款处理中
      'Overtime'          // 超时
    ];

    const dockStatuses: DockStatus[] = [
      'Requested',       // 已申请
      'Scheduled',       // 已预约
      'Arrived',         // 已到达
      'InProgress',      // 装卸中
      'LoadingCompleted',// 装卸完成
      'PaymentPending',  // 待支付
      'Completed',       // 已完成
      'Cancelled'        // 已取消
    ];

    const orderCount = 10;
    const newOrders = [];

    // 根据当前选中的 tab 生成对应状态的订单
    if (activeTab.value === 'all') {
      // 在 all 模式下，为每种类型生成一些订单
      ['valet', 'parking', 'dock'].forEach(type => {
        const statusList = type === 'valet' ? valetStatuses : 
                         type === 'parking' ? parkingStatuses : 
                         dockStatuses;
        
        // 为每个状态生成一个订单
        statusList.forEach((status, index) => {
          newOrders.push(generateOrder(type, status, index));
        });
      });
    } else {
      // 在特定 tab 下，按状态顺序生成订单
      const statusList = activeTab.value === 'valet' ? valetStatuses :
                        activeTab.value === 'parking' ? parkingStatuses :
                        dockStatuses;
      
      // 为每个状态生成一个订单
      statusList.forEach((status, index) => {
        newOrders.push(generateOrder(activeTab.value, status, index));
      });
    }

    orders.value.push(...newOrders);
    loading.value = false;
    finished.value = true; // 因为我们已经生成了所有状态的订单
  }, 1000);
}

// 生成单个订单的辅助函数
function generateOrder(serviceType: string, status: string, index: number) {
  const now = new Date();
  let startTime = new Date();

  // 根据不同业务类型和状态设置时间
  const futureStatuses = {
    valet: ['Reserved'],
    parking: ['AwaitingUse', 'PendingPayment'],
    dock: ['Requested', 'Scheduled']
  };

  if (futureStatuses[serviceType as keyof typeof futureStatuses]?.includes(status)) {
    // 未来的预订时间，根据状态设置不同的时间范围
    const daysAhead = status === 'Scheduled' ? 3 : 1; // Scheduled 状态预订时间更长
    startTime = new Date(now.getTime() + (Math.random() * daysAhead * 24 * 60 * 60 * 1000));
  } else {
    // 过去的时间，时间跨度根据状态调整
    startTime = new Date(now.getTime() - (index * 24 * 60 * 60 * 1000));
  }

  // 根据业务类型和状态设置车位信息
  const spotInfo = {
    area: serviceType === 'dock' ? 'D' : 'A',
    spotNo: serviceType === 'dock' ? 
      (shouldShowDockSpot(status) ? `D${String(index + 1).padStart(3, '0')}` : undefined) :
      `${String(index + 1).padStart(3, '0')}`
  };

  return {
    id: orders.value.length + index + 1,
    orderNo: `${serviceType.toUpperCase()}${String(Date.now()).slice(-6)}${index}`,
    status,
    parkingLot: {
      id: 1,
      name: getDockStationName(serviceType),
      address: getDockAddress(serviceType),
      area: spotInfo.area
    },
    startTime: startTime.toISOString(),
    vehicles: [{ 
      licensePlate: `${serviceType === 'dock' ? 'TRUCK' : 'ABC'}${String(index + 1).padStart(3, '0')}` 
    }],
    serviceType,
    totalAmount: 30 + (index * 5), // 金额随状态递增
    createdAt: new Date().toISOString(),
    spotNo: spotInfo.spotNo
  };
}

// Refresh
function onRefresh() {
  finished.value = false;
  orders.value = [];
  status.value = 'all'; // 重置状态筛选
  resetExpandState(); // 重置展开状态
  onLoad();
  refreshing.value = false;
}

// View order details
function showOrderDetail(order: Order) {
  router.push(`/orders/${order.id}`);
}

// Get order counts for different types
function getOrderCount(type: string) {
  if (!orders.value.length) {
    return 0;
  }
  
  if (type === 'all') {
    return orders.value.length;
  }
  
  return orders.value.filter(order => order.serviceType === type).length;
}

const showFilter = ref(false);

function showStatusFilter() {
  showFilter.value = true;
}

// 修改状态选择处理函数
function selectStatus(value: string) {
  if (value === 'all') {
    status.value = 'all';
    activeTab.value = 'all';
  } else {
    const [serviceType, statusValue] = value.split('-');
    if (statusValue === 'all') {
      // 选择了某个业务类型的全部状态
      status.value = 'all';
      activeTab.value = serviceType;
    } else {
      // 选择了具体状态
      status.value = statusValue;
      activeTab.value = serviceType;
    }
  }
  showFilter.value = false;
  orders.value = [];
  loading.value = true;
  onLoad();
}

// Check if it's a reservation order
function isReservation(order: Order) {
  const now = new Date();
  const startTime = new Date(order.startTime);
  const endTime = new Date(order.endTime || order.startTime);
  
  // 根据不同业务类型判断预订状态
  const reservationStatusMap = {
    valet: ['Reserved', 'Parked'],                    // 代客泊车 - 已预订状态和停放中
    parking: ['AwaitingUse', 'PendingPayment', 'Overtime', 'InUse'], // 自助停车 - 添加使用中状态
    dock: ['Scheduled', 'InProgress']                 // 装卸货 - 添加进行中状态
  };

  const statusList = reservationStatusMap[order.serviceType as keyof typeof reservationStatusMap] || [];
  
  // 对于使用中的状态，只在接近结束时显示提示
  if (['InUse', 'Parked', 'InProgress'].includes(order.status)) {
    const minutesToEnd = Math.floor((endTime.getTime() - now.getTime()) / (1000 * 60));
    return minutesToEnd <= 30; // 只在剩余30分钟内显示提示
  }

  return statusList.includes(order.status);
}

// Get reservation duration
function getReservationDuration(order: Order) {
  const now = new Date();
  const startTime = new Date(order.startTime);
  const hours = Math.ceil((startTime.getTime() - now.getTime()) / (1000 * 60 * 60));
  
  if (hours < 24) {
    return `in ${hours}h`;
  } else {
    const days = Math.ceil(hours / 24);
    return `in ${days}d`;
  }
}

// Format time
function formatTime(time: string) {
  const date = new Date(time);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Calculate overtime duration
function getOvertimeDuration(order: Order) {
  const endTime = new Date(order.endTime || order.startTime);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - endTime.getTime()) / (1000 * 60 * 60));
  
  if (diffHours < 1) {
    const diffMinutes = Math.floor((now.getTime() - endTime.getTime()) / (1000 * 60));
    return `${diffMinutes}m`;
  } else if (diffHours < 24) {
    return `${diffHours}h`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  }
}

// 添加初始化函数
function initializeData() {
  loading.value = true;
  finished.value = false;
  onLoad();
}

// 在组件挂载时加载数据
onMounted(() => {
  // 从路由参数中获取 activeTab
  const tabFromRoute = route.query.activeTab;
  if (tabFromRoute && typeof tabFromRoute === 'string') {
    // 确保是有效的 tab 值
    const validTabs = ['all', 'valet', 'parking', 'dock'];
    if (validTabs.includes(tabFromRoute)) {
      activeTab.value = tabFromRoute;
      // 立即根据新的 tab 值更新数据
      orders.value = [];
      loading.value = true;
      onLoad();
    }
  }
  
  // 初始化数据
  initializeData();
});

// 修改 handleTabChange 函数
function handleTabChange(tab: string) {
  if (tab === activeTab.value) return;
  
  activeTab.value = tab;
  status.value = 'all';
  orders.value = [];
  resetExpandState();
  loading.value = true;
  finished.value = false;
  
  // 更新路由参数但不触发新的导航
  router.replace({
    query: {
      ...route.query,
      activeTab: tab
    }
  });
  
  onLoad();
}

// Navigate to order details
function goToDetail(orderId: string | number) {
  const currentOrder = orders.value.find(order => order.id === orderId);
  if (currentOrder) {
    // 打印一下数据，看看是否正确
    console.log('Current Order:', currentOrder);
    
    router.push({
      name: currentOrder.serviceType === 'valet' ? 'ValetOrderDetail' : 'ParkingOrderDetail',
      params: { id: String(orderId) },
      query: {
        type: currentOrder.serviceType,
        status: currentOrder.status,
        // 确保所有需要的数据都被传递
        data: JSON.stringify({
          id: currentOrder.id,
          orderNo: currentOrder.orderNo,
          status: currentOrder.status,
          createdAt: currentOrder.createdAt,
          driver: currentOrder.driver,
          vehicles: currentOrder.vehicles,
          valet: currentOrder.valet,
          parkingLot: currentOrder.parkingLot,
          spotType: currentOrder.spotType,
          rateType: currentOrder.rateType,
          rate: currentOrder.rate,
          spotCount: currentOrder.spotCount,
          startTime: currentOrder.startTime,
          spotNo: currentOrder.spotNo,
          checkInTime: currentOrder.checkInTime,
          parkedTime: currentOrder.parkedTime,
          requestTime: currentOrder.requestTime,
          checkOutTime: currentOrder.checkOutTime,
          duration: currentOrder.duration,
          vehiclePhotos: currentOrder.vehiclePhotos,
          parkedPhoto: currentOrder.parkedPhoto,
          serviceFee: currentOrder.serviceFee,
          tax: currentOrder.tax,
          totalAmount: currentOrder.totalAmount,
          payment: currentOrder.payment
        }),
        activeTab: activeTab.value
      }
    });
  }
}

// 添加获取服务类型文本的函数
function getServiceTypeText(type: string) {
  const typeMap: Record<string, string> = {
    valet: 'Valet',
    parking: 'Parking',
    dock: 'Dock'
  };
  return typeMap[type] || type;
}

// 添加获取停车场名称的辅助函数
function getDockStationName(serviceType: string) {
  if (serviceType === 'dock') {
    const stations = [
      'Cargo Terminal A',
      'Loading Dock B',
      'Freight Station C',
      'Distribution Center',
      'Logistics Hub'
    ];
    return stations[Math.floor(Math.random() * stations.length)];
  }
  return 'Central Parking';
}

// 添加获取地址的辅助函数
function getDockAddress(serviceType: string) {
  if (serviceType === 'dock') {
    const addresses = [
      '789 Port Ave, Industrial Zone',
      '456 Logistics Blvd, Warehouse District',
      '123 Freight St, Commerce Park',
      '321 Terminal Rd, Port Area',
      '654 Dock Way, Industrial Park'
    ];
    return addresses[Math.floor(Math.random() * addresses.length)];
  }
  return '123 Main St, City';
}

// 添加切换展开/收起的函数
function toggleExpand(order: any) {
  order.isExpanded = !order.isExpanded;
}

// 在切换 tab 或刷新时重置展开状态
function resetExpandState() {
  orders.value.forEach(order => {
    order.isExpanded = false;
  });
}

// 修改获取预订文本的函数
function getReservationText(order: Order) {
  const now = new Date();
  const startTime = new Date(order.startTime);
  const endTime = new Date(order.endTime || order.startTime);
  const hours = Math.ceil((startTime.getTime() - now.getTime()) / (1000 * 60 * 60));
  const timeText = hours < 24 ? `${hours}h` : `${Math.ceil(hours / 24)}d`;
  
  // 计算距离结束的时间（分钟）
  const minutesToEnd = Math.floor((endTime.getTime() - now.getTime()) / (1000 * 60));

  const textMap = {
    valet: {
      Reserved: `Valet service in ${timeText}`,
      Parked: minutesToEnd <= 30 ? 'Please extend your valet service if needed' : undefined
    },
    parking: {
      AwaitingUse: `Parking starts in ${timeText}`,
      PendingPayment: 'Complete payment in 15min',
      Overtime: 'Please pay immediately to avoid legal liability',
      InUse: minutesToEnd <= 30 ? 'Please extend your parking time if needed' : undefined
    },
    dock: {
      Scheduled: `Loading service starts in ${timeText}`,
      InProgress: minutesToEnd <= 30 ? 'Please extend your loading service if needed' : undefined
    }
  };

  // 如果是使用中且接近结束时间，显示续订提示
  if (minutesToEnd <= 30 && ['InUse', 'Parked', 'InProgress'].includes(order.status)) {
    return textMap[order.serviceType]?.[order.status] || `${minutesToEnd}min left, extend if needed`;
  }

  return textMap[order.serviceType]?.[order.status] || `Reserved in ${timeText}`;
}

// 添加获取预订图标的函数
function getReservationIcon(order: Order) {
  // 待支付状态
  if (order.status === 'PendingPayment') {
    return 'cash-o';
  }
  
  // 超时状态
  if (order.status === 'Overtime') {
    return 'warning-o';
  }
  
  // 使用中且接近结束时间
  const endTime = new Date(order.endTime || order.startTime);
  const now = new Date();
  const minutesToEnd = Math.floor((endTime.getTime() - now.getTime()) / (1000 * 60));
  if (['InUse', 'Parked', 'InProgress'].includes(order.status) && minutesToEnd <= 30) {
    return 'warning-o';
  }
  
  // 预订状态
  if (['Reserved', 'AwaitingUse', 'Scheduled'].includes(order.status)) {
    return 'underway-o';
  }
  
  return 'info-o';
}

// 添加获取图标样式的函数
function getReservationIconClass(order: Order) {
  return {
    'warning-icon': order.status === 'Overtime' || order.status === 'PendingPayment',
    'alert-icon': ['InUse', 'Parked', 'InProgress'].includes(order.status),
    'info-icon': ['Reserved', 'AwaitingUse', 'Scheduled'].includes(order.status)
  };
}

// 添加获取文本样式的函数
function getReservationTextClass(order: Order) {
  return {
    'warning-text': order.status === 'Overtime' || order.status === 'PendingPayment',
    'alert-text': ['InUse', 'Parked', 'InProgress'].includes(order.status),
    'reservation': ['Reserved', 'AwaitingUse', 'Scheduled'].includes(order.status)
  };
}

// 修改判断是否显示车位信息的函数
function shouldShowSpotInfo(order: Order) {
  // dock 业务特殊处理
  if (order.serviceType === 'dock') {
    // 只有在 Arrived 状态之后才显示车位信息
    const dockStatusOrder = [
      'Requested',      // 不显示
      'Scheduled',      // 不显示
      'Arrived',        // 开始显示
      'InProgress',
      'LoadingCompleted',
      'PaymentPending',
      'Completed',
      'Cancelled'       // 即使取消也显示历史车位
    ];
    
    const currentStatusIndex = dockStatusOrder.indexOf(order.status);
    const arrivedIndex = dockStatusOrder.indexOf('Arrived');
    
    return currentStatusIndex >= arrivedIndex;
  }
  
  // 其他业务类型都显示车位信息
  return true;
}

// 修改判断是否显示 dock 车位的辅助函数
function shouldShowDockSpot(status: string) {
  const showSpotStatuses = [
    'Arrived',          // 从 Arrived 状态开始显示
    'InProgress',
    'LoadingCompleted',
    'PaymentPending',
    'Completed',
    'Cancelled'
  ];
  return showSpotStatuses.includes(status);
}
</script>

<style scoped>
.orders-page {
  background: #141414;
  min-height: 100vh;
  padding: 16px 16px 0;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 16px;
  padding: 0 4px;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 99;
  background: #141414;
  margin: 0 -16px;
  padding: 0 16px 12px;
}

.search-filter-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.search-input {
  flex: 1;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #1a1a1a;
  padding: 8px 12px;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}

:deep(.van-search) {
  padding: 0;
  background: transparent;
}

:deep(.van-search__content) {
  background: #1a1a1a;
}

/* Status filter popup styles */
.status-popup {
  max-height: 70vh;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  font-size: 16px;
  font-weight: 500;
  border-bottom: 1px solid #eee;
}

.popup-header .van-icon {
  font-size: 20px;
  cursor: pointer;
}

.status-list {
  padding: 8px 16px;
}

.status-item {
  padding: 16px 0;
  font-size: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.status-item.active {
  color: #7c4dff;
  font-weight: 500;
}

.status-item:last-child {
  border-bottom: none;
}

.tab-group {
  display: flex;
  background: #1a1a1a;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 8px 4px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.tab.active {
  background: #fff;
  color: #000;
  font-weight: 500;
}

.count {
  font-size: 11px;
  background: rgba(255, 255, 255, 0.1);
  padding: 1px 4px;
  border-radius: 8px;
  min-width: 16px;
}

.tab.active .count {
  background: rgba(0, 0, 0, 0.1);
}

.order-card {
  background: #1a1a1a;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 12px;
}

.header-left {
  flex: 1;
  min-width: 0; /* 允许子元素收缩 */
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.venue-name {
  font-size: 18px;
  font-weight: 500;
  color: #fff;
  margin: 0;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.service-type {
  flex-shrink: 0;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 20px;
  white-space: nowrap;
}

.status-badge.pending { background: #9c27b0; color: #fff; }
.status-badge.warning { background: #ff9f1c; color: #fff; }
.status-badge.primary { background: #4361ee; color: #fff; }
.status-badge.success { background: #2ec4b6; color: #fff; }
.status-badge.danger { background: #e71d36; color: #fff; }
.status-badge.processing { background: #5e35b1; color: #fff; }
.status-badge.default { background: #666; color: #fff; }

.location-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #888;
  font-size: 14px;
  margin-bottom: 12px;
}

.location-info .van-icon {
  color: #666;
  font-size: 16px;
}

.time-info {
  background: #222;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.time-row {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.time-row .time {
  font-size: 15px;
  font-weight: 500;
  color: #fff;
}

.time-row .van-icon {
  font-size: 16px;
  color: #666;
  flex-shrink: 0;
}

.duration-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.duration-row .van-icon {
  font-size: 16px;
}

.warning-icon {
  color: #e71d36; /* 红色 - 警告 */
}

.alert-icon {
  color: #ff9f1c; /* 橙色 - 提醒 */
}

.info-icon {
  color: #4361ee; /* 蓝色 - 信息 */
}

.warning-text {
  color: #e71d36;
  font-weight: 500;
}

.alert-text {
  color: #ff9f1c;
  font-weight: 500;
}

.reservation {
  color: #4361ee;
  font-weight: 500;
}

.duration {
  color: #7c4dff;
  font-weight: 500;
}

.info-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 12px 0;
}

.spot-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.spot-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spot-row .van-icon {
  color: #666;
  font-size: 16px;
}

.spot-text {
  color: #fff;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.zone, .space {
  color: #7c4dff;
  font-weight: 500;
}

.divider {
  color: #444;
  flex-shrink: 0;
}

.card-footer {
  margin-top: 12px;
}

.car-plate-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.car-plate-info .van-icon {
  font-size: 16px;
  color: #666;
}

.plate {
  font-family: 'SF Mono', monospace;
  background: rgba(124, 77, 255, 0.15);
  color: #7c4dff;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.price {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-left: auto;
}

/* Loading state styles */
:deep(.van-list),
:deep(.van-pull-refresh) {
  min-height: calc(100vh - 200px);
}

:deep(.van-loading),
:deep(.van-list__finished-text) {
  color: #666;
  padding: 20px 0;
}

.order-list {
  padding-top: 12px;
}

.overtime {
  color: #e71d36;
  font-weight: 500;
  font-size: 14px;
  flex-shrink: 0;
}

/* Status hint related styles */
.status-hint {
  display: none;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.service-type {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.service-type.valet {
  background: rgba(124, 77, 255, 0.15);
  color: #7c4dff;
}

.service-type.parking {
  background: rgba(46, 196, 182, 0.15);
  color: #2ec4b6;
}

.service-type.dock {
  background: rgba(255, 159, 28, 0.15);
  color: #ff9f1c;
}

/* 修改原有的 card-header 样式 */
.card-header h3 {
  font-size: 18px;
  font-weight: 500;
  color: #fff;
  margin: 0;
}

.venue-name {
  font-size: 18px;
  font-weight: 500;
  color: #fff;
  margin: 0;
  flex: 1;
  min-width: 0;
  padding-right: 4px;
}

.venue-name.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.venue-name-tooltip {
  max-width: 300px;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.4;
  color: #fff;
  background: #333;
  border-radius: 4px;
  word-break: break-word;
}

/* 自定义 Popover 样式 */
:deep(.van-popover) {
  --van-popover-action-width: auto;
  --van-popover-action-height: auto;
  --van-popover-light-text-color: #fff;
  --van-popover-light-background: #333;
}

/* 添加悬停效果 */
.venue-name:hover {
  opacity: 0.8;
}

/* 添加状态组样式 */
.status-group {
  margin-bottom: 16px;
}

.group-title {
  color: #888;
  font-size: 14px;
  padding: 8px 16px;
  background: #1a1a1a;
}

.status-list {
  max-height: 70vh;
  overflow-y: auto;
}

.status-item {
  padding: 12px 16px;
  color: #fff;
  font-size: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.status-item:active {
  background: rgba(124, 77, 255, 0.05);
}

.status-item.active {
  color: #7c4dff;
  background: rgba(124, 77, 255, 0.1);
}
</style> 