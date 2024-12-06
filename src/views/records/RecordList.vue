<template>
  <div class="records-page">
    <van-nav-bar
      title="Parking Records"
      fixed
    />
    
    <!-- Quick Actions -->
    <div class="quick-actions">
      <div class="action-buttons">
        <van-button 
          type="primary" 
          size="small" 
          icon="scan"
          class="scan-btn"
          @click="handleScan"
        >
          Scan QR Code
        </van-button>
        <div class="manual-buttons">
          <van-button 
            type="primary" 
            size="small" 
            icon="sign"
            plain
            @click="showCheckInDialog"
          >
            Check In
          </van-button>
          <van-button 
            type="success" 
            size="small" 
            icon="sign"
            plain
            @click="showCheckOutDialog"
          >
            Check Out
          </van-button>
        </div>
      </div>
    </div>

    <!-- Records List -->
    <div class="records-container">
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
          finished-text="No more records"
          loading-text="Loading..."
          error-text="Request failed, click to retry"
          @load="onLoad"
        >
          <div v-for="record in records" :key="record.id" class="record-card">
            <div class="record-header">
              <span class="plate-number">{{ record.licensePlate }}</span>
              <span :class="['status-tag', record.type]">
                {{ record.type === 'in' ? 'Check In' : 'Check Out' }}
              </span>
            </div>
            
            <div class="record-info">
              <div class="info-item">
                <van-icon name="location-o" />
                <span>{{ record.parkingLot }}</span>
              </div>
              <div class="info-item">
                <van-icon name="clock-o" />
                <span>{{ formatTime(record.time) }}</span>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- Check In Dialog -->
    <van-dialog
      v-model:show="showCheckIn"
      title="Vehicle Check In"
      show-cancel-button
      @confirm="handleCheckIn"
    >
      <van-form @submit.prevent>
        <van-field
          v-model="checkInForm.licensePlate"
          label="License Plate"
          placeholder="Enter vehicle plate number"
          :rules="[{ required: true, message: 'License plate is required' }]"
        />
      </van-form>
    </van-dialog>

    <!-- Check Out Dialog -->
    <van-dialog
      v-model:show="showCheckOut"
      title="Vehicle Check Out"
      show-cancel-button
      @confirm="handleCheckOut"
    >
      <van-form @submit.prevent>
        <van-field
          v-model="checkOutForm.licensePlate"
          label="License Plate"
          placeholder="Enter vehicle plate number"
          :rules="[{ required: true, message: 'License plate is required' }]"
        />
      </van-form>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { formatTime } from '@/utils/format';
import { showToast } from 'vant';

interface ParkingRecord {
  id: string;
  licensePlate: string;
  type: 'in' | 'out';
  parkingLot: string;
  time: string;
}

// 表单状态
const showCheckIn = ref(false);
const showCheckOut = ref(false);
const checkInForm = ref({ licensePlate: '' });
const checkOutForm = ref({ licensePlate: '' });

// 列表数据
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const records = ref<ParkingRecord[]>([]);

// 扫码处理
async function handleScan() {
  try {
    // 调用原生扫码能力
    // const result = await scanQRCode();
    showToast('Scanning...');
    // 处理扫码结果
    // handleScanResult(result);
  } catch (error) {
    showToast('Failed to scan QR code');
  }
}

// 手动进场
function showCheckInDialog() {
  checkInForm.value.licensePlate = '';
  showCheckIn.value = true;
}

// 手动出场
function showCheckOutDialog() {
  checkOutForm.value.licensePlate = '';
  showCheckOut.value = true;
}

// 处理进场
async function handleCheckIn() {
  try {
    const plate = checkInForm.value.licensePlate.trim();
    if (!plate) return;
    
    // TODO: 调用进场 API
    const newRecord: ParkingRecord = {
      id: String(Date.now()),
      licensePlate: plate,
      type: 'in',
      parkingLot: 'Central Parking',
      time: new Date().toISOString()
    };
    
    records.value.unshift(newRecord);
    showToast('Check in successful');
  } catch (error) {
    showToast('Failed to check in');
  }
}

// 处理出场
async function handleCheckOut() {
  try {
    const plate = checkOutForm.value.licensePlate.trim();
    if (!plate) return;
    
    // TODO: 调用出场 API
    const newRecord: ParkingRecord = {
      id: String(Date.now()),
      licensePlate: plate,
      type: 'out',
      parkingLot: 'Central Parking',
      time: new Date().toISOString()
    };
    
    records.value.unshift(newRecord);
    showToast('Check out successful');
  } catch (error) {
    showToast('Failed to check out');
  }
}

function onLoad() {
  // 模拟加载数据
  setTimeout(() => {
    const newRecords = Array(10).fill(null).map((_, index) => ({
      id: String(records.value.length + index + 1),
      licensePlate: `ABC${Math.floor(Math.random() * 1000)}`,
      type: Math.random() > 0.5 ? 'in' : 'out',
      parkingLot: 'Central Parking',
      time: new Date(Date.now() - Math.random() * 86400000).toISOString()
    }));
    
    records.value.push(...newRecords);
    loading.value = false;
    
    if (records.value.length >= 40) {
      finished.value = true;
    }
  }, 1000);
}

function onRefresh() {
  finished.value = false;
  records.value = [];
  onLoad();
  refreshing.value = false;
}
</script>

<style scoped>
.records-page {
  min-height: 100vh;
  background: #141414;
  padding-top: 46px;
}

.quick-actions {
  position: sticky;
  top: 46px;
  z-index: 99;
  background: #1a1a1a;
  padding: 16px;
  border-bottom: 1px solid #2a2a2a;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.scan-btn {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-size: 16px;
  background: #7c4dff;
  border: none;
}

.manual-buttons {
  display: flex;
  gap: 12px;
}

.manual-buttons .van-button {
  flex: 1;
  height: 40px;
  border-radius: 8px;
}

.manual-buttons .van-button--primary {
  color: #4361ee;
  border-color: #4361ee;
}

.manual-buttons .van-button--success {
  color: #2ec4b6;
  border-color: #2ec4b6;
}

.records-container {
  padding: 16px;
}

.record-card {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.plate-number {
  font-family: 'SF Mono', monospace;
  background: rgba(124, 77, 255, 0.15);
  color: #7c4dff;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
}

.status-tag.in {
  background: #4361ee;
  color: #fff;
}

.status-tag.out {
  background: #2ec4b6;
  color: #fff;
}

.record-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.info-item .van-icon {
  font-size: 16px;
}

:deep(.van-nav-bar) {
  background-color: #1a1a1a;
}

:deep(.van-nav-bar__title) {
  color: #fff;
}

:deep(.van-dialog) {
  background: #1a1a1a;
}

:deep(.van-dialog__header) {
  color: #fff;
}

:deep(.van-dialog__content) {
  padding: 20px 16px;
}

:deep(.van-field) {
  background: transparent;
}

:deep(.van-field__label) {
  color: #999;
}

:deep(.van-field__control) {
  color: #fff;
}

:deep(.van-button--default) {
  border-color: #2a2a2a;
  color: #999;
}

:deep(.van-dialog__confirm) {
  color: #7c4dff !important;
}
</style> 