const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Store for managing rooms and users
const rooms = new Map()
const users = new Map()
const documents = new Map()

// Helper function to broadcast user list
function broadcastUserList(io) {
  const onlineUsers = Array.from(users.values()).map(u => u.userId)
  console.log('Broadcasting user list:', onlineUsers)
  io.emit('users-online', onlineUsers)
}

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  const io = new Server(httpServer, {
    cors: {
      origin: dev ? "http://localhost:3000" : false,
      methods: ["GET", "POST"]
    }
  })

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // Store user info
    socket.on('user-online', (userData) => {
      const { userId, userName } = userData;
      users.set(socket.id, { userId, socketId: socket.id, userName })
      console.log('User online:', { userId, userName, totalUsers: users.size })
      
      // Broadcast updated user list to ALL connected clients
      broadcastUserList(io)
    })

    // Room management
    socket.on('join-room', (data) => {
      const { roomId, userId, userName } = data;
      socket.join(roomId)
      console.log(`Socket ${socket.id} (${userName}) joined room ${roomId}`)
      
      socket.to(roomId).emit('user-joined-room', {
        userId,
        userName,
        roomId
      })
    })

    socket.on('leave-room', (data) => {
      const { roomId, userId } = data;
      socket.leave(roomId)
      console.log(`Socket ${socket.id} left room ${roomId}`)
      
      const user = users.get(socket.id)
      if (user) {
        socket.to(roomId).emit('user-left-room', {
          userId,
          userName: user.userName,
          roomId
        })
      }
    })

    // Chat messages
    socket.on('room-message', (data) => {
      console.log('Message received:', data)
      // Broadcast to all users in the room including sender
      io.to(data.roomId).emit('room-message', data)
    })

    // Typing indicators
    socket.on('typing', (data) => {
      socket.to(data.roomId).emit('user-typing', data)
    })

    // Video call signaling
    socket.on('join-call', (data) => {
      socket.join(`call-${data.roomId}`)
      socket.to(`call-${data.roomId}`).emit('user-joined-call', {
        userId: data.userId,
        userName: data.userName
      })
    })

    socket.on('leave-call', (data) => {
      socket.leave(`call-${data.roomId}`)
      socket.to(`call-${data.roomId}`).emit('user-left-call', {
        userId: data.userId
      })
    })

    socket.on('call-offer', (data) => {
      socket.to(`call-${data.roomId}`).emit('call-offer', {
        offer: data.offer,
        fromUserId: users.get(socket.id)?.userId,
        fromUserName: users.get(socket.id)?.userName
      })
    })

    socket.on('call-answer', (data) => {
      socket.to(`call-${data.roomId}`).emit('call-answer', {
        answer: data.answer,
        fromUserId: users.get(socket.id)?.userId
      })
    })

    socket.on('ice-candidate', (data) => {
      socket.to(`call-${data.roomId}`).emit('ice-candidate', {
        candidate: data.candidate,
        fromUserId: users.get(socket.id)?.userId
      })
    })

    // Document collaboration
    socket.on('join-doc-room', (roomId) => {
      socket.join(`doc-${roomId}`)
      
      // Send existing documents
      const roomDocs = documents.get(roomId) || []
      socket.emit('documents-list', roomDocs)
      
      const user = users.get(socket.id)
      if (user) {
        socket.to(`doc-${roomId}`).emit('collaborator-joined', {
          userId: user.userId,
          userName: user.userName
        })
      }
    })

    socket.on('create-document', (data) => {
      const roomDocs = documents.get(data.roomId) || []
      roomDocs.push(data.document)
      documents.set(data.roomId, roomDocs)
      
      io.to(`doc-${data.roomId}`).emit('documents-list', roomDocs)
    })

    socket.on('document-change', (data) => {
      socket.to(`doc-${data.roomId}`).emit('document-change', data.change)
    })

    socket.on('cursor-update', (data) => {
      const user = users.get(socket.id)
      if (user) {
        socket.to(`doc-${data.roomId}`).emit('cursor-update', {
          userId: user.userId,
          cursor: data.cursor,
          selection: data.selection
        })
      }
    })

    socket.on('save-document', (data) => {
      const roomDocs = documents.get(data.roomId) || []
      const docIndex = roomDocs.findIndex(doc => doc.id === data.document.id)
      if (docIndex !== -1) {
        roomDocs[docIndex] = data.document
        documents.set(data.roomId, roomDocs)
      }
      
      io.to(`doc-${data.roomId}`).emit('document-updated', data.document)
    })

    socket.on('delete-document', (data) => {
      const roomDocs = documents.get(data.roomId) || []
      const filteredDocs = roomDocs.filter(doc => doc.id !== data.documentId)
      documents.set(data.roomId, filteredDocs)
      
      io.to(`doc-${data.roomId}`).emit('documents-list', filteredDocs)
    })

    socket.on('get-documents', (roomId) => {
      const roomDocs = documents.get(roomId) || []
      socket.emit('documents-list', roomDocs)
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
      const user = users.get(socket.id)
      if (user) {
        console.log('Removing user:', user.userName, 'Total before removal:', users.size)
        users.delete(socket.id)
        console.log('Total users after removal:', users.size)
        
        // Broadcast updated user list to ALL remaining clients
        broadcastUserList(io)
        
        // Notify rooms about user leaving
        socket.rooms.forEach(roomId => {
          socket.to(roomId).emit('user-left-room', {
            userId: user.userId,
            userName: user.userName,
            roomId
          })
        })
      }
    })

    // Send current user list to newly connected socket
    socket.emit('users-online', Array.from(users.values()).map(u => u.userId))
  })

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
      console.log('> Socket.io server is running')
    })
}) 