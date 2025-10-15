import dgram from 'dgram';
const server = dgram.createSocket('udp4');
const PORT = 5432;

clients = {};

server.on('error', (err) => {
  console.error(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  if (!clients[rinfo.address]) {
    clients[rinfo.address] = rinfo.port;
  }
});

server.on('close', (rinfo) => {
    delete clients[rinfo.address];
});

server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(PORT);