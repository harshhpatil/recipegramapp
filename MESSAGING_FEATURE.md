# WebSocket Messaging Feature Documentation

## Overview 

A complete real-time messaging system using WebSockets (Socket.IO) has been implemented for RecipeGram. Users can now send instant messages, see typing indicators, and get real-time updates on message delivery and read status.

## Architecture

### Backend (Server)

#### 1. **Message Model** (`server/src/models/Message.model.js`)
- **Fields:**
  - `sender`: Reference to User (required)
  - `recipient`: Reference to User (required)
  - `content`: Message text (max 5000 characters)
  - `isRead`: Boolean flag for read status
  - `image`: Optional image attachment
  - `timestamps`: createdAt, updatedAt

- **Indexes:**
  - Sender + Recipient (for conversation queries)
  - Recipient + isRead (for unread messages)
  - CreatedAt (for sorting)

#### 2. **Message Controller** (`server/src/controller/message.controller.js`)
- `sendMessage()`: Create and send a message
- `getConversation()`: Fetch messages between two users (paginated)
- `getConversations()`: Fetch all conversations with latest message and unread count
- `markAsRead()`: Mark a message as read
- `deleteMessage()`: Delete a message (sender only)
- `getUnreadCount()`: Get total unread message count

#### 3. **Message Routes** (`server/src/routes/message.routes.js`)
```
POST   /messages                  - Send message
GET    /messages                  - Get all conversations
GET    /messages/unread/count     - Get unread count
GET    /messages/:conversationWith - Get conversation with user
PUT    /messages/:messageId/read  - Mark as read
DELETE /messages/:messageId       - Delete message
```

#### 4. **WebSocket Server** (`server/src/util/socket.js`)

**Initialization:**
```javascript
const io = initializeSocket(httpServer);
```

**Authentication:**
- JWT token validation on connection
- Socket disconnection if authentication fails

**Events Emitted by Client:**
- `join_room`: Join user's private room
- `send_message`: Send a message
- `typing`: Indicate typing status
- `stop_typing`: Stop typing indicator
- `mark_as_read`: Mark message as read
- `call_request`: Initiate video/audio call
- `accept_call`: Accept incoming call
- `end_call`: End active call

**Events Broadcast by Server:**
- `receive_message`: New message received
- `message_sent`: Acknowledgment that message was sent
- `message_error`: Error sending message
- `user_typing`: User is typing
- `user_stopped_typing`: User stopped typing
- `user_online`: User came online
- `user_offline`: User went offline
- `conversation_updated`: Conversation list updated
- `message_read`: Message marked as read
- `incoming_call`: Incoming call request
- `call_accepted`: Call was accepted
- `call_ended`: Call ended

**Active Users Management:**
- Map of userId -> socketId for online status tracking
- Automatic cleanup on disconnect

#### 5. **Server Configuration** (`server/src/index.js`)
- HTTP server created with `createServer(app)`
- Socket.IO initialized with CORS configuration
- Supports client reconnection with exponential backoff

---

### Frontend (Client)

#### 1. **Redux Message Slice** (`client/src/store/slices/messageSlice.js`)

**State Structure:**
```javascript
{
  conversations: [],           // List of conversation partners
  currentConversation: {
    userId: null,
    messages: [],
    page: 1,
    total: 0,
    loading: false
  },
  typing: {},                 // userId -> { username, timestamp }
  onlineUsers: Set,           // Active user IDs
  unreadCount: 0,
  loading: false,
  error: null,
  success: false
}
```

**Async Thunks:**
- `sendMessage`: Send message via API
- `fetchConversations`: Get all conversations
- `fetchConversation`: Get conversation history with pagination
- `markMessageAsRead`: Mark message as read
- `deleteMessage`: Delete a message
- `fetchUnreadCount`: Get total unread count

**Actions:**
- `addReceivedMessage`: Add WebSocket-received message
- `setUserTyping`: Track typing users
- `clearUserTyping`: Clear typing status
- `setUserOnline/setUserOffline`: Track online status
- `updateConversation`: Update conversation in list
- `markMessageReadWebSocket`: Mark as read from WebSocket

#### 2. **Socket Utilities** (`client/src/utils/socket.js`)

**Functions:**
- `initializeSocket(token)`: Initialize WebSocket connection
- `getSocket()`: Get active socket instance
- `disconnectSocket()`: Safely disconnect socket
- `sendSocketMessage()`: Send message via socket
- `emitTyping()`: Send typing indicator
- `emitStopTyping()`: Stop typing indicator
- `markMessageReadSocket()`: Mark as read via socket
- `requestCall()`: Initiate call
- `acceptCall()`: Accept incoming call
- `endCall()`: End call

**Features:**
- Automatic reconnection with 5 attempts max
- Auth token passed in socket.io handshake
- Error handling and logging

#### 3. **Socket Hook** (`client/src/hooks/useSocket.js`)

```javascript
useSocket(token) // Initialize socket and set up event listeners
useSocketDisconnect() // Get disconnect function
```

**Event Listeners:**
All WebSocket events are automatically dispatched to Redux when received.

#### 4. **Messages Page** (`client/src/pages/Messages.jsx`)

**Layout:**
- Mobile: Single column (list → chat)
- Desktop: Two-column (list | chat)

**Components:**
- `ConversationList`: List of all conversations with search
- `ChatWindow`: Active conversation with message display
- Responsive navigation with back button on mobile

#### 5. **Conversation List Component** (`client/src/components/messages/ConversationList.jsx`)

**Features:**
- Search conversations by username
- Display latest message preview
- Show unread count badge
- User avatars with fallback
- Last message sender indicator
- Loading and error states

#### 6. **Chat Window Component** (`client/src/components/messages/ChatWindow.jsx`)

**Features:**
- Message display with timestamps
- Auto-scroll to latest message
- Typing indicator emission
- Send message form with validation
- Call action buttons (audio/video)
- Attachment button (placeholder)
- Responsive design (mobile + desktop)
- User header with online status

#### 7. **Message Item Component** (`client/src/components/messages/MessageItem.jsx`)

**Features:**
- Sender/receiver differentiation (colors)
- Read receipt indicator
- Relative timestamps (just now, 5m ago, etc.)
- Image attachment support
- Message grouping by time

---

## Usage Flow

### Sending a Message

1. User types message in ChatWindow
2. `sendMessage` Redux thunk calls API (POST /messages)
3. Simultaneously, `sendSocketMessage` emits WebSocket event
4. Server receives message via WebSocket and broadcasts to recipient's room
5. Recipient receives real-time update via `receive_message` event
6. Redux dispatch adds message to UI immediately
7. Both users' conversation lists update with new last message

### Real-time Updates

**Typing Indicator:**
1. User starts typing → `emitTyping()` sent to socket
2. Server broadcasts to recipient's room → `user_typing` event
3. Redux updates `typing` state
4. UI shows "User is typing..." indicator
5. After 2 seconds of inactivity, auto-clear

**Message Read Status:**
1. Recipient opens conversation → `fetchConversation` fetches and auto-marks read
2. `markMessageAsRead` API call marks in database
3. `markMessageReadSocket` emits socket event
4. Sender receives `message_read` event → Redux updates UI
5. Read receipt checkmark appears next to message

**Online Status:**
1. User connects → `user_online` event broadcast
2. User disconnects → `user_offline` event broadcast
3. Redux updates `onlineUsers` set
4. UI shows green dot next to online users

---

## API Integration

### HTTP Endpoints

```bash
# Send message
POST /messages
Body: { recipientId, content, image }

# Get conversations
GET /messages

# Get conversation history
GET /messages/:userId?page=1&limit=25

# Mark as read
PUT /messages/:messageId/read

# Delete message
DELETE /messages/:messageId

# Get unread count
GET /messages/unread/count

# All routes require authentication (JWT token in header)
```

### WebSocket Events

```javascript
// Client -> Server
socket.emit('send_message', { recipientId, content, image })
socket.emit('typing', { recipientId })
socket.emit('stop_typing', { recipientId })
socket.emit('mark_as_read', { messageId })
socket.emit('call_request', { recipientId, callType, callId })

// Server -> Client
socket.on('receive_message', (messageData) => {...})
socket.on('message_sent', (ack) => {...})
socket.on('user_typing', (data) => {...})
socket.on('conversation_updated', (data) => {...})
socket.on('message_read', (data) => {...})
socket.on('user_online', (data) => {...})
socket.on('user_offline', (data) => {...})
```

---

## Features Implemented

### ✅ Core Messaging
- [x] Send and receive messages in real-time
- [x] Message history pagination
- [x] Conversation list with latest messages
- [x] Search conversations by username
- [x] Delete messages (sender only)
- [x] Message timestamp formatting

### ✅ Real-time Updates
- [x] Typing indicators
- [x] Message delivery acknowledgment
- [x] Read receipts with checkmarks
- [x] Conversation list updates
- [x] Unread message count tracking
- [x] Online/offline status indicators

### ✅ User Experience
- [x] Responsive design (mobile + desktop)
- [x] Auto-scroll to latest messages
- [x] User avatars with fallbacks
- [x] Unread badge on conversations
- [x] Error handling and loading states
- [x] Empty state messaging

### ✅ Call Features (Prepared)
- [x] Call request event handlers
- [x] Call accept/reject logic
- [x] Call end handling
- [x] WebSocket call signaling
- ⏳ Video/Audio UI (ready for integration)

### ⏳ Future Enhancements
- [ ] Image/file attachments
- [ ] Message reactions (emoji)
- [ ] Group conversations
- [ ] Voice messages
- [ ] Message search/filtering
- [ ] Message editing
- [ ] User blocking
- [ ] Chat notifications
- [ ] Message persistence across sessions

---

## Database Schema

### Message Collection
```javascript
{
  _id: ObjectId,
  sender: ObjectId (ref: User),
  recipient: ObjectId (ref: User),
  content: String (required, max 5000),
  isRead: Boolean (default: false),
  image: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ sender: 1, recipient: 1 }` - Conversation queries
- `{ recipient: 1, isRead: 1 }` - Unread messages
- `{ createdAt: -1 }` - Message sorting

---

## Performance Considerations

1. **Message Pagination**: Conversations load 25 messages per page
2. **Lazy Loading**: Messages only fetched when conversation opened
3. **Socket Rooms**: Each user joins private room for targeted broadcasts
4. **Index Optimization**: Database indexes speed up common queries
5. **Debounced Typing**: Typing indicator sent max once per 2 seconds
6. **Redux Normalization**: Messages stored in optimal Redux structure

---

## Security

1. **Authentication**: All sockets must provide valid JWT token
2. **Authorization**: 
   - Can only delete own messages
   - Can only receive targeted messages
   - Cannot message self
3. **CORS**: Socket.IO configured with client URL
4. **Validation**: Content length limits, field validation
5. **Rate Limiting**: API rate limits apply to message routes

---

## Testing

To test the messaging feature:

1. **Install dependencies:**
   ```bash
   cd server && npm install socket.io
   cd client && npm install socket.io-client
   ```

2. **Start server and client:**
   ```bash
   npm run dev  # from root
   ```

3. **Create test accounts and start messaging**

4. **Test WebSocket events:**
   - Send messages between users
   - Watch real-time updates
   - Check typing indicators
   - Verify read receipts

---

## Troubleshooting

**Socket Connection Failed:**
- Check `process.env.CLIENT_URL` matches client URL
- Verify JWT token is valid
- Check CORS configuration

**Messages Not Appearing:**
- Ensure both users are connected to WebSocket
- Check browser console for errors
- Verify API response with network tab

**Typing Indicator Not Working:**
- Ensure socket events are being emitted
- Check Redux actions are dispatching
- Verify 2-second debounce timer

---

## File Structure

```
server/
  src/
    models/
      Message.model.js        # Message schema
    controller/
      message.controller.js   # Message logic
    routes/
      message.routes.js       # HTTP endpoints
    util/
      socket.js              # WebSocket handlers
    index.js                 # HTTP + Socket server setup

client/
  src/
    store/slices/
      messageSlice.js        # Redux state management
    pages/
      Messages.jsx           # Main messages page
    components/messages/
      ConversationList.jsx   # Conversations list
      ChatWindow.jsx         # Chat interface
      MessageItem.jsx        # Individual message
    hooks/
      useSocket.js           # Socket hook
    utils/
      socket.js              # Socket utilities
      helpers.js             # Date formatting etc
```

---

## Next Steps

1. **Test messaging functionality** across different browsers
2. **Implement video/audio calls** using WebRTC
3. **Add message attachments** with image upload
4. **Create notification system** for new messages
5. **Build group conversations** feature
6. **Add message search** functionality

---

## Contact & Support

For issues or questions about the messaging implementation, refer to the code comments and Redux action documentation in the source files.

Last Updated: February 2026
