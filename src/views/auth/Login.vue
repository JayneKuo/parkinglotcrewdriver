<template>
  <div class="login-container">
    <div class="login-header">
      <h2>ParkingLotCrew</h2>
    </div>

    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="phone"
          type="tel"
          label="Phone"
          placeholder="Enter phone number"
          maxlength="14"
        >
          <template #prefix>
            <span class="country-code">+1</span>
          </template>
        </van-field>
        <van-field
          v-model="smsCode"
          center
          label="Code"
          placeholder="Enter verification code"
        >
          <template #button>
            <van-button
              size="small"
              type="primary"
              :disabled="isCountingDown"
              @click="sendSmsCode"
            >
              {{ countDownText }}
            </van-button>
          </template>
        </van-field>
      </van-cell-group>

      <div class="submit-btn">
        <van-button round block type="primary" native-type="submit">
          Sign In
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

// 默认填充美国手机号和验证码（包含国际区号）
const phone = ref('(202) 555-0123');  // 美国华盛顿特区格式
const smsCode = ref('123456');
const countdown = ref(60);
const isCountingDown = ref(false);
const countDownText = ref('Get Code');

const sendSmsCode = async () => {
  showToast('Code sent');
  isCountingDown.value = true;
  const timer = setInterval(() => {
    countdown.value--;
    countDownText.value = `${countdown.value}s`;
    if (countdown.value <= 0) {
      clearInterval(timer);
      isCountingDown.value = false;
      countdown.value = 60;
      countDownText.value = 'Get Code';
    }
  }, 1000);
};

const onSubmit = async () => {
  // 模拟登录成功
  const mockUserInfo = {
    id: 1,
    phone: `+1 ${phone.value}`,  // 确保电话号码包含国际区号
    nickname: 'Test User',
    avatar: ''
  };
  
  // 保存token和用户信息
  userStore.setToken('dummy-token');
  userStore.setUserInfo(mockUserInfo);
  
  showToast('Login successful');
  router.push('/home');
};
</script>

<style scoped>
.login-container {
  padding: 20px;
  min-height: 100vh;
  background: var(--background-color);
}

.login-header {
  text-align: center;
  margin: 48px 0;
}

.login-header h2 {
  font-size: 28px;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.submit-btn {
  margin: 24px 16px;
}

:deep(.van-cell) {
  background: var(--surface-color);
}

.country-code {
  color: var(--text-color);
  margin-right: 8px;
  font-weight: 500;
}
</style> 