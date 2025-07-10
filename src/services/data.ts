import { Vehicle, GasStation, FuelTransaction, Notification } from '../types';
import { LocalStorage } from './storage';
import { addNotification, updateUserFuelUsage } from './auth';

// Initialize data on first load
LocalStorage.initializeDefaultData();

export const getVehiclesByUser = (userId: string): Vehicle[] => {
  const vehicles = LocalStorage.getVehicles();
  return vehicles
    .filter((v: any) => v.userId === userId)
    .map((v: any) => ({
      ...v,
      createdAt: new Date(v.createdAt),
      approvedAt: v.approvedAt ? new Date(v.approvedAt) : undefined
    }));
};

export const getNotificationsByUser = (userId: string): Notification[] => {
  const notifications = LocalStorage.getNotifications();
  return notifications
    .filter((n: any) => n.userId === userId)
    .map((n: any) => ({
      ...n,
      createdAt: new Date(n.createdAt)
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const getTransactionsByUser = (userId: string): FuelTransaction[] => {
  const transactions = LocalStorage.getTransactions();
  return transactions
    .filter((t: any) => t.userId === userId)
    .map((t: any) => ({
      ...t,
      timestamp: new Date(t.timestamp)
    }))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const getAllTransactions = (): FuelTransaction[] => {
  const transactions = LocalStorage.getTransactions();
  return transactions.map((t: any) => ({
    ...t,
    timestamp: new Date(t.timestamp)
  }));
};

export const getGasStations = (): GasStation[] => {
  return LocalStorage.getGasStations();
};

export const addVehicle = (userId: string, vehicleData: { plate: string; chassis: string; photo?: string }): Vehicle => {
  const vehicles = LocalStorage.getVehicles();
  const newVehicle: Vehicle = {
    id: Date.now().toString(),
    userId,
    ...vehicleData,
    approved: false,
    createdAt: new Date()
  };
  
  vehicles.push(newVehicle);
  LocalStorage.saveVehicles(vehicles);
  
  // Notify user
  addNotification(userId, {
    title: 'Vehículo Registrado',
    message: `Tu vehículo ${vehicleData.plate} ha sido registrado y está pendiente de aprobación.`,
    type: 'info'
  });
  
  return newVehicle;
};

export const approveVehicle = (vehicleId: string, approvedBy: string): void => {
  const vehicles = LocalStorage.getVehicles();
  const vehicleIndex = vehicles.findIndex((v: any) => v.id === vehicleId);
  
  if (vehicleIndex !== -1) {
    vehicles[vehicleIndex].approved = true;
    vehicles[vehicleIndex].approvedBy = approvedBy;
    vehicles[vehicleIndex].approvedAt = new Date().toISOString();
    
    LocalStorage.saveVehicles(vehicles);
    
    // Notify vehicle owner
    addNotification(vehicles[vehicleIndex].userId, {
      title: 'Vehículo Aprobado',
      message: `Tu vehículo ${vehicles[vehicleIndex].plate} ha sido aprobado para carga de combustible.`,
      type: 'success'
    });
  }
};

export const rejectVehicle = (vehicleId: string): void => {
  const vehicles = LocalStorage.getVehicles();
  const vehicleIndex = vehicles.findIndex((v: any) => v.id === vehicleId);
  
  if (vehicleIndex !== -1) {
    const vehicle = vehicles[vehicleIndex];
    
    // Notify vehicle owner
    addNotification(vehicle.userId, {
      title: 'Vehículo Rechazado',
      message: `Tu vehículo ${vehicle.plate} ha sido rechazado. Por favor, contacta con el administrador.`,
      type: 'error'
    });
    
    // Remove from pending (in real app, might just mark as rejected)
    vehicles.splice(vehicleIndex, 1);
    LocalStorage.saveVehicles(vehicles);
  }
};

export const getPendingVehicles = (): Vehicle[] => {
  const vehicles = LocalStorage.getVehicles();
  return vehicles
    .filter((v: any) => !v.approved)
    .map((v: any) => ({
      ...v,
      createdAt: new Date(v.createdAt)
    }));
};

export const findVehicleByPlate = (plate: string): Vehicle | null => {
  const vehicles = LocalStorage.getVehicles();
  const vehicle = vehicles.find((v: any) => v.plate.toLowerCase() === plate.toLowerCase());
  
  if (vehicle) {
    return {
      ...vehicle,
      createdAt: new Date(vehicle.createdAt),
      approvedAt: vehicle.approvedAt ? new Date(vehicle.approvedAt) : undefined
    };
  }
  
  return null;
};

export const createTransaction = (transactionData: {
  vehicleId: string;
  userId: string;
  pumpId: string;
  operatorId: string;
  liters: number;
  pricePerLiter: number;
}): FuelTransaction => {
  const transactions = LocalStorage.getTransactions();
  const newTransaction: FuelTransaction = {
    id: Date.now().toString(),
    ...transactionData,
    total: transactionData.liters * transactionData.pricePerLiter,
    timestamp: new Date(),
    approved: true,
    approvedBy: transactionData.operatorId
  };
  
  transactions.push(newTransaction);
  LocalStorage.saveTransactions(transactions);
  
  // Update user fuel usage
  updateUserFuelUsage(transactionData.userId, transactionData.liters);
  
  // Update pump stock
  updatePumpStock(transactionData.pumpId, transactionData.liters);
  
  // Notify user
  addNotification(transactionData.userId, {
    title: 'Carga Completada',
    message: `Se han cargado ${transactionData.liters}L de combustible por Bs. ${newTransaction.total.toFixed(2)}.`,
    type: 'success'
  });
  
  return newTransaction;
};

export const updatePumpStock = (pumpId: string, litersUsed: number): void => {
  const gasStations = LocalStorage.getGasStations();
  
  for (const station of gasStations) {
    const pump = station.pumps.find((p: any) => p.id === pumpId);
    if (pump) {
      pump.currentStock = Math.max(0, pump.currentStock - litersUsed);
      break;
    }
  }
  
  LocalStorage.saveGasStations(gasStations);
};

export const updateFuelPrices = (prices: { gasoline: number; diesel: number; premium: number }): void => {
  const settings = LocalStorage.getSettings();
  settings.fuelPrices = prices;
  LocalStorage.saveSettings(settings);
  
  // Update pump prices
  const gasStations = LocalStorage.getGasStations();
  for (const station of gasStations) {
    for (const pump of station.pumps) {
      if (pump.fuelType === 'gasoline') {
        pump.pricePerLiter = prices.gasoline;
      } else if (pump.fuelType === 'diesel') {
        pump.pricePerLiter = prices.diesel;
      } else if (pump.fuelType === 'premium') {
        pump.pricePerLiter = prices.premium;
      }
    }
  }
  LocalStorage.saveGasStations(gasStations);
};

export const updateFuelLimits = (limits: { daily: number; monthly: number }): void => {
  const settings = LocalStorage.getSettings();
  settings.fuelLimits = limits;
  LocalStorage.saveSettings(settings);
  
  // Update all customer users
  const users = LocalStorage.getUsers();
  users.forEach((user: any) => {
    if (user.role === 'customer') {
      user.fuelLimit = limits.daily;
    }
  });
  LocalStorage.saveUsers(users);
};

export const markNotificationAsRead = (notificationId: string): void => {
  const notifications = LocalStorage.getNotifications();
  const notificationIndex = notifications.findIndex((n: any) => n.id === notificationId);
  
  if (notificationIndex !== -1) {
    notifications[notificationIndex].read = true;
    LocalStorage.saveNotifications(notifications);
  }
};

export const getSettings = () => {
  return LocalStorage.getSettings();
};

export const getAllUsers = () => {
  return LocalStorage.getUsers();
};

// Export mock data for backward compatibility
export const MOCK_GAS_STATIONS = getGasStations();
export const MOCK_VEHICLES = LocalStorage.getVehicles();
export const MOCK_TRANSACTIONS = getAllTransactions();