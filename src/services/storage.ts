// Sistema de almacenamiento local para persistir datos
export class LocalStorage {
  private static getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Users
  static getUsers() {
    return this.getItem('fuel_system_users', []);
  }

  static saveUsers(users: any[]) {
    this.setItem('fuel_system_users', users);
  }

  // Vehicles
  static getVehicles() {
    return this.getItem('fuel_system_vehicles', []);
  }

  static saveVehicles(vehicles: any[]) {
    this.setItem('fuel_system_vehicles', vehicles);
  }

  // Transactions
  static getTransactions() {
    return this.getItem('fuel_system_transactions', []);
  }

  static saveTransactions(transactions: any[]) {
    this.setItem('fuel_system_transactions', transactions);
  }

  // Notifications
  static getNotifications() {
    return this.getItem('fuel_system_notifications', []);
  }

  static saveNotifications(notifications: any[]) {
    this.setItem('fuel_system_notifications', notifications);
  }

  // Gas Stations
  static getGasStations() {
    return this.getItem('fuel_system_gas_stations', []);
  }

  static saveGasStations(stations: any[]) {
    this.setItem('fuel_system_gas_stations', stations);
  }

  // Settings
  static getSettings() {
    return this.getItem('fuel_system_settings', {
      fuelPrices: {
        gasoline: 3.74,
        diesel: 3.72,
        premium: 4.20
      },
      fuelLimits: {
        daily: 120,
        monthly: 3600
      }
    });
  }

  static saveSettings(settings: any) {
    this.setItem('fuel_system_settings', settings);
  }

  // Current User Session
  static getCurrentUser() {
    return this.getItem('fuel_system_current_user', null);
  }

  static setCurrentUser(user: any) {
    this.setItem('fuel_system_current_user', user);
  }

  static clearCurrentUser() {
    localStorage.removeItem('fuel_system_current_user');
  }

  // Initialize default data if empty
  static initializeDefaultData() {
    const users = this.getUsers();
    if (users.length === 0) {
      const defaultUsers = [
        {
          id: '1',
          name: 'Juan Pérez',
          ci: '12345678',
          role: 'customer',
          createdAt: new Date().toISOString(),
          assignedDays: ['Lunes', 'Jueves'],
          fuelLimit: 120,
          fuelUsed: 45,
          photo: ''
        },
        {
          id: '2',
          name: 'María González',
          ci: '87654321',
          role: 'customer',
          createdAt: new Date().toISOString(),
          assignedDays: ['Miércoles', 'Sábado'],
          fuelLimit: 120,
          fuelUsed: 80,
          photo: ''
        },
        {
          id: '3',
          name: 'Carlos Despachador',
          ci: '11111111',
          role: 'operator',
          createdAt: new Date().toISOString(),
          assignedDays: [],
          fuelLimit: 0,
          fuelUsed: 0,
          username: 'despachador',
          password: '1234'
        },
        {
          id: '4',
          name: 'Ana Supervisora',
          ci: '22222222',
          role: 'manager',
          createdAt: new Date().toISOString(),
          assignedDays: [],
          fuelLimit: 0,
          fuelUsed: 0,
          username: 'gerente',
          password: 'gerente123'
        }
      ];
      this.saveUsers(defaultUsers);
    }

    const vehicles = this.getVehicles();
    if (vehicles.length === 0) {
      const defaultVehicles = [
        {
          id: '1',
          userId: '1',
          plate: 'ABC-123',
          chassis: 'VIN123456789',
          approved: true,
          approvedBy: '4',
          approvedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          photo: ''
        },
        {
          id: '2',
          userId: '1',
          plate: 'DEF-456',
          chassis: 'VIN987654321',
          approved: false,
          createdAt: new Date().toISOString(),
          photo: ''
        }
      ];
      this.saveVehicles(defaultVehicles);
    }

    const gasStations = this.getGasStations();
    if (gasStations.length === 0) {
      const defaultStations = [
        {
          id: '1',
          name: 'Estación Central',
          location: { lat: -17.783, lng: -63.182 },
          address: 'Av. Cristo Redentor 1234',
          status: 'active',
          pumps: [
            {
              id: '1',
              number: 1,
              fuelType: 'gasoline',
              pricePerLiter: 3.74,
              available: true,
              currentStock: 8500,
              maxStock: 10000
            },
            {
              id: '2',
              number: 2,
              fuelType: 'diesel',
              pricePerLiter: 3.72,
              available: true,
              currentStock: 7200,
              maxStock: 10000
            }
          ]
        },
        {
          id: '2',
          name: 'Estación Norte',
          location: { lat: -17.770, lng: -63.180 },
          address: 'Av. Banzer 5678',
          status: 'active',
          pumps: [
            {
              id: '3',
              number: 1,
              fuelType: 'gasoline',
              pricePerLiter: 3.74,
              available: true,
              currentStock: 9100,
              maxStock: 10000
            },
            {
              id: '4',
              number: 2,
              fuelType: 'premium',
              pricePerLiter: 4.20,
              available: true,
              currentStock: 6800,
              maxStock: 8000
            }
          ]
        }
      ];
      this.saveGasStations(defaultStations);
    }
  }
}