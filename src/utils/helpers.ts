import type { ParkingLot } from '@/types/parking';
import { ServiceType } from '@/types/parking';

// 首先在 helpers.ts 中添加图片配置
export const PARKING_IMAGES = {
  indoor: [
    'https://images.pexels.com/photos/1000633/pexels-photo-1000633.jpeg',
    'https://images.pexels.com/photos/1004982/pexels-photo-1004982.jpeg'
  ],
  outdoor: [
    'https://images.pexels.com/photos/1756957/pexels-photo-1756957.jpeg',
    'https://images.pexels.com/photos/2348359/pexels-photo-2348359.jpeg'
  ]
};

// 在 ServiceType 枚举中添加明确的服务类型
export enum ServiceType {
  Standard = 'standard',  // 自助停车
  Valet = 'valet',       // 代客泊车
  Electric = 'electric', // 充电服务
  Covered = 'covered'    // 室内停车
}

// 模拟数据
export const mockParkingLots: ParkingLot[] = [
  {
    id: 1,
    name: 'Downtown Parking Center',
    mainImage: 'https://images.pexels.com/photos/1000633/pexels-photo-1000633.jpeg',
    address: '123 Main St, Washington, DC',
    distance: 0.5,
    spots: [
      { type: 'car', available: 45, total: 100 },
      { type: 'truck', available: 5, total: 10 },
      { type: 'ev', available: 8, total: 20 }
    ],
    prices: [
      { type: 'hour', label: 'Hour', value: 5 },
      { type: 'day', label: 'Day', value: 25 }
    ],
    status: 'available',
    contact: {
      name: 'John Smith',
      email: 'john.smith@parking.com',
      phone: '+1 (202) 555-0123'
    },
    description: 'Modern parking facility in the heart of downtown, offering convenient access to major attractions and business centers.',
    buildingImage: 'https://images.pexels.com/photos/146243/pexels-photo-146243.jpeg',
    buildingDescription: 'Six-story concrete structure with modern ventilation system and 24/7 security monitoring.',
    amenities: [
      { type: 'security', name: '24/7 Security', icon: 'shield-o' },
      { type: 'lighting', name: 'LED Lighting', icon: 'bulb-o' },
      { type: 'camera', name: 'CCTV Coverage', icon: 'video-o' },
      { type: 'elevator', name: 'Elevators', icon: 'ascending' }
    ],
    gallery: [
      'https://images.pexels.com/photos/1000633/pexels-photo-1000633.jpeg',
      'https://images.pexels.com/photos/146243/pexels-photo-146243.jpeg',
      'https://images.pexels.com/photos/127928/pexels-photo-127928.jpeg'
    ],
    serviceTypes: [ServiceType.Standard, ServiceType.Valet],
    isReservable: true,
    latitude: 38.9072,
    longitude: -77.0369,
    rating: 4.5,
    ratingCount: 128
  },
  {
    id: 2,
    name: 'Central Station Parking',
    mainImage: 'https://images.pexels.com/photos/1004982/pexels-photo-1004982.jpeg',
    address: '456 Park Ave, Washington, DC',
    distance: 0.8,
    spots: [
      { type: 'car', available: 8, total: 80 },
      { type: 'ev', available: 2, total: 10 }
    ],
    prices: [
      { type: 'minute', label: '30 Mins', value: 2 },
      { type: 'hour', label: 'Hour', value: 8 },
      { type: 'day', label: 'Day', value: 40 },
      { type: 'month', label: 'Month', value: 350 }
    ],
    status: 'limited',
    contact: {
      name: 'Sarah Johnson',
      email: 'sarah.j@parking.com',
      phone: '+1 (202) 555-0124'
    },
    description: 'Premium parking facility adjacent to Central Station, perfect for commuters and travelers.',
    buildingImage: 'https://images.pexels.com/photos/127928/pexels-photo-127928.jpeg',
    buildingDescription: 'Modern three-level underground parking with direct access to the station concourse.',
    amenities: [
      { type: 'security', name: 'Security Patrol', icon: 'shield-o' },
      { type: 'charging', name: 'EV Charging', icon: 'flash' },
      { type: 'wash', name: 'Car Wash', icon: 'water-o' }
    ],
    gallery: [
      'https://images.pexels.com/photos/1004982/pexels-photo-1004982.jpeg',
      'https://images.pexels.com/photos/127928/pexels-photo-127928.jpeg'
    ],
    serviceTypes: [ServiceType.Standard],
    isReservable: true,
    latitude: 38.9095,
    longitude: -77.0352,
    rating: 4.8,
    ratingCount: 256
  },
  {
    id: 3,
    name: 'Premium Plaza Parking',
    mainImage: 'https://images.pexels.com/photos/1756957/pexels-photo-1756957.jpeg',
    address: '789 River Rd, Washington, DC',
    distance: 1.2,
    spots: [
      { type: 'car', available: 0, total: 120 },
      { type: 'truck', available: 0, total: 20 },
      { type: 'ev', available: 0, total: 30 }
    ],
    prices: [
      { type: 'hour', label: 'Hour', value: 10 },
      { type: 'day', label: 'Day', value: 45 },
      { type: 'week', label: 'Week', value: 200 },
      { type: 'month', label: 'Month', value: 600 }
    ],
    status: 'full',
    contact: {
      name: 'Michael Chen',
      email: 'm.chen@parking.com',
      phone: '+1 (202) 555-0125'
    },
    description: 'Luxury parking complex with premium amenities and professional valet service.',
    buildingImage: 'https://images.pexels.com/photos/146243/pexels-photo-146243.jpeg',
    buildingDescription: 'State-of-the-art facility with automated parking systems and premium security features.',
    amenities: [
      { type: 'valet', name: 'Valet Service', icon: 'service-o' },
      { type: 'charging', name: 'Fast Charging', icon: 'flash' },
      { type: 'wash', name: 'Auto Detailing', icon: 'water-o' },
      { type: 'tire', name: 'Tire Service', icon: 'circle-o' }
    ],
    gallery: [
      'https://images.pexels.com/photos/1756957/pexels-photo-1756957.jpeg',
      'https://images.pexels.com/photos/146243/pexels-photo-146243.jpeg',
      'https://images.pexels.com/photos/127928/pexels-photo-127928.jpeg'
    ],
    serviceTypes: [ServiceType.Standard, ServiceType.Valet],
    isReservable: true,
    latitude: 38.9062,
    longitude: -77.0379,
    rating: 4.2,
    ratingCount: 89
  },
  {
    id: 4,
    name: 'Riverside Parking',
    mainImage: PARKING_IMAGES.outdoor[1],
    address: '321 River View St, Washington, DC',
    distance: 1.5,
    phone: '+1 (202) 555-0126',
    prices: [
      { type: 'hour', label: 'Hour', value: 6 }
    ],
    serviceTypes: [ServiceType.Standard],
    isReservable: true,
    latitude: 38.9062,
    longitude: -77.0379,
    rating: 4.3,
    ratingCount: 67,
    status: 'available',
    spots: [{ type: 'car', available: 25, total: 50 }],
    contact: {
      name: 'Robert Wilson',
      email: 'robert.w@parking.com',
      phone: '+1 (202) 555-0126'
    },
    description: 'Convenient riverside parking facility with easy access to waterfront attractions.',
    buildingImage: PARKING_IMAGES.outdoor[0],
    buildingDescription: 'Modern open-air parking structure with 24/7 security monitoring.',
    amenities: [
      { type: 'security', name: 'Security Patrol', icon: 'shield-o' },
      { type: 'lighting', name: 'LED Lighting', icon: 'bulb-o' }
    ],
    gallery: [
      PARKING_IMAGES.outdoor[1],
      PARKING_IMAGES.outdoor[0]
    ]
  },
  {
    id: 5,
    name: 'City Center Garage',
    mainImage: PARKING_IMAGES.indoor[0],
    address: '567 Metro Center, Washington, DC',
    distance: 0.3,
    phone: '+1 (202) 555-0127',
    prices: [
      { type: 'hour', label: 'Hour', value: 8 },
      { type: 'day', label: 'Day', value: 30 }
    ],
    serviceTypes: [ServiceType.Valet, ServiceType.Electric],
    isReservable: true,
    latitude: 38.9072,
    longitude: -77.0365,
    rating: 4.7,
    ratingCount: 183,
    status: 'limited',
    spots: [{ type: 'car', available: 5, total: 80 }]
  },
  {
    id: 6,
    name: 'Park & Charge Station',
    mainImage: PARKING_IMAGES.indoor[1],
    address: '789 Tech Plaza, Washington, DC',
    distance: 0.7,
    phone: '+1 (202) 555-0128',
    prices: [
      { type: 'hour', label: 'Hour', value: 12 },
      { type: 'day', label: 'Day', value: 50 },
      { type: 'week', label: 'Week', value: 250 }
    ],
    serviceTypes: [ServiceType.Electric, ServiceType.Covered],
    isReservable: true,
    latitude: 38.9082,
    longitude: -77.0375,
    rating: 4.9,
    ratingCount: 256,
    status: 'available',
    spots: [{ type: 'car', available: 15, total: 30 }]
  },
  {
    id: 7,
    name: 'Business District Parking',
    mainImage: PARKING_IMAGES.outdoor[0],
    address: '101 Office Park, Washington, DC',
    distance: 1.1,
    phone: '+1 (202) 555-0129',
    prices: [
      { type: 'hour', label: 'Hour', value: 7 },
      { type: 'day', label: 'Day', value: 35 },
      { type: 'week', label: 'Week', value: 180 },
      { type: 'month', label: 'Month', value: 500 }
    ],
    serviceTypes: [ServiceType.Standard, ServiceType.Valet],
    isReservable: true,
    latitude: 38.9092,
    longitude: -77.0385,
    rating: 4.4,
    ratingCount: 142,
    status: 'maintenance',
    spots: [{ type: 'car', available: 0, total: 100 }]
  },
  {
    id: 8,
    name: 'Shopping Mall Parking',
    mainImage: PARKING_IMAGES.indoor[0],
    address: '444 Mall Avenue, Washington, DC',
    distance: 0.9,
    phone: '+1 (202) 555-0130',
    prices: [
      { type: 'hour', label: 'Hour', value: 4 },
      { type: 'day', label: 'Day', value: 20 },
      { type: 'week', label: 'Week', value: 100 },
      { type: 'month', label: 'Month', value: 300 },
      { type: 'year', label: 'Year', value: 3000 }
    ],
    serviceTypes: [ServiceType.Standard, ServiceType.Electric],
    isReservable: true,
    latitude: 38.9102,
    longitude: -77.0395,
    rating: 4.6,
    ratingCount: 321,
    status: 'available',
    spots: [{ type: 'car', available: 200, total: 500 }]
  },
  {
    id: 9,
    name: 'Hospital Visitor Parking',
    mainImage: PARKING_IMAGES.outdoor[1],
    address: '911 Medical Center, Washington, DC',
    distance: 1.3,
    phone: '+1 (202) 555-0131',
    prices: [
      { type: 'hour', label: 'Hour', value: 3 },
      { type: 'day', label: 'Day', value: 15 },
      { type: 'week', label: 'Week', value: 80 },
      { type: 'month', label: 'Month', value: 250 },
      { type: 'quarter', label: '3 Months', value: 650 },
      { type: 'year', label: 'Year', value: 2400 }
    ],
    serviceTypes: [ServiceType.Standard, ServiceType.Covered],
    isReservable: true,
    latitude: 38.9112,
    longitude: -77.0405,
    rating: 4.5,
    ratingCount: 189,
    status: 'available',
    spots: [{ type: 'car', available: 45, total: 150 }]
  },
  {
    id: 10,
    name: 'Airport Long-term Parking',
    mainImage: PARKING_IMAGES.outdoor[0],
    address: '1 Airport Road, Washington, DC',
    distance: 5.2,
    phone: '+1 (202) 555-0132',
    prices: [
      { type: 'day', label: 'Day', value: 18 },
      { type: 'week', label: 'Week', value: 90 },
      { type: 'month', label: 'Month', value: 280 },
      { type: 'quarter', label: '3 Months', value: 700 },
      { type: 'halfYear', label: '6 Months', value: 1200 },
      { type: 'year', label: 'Year', value: 2000 }
    ],
    serviceTypes: [ServiceType.Standard, ServiceType.Covered, ServiceType.Valet],
    isReservable: true,
    latitude: 38.9122,
    longitude: -77.0415,
    rating: 4.8,
    ratingCount: 567,
    status: 'available',
    spots: [{ type: 'car', available: 300, total: 1000 }]
  },
  {
    id: 11,
    name: 'University Campus Parking',
    mainImage: PARKING_IMAGES.indoor[1],
    address: '200 College Ave, Washington, DC',
    distance: 1.8,
    phone: '+1 (202) 555-0133',
    prices: [
      { type: 'hour', label: 'Hour', value: 2 },
      { type: 'day', label: 'Day', value: 10 },
      { type: 'semester', label: '4 Months', value: 400 },
      { type: 'year', label: 'Academic Year', value: 800 }
    ],
    serviceTypes: [ServiceType.Standard, ServiceType.Electric],
    isReservable: true,
    latitude: 38.9132,
    longitude: -77.0425,
    rating: 4.2,
    ratingCount: 234,
    status: 'limited',
    spots: [{ type: 'car', available: 20, total: 200 }]
  },
  {
    id: 12,
    name: 'Convention Center Parking',
    mainImage: PARKING_IMAGES.indoor[0],
    address: '888 Event Plaza, Washington, DC',
    distance: 0.6,
    phone: '+1 (202) 555-0134',
    prices: [
      { type: 'hour', label: 'Hour', value: 15 },
      { type: 'day', label: 'Day', value: 60 },
      { type: 'event', label: 'Event Rate', value: 40 }
    ],
    serviceTypes: [ServiceType.Valet, ServiceType.Covered],
    isReservable: true,
    latitude: 38.9142,
    longitude: -77.0435,
    rating: 4.7,
    ratingCount: 412,
    status: 'full',
    spots: [{ type: 'car', available: 0, total: 300 }]
  },
  {
    id: 13,
    name: 'Stadium VIP Parking',
    mainImage: PARKING_IMAGES.outdoor[1],
    address: '1 Sports Way, Washington, DC',
    distance: 2.1,
    phone: '+1 (202) 555-0135',
    prices: [
      { type: 'event', label: 'Event Rate', value: 50 },
      { type: 'season', label: 'Season Pass', value: 1500 }
    ],
    serviceTypes: [ServiceType.Valet, ServiceType.Covered],
    isReservable: true,
    latitude: 38.9152,
    longitude: -77.0445,
    rating: 4.9,
    ratingCount: 156,
    status: 'available',
    spots: [{ type: 'car', available: 50, total: 100 }]
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
    [ServiceType.Electric]: 'Electric Charging'
  };
  return types[type] || type;
}; 