# Reglas de Seguridad de Firebase - Nueva Nave Autos

## Descripción General

Este documento describe las reglas de seguridad implementadas para el sistema de gestión de autos usados "Nueva Nave".

## Estructura de Permisos

### Roles de Usuario
- **Administrador**: Acceso completo a todas las funcionalidades
- **Vendedor**: Acceso limitado según su rol
- **Usuario Inactivo**: Sin acceso al sistema

### Colecciones y Permisos

#### 1. Usuarios (`/users/{userId}`)
- **Lectura**: Usuario propietario o administrador
- **Creación**: Solo administradores
- **Actualización**: Administrador o usuario propietario (si está activo)
- **Eliminación**: Solo administradores
- **Listado**: Solo administradores

#### 2. Vehículos (`/vehicles/{vehicleId}`)
- **Lectura/Listado**: Usuarios activos
- **Creación/Actualización/Eliminación**: Solo administradores

#### 3. Clientes (`/clients/{clientId}`)
- **Lectura/Listado/Creación**: Usuarios activos
- **Actualización**: Vendedores y administradores
- **Eliminación**: Solo administradores

#### 4. Ventas (`/sales/{saleId}`)
- **Lectura/Listado**: Usuarios activos
- **Creación**: Vendedores y administradores
- **Actualización**: Administradores o vendedor propietario
- **Eliminación**: Solo administradores

#### 5. Personal (`/staff/{staffId}`)
- **Lectura/Listado**: Usuarios activos
- **Creación/Actualización/Eliminación**: Solo administradores

#### 6. Servicios (`/services/{serviceId}`)
- **Lectura/Listado**: Usuarios activos
- **Creación/Actualización/Eliminación**: Solo administradores

#### 7. Calendario (`/calendar-events/{eventId}`)
- **Lectura/Listado**: Usuarios activos
- **Creación**: Usuarios activos
- **Actualización**: Administradores o creador del evento
- **Eliminación**: Administradores o creador del evento

#### 8. Configuraciones (`/settings/{settingId}`)
- **Todas las operaciones**: Solo administradores

#### 9. Finanzas (`/finances/{financeId}`)
- **Todas las operaciones**: Solo administradores

#### 10. Comisiones (`/commissions/{commissionId}`)
- **Lectura**: Administradores o vendedor propietario
- **Creación/Actualización/Eliminación**: Solo administradores

## Reglas de Storage

### Estructura de Archivos
- `/vehicles/{vehicleId}/` - Imágenes de vehículos (públicas)
- `/clients/{clientId}/` - Documentos de clientes
- `/sales/{saleId}/` - Documentos de ventas
- `/contracts/{contractId}/` - Contratos y documentos legales
- `/reports/{reportId}/` - Reportes financieros (solo admins)
- `/temp/{userId}/` - Archivos temporales por usuario

### Validaciones
- **Tipos de imagen permitidos**: image/*
- **Tipos de documento permitidos**: PDF, DOC, DOCX, imágenes
- **Tamaño máximo**: 10MB por archivo

## Implementación

### 1. Instalación de Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Autenticación
```bash
firebase login
```

### 3. Inicialización del proyecto (primera vez)
```bash
firebase init
```

### 4. Despliegue de reglas
```bash
# Solo reglas de Firestore
firebase deploy --only firestore:rules

# Solo reglas de Storage
firebase deploy --only storage

# Ambas reglas
firebase deploy --only firestore:rules,storage
```

### 5. Verificación
```bash
# Ver reglas actuales de Firestore
firebase firestore:rules get

# Ver reglas actuales de Storage
firebase storage:rules get
```

## Emuladores Locales

Para probar las reglas localmente:

```bash
# Iniciar emuladores
firebase emulators:start --only firestore,storage,auth

# UI del emulador disponible en: http://localhost:4000
```

## Consideraciones de Seguridad

1. **Validación del lado del cliente**: Las reglas de Firebase son la última línea de defensa
2. **Tokens de autenticación**: Se validan automáticamente
3. **Logs de auditoría**: Implementar logging para operaciones críticas
4. **Revisión periódica**: Revisar y actualizar reglas según cambios en la aplicación

## Funciones de Validación

### `isAuthenticated()`
Verifica que el usuario esté autenticado.

### `isAdmin()`
Verifica que el usuario tenga rol de administrador.

### `isVendedorOrAdmin()`
Verifica que el usuario sea vendedor o administrador.

### `isActiveUser()`
Verifica que el usuario esté activo en el sistema.

### `isOwner(userId)`
Verifica que el usuario sea el propietario del recurso.

## Notas Importantes

- Todas las reglas siguen el principio de menor privilegio
- Los usuarios inactivos no tienen acceso al sistema
- Los administradores tienen acceso completo
- Los vendedores tienen acceso limitado según su rol
- Las reglas incluyen validación de tipos de archivo y tamaños
- Se registran todas las operaciones para auditoría

## Contacto

Para dudas sobre las reglas de seguridad, contactar al administrador del sistema.
