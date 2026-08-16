import dotenv from "dotenv";
dotenv.config();

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
app.use("/", apiRoutes);

const wss = attachWebSocketServer(server);

server.listen(PORT, HOST, () => {
  const baseUrl =  HOST === '0.0.0.0' ? `http://localhost:${PORT}` :  `http://${HOST}:${PORT}`;
  console.log(`[${new Date().toISOString()}] Server is running at ${baseUrl}`);
  console.log(`[${new Date().toISOString()}] WebSocket Signaling server is running at ${baseUrl.replace('http://', 'ws://')}/ws`);
});

process.on("SIGTERM", () => {
  console.log(`\n[${new Date().toISOString()}] SIGTERM received. Shutting down gracefully...`);
  wss.close(() => {
    console.log(`[${new Date().toISOString()}] WebSocket server closed.`);
    server.close(() => {
      console.log(`[${new Date().toISOString()}] HTTP server closed.`);
      process.exit(0);
    });
  });
});
