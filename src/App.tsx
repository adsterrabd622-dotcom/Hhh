import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { useWebRTC } from './useWebRTC';
import { QRCodeSVG } from 'qrcode.react';
import { Send, Download, Smartphone, Monitor, ArrowRight, CheckCircle, RefreshCcw, AlertCircle } from 'lucide-react';

type AppMode = 'home' | 'receive' | 'send';

export default function App() {
  const [mode, setMode] = useState<AppMode>('home');
  const [pin, setPin] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
    const searchParams = new URLSearchParams(window.location.search);
    const sendPin = searchParams.get('send');
    if (sendPin) {
      setPin(sendPin);
      setMode('send');
    }
  }, []);

  const handleStartReceive = () => {
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    setPin(newPin);
    setMode('receive');
    window.history.pushState({}, '', `/?receive=${newPin}`);
  };

  const handleStartSend = () => {
    setMode('send');
    window.history.pushState({}, '', `/`);
  };

  const goHome = () => {
    setMode('home');
    setPin('');
    window.history.pushState({}, '', `/`);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans selection:bg-emerald-500/30">
      <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col items-center">
        
        {/* Header */}
        <header className="flex items-center space-x-3 mb-16 cursor-pointer" onClick={goHome}>
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center transform rotate-3">
            <Send className="w-5 h-5 text-neutral-900 font-bold" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Local Drop</h1>
        </header>

        {/* Content */}
        <div className="w-full">
          {mode === 'home' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-500">
              <button 
                onClick={handleStartReceive}
                className="group relative flex flex-col items-center p-8 bg-neutral-800 border border-neutral-700/50 rounded-3xl hover:bg-neutral-800/80 transition-all active:scale-95"
              >
                <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Monitor className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Receive on PC</h2>
                <p className="text-neutral-400 text-sm text-center">Generate a code to receive files on this device.</p>
              </button>

              <button 
                onClick={handleStartSend}
                className="group relative flex flex-col items-center p-8 bg-neutral-800 border border-neutral-700/50 rounded-3xl hover:bg-neutral-800/80 transition-all active:scale-95"
              >
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Send from Phone</h2>
                <p className="text-neutral-400 text-sm text-center">Enter a code or scan QR to send files to a PC.</p>
              </button>
            </div>
          )}

          {mode === 'receive' && (
            <ReceiveView pin={pin} baseUrl={baseUrl} />
          )}

          {mode === 'send' && (
            <SendView initialPin={pin} />
          )}

        </div>
      </div>
    </div>
  );
}

function ReceiveView({ pin, baseUrl }: { pin: string, baseUrl: string }) {
  const { state } = useWebRTC(pin, false);

  const StatusIcon = () => {
    switch (state.status) {
      case 'waiting': return <RefreshCcw className="w-6 h-6 animate-spin text-blue-400" />;
      case 'connected': return <CheckCircle className="w-6 h-6 text-emerald-400" />;
      case 'transferring': return <Download className="w-6 h-6 text-emerald-400 animate-bounce" />;
      case 'completed': return <CheckCircle className="w-6 h-6 text-emerald-400" />;
      case 'error': return <AlertCircle className="w-6 h-6 text-red-500" />;
      default: return null;
    }
  };

  const getStatusText = () => {
    switch (state.status) {
      case 'waiting': return 'Waiting for sender to connect...';
      case 'connected': return 'Device connected! Waiting for file...';
      case 'transferring': return `Receiving file...`;
      case 'completed': return 'Transfer complete!';
      case 'error': return 'Connection error or disconnected.';
      default: return 'Initializing...';
    }
  };

  return (
    <div className="flex flex-col items-center animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="bg-neutral-800 rounded-3xl p-8 w-full max-w-md border border-neutral-700/50 flex flex-col items-center relative overflow-hidden">
        
        {/* Progress Background */}
        {(state.status === 'transferring' || state.status === 'completed') && (
          <div 
            className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-300"
            style={{ width: `${state.progress}%` }}
          />
        )}

        <h2 className="text-lg text-neutral-400 mb-6 font-medium tracking-wide uppercase text-center">Receive Mode</h2>
        
        {state.status === 'waiting' && (
          <>
            <div className="bg-white p-4 rounded-2xl mb-8">
              <QRCodeSVG 
                value={`${baseUrl}/?send=${pin}`} 
                size={200}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
              />
            </div>
            
            <div className="text-center mb-6">
              <p className="text-sm text-neutral-500 mb-2">Or enter this PIN on sender device</p>
              <div className="text-5xl font-mono font-bold tracking-widest text-white tracking-[0.2em] ml-[0.1em]">{pin}</div>
            </div>
          </>
        )}

        <div className="flex flex-col items-center mt-4">
          <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center mb-4">
            <StatusIcon />
          </div>
          <p className="text-lg font-medium text-center">{getStatusText()}</p>
          
          {state.fileName && (
            <div className="mt-4 text-center">
              <p className="text-xl font-semibold mb-1 truncate max-w-[250px]">{state.fileName}</p>
              <p className="text-neutral-400 text-sm">{(state.fileSize! / 1024 / 1024).toFixed(2)} MB • {state.progress}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SendView({ initialPin }: { initialPin: string }) {
  const [pinInput, setPinInput] = useState(initialPin);
  const [activePin, setActivePin] = useState<string | null>(initialPin || null);
  const { state, sendFile } = useWebRTC(activePin, true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConnect = (e: FormEvent) => {
    e.preventDefault();
    if (pinInput.length >= 6) {
      setActivePin(pinInput);
      window.history.pushState({}, '', `/?send=${pinInput}`);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sendFile(file);
    }
  };

  const StatusIcon = () => {
    switch (state.status) {
      case 'connecting': return <RefreshCcw className="w-6 h-6 animate-spin text-emerald-400" />;
      case 'connected': return <CheckCircle className="w-6 h-6 text-emerald-400" />;
      case 'transferring': return <Send className="w-6 h-6 text-emerald-400 animate-bounce" />;
      case 'completed': return <CheckCircle className="w-6 h-6 text-emerald-400" />;
      case 'error': return <AlertCircle className="w-6 h-6 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col items-center animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="bg-neutral-800 rounded-3xl p-8 w-full max-w-md border border-neutral-700/50">
        <h2 className="text-lg text-neutral-400 mb-6 font-medium tracking-wide uppercase text-center">Send Mode</h2>

        {!activePin ? (
          <form onSubmit={handleConnect} className="flex flex-col space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Enter 6-Digit PIN</label>
              <input 
                type="text" 
                maxLength={6}
                value={pinInput}
                onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-4 text-center text-3xl font-mono tracking-[0.2em] focus:outline-none focus:border-emerald-500 transition-colors placeholder-neutral-700"
                placeholder="000000"
                autoFocus
              />
            </div>
            <button 
              type="submit"
              disabled={pinInput.length < 6}
              className="w-full bg-emerald-500 text-neutral-900 font-bold text-lg py-4 rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
               Connect <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center relative">
            
            {/* Progress Background */}
            {(state.status === 'transferring' || state.status === 'completed') && (
              <div 
                className="absolute -bottom-8 -left-8 -right-8 h-1 bg-emerald-500 transition-all duration-300"
                style={{ width: `${state.progress}%` }}
              />
            )}

            <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center mb-4">
              <StatusIcon />
            </div>

            <p className="text-lg font-medium text-center mb-6">
              {state.status === 'connecting' && 'Connecting to device...'}
              {state.status === 'connected' && 'Connected! Select a file.'}
              {state.status === 'transferring' && `Sending file...`}
              {state.status === 'completed' && 'Sent successfully!'}
              {state.status === 'error' && 'Connection error.'}
            </p>

            {state.status === 'connected' && (
              <>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-neutral-900 border border-emerald-500/50 hover:border-emerald-500 hover:bg-emerald-500/10 text-emerald-400 font-semibold py-4 rounded-xl transition-all"
                >
                  Select File
                </button>
              </>
            )}

            {state.fileName && (
              <div className="mt-4 text-center w-full bg-neutral-900 p-4 rounded-xl border border-neutral-700">
                <p className="text-md font-semibold mb-1 truncate">{state.fileName}</p>
                <div className="flex justify-between text-neutral-400 text-sm">
                  <span>{(state.fileSize! / 1024 / 1024).toFixed(2)} MB</span>
                  <span>{state.progress}%</span>
                </div>
              </div>
            )}
            
            {state.status === 'completed' && (
              <button 
                onClick={() => {
                  fileInputRef.current && (fileInputRef.current.value = '');
                  // Note: simple reload or state reset, but easiest to stay connected and let user select another
                  // But our useWebRTC state doesn't cleanly reset to standard 'connected' after complete without hack
                  // Let's just instruct them to select file again by showing the button
                  fileInputRef.current?.click();
                }}
                className="mt-6 w-full text-emerald-500 hover:text-emerald-400 text-sm font-medium"
              >
                Send Another File
              </button>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
