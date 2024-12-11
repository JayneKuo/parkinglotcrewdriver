import type { ValetStatus, ParkingStatus, DockStatus } from './orders';

// 状态样式类型
export type StatusType = 'pending' | 'warning' | 'primary' | 'success' | 'danger' | 'processing' | 'default';

// 状态配置接口
interface StatusConfig {
  text: string;
  type: StatusType;
  hint?: string;
}

// 状态分组配置
export const StatusGroups: Record<string, readonly string[]> = {
  pending: [
    'Pending',
    'AwaitingUse',
    'Scheduled',
  ] as const,
  warning: [
    'PendingPayment',
    'PaymentPending',
  ],
  primary: [
    'InUse',
    'InProgress',
    'Parked',
    'CheckedIn',
    'Arrived',
    'Reserved',
    'Requested',
    'OnTheWay',
  ],
  success: [
    'Completed',
    'Closed',
    'Used',
    'Ready',
    'Paid',
    'LoadingCompleted',
    'Refunded',
  ],
  danger: [
    'Cancelled',
    'Expired',
    'PaymentFailed',
    'RefundFailed',
    'Overtime',
  ],
  processing: [
    'RefundRequested',
    'ProcessingRefund',
  ]
} as const;

// 获取状态类型
export function getStatusType(status: string): StatusType {
  for (const [type, statuses] of Object.entries(StatusGroups)) {
    if ((statuses as readonly string[]).includes(status)) {
      return type as StatusType;
    }
  }
  return 'default';
}

// 获取状态文本
export function getStatusText(status: string): string {
  return status.replace(/([A-Z])/g, ' $1').trim();
}

// 获取状态提示
export function getStatusHint(status: ValetStatus | ParkingStatus | DockStatus): string {
  const hints: Record<string, string> = {
    PendingPayment: 'Please complete payment within 15 minutes',
    PaymentFailed: 'Payment failed, please try again',
    AwaitingUse: 'Your parking spot is reserved and ready',
    InUse: 'Service in progress, extend time if needed',
    Overtime: 'Please pay immediately to avoid legal liability',
    RefundRequested: 'Processing refund request',
    Reserved: 'Valet spot reserved',
    CheckedIn: 'Vehicle checked in',
    Parked: 'Vehicle safely parked, extend time if needed',
    Requested: 'Pickup requested',
    OnTheWay: 'Vehicle being retrieved',
    Ready: 'Vehicle ready for pickup',
    InProgress: 'Loading service in progress, extend time if needed'
  };
  return hints[status] || '';
}

// 状态样式配置
export const StatusStyles = {
  pending: { background: '#9c27b0', color: '#fff' },     // 紫色 - 等待中
  warning: { background: '#ff9f1c', color: '#fff' },     // 橙色 - 待支付
  primary: { background: '#4361ee', color: '#fff' },     // 蓝色 - 进行中
  success: { background: '#2ec4b6', color: '#fff' },     // 绿色 - 完成
  danger: { background: '#e71d36', color: '#fff' },      // 红色 - 异常
  processing: { background: '#5e35b1', color: '#fff' },  // 蓝紫色 - 处理中
  default: { background: '#666', color: '#fff' }         // 灰色 - 默认
}; 