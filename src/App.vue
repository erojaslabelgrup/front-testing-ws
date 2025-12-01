<template>
  <div id="app">
    <!-- Connection form -->
    <div v-if="!connected" class="connection-form">
      <div class="card">
        <h1>🔌 WebSocket Tester</h1>
        <p class="subtitle">Connect to Reverb</p>
        
        <div v-if="authError" class="error-message">
          <strong>❌ Authentication Error</strong>
          <p>{{ authError }}</p>
        </div>

        <div class="form-group">
          <label>Host</label>
          <input 
            v-model="host" 
            type="text" 
            placeholder="mia-v2.test"
            @keyup.enter="connect"
          />
        </div>

        <div class="form-group">
          <label>Port</label>
          <input 
            v-model.number="port" 
            type="number" 
            placeholder="6001"
            @keyup.enter="connect"
          />
        </div>

        <div class="form-group">
          <label>APP KEY</label>
          <input 
            v-model="appKey" 
            type="text" 
            placeholder="imtfhk1qircfyuthv05j"
            @keyup.enter="connect"
          />
        </div>
        
        <div class="form-group">
          <label>Access Token</label>
          <input 
            v-model="token" 
            type="text" 
            placeholder="Enter your token"
            @keyup.enter="connect"
          />
        </div>

        <div class="form-group">
          <label>Channel Type</label>
          <select v-model="channelType" class="channel-type-select">
            <option value="public">Public</option>
            <option value="private">Private (private-)</option>
            <option value="presence">Presence (presence-)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Channel Name</label>
          <div class="input-with-prefix">
            <span class="prefix" v-if="channelPrefix">{{ channelPrefix }}</span>
            <input 
              v-model="channelName" 
              type="text" 
              placeholder="channel-name"
              @keyup.enter="connect"
            />
          </div>
        </div>

        <button @click="connect" class="btn-primary" :disabled="!token || !channelName || !host || !port || !appKey || connecting">
          {{ connecting ? 'Connecting...' : 'Connect' }}
        </button>

        <div class="config-info">
          <p><strong>Auth endpoint:</strong> {{ config.auth.endpoint }}</p>
        </div>
      </div>
    </div>

    <!-- Events panel -->
    <div v-else class="events-panel">
      <div class="header">
        <div class="connection-info">
          <span class="status-dot"></span>
          <span>Connected to: <strong>{{ currentChannel }}</strong></span>
        </div>
        <button @click="disconnect" class="btn-disconnect">Disconnect</button>
      </div>

      <div class="controls">
        <div class="change-channel">
          <select v-model="newChannelType" class="channel-type-select">
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="presence">Presence</option>
          </select>
          <div class="input-with-prefix">
            <span class="prefix" v-if="newChannelPrefix">{{ newChannelPrefix }}</span>
            <input 
              v-model="newChannelName" 
              type="text" 
              placeholder="new-channel"
              @keyup.enter="changeChannel"
            />
          </div>
          <button @click="changeChannel" class="btn-secondary" :disabled="!newChannelName">
            Change Channel
          </button>
        </div>

        <div class="change-token">
          <input 
            v-model="newToken" 
            type="text" 
            placeholder="New token"
            @keyup.enter="changeToken"
          />
          <button @click="changeToken" class="btn-secondary" :disabled="!newToken">
            Change Token
          </button>
        </div>

        <button @click="clearEvents" class="btn-clear">Clear Events</button>
      </div>

      <div class="send-event-form">
        <div class="send-event-header">
          <h3>📤 Send Event</h3>
          <p class="send-event-subtitle">Send client events using whisper (private & presence channels only)</p>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Event Name</label>
            <input 
              v-model="eventName" 
              type="text" 
              placeholder="MyCustomEvent"
              @keyup.enter="sendEvent"
            />
          </div>
          <div class="form-group form-group-wide">
            <label>Event Data (JSON)</label>
            <textarea 
              v-model="eventData" 
              placeholder='{"message": "Hello world", "user": "John"}'
              rows="4"
            ></textarea>
          </div>
          <div class="button-wrapper">
            <button @click="sendEvent" class="btn-send" :disabled="!eventName || sending">
              <span v-if="!sending">🚀 Send Event</span>
              <span v-else>⏳ Sending...</span>
            </button>
          </div>
        </div>
        <div v-if="sendError" class="error-message">
          <strong>❌ Error sending event</strong>
          <p>{{ sendError }}</p>
        </div>
        <div v-if="sendSuccess" class="success-message">
          <strong>✅ Event sent successfully</strong>
        </div>
      </div>

      <div class="events-container">
        <div class="events-header">
          <h3>Received Events ({{ events.length }})</h3>
        </div>
        
        <div class="events-list" ref="eventsList">
          <div v-if="events.length === 0" class="no-events">
            <p>⏳ Waiting for events...</p>
          </div>
          
          <div 
            v-for="(event, index) in events" 
            :key="index" 
            class="event-item"
            :class="event.type"
          >
            <div class="event-header">
              <span class="event-type">{{ event.name }}</span>
              <span class="event-time">{{ event.time }}</span>
            </div>
            <div class="event-channel">
              <strong>Channel:</strong> {{ event.channel }}
            </div>
            <pre class="event-data">{{ event.data }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import config from '../config.js'

window.Pusher = Pusher

export default {
  name: 'App',
  data() {
    return {
      config: config,
      host: config.websocket.host,
      port: config.websocket.port,
      appKey: config.appKey,
      token: '',
      channelType: 'presence',
      channelName: config.channels.defaultChannel,
      newChannelType: 'presence',
      newChannelName: '',
      newToken: '',
      connected: false,
      connecting: false,
      currentChannel: '',
      events: [],
      echo: null,
      channel: null,
      authError: null,
      eventName: '',
      eventData: '{\n  "message": "Hello world"\n}',
      sending: false,
      sendError: null,
      sendSuccess: false,
    }
  },
  computed: {
    channelPrefix() {
      if (this.channelType === 'private') return 'private-'
      if (this.channelType === 'presence') return 'presence-'
      return ''
    },
    newChannelPrefix() {
      if (this.newChannelType === 'private') return 'private-'
      if (this.newChannelType === 'presence') return 'presence-'
      return ''
    },
    fullChannelName() {
      return `${this.channelPrefix}${this.channelName}`
    }
  },
  methods: {
    connect() {
      if (!this.token || !this.channelName) return

      this.authError = null
      this.connecting = true
      this.events = []

      try {
        const fullChannel = this.fullChannelName
        
        this.echo = new Echo({
          broadcaster: 'reverb',
          key: this.appKey,
          wsHost: this.host,
          wsPort: this.port,
          wssPort: this.port,
          forceTLS: config.websocket.forceTLS,
          enabledTransports: ['ws', 'wss'],
          authEndpoint: config.auth.endpoint,
          auth: {
            headers: {
              Authorization: `Bearer ${this.token}`,
              'Accept': 'application/json',
            }
          }
        })

        this.subscribeToChannel(fullChannel)
      } catch (error) {
        this.connecting = false
        this.authError = error.message || 'Error connecting to server'
        this.cleanup()
      }
    },

    subscribeToChannel(channelName) {
      const channelType = this.getChannelTypeFromName(channelName)
      
      // Remover el prefijo si existe, ya que los métodos lo añaden automáticamente
      let cleanChannelName = channelName
      if (channelType === 'private' && channelName.startsWith('private-')) {
        cleanChannelName = channelName.replace('private-', '')
      } else if (channelType === 'presence' && channelName.startsWith('presence-')) {
        cleanChannelName = channelName.replace('presence-', '')
      }
      
      if (channelType === 'public') {
        this.channel = this.echo.channel(cleanChannelName)
      } else if (channelType === 'private') {
        this.channel = this.echo.private(cleanChannelName)
      } else {
        this.channel = this.echo.join(cleanChannelName)
      }
      
      this.channel
        .listen('.', (data) => {
          this.addEvent('message', 'Message Received', channelName, data)
        })
        .listenToAll((eventName, data) => {
          this.addEvent('message', eventName, channelName, data)
        })

      // Listen for whisper events (client events)
      if (channelType === 'private' || channelType === 'presence') {
        this.channel.listenForWhisper('*', (data) => {
          this.addEvent('whisper', 'Whisper Received', channelName, data)
        })
      }

      // Pusher events
      this.channel.on('pusher:subscription_succeeded', () => {
        this.connecting = false
        this.connected = true
        this.currentChannel = channelName
        
        this.addEvent('system', 'pusher:subscription_succeeded', channelName, {
          message: 'Subscription successful'
        })
      })

      this.channel.on('pusher:subscription_error', (error) => {
        this.connecting = false
        this.connected = false
        
        let errorMsg = 'Authentication error. Check your token.'
        
        if (error?.status === 403) {
          errorMsg = '❌ Access denied (403): Token is invalid or you don\'t have permissions for this channel.'
        } else if (error?.status === 401) {
          errorMsg = '❌ Unauthorized (401): Authentication token is invalid or has expired.'
        } else if (error?.status === 0) {
          errorMsg = '❌ Connection error: Cannot connect to authentication server. Check CORS.'
        } else if (error?.error) {
          errorMsg = `❌ Error: ${error.error}`
        } else if (error?.message) {
          errorMsg = `❌ Error: ${error.message}`
        }
        
        this.authError = errorMsg
        
        this.cleanup()
      })
    },

    changeChannel() {
      if (!this.newChannelName) return

      if (this.channel) {
        this.echo.leave(this.currentChannel)
      }

      this.events = []
      const fullChannel = `${this.newChannelPrefix}${this.newChannelName}`
      this.subscribeToChannel(fullChannel)
      this.currentChannel = fullChannel
      this.channelType = this.newChannelType
      this.channelName = this.newChannelName
      this.newChannelName = ''

      this.addEvent('system', 'Channel Changed', fullChannel, {
        message: `Changed to channel ${fullChannel}`
      })
    },

    changeToken() {
      if (!this.newToken) return

      this.disconnect()
      this.token = this.newToken
      this.newToken = ''
      this.connect()
    },

    async sendEvent() {
      if (!this.eventName) return

      this.sending = true
      this.sendError = null
      this.sendSuccess = false

      try {
        let data = {}
        if (this.eventData.trim()) {
          try {
            data = JSON.parse(this.eventData)
          } catch (e) {
            throw new Error('Invalid JSON data format')
          }
        }

        // Whisper works on private and presence channels
        if (this.channelType === 'private' || this.channelType === 'presence') {
          this.channel.whisper(this.eventName, data)
          
          this.addEvent('system', `Whisper sent: ${this.eventName}`, this.currentChannel, data)
          this.sendSuccess = true
          
          setTimeout(() => {
            this.sendSuccess = false
          }, 3000)
        } else {
          throw new Error('Events can only be sent on private or presence channels')
        }

        this.eventName = ''
        this.eventData = '{\n  "message": "Hello world"\n}'
      } catch (error) {
        this.sendError = error.message
        setTimeout(() => {
          this.sendError = null
        }, 5000)
      } finally {
        this.sending = false
      }
    },

    disconnect() {
      this.cleanup()
      this.connected = false
      this.currentChannel = ''
      this.events = []
    },

    cleanup() {
      if (this.echo) {
        if (this.channel) {
          this.echo.leave(this.currentChannel)
        }
        this.echo.disconnect()
      }
      this.echo = null
      this.channel = null
    },

    addEvent(type, name, channel, data) {
      const event = {
        type,
        name,
        channel,
        data: JSON.stringify(data, null, 2),
        time: new Date().toLocaleTimeString()
      }
      
      this.events.unshift(event)
      
      this.$nextTick(() => {
        if (this.$refs.eventsList) {
          this.$refs.eventsList.scrollTop = 0
        }
      })
    },

    clearEvents() {
      this.events = []
    },

    getChannelTypeFromName(channelName) {
      if (channelName.startsWith('presence-')) return 'presence'
      if (channelName.startsWith('private-')) return 'private'
      return 'public'
    }
  },

  beforeDestroy() {
    this.disconnect()
  }
}
</script>

<style scoped>
#app {
  max-width: 1200px;
  margin: 0 auto;
}

.connection-form {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

.card {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
}

h1 {
  color: #333;
  margin-bottom: 10px;
  font-size: 32px;
  text-align: center;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

.input-with-prefix {
  display: flex;
  align-items: center;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.3s;
}

.input-with-prefix:focus-within {
  border-color: #667eea;
}

.prefix {
  background: #f5f5f5;
  padding: 12px 16px;
  color: #666;
  font-weight: 600;
  white-space: nowrap;
}

.input-with-prefix input {
  border: none;
  flex: 1;
}

.channel-type-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s;
}

.channel-type-select:focus {
  outline: none;
  border-color: #667eea;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  margin-top: 10px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.config-info {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
  font-size: 14px;
  color: #666;
}

.config-info p {
  margin: 5px 0;
}

.error-message {
  background: #fef2f2;
  border: 2px solid #ef4444;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.error-message strong {
  color: #dc2626;
  display: block;
  margin-bottom: 5px;
}

.error-message p {
  color: #991b1b;
  margin: 0;
  font-size: 14px;
}

.events-panel {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.connection-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-dot {
  width: 12px;
  height: 12px;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.btn-disconnect {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.btn-disconnect:hover {
  background: rgba(255, 255, 255, 0.3);
}

.controls {
  padding: 20px 30px;
  background: #f9fafb;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.change-channel,
.change-token {
  display: flex;
  gap: 10px;
  flex: 1;
  min-width: 250px;
  align-items: center;
}

.change-channel .channel-type-select {
  width: auto;
  min-width: 120px;
  padding: 12px;
  font-size: 14px;
}

.change-channel input,
.change-token input {
  flex: 1;
}

.btn-secondary {
  padding: 12px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.3s;
}

.btn-secondary:hover:not(:disabled) {
  background: #5568d3;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-clear {
  padding: 12px 20px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.btn-clear:hover {
  background: #dc2626;
}

.send-event-form {
  padding: 0;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-bottom: none;
  color: white;
}

.send-event-header {
  background: rgba(0, 0, 0, 0.1);
  padding: 20px 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.send-event-form h3 {
  color: white;
  margin-bottom: 5px;
  font-size: 20px;
  font-weight: 700;
}

.send-event-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  gap: 20px;
  padding: 30px;
  align-items: start;
}

@media (max-width: 1024px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.send-event-form .form-group {
  flex: unset;
  min-width: unset;
  margin-bottom: 0;
}

.send-event-form .form-group-wide {
  grid-column: span 1;
}

.send-event-form label {
  color: white;
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
  font-size: 14px;
}

.send-event-form input {
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s;
}

.send-event-form input:focus {
  background: white;
  border-color: white;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
}

.send-event-form textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Monaco', 'Menlo', monospace;
  resize: vertical;
  background: rgba(255, 255, 255, 0.95);
  transition: all 0.3s;
  min-height: 100px;
}

.send-event-form textarea:focus {
  outline: none;
  background: white;
  border-color: white;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
}

.button-wrapper {
  display: flex;
  align-items: flex-end;
  height: 100%;
}

.btn-send {
  padding: 14px 28px;
  background: white;
  color: #2563eb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  white-space: nowrap;
  transition: all 0.3s;
  height: fit-content;
  font-size: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-send:hover:not(:disabled) {
  background: #f1f5f9;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.btn-send:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.send-event-form .error-message {
  margin: 0 30px 20px 30px;
  background: rgba(254, 242, 242, 0.95);
}

.send-event-form .success-message {
  margin: 0 30px 20px 30px;
  background: rgba(240, 253, 244, 0.95);
}

.events-container {
  padding: 30px;
}

.events-header {
  margin-bottom: 20px;
}

.events-header h3 {
  color: #333;
  font-size: 20px;
}

.events-list {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 10px;
}

.events-list::-webkit-scrollbar {
  width: 8px;
}

.events-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.events-list::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 4px;
}

.no-events {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 18px;
}

.event-item {
  background: #f9fafb;
  border-left: 4px solid #667eea;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  transition: transform 0.2s;
}

.event-item:hover {
  transform: translateX(5px);
}

.event-item.error {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.event-item.system {
  border-left-color: #10b981;
  background: #f0fdf4;
}

.event-item.whisper {
  border-left-color: #f59e0b;
  background: #fffbeb;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.event-type {
  font-weight: 700;
  color: #333;
  font-size: 16px;
}

.event-time {
  color: #999;
  font-size: 14px;
}

.event-channel {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.event-data {
  background: white;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  color: #333;
  overflow-x: auto;
  margin: 0;
  font-family: 'Monaco', 'Menlo', monospace;
}
</style>
