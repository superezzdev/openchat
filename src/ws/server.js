import { WebSocket, WebSocketServer } from "ws";
import { wsArcjet } from "../arcjet.js";
import crypto from "crypto";

export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024,
    verifyClient: (info, cb) => {
      const origin = info.origin || info.req.headers.origin;
      const allowedOriginStr = process.env.CLIENT_ORIGIN || '*';
      const allowedOrigins = allowedOriginStr === '*' ? ['*'] : allowedOriginStr.split(',').map(o => o.trim().replace(/\/$/, ''));
      
      if (!allowedOrigins.includes('*') && !allowedOrigins.includes(origin)) {
        console.log(`[${new Date().toISOString()}] WebSocket connection rejected. Invalid origin: ${origin} (Expected: ${allowedOrigins.join(', ')})`);
        return cb(false, 401, "Unauthorized");
      }
      cb(true);
    },
  });

  const waitingQueue = new Set();
  const spyQueue = new Set();
  const rooms = new Map();

  function pairUp(socket1, socket2, commonInterests) {
    const room = { sockets: [socket1, socket2], type: 'normal' };
    rooms.set(socket1, room);
    rooms.set(socket2, room);

    console.log(`[${new Date().toISOString()}] Paired: ${socket1.id} & ${socket2.id}`);

    sendJson(socket1, { type: "matched", initiator: true, commonInterests });
    sendJson(socket2, { type: "matched", initiator: false, commonInterests });
  }

  function pairUpSpy(spyItem, stranger1, stranger2) {
    const room = { 
      sockets: [spyItem.socket, stranger1.socket, stranger2.socket], 
      type: 'spy', 
      spySocket: spyItem.socket, 
      question: spyItem.question 
    };
    rooms.set(spyItem.socket, room);
    rooms.set(stranger1.socket, room);
    rooms.set(stranger2.socket, room);

    console.log(`[${new Date().toISOString()}] Paired (Spy): ${spyItem.socket.id} (Spy) & ${stranger1.socket.id} & ${stranger2.socket.id}`);

    sendJson(spyItem.socket, { type: "matched", initiator: false, isSpy: true, question: spyItem.question });
    sendJson(stranger1.socket, { type: "matched", initiator: true, isSpyStranger: true, question: spyItem.question, peerId: 1 });
    sendJson(stranger2.socket, { type: "matched", initiator: false, isSpyStranger: true, question: spyItem.question, peerId: 2 });
  }

  function sendJson(socket, payload) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
    }
  }

  function broadcastUserCount() {
    const payload = JSON.stringify({ type: 'userCount', count: wss.clients.size });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  function handleDisconnect(socket) {
    console.log(`[${new Date().toISOString()}] WebSocket disconnected: ${socket.id}`);
    for (const w of waitingQueue) {
      if (w.socket === socket) {
        waitingQueue.delete(w);
        break;
      }
    }
    for (const s of spyQueue) {
      if (s.socket === socket) {
        spyQueue.delete(s);
        break;
      }
    }

    const room = rooms.get(socket);
    if (room) {
      for (const s of room.sockets) {
        rooms.delete(s);
        if (s !== socket && s.readyState === WebSocket.OPEN) {
          sendJson(s, { type: "peer_left" });
        }
      }
    }
  }

  wss.on("connection", async (socket, req) => {
    socket.id = crypto.randomUUID();
    console.log(`[${new Date().toISOString()}] WebSocket connected: ${socket.id}`);

    if (wsArcjet) {
      try {
        const ipSrc = req.headers["x-forwarded-for"]?.split(',')[0] || req.socket?.remoteAddress;
        const decision = await wsArcjet.protect(req, { ipSrc });
        if (decision.isDenied()) {
          socket.close(1008, "Access denied");
          return;
        }
      } catch (e) {
        socket.close(1011, "Server security error");
        return;
      }
    }

    socket.isAlive = true;
    broadcastUserCount();

    socket.on("pong", () => {
      socket.isAlive = true;
    });

    socket.on("message", (data) => {
      let message;
      try {
        message = JSON.parse(data.toString());
      } catch {
        return;
      }

      if (message.type === "join") {
        if (rooms.has(socket)) return;
        
        for (const w of waitingQueue) {
          if (w.socket === socket) return;
        }
        for (const s of spyQueue) {
          if (s.socket === socket) return;
        }

        const tags = message.tags || [];
        const mode = message.mode || 'video';

        if (mode === 'spy') {
          spyQueue.add({ socket, question: message.question, joinedAt: Date.now() });
          sendJson(socket, { type: "waiting" });
          return;
        }

        let match = null;
        let commonInterests = [];

        // Primary Match: Find someone with matching tags AND matching mode
        if (tags.length > 0) {
          for (const w of waitingQueue) {
            if (w.socket.readyState !== WebSocket.OPEN) continue;
            if (w.mode === mode) {
              const common = w.tags.filter(t => tags.includes(t));
              if (common.length > 0) {
                match = w;
                commonInterests = common;
                break;
              }
            }
          }
        }

        // Secondary Match: No tags
        if (!match && tags.length === 0) {
          for (const w of waitingQueue) {
             if (w.socket.readyState !== WebSocket.OPEN) continue;
             if (w.mode === mode && w.tags.length === 0) {
               match = w;
               break;
             }
          }
        }

        if (match) {
          waitingQueue.delete(match);
          
          // If they are connecting via text, try to pull in a spy
          let spyAssigned = false;
          if (mode === 'text' && spyQueue.size > 0) {
            for (const spy of spyQueue) {
              if (spy.socket.readyState === WebSocket.OPEN) {
                spyQueue.delete(spy);
                pairUpSpy(spy, { socket }, match);
                spyAssigned = true;
                break;
              } else {
                spyQueue.delete(spy);
              }
            }
          }

          if (!spyAssigned) {
            pairUp(socket, match.socket, commonInterests);
          }
        } else {
          waitingQueue.add({ socket, tags, mode, joinedAt: Date.now() });
          sendJson(socket, { type: "waiting" });
        }
        return;
      }

      if (message.type === "leave") {
        handleDisconnect(socket);
        return;
      }

      if (message.type === "report") {
        const room = rooms.get(socket);
        console.log(`\n[REPORT] [${new Date().toISOString()}]`);
        console.log(`Reporter ID: ${socket.id}`);
        console.log(`Room Type: ${room ? room.type : 'N/A'}`);
        console.log(`Reason: ${message.reason}`);
        console.log("-----------------------------------------");
        return;
      }

      if (["offer", "answer", "ice-candidate", "chat", "typing"].includes(message.type)) {
        const room = rooms.get(socket);
        if (room) {
          for (const s of room.sockets) {
            if (s !== socket && s.readyState === WebSocket.OPEN) {
              let msgToSend = message;
              if (room.type === 'spy' && (message.type === 'chat' || message.type === 'typing')) {
                const senderId = socket === room.spySocket ? 'Spy' : (socket === room.sockets[1] ? 'Stranger 1' : 'Stranger 2');
                msgToSend = { ...message, senderId };
              }
              sendJson(s, msgToSend);
            }
          }
        }
      }
    });

    socket.on("error", (error) => {
      console.log(`[${new Date().toISOString()}] WebSocket error on ${socket.id}: ${error.message}`);
      socket.terminate();
    });
    socket.on("close", () => {
      handleDisconnect(socket);
      setTimeout(broadcastUserCount, 50); // Small delay to let wss.clients update
    });
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.readyState !== WebSocket.OPEN) return;
      
      ws.isAlive = false;
      ws.ping();

      setTimeout(() => {
        if (ws.isAlive === false && ws.readyState === WebSocket.OPEN) {
          console.log(`[${new Date().toISOString()}] WebSocket terminated due to heartbeat timeout: ${ws.id}`);
          ws.terminate();
        }
      }, 10000);
    });
  }, 30000);

  const fallbackInterval = setInterval(() => {
    const now = Date.now();
    const waitList = Array.from(waitingQueue).filter(w => w.socket.readyState === WebSocket.OPEN);
    
    // Fallback (5 seconds): Ignore mode (allow mixed pairing) & tags
    const longWaiters = waitList.filter(w => now - w.joinedAt > 5000);
    for (const waiter of longWaiters) {
      if (!waitingQueue.has(waiter)) continue; 
      const other = Array.from(waitingQueue).find(w => w !== waiter && w.socket.readyState === WebSocket.OPEN);
      if (other) {
        waitingQueue.delete(waiter);
        waitingQueue.delete(other);
        const commonInterests = waiter.tags.filter(t => other.tags.includes(t));
        pairUp(waiter.socket, other.socket, commonInterests);
      }
    }
  }, 1000);

  wss.on("close", () => {
    clearInterval(interval);
    clearInterval(fallbackInterval);
  });

  return wss;
}
