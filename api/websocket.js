// Simple WebSocket server for real-time payment status updates
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// Store clients
let clients = [];
wss.on('connection', function connection(ws) {
  clients.push(ws);
  ws.on('close', () => {
    clients = clients.filter(client => client !== ws);
  });
});

// Function to broadcast payment status
function broadcastPaymentStatus(data) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Export for use in API
module.exports = { broadcastPaymentStatus }; 