import React, { useState, useRef } from 'react'; // Importamos useRef
import { User, LogIn, UserPlus,  Upload, X } from 'lucide-react'; // Importamos el ícono X
import { login as authLogin, register as authRegister } from '../services/auth';

interface AuthFormProps {
  onLogin: (user: any) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  
  const [registerData, setRegisterData] = useState({
    name: '',
    ci: '',
    photo: '' // Aquí guardaremos la imagen en formato Base64
  });

  // Refs para los inputs de archivo ocultos
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const user = await authLogin(loginData.username, loginData.password);
      if (user) {
        onLogin(user);
      } else {
        setError('Credenciales inválidas');
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (!registerData.name || !registerData.ci) {
        setError('Todos los campos son obligatorios');
        setLoading(false); // Detenemos el loading
        return;
      }
      
      const user = await authRegister({
        name: registerData.name,
        ci: registerData.ci,
        photo: registerData.photo, // Ya tiene la imagen en Base64
        role: 'customer'
      });
      
      onLogin(user);
    } catch (err) {
      setError('Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  // --- NUEVAS FUNCIONES PARA MANEJAR LA FOTO ---

  // Se ejecuta cuando el usuario selecciona un archivo o toma una foto
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Guardamos la imagen como una cadena de texto Base64
        setRegisterData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Simula un clic en el input para subir archivo
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
 

  // Limpia la foto seleccionada
  const clearPhoto = () => {
    setRegisterData(prev => ({ ...prev, photo: '' }));
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Combustible</h1>
          <p className="text-gray-600 mt-2">Gestión de carga de combustible</p>
        </div>

        <div className="flex mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 px-4 rounded-l-lg font-medium transition-all duration-200 ${
              isLogin
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <LogIn className="w-4 h-4 inline mr-2" />
            Iniciar Sesión
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 px-4 rounded-r-lg font-medium transition-all duration-200 ${
              !isLogin
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <UserPlus className="w-4 h-4 inline mr-2" />
            Registrarse
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* ... Formulario de Login sin cambios ... */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario / CI
              </label>
              <input
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Ingrese su usuario o CI"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Ingrese su contraseña"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            {/* ... Campos de Nombre y CI sin cambios ... */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Ingrese su nombre completo"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cédula de Identidad
              </label>
              <input
                type="text"
                value={registerData.ci}
                onChange={(e) => setRegisterData({ ...registerData, ci: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Ingrese su CI"
                required
              />
            </div>
            
            {/* --- SECCIÓN DE FOTO MODIFICADA --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foto de Perfil (Opcional)
              </label>
              
              {/* INPUTS OCULTOS */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoChange}
                accept="image/*" 
                style={{ display: 'none' }} 
              />
              <input 
                type="file" 
                ref={cameraInputRef} 
                onChange={handlePhotoChange}
                accept="image/*" 
                capture="user" 
                style={{ display: 'none' }}
              />

              {/* VISTA PREVIA DE LA IMAGEN */}
              {registerData.photo ? (
                <div className="mt-2 relative w-32 h-32 mx-auto">
                  <img src={registerData.photo} alt="Vista previa" className="w-full h-full object-cover rounded-full shadow-md" />
                  <button 
                    type="button" 
                    onClick={clearPhoto}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all"
                    aria-label="Eliminar foto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="flex-1 flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Subir Foto
                  </button>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};