<template>
  <div class="order-confirm">
    <van-nav-bar
      title="CONFIRM BOOKING"
      left-arrow
      @click-left="router.back()"
      class="custom-nav"
    />

    <div class="content">
      <!-- Booking Summary -->
      <div class="section">
        <h2 class="section-title">BOOKING SUMMARY</h2>
        <div class="info-card">
          <div class="info-row">
            <span>Load Type</span>
            <span>{{ route.query.loadType === 'inbound' ? 'Inbound Loading' : 'Outbound Loading' }}</span>
          </div>
          <div class="info-row">
            <span>Start Time</span>
            <span>{{ formatTime(String(route.query.startTime)) }}</span>
          </div>
          <div class="info-row">
            <span>Duration</span>
            <span>{{ route.query.duration }} {{ route.query.unit }}(s)</span>
          </div>
        </div>
      </div>

      <!-- Driver Information -->
      <div class="section">
        <h2 class="section-title">DRIVER INFORMATION</h2>
        <div class="info-card">
          <div class="info-row">
            <span>Carrier</span>
            <span>{{ route.query.carrier }}</span>
          </div>
          <div class="info-row">
            <span>Driver Name</span>
            <span>{{ route.query.driverName }}</span>
          </div>
          <div class="info-row">
            <span>Driver Phone</span>
            <span>{{ route.query.driverPhone }}</span>
          </div>
          <div class="info-row">
            <span>Vehicle Plate</span>
            <span>{{ route.query.vehiclePlate }}</span>
          </div>
        </div>
      </div>

      <!-- Cargo Information -->
      <div class="section">
        <h2 class="section-title">CARGO INFORMATION</h2>
        <div class="info-card">
          <div class="info-row">
            <span>Cargo Type</span>
            <span>{{ route.query.cargoType }}</span>
          </div>
          <div class="info-row" v-if="route.query.containerNumber">
            <span>Container No.</span>
            <span>{{ route.query.containerNumber }}</span>
          </div>
          <div class="info-row" v-if="route.query.poNumber">
            <span>PO No.</span>
            <span>{{ route.query.poNumber }}</span>
          </div>
          <div class="info-row">
            <span>Weight</span>
            <span>{{ route.query.weight }} kg</span>
          </div>
          <div class="info-row">
            <span>Quantity</span>
            <span>{{ route.query.quantity }}</span>
          </div>
          <div class="info-row" v-if="route.query.description">
            <span>Description</span>
            <span>{{ route.query.description }}</span>
          </div>
        </div>
      </div>

      <!-- Terms & Conditions -->
      <div class="terms-section">
        <van-checkbox v-model="agreedToTerms" shape="square" icon-size="16px">
          I agree to the <span class="terms-link">Terms & Conditions</span>
        </van-checkbox>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="bottom-bar">
      <div class="price-info">
        <span class="price-label">Total Price</span>
        <span class="price-value">${{ calculateTotal }}</span>
      </div>
      <van-button 
        block 
        type="primary"
        class="submit-btn"
        :disabled="!agreedToTerms"
        :loading="submitting"
        @click="handleSubmit"
      >
        Confirm & Pay
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { formatTime } from '@/utils/format';

const route = useRoute();
const router = useRouter();
const submitting = ref(false);
const agreedToTerms = ref(false);

// 计算总价
const calculateTotal = computed(() => {
  const duration = Number(route.query.duration) || 0;
  const basePrice = 50; // 基础价格
  return (basePrice * duration).toFixed(2);
});

const handleSubmit = async () => {
  if (!agreedToTerms.value) {
    showToast('Please agree to the terms and conditions');
    return;
  }

  submitting.value = true;
  try {
    // TODO: 调用支付API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 生成订单ID
    const orderId = `DOCK${Date.now()}`;
    
    // 跳转到订单详情页
    router.push({
      path: `/orders/${orderId}`,
      query: {
        ...route.query,
        status: 'confirmed',
        paymentStatus: 'paid',
        totalAmount: calculateTotal.value
      }
    });
  } catch (error) {
    showToast('Payment failed');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.order-confirm {
  min-height: 100vh;
  background: #1a1a1a;
  color: #fff;
  padding-bottom: 120px;
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

.terms-section {
  margin-top: 32px;
}

:deep(.van-checkbox__label) {
  color: #fff;
  font-size: 14px;
}

.terms-link {
  color: #7c4dff;
  text-decoration: underline;
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

.price-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.price-label {
  font-size: 14px;
  color: #666;
}

.price-value {
  font-size: 20px;
  font-weight: 600;
  color: #7c4dff;
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