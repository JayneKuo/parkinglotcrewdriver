<template>
  <div class="parking-detail">
    <!-- 固定导航栏 -->
    <div class="fixed-nav" :class="{ 'show-nav': showNav }">
      <van-nav-bar class="custom-nav">
        <template #left>
          <van-icon name="arrow-left" color="#323233" @click="handleBack" />
        </template>
        <template #title>
          <transition name="fade">
            <span v-show="showNav" class="nav-title">{{ parkingLot?.name }}</span>
          </transition>
        </template>
      </van-nav-bar>
    </div>

    <!-- 图片上的返回按钮 -->
    <div class="floating-back" :class="{ 'hide': showNav }">
      <div class="back-btn" @click="handleBack">
        <van-icon name="arrow-left" color="#fff" />
      </div>
    </div>

    <!-- 顶部图片和车位信息 -->
    <div class="image-section">
      <img :src="parkingLot?.mainImage" :alt="parkingLot?.name" class="main-image" />
    </div>

    <!-- 车位状态标签 -->
    <div class="spots-tag-wrapper">
      <div class="status-tag" :class="parkingLot?.status">
        <template v-if="parkingLot?.status === 'available'">
          <span class="spots-count">{{ parkingLot?.spots[0].available }}</span>
          <span class="spots-text">spots left</span>
        </template>
        <template v-else-if="parkingLot?.status === 'full'">
          <span class="spots-text">Full</span>
        </template>
        <template v-else-if="parkingLot?.status === 'maintenance'">
          <span class="spots-text">Under Maintenance</span>
        </template>
        <template v-else-if="parkingLot?.status === 'closed'">
          <span class="spots-text">Closed</span>
        </template>
      </div>
    </div>

    <div class="content">
      <!-- 基本信息 -->
      <div class="basic-info">
        <div class="title-section">
          <h1>{{ parkingLot?.name }}</h1>
          <div class="rating-row">
            <van-rate :model-value="parkingLot?.rating || 0" readonly allow-half size="14" color="#ffd21e" />
            <span class="rating-text">{{ parkingLot?.rating }} ({{ parkingLot?.ratingCount }} reviews)</span>
          </div>
        </div>

        <!-- 服务标签 -->
        <div class="feature-tags">
          <!-- 停车类型标签 -->
          <div class="feature-tag parking-type">
            <van-icon name="car-o" />
            <span>Self-parking</span>
          </div>
          <div class="feature-tag parking-type">
            <van-icon name="service-o" />
            <span>Valet</span>
          </div>
          <!-- 车辆类型标签 -->
          <div class="feature-tag vehicle-type">
            <van-icon name="car-o" />
            <span>Car</span>
          </div>
          <div class="feature-tag vehicle-type">
            <van-icon name="logistics" />
            <span>Truck</span>
          </div>
          <div class="feature-tag vehicle-type">
            <van-icon name="flash" />
            <span>EV</span>
          </div>
          <!-- 其他服务标签 -->
          <div class="feature-tag">
            <van-icon name="clock" />
            <span>24h Advance Booking</span>
          </div>
          <div class="feature-tag">
            <van-icon name="passed" />
            <span>Flexible Cancellation</span>
          </div>
          <div class="feature-tag">
            <van-icon name="shield-o" />
            <span>Secure Parking</span>
          </div>
        </div>
      </div>

      <!-- 价格信息部分 -->
      <div class="section">
        <h2>Pricing</h2>
        <!-- 单个价格时的特殊布局 -->
        <div v-if="prices.length === 1" class="single-price">
          <div class="price-highlight">
            <div class="price-amount">${{ prices[0].value }}</div>
            <div class="price-label">{{ prices[0].label }}</div>
          </div>
        </div>
        <!-- 多个价格的网格布局 -->
        <div v-else class="price-grid" :class="getPriceGridClass(prices.length)">
          <div v-for="price in prices" :key="price.type" class="price-card">
            <div class="price-amount">${{ price.value }}</div>
            <div class="price-label">{{ price.label }}</div>
          </div>
        </div>
      </div>

      <!-- 位置信息 -->
      <div class="section">
        <h2>Location</h2>
        <div class="location-info" @click="handleNavigate(parkingLot!)">
          <van-icon name="location" class="location-icon" />
          <div class="address-info">
            <div class="address-wrapper">
              <span class="address">{{ parkingLot?.address }}</span>
              <span class="distance">{{ formatDistance(parkingLot?.distance) }} away</span>
            </div>
          </div>
          <van-icon name="guide" class="nav-icon" />
        </div>
      </div>

      <!-- 联系信息部分 -->
      <div class="section">
        <h2>Contact Information</h2>
        <div class="contact-list">
          <div class="contact-item">
            <van-icon name="manager-o" />
            <span>{{ parkingLot?.contact.name }}</span>
          </div>
          <a :href="`tel:${parkingLot?.contact.phone}`" class="contact-item">
            <van-icon name="phone-o" />
            <span>{{ parkingLot?.contact.phone }}</span>
          </a>
          <a :href="`mailto:${parkingLot?.contact.email}`" class="contact-item">
            <van-icon name="envelop-o" />
            <span>{{ parkingLot?.contact.email }}</span>
          </a>
        </div>
      </div>

      <!-- 设施信息 -->
      <div class="section">
        <h2>Amenities</h2>
        <div class="amenities-grid">
          <div v-for="amenity in parkingLot?.amenities" :key="amenity.type" 
               class="amenity-item">
            <van-icon :name="amenity.icon" />
            <span>{{ amenity.name }}</span>
          </div>
        </div>
      </div>

      <!-- 详细信息 -->
      <div class="section">
        <h2>About This Parking</h2>
        <div class="description">{{ parkingLot?.description }}</div>
        
        <h3>Building Information</h3>
        <img 
          :src="parkingLot?.buildingImage" 
          :alt="parkingLot?.name" 
          class="building-image"
        />
        <div class="building-description">
          {{ parkingLot?.buildingDescription }}
        </div>

        <div class="disclaimer">
          <h3>Disclaimer</h3>
          <p>Rates and availability are subject to change. Please follow all parking rules and regulations.</p>
        </div>
      </div>
    </div>

    <!-- 底部预订栏 -->
    <div class="booking-bar">
      <van-button 
        plain
        block
        icon="phone-o"
        class="call-btn"
        @click="handleCall(parkingLot?.contact.phone)"
      >
        Call
      </van-button>
      <van-button 
        type="primary" 
        block 
        :disabled="!parkingLot?.spots[0].available"
        @click="handleReserve"
      >
        {{ parkingLot?.spots[0].available ? 'Reserve Now' : 'No Spots Available' }}
      </van-button>
    </div>
  </div>
</template>

<style scoped>
.parking-detail {
  min-height: 100vh;
  background: #fff;
}

.image-section {
  position: relative;
  width: 100%;
  height: 250px;
  background: #f5f5f5;
  margin-bottom: 32px;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nav-bar {
  position: absolute;
  top: env(safe-area-inset-top, 0);
  left: 0;
  padding: 16px;
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  padding: 0 16px 80px;
  margin-top: -8px;
}

.basic-info {
  margin-bottom: 24px;
}

.title-section {
  margin-bottom: 16px;
}

h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 6px;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rating-text {
  color: #666;
  font-size: 14px;
}

.spots-tag-wrapper {
  position: absolute;
  top: 230px;
  right: 16px;
  z-index: 1;
}

.status-tag {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  backdrop-filter: blur(8px);
  border-radius: 16px;
  font-size: 13px;
  border-right: 3px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-tag.available {
  background: rgba(7, 193, 96, 0.95);
  border-right: 3px solid #07c160;
}

.status-tag.full {
  background: rgba(238, 10, 36, 0.95);
  border-right: 3px solid #ee0a24;
}

.status-tag.maintenance {
  background: rgba(255, 151, 106, 0.95);
  border-right: 3px solid #ff976a;
}

.status-tag.closed {
  background: rgba(150, 151, 153, 0.95);
  border-right: 3px solid #969799;
}

.spots-count {
  font-weight: 600;
  font-size: 14px;
  color: #fff;
}

.spots-text {
  font-size: 13px;
  color: #fff;
  font-weight: 500;
}

.features-section {
  padding: 0 16px;
  margin-bottom: 24px;
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
  margin-top: 20px;
}

.feature-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 13px;
}

.feature-tag .van-icon {
  font-size: 16px;
}

/* 不同类型标签的颜色 */
.feature-tag.parking-type {
  color: #1989fa;
}

.feature-tag.vehicle-type {
  color: #07c160;
}

.feature-tag:has(.van-icon-clock) {
  color: #ff976a;
}

.feature-tag:has(.van-icon-passed) {
  color: #8b5cf6;
}

.feature-tag:has(.van-icon-shield-o) {
  color: #ee0a24;
}

.section {
  margin-bottom: 24px;
}

.section h2 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.price-grid {
  display: grid;
  gap: 12px;
  margin: 0 auto;
}

/* 根据数量自适应布局 */
.price-grid.grid-2 {
  grid-template-columns: repeat(2, 1fr);
  max-width: 500px; /* 限制最大宽度，保持美观 */
}

.price-grid.grid-3 {
  grid-template-columns: repeat(3, 1fr);
  max-width: 600px;
}

.price-grid.grid-4 {
  grid-template-columns: repeat(4, 1fr);
  max-width: 800px;
}

.price-grid.grid-multi {
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  max-width: 800px;
}

.price-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}

.price-card:hover {
  transform: translateY(-2px);
}

.price-amount {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.price-label {
  font-size: 13px;
  color: #666;
}

/* 响应式调整 */
@media (max-width: 375px) {
  .price-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)) !important;
  }

  .price-highlight {
    padding: 20px 32px;
  }

  .price-highlight .price-amount {
    font-size: 28px;
  }
}

.location-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 12px;
}

.location-icon {
  font-size: 20px;
  color: #1989fa;
  margin-top: 2px;
}

.address-info {
  flex: 1;
  min-width: 0;
}

.address-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.address {
  font-size: 15px;
  color: #323233;
  line-height: 1.4;
  word-break: break-word;
}

.distance {
  font-size: 13px;
  color: #666;
}

.nav-icon {
  font-size: 18px;
  color: #1989fa;
  margin-top: 2px;
}

.description {
  font-size: 14px;
  line-height: 1.6;
  color: #666;
}

.amenities-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.amenity-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.amenity-item .van-icon {
  font-size: 24px;
  color: #1989fa;
}

.amenity-item span {
  font-size: 12px;
  color: #666;
}

.contact-list {
  display: flex;
  flex-direction: column;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  text-decoration: none;
  color: #323233;
  font-size: 15px;
  border-bottom: 1px solid #f5f5f5;
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-item .van-icon {
  font-size: 20px;
  color: #969799;
}

.contact-item span {
  flex: 1;
}

.building-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  margin: 16px 0;
}

h3 {
  font-size: 15px;
  font-weight: 500;
  color: #323233;
  margin: 20px 0 12px;
}

.description,
.building-description {
  font-size: 14px;
  line-height: 1.6;
  color: #666;
}

.disclaimer {
  margin-top: 24px;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 12px;
}

.disclaimer p {
  font-size: 12px;
  line-height: 1.6;
  color: #999;
}

.booking-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  box-shadow: 0 -1px 10px rgba(0,0,0,0.05);
}

.call-btn {
  --van-button-default-color: #323233;
  --van-button-default-border-color: #dcdee0;
}

/* 调整按钮内图标和文字的间距 */
.van-button__icon {
  margin-right: 4px;
}

/* 单个价格的特殊样式 */
.single-price {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.price-highlight {
  background: linear-gradient(135deg, #1989fa, #39b9f9);
  padding: 24px 48px;
  border-radius: 16px;
  text-align: center;
  color: #fff;
  box-shadow: 0 4px 16px rgba(25, 137, 250, 0.2);
}

.price-highlight .price-amount {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #fff;
}

.price-highlight .price-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

/* 固定导航栏样式 */
.fixed-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  transform: translateY(-100%);
  transition: all 0.3s ease;
}

.fixed-nav.show-nav {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 自定义导航栏样式 */
:deep(.custom-nav) {
  background-color: #fff !important;
  height: 52px;
  line-height: 52px;
}

:deep(.custom-nav .van-nav-bar__title) {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

/* 浮动返回按钮样式 */
.floating-back {
  position: fixed;
  top: max(env(safe-area-inset-top), 20px);
  left: 16px;
  z-index: 99;
  transition: opacity 0.3s ease;
}

.floating-back.hide {
  opacity: 0;
  pointer-events: none;
}

.back-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.back-btn:active {
  background: rgba(0, 0, 0, 0.4);
}

/* 标题过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 删除旧的导航栏样式 */
.nav-bar {
  display: none;
}
</style>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import type { ParkingLot } from '@/types/parking';
import { ServiceType } from '@/types/parking';
import { 
  formatDistance, 
  handleNavigate, 
  handleCall, 
  getPriceIcon, 
  formatServiceType,
  mockParkingLots 
} from '@/utils/helpers';

const route = useRoute();
const router = useRouter();
const parkingLot = ref<ParkingLot>();
const currentImageIndex = ref(0);
const showNav = ref(false);

// 获取所有图片
const allImages = computed(() => {
  if (!parkingLot.value) return [];
  return [parkingLot.value.mainImage, ...parkingLot.value.gallery];
});

// 处理返回
const handleBack = () => {
  router.back();
};

// 获取状态文本
const getStatusText = (status?: string) => {
  const texts: Record<string, string> = {
    available: 'Available for Booking',
    limited: 'Limited Spots Left',
    full: 'Currently Full'
  };
  return texts[status || ''] || 'Status Unknown';
};

// 获取车位图标
const getSpotIcon = (type: string) => {
  const icons: Record<string, string> = {
    car: 'car-o',
    truck: 'logistics',
    ev: 'flash'
  };
  return icons[type] || 'car-o';
};

// 格式化车位类型
const formatSpotType = (type: string) => {
  const types: Record<string, string> = {
    car: 'Cars',
    truck: 'Trucks',
    ev: 'EV Charging'
  };
  return types[type] || type;
};

// 获取车位状态样式
const getSpotStatusClass = (spot: { available: number; total: number }) => {
  const ratio = spot.available / spot.total;
  if (ratio === 0) return 'full';
  if (ratio < 0.2) return 'limited';
  return 'available';
};

// 处理邮件
const handleEmail = (email?: string) => {
  if (email) {
    window.location.href = `mailto:${email}`;
  }
};

// 处理预订
const handleReserve = () => {
  if (parkingLot.value?.status === 'available') {
    router.push(`/parking/${parkingLot.value.id}/reserve`);
  }
};

// 加载停车场数据
onMounted(() => {
  const id = Number(route.params.id);
  const lot = mockParkingLots.find(lot => lot.id === id);
  
  if (lot) {
    parkingLot.value = lot;
  } else {
    showToast('Parking lot not found');
    router.push('/home');
  }

  // 监听滚动
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  // 移除监听滚动
  window.removeEventListener('scroll', handleScroll);
});

const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  showNav.value = scrollTop > 100; // 当滚动超过100px时显示导航栏
};

// 获取车位状态颜色
const getSpotColor = (spot: { available: number; total: number }) => {
  const ratio = spot.available / spot.total;
  if (ratio === 0) return '#ee0a24';
  if (ratio < 0.2) return '#ff976a';
  return '#07c160';
};

// 获取最低价格
const getMinPrice = () => {
  if (!parkingLot.value?.prices.length) return 0;
  return Math.min(...parkingLot.value.prices.map(p => p.value));
};

// 处理轮播切换
const onSwipeChange = (index: number) => {
  currentImageIndex.value = index;
};

// 取地图预览图片URL
const getMapPreviewUrl = (lat?: number, lng?: number) => {
  if (!lat || !lng) return '';
  const apiKey = 'your_google_maps_api_key';
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=${apiKey}`;
};

// 图片画廊相关
const showGalleryPopup = ref(false);
const showGallery = () => {
  showGalleryPopup.value = true;
};

// 更新价格数据结构
interface PriceItem {
  type: string;
  value: number;
  label: string;
}

const prices: PriceItem[] = [
  { type: 'minute', value: 0.5, label: 'Per Minute' },
  { type: '8hours', value: 15, label: '8 Hours' },
  { type: 'daily', value: 25, label: 'Daily' },
  { type: 'weekly', value: 120, label: 'Weekly' },
  { type: '6months', value: 600, label: '6 Months' },
  { type: 'yearly', value: 1000, label: 'Yearly' }
];

// 更新服务类型枚举
enum ServiceType {
  SelfParking = 'self-parking',
  Valet = 'valet',
  Car = 'car',
  Truck = 'truck',
  EV = 'ev'
}

// 更新服务图标映射
const getServiceIcon = (type: ServiceType) => {
  const icons: Record<string, string> = {
    [ServiceType.SelfParking]: 'car-o',
    [ServiceType.Valet]: 'service-o',
    [ServiceType.Car]: 'car-o',
    [ServiceType.Truck]: 'logistics',
    [ServiceType.EV]: 'flash'
  };
  return icons[type] || 'info-o';
};

// 更新服务类型格式化
const formatServiceType = (type: ServiceType) => {
  const types: Record<string, string> = {
    [ServiceType.SelfParking]: 'Self-parking',
    [ServiceType.Valet]: 'Valet',
    [ServiceType.Car]: 'Car',
    [ServiceType.Truck]: 'Truck',
    [ServiceType.EV]: 'EV'
  };
  return types[type] || type;
};

// 获取价格网格类名
const getPriceGridClass = (length: number) => {
  if (length <= 4) {
    return `grid-${length}`;
  }
  return 'grid-multi'; // 5个或更多使用自适应布局
};
</script> 