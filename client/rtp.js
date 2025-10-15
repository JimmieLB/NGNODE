import dgram from 'dgram';

const client = dgram.createSocket('udp4');

// Server info
const SERVER_PORT = 5432;
const SERVER_HOST = '127.0.0.1';

// Message to send
const message = Buffer.from('Hello from UDP client!');

// Send message to server
client.send(message, 0, message.length, SERVER_PORT, SERVER_HOST, (err) => {
  if (err) {
    console.error('Error sending message:', err);
    client.close();
  } else {
    console.log(`Message sent to ${SERVER_HOST}:${SERVER_PORT}`);
  }
});

// Listen for a response from the server
client.on('message', (msg, rinfo) => {
  console.log(`Received message from server: ${msg.toString()}`);
  console.log(`Server info:`, rinfo);
  client.close(); // Close socket after receiving response
});
