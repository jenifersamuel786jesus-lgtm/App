import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Camera } from 'lucide-react';

interface QRCodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export default function QRCodeScanner({ onScan, onClose }: QRCodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrCodeRegionId = 'qr-code-scanner-region';

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      setError('');
      setScanning(true);

      const html5QrCode = new Html5Qrcode(qrCodeRegionId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Successfully scanned
          console.log('QR Code scanned:', decodedText);
          onScan(decodedText);
          stopScanner();
        },
        (errorMessage) => {
          // Scanning error (ignore, happens frequently)
          // console.log('Scan error:', errorMessage);
        }
      );
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('Failed to start camera. Please check permissions.');
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setScanning(false);
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Scan QR Code</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div 
              id={qrCodeRegionId} 
              className="w-full rounded-lg overflow-hidden bg-black"
              style={{ minHeight: '300px' }}
            />

            <div className="text-center text-sm text-muted-foreground">
              {scanning ? (
                <p>Position the QR code within the frame</p>
              ) : (
                <p>Starting camera...</p>
              )}
            </div>

            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleClose}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
