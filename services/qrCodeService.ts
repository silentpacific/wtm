// QR Code Service for Restaurant Pages
export interface QRCodeOptions {
  size: number;
  format: 'png' | 'svg' | 'pdf';
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export interface QRCodeResult {
  url: string;
  dataUrl?: string;
  filename: string;
}

class QRCodeService {
  // Generate QR code using QR Server API (free service)
  async generateQRCode(url: string, options: QRCodeOptions): Promise<QRCodeResult> {
    const { size, format, errorCorrectionLevel = 'M' } = options;
    
    try {
      // Using qr-server.com API (free, reliable service)
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/`;
      const params = new URLSearchParams({
        size: `${size}x${size}`,
        data: url,
        format: format === 'pdf' ? 'png' : format, // API doesn't support PDF directly
        ecc: errorCorrectionLevel,
        margin: '10',
        qzone: '1'
      });

      const qrUrl = `${qrApiUrl}?${params.toString()}`;
      
      if (format === 'svg') {
        // For SVG, we'll use a different approach
        return this.generateSVGQRCode(url, size);
      }

      // For PNG format
      const filename = `qr-code-${size}x${size}.${format}`;
      
      if (format === 'pdf') {
        // Generate PDF with QR code
        return this.generatePDFQRCode(qrUrl, size, url);
      }

      return {
        url: qrUrl,
        filename
      };
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Generate SVG QR Code (simplified version)
  private async generateSVGQRCode(url: string, size: number): Promise<QRCodeResult> {
    // Using QR Server API but converting to SVG-like format
    const svgContent = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        <image href="https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&format=png" width="100%" height="100%"/>
      </svg>
    `;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const dataUrl = URL.createObjectURL(blob);
    
    return {
      url: dataUrl,
      dataUrl,
      filename: `qr-code-${size}x${size}.svg`
    };
  }

  // Generate PDF with QR code
  private async generatePDFQRCode(qrImageUrl: string, size: number, originalUrl: string): Promise<QRCodeResult> {
    // Create a simple PDF-like structure (this is a simplified approach)
    // In a real implementation, you'd use a proper PDF library
    
    try {
      // Fetch the QR code image
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      
      // Create a canvas to generate PDF content
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 600;
      canvas.height = 800;
      
      if (ctx) {
        // White background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add title
        ctx.fillStyle = 'black';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Restaurant QR Code', canvas.width / 2, 50);
        
        // Add URL
        ctx.font = '14px Arial';
        ctx.fillText(originalUrl, canvas.width / 2, 80);
        
        // Load and draw QR code
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        return new Promise((resolve, reject) => {
          img.onload = () => {
            const qrSize = Math.min(400, size * 2);
            const x = (canvas.width - qrSize) / 2;
            const y = 120;
            
            ctx.drawImage(img, x, y, qrSize, qrSize);
            
            // Add instructions
            ctx.font = '16px Arial';
            ctx.fillText('Scan this QR code to access our accessible menu', canvas.width / 2, y + qrSize + 40);
            
            // Convert to blob
            canvas.toBlob((pdfBlob) => {
              if (pdfBlob) {
                const dataUrl = URL.createObjectURL(pdfBlob);
                resolve({
                  url: dataUrl,
                  dataUrl,
                  filename: `qr-code-${size}x${size}.png` // Note: This is actually PNG, not PDF
                });
              } else {
                reject(new Error('Failed to create PDF'));
              }
            }, 'image/png');
          };
          
          img.onerror = () => reject(new Error('Failed to load QR code image'));
          img.src = qrImageUrl;
        });
      }
      
      throw new Error('Failed to create canvas context');
    } catch (error) {
      console.error('Error generating PDF QR code:', error);
      throw error;
    }
  }

  // Download QR code
  async downloadQRCode(url: string, options: QRCodeOptions): Promise<void> {
    try {
      const result = await this.generateQRCode(url, options);
      
      // Create download link
      const link = document.createElement('a');
      link.href = result.dataUrl || result.url;
      link.download = result.filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup object URL if we created one
      if (result.dataUrl && result.dataUrl.startsWith('blob:')) {
        setTimeout(() => URL.revokeObjectURL(result.dataUrl!), 1000);
      }
    } catch (error) {
      console.error('Error downloading QR code:', error);
      throw error;
    }
  }

  // Get QR code for preview
  async getQRCodePreview(url: string, size: number = 200): Promise<string> {
    try {
      const result = await this.generateQRCode(url, { size, format: 'png' });
      return result.url;
    } catch (error) {
      console.error('Error getting QR code preview:', error);
      return '';
    }
  }

  // Validate URL before generating QR code
  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

export const qrCodeService = new QRCodeService();