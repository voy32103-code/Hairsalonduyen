"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Loader2, Camera, CheckCircle } from 'lucide-react';

interface FaceCaptureProps {
  onCapture: (descriptor: number[]) => void;
  onCancel?: () => void;
}

export default function FaceCapture({ onCapture, onCancel }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        if (active) setIsModelsLoaded(true);
      } catch (err) {
        if (active) setError('Lỗi khi tải mô hình AI.');
        console.error("Model load error:", err);
      }
    };

    loadModels();

    return () => { active = false; };
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // IMPORTANT: Enforce muted and play explicitly to bypass browser autoplay restrictions
          videoRef.current.muted = true;
          videoRef.current.play().then(() => {
             setIsCameraReady(true);
          }).catch(e => {
             console.error("Auto-play was prevented:", e);
             setIsCameraReady(true); // Still ready, user might need to click
          });
        }
      } catch (err) {
        setError('Không thể truy cập Camera. Vui lòng cấp quyền.');
        console.error("Camera error:", err);
      }
    };

    if (isModelsLoaded) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isModelsLoaded]);

  const handleCapture = async () => {
    if (!videoRef.current || !isCameraReady || !isModelsLoaded) return;
    setIsCapturing(true);
    setError(null);

    try {
      // Detect single face
      const detection = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks().withFaceDescriptor();

      if (!detection) {
        setError('Không tìm thấy khuôn mặt nào. Vui lòng nhìn thẳng vào khung hình.');
        setIsCapturing(false);
        return;
      }

      const descriptorArray = Array.from(detection.descriptor);
      onCapture(descriptorArray);
    } catch (err) {
      setError('Lỗi khi lấy dữ liệu khuôn mặt.');
      console.error(err);
    } finally {
      setIsCapturing(false);
    }
  };

  if (error && !isCameraReady) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-red-50 text-red-600 rounded-xl border border-red-200">
        <p className="mb-4 text-center">{error}</p>
        {onCancel && <button type="button" className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50" onClick={onCancel}>Hủy</button>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto p-4 bg-white/50 backdrop-blur-md rounded-2xl shadow-xl border border-white/40">
      <div className="relative w-full aspect-square bg-gray-900 rounded-xl overflow-hidden mb-4 shadow-inner ring-4 ring-black/5">
        {!isCameraReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 bg-black/40">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
            <span className="text-sm font-medium tracking-wide">
              {!isModelsLoaded ? 'Đang tải AI...' : 'Đang mở Camera...'}
            </span>
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-500 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`}
          onPlay={() => setIsCameraReady(true)}
        />
        {/* Overlay frame for guidance */}
        <div className="absolute inset-x-8 inset-y-8 border-2 border-white/40 border-dashed rounded-[40px] pointer-events-none" />
      </div>

      {error && <p className="text-red-500 text-sm mb-3 font-medium">{error}</p>}

      <div className="w-full flex gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 py-2 text-sm font-medium rounded-xl shadow-sm hover:bg-gray-50 bg-white border border-gray-200" disabled={isCapturing}>
            Hủy
          </button>
        )}
        <button 
          type="button"
          onClick={handleCapture}
          disabled={!isCameraReady || isCapturing}
          className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-lg rounded-xl overflow-hidden relative py-2 text-sm font-medium flex items-center justify-center disabled:opacity-50"
        >
          {isCapturing ? (
            <>
               <Loader2 className="w-4 h-4 mr-2 animate-spin" />
               Đang quét...
            </>
          ) : (
             <>
               <Camera className="w-4 h-4 mr-2" />
               Chụp Khuôn Mặt
             </>
          )}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-4 font-medium text-center">
        Vui lòng đặt khuôn mặt vào giữa khung viền để hệ thống ghi nhận.
      </p>
    </div>
  );
}
