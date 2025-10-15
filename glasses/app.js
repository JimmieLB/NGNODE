import { StreamCamera, Codec } from 'pi-camera-connect';

const fs = import('fs');

import WebSocket, { WebSocketServer } from 'ws';
import wrtc from 'wrtc';
const RTCPeerConnection = wrtc.RTCPeerConnection;
const RTCSessionDescription = wrtc.RTCSessionDescription;

const streamCamera = new StreamCamera({
    codec: Codec.H264,
});

const WS_PORT = 7654;
const RTC_PORT = 7655;
const HOST = 'localhost';
// console.log(WebSocket);
const ws = new WebSocketServer({ port: WS_PORT });

let on = true;


// const videoStream = streamCamera.createStream();
// streamCamera.startCapture().then(()=>{

// })
// videoStream.on('data', data => console.log('New video data', data));


let serverCandidate;

// Creating Connection
const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});

const dataChannel = pc.createDataChannel("chat");
dataChannel.onopen = () => {
    console.log("Data channel is open");
    dataChannel.send("Hello from client");
}
//
pc.onicecandidate = ({ candidate }) => {
    if (candidate) {
        serverCandidate = candidate;
        console.log('Candidate: ', candidate);
        ws.send(JSON.stringify({ type: 'candidate', candidate: candidate }));
    }
};

ws.on('connection', (socket) => {
    console.log("Client connected");
    socket.send(serverCandidate);
    socket.onerror = async (error) => {
        console.log("WebSocket error: ", error);
    }

    socket.onmessage = async ({ data }) => {
        const message = JSON.parse(data);
        if (message.type === 'offer') {
            await pc.setRemoteDescription(message);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.send(JSON.stringify(pc.localDescription));
            console.log("Answer sent");
        } else if (message.type === 'answer') {
            await pc.setRemoteDescription(message);
        } else if (message.type === 'candidate') {
            await pc.addIceCandidate(message.candidate);
        }
    };

});