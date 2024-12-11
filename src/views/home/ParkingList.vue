<template>
  <div class="parking-list">
    <van-nav-bar title="Parking Lots">
      <template #right>
        <van-icon name="scan" size="18" @click="handleScan" />
      </template>
    </van-nav-bar>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <van-search
        v-model="searchParams.keyword"
        placeholder="Search parking lots"
        shape="round"
      />
      <van-button 
        icon="filter-o" 
        class="filter-btn"
        @click="showFilter = true"
      />
    </div>

    <!-- 列表视图 -->
    <div v-show="viewMode === 'list'" class="list-view">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="No more data"
          @load="onLoad"
        >
          <div 
            v-for="lot in parkingLots" 
            :key="lot.id" 
            class="parking-item"
            @click="handleItemClick(lot)"
          >
            <div class="item-image-container">
              <img :src="lot.mainImage" class="item-image" :alt="lot.name" />
              <div class="status-tag" :class="getStatusClass(lot)">
                <template v-if="lot.status === 'available'">
                  <span class="spots-count">{{ lot.spots[0].available }}</span>
                  <span class="spots-text">spots left</span>
                </template>
                <template v-else-if="lot.status === 'full'">
                  <span class="spots-text">Full</span>
                </template>
                <template v-else-if="lot.status === 'maintenance'">
                  <span class="spots-text">Under Maintenance</span>
                </template>
                <template v-else-if="lot.status === 'closed'">
                  <span class="spots-text">Closed</span>
                </template>
              </div>
            </div>
            
            <div class="item-content">
              <!-- 标题行 -->
              <div class="header-row">
                <div class="title-wrap">
                  <div class="item-title" :title="lot.name">{{ lot.name }}</div>
                  <div class="rating-info">
                    <van-rate v-model="lot.rating" readonly allow-half void-icon="star" size="12" />
                    <span class="rating-count">({{ lot.ratingCount }})</span>
                  </div>
                </div>
              </div>

              <!-- 联系信息 -->
              <div class="contact-row" @click.stop>
                <van-icon name="phone-o" class="action-icon" />
                <a :href="`tel:${lot.phone}`" class="action-link">{{ lot.phone }}</a>
              </div>

              <!-- 地址行 -->
              <div class="address-row clickable" @click.stop="handleNavigate(lot)">
                <van-icon name="guide-o" class="action-icon" />
                <div class="address-content">
                  <span class="action-link">
                    {{ lot.address }} - {{ formatDistance(lot.distance) }}
                  </span>
                </div>
              </div>

              <!-- 价格信息 -->
              <div class="price-grid" :class="getPriceLayoutClass(lot.prices.length)">
                <div v-for="price in displayPrices(lot.prices)" 
                     :key="price.type"
                     class="price-item"
                >
                  <div class="price-value">${{ price.value }}</div>
                  <div class="price-label">{{ price.label }}</div>
                </div>
                <div v-if="lot.prices.length > getMaxDisplayPrices(lot.prices.length)" 
                     class="price-more"
                >
                  +{{ lot.prices.length - getMaxDisplayPrices(lot.prices.length) }} more
                </div>
              </div>

              <!-- 服务类型标签 -->
              <div class="services">
                <span class="service-tag" v-if="lot.serviceTypes.includes(ServiceType.Valet)">
                  <van-icon name="service" />
                  Valet
                </span>
                <span class="service-tag" v-if="lot.serviceTypes.includes(ServiceType.Dock)">
                  <van-icon name="logistics" />
                  Loading Dock
                </span>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 地图视图 -->
    <div v-show="viewMode === 'map'" class="map-view">
      <!-- 地图组件将在后续实现 -->
    </div>

    <!-- 视图切换按钮 -->
    <div class="view-switch-btn">
      <van-button
        round
        type="primary"
        size="small"
        @click="toggleView"
      >
        <template #icon>
          <van-icon :name="viewMode === 'list' ? 'location-o' : 'bars'" />
        </template>
        {{ viewMode === 'list' ? 'View Map' : 'View List' }}
      </van-button>
    </div>

    <!-- 筛选弹窗 -->
    <van-popup
      v-model:show="showFilter"
      position="right"
      class="filter-popup"
    >
      <div class="filter-content">
        <van-nav-bar
          title="Filters"
          left-arrow
          @click-left="showFilter = false"
        />
        <div class="filter-body">
          <van-cell-group title="Service Types">
            <van-checkbox-group v-model="searchParams.serviceTypes">
              <van-cell
                v-for="type in serviceTypeOptions"
                :key="type.value"
                :title="type.label"
                clickable
                @click="toggleServiceType(type.value)"
              >
                <template #right-icon>
                  <van-checkbox 
                    :name="type.value" 
                    @click.stop 
                  />
                </template>
              </van-cell>
            </van-checkbox-group>
          </van-cell-group>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import {
  showToast,
  NavBar,
  Icon,
  Search,
  Button,
  List,
  PullRefresh,
  Card,
  Tag,
  Popup,
  Cell,
  CellGroup,
  Checkbox,
  CheckboxGroup,
  Tab,
  Tabs,
  Rate
} from 'vant';
import type { ParkingLot, SearchParams } from '@/types/parking';
import { ServiceType, PricingType } from '@/types/parking';
import { useRouter } from 'vue-router';
import { 
  mockParkingLots,  // 从 helpers 导入模拟数据
  PARKING_IMAGES,  // 导入图片配置
  formatDistance, 
  handleNavigate, 
  handleCall, 
  getPriceIcon, 
  formatServiceType 
} from '@/utils/helpers';

// 视图模式
const viewMode = ref<'list' | 'map'>('list');

// 列表状态
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const parkingLots = ref<ParkingLot[]>([]);

// 筛选状态
const showFilter = ref(false);
const searchParams = reactive<SearchParams>({
  keyword: '',
  serviceTypes: [],
});

// 服务类型选项
const serviceTypeOptions = [
  { label: 'Standard Parking', value: ServiceType.Standard },
  { label: 'Valet Parking', value: ServiceType.Valet },
  { label: 'Covered Parking', value: ServiceType.Covered },
  { label: 'Electric Charging', value: ServiceType.Electric },
];

// 价格类型定义
interface PriceItem {
  type: string;
  label: string;
  value: number;
}

// 加载数据
const onLoad = () => {
  setTimeout(() => {
    if (refreshing.value) {
      parkingLots.value = [];
      refreshing.value = false;
    }

    if (parkingLots.value.length === 0) {
      parkingLots.value = mockParkingLots;
    }
    
    loading.value = false;
    finished.value = true;
  }, 1000);
};

// 下拉刷新
const onRefresh = () => {
  finished.value = false;
  loading.value = true;
  onLoad();
};

// 扫码功能
const handleScan = () => {
  showToast('Scan functionality coming soon');
};

// 拨打电话
const handleCall = (phone: string) => {
  window.location.href = `tel:${phone}`;
};

// 切换服务类型
const toggleServiceType = (type: ServiceType) => {
  const index = searchParams.serviceTypes.indexOf(type);
  if (index > -1) {
    searchParams.serviceTypes.splice(index, 1);
  } else {
    searchParams.serviceTypes.push(type);
  }
};

// 切换视图模式
const toggleView = () => {
  viewMode.value = viewMode.value === 'list' ? 'map' : 'list';
};

// 获取价格布局类名
const getPriceLayoutClass = (count: number) => {
  if (count === 1) return 'price-layout-single';
  if (count === 2) return 'price-layout-row';
  if (count === 3) return 'price-layout-three';
  if (count <= 4) return 'price-layout-grid-2';
  return 'price-layout-grid-3';
};

// 获取最大显示价格数量
const getMaxDisplayPrices = (total: number) => {
  if (total <= 4) return total;
  return 6; // 超过4个时最多显示6个
};

// 获取要显示的价格列表
const displayPrices = (prices: PriceItem[]) => {
  const maxDisplay = getMaxDisplayPrices(prices.length);
  return prices.slice(0, maxDisplay);
};

const router = useRouter();

// 处理点击事件
const handleItemClick = (lot: ParkingLot) => {
  router.push({
    path: `/parking/${lot.id}`,
    query: { from: 'list' }
  });
};

// 获取状态类名
const getStatusClass = (lot: ParkingLot) => {
  if (lot.status === 'maintenance') return 'maintenance';
  if (lot.status === 'closed') return 'closed';
  
  const availableSpots = lot.spots[0].available;
  if (availableSpots === 0) return 'full';
  return 'available';
};

// 获取服务类型标签样式
const getServiceTagStyle = (type: ServiceType) => {
  switch (type) {
    case ServiceType.Valet:
      return { color: '#4361ee', background: 'rgba(67, 97, 238, 0.1)' };
    case ServiceType.Dock:
      return { color: '#2ec4b6', background: 'rgba(46, 196, 182, 0.1)' };
    default:
      return { color: '#7c4dff', background: 'rgba(124, 77, 255, 0.1)' };
  }
};
</script>

<style scoped>
.parking-list {
  min-height: 100vh;
  background: var(--background-color);
  padding-bottom: calc(var(--van-tabbar-height) + 80px); /* 为底部导航栏和按钮留出空间 */
}

.search-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 8px;
  background: var(--surface-color);
}

.search-bar :deep(.van-search) {
  flex: 1;
  margin-right: 8px;
}

.filter-btn {
  flex-shrink: 0;
}

.parking-item {
  margin: 12px;
  background: var(--surface-color);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.item-image-container {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: var(--background-color);
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-content {
  padding: 16px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.title-wrap {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rating-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 12px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--primary-color);
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.icon-btn:active {
  background-color: rgba(var(--primary-color-rgb), 0.1);
}

.icon-btn .van-icon {
  font-size: 20px;
}

.address-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
  color: #666666;
  cursor: pointer;
}

.address-content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.address-text {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-icon {
  font-size: 16px;
  color: #666666;
}

/* 点击效果 */
.address-row:active,
.phone-text:active {
  opacity: 0.7;
}

.item-tags {
  display: none; /* 或直接删除这个样式块 */
}

.service-tags {
  display: flex;
  gap: 4px;
  margin-top: 8px;
  height: 18px;
  overflow: hidden;
  flex-wrap: nowrap;
}

.service-tag {
  flex-shrink: 0;
}

:deep(.van-tag) {
  padding: 0 6px;
  line-height: 16px;
  font-size: 10px;
  border-radius: 2px;
  font-weight: normal;
}

:deep(.van-tag--plain) {
  background: transparent;
}

/* 定制标签颜色 */
:deep(.van-tag--primary) {
  color: #7c4dff;
  border-color: #7c4dff;
}

:deep(.van-tag--success) {
  color: #00c853;
  border-color: #00c853;
}

:deep(.van-tag--danger) {
  color: #ff4d4f;
  border-color: #ff4d4f;
}

:deep(.van-tag--warning) {
  color: #ffa000;
  border-color: #ffa000;
}

.view-switch-btn {
  position: fixed;
  bottom: calc(var(--van-tabbar-height) + 16px); /* 距离底部导航栏16px */
  left: 50%;
  transform: translateX(-50%);
  z-index: 99; /* 确保在底部导航栏之下 */
}

.view-switch-btn :deep(.van-button) {
  padding: 8px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  background: var(--primary-color); /* 使用主题色 */
}

.view-switch-btn :deep(.van-button:active) {
  background: var(--primary-dark); /* 点击时使用深色 */
}

.view-switch-btn :deep(.van-button__icon) {
  margin-right: 4px;
  font-size: 16px;
}

.map-view {
  height: calc(100vh - 100px);
}

.price-info {
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
}

/* 价格布局样式 */
.price-grid {
  display: grid;
  gap: 8px;
  padding: 12px 0;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

/* 单个价格时的布局 */
.price-layout-single {
  grid-template-columns: repeat(1, 1fr);
  max-width: 120px;
}

/* 两个价格时的布局 */
.price-layout-row {
  grid-template-columns: repeat(2, 1fr);
}

/* 三个价格时的布局 */
.price-layout-three {
  grid-template-columns: repeat(3, 1fr);
}

/* 4个价格时的布局 */
.price-layout-grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

/* 5个及以上价格时的布局 */
.price-layout-grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.price-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px;
  background: var(--background-color);
  border-radius: 8px;
  text-align: center;
  transition: transform 0.2s;
}

.price-item:hover {
  transform: translateY(-1px);
}

.price-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.price-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.price-more {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--primary-color);
  font-size: 12px;
  padding: 4px 0;
  cursor: pointer;
}

/* 响应式整 */
@media (max-width: 360px) {
  .price-layout-three,
  .price-layout-grid-3 {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .price-value {
    font-size: 14px;
  }
  
  .price-label {
    font-size: 11px;
  }
}

.action-icon {
  font-size: 16px;
  color: var(--primary-color);
  opacity: 0.85;
}

.action-link {
  font-size: 13px;
  color: var(--primary-color);
  text-decoration: none;
  opacity: 0.85;
}

.contact-row,
.address-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  padding: 8px 0;
  cursor: pointer;
  transition: opacity 0.2s;
}

.address-row {
  border-bottom: 1px solid var(--border-color);
}

.contact-row:active,
.address-row:active {
  opacity: 0.6;
}

.address-content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  backdrop-filter: blur(8px);
  border-radius: 16px;
  font-size: 13px;
  z-index: 1;
  border-right: 3px solid transparent;
}

/* 可用状态 - 绿色 */
.status-tag.available {
  background: rgba(7, 193, 96, 0.95);
  border-right: 3px solid #07c160;
}

.status-tag.available .spots-count,
.status-tag.available .spots-text {
  color: #fff;
}

/* 已满状态 - 红色 */
.status-tag.full {
  background: rgba(238, 10, 36, 0.95);
  border-right: 3px solid #ee0a24;
}

.status-tag.full .spots-text {
  color: #fff;
  font-weight: 500;
}

/* 维护状态 - 橙色 */
.status-tag.maintenance {
  background: rgba(255, 151, 106, 0.95);
  border-right: 3px solid #ff976a;
}

.status-tag.maintenance .spots-text {
  color: #fff;
  font-weight: 500;
}

/* 关闭状态 - 灰色 */
.status-tag.closed {
  background: rgba(150, 151, 153, 0.95);
  border-right: 3px solid #969799;
}

.status-tag.closed .spots-text {
  color: #fff;
  font-weight: 500;
}

.spots-count {
  font-weight: 600;
  font-size: 14px;
}

.spots-text {
  font-size: 13px;
}

.status-tag .spots-count,
.status-tag .spots-text {
  color: #fff;
}

.status-tag {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.services {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.service-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.service-tag .van-icon {
  font-size: 14px;
}

/* 代客泊车标签样式 */
.service-tag:has(.van-icon-service) {
  color: #4361ee;
  background: rgba(67, 97, 238, 0.1);
}

/* 装卸货标签样式 */
.service-tag:has(.van-icon-logistics) {
  color: #2ec4b6;
  background: rgba(46, 196, 182, 0.1);
}
</style> 