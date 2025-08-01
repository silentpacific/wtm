// ai-load-test.js - Test AI processing under load

const { GoogleGenerativeAI } = require('@google/generative-ai');

// 1. Rate limiting implementation for Gemini API
class AIQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxConcurrent = 5; // Gemini API limit
    this.currentConcurrent = 0;
    this.rateLimitDelay = 1000; // 1 second between requests
  }

  async addToQueue(imageData, retries = 3) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        imageData,
        retries,
        resolve,
        reject,
        timestamp: Date.now()
      });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    if (this.currentConcurrent >= this.maxConcurrent) return;

    this.processing = true;
    const item = this.queue.shift();
    this.currentConcurrent++;

    try {
      const result = await this.processImage(item.imageData);
      item.resolve(result);
    } catch (error) {
      if (item.retries > 0 && this.isRetryableError(error)) {
        // Add back to queue with reduced retries
        this.queue.unshift({
          ...item,
          retries: item.retries - 1
        });
      } else {
        item.reject(error);
      }
    } finally {
      this.currentConcurrent--;
      this.processing = false;
      
      // Rate limiting delay
      setTimeout(() => {
        this.processQueue();
      }, this.rateLimitDelay);
    }
  }

  async processImage(imageData) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const response = await model.generateContent([
      { text: "Analyze this menu..." },
      { inlineData: { mimeType: "image/jpeg", data: imageData } }
    ]);
    
    return response.response.text();
  }

  isRetryableError(error) {
    return error.status === 429 || // Rate limit
           error.status === 503 || // Service unavailable
           error.status >= 500;    // Server errors
  }
}

// 2. Load testing script
async function loadTestAI() {
  const queue = new AIQueue();
  const testImage = "base64encodedimage..."; // Use a real test image
  
  console.log("Starting AI load test with 100 concurrent requests...");
  
  const promises = [];
  for (let i = 0; i < 100; i++) {
    promises.push(
      queue.addToQueue(testImage)
        .then(result => ({ success: true, index: i }))
        .catch(error => ({ success: false, index: i, error: error.message }))
    );
  }
  
  const results = await Promise.all(promises);
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`Results: ${successful} successful, ${failed} failed`);
  console.log(`Success rate: ${(successful/100*100).toFixed(2)}%`);
}

// 3. Fallback mechanism for when Gemini is unavailable
class AIFallbackService {
  async analyzeMenu(imageData) {
    try {
      // Primary: Gemini API
      return await this.useGemini(imageData);
    } catch (error) {
      console.error("Gemini failed:", error);
      
      try {
        // Fallback 1: Return cached similar menu
        const cached = await this.findSimilarCachedMenu(imageData);
        if (cached) return cached;
        
        // Fallback 2: Basic OCR + simple parsing
        return await this.basicOCRFallback(imageData);
      } catch (fallbackError) {
        // Fallback 3: Return helpful error message
        return {
          error: true,
          message: "Menu analysis temporarily unavailable. Please try again in a few minutes.",
          dishes: []
        };
      }
    }
  }

  async basicOCRFallback(imageData) {
    // Use a simple OCR service as backup
    // This is a placeholder - you'd implement actual OCR
    return {
      restaurant_name: "Restaurant (detected via OCR)",
      dishes: [
        {
          name: "Menu items detected but detailed analysis unavailable",
          section: "Please try again later for full AI analysis"
        }
      ],
      fallback_used: true
    };
  }
}

module.exports = { AIQueue, AIFallbackService, loadTestAI };