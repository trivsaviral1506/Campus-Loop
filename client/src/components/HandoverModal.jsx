import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { X, QrCode, KeyRound, Camera, AlertCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export default function HandoverModal({ request, onSuccess, onClose }) {
  const [activeTab, setActiveTab] = useState('pin'); // 'pin' or 'camera'
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef(null);

  const handleVerify = useCallback(async ({ token, pinCode }) => {
    setError('');
    setLoading(true);

    try {
      const payload = {};
      if (token) payload.token = token;
      if (pinCode) payload.pin = pinCode;

      const res = await axios.post(`/requests/${request._id}/verify-handover`, payload);
      onSuccess(res.data.request);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  }, [request._id, onSuccess]);

  // Initialize camera scanner when tab changes to 'camera'
  useEffect(() => {
    let html5QrCode = null;

    if (activeTab === 'camera') {
      const qrRegionId = 'qr-reader-region';
      html5QrCode = new Html5Qrcode(qrRegionId);
      scannerRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          handleVerify({ token: decodedText });
          if (html5QrCode.isScanning) {
            html5QrCode.stop().catch(() => {});
          }
        },
        () => {}
      ).then(() => {
        setCameraError('');
      }).catch((err) => {
        console.warn('Camera start error:', err);
        setCameraError('Camera access not granted or unavailable. Please use the 6-digit PIN verification fallback.');
      });
    }

    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(() => {});
        }
        scannerRef.current = null;
      }
    };
  }, [activeTab, handleVerify]);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (!pin || pin.length < 4) {
      setError('Please enter a valid 6-digit PIN');
      return;
    }
    handleVerify({ pinCode: pin });
  };

  return (
    <div className="modal-overlay">
      <div className="card glass-panel w-full max-w-md p-6 relative shadow-2xl animate-fade-in">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--text-muted)] transition"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-[var(--primary)] mx-auto flex items-center justify-center mb-3">
            <QrCode size={26} />
          </div>
          <h3 className="text-xl font-bold mb-1">Verify Item Handover</h3>
          <p className="text-xs text-[var(--text-muted)] m-0">
            Handing over <strong>{request.item?.name}</strong> to <strong>{request.borrower?.name}</strong>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-[var(--bg-dark)] p-1 mb-5 border border-[var(--border)]">
          <button 
            onClick={() => setActiveTab('pin')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'pin' 
                ? 'bg-[var(--bg-card)] text-[var(--primary)] shadow-sm' 
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <KeyRound size={14} /> Enter 6-Digit PIN
          </button>
          <button 
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'camera' 
                ? 'bg-[var(--bg-card)] text-[var(--primary)] shadow-sm' 
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Camera size={14} /> Scan QR Code
          </button>
        </div>

        {activeTab === 'pin' && (
          <form onSubmit={handlePinSubmit} className="flex flex-col items-center">
            <p className="text-xs text-[var(--text-muted)] text-center mb-4">
              Ask the borrower for the 6-digit confirmation PIN displayed on their dashboard:
            </p>
            <input 
              type="text" 
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              className="text-center font-mono tracking-widest text-2xl py-3 px-4 rounded-xl border border-[var(--border)] max-w-[220px] mb-4 focus:ring-2 focus:ring-[var(--primary)]"
              autoFocus
            />
            <button 
              type="submit" 
              disabled={loading || pin.length < 4}
              className="btn btn-primary w-full py-3 rounded-xl font-bold text-sm"
            >
              {loading ? 'Verifying...' : 'Confirm Handover'}
            </button>
          </form>
        )}

        {activeTab === 'camera' && (
          <div className="flex flex-col items-center">
            {cameraError ? (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs text-center mb-4">
                {cameraError}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)] text-center mb-3">
                Point camera at borrower's QR code:
              </p>
            )}
            
            <div 
              id="qr-reader-region" 
              className="w-full max-w-[260px] aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-[var(--primary)] mb-4 bg-black/5 flex items-center justify-center"
            ></div>

            <button 
              onClick={() => setActiveTab('pin')}
              className="text-xs text-[var(--primary)] hover:underline font-semibold"
            >
              Switch to 6-digit PIN input instead
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

