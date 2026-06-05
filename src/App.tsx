import { useState, useEffect, useRef, FormEvent, ChangeEvent, DragEvent } from 'react';
import { useWebRTC } from './useWebRTC';
import { QRCodeSVG } from 'qrcode.react';
import { Send, Download, Smartphone, Monitor, ArrowRight, CheckCircle, RefreshCcw, AlertCircle, ArrowLeft, Copy, Check, UploadCloud, Shield, Zap, Sparkles, Share2, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500/30 overflow-hidden relative flex flex-col">
      {/* Decorative Background Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] -z-10" />
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-emerald-100/80 to-transparent -z-10" />
      <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full bg-emerald-300/10 blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-300/10 blur-[120px] -z-10" />

      <div className="max-w-4xl w-full mx-auto px-6 py-8 md:py-16 flex-1 flex flex-col">
        
        {/* Header */}
        <motion.div 
          layout
          className="flex items-center justify-between w-full mb-12 lg:mb-20"
        >
          <header className="flex items-center space-x-4 cursor-pointer group" onClick={goHome}>
            <motion.div 
              whileHover={{ rotate: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg shadow-emerald-500/20 flex items-center justify-center bg-white ring-1 ring-slate-900/5"
            >
              <img src="/src/assets/images/premium_pigeon_logo_1780648822634.png" alt="Payra Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 transition-colors">
              পায়রা <span className="text-emerald-500 font-bold ml-1">Payra</span>
            </h1>
          </header>

          <AnimatePresence mode="popLayout">
            {mode !== 'home' && (
              <motion.button 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={goHome}
                className="flex items-center font-medium text-slate-500 hover:text-slate-900 transition-colors px-5 py-2.5 hover:bg-slate-200/50 rounded-2xl"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Content */}
        <div className="w-full flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {mode === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex flex-col space-y-12 pb-20"
              >
                {/* Hero Feature Section */}
                <div className="text-center space-y-4 max-w-2xl mx-auto mb-4">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold border border-emerald-100/50 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
                    <span>কোনো মেমোরি বা ক্লাউড স্টোরেজ সীমা নেই</span>
                  </motion.div>
                  
                  <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-800 leading-[1.15]">
                    নিরাপদ ও দ্রুততম <span className="text-emerald-500 bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">পিয়ার-টু-পিয়ার</span> ফাইল শেয়ারিং
                  </h2>
                  <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
                    কোনো লগইন বা ইন্টারমিডিয়েট ক্লাউড স্টোরেজ ছাড়াই সম্পূর্ণ সুরক্ষিতভাবে সরাসরি মোবাইল থেকে পিসিতে ফাইল স্থানান্তর করুন মুহূর্তের মধ্যে।
                  </p>
                </div>

                {/* Main Interactive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.button 
                    whileHover={{ y: -6, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartReceive}
                    className="group relative flex flex-col items-center p-8 sm:p-10 bg-white/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.06)] border border-slate-100 rounded-[2.5rem] overflow-hidden text-center cursor-pointer transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-teal-50/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 group-hover:rotate-1 group-hover:shadow-md transition-all duration-300">
                      <Monitor className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <h3 className="relative text-xl sm:text-2xl font-bold text-slate-800 mb-2.5 group-hover:text-blue-600 transition-colors">Receive File on PC</h3>
                    <p className="relative text-slate-500 text-xs sm:text-sm leading-relaxed max-w-[260px] mx-auto">Generate a highly secure connection PIN to catch incoming files onto this computer.</p>
                    <div className="mt-5 inline-flex items-center text-xs font-semibold text-blue-500 group-hover:translate-x-1 transition-transform">
                      <span>Start Receiver</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </motion.button>

                  <motion.button 
                    whileHover={{ y: -6, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartSend}
                    className="group relative flex flex-col items-center p-8 sm:p-10 bg-white/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.07)] border border-slate-100 rounded-[2.5rem] overflow-hidden text-center cursor-pointer transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-teal-50/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 group-hover:-rotate-1 group-hover:shadow-md transition-all duration-300">
                      <Smartphone className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <h3 className="relative text-xl sm:text-2xl font-bold text-slate-800 mb-2.5 group-hover:text-emerald-600 transition-colors">Send from Device</h3>
                    <p className="relative text-slate-500 text-xs sm:text-sm leading-relaxed max-w-[260px] mx-auto">Scan QR code or input the 6-digit PIN to instantly push document files, images, or folders.</p>
                    <div className="mt-5 inline-flex items-center text-xs font-semibold text-emerald-500 group-hover:translate-x-1 transition-transform">
                      <span>Start Sharing</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </motion.button>
                </div>

                {/* Step-by-Step Interactive "How it Works" section */}
                <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-6 sm:p-10 border border-slate-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.01)] w-full mx-auto">
                  <div className="flex items-center space-x-3 mb-6 sm:mb-8 justify-center sm:justify-start">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <HelpCircle className="w-5 h-5 stroke-[2]" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800">পায়রা কিভাবে কাজ করে?</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
                    <div className="space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-sm font-black mx-auto md:mx-0 shadow-sm">
                        ১
                      </div>
                      <h5 className="font-bold text-slate-800 text-sm sm:text-base pt-1">রিসিভার সিলেক্ট করুন</h5>
                      <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                        যে ল্যাপটপ বা ডিভাইসে ফাইল রিসিভ করতে চান, সেখানে <span className="font-semibold text-slate-700">Receive on PC</span> বাটনে ক্লিক করে PIN তৈরি করুন।
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center text-sm font-black mx-auto md:mx-0">
                        ২
                      </div>
                      <h5 className="font-bold text-slate-800 text-sm sm:text-base pt-1">কানেকশন সেটআপ করুন</h5>
                      <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                        মোবাইল ফোনে <span className="font-semibold text-slate-700">Send from Device</span> সিলেক্ট করে ৬ ডিজিট PIN ব্যবহার করুন অথবা QR কোডটি স্ক্যান করুন।
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center text-sm font-black mx-auto md:mx-0">
                        ৩
                      </div>
                      <h5 className="font-bold text-slate-800 text-sm sm:text-base pt-1">তাত্ক্ষণিক ও নিরাপদ পাঠান</h5>
                      <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                        আপনার ফাইল বাছাই করুন! সরাসরি ও অত্যন্ত সুরক্ষিত <span className="font-semibold text-teal-600">WebRTC পিয়ার-টু-পিয়ার</span> টানেলে ফাইল ট্রান্সফার সম্পন্ন হবে।
                      </p>
                    </div>
                  </div>
                </div>

                {/* Elegant Feature Specs List */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <div className="bg-white/50 backdrop-blur-sm border border-slate-100 hover:bg-slate-100/80 p-4 rounded-2xl flex items-center space-x-3 transition-colors duration-200">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                      <Shield className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">১০০% নিরাপদ</h5>
                      <p className="text-[10px] text-slate-400">সরাসরি ডেটা টানেল</p>
                    </div>
                  </div>

                  <div className="bg-white/50 backdrop-blur-sm border border-slate-100 hover:bg-slate-100/80 p-4 rounded-2xl flex items-center space-x-3 transition-colors duration-200">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                      <Zap className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">সীমাহীন গতি</h5>
                      <p className="text-[10px] text-slate-400">WebRTC প্রযুক্তির ব্যবহার</p>
                    </div>
                  </div>

                  <div className="bg-white/50 backdrop-blur-sm border border-slate-100 hover:bg-slate-100/80 p-4 rounded-2xl flex items-center space-x-3 transition-colors duration-200">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                      <Share2 className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">নো ফাইল সাইজ লিমিট</h5>
                      <p className="text-[10px] text-slate-400">যেকোনো বড় ডেটা পাঠান</p>
                    </div>
                  </div>

                  <div className="bg-white/50 backdrop-blur-sm border border-slate-100 hover:bg-slate-100/80 p-4 rounded-2xl flex items-center space-x-3 transition-colors duration-200">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                      <Sparkles className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">কোন সাইনআপ নেই</h5>
                      <p className="text-[10px] text-slate-400">কোন অতিরিক্ত অ্যাকাউন্ট ছাড়াই</p>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {mode === 'receive' && (
              <motion.div
                key="receive"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full flex justify-center pb-20"
              >
                <ReceiveView pin={pin} baseUrl={baseUrl} />
              </motion.div>
            )}

            {mode === 'send' && (
              <motion.div
                key="send"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full flex justify-center pb-20"
              >
                <SendView initialPin={pin} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ReceiveView({ pin, baseUrl }: { pin: string, baseUrl: string }) {
  const { state } = useWebRTC(pin, false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const link = `${baseUrl}/?send=${pin}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const StatusIcon = () => {
    switch (state.status) {
      case 'waiting': return <RefreshCcw className="w-7 h-7 md:w-8 md:h-8 animate-spin text-blue-500 stroke-[1.5]" />;
      case 'connected': return <CheckCircle className="w-7 h-7 md:w-8 md:h-8 text-emerald-500 stroke-[1.5]" />;
      case 'transferring': return <Download className="w-7 h-7 md:w-8 md:h-8 text-emerald-500 animate-bounce stroke-[1.5]" />;
      case 'completed': return <CheckCircle className="w-7 h-7 md:w-8 md:h-8 text-emerald-500 stroke-[1.5]" />;
      case 'error': return <AlertCircle className="w-7 h-7 md:w-8 md:h-8 text-rose-500 stroke-[1.5]" />;
      default: return null;
    }
  };

  const getStatusText = () => {
    switch (state.status) {
      case 'waiting': return 'Waiting for sender...';
      case 'connected': return 'Device connected! Ready.';
      case 'transferring': return `Receiving file...`;
      case 'completed': return 'Transfer complete!';
      case 'error': return 'Connection failed.';
      default: return 'Initializing...';
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-3xl rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 w-full max-w-lg shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-white/50 flex flex-col items-center relative overflow-hidden group">
      
      {/* Progress Background */}
      <AnimatePresence>
        {(state.status === 'transferring' || state.status === 'completed') && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-0 left-0 h-1.5 bg-emerald-500/20 w-full"
          >
            <motion.div 
              className="h-full bg-emerald-500 transition-all duration-300 ease-out rounded-r-full"
              style={{ width: `${state.progress}%` }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-center space-x-3 mb-6 sm:mb-8">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <Monitor className="w-5 h-5 text-blue-500" />
        </div>
        <h2 className="text-xl text-slate-800 font-bold tracking-tight">Receive File</h2>
      </div>
      
      {state.status === 'waiting' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex flex-col items-center"
        >
          <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-100 mb-6 sm:mb-8 inline-block">
            <QRCodeSVG 
              value={`${baseUrl}/?send=${pin}`} 
              size={180}
              bgColor={"#ffffff"}
              fgColor={"#0f172a"}
              className="rounded-xl max-w-full h-auto"
            />
          </div>
          
          <div className="text-center mb-6 w-full">
            <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-widest">Or enter this PIN</p>
            <div className="text-4xl sm:text-6xl font-mono font-bold text-slate-800 tracking-[0.2em] sm:tracking-[0.25em] ml-[0.11em] sm:ml-[0.125em]">{pin}</div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopyLink}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all duration-200 cursor-pointer ${
              copied 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                : 'bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-500 hover:text-slate-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Send Link</span>
              </>
            )}
          </motion.button>
        </motion.div>
      )}

      <motion.div layout className="flex flex-col items-center mt-4 sm:mt-6 w-full">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-50 border border-slate-100 shadow-inner flex items-center justify-center mb-4 sm:mb-6">
          <StatusIcon />
        </div>
        <p className="text-lg sm:text-xl font-semibold text-slate-800 text-center">{getStatusText()}</p>
        
        {state.fileName && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center w-full bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100"
          >
            <p className="text-base sm:text-lg font-bold text-slate-800 mb-2 truncate px-2">{state.fileName}</p>
            <div className="flex justify-between items-center px-2 text-slate-500 text-xs sm:text-sm font-medium">
              <span>{(state.fileSize! / 1024 / 1024).toFixed(2)} MB</span>
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{state.progress}%</span>
            </div>
          </motion.div>
        )}

        {state.status === 'waiting' && (
          <p className="text-xs text-slate-400 mt-6 text-center max-w-[280px]">
            Tip: Keep this browser tab open until the file has completed transferring.
          </p>
        )}
      </motion.div>
    </div>
  );
}

function SendView({ initialPin }: { initialPin: string }) {
  const [pinInput, setPinInput] = useState(initialPin);
  const [activePin, setActivePin] = useState<string | null>(initialPin || null);
  const { state, sendFile } = useWebRTC(activePin, true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      sendFile(file);
    }
  };

  const StatusIcon = () => {
    switch (state.status) {
      case 'connecting': return <RefreshCcw className="w-7 h-7 md:w-8 md:h-8 animate-spin text-emerald-500 stroke-[1.5]" />;
      case 'connected': return <CheckCircle className="w-7 h-7 md:w-8 md:h-8 text-emerald-500 stroke-[1.5]" />;
      case 'transferring': return <Send className="w-7 h-7 md:w-8 md:h-8 text-emerald-500 animate-bounce stroke-[1.5]" />;
      case 'completed': return <CheckCircle className="w-7 h-7 md:w-8 md:h-8 text-emerald-500 stroke-[1.5]" />;
      case 'error': return <AlertCircle className="w-7 h-7 md:w-8 md:h-8 text-rose-500 stroke-[1.5]" />;
      default: return null;
    }
  };

  return (
    <div 
      onDragOver={state.status === 'connected' ? handleDragOver : undefined}
      onDragLeave={state.status === 'connected' ? handleDragLeave : undefined}
      onDrop={state.status === 'connected' ? handleDrop : undefined}
      className={`bg-white/95 backdrop-blur-3xl rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 w-full max-w-lg shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-white/50 relative overflow-hidden flex flex-col items-center transition-all duration-200 ${
        isDragging ? 'ring-4 ring-emerald-400 bg-emerald-50/10' : ''
      }`}
    >
      <div className="flex items-center justify-center space-x-3 mb-6 sm:mb-8 w-full">
        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
          <Smartphone className="w-5 h-5 text-emerald-500" />
        </div>
        <h2 className="text-xl text-slate-800 font-bold tracking-tight">Send File</h2>
      </div>

      {!activePin ? (
        <motion.form 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onSubmit={handleConnect} 
          className="flex flex-col space-y-6 w-full"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-3 text-center uppercase tracking-widest leading-none">Enter 6-Digit PIN</label>
            <input 
              type="text" 
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pinInput}
              onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-5 font-mono font-bold tracking-[0.2em] sm:tracking-[0.25em] text-center text-4xl sm:text-5xl text-slate-800 focus:outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-400/15 transition-all placeholder-slate-200"
              placeholder="000000"
              autoFocus
            />
            <p className="text-xs text-slate-400 mt-3 text-center">
              The PIN generated on the receiving device.
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: pinInput.length >= 6 ? 1.02 : 1 }}
            whileTap={{ scale: pinInput.length >= 6 ? 0.98 : 1 }}
            type="submit"
            disabled={pinInput.length < 6}
            className="w-full bg-slate-900 text-white font-bold text-base sm:text-lg py-4 sm:py-5 rounded-2xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:hover:bg-slate-950 shadow-xl shadow-slate-900/10 flex items-center justify-center cursor-pointer min-h-[48px]"
          >
             Connect <ArrowRight className="ml-2 w-5 h-5" />
          </motion.button>
        </motion.form>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center relative w-full"
        >
          
          {/* Progress Background */}
          <AnimatePresence>
            {(state.status === 'transferring' || state.status === 'completed') && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute -bottom-6 sm:-bottom-10 left-[-1.5rem] sm:left-[-2.5rem] right-[-1.5rem] sm:right-[-2.5rem] h-1.5 bg-emerald-500/20"
              >
                <motion.div 
                  className="h-full bg-emerald-500 transition-all duration-300 ease-out rounded-r-full"
                  style={{ width: `${state.progress}%` }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-50 border border-slate-100 shadow-inner flex items-center justify-center mb-4 sm:mb-6">
            <StatusIcon />
          </div>

          <p className="text-lg sm:text-xl font-bold text-slate-800 text-center mb-6 sm:mb-8">
            {state.status === 'connecting' && 'Connecting...'}
            {state.status === 'connected' && 'Connected! Select a file.'}
            {state.status === 'transferring' && `Sending file...`}
            {state.status === 'completed' && 'Sent successfully!'}
            {state.status === 'error' && 'Connection error.'}
          </p>

          {state.status === 'connected' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="w-full"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
              />
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-emerald-500 bg-emerald-500/5' 
                    : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50/50'
                }`}
              >
                <UploadCloud className={`w-12 h-12 mb-3 transition-colors ${
                  isDragging ? 'text-emerald-500' : 'text-slate-400'
                }`} />
                
                <span className="text-base sm:text-lg font-bold text-slate-700 text-center mb-1">
                  {isDragging ? "Drop your file here!" : "Select file to send"}
                </span>
                
                <p className="text-slate-400 text-xs sm:text-sm text-center">
                  Drag & drop file here, or <span className="text-emerald-500 font-semibold underline">browse folders</span>
                </p>
              </div>
            </motion.div>
          )}

          {state.fileName && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-center w-full bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100"
            >
              <p className="text-base sm:text-lg font-bold text-slate-800 mb-2 truncate px-2">{state.fileName}</p>
              <div className="flex justify-between items-center px-2 text-slate-500 text-xs sm:text-sm font-medium">
                <span>{(state.fileSize! / 1024 / 1024).toFixed(2)} MB</span>
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{state.progress}%</span>
              </div>
            </motion.div>
          )}
          
          {state.status === 'completed' && (
            <motion.button 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
                fileInputRef.current?.click();
              }}
              className="mt-6 sm:mt-8 px-6 py-3 bg-slate-50 border border-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center space-x-2 shadow-sm"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Send Another File</span>
            </motion.button>
          )}

        </motion.div>
      )}
    </div>
  );
}

