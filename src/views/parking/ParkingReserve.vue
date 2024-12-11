<template>
  <div class="reserve-page">
    <van-nav-bar
      title="New Reservation"
      left-arrow
      @click-left="handleBack"
      class="custom-nav"
    />

    <div class="content">
      <!-- Service Type -->
      <div class="section">
        <h2 class="section-title">SERVICE TYPE</h2>
        <div class="option-grid">
          <div 
            class="option-card"
            :class="{ active: serviceType === 'standard' }"
            @click="selectService('standard')"
          >
            <div class="option-name">Self-parking</div>
            <div class="option-desc">Park your car by yourself</div>
          </div>
          <div 
            class="option-card"
            :class="{ 
              active: serviceType === 'valet',
              disabled: !hasValetService 
            }"
            @click="selectService('valet')"
          >
            <div class="option-name">Valet Service</div>
            <div class="option-desc">We park for you</div>
            <span v-if="!hasValetService" class="option-tag">Not Available</span>
          </div>
          <div 
            class="option-card"
            :class="{ 
              active: serviceType === 'dock',
              disabled: !hasDockService 
            }"
            @click="selectService('dock')"
          >
            <div class="option-name">Open Dock</div>
            <div class="option-desc">Loading & Unloading</div>
            <span v-if="!hasDockService" class="option-tag">Not Available</span>
          </div>
        </div>
      </div>

      <!-- Load Type (仅在选择 Dock 服务时显示) -->
      <div class="section" v-if="serviceType === 'dock'">
        <h2 class="section-title">LOAD TYPE</h2>
        <div class="option-grid">
          <div 
            class="option-card"
            :class="{ active: loadType === 'inbound' }"
            @click="selectLoadType('inbound')"
          >
            <div class="option-name">Inbound</div>
            <div class="option-desc">Loading goods in</div>
          </div>
          <div 
            class="option-card"
            :class="{ active: loadType === 'outbound' }"
            @click="selectLoadType('outbound')"
          >
            <div class="option-name">Outbound</div>
            <div class="option-desc">Loading goods out</div>
          </div>
        </div>
      </div>

      <!-- Spot Type (只在非 Dock 服务时显示) -->
      <div class="section" v-if="serviceType !== 'dock'">
        <h2 class="section-title">SPOT TYPE</h2>
        <div class="option-grid">
          <div 
            v-for="spot in filteredSpotTypes"
            :key="spot.type"
            class="option-card"
            :class="{ 
              active: selectedSpotType === spot.type,
              disabled: spot.available === 0
            }"
            @click="selectSpotType(spot)"
          >
            <div class="option-name">{{ formatSpotType(spot.type) }}</div>
            <div class="option-desc">{{ spot.available }} spots available</div>
          </div>
        </div>
      </div>

      <!-- Pricing Type -->
      <div class="section">
        <h2 class="section-title">PRICING TYPE</h2>
        <div class="option-grid">
          <div 
            v-for="price in parkingLot?.prices"
            :key="price.type"
            class="option-card"
            :class="{ active: selectedPrice?.type === price.type }"
            @click="selectPrice(price)"
          >
            <div class="option-name">${{ price.value }}/{{ price.type }}</div>
            <div class="option-desc">{{ formatPriceLabel(price.label) }}</div>
          </div>
        </div>
      </div>

      <!-- Date & Time -->
      <div class="section">
        <h2 class="section-title">DATE & TIME</h2>
        <div class="time-picker" @click="showPicker = true">
          <span class="time-text">{{ dateTimeStr || 'Select date and time' }}</span>
        </div>
      </div>

      <!-- Duration & Spots (Only for Self-parking) -->
      <div class="section" v-if="serviceType === 'standard'">
        <div class="input-row">
          <div class="input-col">
            <h2 class="section-title">DURATION (HOURS)</h2>
            <div class="input-field">
              <input 
                type="number" 
                v-model="duration"
                min="1"
                :max="24"
                class="custom-input"
              >
            </div>
          </div>
          <div class="input-col">
            <h2 class="section-title">NUMBER OF SPOTS</h2>
            <div class="input-field">
              <input 
                type="number" 
                v-model="spots"
                min="1"
                :max="availableSpots"
                class="custom-input"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Spots (Only for Valet) -->
      <div class="section" v-else>
        <h2 class="section-title">NUMBER OF VEHICLES</h2>
        <div class="input-field">
          <input 
            type="number" 
            v-model="spots"
            min="1"
            :max="availableSpots"
            class="custom-input"
          >
        </div>
      </div>

      <!-- Duration (Only for Dock service) -->
      <div class="section" v-if="serviceType === 'dock'">
        <h2 class="section-title">ESTIMATED DURATION</h2>
        <div class="input-field">
          <input 
            type="number" 
            v-model="duration"
            min="1"
            :max="getMaxDuration"
            class="custom-input"
          >
          <span class="unit-text">{{ getPriceUnit }}</span>
        </div>
      </div>

      <!-- Summary -->
      <div class="summary-card" v-if="serviceType !== 'dock'">
        <div class="summary-row">
          <span>Start Time:</span>
          <span>{{ formatTime(dateTimeStr || '2024/12/04 10:14') }}</span>
        </div>
        <!-- End Time & Duration (Only for Self-parking) -->
        <template v-if="serviceType === 'standard'">
          <div class="summary-row">
            <span>End Time:</span>
            <span>{{ formatEndTime() }}</span>
          </div>
          <div class="summary-row">
            <span>Duration:</span>
            <span>{{ duration }} hour{{ duration > 1 ? 's' : '' }}</span>
          </div>
        </template>
        <div class="summary-row">
          <span>{{ serviceType === 'standard' ? 'Spots' : 'Vehicles' }}:</span>
          <span>{{ spots }}</span>
        </div>
        <div class="summary-row total">
          <span>Total Price:</span>
          <span class="price">${{ calculateTotal }}</span>
        </div>
      </div>

      <!-- Dock Summary -->
      <div class="summary-card" v-if="serviceType === 'dock'">
        <div class="summary-row">
          <span>Load Type:</span>
          <span>{{ formatLoadType(loadType) }}</span>
        </div>
        <div class="summary-row">
          <span>Start Time:</span>
          <span>{{ formatTime(dateTimeStr || '2024/12/04 10:14') }}</span>
        </div>
        <div class="summary-row">
          <span>Estimated Duration:</span>
          <span>{{ duration }} {{ getPriceUnit }}{{ duration > 1 ? 's' : '' }}</span>
        </div>
      </div>
    </div>

    <!-- Bottom Button -->
    <div class="bottom-bar">
      <van-button 
        block 
        @click="handleSubmit"
        class="submit-btn"
      >
        {{ serviceType === 'dock' ? 'Confirm Dock Reservation' : 'Enter Vehicle Info' }}
      </van-button>
    </div>

    <van-popup v-model:show="showPicker" position="bottom">
      <van-picker
        :columns="timeColumns"
        title="Select Time"
        @confirm="onTimeConfirm"
        @cancel="showPicker = false"
        show-toolbar
      />
    </van-popup>
  </div>
</template>

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
const dateTimeStr = ref('');
const duration = ref(1);
const spots = ref(1);
const selectedPrice = ref(null);
const serviceType = ref('standard');

const parkingLot = computed(() => {
  const id = Number(route.params.id);
  const lot = mockParkingLots.find(lot => lot.id === id);
  if (lot) {
    return {
      ...lot,
      prices: mockPrices
    };
  }
  return null;
});

const availableSpots = computed(() => {
  return parkingLot.value?.spots[0]?.available || 1;
});

const calculateTotal = computed(() => {
  if (!selectedPrice.value) return 0;
  // 代客泊车服务按每辆车收费
  if (serviceType.value === 'valet') {
    return selectedPrice.value.value * spots.value;
  }
  // 自助停车按时长和车位数收费
  return selectedPrice.value.value * duration.value * spots.value;
});

const hasValetService = computed(() => {
  return parkingLot.value?.serviceTypes?.includes('valet') ?? false;
});

const hasDockService = computed(() => {
  return parkingLot.value?.serviceTypes?.includes('dock') ?? false;
});

const isValid = computed(() => {
  const baseValid = selectedPrice.value && dateTimeStr.value && duration.value > 0;
  if (serviceType.value === 'valet') {
    const { licensePlate, brand, model, color } = vehicleInfo.value;
    return baseValid && licensePlate && brand && model && color;
  }
  return baseValid;
});

interface TimeColumn {
  text: string;
  value: Date | string;
}

interface SpotType {
  type: string;
  available: number;
}

// 生成时间选择器的列数据
const generateTimeColumns = () => {
  // 生成未来7天的日期
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    days.push(date.toLocaleDateString('en-US', { 
      month: 'numeric',
      day: 'numeric',
      year: '2-digit'
    }));
  }

  // 生成时间选项（每半小时一个选项）
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of [0, 30]) {
      const time = new Date(2000, 0, 1, hour, minute);
      times.push(time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }));
    }
  }

  return [
    {
      values: days,
      defaultIndex: 0
    },
    {
      values: times,
      defaultIndex: 0
    }
  ];
};

const timeColumns = generateTimeColumns();

// 处理时间选择确认
const onTimeConfirm = (values: { selectedValues: string[] }) => {
  const [dateStr, timeStr] = values.selectedValues;
  if (!dateStr || !timeStr) return;

  // 解析日期
  const [month, day, year] = dateStr.split('/');
  const date = new Date(2000 + Number(year), Number(month) - 1, Number(day));

  // 解析时间
  const isPM = timeStr.toLowerCase().includes('pm');
  let [hourStr, minuteStr] = timeStr.replace(/\s?[AP]M/, '').split(':');
  let hour = Number(hourStr);
  
  // 处理12小时制
  if (isPM && hour !== 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;
  
  date.setHours(hour, Number(minuteStr));
  
  dateTimeStr.value = date.toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
  
  showPicker.value = false;
};

function selectPrice(price) {
  selectedPrice.value = price;
  duration.value = 1;
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

function handleBack() {
  router.back();
}

function handleSubmit() {
  if (serviceType.value === 'dock') {
    router.push({
      path: `/parking/${route.params.id}/dock-confirm`,
      query: {
        loadType: loadType.value,
        startTime: dateTimeStr.value,
        duration: duration.value,
        unit: getPriceUnit.value
      }
    });
  } else {
    router.push({
      path: `/parking/${route.params.id}/vehicle`,
      query: {
        service: serviceType.value,
        spots: spots.value.toString()
      }
    });
  }
}

function selectService(type: 'standard' | 'valet' | 'dock') {
  if (type === 'valet' && !hasValetService.value) {
    showToast('Valet service is not available at this location');
    return;
  }
  if (type === 'dock' && !hasDockService.value) {
    showToast('Dock service is not available at this location');
    return;
  }
  serviceType.value = type;
}

// 车位类型选择
const selectedSpotType = ref('standard');

// 根据服务类型过滤可用的车位类型
const filteredSpotTypes = computed(() => {
  if (serviceType.value === 'dock') {
    // 只显示货车车位
    return availableSpotTypes.value.filter(spot => spot.type === 'truck');
  }
  // 其他服务显示所有车位类型
  return availableSpotTypes.value;
});

const availableSpotTypes = computed<SpotType[]>(() => {
  const parkingSpots = parkingLot.value?.spots || [];
  return parkingSpots.map(spot => ({
    type: spot.type,
    available: spot.available
  }));
});

// 格式化车位类型显示文本
function formatSpotType(type: string): string {
  const types: Record<string, string> = {
    car: 'Standard',
    truck: 'Loading Dock',
    ev: 'EV Charging',
    handicap: 'Handicap'
  };
  return types[type] || type;
}

// 选择车位类型
function selectSpotType(spot: SpotType) {
  if (spot.available > 0) {
    selectedSpotType.value = spot.type;
  }
}

// 装卸货类型
type LoadType = 'inbound' | 'outbound';
const loadType = ref<LoadType>('inbound');
const selectedDock = ref<string>('');

// 选择装卸货类型
function selectLoadType(type: LoadType) {
  loadType.value = type;
  // 可以在这里根据 loadType 自动分配 dock number
  selectedDock.value = `DOCK-${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`;
}

// 格式化装卸货类型显示文本
function formatLoadType(type: LoadType): string {
  const types: Record<LoadType, string> = {
    inbound: 'Inbound Loading',
    outbound: 'Outbound Loading'
  };
  return types[type];
}

// 获取价格单位
const getPriceUnit = computed(() => {
  if (!selectedPrice.value) return 'hour';
  const unitMap: Record<string, string> = {
    'hour': 'hour',
    '8h': 'hour',
    'day': 'day',
    'week': 'week',
    'month': 'month'
  };
  return unitMap[selectedPrice.value.type] || 'hour';
});

// 获取最大时长
const getMaxDuration = computed(() => {
  if (!selectedPrice.value) return 24;
  const maxMap: Record<string, number> = {
    'hour': 24,
    '8h': 24,
    'day': 30,
    'week': 4,
    'month': 12
  };
  return maxMap[selectedPrice.value.type] || 24;
});
</script>

<style scoped>
.reserve-page {
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

.option-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.option-card {
  background: #2a2a2a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.option-card.active {
  background: #7c4dff;
  border-color: #7c4dff;
}

.option-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.option-name {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
}

.option-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.option-tag {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 10px;
}

.input-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.input-group {
  display: grid;
  gap: 8px;
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
  font-size: 14px;
}

.arrow-icon {
  color: #666;
}

.input-field {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 14px;
}

.custom-input {
  width: 100%;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 14px;
  outline: none;
}

.summary-card {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 20px;
  margin-top: 32px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.summary-row.total {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 0;
}

.price {
  color: #7c4dff;
  font-size: 18px;
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

.submit-btn {
  background: #7c4dff;
  border: none;
  height: 44px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
}

:deep(.submit-btn.van-button--disabled) {
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

.load-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  color: currentColor;
  opacity: 0.7;
}

.option-card.active .load-icon {
  opacity: 1;
}

/* 调整装卸货类型选择的网格布局为两列 */
.option-grid:has(.load-icon) {
  grid-template-columns: repeat(2, 1fr);
  margin-bottom: 0;
}

/* 为 Dock 服务添加特殊样式 */
.option-card:has(.load-icon) {
  padding-right: 36px;
}

/* 调整 Dock 服务时的间距 */
.section + .section {
  margin-top: 24px;
}

.unit-text {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 14px;
  min-width: 45px;
  text-align: right;
}

.input-field {
  position: relative;
}

.input-field .custom-input {
  padding-right: 60px;
}
</style>