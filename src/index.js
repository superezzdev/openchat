import "dotenv/config.js";

import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import { attachWebSocketServer } from "./ws/server.js";
import { securityMiddleware } from "./arcjet.js";
import apiRoutes from "./routes/api.js";

const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

app.use(helmet());
const clientOrigin = process.env.CLIENT_ORIGIN || '*';
const corsOrigin = clientOrigin === '*' ? '*' : clientOrigin.split(',').map(o => o.trim().replace(/\/$/, ''));

app.use(cors({
  origin: corsOrigin
}));
app.use(express.json());
app.use(securityMiddleware());

// API Routes
app.use("/api", apiRoutes);

const wss = attachWebSocketServer(server);

server.listen(PORT, HOST, () => {
  const baseUrl =  HOST === '0.0.0.0' ? `http://localhost:${PORT}` :  `http://${HOST}:${PORT}`;
  console.log(`[${new Date().toISOString()}] Server is running at ${baseUrl}`);
  console.log(`[${new Date().toISOString()}] WebSocket Signaling server is running at ${baseUrl.replace('http://', 'ws://')}/ws`);
});

const shutdown = () => {
  console.log(`\n[${new Date().toISOString()}] Shutdown signal received. Shutting down gracefully...`);
  
  // Forcibly close all active WebSocket clients so wss.close() doesn't hang
  if (wss.clients) {
    for (const client of wss.clients) {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify({ type: 'server_shutdown' }));
      }
      client.terminate();
    }
  }

  wss.close(() => {
    console.log(`[${new Date().toISOString()}] WebSocket server closed.`);
    server.close(() => {
      console.log(`[${new Date().toISOString()}] HTTP server closed.`);
      process.exit(0);
    });
  });

  // Failsafe to forcefully exit if connections aren't closed in time
  setTimeout(() => {
    console.error(`[${new Date().toISOString()}] Could not close connections in time, forcefully shutting down`);
    process.exit(1);
  }, 3000).unref();
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
