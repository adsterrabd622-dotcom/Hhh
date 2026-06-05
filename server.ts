import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createServer as createHttpServer } from 'http';
import { Server } from 'socket.io';

async function startServer() {
  const app = express();
  const server = createHttpServer(app);
  const io = new Server(server, {
    cors: { origin: '*' }
  });
  
  const PORT = 3000;

  // Signaling Server Logic
  io.on('connection', (socket) => {
    
    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      const clients = io.sockets.adapter.rooms.get(roomId);
      if (clients && clients.size > 1) {
        socket.to(roomId).emit('peer-connected');
      }
    });

    socket.on('offer', ({ roomId, offer }) => {
      socket.to(roomId).emit('offer', { offer });
    });

    socket.on('answer', ({ roomId, answer }) => {
      socket.to(roomId).emit('answer', { answer });
    });

    socket.on('ice-candidate', ({ roomId, candidate }) => {
      socket.to(roomId).emit('ice-candidate', { candidate });
    });

    socket.on('disconnect', () => {
      // Could notify room of disconnection, but simple P2P may just rely on simple connection limits
    });
  });

  // API checks
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
