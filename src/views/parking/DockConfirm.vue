<template>
  <div class="dock-confirm">
    <van-nav-bar
      title="DOCK RESERVATION"
      left-arrow
      @click-left="router.back()"
      class="custom-nav"
    />

    <div class="content">
      <!-- Driver Information -->
      <div class="section">
        <h2 class="section-title">DRIVER INFORMATION</h2>
        <div class="form-group">
          <van-field
            v-model="driverInfo.carrier"
            label="Carrier"
            placeholder="Enter carrier name"
            :rules="[{ required: true, message: 'Carrier is required' }]"
            required
          />
          <van-field
            v-model="driverInfo.name"
            label="Driver Name"
            placeholder="Enter driver name"
            :rules="[{ required: true, message: 'Driver name is required' }]"
            required
          />
          <van-field
            v-model="driverInfo.phone"
            label="Driver Phone"
            type="tel"
            placeholder="Enter driver phone"
            :rules="[{ required: true, message: 'Driver phone is required' }]"
            required
          />
          <van-field
            v-model="driverInfo.vehiclePlate"
            label="Vehicle Plate"
            placeholder="Enter vehicle plate"
            :rules="[{ required: true, message: 'Vehicle plate is required' }]"
            required
          />
        </div>
      </div>

      <!-- Cargo Information -->
      <div class="section">
        <h2 class="section-title">CARGO INFORMATION</h2>
        <div class="form-group">
          <van-field
            v-model="displayCargoType"
            label="Cargo Type"
            placeholder="Select cargo type"
            readonly
            clickable
            required
            right-icon="arrow-down"
            @click="showCargoTypePicker = true"
          />
          <van-field
            v-model="cargoInfo.poNumber"
            label="PO No."
            placeholder="Enter PO number (optional)"
          />
          <van-field
            v-model="cargoInfo.weight"
            label="Weight (kg)"
            type="number"
            placeholder="Enter cargo weight"
            :rules="[{ required: true, message: 'Cargo weight is required' }]"
            required
          />
          <van-field
            v-model="cargoInfo.quantity"
            label="Quantity"
            type="number"
            placeholder="Enter cargo quantity"
            :rules="[{ required: true, message: 'Quantity is required' }]"
            required
          />
          <van-field
            v-model="cargoInfo.description"
            label="Description"
            type="textarea"
            rows="2"
            placeholder="Enter cargo description (optional)"
          />
        </div>
      </div>

      <!-- Reservation Summary -->
      <div class="summary-card">
        <div class="summary-row">
          <span>Load Type:</span>
          <span>{{ route.query.loadType === 'inbound' ? 'Inbound Loading' : 'Outbound Loading' }}</span>
        </div>
        <div class="summary-row">
          <span>Start Time:</span>
          <span>{{ formatTime(String(route.query.startTime)) }}</span>
        </div>
        <div class="summary-row">
          <span>Duration:</span>
          <span>{{ route.query.duration }} {{ route.query.unit }}(s)</span>
        </div>
      </div>
    </div>

    <!-- Cargo Type Picker -->
    <van-popup v-model:show="showCargoTypePicker" position="bottom">
      <van-picker
        :columns="[cargoTypes]"
        @confirm="onCargoTypeConfirm"
        @cancel="showCargoTypePicker = false"
        title="Select Cargo Type"
        show-toolbar
      />
    </van-popup>

    <!-- Bottom Button -->
    <div class="bottom-bar">
      <van-button 
        block 
        type="primary"
        class="submit-btn"
        :loading="submitting"
        @click="handleSubmit"
      >
        Confirm Booking
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import type { PickerOption } from 'vant';
import { formatTime } from '@/utils/format';

const route = useRoute();
const router = useRouter();
const submitting = ref(false);

interface DriverInfo {
  carrier: string;
  name: string;
  phone: string;
  vehiclePlate: string;
}

interface CargoInfo {
  type: string;
  poNumber: string;
  weight: string;
  quantity: string;
  description: string;
}

const driverInfo = ref<DriverInfo>({
  carrier: '',
  name: '',
  phone: '',
  vehiclePlate: ''
});

const cargoInfo = ref<CargoInfo>({
  type: '',
  poNumber: '',
  weight: '',
  quantity: '',
  description: ''
});

const handleSubmit = async () => {
  submitting.value = true;
  try {
    // TODO: 调用API提交预订
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 生成订单ID
    const orderId = `DOCK${Date.now()}`;
    
    // 跳转到订单详情页
    router.push({
      path: `/orders/${orderId}`,
      query: {
        type: 'dock',
        status: 'requested',
        ...route.query,
        ...{
          carrier: driverInfo.value.carrier,
          driverName: driverInfo.value.name,
          driverPhone: driverInfo.value.phone,
          vehiclePlate: driverInfo.value.vehiclePlate,
          cargoType: cargoInfo.value.type,
          poNumber: cargoInfo.value.poNumber,
          weight: cargoInfo.value.weight,
          quantity: cargoInfo.value.quantity,
          description: cargoInfo.value.description
        }
      }
    });
  } catch (error) {
    showToast('Failed to submit booking');
  } finally {
    submitting.value = false;
  }
};

// 货物类型选择器
const showCargoTypePicker = ref(false);
const cargoTypes = [
  'General Cargo',
  'Perishable Goods',
  'Hazardous Materials',
  'Heavy Equipment',
  'Construction Materials',
  'Retail Goods',
  'Electronics',
  'Furniture',
  'Automotive Parts',
  'Raw Materials'
];

// 选择货物类型
const onCargoTypeConfirm = (value: { selectedValues: string[] }) => {
  cargoInfo.value.type = value.selectedValues[0];
  showCargoTypePicker.value = false;
};

// 显示选中的货物类型文本
const displayCargoType = computed({
  get: () => cargoInfo.value.type || 'Select cargo type',
  set: (val: string) => {
    cargoInfo.value.type = val;
  }
});
</script>

<style scoped>
.dock-confirm {
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

.form-group {
  background: #2a2a2a;
  border-radius: 12px;
  overflow: hidden;
}

:deep(.van-field) {
  background: transparent;
  padding: 16px;
}

:deep(.van-field__label) {
  width: 120px;
  color: #fff;
}

:deep(.van-field__label--required::before) {
  color: #ee0a24;
}

:deep(.van-field__control) {
  color: #fff;
}

:deep(.van-field__control::placeholder) {
  color: #666;
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

.summary-row:last-child {
  margin-bottom: 0;
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

:deep(.van-picker) {
  background: #2a2a2a;
}

:deep(.van-picker__title),
:deep(.van-picker__confirm) {
  color: #7c4dff;
}

:deep(.van-picker__cancel) {
  color: #666;
}

:deep(.van-picker-column__item) {
  color: #fff;
}

:deep(.van-picker__toolbar) {
  border-bottom: 1px solid #333;
}

:deep(.van-field__right-icon) {
  color: #666;
}

/* 非必填字段样式 */
:deep(.van-field--non-required .van-field__label) {
  color: rgba(255, 255, 255, 0.8);
}
</style> 