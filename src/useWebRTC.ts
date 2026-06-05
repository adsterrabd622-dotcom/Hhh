import { useState, useEffect, useRef } from 'react';
import { Peer, DataConnection } from 'peerjs';

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
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const receiveBuffer = useRef<ArrayBuffer[]>([]);
  const receivedSize = useRef<number>(0);
  const fileInfo = useRef<{ name: string; size: number; } | null>(null);

  useEffect(() => {
    if (!roomId) return;

    setState(s => ({ ...s, status: isSender ? 'connecting' : 'waiting' }));

    let peer: Peer;

    if (!isSender) {
      // Receiver uses the PIN as their Peer ID
      peer = new Peer(`payra-v1-${roomId}`);
      peerRef.current = peer;

      peer.on('open', () => {
        // Ready to receive connections
      });

      peer.on('connection', (conn) => {
        setupDataConnection(conn);
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        setState(s => ({ ...s, status: 'error', error: 'Connection failed' }));
      });
    } else {
      // Sender generates a random Peer ID
      peer = new Peer();
      peerRef.current = peer;

      peer.on('open', () => {
        // Connect to the receiver's ID
        const conn = peer.connect(`payra-v1-${roomId}`, {
          reliable: true,
        });
        setupDataConnection(conn);
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        setState(s => ({ ...s, status: 'error', error: 'Could not connect' }));
      });
    }

    return () => {
      if (connRef.current) {
        connRef.current.close();
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [roomId, isSender]);

  const setupDataConnection = (conn: DataConnection) => {
    connRef.current = conn;

    conn.on('open', () => {
      setState(s => ({ ...s, status: 'connected', error: undefined }));
    });

    conn.on('data', (data: any) => {
      if (typeof data === 'string') {
        try {
          const meta = JSON.parse(data);
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
      } else if (data instanceof ArrayBuffer || data instanceof Uint8Array || data instanceof Blob) {
        // Handle incoming binary chunks
        const handleBinary = async (chunk: ArrayBuffer | Uint8Array | Blob) => {
          let buffer: ArrayBuffer;
          if (chunk instanceof Blob) {
             buffer = await chunk.arrayBuffer();
          } else if (chunk instanceof Uint8Array) {
             buffer = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);
          } else {
             buffer = chunk;
          }
          
          receiveBuffer.current.push(buffer);
          receivedSize.current += buffer.byteLength;
          const info = fileInfo.current;
          if (info && info.size > 0) {
            const progress = Math.round((receivedSize.current / info.size) * 100);
            setState(s => ({ ...s, progress }));
          }
        };
        handleBinary(data);
      }
    });

    conn.on('close', () => {
      // Connection closed
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err);
      setState(s => ({ ...s, status: 'error', error: 'Transfer failed' }));
    });
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
    const conn = connRef.current;
    if (!conn || !conn.open) {
      setState(s => ({ ...s, status: 'error', error: 'Not connected' }));
      return;
    }

    setState(s => ({ ...s, status: 'transferring', progress: 0, fileName: file.name, fileSize: file.size }));

    // Send metadata
    conn.send(JSON.stringify({ type: 'file-meta', name: file.name, size: file.size }));

    let offset = 0;
    const reader = new FileReader();

    const readSlice = (o: number) => {
      const slice = file.slice(o, o + CHUNK_SIZE);
      reader.readAsArrayBuffer(slice);
    };

    reader.onload = (e) => {
      if (e.target?.readyState === FileReader.DONE) {
        const buffer = e.target.result as ArrayBuffer;
        
        // PeerJS abstracts DataChannel. We can just send.
        // It manages buffering internally, but to prevent massive memory usage
        // we could throttle, but PeerJS has built-in chunking or handles it.
        // For simplicity and avoiding buffer bloat, we send incrementally
        conn.send(buffer);
        
        offset += buffer.byteLength;
        const progress = Math.round((offset / file.size) * 100);
        setState(s => ({ ...s, progress }));

        if (offset < file.size) {
           // Small delay to allow buffer to drain and unblock UI thread
           setTimeout(() => {
             readSlice(offset);
           }, 5);
        } else {
          // Done taking slices, send completion signal
          setTimeout(() => {
            conn.send(JSON.stringify({ type: 'transfer-complete' }));
            setState(s => ({ ...s, status: 'completed', progress: 100 }));
          }, 500); // Give it a moment to finish sending last chunks
        }
      }
    };

    readSlice(0);
  };

  return { state, sendFile };
}
