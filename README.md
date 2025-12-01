# 🔌 WebSocket Tester - Laravel Reverb

Aplicación Vue 2 para probar conexiones WebSocket con Laravel Reverb en entorno local.

> ⚠️ **Proyecto para uso exclusivo en LOCAL** - Diseñado para hacer pruebas de WebSocket en desarrollo

---

## 🚀 Instalación y Configuración

### 1️⃣ Instalar dependencias
```bash
npm install
```

### 2️⃣ Configurar la conexión WebSocket

Edita el archivo **`config.js`** en la raíz del proyecto con tus valores locales:

```javascript
export default {
  websocket: {
    host: 'mia-v2.test',      // Tu dominio local de Laravel
    port: 6001,                // Puerto de Reverb (por defecto 6001)
    protocol: 'ws',            // Usar 'ws' en local
    forceTLS: false,           // false para desarrollo local
  },

  // ⚠️ IMPORTANTE: Obtén este valor de tu .env de Laravel
  // Variable: REVERB_APP_KEY o PUSHER_APP_KEY
  appKey: 'TU_APP_KEY_AQUI', 

  channels: {
    prefix: 'presence-',       // Prefijo de tus canales
    defaultChannel: 'channel', // Canal por defecto al conectar
  }
}
```

#### 🔍 ¿Dónde encontrar el APP_KEY?

En tu proyecto Laravel, revisa el archivo `.env`:
```env
REVERB_APP_KEY=tu-app-key-aqui
```

### 3️⃣ Levantar el proyecto
```bash
npm run dev
```

El servidor se levantará en: **http://localhost:3000**

---

## 🎮 Cómo usar

### Pantalla de Conexión
1. Ingresa tu **token de acceso** (Bearer token de tu aplicación Laravel)
2. Ingresa el **nombre del canal** (solo el nombre, sin el prefijo)
   - Ejemplo: Si tu canal es `presence-chat`, ingresa solo `chat`
3. Click en **Conectar**

### Panel de Eventos
Una vez conectado verás:
- 🟢 **Estado de conexión** y canal actual en el header
- 📥 **Eventos en tiempo real** que se reciben del WebSocket
- 🔄 **Cambiar de canal** sin desconectar
- 🔑 **Cambiar token** (reconecta automáticamente)
- 🗑️ **Limpiar eventos** para vaciar el historial

### Tipos de eventos mostrados
- **Verde** 🟢 Eventos del sistema (conexión exitosa, suscripción)
- **Azul** 🔵 Mensajes/eventos normales
- **Rojo** 🔴 Errores de conexión o suscripción

---

## ⚙️ Configuración Detallada

### Archivo `config.js`

| Parámetro | Descripción | Valor Local |
|-----------|-------------|-------------|
| `websocket.host` | Dominio de tu Laravel | `mia-v2.test` |
| `websocket.port` | Puerto del WebSocket | `6001` |
| `websocket.protocol` | Protocolo de conexión | `ws` (local) / `wss` (producción) |
| `websocket.forceTLS` | Forzar TLS/SSL | `false` en local |
| `appKey` | App Key de Reverb | Obtenlo de tu `.env` |
| `channels.prefix` | Prefijo automático | `presence-`, `private-`, etc |
| `channels.defaultChannel` | Canal por defecto | Cualquier nombre |

### Cambiar configuración sin editar código

Todo está centralizado en `config.js`, modifica solo ese archivo según tus necesidades.

---

## 🧪 Pruebas en Local

### Requisitos previos
1. ✅ Proyecto Laravel corriendo (con Reverb configurado)
2. ✅ Reverb server activo:
   ```bash
   php artisan reverb:start
   ```
3. ✅ Token válido generado en tu aplicación Laravel

### Flujo de pruebas típico

1. **Inicia Reverb** en tu proyecto Laravel
2. **Levanta este front** con `npm run dev`
3. **Obtén un token** de tu aplicación Laravel (autenticación)
4. **Conéctate** desde la interfaz
5. **Dispara eventos** desde Laravel y obsérvalos aquí en tiempo real

### Ejemplo: Disparar evento desde Laravel

```php
// En tu código Laravel
broadcast(new MiEvento($data))->toOthers();
```

Verás el evento aparecer instantáneamente en el panel.

---

## 📦 Comandos Disponibles

```bash
# Desarrollo - Hot reload habilitado
npm run dev

# Build para producción (si lo necesitas)
npm run build

# Previsualizar build
npm run preview
```

---

## 🛠️ Stack Tecnológico

- **Vue 2** - Framework JavaScript
- **Vite** - Build tool y dev server
- **Laravel Echo** - Cliente WebSocket para Laravel
- **Pusher JS** - Librería de Pusher (compatible con Reverb)
- **Laravel Reverb** - WebSocket server de Laravel

---

## 🐛 Troubleshooting

### No se conecta al WebSocket
- ✅ Verifica que Reverb esté corriendo: `php artisan reverb:start`
- ✅ Comprueba el puerto en `config.js` (debe ser 6001 por defecto)
- ✅ Asegúrate que el `appKey` coincida con tu `.env`

### Error de suscripción al canal
- ✅ Verifica que el token sea válido
- ✅ Comprueba que el usuario tenga permisos para el canal
- ✅ Revisa las rutas de broadcasting en Laravel (`routes/channels.php`)

### No aparecen eventos
- ✅ Confirma que estás en el canal correcto
- ✅ Verifica que el evento se esté disparando desde Laravel
- ✅ Chequea la consola del navegador por errores

### Problemas de CORS
- ✅ En Laravel, configura CORS en `config/cors.php`
- ✅ Asegúrate que `localhost:3000` esté permitido

---

## 📝 Notas Importantes

- 🔒 Los canales `presence-*` requieren autenticación
- 🔒 Los canales `private-*` también requieren autenticación  
- 📡 Los canales públicos no necesitan autenticación
- 🔑 El token debe ser un Bearer token válido de Laravel
- ⏱️ Los eventos se muestran en orden inverso (más reciente arriba)
- 💾 El historial se limpia al refrescar la página

---

## 🎯 Uso Recomendado

Este proyecto es ideal para:
- ✅ Testear eventos WebSocket en desarrollo
- ✅ Debuggear problemas de broadcasting
- ✅ Verificar permisos de canales
- ✅ Probar tokens de autenticación
- ✅ Monitorear eventos en tiempo real

---

**¡Listo para probar tu WebSocket! 🚀**
