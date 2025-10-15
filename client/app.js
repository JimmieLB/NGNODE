
import WebSocket from 'ws';
import wrtc from 'wrtc';
const RTCPeerConnection = wrtc.RTCPeerConnection;
const RTCSessionDescription = wrtc.RTCSessionDescription;

const WS_PORT = 7654;
const RTC_PORT = 7655;
const HOST = '127.0.0.1';
const ws = new WebSocket(`ws://${HOST}:${WS_PORT}`);

// Creating Connection
const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});

async function sendOffer() {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  ws.send(JSON.stringify(pc.localDescription));
}

//
pc.onicecandidate = ({ candidate }) => {
    if (candidate) {
        serverCandidate = candidate;
        console.log('Candidate: ', candidate);
        ws.send(JSON.stringify({ type: 'candidate', candidate }));
    }
};
pc.ondatachannel = (event) => {
    const dataChannel = event.channel;
    dataChannel.onmessage = (event) => {
        console.log("Message from server: ", event.data);
    };
}

ws.onerror = async (error) => {
    console.log("WebSocket error: ", error);
}

ws.onopen = () => {
    console.log('Connected to WebSocket server');
    sendOffer();
};
ws.onmessage = async ({data}) => {
    let message;
    try {
        message = JSON.parse(data);
    } catch {
        return;
    }
    if (message.type === 'offer') {
        await pc.setRemoteDescription(message);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws.send(JSON.stringify(pc.localDescription));
    } else if (message.type === 'answer') {
        console.log("Answer received");
        await pc.setRemoteDescription(message);
    } else if (message.type === 'candidate') {
        await pc.addIceCandidate(message.candidate);
        sendOffer();
    }
};

// ws.send("Client connected");

// ws.