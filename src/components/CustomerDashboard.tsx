import React, { useState, useEffect } from 'react';
import { Car, Calendar, Fuel, MapPin, Bell,  Plus, CheckCircle,  Clock, Camera, Upload } from 'lucide-react';
import { User as UserType, Vehicle } from '../types';
import { 
  getVehiclesByUser, 
  getNotificationsByUser, 
  getGasStations, 
  addVehicle,
  markNotificationAsRead 
} from '../services/data';

interface CustomerDashboardProps {
  user: UserType;
  onLogout: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vehicleData, setVehicleData] = useState({ plate: '', chassis: '', photo: '' });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [gasStations, setGasStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = () => {
    setVehicles(getVehiclesByUser(user.id));
    setNotifications(getNotificationsByUser(user.id));
    setGasStations(getGasStations());
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleData.plate || !vehicleData.chassis) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      await addVehicle(user.id, vehicleData);
      setShowAddVehicle(false);
      setVehicleData({ plate: '', chassis: '', photo: '' });
      loadData(); // Reload data
      alert('Vehículo agregado exitosamente');
    } catch (error) {
      alert('Error al agregar vehículo');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoCapture = () => {
    // Simulate photo capture
    const photoUrl = `data:image/svg+xml;base64,${btoa(`
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#e5e7eb"/>
        <text x="50" y="50" text-anchor="middle" dy=".3em" fill="#6b7280">Foto</text>
      </svg>
    `)}`;
    setVehicleData({ ...vehicleData, photo: photoUrl });
  };

  const handlePhotoUpload = () => {
    // Simulate photo upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setVehicleData({ ...vehicleData, photo: e.target?.result as string });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleNotificationClick = (notificationId: string) => {
    markNotificationAsRead(notificationId);
    loadData();
  };

  const unreadNotifications = notifications.filter(n => !n.read);

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">¡Bienvenido, {user.name}!</h2>
        <p className="opacity-90">CI: {user.ci}</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              <span className="text-sm">Días de Carga</span>
            </div>
            <p className="font-semibold mt-1">{user.assignedDays.join(', ')}</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex items-center">
              <Fuel className="w-5 h-5 mr-2" />
              <span className="text-sm">Combustible Usado</span>
            </div>
            <p className="font-semibold mt-1">{user.fuelUsed}L / {user.fuelLimit}L</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex items-center">
              <Car className="w-5 h-5 mr-2" />
              <span className="text-sm">Vehículos</span>
            </div>
            <p className="font-semibold mt-1">{vehicles.length} registrados</p>
          </div>
        </div>
      </div>

      {/* Fuel Usage Progress */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Uso de Combustible</h3>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((user.fuelUsed / user.fuelLimit) * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {user.fuelUsed}L de {user.fuelLimit}L utilizados ({((user.fuelUsed / user.fuelLimit) * 100).toFixed(1)}%)
        </p>
      </div>

      {/* Vehicles */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Mis Vehículos</h3>
          <button
            onClick={() => setShowAddVehicle(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar
          </button>
        </div>
        
        <div className="space-y-3">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <Car className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="font-medium">{vehicle.plate}</p>
                  <p className="text-sm text-gray-500">Chasis: {vehicle.chassis}</p>
                  <p className="text-xs text-gray-400">
                    Registrado: {vehicle.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                {vehicle.approved ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-1" />
                    <span className="text-sm">Aprobado</span>
                  </div>
                ) : (
                  <div className="flex items-center text-orange-600">
                    <Clock className="w-5 h-5 mr-1" />
                    <span className="text-sm">Pendiente</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {vehicles.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              No tienes vehículos registrados
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderMap = () => (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Estaciones de Servicio</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gasStations.map((station) => (
          <div key={station.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-lg">{station.name}</h4>
                <p className="text-sm text-gray-600 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {station.address}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                station.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {station.status === 'active' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Surtidores:</h5>
              {station.pumps.map((pump: any) => (
                <div key={pump.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <Fuel className="w-4 h-4 mr-1" />
                    {pump.fuelType === 'gasoline' ? 'Gasolina' : 
                     pump.fuelType === 'diesel' ? 'Diésel' : 'Premium'}
                  </span>
                  <div className="text-right">
                    <span className="font-medium">Bs. {pump.pricePerLiter}</span>
                    <p className="text-xs text-gray-500">
                      Stock: {pump.currentStock}L
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Notificaciones</h3>
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`p-4 rounded-lg border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
              notification.type === 'success' ? 'border-green-500 bg-green-50' :
              notification.type === 'warning' ? 'border-orange-500 bg-orange-50' :
              notification.type === 'error' ? 'border-red-500 bg-red-50' :
              'border-blue-500 bg-blue-50'
            }`}
            onClick={() => handleNotificationClick(notification.id)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{notification.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {notification.createdAt.toLocaleString()}
                </p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No tienes notificaciones
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Fuel className="w-8 h-8 text-blue-500 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Panel de Cliente</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setActiveTab('notifications')}
                className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>
              <button
                onClick={onLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'map'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Estaciones
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Notificaciones
              {unreadNotifications.length > 0 && (
                <span className="ml-1 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {unreadNotifications.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'map' && renderMap()}
        {activeTab === 'notifications' && renderNotifications()}
      </main>

      {/* Add Vehicle Modal */}
      {showAddVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Agregar Vehículo</h3>
            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placa *
                </label>
                <input
                  type="text"
                  value={vehicleData.plate}
                  onChange={(e) => setVehicleData({ ...vehicleData, plate: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ABC-123"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chasis *
                </label>
                <input
                  type="text"
                  value={vehicleData.chassis}
                  onChange={(e) => setVehicleData({ ...vehicleData, chassis: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VIN123456789"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foto del Vehículo (Opcional)
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handlePhotoCapture}
                    className="flex-1 flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Tomar Foto
                  </button>
                  <button
                    type="button"
                    onClick={handlePhotoUpload}
                    className="flex-1 flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Subir Foto
                  </button>
                </div>
                {vehicleData.photo && (
                  <div className="mt-2">
                    <img 
                      src={vehicleData.photo} 
                      alt="Vista previa" 
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddVehicle(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Agregando...' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};