const WebSocket = require('ws');
const port = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port });

const connectedUsers = new Map();

wss.on('connection', (ws, req) => {
  const urlParams = new URLSearchParams(req.url.replace('/?', ''));
  const userId = urlParams.get('userId');

  if (!userId) {
    ws.close();
    return;
  }
  
  if (!connectedUsers.has(userId)) {
    connectedUsers.set(userId, new Set());
  }
  connectedUsers.get(userId).add(ws);

  // Notify network user is active
  broadcastPresence(userId, true);

  ws.on('close', () => {
    const userSockets = connectedUsers.get(userId);
    if (userSockets) {
      userSockets.delete(ws);
      if (userSockets.size === 0) {
        connectedUsers.delete(userId);
        broadcastPresence(userId, false);
      }
    }
  });
});

function broadcastPresence(userId, isOnline) {
  const payload = JSON.stringify({ type: 'STATUS_UPDATE', userId, isOnline });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

console.log(`header backend running on port ${port}`);
