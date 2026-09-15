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
  
  connectedUsers.set(userId, ws);
  broadcastPresence(userId, true);

  ws.on('close', () => {
    connectedUsers.delete(userId);
    broadcastPresence(userId, false);
  });
});

function broadcastPresence(userId, isOnline) {
  const payload = JSON.stringify({ type: 'PRESENCE_CHANGE', userId, isOnline });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}
