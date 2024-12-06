<template>
  <div class="orders-page">
    <h1 class="page-title">My Orders</h1>

    <!-- 搜索和筛选区域 -->
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

      <!-- 服务类型切换 -->
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
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="order-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="No more orders"
          @load="onLoad"
        >
          <div v-for="order in displayOrders" :key="order.id" class="order-card" @click="goToDetail(order.id)">
            <!-- 停车场名称和状态 -->
            <div class="card-header">
              <h3>{{ order.parkingLot.name }}</h3>
              <div class="status-badge" :class="getStatusType(order.status)">
                {{ getStatusText(order.status) }}
              </div>
            </div>

            <!-- 地址信息 -->
            <div class="location-info">
              <van-icon name="location-o" />
              <span>{{ order.parkingLot.address }}</span>
            </div>

            <!-- 时间和预定信息 -->
            <div class="time-info">
              <div class="time-row">
                <van-icon name="clock-o" />
                <span class="time">{{ formatTime(order.startTime) }}</span>
                <template v-if="order.status === 'Overtime'">
                  <span class="divider">·</span>
                  <span class="overtime">Overtime {{ getOvertimeDuration(order) }}</span>
                </template>
              </div>
              
              <!-- 预定时长或使用时长 -->
              <div class="duration-row" v-if="isReservation(order) || order.duration">
                <van-icon name="underway-o" />
                <span v-if="isReservation(order)" class="reservation">
                  Reserved {{ getReservationDuration(order) }}
                </span>
                <span v-else class="duration">{{ order.duration }}</span>
              </div>

              <!-- 分隔线 -->
              <div class="info-divider"></div>

              <!-- 车位信息 -->
              <div class="spot-info">
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

            <!-- 车牌和价格 -->
            <div class="card-footer">
              <div class="car-plate-info">
                <van-icon name="car-o" />
                <span class="plate">{{ order.vehicles[0].licensePlate }}</span>
                <span class="price">${{ order.totalAmount.toFixed(2) }}</span>
              </div>
            </div>

            <!-- 移除状态提示 -->
            <!-- <div class="status-hint" v-if="getStatusHint(order.status)">
              {{ getStatusHint(order.status) }}
            </div> -->
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 状态筛选弹出层 -->
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
        <div
          v-for="option in statusOptions"
          :key="option.value"
          class="status-item"
          :class="{ active: status === option.value }"
          @click="selectStatus(option.value)"
        >
          {{ option.text }}
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import type { Order } from '@/types/orders';
import { formatTime } from '@/utils/format';

// 状态管理
const router = useRouter();
const searchText = ref('');
const status = ref('all');
const activeTab = ref('standard');
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const orders = ref<Order[]>([]);

// 筛选选项
const statusOptions = [
  { text: 'All Status', value: 'all' },
  { text: 'Pending', value: 'pending' },
  { text: 'Confirmed', value: 'confirmed' },
  { text: 'Completed', value: 'completed' },
  { text: 'Cancelled', value: 'cancelled' }
] as const;

// 订单状态类型
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

// 过滤后的订单列表
const displayOrders = computed(() => {
  return orders.value.filter((order: Order) => {
    // 服务类型筛选
    if (order.serviceType !== activeTab.value) {
      return false;
    }

    // 状态筛选
    if (status.value !== 'all' && order.status !== status.value) {
      return false;
    }

    // 搜索文本筛选
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

// 获取状态对应的样式类型
function getStatusType(status: ValetStatus | ParkingStatus) {
  const warningStatuses = ['PendingPayment', 'Reserved', 'Requested', 'OnTheWay', 'Overtime'];
  const successStatuses = ['Completed', 'Closed', 'Paid', 'Refunded'];
  const dangerStatuses = ['PaymentFailed', 'Cancelled', 'Expired', 'RefundFailed'];
  const primaryStatuses = ['InUse', 'Parked', 'CheckedIn', 'Ready'];

  if (warningStatuses.includes(status)) return 'warning';
  if (successStatuses.includes(status)) return 'success';
  if (dangerStatuses.includes(status)) return 'danger';
  if (primaryStatuses.includes(status)) return 'primary';
  return 'default';
}

// 获取状态文本
function getStatusText(status: ValetStatus | ParkingStatus) {
  return status.replace(/([A-Z])/g, ' $1').trim();
}

// 获取状态提示文本
function getStatusHint(status: ValetStatus | ParkingStatus) {
  const hints: Record<string, string> = {
    PendingPayment: 'Waiting for payment',
    PaymentFailed: 'Payment failed, please try again',
    AwaitingUse: 'Ready to use',
    InUse: 'Currently in use',
    Overtime: 'Additional fee required',
    RefundRequested: 'Processing refund request',
    Reserved: 'Valet spot reserved',
    CheckedIn: 'Vehicle checked in',
    Parked: 'Vehicle safely parked',
    Requested: 'Pickup requested',
    OnTheWay: 'Vehicle being retrieved',
    Ready: 'Vehicle ready for pickup'
  };
  return hints[status] || '';
}

// 搜索
function onSearch() {
  orders.value = []; // 清空列表
  loading.value = true;
  onLoad();
}

// 加载数据
function onLoad() {
  setTimeout(() => {
    const parkingStatuses: ParkingStatus[] = [
      'PendingPayment', 'AwaitingUse', 'InUse', 'Used', 'Completed',
      'PaymentFailed', 'Cancelled', 'Expired', 'RefundRequested',
      'ProcessingRefund', 'Refunded', 'RefundFailed', 'Overtime'
    ];
    
    const valetStatuses: ValetStatus[] = [
      'Reserved', 'CheckedIn', 'Pending', 'Parked',
      'Requested', 'OnTheWay', 'Ready', 'Paid', 'Closed'
    ];

    const newOrders = Array(10).fill(null).map((_, index) => {
      const isValet = activeTab.value === 'valet';
      const statusList = isValet ? valetStatuses : parkingStatuses;
      
      return {
        id: orders.value.length + index + 1,
        orderNo: Math.random().toString(36).substr(2, 8).toUpperCase(),
        status: statusList[Math.floor(Math.random() * statusList.length)],
        parkingLot: {
          id: 1,
          name: 'Central Parking',
          address: '123 Main St, City'
        },
        startTime: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        vehicles: [{ licensePlate: `ABC${Math.floor(Math.random() * 1000)}` }],
        serviceType: isValet ? 'valet' : 'standard',
        totalAmount: Math.floor(Math.random() * 100) + 10,
        createdAt: new Date().toISOString()
      };
    });

    orders.value.push(...newOrders);
    loading.value = false;
    
    if (orders.value.length >= 40) {
      finished.value = true;
    }
  }, 1000);
}

// 刷新
function onRefresh() {
  finished.value = false;
  orders.value = [];
  onLoad();
  refreshing.value = false;
}

// 查看订单详情
function showOrderDetail(order: Order) {
  router.push(`/orders/${order.id}`);
}

// 获取各类型订单数量
function getOrderCount(type: string) {
  if (type === 'all') {
    return mockOrders.valet.length + mockOrders.parking.length;
  }
  return mockOrders[type as keyof typeof mockOrders]?.length || 0;
}

const showFilter = ref(false);

function showStatusFilter() {
  showFilter.value = true;
}

function selectStatus(value: string) {
  status.value = value;
  showFilter.value = false;
  onSearch(); // 更新列表
}

// 判断是否为预定订单
function isReservation(order: Order) {
  const now = new Date();
  const startTime = new Date(order.startTime);
  return startTime > now;
}

// 获取预定时长
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

// 格式化时间
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

// 计算超时时长
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

const mockOrders = {
  valet: [
    {
      id: 'v1',
      orderNo: 'VLT20240301001',
      serviceType: 'valet',
      status: 'Reserved',
      startTime: '2024-03-12T14:30:00',
      vehicles: [{ licensePlate: 'CA 12345' }],
      totalAmount: 35.00,
      parkingLot: {
        name: 'Downtown Valet Parking',
        address: '123 Main St, LA',
        area: 'A'
      },
      spotNo: '1001'
    },
    {
      id: 'v2',
      orderNo: 'VLT20240301002',
      serviceType: 'valet',
      status: 'CheckedIn',
      startTime: '2024-03-12T10:30:00',
      vehicles: [{ licensePlate: 'CA 67890' }],
      totalAmount: 25.00,
      parkingLot: {
        name: 'Luxury Hotel Valet',
        address: '456 Park Ave, LA',
        area: 'B'
      },
      spotNo: '2001'
    },
    {
      id: 'v3',
      orderNo: 'VLT20240301003',
      serviceType: 'valet',
      status: 'Pending',
      startTime: '2024-03-12T09:00:00',
      vehicles: [{ licensePlate: 'CA 11111' }],
      totalAmount: 30.00,
      parkingLot: {
        name: 'Premium Valet Service',
        address: '789 Elite St, LA',
        area: 'C'
      },
      spotNo: '3001'
    },
    {
      id: 'v4',
      orderNo: 'VLT20240301004',
      serviceType: 'valet',
      status: 'Parked',
      startTime: '2024-03-12T08:30:00',
      vehicles: [{ licensePlate: 'CA 22222' }],
      totalAmount: 40.00,
      parkingLot: {
        name: 'Grand Hotel Valet',
        address: '321 Luxury Blvd, LA',
        area: 'D'
      },
      spotNo: '4001'
    },
    {
      id: 'v5',
      orderNo: 'VLT20240301005',
      serviceType: 'valet',
      status: 'Requested',
      startTime: '2024-03-12T07:30:00',
      vehicles: [{ licensePlate: 'CA 33333' }],
      totalAmount: 45.00,
      parkingLot: {
        name: 'Plaza Valet Service',
        address: '555 Plaza Dr, LA',
        area: 'E'
      },
      spotNo: '5001'
    },
    {
      id: 'v6',
      orderNo: 'VLT20240301006',
      serviceType: 'valet',
      status: 'OnTheWay',
      startTime: '2024-03-12T07:00:00',
      vehicles: [{ licensePlate: 'CA 44444' }],
      totalAmount: 50.00,
      parkingLot: {
        name: 'Executive Valet',
        address: '777 Business St, LA',
        area: 'F'
      },
      spotNo: '6001'
    },
    {
      id: 'v7',
      orderNo: 'VLT20240301007',
      serviceType: 'valet',
      status: 'Ready',
      startTime: '2024-03-12T06:30:00',
      vehicles: [{ licensePlate: 'CA 55555' }],
      totalAmount: 55.00,
      parkingLot: {
        name: 'VIP Valet Service',
        address: '888 VIP Way, LA',
        area: 'G'
      },
      spotNo: '7001'
    },
    {
      id: 'v8',
      orderNo: 'VLT20240301008',
      serviceType: 'valet',
      status: 'Paid',
      startTime: '2024-03-12T06:00:00',
      endTime: '2024-03-12T10:00:00',
      vehicles: [{ licensePlate: 'CA 66666' }],
      totalAmount: 60.00,
      parkingLot: {
        name: 'Elite Valet Parking',
        address: '999 Elite Ave, LA',
        area: 'H'
      },
      spotNo: '8001'
    },
    {
      id: 'v9',
      orderNo: 'VLT20240301009',
      serviceType: 'valet',
      status: 'Closed',
      startTime: '2024-03-12T05:30:00',
      endTime: '2024-03-12T09:30:00',
      vehicles: [{ licensePlate: 'CA 77777' }],
      totalAmount: 65.00,
      parkingLot: {
        name: 'Luxury Valet Service',
        address: '111 Luxury Lane, LA',
        area: 'I'
      },
      spotNo: '9001'
    }
  ],
  parking: [
    {
      id: 'p1',
      orderNo: 'PRK20240301001',
      serviceType: 'parking',
      status: 'PendingPayment',
      startTime: '2024-03-12T14:30:00',
      vehicles: [{ licensePlate: 'CA 88888' }],
      totalAmount: 15.00,
      parkingLot: {
        name: 'Central Parking',
        address: '123 Main St, LA',
        area: 'A'
      },
      spotNo: '101'
    },
    {
      id: 'p2',
      orderNo: 'PRK20240301002',
      serviceType: 'parking',
      status: 'AwaitingUse',
      startTime: '2024-03-12T15:00:00',
      vehicles: [{ licensePlate: 'CA 99999' }],
      totalAmount: 20.00,
      parkingLot: {
        name: 'Downtown Parking',
        address: '456 Center St, LA',
        area: 'B'
      },
      spotNo: '102'
    },
    {
      id: 'p3',
      orderNo: 'PRK20240301003',
      serviceType: 'parking',
      status: 'InUse',
      startTime: '2024-03-12T08:00:00',
      vehicles: [{ licensePlate: 'CA 11122' }],
      totalAmount: 25.00,
      parkingLot: {
        name: 'City Plaza Parking',
        address: '789 Plaza Dr, LA',
        area: 'C'
      },
      spotNo: '103'
    },
    {
      id: 'p4',
      orderNo: 'PRK20240301004',
      serviceType: 'parking',
      status: 'Used',
      startTime: '2024-03-12T07:00:00',
      endTime: '2024-03-12T12:00:00',
      vehicles: [{ licensePlate: 'CA 22233' }],
      totalAmount: 30.00,
      parkingLot: {
        name: 'Metro Parking',
        address: '321 Metro St, LA',
        area: 'D'
      },
      spotNo: '104'
    },
    {
      id: 'p5',
      orderNo: 'PRK20240301005',
      serviceType: 'parking',
      status: 'Completed',
      startTime: '2024-03-11T14:00:00',
      endTime: '2024-03-11T18:00:00',
      vehicles: [{ licensePlate: 'CA 33344' }],
      totalAmount: 35.00,
      parkingLot: {
        name: 'Station Parking',
        address: '654 Station Ave, LA',
        area: 'E'
      },
      spotNo: '105'
    },
    {
      id: 'p6',
      orderNo: 'PRK20240301006',
      serviceType: 'parking',
      status: 'PaymentFailed',
      startTime: '2024-03-12T16:00:00',
      vehicles: [{ licensePlate: 'CA 44455' }],
      totalAmount: 40.00,
      parkingLot: {
        name: 'West Parking',
        address: '987 West St, LA',
        area: 'F'
      },
      spotNo: '106'
    },
    {
      id: 'p7',
      orderNo: 'PRK20240301007',
      serviceType: 'parking',
      status: 'Cancelled',
      startTime: '2024-03-12T16:30:00',
      vehicles: [{ licensePlate: 'CA 55566' }],
      totalAmount: 45.00,
      parkingLot: {
        name: 'East Parking',
        address: '654 East Ave, LA',
        area: 'G'
      },
      spotNo: '107'
    },
    {
      id: 'p8',
      orderNo: 'PRK20240301008',
      serviceType: 'parking',
      status: 'Expired',
      startTime: '2024-03-11T10:00:00',
      vehicles: [{ licensePlate: 'CA 66677' }],
      totalAmount: 50.00,
      parkingLot: {
        name: 'North Parking',
        address: '321 North Blvd, LA',
        area: 'H'
      },
      spotNo: '108'
    },
    {
      id: 'p9',
      orderNo: 'PRK20240301009',
      serviceType: 'parking',
      status: 'RefundRequested',
      startTime: '2024-03-12T17:00:00',
      vehicles: [{ licensePlate: 'CA 77788' }],
      totalAmount: 55.00,
      parkingLot: {
        name: 'South Parking',
        address: '123 South St, LA',
        area: 'I'
      },
      spotNo: '109'
    },
    {
      id: 'p10',
      orderNo: 'PRK20240301010',
      serviceType: 'parking',
      status: 'ProcessingRefund',
      startTime: '2024-03-12T17:30:00',
      vehicles: [{ licensePlate: 'CA 88899' }],
      totalAmount: 60.00,
      parkingLot: {
        name: 'Central Square Parking',
        address: '456 Square Ave, LA',
        area: 'J'
      },
      spotNo: '110'
    },
    {
      id: 'p11',
      orderNo: 'PRK20240301011',
      serviceType: 'parking',
      status: 'Refunded',
      startTime: '2024-03-12T18:00:00',
      vehicles: [{ licensePlate: 'CA 99900' }],
      totalAmount: 65.00,
      parkingLot: {
        name: 'Plaza Square Parking',
        address: '789 Plaza Square, LA',
        area: 'K'
      },
      spotNo: '111'
    },
    {
      id: 'p12',
      orderNo: 'PRK20240301012',
      serviceType: 'parking',
      status: 'RefundFailed',
      startTime: '2024-03-12T18:30:00',
      vehicles: [{ licensePlate: 'CA 00011' }],
      totalAmount: 70.00,
      parkingLot: {
        name: 'City Center Parking',
        address: '321 Center Plaza, LA',
        area: 'L'
      },
      spotNo: '112'
    },
    {
      id: 'p13',
      orderNo: 'PRK20240301013',
      serviceType: 'parking',
      status: 'Overtime',
      startTime: '2024-03-12T07:00:00',
      endTime: '2024-03-12T12:00:00',
      vehicles: [{ licensePlate: 'CA 11223' }],
      totalAmount: 75.00,
      parkingLot: {
        name: 'Metro Center Parking',
        address: '654 Metro Center, LA',
        area: 'M'
      },
      spotNo: '113'
    }
  ]
};

// 修改 activeTab 的 watch 或点击处理函数
function handleTabChange(tab: string) {
  activeTab.value = tab;
  if (tab === 'all') {
    orders.value = [...mockOrders.valet, ...mockOrders.parking];
  } else {
    orders.value = mockOrders[tab as keyof typeof mockOrders] || [];
  }
  // 重置列表状态
  finished.value = true;
  loading.value = false;
}

// 跳转到订单详情
function goToDetail(orderId: string) {
  const currentOrder = orders.value.find(order => order.id === orderId);
  if (currentOrder) {
    // 使用 query 传递订单数据
    router.push({
      name: 'ParkingOrderDetail',
      params: { id: orderId },
      query: { data: JSON.stringify(currentOrder) }
    });
  }
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

/* 状态筛选弹出层样式 */
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
  padding: 10px;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.tab.active {
  background: #fff;
  color: #000;
  font-weight: 500;
}

.count {
  font-size: 12px;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
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
}

.card-header h3 {
  font-size: 18px;
  font-weight: 500;
  color: #fff;
  margin: 0;
}

.status-badge {
  font-size: 13px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 20px;
}

.status-badge.primary { background: #4361ee; color: #fff; }
.status-badge.warning { background: #ff9f1c; color: #fff; }
.status-badge.success { background: #2ec4b6; color: #fff; }
.status-badge.danger { background: #e71d36; color: #fff; }

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
  color: #666;
}

.reservation {
  color: #ff9f1c;
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

/* 加载状态样式 */
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

/* 移除状态提示相关样式 */
.status-hint {
  display: none;
}
</style> 