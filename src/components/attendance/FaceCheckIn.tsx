"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { Loader2, UserCheck, Focus } from 'lucide-react';

interface FaceCheckInProps {
  onCheckInSuccess: (userId: string) => void;
  cooldownSeconds?: number;
}

export default function FaceCheckIn({ onCheckInSuccess, cooldownSeconds = 5 }: FaceCheckInProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [status, setStatus] = useState<'scanning' | 'matched' | 'unknown' | 'error'>('scanning');
  const [message, setMessage] = useState('Đang khởi tạo...');
  const [matchedName, setMatchedName] = useState<string | null>(null);

  const faceMatcherRef = useRef<faceapi.FaceMatcher | null>(null);
  const isCooldownRef = useRef(false);

  useEffect(() => {
    let isSubscribed = true;

    const init = async () => {
      try {
        setMessage('Đang tải mô hình AI...');
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);

        setMessage('Đang nạp dữ liệu nhân viên...');
        const res = await fetch(`/api/staff/faces?t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        
        if (!data.success || !data.faces || data.faces.length === 0) {
          if (isSubscribed) {
             setStatus('error');
             setMessage('Hệ thống chưa có nhân viên nào đăng ký khuôn mặt.');
             setIsInitializing(false);
          }
          return;
        }

        const labeledDescriptors = data.faces.map((staff: any) => {
          return new faceapi.LabeledFaceDescriptors(
            `${staff.id}|${staff.fullName}`,
            [new Float32Array(staff.faceDescriptor)]
          );
        });

        faceMatcherRef.current = new faceapi.FaceMatcher(labeledDescriptors, 0.45); // threshold 0.45 for safety

        if (isSubscribed) {
          setIsInitializing(false);
          setMessage('Sẵn sàng nhận diện');
        }
      } catch (err: any) {
        if (isSubscribed) {
          setStatus('error');
          setMessage(err.message || 'Lỗi khởi tạo hệ thống.');
          console.error(err);
        }
      }
    };

    init();

    return () => { isSubscribed = false; };
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: NodeJS.Timeout;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.play().catch(e => console.error("Auto-play was prevented:", e));
        }
      } catch (err) {
        setStatus('error');
        setMessage('Không có quyền truy cập Camera.');
      }
    };

    if (!isInitializing && status !== 'error') {
      startCamera();
    }

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitializing]);

  const handleVideoPlay = () => {
    setIsCameraReady(true);
    // Start scanning interval
    const interval = setInterval(async () => {
      if (
        !videoRef.current ||
        !faceMatcherRef.current ||
        videoRef.current.paused ||
        videoRef.current.ended ||
        isCooldownRef.current
      ) return;

      const detections = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks().withFaceDescriptor();

      if (detections && canvasRef.current && videoRef.current) {
         // Draw box tracking if needed, but we don't strictly need to render the box, just check the face
         const match = faceMatcherRef.current.findBestMatch(detections.descriptor);
         
         if (match.label !== 'unknown') {
            const [matchedId, matchedName] = match.label.split('|');
            isCooldownRef.current = true;
            setStatus('matched');
            setMatchedName(matchedName);
            setMessage(`Xin chào ${matchedName}`);
            
            // Trigger checkIn action
            onCheckInSuccess(matchedId);

            // Wait before scanning again
            setTimeout(() => {
               isCooldownRef.current = false;
               setStatus('scanning');
               setMatchedName(null);
               setMessage('Đang quét...');
            }, cooldownSeconds * 1000);
         } else {
             // Avoid flickering "unknown" constantly unless we want to show it
             if (status !== 'unknown' && !isCooldownRef.current) {
                 setStatus('unknown');
                 setMessage('Lỗi: Nhận diện khuôn mặt không chính xác');
                 setTimeout(() => { if (!isCooldownRef.current) setStatus('scanning'); }, 3000);
             }
         }
      }
    }, 500); // scan every 500ms
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] rounded-3xl shadow-2xl overflow-hidden border border-white/10 relative">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
      
      <div className="text-center z-10 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold tracking-widest text-[#D4AF37] uppercase mb-1 sm:mb-2">Check-In Khuôn Mặt</h2>
        <p className="text-white/60 text-sm sm:text-base font-light tracking-wide">{message}</p>
      </div>

      <div className="relative w-full max-w-sm flex-1 min-h-[250px] bg-black rounded-[40px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 group">
        {!isCameraReady || isInitializing ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80">
             <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
             <p className="text-primary font-medium">{message}</p>
           </div>
        ) : null}
        
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          onPlay={handleVideoPlay}
          className="absolute inset-0 w-full h-full transform scale-x-[-1] object-cover"
        />

        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none transform scale-x-[-1]" />

        {/* Framing Overlay for premium look */}
        <div className={`absolute inset-0 pointer-events-none transition-all duration-700 ${status === 'matched' ? 'border-[3px] border-green-500/80 shadow-[inset_0_0_40px_rgba(34,197,94,0.3)]' : status === 'unknown' ? 'border-[3px] border-red-500/80' : 'border border-white/20'}`}>
           <div className="w-full h-full relative">
              <span className="absolute top-6 left-6 border-t-4 border-l-4 w-12 h-12 border-white/60 rounded-tl-xl transition-all group-hover:border-primary"></span>
              <span className="absolute top-6 right-6 border-t-4 border-r-4 w-12 h-12 border-white/60 rounded-tr-xl transition-all group-hover:border-primary"></span>
              <span className="absolute bottom-6 left-6 border-b-4 border-l-4 w-12 h-12 border-white/60 rounded-bl-xl transition-all group-hover:border-primary"></span>
              <span className="absolute bottom-6 right-6 border-b-4 border-r-4 w-12 h-12 border-white/60 rounded-br-xl transition-all group-hover:border-primary"></span>
           </div>
        </div>

        {/* Scanning Line Animation */}
        {status === 'scanning' && isCameraReady && (
           <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/70 shadow-[0_0_15px_#D4AF37] animate-scan pointer-events-none" />
        )}
      </div>

      {/* Match Status indicator */}
      <div className={`mt-4 sm:mt-6 px-4 sm:px-8 py-3 sm:py-4 rounded-2xl flex items-center space-x-3 sm:space-x-4 transition-all duration-500 transform ${status === 'matched' ? 'bg-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)] border border-green-500/50 translate-y-0 opacity-100' : status === 'unknown' ? 'bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)] border border-red-500/50 translate-y-0 opacity-100' : 'bg-white/5 border border-white/10 opacity-60 translate-y-2 sm:translate-y-4'} ${status === 'scanning' && 'animate-pulse'}`}>
         {status === 'matched' ? (
             <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
         ) : (
             <Focus className={`w-5 h-5 sm:w-6 sm:h-6 ${status === 'scanning' ? 'text-primary' : status === 'unknown' ? 'text-red-400' : 'text-white/40'}`} />
         )}
         <span className={`text-sm sm:text-lg font-medium tracking-wide ${status === 'matched' ? 'text-green-400' : status === 'unknown' ? 'text-red-400' : 'text-white/80'}`}>
            {status === 'matched' ? `Xin chào, ${matchedName}` : status === 'scanning' ? 'Đang Nhận Diện...' : status === 'unknown' ? 'Không khớp dữ liệu' : 'Đợi...'}
         </span>
      </div>

    </div>
  );
}
