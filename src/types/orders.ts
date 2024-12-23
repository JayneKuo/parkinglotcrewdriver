export const ServiceType = {
  Parking: 'parking' as const,
  Valet: 'valet' as const,
  Dock: 'dock' as const
};

export type ServiceType = typeof ServiceType[keyof typeof ServiceType];

export enum OrderStatus {
  // 支付相关状态
  PendingPayment = 'PendingPayment',     // 待支付
  PaymentFailed = 'PaymentFailed',       // 支付失败
  
  // 自助停车状态
  AwaitingUse = 'AwaitingUse',          // 待使用
  InUse = 'InUse',                      // 使用中
  Overtime = 'Overtime',                 // 超时
  Used = 'Used',                        // 已使用
  
  // 代客泊车状态
  Reserved = 'Reserved',                 // 已预订
  CheckedIn = 'CheckedIn',              // 已入场
  Parked = 'Parked',                    // 已停放
  Requested = 'Requested',              // 已请求取车
  OnTheWay = 'OnTheWay',                // 取车中
  Ready = 'Ready',                      // 车辆就绪
  
  // 通用状态
  Completed = 'Completed',               // 已完成
  Cancelled = 'Cancelled',               // 已取消
  Expired = 'Expired',                   // 已过期
  
  // 退款相关状态
  RefundRequested = 'RefundRequested',   // 退款申请中
  RefundRejected = 'RefundRejected',     // 退款被拒绝
  Refunded = 'Refunded',                  // 已退款
  
  // 其他状态
  Scheduled = 'Scheduled',
  Arrived = 'Arrived',
  InProgress = 'InProgress',
  LoadingCompleted = 'LoadingCompleted'
}

export const OrderStatusConfig: Record<OrderStatus, {
  text: string;
  type: 'primary' | 'success' | 'warning' | 'danger';
  actions?: string[];
  hint?: string;
}> = {
  // 支付相关状态
  [OrderStatus.PendingPayment]: {
    text: 'Pending Payment',
    type: 'warning',
    actions: ['pay', 'cancel'],
    hint: 'Waiting for payment'
  },
  [OrderStatus.PaymentFailed]: {
    text: 'Payment Failed',
    type: 'danger',
    actions: ['retry-payment', 'cancel'],
    hint: 'Payment failed, please try again'
  },

  // 自助停车状态
  [OrderStatus.AwaitingUse]: {
    text: 'Awaiting Use',
    type: 'primary',
    actions: ['check-in', 'cancel'],
    hint: 'Ready to use'
  },
  [OrderStatus.InUse]: {
    text: 'In Use',
    type: 'primary',
    actions: ['check-out'],
    hint: 'Currently in use'
  },
  [OrderStatus.Overtime]: {
    text: 'Overtime',
    type: 'danger',
    actions: ['pay-overtime'],
    hint: 'Additional fee required'
  },
  [OrderStatus.Used]: {
    text: 'Used',
    type: 'success',
    hint: 'Parking completed'
  },

  // 代客泊车状态
  [OrderStatus.Reserved]: {
    text: 'Reserved',
    type: 'primary',
    actions: ['check-in', 'cancel'],
    hint: 'Valet spot reserved'
  },
  [OrderStatus.CheckedIn]: {
    text: 'Checked In',
    type: 'primary',
    hint: 'Vehicle checked in'
  },
  [OrderStatus.Parked]: {
    text: 'Parked',
    type: 'success',
    actions: ['request-pickup'],
    hint: 'Vehicle safely parked'
  },
  [OrderStatus.Requested]: {
    text: 'Pickup Requested',
    type: 'warning',
    hint: 'Pickup requested'
  },
  [OrderStatus.OnTheWay]: {
    text: 'On The Way',
    type: 'warning',
    hint: 'Vehicle being retrieved'
  },
  [OrderStatus.Ready]: {
    text: 'Ready',
    type: 'success',
    actions: ['confirm-pickup'],
    hint: 'Vehicle ready for pickup'
  },

  // 通用状态
  [OrderStatus.Completed]: {
    text: 'Completed',
    type: 'success',
    actions: ['request-refund']
  },
  [OrderStatus.Cancelled]: {
    text: 'Cancelled',
    type: 'danger'
  },
  [OrderStatus.Expired]: {
    text: 'Expired',
    type: 'danger'
  },

  // 退款相关状态
  [OrderStatus.RefundRequested]: {
    text: 'Refund Requested',
    type: 'warning',
    actions: ['cancel-refund'],
    hint: 'Processing refund request'
  },
  [OrderStatus.RefundRejected]: {
    text: 'Refund Rejected',
    type: 'danger',
    actions: ['view-reason']
  },
  [OrderStatus.Refunded]: {
    text: 'Refunded',
    type: 'success'
  },

  // 其他状态
  [OrderStatus.Scheduled]: {
    text: 'Scheduled',
    type: 'primary',
    hint: 'Vehicle scheduled for pickup'
  },
  [OrderStatus.Arrived]: {
    text: 'Arrived',
    type: 'success',
    hint: 'Vehicle arrived at pickup location'
  },
  [OrderStatus.InProgress]: {
    text: 'In Progress',
    type: 'warning',
    hint: 'Vehicle pickup in progress'
  },
  [OrderStatus.LoadingCompleted]: {
    text: 'Loading Completed',
    type: 'success',
    hint: 'Vehicle pickup completed'
  }
};

export const OrderActionConfig: Record<string, {
  text: string;
  type: 'primary' | 'default';
  handler: string;
}> = {
  'pay': {
    text: 'Pay Now',
    type: 'primary',
    handler: 'handlePayment'
  },
  'retry-payment': {
    text: 'Retry Payment',
    type: 'primary',
    handler: 'handleRetryPayment'
  },
  'cancel': {
    text: 'Cancel Order',
    type: 'default',
    handler: 'handleCancel'
  },
  'check-in': {
    text: 'Check In',
    type: 'primary',
    handler: 'handleCheckIn'
  },
  'check-out': {
    text: 'Check Out',
    type: 'primary',
    handler: 'handleCheckOut'
  },
  'pay-overtime': {
    text: 'Pay Overtime Fee',
    type: 'primary',
    handler: 'handleOvertimePayment'
  },
  'request-refund': {
    text: 'Request Refund',
    type: 'primary',
    handler: 'handleRefundRequest'
  },
  'cancel-refund': {
    text: 'Cancel Refund',
    type: 'default',
    handler: 'handleCancelRefund'
  },
  'view-reason': {
    text: 'View Reason',
    type: 'default',
    handler: 'showRefundFailReason'
  },
  'request-pickup': {
    text: 'Request Pickup',
    type: 'primary',
    handler: 'handleRequestPickup'
  },
  'confirm-pickup': {
    text: 'Confirm Pickup',
    type: 'primary',
    handler: 'handleConfirmPickup'
  },
  'modify-request': {
    text: 'Modify Request',
    type: 'primary',
    handler: 'handleModifyRequest'
  },
  'cancel-request': {
    text: 'Cancel Request',
    type: 'default',
    handler: 'handleCancelRequest'
  },
  'modify-appointment': {
    text: 'Modify Appointment',
    type: 'primary',
    handler: 'handleModifyAppointment'
  },
  'cancel-appointment': {
    text: 'Cancel Appointment',
    type: 'default',
    handler: 'handleCancelAppointment'
  }
};

export interface OrderBase {
  id: string | number;
  orderNo: string;
  status: OrderStatus;
  serviceType: ServiceType;
  createdAt: string;
  startTime: string;
  endTime?: string;
  totalAmount: number;
  spotNo?: string;
  customer?: {
    name: string;
    phone: string;
    email: string;
  };
  parkingLot: {
    id: number;
    name: string;
    address: string;
    area: string;
  };
  vehicles: Array<{
    licensePlate: string;
    brand?: string;
    model?: string;
    color?: string;
  }>;
  payment: {
    method: string;
    time: string;
    transactionId: string;
    status: string;
    amount: number;
  };
  pricing?: {
    parkingFee?: number;
    serviceFee?: number;
    tax?: number;
    totalAmount: number;
  };
  checkInTime?: string;
  checkOutTime?: string;
}

export interface ParkingOrder extends OrderBase {
  serviceType: ServiceType.Parking;
  spotType?: string;
  reservedStartTime?: string;
  reservedEndTime?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface ValetOrder extends OrderBase {
  serviceType: 'valet';
  status: ValetOrderStatus;
  driver: {
    name: string;
    phone: string;
  };
  vehicles: Array<{
    licensePlate: string;
    brand: string;
    model: string;
    color: string;
  }>;
  valet?: {
    name: string;
    phone: string;
    status: string;
    assignedTime: string;
  };
  spotType: string;
  rateType: string;
  rate: number;
  spotCount: number;
  spotNo?: string;
  checkInTime?: string;
  parkedTime?: string;
  requestTime?: string;
  checkOutTime?: string;
  duration?: number;
  vehiclePhotos?: Array<{
    url: string;
    type: 'front' | 'back' | 'left' | 'right' | 'dashboard' | 'detail' | 'parked';
  }>;
  parkedPhoto?: string;
  payment?: {
    amount: number;
    method: string;
    transactionId: string;
    time: string;
  };
}

export interface DockOrder extends OrderBase {
  serviceType: 'dock';
  status: OrderStatus;
  loadType: string;
  rateType: string;
  spotCount: number;
  duration: string;
  driver: {
    name: string;
    phone: string;
    carrier: string;
  };
  cargo?: {
    type: string;
    poNumber: string;
    weight: string;
    quantity: number;
    description?: string;
  };
  checkInTime?: string;
  checkOutTime?: string;
  loadingCompletedTime?: string;
}

export type Order = ParkingOrder | ValetOrder | DockOrder;

// 添加订单详情接口
export interface OrderDetail {
  id: string | number;
  orderNo: string;
  status: string;
  serviceType: string;
  createdAt: string;
  startTime: string;
  endTime?: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  parkingLot: {
    name: string;
    address: string;
    area: string;
  };
  vehicles: Array<{
    licensePlate: string;
    brand?: string;
    model?: string;
    color?: string;
  }>;
  spotNo?: string;
  payment: {
    method: string;
    time: string;
    transactionId: string;
    status: string;
    amount: number;
  };
  parkingFee: number;
  serviceFee: number;
  tax: number;
  totalAmount: number;
  timeline: Array<{
    time: string;
    status: string;
    description: string;
  }>;
  actions: string[];
} 

export interface DockOrderDetail extends OrderDetail {
  driver: {
    name: string;
    phone: string;
    carrier: string;
  };
  loadType: string;
  rateType: string;
  spotCount: number;
  duration: string;
  cargo?: {
    type: string;
    poNumber: string;
    weight: string;
    quantity: number;
    description?: string;
  };
  checkInTime?: string;
  checkOutTime?: string;
  loadingCompletedTime?: string;
} 

export type DockStatus = Extract<OrderStatus, 
  | OrderStatus.Requested
  | OrderStatus.Scheduled
  | OrderStatus.Arrived
  | OrderStatus.InProgress
  | OrderStatus.LoadingCompleted
  | OrderStatus.Completed
  | OrderStatus.Cancelled
>; 

export interface Vehicle {
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
}

export interface Driver {
  name: string;
  phone: string;
}

export interface Valet {
  name: string;
  phone: string;
  status: string;
  assignedTime: string;
}

export interface ParkingLot {
  name: string;
  address: string;
  area: string;
}

export interface VehiclePhoto {
  url: string;
  type: string;
}

export interface Payment {
  amount: number;
  method: string;
  transactionId: string;
  time: string;
}

export interface Order {
  id: string | number;
  orderNo: string;
  status: OrderStatus;
  createdAt: string;
  driver: Driver;
  vehicles: Vehicle[];
  valet?: Valet;
  parkingLot: ParkingLot;
  spotType: string;
  rateType: string;
  rate: number;
  spotCount: number;
  startTime: string;
  spotNo?: string;
  checkInTime?: string;
  parkedTime?: string;
  requestTime?: string;
  checkOutTime?: string;
  duration?: number;
  vehiclePhotos?: VehiclePhoto[];
  parkedPhoto?: string;
  serviceFee: number;
  tax: number;
  totalAmount: number;
  payment?: Payment;
} 

// Valet 订单状态
export enum ValetOrderStatus {
  Reserved = 'Reserved',         // 预订成功
  CheckedIn = 'CheckedIn',      // 已到达停车场
  Pending = 'Pending',          // 待泊车
  Parked = 'Parked',           // 已泊车
  Requested = 'Requested',      // 取车请求中
  OnTheWay = 'OnTheWay',       // 车辆送回中
  Ready = 'Ready',             // 待支付
  Paid = 'Paid',              // 已支付
  Closed = 'Closed',          // 订单已完成
  Cancelled = 'Cancelled'     // 已取消
}

// Valet 订单操作配置
export const ValetOrderActions: Record<ValetOrderStatus, string[]> = {
  [ValetOrderStatus.Reserved]: ['cancel-reservation', 'check-in'],
  [ValetOrderStatus.CheckedIn]: [],
  [ValetOrderStatus.Pending]: [],
  [ValetOrderStatus.Parked]: ['request-vehicle'],
  [ValetOrderStatus.Requested]: ['pay-now'],
  [ValetOrderStatus.OnTheWay]: [],
  [ValetOrderStatus.Ready]: ['pay-now'],
  [ValetOrderStatus.Paid]: [],
  [ValetOrderStatus.Closed]: [],
  [ValetOrderStatus.Cancelled]: []
};

// 操作按钮配置
export const ValetActionConfig: Record<string, {
  text: string;
  type: 'primary' | 'default';
  handler: string;
}> = {
  'cancel-reservation': {
    text: 'Cancel Reservation',
    type: 'default',
    handler: 'handleCancelReservation'
  },
  'check-in': {
    text: 'Check In',
    type: 'primary',
    handler: 'handleCheckIn'
  },
  'request-vehicle': {
    text: 'Request Vehicle',
    type: 'primary',
    handler: 'handleRequestVehicle'
  },
  'pay-now': {
    text: 'Pay Now',
    type: 'primary',
    handler: 'handlePayNow'
  }
}; 

// Valet 状态颜色配置
export const ValetStatusConfig: Record<ValetOrderStatus, {
  text: string;
  type: 'primary' | 'success' | 'warning' | 'danger';
  hint?: string;
}> = {
  [ValetOrderStatus.Reserved]: {
    text: 'Reserved',
    type: 'primary',
    hint: 'Valet spot reserved'
  },
  [ValetOrderStatus.CheckedIn]: {
    text: 'Checked In',
    type: 'primary',
    hint: 'Vehicle checked in'
  },
  [ValetOrderStatus.Pending]: {
    text: 'Pending',
    type: 'warning',
    hint: 'Waiting for valet'
  },
  [ValetOrderStatus.Parked]: {
    text: 'Parked',
    type: 'success',
    hint: 'Vehicle safely parked'
  },
  [ValetOrderStatus.Requested]: {
    text: 'Requested',
    type: 'warning',
    hint: 'Pickup requested'
  },
  [ValetOrderStatus.OnTheWay]: {
    text: 'On The Way',
    type: 'warning',
    hint: 'Vehicle being retrieved'
  },
  [ValetOrderStatus.Ready]: {
    text: 'Ready',
    type: 'success',
    hint: 'Ready for pickup'
  },
  [ValetOrderStatus.Paid]: {
    text: 'Paid',
    type: 'success',
    hint: 'Payment completed'
  },
  [ValetOrderStatus.Closed]: {
    text: 'Closed',
    type: 'success',
    hint: 'Order completed'
  },
  [ValetOrderStatus.Cancelled]: {
    text: 'Cancelled',
    type: 'danger',
    hint: 'Order cancelled'
  }
}; 