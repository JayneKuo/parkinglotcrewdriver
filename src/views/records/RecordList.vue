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
              <div class="info-item" v-if="record.type === 'out' && record.inTime">
                <van-icon name="sign" />
                <span class="time-label">Check In:</span>
                <span>{{ formatTime(record.inTime) }}</span>
              </div>
              <div class="info-item" v-if="record.type === 'out' && record.duration">
                <van-icon name="underway-o" />
                <span class="time-label">Duration:</span>
                <span>{{ record.duration }}</span>
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
import { showToast, showDialog } from 'vant';

interface ParkingRecord {
  id: string;
  licensePlate: string;
  type: 'in' | 'out';
  parkingLot: string;
  time: string;
  inTime?: string;
  duration?: string;
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
    if (!plate) {
      showToast('请输入车牌号');
      return;
    }
    
    // 检查是否已有进场记录
    const hasInRecord = records.value.some(
      record => record.licensePlate === plate && record.type === 'in' && !records.value.some(
        r => r.licensePlate === plate && r.type === 'out' && new Date(r.time) > new Date(record.time)
      )
    );
    
    if (hasInRecord) {
      showToast('该车辆已在场内');
      return;
    }
    
    // TODO: 调用进场 API
    const newRecord = {
      id: String(Date.now()),
      licensePlate: plate,
      type: 'in' as const,
      parkingLot: 'Central Parking',
      time: new Date().toISOString()
    };
    
    records.value.unshift(newRecord);
    showToast({
      message: '入场成功',
      type: 'success',
      duration: 2000
    });
    showCheckIn.value = false;

    // 入场成功后显示提示
    setTimeout(() => {
      showDialog({
        title: '入场提醒',
        message: '请将车辆停放在指定区域，并遵守停车场规则',
        theme: 'round-button',
        confirmButtonText: '我知道了'
      });
    }, 500);
  } catch (error) {
    console.error('Check in failed:', error);
    showToast({
      message: '入场失败，请重试',
      type: 'fail',
      duration: 2000
    });
  }
}

// 处理出场
async function handleCheckOut() {
  try {
    const plate = checkOutForm.value.licensePlate.trim();
    if (!plate) {
      showToast('请输入车牌号');
      return;
    }
    
    // 检查是否有进场记录
    const inRecord = records.value.find(
      record => record.licensePlate === plate && record.type === 'in' && !records.value.some(
        r => r.licensePlate === plate && r.type === 'out' && new Date(r.time) > new Date(record.time)
      )
    );
    
    if (!inRecord) {
      showToast('未找到该车辆的进场记录');
      return;
    }
    
    // 计算停车时长
    const inTime = new Date(inRecord.time);
    const outTime = new Date();
    const duration = Math.ceil((outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60));
    const fee = duration * 10; // 假设每小时10元
    
    // 显示费用确认对话框
    const result = await showDialog({
      title: '停车费用',
      message: `停车时长: ${duration}小时\n应付金额: ¥${fee.toFixed(2)}`,
      theme: 'round-button',
      showCancelButton: true,
      confirmButtonText: '确认支付',
      cancelButtonText: '取消'
    });
    
    if (result === 'confirm') {
      // TODO: 调用支付 API
      // 模拟支付成功
      const newRecord = {
        id: String(Date.now()),
        licensePlate: plate,
        type: 'out' as const,
        parkingLot: 'Central Parking',
        time: new Date().toISOString(),
        inTime: inRecord.time,
        duration: `${duration}h`
      };
      
      records.value.unshift(newRecord);
      showToast({
        message: '出场成功',
        type: 'success',
        duration: 2000
      });
      showCheckOut.value = false;

      // 出场成功后显示评价提示
      setTimeout(() => {
        showDialog({
          title: '服务评价',
          message: '感谢使用我们的停车场，是否对本次服务进行评价？',
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
      }, 500);
    }
  } catch (error) {
    console.error('Check out failed:', error);
    showToast({
      message: '出场失败，请重试',
      type: 'fail',
      duration: 2000
    });
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
  background: var(--page-background);
  padding-top: 46px;
}

.quick-actions {
  position: sticky;
  top: 46px;
  z-index: 99;
  background: var(--card-background);
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
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
  background: var(--primary-color);
  border: none;
  color: #ffffff;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.manual-buttons {
  display: flex;
  gap: 12px;
}

.manual-buttons .van-button {
  flex: 1;
  height: 44px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
}

.manual-buttons .van-button--primary {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: #ffffff;
}

.manual-buttons .van-button--success {
  background: var(--success-color);
  border-color: var(--success-color);
  color: #ffffff;
}

.records-container {
  padding: 16px;
}

.record-card {
  background: var(--card-background);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.plate-number {
  font-family: 'SF Mono', monospace;
  background: rgba(67, 97, 238, 0.12);
  color: var(--primary-color);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.status-tag.in {
  background: var(--highlight-background);
  color: var(--primary-color);
  font-weight: 600;
}

.status-tag.out {
  background: rgba(16, 185, 129, 0.12);
  color: var(--success-color);
  font-weight: 600;
}

.record-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 14px;
}

.info-item .van-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.time-label {
  color: var(--text-tertiary);
  font-size: 13px;
  margin-right: 4px;
}

.info-item span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.van-nav-bar) {
  background-color: var(--card-background);
  box-shadow: var(--shadow-sm);
}

:deep(.van-nav-bar__title) {
  color: var(--text-primary);
}

:deep(.van-dialog) {
  background: var(--card-background);
  border-radius: 16px;
  overflow: hidden;
}

:deep(.van-dialog__header) {
  color: var(--text-primary);
  font-weight: 600;
  padding: 20px 20px 0;
  font-size: 18px;
}

:deep(.van-dialog__content) {
  padding: 20px;
}

:deep(.van-dialog__message) {
  color: var(--text-primary);
  font-size: 15px;
  line-height: 1.5;
}

:deep(.van-dialog__footer) {
  padding: 8px 12px 12px;
}

:deep(.van-dialog__cancel) {
  color: var(--text-secondary) !important;
  font-size: 15px;
  font-weight: 500;
}

:deep(.van-dialog__confirm) {
  color: var(--primary-color) !important;
  font-size: 15px;
  font-weight: 500;
}

:deep(.van-field) {
  padding: 12px 0;
}

:deep(.van-field__label) {
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 500;
}

:deep(.van-field__control) {
  color: var(--text-primary);
  font-size: 15px;
}

:deep(.van-field__control::placeholder) {
  color: var(--text-tertiary);
}

:deep(.van-pull-refresh) {
  background: var(--page-background);
}

:deep(.van-list) {
  background: transparent;
}

:deep(.van-pull-refresh__track),
:deep(.van-pull-refresh__head) {
  color: var(--text-secondary);
}

:deep(.van-list__loading),
:deep(.van-list__finished-text),
:deep(.van-list__error-text) {
  color: var(--text-tertiary);
  font-size: 14px;
  padding: 16px 0;
}
</style> 