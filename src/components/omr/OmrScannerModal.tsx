import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  X,
  Upload,
  RotateCcw,
  AlertCircle,
  Sparkles,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { TestSession } from '../../types';
import { OmrScanResult } from '../../types/omr';
import { processOmrImage } from '../../utils/omrEngine';

interface OmrScannerModalProps {
  isOpen: boolean;
  session: TestSession;
  onClose: () => void;
  onScanSuccess: (result: OmrScanResult) => void;
}

export const OmrScannerModal: React.FC<OmrScannerModalProps> = ({
  isOpen,
  session,
  onClose,
  onScanSuccess,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Kamera oqimini ishga tushirish
  const startCamera = async () => {
    setCameraError(null);
    setErrorMessage(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'Brauzeringiz kamerani to‘g‘ridan-to‘g‘ri qo‘llab-quvvatlamaydi yoki HTTPS ulanish talab etiladi. Quyidagi "Rasm yuklash" tugmasidan foydalanishingiz mumkin.'
      );
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // Orqa kamera
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: unknown) {
      console.warn('Kamera xatosi:', err);
      setCameraError(
        'Kameraga ruxsat berilmadi yoki jonli kamera ochilmadi. Quyidagi "Suratga olish yoki galereyadan tanlash" tugmasi orqali davom etishingiz mumkin.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Jonli videodan suratga olish
  const handleCaptureFrame = async () => {
    if (!videoRef.current) return;
    setIsProcessing(true);
    setErrorMessage(null);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1200;
    canvas.height = video.videoHeight || 1697;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const result = await processOmrImage(canvas, session.questions, session.id);
      if (result.success) {
        stopCamera();
        onScanSuccess(result);
      } else {
        setErrorMessage(
          result.errorMessage || 'Titulni aniqlab bo‘lmadi. To‘rtta burchak belgilari to‘liq kadrda ekanini tekshiring.'
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Noma’lum xatolik';
      setErrorMessage(`Tahlil qilishda xatolik: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Galereyadan yoki fayldan yuklash
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const result = await processOmrImage(img, session.questions, session.id);
          if (result.success) {
            stopCamera();
            onScanSuccess(result);
          } else {
            setErrorMessage(
              result.errorMessage || 'Titulni aniqlab bo‘lmadi. To‘rtta burchak to‘liq ko‘ringaniga ishonch hosil qiling.'
            );
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Noma’lum xatolik';
          setErrorMessage(`Tahlil qilishda xatolik: ${msg}`);
        } finally {
          setIsProcessing(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[95vh] text-white">
        {/* Header */}
        <div className="bg-slate-900/90 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/30 text-indigo-400 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Javoblar varaqasini skanerlash</h3>
              <p className="text-xs text-slate-400">
                {session.title} • {session.questionCount} ta savol
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4">
          {/* Xatolik bildirishnomasi */}
          {errorMessage && (
            <div className="bg-rose-950/60 border border-rose-800 text-rose-200 rounded-xl p-3 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Tahlil xatosi:</span>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Jonli Video maydoni yoki Kamera xatosi holati */}
          {!cameraError ? (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] max-h-[55vh] flex items-center justify-center border border-slate-800">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Titul ramka ko'rsatgichi (Overlay guide) */}
              <div className="absolute inset-4 sm:inset-8 border-2 border-dashed border-indigo-400/70 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-t-4 border-l-4 border-indigo-400" />
                  <div className="w-6 h-6 border-t-4 border-r-4 border-indigo-400" />
                </div>
                <div className="text-center text-[11px] font-semibold bg-slate-900/80 px-3 py-1 rounded-full text-indigo-200 self-center backdrop-blur-xs">
                  Varaqning 4 ta burchagi ramka ichiga tushsin
                </div>
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-b-4 border-l-4 border-indigo-400" />
                  <div className="w-6 h-6 border-b-4 border-r-4 border-indigo-400" />
                </div>
              </div>

              {/* Tahlil yuklanish spinnery */}
              {isProcessing && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-bold text-indigo-300">
                    OMR tahlil qilinmoqda...
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 text-center space-y-3">
              <Camera className="w-10 h-10 text-slate-500 mx-auto" />
              <h4 className="font-bold text-sm text-slate-200">
                Jonli kamera ochilmadi
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {cameraError}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Suratga olish yoki galereyadan tanlash</span>
                </button>
              </div>
            </div>
          )}

          {/* Yashirin fayl kiritish inputi */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Ko'rsatma */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block">Skanerlash bo‘yicha maslahatlar:</span>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              <li>Titulni tekis yuzaga qo‘ying va varaq ustiga soya tushishidan saqlaning.</li>
              <li>Varaqning 4 ta burchak qora kvadrati to‘liq kadrda bo‘lishi shart.</li>
              <li>Mobil qurilmada kamera to‘g‘ridan-to‘g‘ri ochilishi uchun veb-sahifa <strong>HTTPS</strong> yoki <strong>localhost</strong> orqali ochilgan bo‘lishi kerak.</li>
            </ul>
          </div>
        </div>

        {/* Footer amallari */}
        <div className="bg-slate-900/90 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Fayldan yuklash</span>
          </button>

          {!cameraError && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleCaptureFrame}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              <span>Suratga olish va tahlil qilish</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
