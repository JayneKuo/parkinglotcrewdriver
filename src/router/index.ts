import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'
import ValetOrderDetail from '@/views/orders/ValetOrderDetail.vue';
import ParkingOrderDetail from '@/views/orders/ParkingOrderDetail.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        redirect: '/home'
      },
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/ParkingList.vue')
      },
      {
        path: 'parking/:id',
        name: 'ParkingDetail',
        component: () => import('@/views/parking/ParkingDetail.vue'),
        meta: {
          hideTabbar: true
        }
      },
      {
        path: '/parking/:id/reserve',
        name: 'ParkingReserve',
        component: () => import('@/views/parking/ParkingReserve.vue'),
        meta: {
          hideTabbar: true
        }
      },
      {
        path: '/parking/:id/vehicle',
        name: 'VehicleInfo',
        component: () => import('@/views/parking/VehicleInfo.vue'),
        meta: {
          hideTabbar: true
        }
      },
      {
        path: '/parking/:id/confirm',
        name: 'OrderConfirm',
        component: () => import('@/views/parking/OrderConfirm.vue'),
        meta: {
          hideTabbar: true
        }
      },
      {
        path: '/parking-orders',
        name: 'OrderList',
        component: () => import('@/views/orders/OrderList.vue')
      },
      {
        path: '/parking-orders/:id',
        name: 'ParkingOrderDetail',
        component: ParkingOrderDetail,
        props: true,
        meta: {
          hideTabbar: true
        }
      },
      {
        path: '/orders/:id',
        name: 'OrderDetail',
        component: () => import('@/views/orders/OrderDetail.vue'),
        props: true,
        meta: {
          hideTabbar: true
        }
      },
      {
        path: '/records',
        name: 'Records',
        component: () => import('@/views/records/RecordList.vue')
      },
      {
        path: '/parking/:id/dock-confirm',
        name: 'DockConfirm',
        component: () => import('@/views/parking/DockConfirm.vue'),
        meta: {
          hideTabbar: true
        }
      },
      {
        path: '/valet-orders/:id',
        name: 'ValetOrderDetail',
        component: ValetOrderDetail,
        props: true,
        meta: {
          hideTabbar: true
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 