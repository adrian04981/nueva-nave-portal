# Nueva Nave - PWA para iOS

## 📱 Aplicación Web Progresiva Optimizada para iPhone

Nueva Nave está optimizada para funcionar como una aplicación nativa en dispositivos iOS, especialmente iPhones. La aplicación utiliza las últimas tecnologías PWA para ofrecer una experiencia fluida y nativa.

## 🚀 Características PWA

### ✅ Funcionalidades Implementadas
- **Instalación como app nativa** en iPhone
- **Funciona sin conexión** (datos en caché)
- **Safe Area Insets** para iPhone con notch
- **Diseño responsive** optimizado para móviles
- **Navegación sin barra del navegador**
- **Splash screen** personalizada
- **Iconos optimizados** para todas las resoluciones iOS
- **Touch gestures** nativos
- **Prevención de zoom** en inputs

### 📱 Optimizaciones para iOS
- **Viewport configurado** para iOS
- **Status bar** transparente y adaptable
- **Scroll nativo** de iOS
- **Tap highlights** deshabilitados
- **Área de toque mínima** de 44px
- **Notificaciones push** (preparado para futuro)

## 📋 Instrucciones de Instalación para Usuarios

### Para iPhone (Safari)
1. **Abrir Safari** y navegar a la aplicación
2. **Tocar el botón "Compartir"** (📤) en la parte inferior
3. **Seleccionar "Agregar a la pantalla de inicio"**
4. **Personalizar el nombre** si se desea
5. **Tocar "Agregar"** para confirmar

### Después de la Instalación
- La app aparecerá en la pantalla de inicio
- Se abrirá en modo pantalla completa (sin barra del navegador)
- Funcionará incluso sin conexión a internet
- Tendrá acceso a funciones nativas del dispositivo

## 🛠️ Configuración Técnica

### Manifest.json
```json
{
  "name": "Nueva Nave - Gestión de Autos",
  "short_name": "Nueva Nave",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#3498db",
  "background_color": "#ffffff"
}
```

### Meta Tags iOS
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Nueva Nave">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
```

### Service Worker
- **Caché offline** de recursos críticos
- **Actualización automática** en segundo plano
- **Sincronización en background**
- **Notificaciones push** (preparado)

## 🎨 Iconos y Assets

### Tamaños de Iconos iOS
- **180x180** - iPhone @3x
- **152x152** - iPad @2x
- **144x144** - iPad @2x
- **120x120** - iPhone @3x
- **114x114** - iPhone @2x
- **76x76** - iPad
- **72x72** - iPad
- **60x60** - iPhone @2x
- **57x57** - iPhone original

### Splash Screens
- **1125x2436** - iPhone X/XS
- **1242x2148** - iPhone Plus
- **750x1294** - iPhone 6/7/8
- **640x1136** - iPhone 5/SE

## 📊 Funcionalidades Responsive

### Breakpoints
```scss
// Móviles pequeños
@media (max-width: 480px) { }

// Móviles
@media (max-width: 767px) { }

// Tablets
@media (min-width: 768px) { }

// Desktop
@media (min-width: 1024px) { }
```

### Componentes Adaptables
- **Sidebar colapsable** en móviles
- **Menú hamburguesa** en pantallas pequeñas
- **Cards responsivas** con scroll horizontal
- **Formularios optimizados** para touch
- **Botones con área mínima** de 44px

## 🔧 Desarrollo y Deploy

### Comandos de Build
```bash
# Desarrollo
npm start

# Build para producción
npm run build

# Build con PWA optimizada
npm run build:pwa
```

### Verificar PWA
1. **Chrome DevTools** > Application > Manifest
2. **Lighthouse** audit para PWA
3. **iOS Simulator** para pruebas reales

### Deploy
- **Firebase Hosting** (recomendado)
- **Nginx** con HTTPS obligatorio
- **Service Worker** debe servirse desde raíz

## 📱 Testing en Dispositivos

### iOS Real
1. Abrir en Safari en iPhone
2. Verificar funcionalidad de instalación
3. Probar en modo offline
4. Verificar safe areas y orientación

### iOS Simulator
```bash
# Xcode Simulator
open -a Simulator
```

## 🚨 Consideraciones Importantes

### Limitaciones iOS
- **Solo Safari** soporta instalación PWA
- **Sin notificaciones push** nativas (por ahora)
- **Limitaciones de storage** comparado con apps nativas
- **Requiere HTTPS** en producción

### Mejores Prácticas
- **Siempre usar HTTPS** en producción
- **Comprimir imágenes** para mejor rendimiento
- **Caché inteligente** de recursos
- **Fallbacks offline** para funcionalidad crítica

## 📞 Soporte

Para problemas con la instalación o funcionamiento de la PWA:

1. **Verificar Safari** actualizado
2. **Comprobar conexión** a internet
3. **Limpiar caché** del navegador
4. **Reinstalar** la aplicación

## 🔄 Actualizaciones

La aplicación se actualiza automáticamente. Cuando hay una nueva versión:
1. Se descarga en segundo plano
2. Se notifica al usuario
3. Se aplica al reiniciar la app

---

**Nueva Nave PWA** - Gestión de autos optimizada para iPhone 📱🚗
