import type { Order, OrderDetail, DockOrderDetail } from '@/types/orders';
import { OrderStatus, DockStatus } from '@/types/orders';

interface DetailInfo {
  valet: {
    [key: string]: {
      timeline: Array<{ time: string; status: string; description: string }>;
      actions: string[];
      additionalInfo?: any;
    };
  };
  parking: {
    [key: string]: {
      timeline: Array<{ time: string; status: string; description: string }>;
      actions: string[];
      additionalInfo?: any;
    };
  };
  dock: {
    [key: string]: {
      timeline: Array<{ time: string; status: string; description: string }>;
      actions: string[];
      additionalInfo?: any;
    };
  };
}

// 定义每个状态对应的详情信息
const detailInfo: DetailInfo = {
  valet: {
    Reserved: {
      timeline: [
        { time: 'Now', status: 'Reserved', description: 'Valet service reserved' }
      ],
      actions: ['Cancel Reservation', 'Modify Time']
    },
    CheckedIn: {
      timeline: [
        { time: '-30m', status: 'Reserved', description: 'Valet service reserved' },
        { time: 'Now', status: 'CheckedIn', description: 'Vehicle checked in' }
      ],
      actions: ['View Valet Info']
    },
    // ... 其他 valet 状态
  },
  parking: {
    PendingPayment: {
      timeline: [
        { time: 'Now', status: 'PendingPayment', description: 'Waiting for payment' }
      ],
      actions: ['Pay Now', 'Cancel']
    },
    AwaitingUse: {
      timeline: [
        { time: '-5m', status: 'PendingPayment', description: 'Payment completed' },
        { time: 'Now', status: 'AwaitingUse', description: 'Ready to use' }
      ],
      actions: ['View QR Code', 'Cancel']
    },
    // ... 其他 parking 状态
  },
  dock: {
    Requested: {
      timeline: [
        { time: 'Now', status: 'Requested', description: 'Loading dock requested' }
      ],
      actions: ['Cancel Request']
    },
    Scheduled: {
      timeline: [
        { time: '-30m', status: 'Requested', description: 'Loading dock requested' },
        { time: 'Now', status: 'Scheduled', description: 'Loading dock scheduled' }
      ],
      actions: ['View Schedule', 'Modify Time', 'Cancel']
    },
    // ... 其他 dock 状态
  }
};

// 修改生成详情数据的函数
export function generateOrderDetail(order: Order): OrderDetail | DockOrderDetail {
  if (order.serviceType === 'dock') {
    const dockOrder = order as DockOrder;
    const dockDetail: DockOrderDetail = {
      // 基础信息
      id: order.id,
      orderNo: order.orderNo,
      status: order.status,
      serviceType: order.serviceType,
      createdAt: order.createdAt,
      startTime: order.startTime,
      endTime: order.endTime,

      // 客户信息
      customer: {
        name: 'John Doe', // 默认值
        phone: '+1 (555) 123-4567',
        email: 'john@example.com'
      },

      // 车辆信息
      vehicles: order.vehicles,
      parkingLot: order.parkingLot,

      // Dock 特有信息
      driver: {
        name: (dockOrder.driver && dockOrder.driver.name) || '-',
        phone: (dockOrder.driver && dockOrder.driver.phone) || '-',
        carrier: (dockOrder.driver && dockOrder.driver.carrier) || '-'
      },

      loadType: 'Container',
      rateType: 'Hourly',
      spotCount: 1,
      duration: '2 hours',
      spotNo: ['Arrived', 'InProgress', 'LoadingCompleted', 'Completed'].includes(order.status) ? 
        order.spotNo : undefined,

      // 货物信息
      cargo: ['Scheduled', 'Arrived', 'InProgress', 'LoadingCompleted', 'Completed'].includes(order.status) ? {
        type: 'General',
        poNumber: 'PO123456',
        weight: '1000kg',
        quantity: 100,
        description: 'General cargo description'
      } : undefined,

      // 费用信息
      parkingFee: order.totalAmount * 0.8,
      serviceFee: order.totalAmount * 0.15,
      tax: order.totalAmount * 0.05,
      totalAmount: order.totalAmount,

      // 支付信息
      payment: {
        method: order.payment?.method || 'Credit Card',
        time: order.payment?.time || order.createdAt,
        transactionId: order.payment?.transactionId || `TXN${Date.now()}`,
        status: ['Completed'].includes(order.status) ? 'Paid' : 'Pending',
        amount: order.totalAmount
      },

      // 时间信息
      checkInTime: ['Arrived', 'InProgress', 'LoadingCompleted', 'Completed'].includes(order.status) ? 
        order.checkInTime : undefined,
      checkOutTime: ['Completed'].includes(order.status) ? 
        order.checkOutTime : undefined,

      // 时间线和操作
      timeline: getOrderTimeline(dockOrder),
      actions: getOrderActions(dockOrder.status)
    };

    return dockDetail;
  }

  // 处理其他类型订单
  return generateDefaultOrderDetail(order);
}

// 添加默认订单处理函数
function generateDefaultOrderDetail(order: Order): OrderDetail {
  // ... 处理其他类型订单的逻辑
  return {} as OrderDetail; // 临时返回空对象
}

// 修改时间格式化函数
function formatTime(time: string | Date): string {
  const date = time instanceof Date ? time : new Date(time);
  return date.toLocaleString();
}

// 修改时间线生成函数
function getOrderTimeline(order: DockOrder) {
  const timeline = [];
  const now = new Date();

  switch (order.status) {
    case OrderStatus.Requested:
      timeline.push({
        time: formatTime(order.createdAt),
        status: OrderStatus.Requested,
        description: 'Dock loading request submitted'
      });
      break;

    case OrderStatus.Scheduled:
      timeline.push({
        time: formatTime(order.createdAt),
        status: OrderStatus.Requested,
        description: 'Dock loading request submitted'
      }, {
        time: formatTime(order.startTime),
        status: OrderStatus.Scheduled,
        description: 'Loading dock scheduled'
      });
      break;

    case OrderStatus.Arrived:
      timeline.push({
        time: formatTime(order.createdAt),
        status: OrderStatus.Requested,
        description: 'Dock loading request submitted'
      }, {
        time: formatTime(order.checkInTime || now),
        status: OrderStatus.Arrived,
        description: 'Vehicle arrived at dock'
      });
      break;

    case OrderStatus.InProgress:
      // ... 添加装卸进行中状态
      break;

    case OrderStatus.LoadingCompleted:
      // ... 添加装卸完成状态
      break;

    // ... 其他状态
  }

  return timeline;
}

// 修改操作获取函数
function getOrderActions(status: DockStatus): string[] {
  const actionMap: Record<DockStatus, string[]> = {
    [OrderStatus.Requested]: ['modify-request', 'cancel-request'],
    [OrderStatus.Scheduled]: ['modify-appointment', 'cancel-appointment', 'check-in'],
    [OrderStatus.Arrived]: [],
    [OrderStatus.InProgress]: [],
    [OrderStatus.LoadingCompleted]: [],
    [OrderStatus.PaymentPending]: ['retry-payment'],
    [OrderStatus.Completed]: ['check-out'],
    [OrderStatus.Cancelled]: []
  };

  return actionMap[status] || [];
} 