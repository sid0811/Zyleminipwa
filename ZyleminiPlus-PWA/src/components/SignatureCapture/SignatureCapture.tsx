import { useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Clear, Check } from '@mui/icons-material';

interface SignatureCaptureProps {
  onSave: (dataURL: string) => void;
  onClear?: () => void;
  width?: number;
  height?: number;
}

export interface SignatureCaptureRef {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: () => string;
}

const SignatureCapture = forwardRef<SignatureCaptureRef, SignatureCaptureProps>(
  ({ onSave, onClear, width = 500, height = 200 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);

    useImperativeHandle(ref, () => ({
      clear: handleClear,
      isEmpty: () => isEmpty,
      toDataURL: () => canvasRef.current?.toDataURL() || '',
    }));

    const handleClear = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
        onClear?.();
      }
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      setIsDrawing(true);
      setIsEmpty(false);

      const rect = canvas.getBoundingClientRect();
      const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
      const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000000';
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
      const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

      ctx.lineTo(x, y);
      ctx.stroke();

      e.preventDefault();
    };

    const stopDrawing = () => {
      setIsDrawing(false);
    };

    const handleSave = () => {
      const canvas = canvasRef.current;
      if (!canvas || isEmpty) return;

      const dataURL = canvas.toDataURL('image/png');
      onSave(dataURL);
    };

    return (
      <Box>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            border: '2px solid #E0E0E0',
            borderRadius: 8,
            cursor: 'crosshair',
            touchAction: 'none',
            backgroundColor: '#ffffff',
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button
            onClick={handleClear}
            startIcon={<Clear />}
            variant="outlined"
            color="error"
          >
            Clear
          </Button>
          <Button
            onClick={handleSave}
            startIcon={<Check />}
            variant="contained"
            color="primary"
            disabled={isEmpty}
          >
            Save Signature
          </Button>
        </Box>
      </Box>
    );
  }
);

SignatureCapture.displayName = 'SignatureCapture';

export default SignatureCapture;

