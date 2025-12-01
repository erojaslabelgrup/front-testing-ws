// Configuración del WebSocket - Modifica estos valores según tus necesidades
export default {
  // Configuración del servidor WebSocket
  websocket: {
    host: 'mia-v2.test',
    port: 6001,
    protocol: 'ws', // 'ws' o 'wss'
    forceTLS: false,
  },

  // Key de la aplicación Reverb
  appKey: 'imtfhk1qircfyuthv05j', // Modifica esto con tu APP_KEY de Reverb

  // Configuración de autenticación
  auth: {
    endpoint: 'http://mia-v2.test/api/broadcasting/auth', // URL completa del endpoint de autenticación
  },

  // Configuración de canales
  channels: {
    prefix: 'presence-', // Prefijo por defecto para los canales
    defaultChannel: 'channel', // Canal por defecto
  },

  // Opciones adicionales de Echo/Pusher
  echoOptions: {
    broadcaster: 'reverb',
    enabledTransports: ['ws', 'wss'],
  }
}
