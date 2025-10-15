import dgram from 'dgram';
import { StreamCamera, Codec } from 'pi-camera-connect';
const server = dgram.createSocket('udp4');
const PORT = 5432;

const clients = {};

const streamCamera = new StreamCamera({
    codec: Codec.H264,
});


const videoStream = streamCamera.createStream();
streamCamera.startCapture().then(()=>{
    console.log("Camera Started");
})

videoStream.on('data', data => console.log('New video data', data));


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