import type { ParkingLot } from '@/types/parking';
import { ServiceType } from '@/types/orders';

// 停车场图片配置
export const PARKING_IMAGES = [
  'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800',  // 室内停车场
  'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800',  // 室外停车场
  'https://images.unsplash.com/photo-1587955202409-26dda99f6b15?w=800',  // 立体车库
  'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800',  // 码头停车
  'https://images.unsplash.com/photo-1579454341360-0c5435836ddb?w=800'   // 豪华停车场
];

// 模拟数据
export const mockParkingLots: ParkingLot[] = [
  {
    id: 1,
    name: 'Central Business Parking',
    mainImage: PARKING_IMAGES[0],
    gallery: [PARKING_IMAGES[1], PARKING_IMAGES[2]],
    address: '123 Main Street, Downtown',
    distance: 0.5,
    spots: [
      { type: 'car', available: 25, total: 50 },
      { type: 'ev', available: 5, total: 10 }
    ],
    prices: [
      { type: 'hour', label: 'Hourly Rate', value: 5 },
      { type: 'day', label: 'Daily Rate', value: 25 },
      { type: 'month', label: 'Monthly Pass', value: 300 }
    ],
    rating: 4.5,
    ratingCount: 128,
    status: 'available',
    serviceTypes: [ServiceType.Parking, ServiceType.Valet, ServiceType.Dock],
    description: 'Premium parking facility in the heart of downtown',
    amenities: [
      { type: 'security', name: '24/7 Security', icon: 'shield-o' },
      { type: 'camera', name: 'CCTV Coverage', icon: 'video-o' },
      { type: 'elevator', name: 'Elevator Access', icon: 'ascending' },
      { type: 'charging', name: 'EV Charging', icon: 'flash' }
    ],
    contact: {
      name: 'John Manager',
      phone: '+1 (555) 123-4567',
      email: 'central@parking.com'
    },
    isReservable: true,
    latitude: 34.052235,
    longitude: -118.243683
  },
  {
    id: 2,
    name: 'Harbor Dock Parking',
    mainImage: PARKING_IMAGES[3],
    gallery: [PARKING_IMAGES[4]],
    address: '789 Harbor Drive',
    distance: 2.3,
    spots: [
      { type: 'truck', available: 0, total: 20 },
      { type: 'car', available: 15, total: 30 }
    ],
    prices: [
      { type: 'hour', label: 'Hourly Rate', value: 8 },
      { type: 'day', label: 'Daily Rate', value: 40 }
    ],
    rating: 4.2,
    ratingCount: 86,
    status: 'full',
    serviceTypes: [ServiceType.Parking, ServiceType.Dock],
    description: 'Spacious dock parking with loading facilities',
    amenities: [
      { type: 'loading', name: 'Loading Dock', icon: 'logistics' },
      { type: 'security', name: 'Security', icon: 'shield-o' },
      { type: 'warehouse', name: 'Warehouse Access', icon: 'shop-o' }
    ],
    contact: {
      name: 'Mike Harbor',
      phone: '+1 (555) 987-6543',
      email: 'harbor@parking.com'
    },
    isReservable: true,
    latitude: 34.052235,
    longitude: -118.243683
  },
  {
    id: 3,
    name: 'Luxury Hotel Valet',
    mainImage: PARKING_IMAGES[4],
    gallery: [PARKING_IMAGES[0]],
    address: '456 Luxury Avenue',
    distance: 1.1,
    spots: [
      { type: 'car', available: 12, total: 40 }
    ],
    prices: [
      { type: 'hour', label: 'Hourly Rate', value: 15 },
      { type: 'day', label: 'Daily Rate', value: 60 }
    ],
    rating: 4.8,
    ratingCount: 230,
    status: 'available',
    serviceTypes: [ServiceType.Parking, ServiceType.Valet],
    description: 'Premium valet parking service at luxury hotel',
    amenities: [
      { type: 'valet', name: '24/7 Valet', icon: 'service' },
      { type: 'security', name: 'Premium Security', icon: 'shield-o' },
      { type: 'carwash', name: 'Car Wash', icon: 'water' }
    ],
    contact: {
      name: 'Sarah Elite',
      phone: '+1 (555) 234-5678',
      email: 'luxury@parking.com'
    },
    isReservable: true,
    latitude: 34.052235,
    longitude: -118.243683
  },
  {
    id: 4,
    name: 'Metro Station Parking',
    mainImage: PARKING_IMAGES[1],
    address: '321 Station Road',
    distance: 0.8,
    spots: [
      { type: 'car', available: 0, total: 100 }
    ],
    prices: [
      { type: 'hour', label: 'Hourly Rate', value: 3 },
      { type: 'day', label: 'Daily Rate', value: 15 },
      { type: 'month', label: 'Monthly Pass', value: 150 }
    ],
    rating: 4.0,
    ratingCount: 450,
    status: 'maintenance',
    serviceTypes: [ServiceType.Parking],
    description: 'Convenient parking near metro station',
    amenities: [
      { type: 'security', name: 'Security', icon: 'shield-o' },
      { type: 'elevator', name: 'Elevator', icon: 'ascending' }
    ],
    contact: {
      name: 'Metro Parking',
      phone: '+1 (555) 345-6789',
      email: 'metro@parking.com'
    },
    isReservable: false,
    latitude: 34.052235,
    longitude: -118.243683
  },
  {
    id: 5,
    name: 'Shopping Mall Dock',
    mainImage: PARKING_IMAGES[2],
    address: '567 Mall Street',
    distance: 1.5,
    spots: [
      { type: 'truck', available: 8, total: 15 },
      { type: 'car', available: 45, total: 80 }
    ],
    prices: [
      { type: 'hour', label: 'Hourly Rate', value: 6 },
      { type: 'day', label: 'Daily Rate', value: 30 }
    ],
    rating: 4.3,
    ratingCount: 180,
    status: 'available',
    serviceTypes: [ServiceType.Parking, ServiceType.Dock],
    description: 'Large parking facility with loading docks',
    amenities: [
      { type: 'loading', name: 'Loading Bays', icon: 'logistics' },
      { type: 'elevator', name: 'Freight Elevator', icon: 'ascending' },
      { type: 'security', name: '24/7 Security', icon: 'shield-o' }
    ],
    contact: {
      name: 'Mall Parking',
      phone: '+1 (555) 456-7890',
      email: 'mall@parking.com'
    },
    isReservable: true,
    latitude: 34.052235,
    longitude: -118.243683
  }
];

// 格式化距离
export const formatDistance = (distance?: number) => {
  if (!distance) return '';
  return distance < 1 ? 
    `${(distance * 1000).toFixed(0)}m` : 
    `${distance.toFixed(1)}km`;
};

// 处理导航
export const handleNavigate = (lot: ParkingLot) => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${lot.latitude},${lot.longitude}`;
      const appleMapsUrl = `maps://maps.apple.com/?saddr=${latitude},${longitude}&daddr=${lot.latitude},${lot.longitude}`;
      
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        window.location.href = appleMapsUrl;
        setTimeout(() => {
          window.location.href = googleMapsUrl;
        }, 2000);
      } else {
        window.location.href = googleMapsUrl;
      }
    }, 
    (error) => {
      window.location.href = `https://www.google.com/maps/search/?api=1&query=${lot.latitude},${lot.longitude}`;
    });
  }
};

// 处理电话
export const handleCall = (phone?: string) => {
  if (phone) {
    window.location.href = `tel:${phone}`;
  }
};

// 获取价格图标
export const getPriceIcon = (type: string) => {
  const icons: Record<string, string> = {
    minute: 'clock-o',
    hour: 'clock-o',
    day: 'calendar-o',
    week: 'calendar-o',
    month: 'balance-o',
    quarter: 'chart-trending-o',
    halfYear: 'chart-trending-o',
    year: 'balance-list-o'
  };
  return icons[type] || 'cash-o';
};

// 格式化服务类型
export const formatServiceType = (type: ServiceType) => {
  const types: Record<ServiceType, string> = {
    [ServiceType.Standard]: 'Standard Parking',
    [ServiceType.Valet]: 'Valet Parking',
    [ServiceType.Covered]: 'Covered Parking',
    [ServiceType.Electric]: 'Electric Charging',
    [ServiceType.Parking]: 'Parking',
    [ServiceType.Dock]: 'Dock'
  };
  return types[type] || type;
}; 