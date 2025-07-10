# Sistema de Gestión de Carga de Combustible

Una aplicación web para gestionar la carga de combustible con diferentes roles de usuario.

## 🚀 Características

- **Autenticación de usuarios** con diferentes roles
- **Dashboard específico** para cada tipo de usuario
- **Gestión de combustible** con límites y días asignados
- **Notificaciones** en tiempo real
- **Almacenamiento local** (no requiere servidor)

## 👥 Roles de Usuario

### Despachador (Operador)
- **Usuario:** `despachador`
- **Contraseña:** `1234`
- Funciones: Gestionar cargas de combustible

### Gerente
- **Usuario:** `gerente`
- **Contraseña:** `gerente123`
- Funciones: Supervisión y reportes

### Cliente
- **Usuario:** Tu número de CI
- **Contraseña:** Registrarse primero
- Funciones: Ver estado de combustible y días asignados

## 📅 Días de Carga por CI

- **Terminados en 1, 2, 3:** Lunes y Jueves
- **Terminados en 4, 5, 6:** Martes y Viernes
- **Terminados en 7, 8, 9, 0:** Miércoles y Sábado
- **Otros:** Domingo

## 🛠️ Tecnologías

- React 18
- TypeScript
- Vite
- Tailwind CSS
- LocalStorage para persistencia

## 🚀 Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/josthin75/combustiblegestor.git

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

## 🌐 Demo

Visita: [https://josthin75.github.io/combustiblegestor/](https://josthin75.github.io/combustiblegestor/)

## 📝 Notas

- Los datos se almacenan en el navegador (localStorage)
- No requiere servidor backend
- Funciona completamente offline 