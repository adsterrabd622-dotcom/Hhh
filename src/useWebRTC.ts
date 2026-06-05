import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const CHUNK_SIZE = 64 * 1024; // 64 KB chunks for WebRTC DataChannel

export interface TransferState {
  status: 'idle' | 'waiting' | 'connecting' | 'connected' | 'transferring' | 'completed' | 'error';
  progress: number;
  fileName?: string;
  fileSize?: number;
  error?: string;
}

export function useWebRTC(roomId: string | null, isSender: boolean) {
  const [state, setState] = useState<TransferState>({ status: 'idle', progress: 0 });
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const receiveBuffer = useRef<ArrayBuffer[]>([]);
  const receivedSize = useRef<number>(0);
  const fileInfo = useRef<{ name: string; size: number; } | null>(null);

  useEffect(() => {
    if (!roomId) return;

    setState(s => ({ ...s, status: isSender ? 'connecting' : 'waiting' }));

    const socket = io();
    socketRef.current = socket;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    });
    pcRef.current = pc;

    socket.emit('join-room', roomId);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { roomId, candidate: event.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setState(s => ({ ...s, status: 'connected' }));
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setState(s => ({ ...s, status: 'error', error: 'Connection lost' }));
      }
    };

    if (isSender) {
      // Sender creates the data channel
      const dc = pc.createDataChannel('fileTransfer');
      dcRef.current = dc;
      setupDataChannel(dc);

      // We wait a tiny bit to ensure the receiver has joined before offering,
      // Or we can rely on the 'peer-connected' event.
      socket.on('peer-connected', async () => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { roomId, offer });
      });

      // If we joined late and the other is already there (though usually receiver is first)
      // we might want to proactively send an offer immediately if they don't emit peer-connected
      // But let's assume receiver creates room and waits.

      socket.emit('sender-joined', roomId); // We could add this to signal server, but let's just trigger offer when receiver says hello?
      // Actually, if we just create and send offer immediately, the receiver might not have joined yet!
      // But if receiver generated the PIN, they are already there!
      const initOffer = async () => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { roomId, offer });
      };
      initOffer();

    } else {
      // Receiver waits for data channel
      pc.ondatachannel = (event) => {
        const dc = event.channel;
        dcRef.current = dc;
        setupDataChannel(dc);
      };
    }

    socket.on('offer', async ({ offer }) => {
      if (!isSender) {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { roomId, answer });
      }
    });

    socket.on('answer', async ({ answer }) => {
      if (isSender) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      if (candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socket.disconnect();
      pc.close();
      if (dcRef.current) dcRef.current.close();
    };
  }, [roomId, isSender]);

  const setupDataChannel = (dc: RTCDataChannel) => {
    dc.binaryType = 'arraybuffer';

    dc.onopen = () => {
      setState(s => ({ ...s, status: 'connected' }));
    };

    dc.onclose = () => {
      // closed
    };

    dc.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const meta = JSON.parse(event.data);
          if (meta.type === 'file-meta') {
            fileInfo.current = { name: meta.name, size: meta.size };
            receiveBuffer.current = [];
            receivedSize.current = 0;
            setState(s => ({ ...s, status: 'transferring', progress: 0, fileName: meta.name, fileSize: meta.size }));
          } else if (meta.type === 'transfer-complete') {
            finishDownload();
          }
        } catch (e) {
          console.error('Meta parsing error', e);
        }
      } else if (event.data instanceof ArrayBuffer) {
        receiveBuffer.current.push(event.data);
        receivedSize.current += event.data.byteLength;
        const info = fileInfo.current;
        if (info && info.size > 0) {
          const progress = Math.round((receivedSize.current / info.size) * 100);
          setState(s => ({ ...s, progress }));
        }
      }
    };
  };

  const finishDownload = () => {
    const info = fileInfo.current;
    if (!info) return;

    const blob = new Blob(receiveBuffer.current);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = info.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setState(s => ({ ...s, status: 'completed', progress: 100 }));
  };

  const sendFile = (file: File) => {
    const dc = dcRef.current;
    if (!dc || dc.readyState !== 'open') {
      setState(s => ({ ...s, status: 'error', error: 'Not connected' }));
      return;
    }

    setState(s => ({ ...s, status: 'transferring', progress: 0, fileName: file.name, fileSize: file.size }));

    // Send metadata
    dc.send(JSON.stringify({ type: 'file-meta', name: file.name, size: file.size }));

    let offset = 0;
    const reader = new FileReader();

    const readSlice = (o: number) => {
      const slice = file.slice(o, o + CHUNK_SIZE);
      reader.readAsArrayBuffer(slice);
    };

    reader.onload = (e) => {
      if (e.target?.readyState === FileReader.DONE) {
        const buffer = e.target.result as ArrayBuffer;
        
        // Wait until buffer is low before sending more to avoid internal memory limits
        const sendNext = () => {
          if (dc.bufferedAmount > dc.bufferedAmountLowThreshold) {
             dc.onbufferedamountlow = () => {
               dc.onbufferedamountlow = null;
               sendNext();
             };
             return;
          }
          
          dc.send(buffer);
          offset += buffer.byteLength;
          const progress = Math.round((offset / file.size) * 100);
          setState(s => ({ ...s, progress }));

          if (offset < file.size) {
            readSlice(offset);
          } else {
            // Done taking slices, send completion signal
            dc.send(JSON.stringify({ type: 'transfer-complete' }));
            setState(s => ({ ...s, status: 'completed', progress: 100 }));
          }
        };

        sendNext();
      }
    };

    dc.bufferedAmountLowThreshold = 1024 * 1024; // Wait when above 1MB
    readSlice(0);
  };

  return { state, sendFile };
}
