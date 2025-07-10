import React, { useState, useEffect } from 'react';
import { Fuel, Search, CheckCircle, XCircle, Clock, AlertTriangle,  } from 'lucide-react';
import { User as UserType } from '../types';
import { 
  getGasStations, 
  findVehicleByPlate, 
  createTransaction, 
  getAllTransactions,
  getAllUsers 
} from '../services/data';

interface OperatorDashboardProps {
  user: UserType;
  onLogout: () => void;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({ user, onLogout }) => {
  const [searchPlate, setSearchPlate] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [vehicleOwner, setVehicleOwner] = useState<any>(null);
  const [liters, setLiters] = useState('');
  const [selectedPump, setSelectedPump] = useState('');
  const [waitingApproval, setWaitingApproval] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [gasStations, setGasStations] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTransactions(getAllTransactions());
    setGasStations(getGasStations());
  };

  const handleSearch = async () => {
    if (!searchPlate.trim()) {
      setError('Por favor ingrese una placa');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const vehicle = findVehicleByPlate(searchPlate.trim());
      if (vehicle) {
        setSelectedVehicle(vehicle);
        
        // Find vehicle owner
        const users = getAllUsers();
        const owner = users.find((u: any) => u.id === vehicle.userId);
        setVehicleOwner(owner);
        
        if (!vehicle.approved) {
          setError('Este vehículo no está aprobado para cargar combustible');
        }
      } else {
        setError('Vehículo no encontrado');
        setSelectedVehicle(null);
        setVehicleOwner(null);
      }
    } catch (err) {
      setError('Error al buscar vehículo');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestApproval = async () => {
    if (!selectedVehicle || !liters || !selectedPump || !vehicleOwner) {
      setError('Por favor complete todos los campos');
      return;
    }

    const litersNum = parseFloat(liters);
    if (litersNum <= 0 || litersNum > 200) {
      setError('La cantidad de litros debe ser entre 1 y 200');
      return;
    }

    // Check fuel limit
    if (vehicleOwner.fuelUsed + litersNum > vehicleOwner.fuelLimit) {
      setError(`El cliente ha excedido su límite de combustible. Disponible: ${vehicleOwner.fuelLimit - vehicleOwner.fuelUsed}L`);
      return;
    }

    setWaitingApproval(true);
    setError('');
    
    try {
      // Simulate approval process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Find pump details
      const pump = gasStations
        .flatMap(station => station.pumps)
        .find(p => p.id === selectedPump);
      
      if (!pump) {
        throw new Error('Surtidor no encontrado');
      }

      if (pump.currentStock < litersNum) {
        throw new Error(`Stock insuficiente. Disponible: ${pump.currentStock}L`);
      }
      
      // Create transaction
      const newTransaction = createTransaction({
        vehicleId: selectedVehicle.id,
        userId: selectedVehicle.userId,
        pumpId: selectedPump,
        operatorId: user.id,
        liters: litersNum,
        pricePerLiter: pump.pricePerLiter
      });
      
      // Reset form
      setSelectedVehicle(null);
      setVehicleOwner(null);
      setLiters('');
      setSelectedPump('');
      setSearchPlate('');
      
      // Reload data
      loadData();
      
      alert(`Transacción completada exitosamente. Total: Bs. ${newTransaction.total.toFixed(2)}`);
      
    } catch (err: any) {
      setError(err.message || 'Error al procesar la transacción');
    } finally {
      setWaitingApproval(false);
    }
  };

  const todayTransactions = transactions.filter(t => 
    t.timestamp.toDateString() === new Date().toDateString()
  );

  const totalSales = todayTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalLiters = todayTransactions.reduce((sum, t) => sum + t.liters, 0);

  const selectedPumpDetails = gasStations
    .flatMap(station => station.pumps)
    .find(p => p.id === selectedPump);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Fuel className="w-8 h-8 text-blue-500 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Panel de Operario</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Operario: {user.name}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vehicle Search and Dispensing */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Vehicle */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Buscar Vehículo</h3>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={searchPlate}
                  onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
                  placeholder="Ingrese placa (ej: ABC-123)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50"
                >
                  <Search className="w-5 h-5 mr-2" />
                  {loading ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
            </div>

            {/* Vehicle Information */}
            {selectedVehicle && vehicleOwner && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Información del Vehículo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Placa</p>
                    <p className="font-semibold text-lg">{selectedVehicle.plate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Chasis</p>
                    <p className="font-semibold">{selectedVehicle.chassis}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Propietario</p>
                    <p className="font-semibold">{vehicleOwner.name}</p>
                    <p className="text-sm text-gray-500">CI: {vehicleOwner.ci}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <div className="flex items-center">
                      {selectedVehicle.approved ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="w-5 h-5 mr-1" />
                          <span>Aprobado</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <XCircle className="w-5 h-5 mr-1" />
                          <span>No Aprobado</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fuel Usage Info */}
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Límite de Combustible</h4>
                  <div className="flex items-center justify-between">
                    <span>Usado: {vehicleOwner.fuelUsed}L</span>
                    <span>Límite: {vehicleOwner.fuelLimit}L</span>
                    <span className="font-semibold text-green-600">
                      Disponible: {vehicleOwner.fuelLimit - vehicleOwner.fuelUsed}L
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((vehicleOwner.fuelUsed / vehicleOwner.fuelLimit) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {selectedVehicle.approved && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Litros a Despachar *
                        </label>
                        <input
                          type="number"
                          value={liters}
                          onChange={(e) => setLiters(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                          min="1"
                          max="200"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Surtidor *
                        </label>
                        <select
                          value={selectedPump}
                          onChange={(e) => setSelectedPump(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Seleccionar surtidor</option>
                          {gasStations.map(station => 
                            station.pumps.map((pump: any) => (
                              <option key={pump.id} value={pump.id}>
                                {station.name} - Surtidor {pump.number} - {
                                  pump.fuelType === 'gasoline' ? 'Gasolina' : 
                                  pump.fuelType === 'diesel' ? 'Diésel' : 'Premium'
                                } (Bs. {pump.pricePerLiter}) - Stock: {pump.currentStock}L
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    </div>

                    {liters && selectedPumpDetails && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Cantidad:</p>
                            <p className="text-lg font-bold text-green-600">{liters}L</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total a cobrar:</p>
                            <p className="text-2xl font-bold text-green-600">
                              Bs. {(parseFloat(liters) * selectedPumpDetails.pricePerLiter).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleRequestApproval}
                      disabled={!liters || !selectedPump || waitingApproval || parseFloat(liters) <= 0}
                      className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {waitingApproval ? (
                        <>
                          <Clock className="w-5 h-5 mr-2 animate-spin" />
                          Procesando Transacción...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Procesar Carga
                        </>
                      )}
                    </button>
                  </div>
                )}

                {!selectedVehicle.approved && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center text-red-600">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      <span>Este vehículo no está aprobado para cargar combustible</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sales Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Resumen del Turno</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Transacciones:</span>
                  <span className="font-semibold">{todayTransactions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Litros:</span>
                  <span className="font-semibold">
                    {totalLiters.toFixed(1)}L
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Ventas:</span>
                  <span className="font-semibold text-green-600">
                    Bs. {totalSales.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Transacciones Recientes</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {todayTransactions.slice(-10).reverse().map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{transaction.vehicleId}</p>
                      <p className="text-sm text-gray-600">{transaction.liters}L</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">Bs. {transaction.total.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">
                        {transaction.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {todayTransactions.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No hay transacciones hoy
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};