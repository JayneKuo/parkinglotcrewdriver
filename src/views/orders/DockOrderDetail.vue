<template>
  <div class="order-detail">
    <van-nav-bar
      title="Order Details"
      left-arrow
      @click-left="router.back()"
      class="custom-nav"
    />

    <div class="content">
      <!-- Order Status -->
      <div class="status-card">
        <div class="status-header">
          <div class="order-info">
            <div class="order-id">{{ currentOrder?.orderNo }}</div>
            <div class="order-time">Created at {{ formatTime(currentOrder?.createdAt) }}</div>
          </div>
          <van-tag 
            :type="getStatusType" 
            size="medium"
          >
            {{ currentOrder?.status }}
          </van-tag>
        </div>
      </div>

      <!-- Driver Information -->
      <div class="section">
        <h2 class="section-title">DRIVER INFORMATION</h2>
        <div class="info-card">
          <div class="info-row">
            <span>Driver Name</span>
            <span>{{ currentOrder?.driver?.name || 'Not provided' }}</span>
          </div>
          <div class="info-row">
            <span>Phone Number</span>
            <span class="clickable" @click="handleCall">
              {{ currentOrder?.driver?.phone || 'Not provided' }}
              <van-icon name="phone-o" class="action-icon" />
            </span>
          </div>
          <div class="info-row">
            <span>License Plate</span>
            <span>{{ currentOrder?.vehicles?.[0]?.licensePlate || 'Not provided' }}</span>
          </div>
          <div class="info-row">
            <span>Carrier</span>
            <span>{{ currentOrder?.carrier || 'Not provided' }}</span>
          </div>
        </div>
      </div>

      <!-- Booking Information -->
      <div class="section">
        <h2 class="section-title">BOOKING INFORMATION</h2>
        <div class="info-card">
          <div class="info-row">
            <span>Parking Lot</span>
            <span>{{ currentOrder?.parkingLot?.name }}</span>
          </div>
          <div class="info-row">
            <span>Address</span>
            <span>{{ currentOrder?.parkingLot?.address }}</span>
          </div>
          <div class="info-row">
            <span>Load Type</span>
            <span>{{ currentOrder?.loadType === 'inbound' ? 'Inbound Loading' : 'Outbound Loading' }}</span>
          </div>
          <div class="info-row">
            <span>Rate Type</span>
            <span>{{ currentOrder?.rateType || 'Hourly' }}</span>
          </div>
          <div class="info-row">
            <span>Dock Spots</span>
            <span>{{ currentOrder?.spotCount || 1 }}</span>
          </div>
          <div class="info-row">
            <span>Start Time</span>
            <span>{{ formatTime(currentOrder?.startTime) }}</span>
          </div>
          <div class="info-row">
            <span>Duration</span>
            <span>{{ currentOrder?.duration }} {{ currentOrder?.unit }}(s)</span>
          </div>
          <div class="info-row">
            <span>Dock Number</span>
            <span>{{ currentOrder?.dockNumber || 'Will be assigned after check-in' }}</span>
          </div>
        </div>
      </div>

      <!-- Parking Information -->
      <div class="section" v-if="hasParkingInfo">
        <h2 class="section-title">PARKING INFORMATION</h2>
        <div class="info-card">
          <div class="info-row" v-if="currentOrder?.checkInTime">
            <span>Check-in Time</span>
            <span>{{ formatTime(currentOrder.checkInTime) }}</span>
          </div>
          <div class="info-row" v-if="currentOrder?.loadingCompletedTime">
            <span>Loading Completed</span>
            <span>{{ formatTime(currentOrder.loadingCompletedTime) }}</span>
          </div>
          <div class="info-row" v-if="currentOrder?.checkOutTime">
            <span>Check-out Time</span>
            <span>{{ formatTime(currentOrder.checkOutTime) }}</span>
          </div>
          <div class="info-row" v-if="parkingDuration">
            <span>Parking Duration</span>
            <span>{{ parkingDuration }}</span>
          </div>
        </div>
      </div>

      <!-- Cargo Information -->
      <div class="section">
        <h2 class="section-title">CARGO INFORMATION</h2>
        <div class="info-card">
          <div class="info-row">
            <span>Cargo Type</span>
            <span>{{ currentOrder?.cargoType || 'Not provided' }}</span>
          </div>
          <div class="info-row">
            <span>PO Number</span>
            <span>{{ currentOrder?.poNumber || 'Not provided' }}</span>
          </div>
          <div class="info-row">
            <span>Weight</span>
            <span>{{ currentOrder?.weight ? `${currentOrder.weight} kg` : 'Not provided' }}</span>
          </div>
          <div class="info-row">
            <span>Quantity</span>
            <span>{{ currentOrder?.quantity || 'Not provided' }}</span>
          </div>
          <div class="info-row">
            <span>Description</span>
            <span>{{ currentOrder?.description || 'Not provided' }}</span>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="section" v-if="showOrderSummary">
        <h2 class="section-title">ORDER SUMMARY</h2>
        <div class="info-card">
          <div class="info-row">
            <span>Rate Type</span>
            <span>{{ currentOrder?.rateType || 'Hourly' }}</span>
          </div>
          <div class="info-row">
            <span>Duration</span>
            <span>{{ getBillingDuration }}</span>
          </div>
          <div class="info-row">
            <span>Service Fee</span>
            <span>${{ currentOrder?.serviceFee?.toFixed(2) || '0.00' }}</span>
          </div>
          <div class="info-row">
            <span>Tax</span>
            <span>${{ currentOrder?.tax?.toFixed(2) || '0.00' }}</span>
          </div>
          <div class="info-row total">
            <span>Total</span>
            <span>${{ currentOrder?.totalAmount?.toFixed(2) || '0.00' }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Information -->
      <div class="section" v-if="showPaymentInfo">
        <h2 class="section-title">PAYMENT INFORMATION</h2>
        <div class="info-card">
          <div class="info-row">
            <span>Amount</span>
            <span>${{ currentOrder?.payment?.amount?.toFixed(2) || '0.00' }}</span>
          </div>
          <div class="info-row">
            <span>Method</span>
            <span>{{ currentOrder?.payment?.method || 'Not provided' }}</span>
          </div>
          <div class="info-row">
            <span>Transaction ID</span>
            <span>{{ currentOrder?.payment?.transactionId || 'Not provided' }}</span>
          </div>
          <div class="info-row">
            <span>Payment Time</span>
            <span>{{ formatTime(currentOrder?.payment?.time) || 'Not provided' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-bar" v-if="currentActions.length > 0">
      <template v-for="action in currentActions" :key="action">
        <van-button 
          block 
          :type="getActionType(action)"
          class="action-btn"
          @click="handleAction(action)"
        >
          {{ getActionText(action) }}
        </van-button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showDialog } from 'vant';
import { formatTime } from '@/utils/format';
import { OrderStatus, ServiceType } from '@/types/orders';
import { calculateDuration } from '@/utils/time';
import dayjs from 'dayjs';

interface DockOrder {
  id: string | number;
  orderNo: string;
  status: string;
  createdAt: string;
  startTime: string;
  loadType: 'inbound' | 'outbound';
  duration: number;
  unit: string;
  dockNumber?: string;
  carrier: string;
  driver: {
    name: string;
    phone: string;
  };
  vehicles: Array<{
    licensePlate: string;
  }>;
  parkingLot: {
    name: string;
    address: string;
  };
  rateType: string;
  spotCount: number;
  checkInTime?: string;
  loadingCompletedTime?: string;
  checkOutTime?: string;
  cargoType: string;
  poNumber?: string;
  weight?: number;
  quantity?: number;
  description?: string;
  serviceFee?: number;
  tax?: number;
  totalAmount: number;
  payment?: {
    amount: number;
    method: string;
    transactionId: string;
    time: string;
    status: 'paid' | 'unpaid';
  };
  serviceType: string;
}

const route = useRoute();
const router = useRouter();
const currentOrder = ref<DockOrder | null>(null);

// 计算是否显示停车信息
const hasParkingInfo = computed(() => {
  return !!(currentOrder.value?.checkInTime || 
    currentOrder.value?.loadingCompletedTime || 
    currentOrder.value?.checkOutTime);
});

// 计算停车时长
const parkingDuration = computed(() => {
  if (!currentOrder.value?.checkInTime) return '';
  const endTime = currentOrder.value?.checkOutTime || new Date().toISOString();
  return calculateDuration(currentOrder.value.checkInTime, endTime);
});

// 计算账单时长（从check in到装货完成）
const getBillingDuration = computed(() => {
  if (!currentOrder.value?.checkInTime || !currentOrder.value?.loadingCompletedTime) return '';
  return calculateDuration(currentOrder.value.checkInTime, currentOrder.value.loadingCompletedTime);
});

// 是否显示订单摘要
const showOrderSummary = computed(() => {
  return currentOrder.value?.status !== 'Loading Completed';
});

// 是否显示支付信息
const showPaymentInfo = computed(() => {
  return currentOrder.value?.payment?.status === 'paid';
});

// 获取当前状态对应的操作按钮
const currentActions = computed(() => {
  const status = currentOrder.value?.status?.toLowerCase();
  switch (status) {
    case 'requested':
      return ['modify-request', 'cancel-request'];
    case 'scheduled':
      return ['modify-appointment', 'cancel-appointment', 'check-in'];
    case 'payment_pending':
      return ['retry-payment'];
    case 'completed':
      return ['check-out'];
    default:
      return [];
  }
});

// 获取操作按钮类型
const getActionType = (action: string) => {
  switch (action) {
    case 'cancel-request':
    case 'cancel-appointment':
      return 'danger';
    default:
      return 'primary';
  }
};

// 获取操作按钮文本
const getActionText = (action: string) => {
  const actionTexts: Record<string, string> = {
    'modify-request': 'Modify Request',
    'cancel-request': 'Cancel Request',
    'modify-appointment': 'Modify Appointment',
    'cancel-appointment': 'Cancel Appointment',
    'check-in': 'Check In',
    'retry-payment': 'Pay Now',
    'check-out': 'Check Out'
  };
  return actionTexts[action] || action;
};

// 根据状态返回不同的标签类型
const getStatusType = computed(() => {
  const status = currentOrder.value?.status?.toLowerCase();
  switch (status) {
    case 'requested':
    case 'payment_pending':
      return 'warning';
    case 'scheduled':
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'danger';
    default:
      return 'primary';
  }
});

// 处理电话点击
const handleCall = () => {
  const phone = currentOrder.value?.driver?.phone;
  if (phone) {
    window.location.href = `tel:${phone}`;
  }
};

// 处理操作按钮点击
const handleAction = (action: string) => {
  switch (action) {
    case 'cancel-request':
    case 'cancel-appointment':
      handleCancel();
      break;
    case 'modify-request':
    case 'modify-appointment':
      handleModify();
      break;
    case 'check-in':
      handleCheckIn();
      break;
    case 'retry-payment':
      handlePayment();
      break;
    case 'check-out':
      handleCheckOut();
      break;
  }
};

// 处理取消预订
const handleCancel = () => {
  showDialog({
    title: 'Cancel Booking',
    message: 'Are you sure you want to cancel this booking?',
    theme: 'round-button',
    showCancelButton: true,
    confirmButtonText: 'Yes, Cancel',
    cancelButtonText: 'No',
    confirmButtonColor: '#ee0a24',
  }).then(() => {
    // TODO: 调用取消API
    if (currentOrder.value) {
      currentOrder.value.status = 'cancelled';
    }
  }).catch(() => {
    // 用户点击取消
  });
};

// 处理修改预订
const handleModify = () => {
  // TODO: 实现修改预订逻辑
  showToast('Modify functionality coming soon');
};

// 处理入场
const handleCheckIn = async () => {
  try {
    // 检查是否在预约时间前30分钟内
    const startTime = dayjs(currentOrder.value?.startTime);
    const now = dayjs();
    const diffMinutes = startTime.diff(now, 'minute');
    
    if (diffMinutes > 30) {
      showDialog({
        title: '提示',
        message: '请在预约时间前30分钟内办理入场',
        theme: 'round-button',
        confirmButtonText: '我知道了'
      });
      return;
    }
    
    // 显示确认对话框
    const result = await showDialog({
      title: '确认入场',
      message: `确认为车辆 ${currentOrder.value?.vehicles[0]?.licensePlate} 办理入场？`,
      theme: 'round-button',
      showCancelButton: true,
      confirmButtonText: '确认入场',
      cancelButtonText: '取消'
    });

    if (result === 'confirm') {
      // TODO: 调用入场 API
      if (currentOrder.value) {
        currentOrder.value.status = OrderStatus.Arrived;
        currentOrder.value.checkInTime = new Date().toISOString();
        // 分配泊位号
        currentOrder.value.spotNo = `D${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`;
      }
      
      showToast({
        type: 'success',
        message: '入场成功',
        duration: 2000
      });
    }
  } catch (error) {
    console.error('Check in failed:', error);
    showToast({
      type: 'fail',
      message: '入场失败，请重试',
      duration: 2000
    });
  }
};

// 处理支付
const handlePayment = () => {
  // TODO: 实现支付逻辑
  showToast('Payment functionality coming soon');
};

// 处理出场
const handleCheckOut = async () => {
  try {
    // 检查是否已完成装卸
    if (currentOrder.value?.status !== OrderStatus.LoadingCompleted) {
      showDialog({
        title: '提示',
        message: '请在完成装卸后办理出场',
        theme: 'round-button',
        confirmButtonText: '我知道了'
      });
      return;
    }
    
    // 检查是否有未支付费用
    if (currentOrder.value?.payment?.status === 'unpaid') {
      showDialog({
        title: '提示',
        message: '存在未支付费用，请先完成支付',
        theme: 'round-button',
        confirmButtonText: '去支付',
        cancelButtonText: '取消'
      }).then((action) => {
        if (action === 'confirm') {
          handlePayment();
        }
      });
      return;
    }
    
    // 显示确认对话框
    const result = await showDialog({
      title: '确认出场',
      message: `确认为车辆 ${currentOrder.value?.vehicles[0]?.licensePlate} 办理出场？`,
      theme: 'round-button',
      showCancelButton: true,
      confirmButtonText: '确认出场',
      cancelButtonText: '取消'
    });

    if (result === 'confirm') {
      // TODO: 调用出场 API
      if (currentOrder.value) {
        currentOrder.value.status = OrderStatus.Completed;
        currentOrder.value.checkOutTime = new Date().toISOString();
      }
      
      showToast({
        type: 'success',
        message: '出场成功',
        duration: 2000
      });
      
      // 显示评价提示
      setTimeout(() => {
        showDialog({
          title: '服务评价',
          message: '感谢使用我们的服务，是否对本次服务进行评价？',
          theme: 'round-button',
          showCancelButton: true,
          confirmButtonText: '立即评价',
          cancelButtonText: '暂不评价'
        }).then((action) => {
          if (action === 'confirm') {
            // TODO: 跳转到评价页面
            showToast('评价功能开发中');
          }
        });
      }, 1000);
    }
  } catch (error) {
    console.error('Check out failed:', error);
    showToast({
      type: 'fail',
      message: '出场失败，请重试',
      duration: 2000
    });
  }
};

onMounted(async () => {
  // 这里应该调用API获取订单详情
  // 暂时使用mock数据
  const mockOrder: DockOrder = {
    id: route.params.id,
    orderNo: 'DOCK' + route.params.id,
    status: 'Requested',
    createdAt: new Date().toISOString(),
    startTime: new Date().toISOString(),
    loadType: 'inbound',
    duration: 2,
    unit: 'hour',
    dockNumber: 'D001',
    carrier: 'ABC Logistics',
    driver: {
      name: 'John Doe',
      phone: '+1 234 567 8900'
    },
    vehicles: [{
      licensePlate: 'ABC123'
    }],
    parkingLot: {
      name: 'Central Logistics Hub',
      address: '123 Dock Street, Warehouse District'
    },
    rateType: 'Hourly',
    spotCount: 1,
    cargoType: 'General',
    poNumber: 'PO987654',
    weight: 1000,
    quantity: 100,
    description: 'General cargo',
    serviceFee: 100.00,
    tax: 10.00,
    totalAmount: 110.00,
    payment: {
      amount: 110.00,
      method: 'Credit Card',
      transactionId: 'TXN123456',
      time: new Date().toISOString(),
      status: 'unpaid'
    },
    serviceType: 'dock'
  };
  currentOrder.value = mockOrder;
});
</script>

<style scoped>
.order-detail {
  min-height: 100vh;
  background: #1a1a1a;
  color: #fff;
  padding-bottom: 80px;
}

.custom-nav {
  background: #1a1a1a;
}

:deep(.custom-nav .van-nav-bar__title) {
  color: #fff;
  font-size: 18px;
}

:deep(.van-nav-bar__arrow) {
  color: #fff !important;
}

.content {
  padding: 20px;
}

.status-card {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.order-id {
  font-size: 16px;
  font-weight: 500;
}

.order-time {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 13px;
  font-weight: 500;
  color: #7c4dff;
  margin: 0 0 12px;
  letter-spacing: 1px;
}

.info-card {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-row:first-child {
  padding-top: 0;
}

.info-row > span:first-child {
  color: #666;
}

.info-row.total {
  margin-top: 8px;
  padding-top: 16px !important;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.info-row.total span {
  font-size: 16px;
  font-weight: 500;
}

:deep(.van-tag--warning) {
  color: #ff9800;
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid rgba(255, 152, 0, 0.2);
}

:deep(.van-tag--success) {
  color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.2);
}

:deep(.van-tag--danger) {
  color: #f44336;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.2);
}

.clickable {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.action-icon {
  color: #7c4dff;
  font-size: 16px;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: #1a1a1a;
  border-top: 1px solid #2a2a2a;
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  height: 44px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
}

.action-btn.van-button--danger {
  background: #ee0a24;
  border: none;
}

:deep(.van-dialog) {
  background: #2a2a2a;
}

:deep(.van-dialog__header) {
  color: #fff;
}

:deep(.van-dialog__message) {
  color: rgba(255, 255, 255, 0.8);
}

:deep(.van-dialog__cancel),
:deep(.van-dialog__confirm) {
  color: #fff;
}
</style> 