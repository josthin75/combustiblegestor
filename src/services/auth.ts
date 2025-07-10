import { User } from '../types';
import { LocalStorage } from './storage';

export const login = async (username: string, password: string): Promise<User | null> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const users = LocalStorage.getUsers();
  
  // Check operator login
  if (username === 'despachador' && password === '1234') {
    const operator = users.find((u: any) => u.role === 'operator');
    if (operator) {
      LocalStorage.setCurrentUser(operator);
      return operator;
    }
  }
  
  // Check manager login
  if (username === 'gerente' && password === 'gerente123') {
    const manager = users.find((u: any) => u.role === 'manager');
    if (manager) {
      LocalStorage.setCurrentUser(manager);
      return manager;
    }
  }
  
  // Check customer login (using CI)
  const customer = users.find((u: any) => u.ci === username && u.role === 'customer');
  if (customer) {
    LocalStorage.setCurrentUser(customer);
    return customer;
  }
  
  return null;
};

export const register = async (userData: Omit<User, 'id' | 'createdAt' | 'assignedDays' | 'fuelLimit' | 'fuelUsed'>): Promise<User> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const users = LocalStorage.getUsers();
  const assignedDays = getAssignedDays(userData.ci);
  
  const newUser: User = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date(),
    assignedDays,
    fuelLimit: 120,
    fuelUsed: 0
  };
  
  users.push(newUser);
  LocalStorage.saveUsers(users);
  LocalStorage.setCurrentUser(newUser);
  
  // Create welcome notification
  addNotification(newUser.id, {
    title: '¡Bienvenido al Sistema!',
    message: `Hola ${newUser.name}, tu cuenta ha sido creada exitosamente. Tus días de carga son: ${assignedDays.join(', ')}.`,
    type: 'success'
  });
  
  return newUser;
};

export const getAssignedDays = (ci: string): string[] => {
  const lastDigit = parseInt(ci.slice(-1));
  
  if ([1, 2, 3].includes(lastDigit)) {
    return ['Lunes', 'Jueves'];
  } else if ([4, 5, 6].includes(lastDigit)) {
    return ['Martes', 'Viernes'];
  } else if ([7, 8, 9, 0].includes(lastDigit)) {
    return ['Miércoles', 'Sábado'];
  }
  
  return ['Domingo']; // Public/Private vehicles
};

export const getCurrentUser = (): User | null => {
  const user = LocalStorage.getCurrentUser();
  return user ? { ...user, createdAt: new Date(user.createdAt) } : null;
};

export const setCurrentUser = (user: User | null): void => {
  LocalStorage.setCurrentUser(user);
};

export const logout = (): void => {
  LocalStorage.clearCurrentUser();
};

export const addNotification = (userId: string, notification: {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}) => {
  const notifications = LocalStorage.getNotifications();
  const newNotification = {
    id: Date.now().toString(),
    userId,
    ...notification,
    read: false,
    createdAt: new Date().toISOString()
  };
  
  notifications.push(newNotification);
  LocalStorage.saveNotifications(notifications);
};

export const updateUserFuelUsage = (userId: string, litersUsed: number) => {
  const users = LocalStorage.getUsers();
  const userIndex = users.findIndex((u: any) => u.id === userId);
  
  if (userIndex !== -1) {
    users[userIndex].fuelUsed += litersUsed;
    LocalStorage.saveUsers(users);
    
    // Update current user if it's the same user
    const currentUser = LocalStorage.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      currentUser.fuelUsed += litersUsed;
      LocalStorage.setCurrentUser(currentUser);
    }
  }
};