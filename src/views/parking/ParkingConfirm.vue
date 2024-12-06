<template>
  <div class="confirm-page">
    <van-nav-bar
      title="Confirm Details"
      left-arrow
      @click-left="handleBack"
      class="custom-nav"
    />

    <div class="content">
      <h1 class="page-title">Review your parking reservation details</h1>

      <!-- Pricing Type -->
      <div class="section">
        <h2 class="section-title">PRICING TYPE</h2>
        <div class="price-grid">
          <div 
            v-for="price in parkingLot?.prices"
            :key="price.type"
            class="price-card"
            :class="{ active: selectedPrice?.type === price.type }"
            @click="selectPrice(price)"
          >
            <div class="price-amount">${{ price.value }}/{{ price.type }}</div>
            <div class="price-label">{{ formatPriceLabel(price.label) }}</div>
          </div>
        </div>
      </div>

      <!-- Date & Time Selection -->
      <div class="section">
        <h2>Select Start Date & Time</h2>
        <div class="time-picker" @click="showPicker = true">
          <van-icon name="clock-o" class="time-icon" />
          <span class="time-text">{{ dateTimeStr || '2024/12/04 10:14' }}</span>
          <van-icon name="arrow" class="arrow-icon" />
        </div>
      </div>

      <!-- Duration -->
      <div class="section">
        <h2>Duration (Hours)</h2>
        <div class="input-field">
          <input 
            type="number" 
            v-model="duration"
            min="1"
            max="24"
            class="duration-input"
          >
        </div>
      </div>

      <!-- Number of Spots -->
      <div class="section">
        <h2>Number of Spots</h2>
        <div class="input-field">
          <input 
            type="number" 
            v-model="spots"
            min="1"
            :max="availableSpots"
            class="spots-input"
          >
        </div>
      </div>

      <!-- Summary -->
      <div class="summary-card">
        <h2>Reservation Summary</h2>
        <div class="summary-row">
          <span>Start Time:</span>
          <span>{{ formatTime(dateTimeStr || '2024/12/04 10:14') }}</span>
        </div>
        <div class="summary-row">
          <span>End Time:</span>
          <span>{{ formatEndTime() }}</span>
        </div>
        <div class="summary-row">
          <span>Duration:</span>
          <span>{{ duration }} hour{{ duration > 1 ? 's' : '' }}</span>
        </div>
        <div class="summary-row total">
          <span>Total Price:</span>
          <span class="price">${{ calculateTotal }}</span>
        </div>
      </div>
    </div>

    <!-- Bottom Button -->
    <div class="bottom-bar">
      <van-button 
        block 
        :disabled="!isValid"
        @click="handleConfirm"
        class="confirm-btn"
      >
        Confirm Reservation
      </van-button>
    </div>

    <van-popup v-model:show="showPicker" position="bottom">
      <van-picker
        :columns="timeColumns"
        title="Select Date & Time"
        @confirm="onTimeConfirm"
        @cancel="showPicker = false"
        :default-index="[0, 0]"
        show-toolbar
      />
    </van-popup>
  </div>
</template>

<style scoped>
.confirm-page {
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
  font-size: 20px;
}

.content {
  padding: 20px;
}

.page-title {
  font-size: 14px;
  color: #999;
  margin: 0 0 24px;
  font-weight: normal;
}

.section {
  margin-bottom: 32px;
}

h2 {
  font-size: 14px;
  font-weight: 500;
  color: #7c4dff;
  margin: 0 0 16px;
  text-transform: uppercase;
}

.section-title {
  font-size: 13px;
  font-weight: 500;
  color: #7c4dff;
  margin: 0 0 12px;
  letter-spacing: 1px;
}

.price-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 8px;
}

.price-card {
  background: #2a2a2a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.price-card.active {
  background: #7c4dff;
  border-color: #7c4dff;
}

.price-amount {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 2px;
  color: #fff;
}

.price-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.time-picker {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.time-icon {
  color: #7c4dff;
  font-size: 20px;
  margin-right: 12px;
}

.time-text {
  flex: 1;
  font-size: 16px;
}

.arrow-icon {
  color: #666;
}

.input-field {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 12px 16px;
}

.duration-input,
.spots-input {
  width: 100%;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 16px;
  outline: none;
}

.summary-card {
  background: #2a2a2a;
  border-radius: 16px;
  padding: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.summary-row.total {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 0;
}

.price {
  color: #7c4dff;
  font-size: 20px;
  font-weight: 600;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: #1a1a1a;
  border-top: 1px solid #2a2a2a;
}

.confirm-btn {
  background: #7c4dff;
  border: none;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
}

:deep(.confirm-btn.van-button--disabled) {
  opacity: 0.5;
  background: #7c4dff;
}

:deep(.van-picker) {
  background: #2a2a2a;
}

:deep(.van-picker__title) {
  color: #fff;
}

:deep(.van-picker-column__item) {
  color: #fff;
}

:deep(.van-picker__cancel),
:deep(.van-picker__confirm) {
  color: #7c4dff;
}

:deep(.van-picker__toolbar) {
  border-bottom: 1px solid #333;
}
</style>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { mockParkingLots } from '@/utils/helpers';

// 定义价格类型数据
const mockPrices = [
  { type: 'hour', label: 'Hourly Rate', value: 6 },
  { type: '8h', label: '8 Hours Package', value: 40 },
  { type: 'day', label: 'Daily Rate', value: 100 },
  { type: 'week', label: 'Weekly Rate', value: 500 },
  { type: 'month', label: 'Monthly Rate', value: 1500 }
];

const route = useRoute();
const router = useRouter();
const showPicker = ref(false);
const selectedDate = ref(new Date());
const dateTimeStr = ref('');
const duration = ref(1);
const spots = ref(1);
const selectedPrice = ref(null);

const parkingLot = computed(() => {
  const id = Number(route.params.id);
  const lot = mockParkingLots.find(lot => lot.id === id);
  if (lot) {
    return {
      ...lot,
      prices: mockPrices // 使用模拟的价格数据
    };
  }
  return null;
});

const availableSpots = computed(() => {
  return parkingLot.value?.spots[0]?.available || 1;
});

const calculateTotal = computed(() => {
  if (!selectedPrice.value) return 0;
  return selectedPrice.value.value * duration.value * spots.value;
});

const isValid = computed(() => {
  return selectedPrice.value && dateTimeStr.value && duration.value > 0;
});

const minDate = new Date();
const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

function selectPrice(price) {
  selectedPrice.value = price;
}

// 生成时间选择器的列数据
const generateTimeColumns = () => {
  const days = [];
  const times = [];
  
  // 生成未来7天的日期
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    days.push({
      text: date.toLocaleDateString('en-US', { 
        month: 'numeric',
        day: 'numeric',
        year: '2-digit'
      }),
      value: date
    });
  }

  // 生成时间选项（每半小时一个选项）
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of [0, 30]) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push({
        text: new Date(`2000/01/01 ${timeStr}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        }),
        value: timeStr
      });
    }
  }

  return [days, times];
};

const timeColumns = generateTimeColumns();

// 处理时间选择确认
const onTimeConfirm = (values) => {
  const [date, time] = values;
  const dateTime = new Date(date.value);
  const [hours, minutes] = time.value.split(':');
  dateTime.setHours(Number(hours), Number(minutes));
  
  dateTimeStr.value = dateTime.toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
  
  showPicker.value = false;
};

function handleBack() {
  router.back();
}

function handleConfirm() {
  showToast('Reservation confirmed!');
  router.push('/parking-orders');
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
}

function formatEndTime() {
  const startDate = new Date(dateTimeStr.value || '2024/12/04 10:14');
  const endDate = new Date(startDate.getTime() + duration.value * 60 * 60 * 1000);
  return formatTime(endDate.toString());
}

function formatPriceLabel(label: string) {
  switch (label.toLowerCase()) {
    case 'hourly rate': return 'Hour';
    case '8 hours package': return '8h Package';
    case 'daily rate': return 'Day';
    case 'weekly rate': return 'Week';
    case 'monthly rate': return 'Month';
    default: return label;
  }
}
</script> 