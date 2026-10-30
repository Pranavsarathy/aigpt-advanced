// server/services/visionOcrService.js
const sharp = require('sharp');

/**
 * Image processing service for OCR preprocessing and metadata inspection
 */
async function inspectAndPreprocessImage(buffer) {
  try {
    const metadata = await sharp(buffer).metadata();
    
    // Normalize and sharpen image for vision processing
    const processedBuffer = await sharp(buffer)
      .resize({ width: Math.min(metadata.width || 1024, 1920), withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer();

    return {
      success: true,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      base64: processedBuffer.toString('base64'),
      mimeType: 'image/jpeg'
    };
  } catch (error) {
    console.error("Image inspection error:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { inspectAndPreprocessImage };
