import { DockOrder, OrderStatus, ServiceType } from '@/types/orders';

export const mockDockOrders: DockOrder[] = [
  {
    // 已请求状态
    id: 'DOCK001',
    orderNo: 'DOCK202403001',
    status: OrderStatus.Requested,
    serviceType: 'dock',
    createdAt: '2024-03-15T09:00:00Z',
    startTime: '2024-03-16T14:00:00Z',
    endTime: '2024-03-16T16:00:00Z',
    totalAmount: 200,
    parkingLot: {
      id: 1,
      name: 'Central Loading Dock',
      address: '123 Logistics Ave, City',
      area: 'D'
    },
    vehicles: [{
      licensePlate: 'TRK1001',
      brand: 'Volvo',
      model: 'FH16',
      color: 'White'
    }],
    driver: {
      name: 'John Smith',
      phone: '(555) 123-4567',
      carrier: 'FastFreight Logistics'
    },
    loadType: 'Container',
    rateType: 'Hourly',
    spotCount: 1,
    duration: '2 hours',
    payment: {
      method: 'Credit Card',
      time: '2024-03-15T09:00:00Z',
      transactionId: 'TXN123456',
      status: 'Pending',
      amount: 200
    },
    cargo: {
      type: 'Electronics',
      poNumber: 'PO123456',
      weight: '10000kg',
      quantity: 1,
      description: 'Container of electronic components'
    }
  },
  {
    // 已预约状态
    id: 'DOCK002',
    orderNo: 'DOCK202403002',
    status: OrderStatus.Scheduled,
    serviceType: 'dock',
    createdAt: '2024-03-15T10:00:00Z',
    startTime: '2024-03-17T09:00:00Z',
    endTime: '2024-03-17T12:00:00Z',
    totalAmount: 300,
    parkingLot: {
      id: 1,
      name: 'Central Loading Dock',
      address: '123 Logistics Ave, City',
      area: 'D'
    },
    vehicles: [{
      licensePlate: 'TRK2002',
      brand: 'Mercedes',
      model: 'Actros',
      color: 'Silver'
    }],
    driver: {
      name: 'Mike Johnson',
      phone: '(555) 234-5678',
      carrier: 'Global Transport Co.'
    },
    loadType: 'Pallets',
    rateType: 'Hourly',
    spotCount: 2,
    duration: '3 hours',
    payment: {
      method: 'Credit Card',
      time: '2024-03-15T10:00:00Z',
      transactionId: 'TXN123457',
      status: 'Paid',
      amount: 300
    },
    cargo: {
      type: 'General Cargo',
      poNumber: 'PO987654',
      weight: '5000kg',
      quantity: 20,
      description: 'Mixed pallets of general merchandise'
    }
  },
  {
    // 已到达状态
    id: 'DOCK003',
    orderNo: 'DOCK202403003',
    status: OrderStatus.Arrived,
    serviceType: 'dock',
    createdAt: '2024-03-15T08:00:00Z',
    startTime: '2024-03-15T13:00:00Z',
    endTime: '2024-03-15T15:00:00Z',
    totalAmount: 250,
    parkingLot: {
      id: 1,
      name: 'Central Loading Dock',
      address: '123 Logistics Ave, City',
      area: 'D'
    },
    vehicles: [{
      licensePlate: 'TRK3003',
      brand: 'Scania',
      model: 'R500',
      color: 'Blue'
    }],
    driver: {
      name: 'David Wilson',
      phone: '(555) 345-6789',
      carrier: 'Express Delivery LLC'
    },
    loadType: 'Bulk',
    rateType: 'Hourly',
    spotCount: 1,
    duration: '2 hours',
    spotNo: 'D001',
    checkInTime: '2024-03-15T12:55:00Z',
    payment: {
      method: 'Credit Card',
      time: '2024-03-15T08:00:00Z',
      transactionId: 'TXN123458',
      status: 'Paid',
      amount: 250
    },
    cargo: {
      type: 'Bulk Materials',
      poNumber: 'PO123789',
      weight: '8000kg',
      quantity: 1,
      description: 'Bulk construction materials'
    }
  },
  {
    // 装卸中状态
    id: 'DOCK004',
    orderNo: 'DOCK202403004',
    status: OrderStatus.InProgress,
    serviceType: 'dock',
    createdAt: '2024-03-15T07:00:00Z',
    startTime: '2024-03-15T11:00:00Z',
    endTime: '2024-03-15T14:00:00Z',
    totalAmount: 350,
    parkingLot: {
      id: 1,
      name: 'Central Loading Dock',
      address: '123 Logistics Ave, City',
      area: 'D'
    },
    vehicles: [{
      licensePlate: 'TRK4004',
      brand: 'MAN',
      model: 'TGX',
      color: 'Red'
    }],
    driver: {
      name: 'Robert Brown',
      phone: '(555) 456-7890',
      carrier: 'Reliable Shipping Inc.'
    },
    loadType: 'Container',
    rateType: 'Hourly',
    spotCount: 1,
    duration: '3 hours',
    spotNo: 'D002',
    checkInTime: '2024-03-15T10:55:00Z',
    payment: {
      method: 'Credit Card',
      time: '2024-03-15T07:00:00Z',
      transactionId: 'TXN123459',
      status: 'Paid',
      amount: 350
    },
    cargo: {
      type: 'Electronics',
      poNumber: 'PO456789',
      weight: '12000kg',
      quantity: 1,
      description: 'Container of electronic equipment'
    }
  },
  {
    // 装卸完成状态
    id: 'DOCK005',
    orderNo: 'DOCK202403005',
    status: OrderStatus.LoadingCompleted,
    serviceType: 'dock',
    createdAt: '2024-03-15T06:00:00Z',
    startTime: '2024-03-15T09:00:00Z',
    endTime: '2024-03-15T12:00:00Z',
    totalAmount: 400,
    parkingLot: {
      id: 1,
      name: 'Central Loading Dock',
      address: '123 Logistics Ave, City',
      area: 'D'
    },
    vehicles: [{
      licensePlate: 'TRK5005',
      brand: 'DAF',
      model: 'XF',
      color: 'Green'
    }],
    driver: {
      name: 'James Wilson',
      phone: '(555) 567-8901',
      carrier: 'Swift Logistics Ltd.'
    },
    loadType: 'Mixed',
    rateType: 'Hourly',
    spotCount: 1,
    duration: '3 hours',
    spotNo: 'D003',
    checkInTime: '2024-03-15T08:55:00Z',
    loadingCompletedTime: '2024-03-15T11:30:00Z',
    payment: {
      method: 'Credit Card',
      time: '2024-03-15T06:00:00Z',
      transactionId: 'TXN123460',
      status: 'Paid',
      amount: 400
    },
    cargo: {
      type: 'Mixed Freight',
      poNumber: 'PO789012',
      weight: '15000kg',
      quantity: 1,
      description: 'Mixed freight including pallets and containers'
    }
  }
]; 