import WebSocket from 'ws';
const ws = new WebSocket('wss://openchat-a.onrender.com/ws', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X)',
    'Origin': 'https://openchat-ui-hazel.vercel.app'
  }
});
ws.on('open', () => { console.log('connected'); ws.close(); });
ws.on('error', (e) => console.log('error', e));
ws.on('unexpected-response', (req, res) => {
  console.log('unexpected', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('body:', data));
});
