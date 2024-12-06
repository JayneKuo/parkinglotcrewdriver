<template>
  <div class="vehicle-page">
    <van-nav-bar
      title="Vehicle Information"
      left-arrow
      @click-left="handleBack"
      class="custom-nav"
    />

    <div class="content">
      <h1 class="page-title">Please provide your vehicle information</h1>

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
      <div 
        v-for="(vehicle, index) in vehicles" 
        :key="index"
        class="vehicle-form"
      >
        <div class="form-header">
          <h2 class="section-title">VEHICLE {{ vehicles.length > 1 ? index + 1 : '' }}</h2>
          <van-button 
            v-if="vehicles.length > 1"
            size="small"
            class="remove-btn"
            @click="removeVehicle(index)"
          >
            Remove
          </van-button>
        </div>

        <div class="input-group">
          <div class="input-field">
            <input 
              v-model="vehicle.licensePlate"
              placeholder="License Plate *"
              class="custom-input"
            >
          </div>

          <template v-if="isValetService">
            <div class="input-row">
              <div class="input-field">
                <input 
                  v-model="vehicle.brand"
                  placeholder="Brand *"
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

      <!-- Add Vehicle Button -->
      <div v-if="canAddMore" class="add-vehicle">
        <van-button 
          block 
          class="add-btn"
          @click="addVehicle"
        >
          Add Another Vehicle
        </van-button>
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
        Confirm
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

// 最近使用的车牌号（从本地存储获取）
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

  showToast('Vehicle information confirmed!');
  router.push('/parking-orders');
}
</script>

<style scoped>
.vehicle-page {
  min-height: 100vh;
  background: #1a1a1a;
  color: #fff;
  padding-bottom: 80px;
}

/* ... 其他基础样式保持不变 ... */

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

.vehicle-form {
  margin-bottom: 24px;
  padding: 16px;
  background: #2a2a2a;
  border-radius: 12px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.remove-btn {
  font-size: 12px;
  padding: 4px 12px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ff4d4f;
}

.add-vehicle {
  margin-top: 16px;
}

.add-btn {
  background: transparent;
  border: 1px dashed #7c4dff;
  color: #7c4dff;
  height: 44px;
  border-radius: 12px;
}

/* ... 其他样式保持不变 ... */
</style>