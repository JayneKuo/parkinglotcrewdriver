<template>
  <div class="vehicle-page">
    <van-nav-bar
      title="Vehicle Information"
      left-arrow
      @click-left="handleBack"
      class="custom-nav"
    />

    <div class="content">
      <!-- Recent License Plates -->
      <div class="section" v-if="recentPlates.length">
        <h2 class="section-title">RECENT PLATES</h2>
        <div class="recent-plates">
          <div 
            v-for="plate in recentPlates"
            :key="plate"
            class="plate-tag"
            @click="selectPlate(plate)"
          >
            {{ plate }}
          </div>
        </div>
      </div>

      <!-- Vehicle Forms -->
      <div class="vehicles-list">
        <div 
          v-for="(vehicle, index) in vehicles" 
          :key="index"
          class="vehicle-form"
        >
          <div class="form-header">
            <h2 class="section-title">
              VEHICLE {{ vehicles.length > 1 ? (index + 1) : '' }}
            </h2>
            <div class="form-actions" v-if="vehicles.length > 1">
              <van-button 
                size="small"
                class="remove-btn"
                @click="removeVehicle(index)"
              >
                Remove
              </van-button>
            </div>
          </div>

          <div class="input-group">
            <div class="input-field">
              <input 
                v-model="vehicle.licensePlate"
                placeholder="License Plate"
                class="custom-input"
              >
            </div>

            <template v-if="isValetService">
              <div class="input-field">
                <input 
                  v-model="vehicle.brand"
                  placeholder="Brand"
                  class="custom-input"
                >
              </div>
              <div class="input-field">
                <input 
                  v-model="vehicle.model"
                  placeholder="Model"
                  class="custom-input"
                >
              </div>
              <div class="input-field">
                <input 
                  v-model="vehicle.color"
                  placeholder="Color"
                  class="custom-input"
                >
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Add Vehicle Button -->
      <div v-if="canAddMore" class="add-vehicle">
        <van-button 
          block 
          class="add-btn"
          @click="addVehicle"
        >
          Add Vehicle {{ vehicles.length + 1 }} of {{ maxVehicles }}
        </van-button>
      </div>

      <!-- Vehicle Count Indicator -->
      <div class="vehicle-count">
        {{ vehicles.length }} of {{ maxVehicles }} vehicles added
      </div>
    </div>

    <!-- Bottom Button -->
    <div class="bottom-bar">
      <van-button 
        block 
        :disabled="!isValid"
        @click="handleConfirm"
        class="submit-btn"
      >
        Confirm Reservation
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';

interface Vehicle {
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
}

const route = useRoute();
const router = useRouter();
const isValetService = computed(() => route.query.service === 'valet');
const maxVehicles = Number(route.query.spots || 1);

// 最近使用的车牌号
const recentPlates = ref<string[]>(
  JSON.parse(localStorage.getItem('recentPlates') || '[]')
);

// 车辆信息列表
const vehicles = ref<Vehicle[]>([{
  licensePlate: '',
  brand: '',
  model: '',
  color: ''
}]);

const canAddMore = computed(() => vehicles.value.length < maxVehicles);

const isValid = computed(() => {
  return vehicles.value.every(vehicle => {
    const hasLicensePlate = !!vehicle.licensePlate;
    if (isValetService.value) {
      return hasLicensePlate && !!vehicle.brand;
    }
    return hasLicensePlate;
  });
});

function addVehicle() {
  if (canAddMore.value) {
    vehicles.value.push({
      licensePlate: '',
      brand: '',
      model: '',
      color: ''
    });
  }
}

function removeVehicle(index: number) {
  vehicles.value.splice(index, 1);
}

function selectPlate(plate: string) {
  if (vehicles.value.length > 0) {
    const emptyVehicleIndex = vehicles.value.findIndex(v => !v.licensePlate);
    const targetIndex = emptyVehicleIndex >= 0 ? emptyVehicleIndex : 0;
    vehicles.value[targetIndex].licensePlate = plate;
  }
}

function savePlateToRecent(plate: string) {
  const plates = new Set(recentPlates.value);
  plates.add(plate);
  const newPlates = Array.from(plates).slice(-5); // 只保留最近5个
  localStorage.setItem('recentPlates', JSON.stringify(newPlates));
}

function handleBack() {
  router.back();
}

function handleConfirm() {
  // 保存车牌号到最近使用记录
  vehicles.value.forEach(vehicle => {
    if (vehicle.licensePlate) {
      savePlateToRecent(vehicle.licensePlate);
    }
  });

  // 跳转到确认页面，并传递数据
  router.push({
    path: `/parking/${route.params.id}/confirm`,
    query: {
      ...route.query,  // 保留原有的 query 参数
      vehicles: JSON.stringify(vehicles.value),
      startTime: route.query.startTime,
      duration: route.query.duration,
      spots: route.query.spots,
      price: route.query.price,
      priceType: route.query.priceType
    }
  });
}
</script>

<style scoped>
.vehicle-page {
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

.recent-plates {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.plate-tag {
  background: #2a2a2a;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.plate-tag:hover {
  background: #7c4dff;
}

.vehicles-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.vehicle-form {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 16px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.form-actions {
  display: flex;
  gap: 8px;
}

.vehicle-count {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-top: 16px;
}

.add-btn {
  background: transparent;
  border: 1px dashed #7c4dff;
  color: #7c4dff;
  height: 44px;
  border-radius: 12px;
}

.input-field {
  background: #2a2a2a;
  border-radius: 8px;
  margin-bottom: 12px;
}

.custom-input {
  width: 100%;
  height: 48px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 16px;
  padding: 0 16px;
  outline: none;
}

.custom-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
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
</style> 