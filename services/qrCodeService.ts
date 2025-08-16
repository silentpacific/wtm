// src/services/qrCodeService.ts
import QRCode from 'qrcode';

export interface QRCodeOptions {
  size?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export interface RestaurantQRData {
  restaurantSlug: string;
  restaurantName: string;
  qrCodeDataURL: string;
  qrCodeSVG: string;
  restaurantURL: string;
}

export class QRCodeService {
  private static getRestaurantURL(slug: string): string {
    const baseURL = window.location.origin;
    return `${baseURL}/restaurants/${slug}`;
  }

  /**
   * Generate QR code as Data URL (PNG format) for display
   */
  static async generateQRDataURL(
    restaurantSlug: string, 
    options: QRCodeOptions = {}
  ): Promise<string> {
    const url = this.getRestaurantURL(restaurantSlug);
    
    const qrOptions = {
      width: options.size || 300,
      margin: options.margin || 2,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF'
      },
      errorCorrectionLevel: 'M' as const
    };

    try {
      return await QRCode.toDataURL(url, qrOptions);
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate QR code as SVG string for printing
   */
  static async generateQRSVG(
    restaurantSlug: string,
    options: QRCodeOptions = {}
  ): Promise<string> {
    const url = this.getRestaurantURL(restaurantSlug);
    
    const qrOptions = {
      width: options.size || 300,
      margin: options.margin || 2,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF'
      },
      errorCorrectionLevel: 'M' as const
    };

    try {
      return await QRCode.toString(url, { type: 'svg', ...qrOptions });
    } catch (error) {
      console.error('Error generating QR SVG:', error);
      throw new Error('Failed to generate QR SVG');
    }
  }

  /**
   * Generate complete restaurant QR data package
   */
  static async generateRestaurantQRPackage(
    restaurantSlug: string,
    restaurantName: string,
    options: QRCodeOptions = {}
  ): Promise<RestaurantQRData> {
    try {
      const [qrCodeDataURL, qrCodeSVG] = await Promise.all([
        this.generateQRDataURL(restaurantSlug, options),
        this.generateQRSVG(restaurantSlug, options)
      ]);

      return {
        restaurantSlug,
        restaurantName,
        qrCodeDataURL,
        qrCodeSVG,
        restaurantURL: this.getRestaurantURL(restaurantSlug)
      };
    } catch (error) {
      console.error('Error generating QR package:', error);
      throw new Error('Failed to generate QR code package');
    }
  }

  /**
   * Download QR code as image file
   */
  static downloadQRCode(
    dataURL: string, 
    filename: string = 'restaurant-qr-code.png'
  ): void {
    try {
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      throw new Error('Failed to download QR code');
    }
  }

  /**
   * Download SVG as file
   */
  static downloadQRSVG(
    svgString: string, 
    filename: string = 'restaurant-qr-code.svg'
  ): void {
    try {
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR SVG:', error);
      throw new Error('Failed to download QR SVG');
    }
  }

  /**
   * Generate multiple QR code sizes for different use cases
   */
  static async generateMultipleSizes(
    restaurantSlug: string
  ): Promise<{
    small: string;    // 150px - for business cards
    medium: string;   // 300px - for table tents
    large: string;    // 600px - for posters
    print: string;    // SVG for high-quality printing
  }> {
    try {
      const [small, medium, large, print] = await Promise.all([
        this.generateQRDataURL(restaurantSlug, { size: 150 }),
        this.generateQRDataURL(restaurantSlug, { size: 300 }),
        this.generateQRDataURL(restaurantSlug, { size: 600 }),
        this.generateQRSVG(restaurantSlug, { size: 300 })
      ]);

      return { small, medium, large, print };
    } catch (error) {
      console.error('Error generating multiple QR sizes:', error);
      throw new Error('Failed to generate QR code sizes');
    }
  }

  /**
   * Generate branded QR code with restaurant colors
   */
  static async generateBrandedQR(
    restaurantSlug: string,
    brandColors: { primary: string; background: string },
    size: number = 300
  ): Promise<string> {
    const options: QRCodeOptions = {
      size,
      margin: 2,
      color: {
        dark: brandColors.primary,
        light: brandColors.background
      }
    };

    return this.generateQRDataURL(restaurantSlug, options);
  }

  /**
   * Validate restaurant slug for QR generation
   */
  static validateRestaurantSlug(slug: string): boolean {
    // Check for valid slug format (letters, numbers, hyphens only)
    const slugRegex = /^[a-z0-9-]+$/;
    return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50;
  }

  /**
   * Generate table tent template with QR code
   */
  static generateTableTentHTML(
    restaurantName: string,
    qrCodeDataURL: string,
    instructions: string = "Scan to view our accessible menu"
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${restaurantName} - Accessible Menu</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            text-align: center;
            background: white;
          }
          .tent-container {
            width: 400px;
            height: 300px;
            margin: 0 auto;
            border: 2px solid #333;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 20px;
            box-sizing: border-box;
          }
          .restaurant-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #333;
          }
          .qr-code {
            margin: 15px 0;
          }
          .instructions {
            font-size: 16px;
            color: #666;
            margin-top: 10px;
            line-height: 1.4;
          }
          .accessibility-note {
            font-size: 12px;
            color: #888;
            margin-top: 10px;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="tent-container">
          <div class="restaurant-name">${restaurantName}</div>
          <div class="qr-code">
            <img src="${qrCodeDataURL}" alt="QR Code for ${restaurantName}" width="120" height="120">
          </div>
          <div class="instructions">${instructions}</div>
          <div class="accessibility-note">Designed for deaf and hard-of-hearing customers</div>
        </div>
      </body>
      </html>
    `;
  }
}