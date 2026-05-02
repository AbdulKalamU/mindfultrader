// Minimal test server to isolate Railway networking issue
const http = require('http');

const PORT = process.env.PORT || 8000;

const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.socket.remoteAddress}`);
  
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Minimal server works!\n');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Minimal test server listening on 0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Ready to accept connections`);
});
