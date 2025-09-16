
import React, { useRef, useState, useCallback } from 'react';
import { AppStatus } from '../types';
import { IconCamera, IconFileUpload, IconX } from './Icons';

interface ImageInputProps {
  onImageReady: (base64Image: string, mimeType: string) => void;
  setStatus: (status: AppStatus) => void;
}

const CameraView: React.FC<{ onCapture: (dataUrl: string) => void; onCancel: () => void; }> = ({ onCapture, onCancel }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setStream(mediaStream);
        } catch (err) {
            console.error("Error accessing camera: ", err);
            alert("Could not access the camera. Please ensure you have given permission.");
            onCancel();
        }
    }, [onCancel]);
    
    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    const handleCapture = useCallback(() => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            if(context) {
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                onCapture(canvas.toDataURL('image/jpeg'));
                stopCamera();
            }
        }
    }, [onCapture, stopCamera]);

    React.useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, [startCamera, stopCamera]);

    return (
        <div className="w-full flex flex-col items-center gap-4">
            <div className="relative w-full max-w-lg aspect-video bg-slate-900 rounded-lg overflow-hidden shadow-md">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                 <button onClick={() => { stopCamera(); onCancel(); }} className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-colors" aria-label="Close camera"><IconX className="w-5 h-5" /></button>
            </div>
            <button onClick={handleCapture} className="bg-sky-500 text-white font-bold py-3 px-6 rounded-lg text-lg flex items-center gap-2 hover:bg-sky-600 transition-transform active:scale-95">
                <IconCamera className="w-6 h-6" />
                Capture Document
            </button>
        </div>
    );
};

const ImageInput: React.FC<ImageInputProps> = ({ onImageReady, setStatus }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        if (base64) {
          onImageReady(base64, file.type);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCaptureComplete = (dataUrl: string) => {
    const base64 = dataUrl.split(',')[1];
    if (base64) {
      onImageReady(base64, 'image/jpeg');
    }
    setIsCapturing(false);
    setStatus(AppStatus.IDLE);
  };

  const handleUseCamera = () => {
      setIsCapturing(true);
      setStatus(AppStatus.CAPTURING);
  }
  
  const handleCancelCapture = () => {
      setIsCapturing(false);
      setStatus(AppStatus.IDLE);
  }

  if(isCapturing) {
      return <CameraView onCapture={handleCaptureComplete} onCancel={handleCancelCapture} />
  }

  return (
    <div className="w-full flex flex-col items-center text-center">
      <h2 className="text-xl sm:text-2xl font-semibold text-slate-700 mb-2">Get Started</h2>
      <p className="text-slate-500 mb-8 max-w-md">Upload a document or use your camera to scan a page. We'll extract the text and read it for you.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="group flex flex-col items-center justify-center p-6 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 hover:border-sky-500 hover:bg-sky-50 transition-all duration-200"
        >
          <IconFileUpload className="w-10 h-10 text-slate-400 group-hover:text-sky-500 mb-3 transition-colors" />
          <span className="font-semibold text-slate-700">Upload a File</span>
          <span className="text-sm text-slate-500">PNG, JPG, WEBP</span>
        </button>
        <button
          onClick={handleUseCamera}
          className="group flex flex-col items-center justify-center p-6 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 hover:border-sky-500 hover:bg-sky-50 transition-all duration-200"
        >
          <IconCamera className="w-10 h-10 text-slate-400 group-hover:text-sky-500 mb-3 transition-colors" />
          <span className="font-semibold text-slate-700">Use Camera</span>
          <span className="text-sm text-slate-500">Scan a document</span>
        </button>
      </div>
    </div>
  );
};

export default ImageInput;
