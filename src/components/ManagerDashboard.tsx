import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Car, 
  Fuel, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  DollarSign,
  Calendar,
  Settings,
  Save
} from 'lucide-react';
import { User as UserType } from '../types';
import { 
  getPendingVehicles, 
  approveVehicle, 
  rejectVehicle, 
  getAllTransactions,
  getGasStations,
  getAllUsers,
  updateFuelPrices,
  updateFuelLimits,
  getSettings
} from '../services/data';

interface ManagerDashboardProps {
  user: UserType;
  onLogout: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pendingVehicles, setPendingVehicles] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [gasStations, setGasStations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // Settings form states
  const [fuelPrices, setFuelPrices] = useState({
    gasoline: 3.74,
    diesel: 3.72,
    premium: 4.20
  });
  
  const [fuelLimits, setFuelLimits] = useState({
    daily: 120,
    monthly: 3600
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPendingVehicles(getPendingVehicles());
    setTransactions(getAllTransactions());
    setGasStations(getGasStations());
    setUsers(getAllUsers());
    const currentSettings = getSettings();
    setSettings(currentSettings);
    setFuelPrices(currentSettings.fuelPrices);
    setFuelLimits(currentSettings.fuelLimits);
  };

  const handleApproveVehicle = async (vehicleId: string) => {
    setLoading(true);
    try {
      approveVehicle(vehicleId, user.id);
      loadData(); // Reload data
      alert('Vehículo aprobado exitosamente');
    } catch (error) {
      alert('Error al aprobar vehículo');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectVehicle = async (vehicleId: string) => {
    if (confirm('¿Está seguro de rechazar este vehículo?')) {
      setLoading(true);
      try {
        rejectVehicle(vehicleId);
        loadData(); // Reload data
        alert('Vehículo rechazado');
      } catch (error) {
        alert('Error al rechazar vehículo');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdatePrices = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      updateFuelPrices(fuelPrices);
      loadData();
      alert('Precios actualizados exitosamente');
    } catch (error) {
      alert('Error al actualizar precios');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      updateFuelLimits(fuelLimits);
      loadData();
      alert('Límites actualizados exitosamente');
    } catch (error) {
      alert('Error al actualizar límites');
    } finally {
      setLoading(false);
    }
  };

  const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
  const totalLiters = transactions.reduce((sum, t) => sum + t.liters, 0);
  const totalVehicles = users.filter(u => u.role === 'customer').length;
  const approvedVehicles = pendingVehicles.length;

  // Today's stats
  const today = new Date().toDateString();
  const todayTransactions = transactions.filter(t => t.timestamp.toDateString() === today);
  const todaySales = todayTransactions.reduce((sum, t) => sum + t.total, 0);
  const todayLiters = todayTransactions.reduce((sum, t) => sum + t.liters, 0);

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ventas Hoy</p>
              <p className="text-2xl font-bold text-green-600">Bs. {todaySales.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Total: Bs. {totalSales.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Litros Hoy</p>
              <p className="text-2xl font-bold text-blue-600">{todayLiters.toFixed(1)}L</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Fuel className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Total: {totalLiters.toFixed(1)}L</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clientes Registrados</p>
              <p className="text-2xl font-bold text-purple-600">{totalVehicles}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Usuarios activos</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-orange-600">{approvedVehicles}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Esperando aprobación</p>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Transacciones Recientes</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {transactions.slice(-10).reverse().map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Vehículo: {transaction.vehicleId}</p>
                  <p className="text-sm text-gray-600">{transaction.liters}L</p>
                  <p className="text-xs text-gray-500">
                    {transaction.timestamp.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">Bs. {transaction.total.toFixed(2)}</p>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-xs">Completado</span>
                  </div>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No hay transacciones registradas
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Inventario por Estación</h3>
          <div className="space-y-4">
            {gasStations.map((station) => (
              <div key={station.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{station.name}</span>
                  <span className="text-xs text-gray-500">{station.pumps.length} surtidores</span>
                </div>
                {station.pumps.map((pump: any) => (
                  <div key={pump.id} className="mb-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>
                        {pump.fuelType === 'gasoline' ? 'Gasolina' : 
                         pump.fuelType === 'diesel' ? 'Diésel' : 'Premium'}
                      </span>
                      <span>{pump.currentStock}L / {pump.maxStock}L</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          (pump.currentStock / pump.maxStock) > 0.5 ? 'bg-green-500' :
                          (pump.currentStock / pump.maxStock) > 0.2 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(pump.currentStock / pump.maxStock) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderApprovals = () => (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Vehículos Pendientes de Aprobación</h3>
      <div className="space-y-4">
        {pendingVehicles.map((vehicle) => {
          const owner = users.find(u => u.id === vehicle.userId);
          return (
            <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <Car className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <p className="font-medium">{vehicle.plate}</p>
                  <p className="text-sm text-gray-500">Chasis: {vehicle.chassis}</p>
                  <p className="text-sm text-gray-600">
                    Propietario: {owner?.name} (CI: {owner?.ci})
                  </p>
                  <p className="text-xs text-gray-400">
                    Registrado: {vehicle.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleRejectVehicle(vehicle.id)}
                  disabled={loading}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Rechazar"
                >
                  <XCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleApproveVehicle(vehicle.id)}
                  disabled={loading}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Aprobar"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
        {pendingVehicles.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No hay vehículos pendientes de aprobación
          </p>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Precios de Combustible</h3>
        <form onSubmit={handleUpdatePrices} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gasolina (Bs./L)
              </label>
              <input
                type="number"
                value={fuelPrices.gasoline}
                onChange={(e) => setFuelPrices({...fuelPrices, gasoline: parseFloat(e.target.value)})}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diésel (Bs./L)
              </label>
              <input
                type="number"
                value={fuelPrices.diesel}
                onChange={(e) => setFuelPrices({...fuelPrices, diesel: parseFloat(e.target.value)})}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Premium (Bs./L)
              </label>
              <input
                type="number"
                value={fuelPrices.premium}
                onChange={(e) => setFuelPrices({...fuelPrices, premium: parseFloat(e.target.value)})}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Actualizando...' : 'Actualizar Precios'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Límites de Carga</h3>
        <form onSubmit={handleUpdateLimits} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Límite Diario (L)
              </label>
              <input
                type="number"
                value={fuelLimits.daily}
                onChange={(e) => setFuelLimits({...fuelLimits, daily: parseInt(e.target.value)})}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Límite Mensual (L)
              </label>
              <input
                type="number"
                value={fuelLimits.monthly}
                onChange={(e) => setFuelLimits({...fuelLimits, monthly: parseInt(e.target.value)})}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Actualizando...' : 'Actualizar Límites'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Horarios de Carga por CI</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span>CI terminados en 1, 2, 3</span>
            <span className="font-medium">Lunes y Jueves</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span>CI terminados en 4, 5, 6</span>
            <span className="font-medium">Martes y Viernes</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span>CI terminados en 7, 8, 9, 0</span>
            <span className="font-medium">Miércoles y Sábado</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span>Vehículos Públicos/Privados</span>
            <span className="font-medium">Domingo</span>
          </div>
        </div>
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
              <BarChart3 className="w-8 h-8 text-blue-500 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Panel de Gerencia</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Gerente: {user.name}
              </span>
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
              onClick={() => setActiveTab('approvals')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'approvals'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Aprobaciones
              {pendingVehicles.length > 0 && (
                <span className="ml-1 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {pendingVehicles.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Configuración
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'approvals' && renderApprovals()}
        {activeTab === 'settings' && renderSettings()}
      </main>
    </div>
  );
};