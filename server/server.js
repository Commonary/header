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

  broadcastOnlineList();

  ws.on('close', () => {
    const userSockets = connectedUsers.get(userId);
    if (userSockets) {
      userSockets.delete(ws);
      if (userSockets.size === 0) {
        connectedUsers.delete(userId);
      }
    }
    broadcastOnlineList();
  });
});

function broadcastOnlineList() {
  const onlineUserIds = Array.from(connectedUsers.keys());
  const payload = JSON.stringify({
    type: 'ONLINE_USERS_LIST',
    users: onlineUserIds
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

console.log(`Server running on port ${port}`);
