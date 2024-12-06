export enum ServiceType {
  Parking = 'parking',  // 自助停车
  Valet = 'valet'      // 代客泊车
}

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
  Refunded = 'Refunded'                  // 已退款
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
  }
};

export interface OrderBase {
  id: string;
  orderNo: string;
  status: OrderStatus;
  serviceType: ServiceType;
  createdAt: string;
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
  payment?: {
    method: string;
    time: string;
    transactionId: string;
  };
  refundInfo?: {
    requestTime?: string;
    reason?: string;
    status?: string;
    amount?: number;
    failReason?: string;
  };
}

export interface ParkingOrder extends OrderBase {
  serviceType: ServiceType.Parking;
  spotType: string;
  spotNo: string;
  reservedStartTime: string;
  reservedEndTime: string;
  checkInTime?: string;
  checkOutTime?: string;
  pricing: {
    rateType: string;
    rateAmount: number;
    rateUnit: string;
    parkingFee: number;
    serviceFee?: number;
    overtimeFee?: number;
    tax?: number;
    totalAmount: number;
  };
}

export interface ValetOrder extends OrderBase {
  serviceType: ServiceType.Valet;
  valetInfo: {
    valetId?: string;
    valetName?: string;
    pickupLocation?: string;
    returnLocation?: string;
    notes?: string;
  };
  pricing: {
    serviceFee: number;
    tax?: number;
    totalAmount: number;
  };
}

export type Order = ParkingOrder | ValetOrder; 