import http from 'node:http';
import net from 'node:net';
import { WebSocketServer } from 'ws';

const TARGET_HOST = '103.238.235.238';
const TARGET_PORT = 10036;
const PORT = Number(process.env.PORT || 10000);
const wss = new WebSocketServer({ noServer: true });

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('BABYTHENK proxy running');
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.on('upgrade', (req, socket, head) => {
  let url;
  try { url = new URL(req.url, 'http://localhost'); }
  catch { socket.destroy(); return; }
  if (url.pathname !== '/__j2me4w/tcp' ||
      url.searchParams.get('host') !== TARGET_HOST ||
      Number(url.searchParams.get('port')) !== TARGET_PORT ||
      url.searchParams.has('via')) {
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => {
    const tcp = net.createConnection({ host: TARGET_HOST, port: TARGET_PORT });
    let ready = false;
    let ended = false;
    const stop = (reason = 'closed') => {
      if (ended) return;
      ended = true;
      tcp.destroy();
      if (ws.readyState === ws.OPEN) ws.close(4000, String(reason).slice(0, 120));
    };
    tcp.setTimeout(15000, () => stop('TCP timeout'));
    tcp.once('connect', () => {
      ready = true;
      tcp.setTimeout(0);
      tcp.setNoDelay(true);
      if (ws.readyState === ws.OPEN) ws.send('OK');
      console.log('TCP connected to NRO');
    });
    tcp.on('data', (chunk) => {
      if (ws.readyState === ws.OPEN) ws.send(chunk, { binary: true });
    });
    tcp.on('error', (err) => { console.error('TCP:', err.message); stop(err.message); });
    tcp.on('close', () => stop('TCP closed'));
    ws.on('message', (data, binary) => {
      if (ready && !ended) tcp.write(binary ? data : Buffer.from(String(data)));
    });
    ws.on('close', () => { ended = true; tcp.destroy(); });
    ws.on('error', () => { ended = true; tcp.destroy(); });
  });
});
server.listen(PORT, '0.0.0.0', () => console.log(`BABYTHENK proxy listening on ${PORT}`));
