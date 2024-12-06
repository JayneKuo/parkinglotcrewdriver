// 计费类型
export enum PricingType {
  Hourly = 'hourly',
  Daily = 'daily',
  Monthly = 'monthly'
}

// 服务类型
export enum ServiceType {
  Standard = 'standard',
  Valet = 'valet',
  Covered = 'covered',
  Electric = 'electric'
}

// 停车场信息
export interface SpotInfo {
  type: 'car' | 'truck' | 'ev';
  available: number;
  total: number;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

export interface Amenity {
  type: string;
  name: string;
  icon: string;
}

export interface ParkingLot {
  id: number;
  name: string;
  mainImage: string;
  address: string;
  distance: number;
  spots: SpotInfo[];
  prices: PriceItem[];
  status: 'available' | 'limited' | 'full' | 'maintenance' | 'closed';
  contact: ContactInfo;
  description: string;
  buildingImage: string;
  buildingDescription: string;
  amenities: Amenity[];
  gallery: string[];
  serviceTypes: ServiceType[];
  isReservable: boolean;
  latitude: number;
  longitude: number;
  rating: number;
  ratingCount: number;
  phone?: string;
}

// 搜索参数
export interface SearchParams {
  keyword: string;
  serviceTypes: ServiceType[];
}

export interface PriceItem {
  type: string;
  label: string;
  value: number;
} 