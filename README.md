# 🔌 WebSocket Tester - Laravel Reverb

Vue 2 application for testing WebSocket connections with Laravel Reverb in local environment.

> ⚠️ **Project for LOCAL use only** - Designed for WebSocket testing in development

---

## 🚀 Installation and Configuration

### 1️⃣ Install dependencies
```bash
npm install
```

### 2️⃣ Configure WebSocket connection

Edit the **`config.js`** file in the project root with your local values:

```javascript
export default {
  websocket: {
    host: 'mia-v2.test',      // Your Laravel local domain
    port: 6001,                // Reverb port (default 6001)
    protocol: 'ws',            // Use 'ws' for local
    forceTLS: false,           // false for local development
  },

  // ⚠️ IMPORTANT: Get this value from your Laravel .env
  // Variable: REVERB_APP_KEY or PUSHER_APP_KEY
  appKey: 'YOUR_APP_KEY_HERE', 

  auth: {
    endpoint: 'http://mia-v2.test/broadcasting/auth', // Full authentication endpoint URL
  },

  channels: {
    prefix: 'presence-',       // Your channel prefix
    defaultChannel: 'channel', // Default channel on connect
  }
}
```

#### 🔍 Where to find the APP_KEY?

In your Laravel project, check the `.env` file:
```env
REVERB_APP_KEY=your-app-key-here
```

### 3️⃣ Start the project
```bash
npm run dev
```

The server will start at: **http://localhost:3000**

---

## 🎮 How to Use

### Connection Screen
1. Configure the connection:
   - **Host**: Your Laravel server domain (e.g., `mia-v2.test`)
   - **Port**: WebSocket port (default `6001`)
   - **APP KEY**: Your Reverb key (get it from Laravel's `.env`)
2. Enter your **access token** (Bearer token from your Laravel application)
3. Select the **channel type** (Public, Private, or Presence)
4. Enter the **channel name** (name only, without prefix)
   - Example: If your channel is `presence-chat`, enter only `chat`
5. Click **Connect**

> 💡 **Note**: Host, Port, and APP KEY values come pre-configured from `config.js`, but you can modify them directly in the form without editing code.

### Events Panel
Once connected you'll see:
- 🟢 **Connection status** and current channel in the header
- 📤 **Send Event** section to send client events (whisper)
- 📥 **Real-time events** received from WebSocket
- 🔄 **Change channel** without disconnecting (automatically clears events)
- 🔑 **Change token** (reconnects automatically and clears events)
- 🗑️ **Clear events** to manually empty the history
- 🔌 **Disconnect** (automatically clears events)

### Event Types Displayed
- **Green** 🟢 System events (successful connection, subscription)
- **Blue** 🔵 Normal messages/events
- **Orange** 🟠 Whisper events (client-to-client)
- **Red** 🔴 Connection or subscription errors

### Sending Events
The **Send Event** section allows you to send client-to-client events (whispers):
- **Event Name**: Name of the event to broadcast
- **Event Data**: JSON payload to send
- Only works on **private** and **presence** channels
- Events are sent directly between clients without going through the backend

---

## ⚙️ Detailed Configuration

### `config.js` File

| Parameter | Description | Local Value |
|-----------|-------------|-------------|
| `websocket.host` | Your Laravel domain | `mia-v2.test` |
| `websocket.port` | WebSocket port | `6001` |
| `websocket.protocol` | Connection protocol | `ws` (local) / `wss` (production) |
| `websocket.forceTLS` | Force TLS/SSL | `false` locally |
| `appKey` | Reverb App Key | Get it from your `.env` |
| `auth.endpoint` | Authentication endpoint | Full URL to auth route |
| `channels.prefix` | Automatic prefix | `presence-`, `private-`, etc |
| `channels.defaultChannel` | Default channel | Any name |

### Change Configuration Without Editing Code

You have two options to configure the connection:

1. **From the form** (recommended): Edit Host, Port, and APP KEY fields directly on the login screen
2. **From `config.js`**: Modify the default values that will appear pre-loaded in the form

---

## 🧪 Local Testing

### Prerequisites
1. ✅ Laravel project running (with Reverb configured)
2. ✅ Reverb server active:
   ```bash
   php artisan reverb:start
   ```
3. ✅ Valid token generated in your Laravel application

### Typical Testing Flow

1. **Start Reverb** in your Laravel project
2. **Start this frontend** with `npm run dev`
3. **Get a token** from your Laravel application (authentication)
4. **Connect** from the interface
5. **Trigger events** from Laravel and observe them here in real-time
6. **Send whisper events** to communicate between connected clients

### Example: Trigger Event from Laravel

```php
// In your Laravel code
broadcast(new MyEvent($data))->toOthers();
```

You'll see the event appear instantly in the panel.

### Example: Send Whisper Event

1. Connect two browser tabs to the same private/presence channel
2. In one tab, use the **Send Event** form
3. The other tab will receive the whisper event in real-time

---

## 📦 Available Commands

```bash
# Development - Hot reload enabled
npm run dev

# Build for production (if needed)
npm run build

# Preview build
npm run preview
```

---

## 🛠️ Tech Stack

- **Vue 2** - JavaScript framework
- **Vite** - Build tool and dev server
- **Laravel Echo** - WebSocket client for Laravel
- **Pusher JS** - Pusher library (compatible with Reverb)
- **Laravel Reverb** - Laravel's WebSocket server

---

## 🐛 Troubleshooting

### Cannot Connect to WebSocket
- ✅ Verify Reverb is running: `php artisan reverb:start`
- ✅ Check port in `config.js` (should be 6001 by default)
- ✅ Ensure `appKey` matches your `.env`

### Channel Subscription Error
- ✅ Verify token is valid
- ✅ Check user has permissions for the channel
- ✅ Review broadcasting routes in Laravel (`routes/channels.php`)

### No Events Appearing
- ✅ Confirm you're on the correct channel
- ✅ Verify the event is being triggered from Laravel
- ✅ Check browser console for errors

### Cannot Send Events
- ✅ Ensure you're connected to a **private** or **presence** channel
- ✅ Verify the JSON format is valid
- ✅ Check that another client is connected to receive the event

### CORS Issues
- ✅ In Laravel, configure CORS in `config/cors.php`
- ✅ Make sure `localhost:3000` is allowed

---

## 📝 Important Notes

- 🔒 `presence-*` channels require authentication
- 🔒 `private-*` channels also require authentication  
- 📡 Public channels don't need authentication
- 🔑 Token must be a valid Laravel Bearer token
- ⏱️ Events are shown in reverse order (most recent on top)
- 🧹 Events are automatically cleared when:
  - Disconnecting
  - Changing channels
  - Changing tokens
  - Connecting/Reconnecting
- 💾 You can also clear events manually with the "Clear Events" button
- 📤 Whisper events (client events):
  - Only work on private and presence channels
  - Are sent directly between clients
  - Don't go through the Laravel backend
  - Perfect for real-time client-to-client communication

---

## 🎯 Recommended Use

This project is ideal for:
- ✅ Testing WebSocket events in development
- ✅ Debugging broadcasting issues
- ✅ Verifying channel permissions
- ✅ Testing authentication tokens
- ✅ Monitoring real-time events
- ✅ Testing client-to-client communication with whispers

---

**Ready to test your WebSocket! 🚀**
