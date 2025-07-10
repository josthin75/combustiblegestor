export interface User {
  id: string;
  name: string;
  ci: string;
  photo?: string;
  role: 'customer' | 'operator' | 'manager';
  createdAt: Date;
  assignedDays: string[];
  fuelLimit: number;
  fuelUsed: number;
}

export interface Vehicle {
  id: string;
  userId: string;
  plate: string;
  chassis: string;
  photo?: string;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
}

export interface GasStation {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  pumps: Pump[];
  status: 'active' | 'inactive' | 'maintenance';
}

export interface Pump {
  id: string;
  number: number;
  fuelType: 'gasoline' | 'diesel' | 'premium';
  pricePerLiter: number;
  available: boolean;
  currentStock: number;
  maxStock: number;
}

export interface FuelTransaction {
  id: string;
  vehicleId: string;
  userId: string;
  pumpId: string;
  operatorId: string;
  liters: number;
  pricePerLiter: number;
  total: number;
  timestamp: Date;
  approved: boolean;
  approvedBy?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

export type AuthUser = User | null;