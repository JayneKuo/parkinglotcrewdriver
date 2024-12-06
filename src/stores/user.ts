import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<{
    id?: number;
    phone?: string;
    nickname?: string;
    avatar?: string;
  }>({});

  const token = ref(localStorage.getItem('token') || '');

  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  };

  const setUserInfo = (info: typeof userInfo.value) => {
    userInfo.value = info;
  };

  const logout = () => {
    token.value = '';
    userInfo.value = {};
    localStorage.removeItem('token');
  };

  return {
    userInfo,
    token,
    setToken,
    setUserInfo,
    logout,
  };
}); 