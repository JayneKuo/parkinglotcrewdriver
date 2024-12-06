import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'

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
        component: () => import('@/views/parking/ParkingDetail.vue')
      },
      {
        path: '/parking/:id/reserve',
        name: 'ParkingReserve',
        component: () => import('@/views/parking/ParkingReserve.vue')
      },
      {
        path: '/parking/:id/vehicle',
        name: 'VehicleInfo',
        component: () => import('@/views/parking/VehicleInfo.vue')
      },
      {
        path: '/parking/:id/confirm',
        name: 'OrderConfirm',
        component: () => import('@/views/parking/OrderConfirm.vue')
      },
      {
        path: '/parking-orders',
        name: 'OrderList',
        component: () => import('@/views/orders/OrderList.vue')
      },
      {
        path: '/parking-orders/:id',
        name: 'ParkingOrderDetail',
        component: () => import('@/views/orders/ParkingOrderDetail.vue'),
        meta: {
          title: 'Order Details'
        }
      },
      {
        path: '/orders/:id',
        name: 'OrderDetail',
        component: () => import('@/views/orders/OrderDetail.vue')
      },
      {
        path: '/records',
        name: 'Records',
        component: () => import('@/views/records/RecordList.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router 