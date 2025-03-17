import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { generateQRCode } from '@/utils/qrCodeUtils';

interface QrCodeGeneratorProps {
  className?: string;
}

const QrCodeGenerator: React.FC<QrCodeGeneratorProps> = ({ className }) => {
  const [imei, setImei] = useState('123456789012345');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Generate QR code when IMEI changes
  useEffect(() => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Clear canvas
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw QR code pattern
      const size = canvas.width;
      const cellSize = Math.floor(size / 25); // QR code is 25x25 cells
      
      // Draw position detection patterns (the three large squares in corners)
      const drawPositionPattern = (x: number, y: number) => {
        // Outer square
        ctx.fillStyle = 'black';
        ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
        
        // Inner white square
        ctx.fillStyle = 'white';
        ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
        
        // Inner black square
        ctx.fillStyle = 'black';
        ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
      };
      
      // Draw the three position detection patterns
      drawPositionPattern(0, 0); // Top-left
      drawPositionPattern(0, 18); // Bottom-left
      drawPositionPattern(18, 0); // Top-right
      
      // Draw timing patterns (the dotted lines between position detection patterns)
      for (let i = 0; i < 25; i++) {
        if (i % 2 === 0) {
          ctx.fillStyle = 'black';
        } else {
          ctx.fillStyle = 'white';
        }
        
        // Skip if we're in the position detection patterns
        if (i < 7 || i > 17) continue;
        
        // Horizontal timing pattern
        ctx.fillRect(i * cellSize, 6 * cellSize, cellSize, cellSize);
        
        // Vertical timing pattern
        ctx.fillRect(6 * cellSize, i * cellSize, cellSize, cellSize);
      }
      
      // Draw data cells (using a simple hash of the IMEI to make it look random but consistent)
      const imeiText = `IMEI:${imei}`;
      for (let y = 0; y < 25; y++) {
        for (let x = 0; x < 25; x++) {
          // Skip position detection patterns and timing patterns
          if ((x < 7 && y < 7) || (x < 7 && y > 17) || (x > 17 && y < 7)) continue;
          if (x === 6 || y === 6) continue;
          
          // Use a simple hash of the position and IMEI to determine if cell is black or white
          const hash = (x * 31 + y * 17 + imeiText.charCodeAt(x % imeiText.length)) % 100;
          if (hash < 50) {
            ctx.fillStyle = 'black';
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          }
        }
      }
      
      // Draw IMEI text below the QR code
      ctx.fillStyle = 'black';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`IMEI: ${imei}`, size / 2, size + 20);
      
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }, [imei, canvasRef]);
  
  const handleImeiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numeric input
    const value = e.target.value.replace(/\D/g, '');
    setImei(value);
  };
  
  const handleRandomImei = () => {
    // Generate a random 15-digit IMEI
    const randomImei = Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join('');
    setImei(randomImei);
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Test QR Code Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imei">IMEI (15 digits)</Label>
            <div className="flex space-x-2">
              <Input
                id="imei"
                value={imei}
                onChange={handleImeiChange}
                maxLength={15}
                placeholder="Enter IMEI"
              />
              <Button onClick={handleRandomImei} variant="outline">
                Random
              </Button>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="border border-border p-4 rounded-lg">
              <div className="text-center mb-2">
                <p className="font-medium">Scan this QR code:</p>
              </div>
              <canvas
                ref={canvasRef}
                width={200}
                height={220}
                className="bg-white"
              />
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>Note: This is a test component for development purposes only.</p>
            <p>In a real environment, scan actual QR codes on your sensors.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QrCodeGenerator;