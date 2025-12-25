import {
  getImageDetailsyncData2,
  getImageDetailsyncData,
  getNewPartyImageDetailsyncData,
  getNewPartyImageDetailsyncData2,
  getOrderidforNewPartyImageSync,
  getOrderidforImageSync,
  getImageDetails,
  getNewPartyImages,
  deleteImagesDetails,
  deleteNewPartyImage,
  deleteImageDetailByKey,
  deleteNewPartyImageDetailByKey,
  getOrderMasterSyncDataForImage,
} from '../database/SqlDatabase';
import { dataSyncObjectKeys } from './utils';
import { writeErrorLog } from './utils';

interface ImageProcessingConfig {
  sizeLimitMB?: number;
  imagesBatchSize?: number;
  timeoutMs?: number;
}

interface ProcessedImageDetail {
  ID: string;
  OrderID: string;
  ImageDatetime: string;
  ImageName: string;
  ImageBytes: string;
}

interface ProcessedNewPartyImage {
  Id: string;
  ImageName: string;
  ShopId: string;
  Data: string;
}

interface ImageProcessingResult {
  shouldBatch: boolean;
  estimatedSizeMB: number;
  data: {
    [dataSyncObjectKeys.ImageDetails]?: ProcessedImageDetail[];
    [dataSyncObjectKeys.NewPartyImage]?: ProcessedNewPartyImage[];
  };
}

// Utility function to estimate file size without reading (removed - using improved version below)

// Calculate total estimated size before processing
const calculateEstimatedImageSizeMB = async (
  imageDetails: any[],
  newPartyImages: any[]
): Promise<number> => {
  console.log(`🔍 Estimating size for ${imageDetails.length} ImageDetails + ${newPartyImages.length} NewPartyImages`);
  
  const imageDetailPromises = imageDetails.map(item => 
    estimateImageSizeInMB(item.ImageBytes)
  );
  
  const newPartyImagePromises = newPartyImages.map(item => 
    estimateImageSizeInMB(item.ImagePath)
  );
  
  const allSizes = await Promise.all([...imageDetailPromises, ...newPartyImagePromises]);
  const totalSizeMB = allSizes.reduce((sum, size) => sum + size, 0);
  
  console.log(`📊 Estimated total image size: ${totalSizeMB.toFixed(2)} MB`);
  return totalSizeMB;
};

// SIMPLE: Determine if we need to split into phases for memory safety
const shouldSplitIntoPhases = (totalImages: number, estimatedSizeMB: number): boolean => {
  const MEMORY_SAFETY_LIMIT = 50; // If over 50MB, split into phases
  const IMAGE_COUNT_LIMIT = 40; // If over 40 images, split into phases
  
  return estimatedSizeMB > MEMORY_SAFETY_LIMIT || totalImages > IMAGE_COUNT_LIMIT;
};

// ✅ PROGRESSIVE BATCH CREATION: Estimate image size before Base64 conversion
const estimateImageSizeInMB = async (imagePath: string): Promise<number> => {
  try {
    // For web, if imagePath is already base64, calculate size directly
    if (imagePath && imagePath.startsWith('data:')) {
      // Base64 string format: data:image/jpeg;base64,<base64data>
      const base64Data = imagePath.split(',')[1] || imagePath;
      const base64Size = (base64Data.length * 3) / 4; // Convert base64 length to bytes
      const sizeInMB = base64Size / (1024 * 1024);
      return parseFloat(sizeInMB.toFixed(2));
    }
    
    // For localStorage keys or other string paths
    try {
      const storedData = localStorage.getItem(imagePath);
      if (storedData) {
        const base64Size = (storedData.length * 3) / 4;
        const sizeInMB = base64Size / (1024 * 1024);
        return parseFloat(sizeInMB.toFixed(2));
      }
    } catch (error) {
      console.warn(`⚠️ Could not estimate size for ${imagePath}:`, error);
    }
    
    // If we can't determine size, estimate as 0
    return 0;
  } catch (error) {
    console.warn(`⚠️ Could not estimate size for ${imagePath}:`, error);
    return 0;
  }
};

// ✅ DYNAMIC IMAGE FILTERING: Remove images that would exceed size threshold
const filterImagesBySize = async (
  imageDetails: any[],
  newPartyImages: any[],
  maxSizeMB: number
): Promise<{
  filteredImageDetails: any[];
  filteredNewPartyImages: any[];
  omittedImageDetails: any[];
  omittedNewPartyImages: any[];
  totalEstimatedSize: number;
}> => {
  console.log(`🔍 Filtering images to stay within ${maxSizeMB}MB threshold...`);
  
  const filteredImageDetails: any[] = [];
  const filteredNewPartyImages: any[] = [];
  const omittedImageDetails: any[] = [];
  const omittedNewPartyImages: any[] = [];
  let currentSize = 0;

  // Process ImageDetails
  for (const image of imageDetails) {
    const estimatedSize = await estimateImageSizeInMB(image.ImageBytes);
    if (currentSize + estimatedSize <= maxSizeMB) {
      filteredImageDetails.push(image);
      currentSize += estimatedSize;
      console.log(`✅ Added ImageDetails: ${image.ImageName} (~${estimatedSize}MB, total: ${currentSize.toFixed(2)}MB)`);
    } else {
      omittedImageDetails.push(image);
      console.log(`⏭️ Omitted ImageDetails: ${image.ImageName} (~${estimatedSize}MB, would exceed limit)`);
    }
  }

  // Process NewPartyImages
  for (const image of newPartyImages) {
    const estimatedSize = await estimateImageSizeInMB(image.ImagePath);
    if (currentSize + estimatedSize <= maxSizeMB) {
      filteredNewPartyImages.push(image);
      currentSize += estimatedSize;
      console.log(`✅ Added NewPartyImage: ${image.ImageName} (~${estimatedSize}MB, total: ${currentSize.toFixed(2)}MB)`);
    } else {
      omittedNewPartyImages.push(image);
      console.log(`⏭️ Omitted NewPartyImage: ${image.ImageName} (~${estimatedSize}MB, would exceed limit)`);
    }
  }

  console.log(`📊 Image filtering complete: ${filteredImageDetails.length + filteredNewPartyImages.length} kept, ${omittedImageDetails.length + omittedNewPartyImages.length} omitted`);
  console.log(`📊 Estimated total size: ${currentSize.toFixed(2)}MB`);

  return {
    filteredImageDetails,
    filteredNewPartyImages,
    omittedImageDetails,
    omittedNewPartyImages,
    totalEstimatedSize: currentSize
  };
};

// ✅ NEW: Size-based image categorization
const categorizeImagesBySize = async (imageDetails: any[], newPartyImages: any[]) => {
  console.log('🔍 Categorizing images by size...');
  
  const smallImages = { imageDetails: [] as any[], newPartyImages: [] as any[] };
  const largeImages = { imageDetails: [] as any[], newPartyImages: [] as any[] };
  const oversizedImages = { imageDetails: [] as any[], newPartyImages: [] as any[] };
  
  const SMALL_IMAGE_THRESHOLD_KB = 300; // 300KB
  const LARGE_IMAGE_THRESHOLD_MB = 10;  // 10MB
  
  // Categorize ImageDetails
  for (const image of imageDetails) {
    const sizeMB = await estimateImageSizeInMB(image.ImageBytes);
    if (sizeMB <= SMALL_IMAGE_THRESHOLD_KB / 1024) {
      smallImages.imageDetails.push(image);
      console.log(`📱 Small ImageDetails: ${image.ImageName} (${sizeMB.toFixed(2)}MB)`);
    } else if (sizeMB <= LARGE_IMAGE_THRESHOLD_MB) {
      largeImages.imageDetails.push(image);
      console.log(`📷 Large ImageDetails: ${image.ImageName} (${sizeMB.toFixed(2)}MB)`);
    } else {
      oversizedImages.imageDetails.push(image);
      console.log(`⚠️ Oversized ImageDetails: ${image.ImageName} (${sizeMB.toFixed(2)}MB)`);
    }
  }
  
  // Categorize NewPartyImages
  for (const image of newPartyImages) {
    const sizeMB = await estimateImageSizeInMB(image.ImagePath);
    if (sizeMB <= SMALL_IMAGE_THRESHOLD_KB / 1024) {
      smallImages.newPartyImages.push(image);
      console.log(`📱 Small NewPartyImage: ${image.ImageName} (${sizeMB.toFixed(2)}MB)`);
    } else if (sizeMB <= LARGE_IMAGE_THRESHOLD_MB) {
      largeImages.newPartyImages.push(image);
      console.log(`📷 Large NewPartyImage: ${image.ImageName} (${sizeMB.toFixed(2)}MB)`);
    } else {
      oversizedImages.newPartyImages.push(image);
      console.log(`⚠️ Oversized NewPartyImage: ${image.ImageName} (${sizeMB.toFixed(2)}MB)`);
    }
  }
  
  console.log(`📊 Image categorization complete:`);
  console.log(`   Small images: ${smallImages.imageDetails.length + smallImages.newPartyImages.length}`);
  console.log(`   Large images: ${largeImages.imageDetails.length + largeImages.newPartyImages.length}`);
  console.log(`   Oversized images: ${oversizedImages.imageDetails.length + oversizedImages.newPartyImages.length}`);
  
  return { smallImages, largeImages, oversizedImages };
};

// ✅ NEW: Dynamic batch creation based on actual JSON size
const createDynamicImageBatches = async (imageDetails: any[], newPartyImages: any[]) => {
  console.log('🔄 Creating dynamic image batches based on actual JSON size...');
  
  const BATCH_SIZE_LIMITS = {
    SMALL_IMAGE_BATCH_MB: 10,      // 5MB for small images (≤300KB each)
    LARGE_IMAGE_BATCH_MB: 15,     // 10MB for large images (>300KB each)
    MAX_INDIVIDUAL_IMAGE_MB: 15   // 10MB max per image
  };
  
  // Categorize images by size
  const { smallImages, largeImages, oversizedImages } = await categorizeImagesBySize(imageDetails, newPartyImages);
  
  const batches = [];
  
  // Process small images in larger batches (5MB limit)
  if (smallImages.imageDetails.length > 0 || smallImages.newPartyImages.length > 0) {
    console.log('📦 Creating batches for small images...');
    const smallBatches = await createBatchesForImages(
      smallImages.imageDetails, 
      smallImages.newPartyImages, 
      BATCH_SIZE_LIMITS.SMALL_IMAGE_BATCH_MB
    );
    batches.push(...smallBatches);
  }
  
  // Process large images in smaller batches (10MB limit)
  if (largeImages.imageDetails.length > 0 || largeImages.newPartyImages.length > 0) {
    console.log('📦 Creating batches for large images...');
    const largeBatches = await createBatchesForImages(
      largeImages.imageDetails, 
      largeImages.newPartyImages, 
      BATCH_SIZE_LIMITS.LARGE_IMAGE_BATCH_MB
    );
    batches.push(...largeBatches);
  }
  
  // Handle oversized images separately (each gets its own batch)
  if (oversizedImages.imageDetails.length > 0 || oversizedImages.newPartyImages.length > 0) {
    console.log('⚠️ Creating individual batches for oversized images...');
    for (const image of oversizedImages.imageDetails) {
      batches.push({
        imageDetails: [image],
        newPartyImages: [],
        batchType: 'oversized'
      });
    }
    for (const image of oversizedImages.newPartyImages) {
      batches.push({
        imageDetails: [],
        newPartyImages: [image],
        batchType: 'oversized'
      });
    }
  }
  
  console.log(`📦 Created ${batches.length} dynamic batches`);
  return batches;
};

// ✅ NEW: Create batches for specific image categories
const createBatchesForImages = async (
  imageDetails: any[], 
  newPartyImages: any[], 
  maxSizeMB: number
) => {
  const batches = [] as any[];
  
  // ✅ CRITICAL FIX: For large images, use individual batches to prevent 413 errors
  // Large images (3-4MB each) will exceed 10MB limit when processed to Base64
  
  // Combine all images for processing
  const allImages = [
    ...imageDetails.map(img => ({ ...img, type: 'ImageDetails' })),
    ...newPartyImages.map(img => ({ ...img, type: 'NewPartyImages' }))
  ];
  
  // Sort images by size (smallest first for better packing)
  const sortedImages = await Promise.all(
    allImages.map(async (img) => ({
      ...img,
      estimatedSize: await estimateImageSizeInMB(img.type === 'ImageDetails' ? img.ImageBytes : img.ImagePath)
    }))
  );
  
  sortedImages.sort((a, b) => a.estimatedSize - b.estimatedSize);
  
  // ✅ ENHANCED LOGIC: Handle large images individually
  for (const image of sortedImages) {
    if (image.estimatedSize > 5) {
      // Large image (>5MB estimated) - create individual batch
      // This ensures that 3-4MB images are always processed individually
      console.log(`📦 Large image detected: ${image.ImageName} (${image.estimatedSize.toFixed(2)}MB) - creating individual batch`);
      
      const individualBatch = {
        imageDetails: image.type === 'ImageDetails' ? [image] : [] as any[],
        newPartyImages: image.type === 'NewPartyImages' ? [image] : [] as any[],
        batchType: 'large',
        estimatedSize: image.estimatedSize
      };
      
      batches.push(individualBatch);
      console.log(`📦 Individual batch created for large image: ${image.ImageName} (${image.estimatedSize.toFixed(2)}MB)`);
    } else {
      // Small/medium image - try to pack with others
      let addedToExistingBatch = false;
      
      // Try to add to existing batch
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        if (batch.batchType === 'normal' || batch.batchType === 'small') {
          const testBatch = {
            imageDetails: [...batch.imageDetails, ...(image.type === 'ImageDetails' ? [image] : [])],
            newPartyImages: [...batch.newPartyImages, ...(image.type === 'NewPartyImages' ? [image] : [])]
          };
          
          // Calculate estimated size for the test batch
          const estimatedTestSize = testBatch.imageDetails.reduce((sum, img) => sum + (img.estimatedSize || 0), 0) +
                                  testBatch.newPartyImages.reduce((sum, img) => sum + (img.estimatedSize || 0), 0);
          
          if (estimatedTestSize <= maxSizeMB) {
            // Add to existing batch
            if (image.type === 'ImageDetails') {
              batch.imageDetails.push(image);
            } else {
              batch.newPartyImages.push(image);
            }
            batch.estimatedSize = estimatedTestSize;
            addedToExistingBatch = true;
            console.log(`✅ Added ${image.type}: ${image.ImageName} (${image.estimatedSize.toFixed(2)}MB) to existing batch (total: ${estimatedTestSize.toFixed(2)}MB)`);
            break;
          }
        }
      }
      
      if (!addedToExistingBatch) {
        // Create new batch for this image
        const newBatch = {
          imageDetails: image.type === 'ImageDetails' ? [image] : [] as any[],
          newPartyImages: image.type === 'NewPartyImages' ? [image] : [] as any[],
          batchType: 'small',
          estimatedSize: image.estimatedSize
        };
        
        batches.push(newBatch);
        console.log(`📦 New batch created for ${image.type}: ${image.ImageName} (${image.estimatedSize.toFixed(2)}MB)`);
      }
    }
  }
  
  console.log(`📊 Final batching result: ${batches.length} batches created`);
  batches.forEach((batch, index) => {
    console.log(`   Batch ${index + 1}: ${batch.imageDetails.length} ImageDetails, ${batch.newPartyImages.length} NewPartyImages (${batch.estimatedSize.toFixed(2)}MB, ${batch.batchType})`);
  });
  
  return batches;
};

// ✅ NEW: Calculate JSON size for batch
const calculateJsonSizeInMB = (data: any): number => {
  try {
    const jsonString = JSON.stringify(data);
    const sizeInBytes = new Blob([jsonString]).size;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    return parseFloat(sizeInMB.toFixed(2));
  } catch (error) {
    console.error('Error calculating JSON size:', error);
    return 0;
  }
};

// Process images with timeout protection and exists checks
const processImageWithTimeout = async (
  imagePath: string,
  imageName: string,
  timeoutMs: number = 30000 // ✅ STANDARDIZED: 30s per image (was 35s)
): Promise<string> => {
  try {
    // ✅ DEFENSIVE GUARD: Check if image data exists
    console.log(`🔍 Checking image data: ${imageName} at ${imagePath}`);
    
    // For web, images might be stored as base64 already or in localStorage
    let imageData = '';
    
    // Check if it's already a base64 string
    if (imagePath && imagePath.startsWith('data:')) {
      // Extract base64 data from data URL
      const base64Data = imagePath.split(',')[1] || imagePath;
      console.log(`✅ Image already in base64 format: ${imageName}`);
      return base64Data;
    }
    
    // Try to get from localStorage
    try {
      const storedData = localStorage.getItem(imagePath);
      if (storedData) {
        console.log(`✅ Image retrieved from localStorage: ${imageName}`);
        return storedData;
      }
    } catch (storageError) {
      console.warn(`⚠️ Could not access localStorage for: ${imageName}`, storageError);
    }
    
    // If image path looks like a URL, try to fetch it
    if (imagePath && (imagePath.startsWith('http') || imagePath.startsWith('blob:'))) {
      try {
        const response = await fetch(imagePath);
        const blob = await response.blob();
        imageData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1] || '';
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        console.log(`✅ Successfully read image from URL: ${imageName}`);
        return imageData;
      } catch (fetchError) {
        console.warn(`⚠️ Could not fetch image from URL: ${imageName}`, fetchError);
      }
    }
    
    // If we couldn't get the image, log and return empty
    console.warn(`⚠️ Image data not accessible: ${imageName} at ${imagePath}`);
    writeErrorLog(`Image file not found: ${imagePath}`, new Error('File does not exist'));
    return '';
    
  } catch (error) {
    console.error(`❌ Failed to read image: ${imageName} at ${imagePath}`, error);
    writeErrorLog(`Error reading image: ${imagePath}`, error);
    
    // ✅ CRASH RESILIENCE: Always return empty string instead of throwing
    // This allows sync to continue with other images instead of crashing completely
    return '';
  }
};

// Process ImageDetails in batches
const processImageDetailsBatch = async (
  imageDetails: any[],
  batchSize: number,
  timeoutMs: number
): Promise<ProcessedImageDetail[]> => {
  console.log(`📸 Processing ${imageDetails.length} ImageDetails in batches of ${batchSize}`);
  
  const results: ProcessedImageDetail[] = [];
  
  for (let i = 0; i < imageDetails.length; i += batchSize) {
    const batch = imageDetails.slice(i, i + batchSize);
    console.log(`📦 Processing ImageDetails batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(imageDetails.length / batchSize)}`);
    
    const batchResults = await Promise.all(
      batch.map(async (item: any): Promise<ProcessedImageDetail> => {
        const imageBytes = await processImageWithTimeout(
          item.ImageBytes,
          item.ImageName,
          timeoutMs
        );
        
        return {
          ID: item.ID,
          OrderID: item.OrderID,
          ImageDatetime: item.ImageDateTime,
          ImageName: item.ImageName,
          ImageBytes: imageBytes,
        };
      })
    );
    
    results.push(...batchResults);
    
    // Memory management delay between batches
    if (i + batchSize < imageDetails.length) {
      console.log(`⏳ Memory cleanup delay between batches...`);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  const successfulImages = results.filter(img => img.ImageBytes !== '').length;
  console.log(`✅ Processed ${successfulImages}/${imageDetails.length} ImageDetails successfully`);
  
  return results;
};

// Process NewPartyImages in batches
const processNewPartyImagesBatch = async (
  newPartyImages: any[],
  batchSize: number,
  timeoutMs: number
): Promise<ProcessedNewPartyImage[]> => {
  console.log(`📸 Processing ${newPartyImages.length} NewPartyImages in batches of ${batchSize}`);
  
  const results: ProcessedNewPartyImage[] = [];
  
  for (let i = 0; i < newPartyImages.length; i += batchSize) {
    const batch = newPartyImages.slice(i, i + batchSize);
    console.log(`📦 Processing NewPartyImages batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(newPartyImages.length / batchSize)}`);
    
    const batchResults = await Promise.all(
      batch.map(async (item: any): Promise<ProcessedNewPartyImage> => {
        const imageData = await processImageWithTimeout(
          item.ImagePath,
          item.ImageName,
          timeoutMs
        );
        
        return {
          Id: item.id,
          ImageName: item.ImageName,
          ShopId: item.ShopId,
          Data: imageData,
        };
      })
    );
    
    results.push(...batchResults);
    
    // Memory management delay between batches
    if (i + batchSize < newPartyImages.length) {
      console.log(`⏳ Memory cleanup delay between batches...`);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  const successfulImages = results.filter(img => img.Data !== '').length;
  console.log(`✅ Processed ${successfulImages}/${newPartyImages.length} NewPartyImages successfully`);
  
  return results;
};

/**
 * Process image data with intelligent batching based on size estimation
 * @param mgkKeys - Array of MobileGenPrimaryKey values for logging context (images always sync ALL unsynced entries)
 * @param config - Configuration options for processing
 * @returns Promise<ImageProcessingResult>
 */
// Export the new dynamic batching functions
export { 
  categorizeImagesBySize, 
  createDynamicImageBatches, 
  createBatchesForImages,
  calculateJsonSizeInMB 
};

export const processImageDataWithBatching = async (
  mgkKeys?: string[],
  config: ImageProcessingConfig = {},
  phaseInfo?: { currentPhase: number; totalPhases: number; startIndex?: number; maxImages?: number }
): Promise<ImageProcessingResult> => {
  const {
    sizeLimitMB = 20,
    imagesBatchSize = 3, // SIMPLIFIED: Fixed reasonable batch size
    timeoutMs = 30000, // ✅ INCREASED: 30s per image to handle large files safely
  } = config;

  console.log('🎯 Starting intelligent image processing...');
  console.log(`📊 Config: Size limit: ${sizeLimitMB}MB, Batch size: ${imagesBatchSize}, Timeout: ${timeoutMs}ms`);
  
  if (phaseInfo) {
    console.log(`🔄 PHASE ${phaseInfo.currentPhase}/${phaseInfo.totalPhases} - Processing images...`);
  }
  
  try {
    // Phase 1: Get image data from database with proper MGK filtering
    console.log('📋 Phase 1: Fetching image data from database...');
    
    let imageDetailsPromise: Promise<any>;
    let newPartyImagesPromise: Promise<any>;
    
    // ✅ CORRECTED LOGIC: Images always sync ALL unsynced entries regardless of selection
    // This matches the ExpandList behavior where images are "always-sync" data
    console.log('📁 Getting ALL unsynced images (images ignore selection - always sync)');
    
    // Always get all unsynced images - no MGK filtering for images
    imageDetailsPromise = getImageDetailsyncData();
    newPartyImagesPromise = getNewPartyImageDetailsyncData();
    
    if (mgkKeys && mgkKeys.length > 0) {
      console.log(`ℹ️ Note: Selected MGK keys (${mgkKeys.length}):`, mgkKeys);
      console.log('ℹ️ Images sync independently - not filtered by selection');
    }
    
    const [imageDetails, newPartyImages] = await Promise.all([
      imageDetailsPromise,
      newPartyImagesPromise,
    ]);
    
    // Type assertion since we know the database functions return arrays
    let typedImageDetails = (imageDetails as any[]) || [];
    let typedNewPartyImages = (newPartyImages as any[]) || [];
    
    // TWO-PHASE LOGIC: Slice data if phase info provided
    if (phaseInfo && phaseInfo.maxImages) {
      const startIndex = phaseInfo.startIndex || 0;
      const endIndex = startIndex + phaseInfo.maxImages;
      const totalImages = typedImageDetails.length + typedNewPartyImages.length;
      
      console.log(`🔄 PHASE ${phaseInfo.currentPhase}/${phaseInfo.totalPhases}: Processing images ${startIndex + 1}-${Math.min(endIndex, totalImages)}`);
      
      // Slice ImageDetails first, then NewPartyImages if needed
      if (startIndex < typedImageDetails.length) {
        typedImageDetails = typedImageDetails.slice(startIndex, Math.min(endIndex, typedImageDetails.length));
        
        if (endIndex > typedImageDetails.length) {
          const newPartyStart = Math.max(0, startIndex - typedImageDetails.length);
          const newPartyEnd = endIndex - typedImageDetails.length;
          typedNewPartyImages = typedNewPartyImages.slice(newPartyStart, newPartyEnd);
        } else {
          typedNewPartyImages = [];
        }
      } else {
        // Start from NewPartyImages
        const newPartyStart = startIndex - typedImageDetails.length;
        typedImageDetails = [];
        typedNewPartyImages = typedNewPartyImages.slice(newPartyStart, newPartyStart + phaseInfo.maxImages);
      }
    }
    
    console.log(`📊 ${phaseInfo ? `Phase ${phaseInfo.currentPhase}: ` : ''}Found ${typedImageDetails.length} ImageDetails + ${typedNewPartyImages.length} NewPartyImages`);
    
    // If no images, return early
    if (typedImageDetails.length === 0 && typedNewPartyImages.length === 0) {
      console.log('ℹ️ No images found to process');
      return {
        shouldBatch: false,
        estimatedSizeMB: 0,
        data: {},
      };
    }
    
    // Phase 2: Estimate total size
    console.log('📏 Phase 2: Estimating total image size...');
    const estimatedSizeMB = await calculateEstimatedImageSizeMB(typedImageDetails, typedNewPartyImages);
    
    // Phase 3: Simple strategy determination
    const totalImages = typedImageDetails.length + typedNewPartyImages.length;
    const shouldBatch = estimatedSizeMB > sizeLimitMB;
    
    console.log(`🎯 Processing strategy: ${shouldBatch ? 'BATCH' : 'NORMAL'} (${estimatedSizeMB.toFixed(2)}MB ${shouldBatch ? '>' : '≤'} ${sizeLimitMB}MB)`);
    console.log(`📦 Using fixed batch size: ${imagesBatchSize} images per batch`);
    
    // Phase 4: Process images with dynamic size-based batching
    console.log('🔄 Phase 4: Processing images with dynamic size-based batching...');
    const result: ImageProcessingResult['data'] = {};
    
    // ✅ NEW: Use dynamic batch creation based on actual JSON size
    const dynamicBatches = await createDynamicImageBatches(typedImageDetails, typedNewPartyImages);
    
    console.log(`📊 Dynamic batching: Created ${dynamicBatches.length} batches based on actual JSON size`);
    
    // Process each batch
    const allProcessedImageDetails: ProcessedImageDetail[] = [];
    const allProcessedNewPartyImages: ProcessedNewPartyImage[] = [];
    
    for (let i = 0; i < dynamicBatches.length; i++) {
      const batch = dynamicBatches[i];
      console.log(`🔄 Processing batch ${i + 1}/${dynamicBatches.length} (${batch.batchType})`);
      
      // Process ImageDetails in this batch
      if (batch.imageDetails.length > 0) {
      const processedImageDetails = await processImageDetailsBatch(
          batch.imageDetails,
        imagesBatchSize,
        timeoutMs
      );
        allProcessedImageDetails.push(...processedImageDetails);
        console.log(`✅ Processed ${processedImageDetails.length} ImageDetails in batch ${i + 1}`);
    }
    
      // Process NewPartyImages in this batch
      if (batch.newPartyImages.length > 0) {
      const processedNewPartyImages = await processNewPartyImagesBatch(
          batch.newPartyImages,
        imagesBatchSize,
        timeoutMs
      );
        allProcessedNewPartyImages.push(...processedNewPartyImages);
        console.log(`✅ Processed ${processedNewPartyImages.length} NewPartyImages in batch ${i + 1}`);
      }
    }
    
    // Combine all processed images
    if (allProcessedImageDetails.length > 0) {
      result[dataSyncObjectKeys.ImageDetails] = allProcessedImageDetails;
    }
    
    if (allProcessedNewPartyImages.length > 0) {
      result[dataSyncObjectKeys.NewPartyImage] = allProcessedNewPartyImages;
    }
    
    // ✅ CRITICAL FIX: Add OrderMaster records for images to prevent server errors
    if (result[dataSyncObjectKeys.ImageDetails] && result[dataSyncObjectKeys.ImageDetails]!.length > 0) {
      try {
        console.log(`🔧 Adding OrderMaster records for ${result[dataSyncObjectKeys.ImageDetails]!.length} ImageDetails...`);
        
        // Get OrderMaster records for images (collection_type=3)
        const imageOrderMaster = await getOrderMasterSyncDataForImage() as any[];
        
        if (imageOrderMaster && imageOrderMaster.length > 0) {
          // Get OrderIDs from processed images
          const imageOrderIds = result[dataSyncObjectKeys.ImageDetails]!
            .map((img: any) => img.OrderID)
            .filter(Boolean);
          
          // Filter OrderMaster records that correspond to these images
          const relatedOrderMaster = imageOrderMaster.filter((order: any) => 
            imageOrderIds.includes(order.ID)
          );
          
          if (relatedOrderMaster.length > 0) {
            result[dataSyncObjectKeys.OrderMaster] = relatedOrderMaster;
            console.log(`✅ Added ${relatedOrderMaster.length} image-related OrderMaster records`);
          } else {
            console.warn(`⚠️ No OrderMaster records found for image OrderIDs: ${imageOrderIds.slice(0, 5).join(', ')}${imageOrderIds.length > 5 ? '...' : ''}`);
          }
        } else {
          console.warn(`⚠️ No image-related OrderMaster records found in database`);
        }
      } catch (error) {
        console.error(`❌ Error adding OrderMaster for images:`, error);
        // Don't throw - continue without OrderMaster to avoid breaking the entire sync
      }
    }
    
    console.log('✅ Image processing completed successfully');
    
    return {
      shouldBatch,
      estimatedSizeMB,
      data: result,
    };
    
  } catch (error) {
    console.error('❌ Error during image processing:', error);
    writeErrorLog('processImageDataWithBatching error', error);
    throw error;
  }
};

/**
 * Legacy wrapper for backward compatibility
 * Processes images and returns them in the expected format
 */
export const processImagesForSync = async (mgkKeys?: string[]) => {
  const result = await processImageDataWithBatching(mgkKeys);
  return result.data;
};

/**
 * Cleanup images after successful sync
 * - Only cleans up images for the specific MGK keys that were successfully synced
 * - Deletes physical image files from filesystem
 * - Deletes image records from database
 * @param savedDataMGKs - Array of MobileGenPrimaryKey values from SavedData response
 */
export const cleanupImagesAfterSync = async (savedDataMGKs: string[]): Promise<void> => {
  if (!savedDataMGKs || savedDataMGKs.length === 0) {
    console.log('ℹ️ No SavedData MGK keys provided for image cleanup');
    return;
  }
  
  console.log(`🧹 Starting image cleanup for ${savedDataMGKs.length} successfully synced MGK keys:`, savedDataMGKs);
  
  try {
    // Get images that belong to the successfully synced MGK keys
    const [allImageDetails, allNewPartyImages] = await Promise.all([
      getImageDetails(), // Get all images with sync_flag = 'Y'
      getNewPartyImages(), // Get all new party images with sync_flag = 'Y' 
    ]);
    
    // Type assertion since we know the database functions return arrays
    const typedImageDetails = (allImageDetails as any[]) || [];
    const typedNewPartyImages = (allNewPartyImages as any[]) || [];
    
    // Filter images to only those belonging to saved MGK keys
    const imagesToCleanup = typedImageDetails.filter((item: any) => 
      savedDataMGKs.includes(item.OrderID || item.order_id)
    );
    
    const newPartyImagesToCleanup = typedNewPartyImages.filter((item: any) => 
      savedDataMGKs.includes(item.OrderID)
    );
    
    console.log(`🗂️ Found ${imagesToCleanup.length} ImageDetails + ${newPartyImagesToCleanup.length} NewPartyImages to cleanup for saved MGK keys`);
    
    // Cleanup ImageDetails
    if (imagesToCleanup.length > 0) {
      console.log(`🧹 Cleaning up ${imagesToCleanup.length} ImageDetails...`);
      
      // Delete from localStorage (web equivalent)
      const imageDeletePromises = imagesToCleanup.map(async (item: any) => {
        try {
          const imagePath = item.Path || item.ImagePath;
          if (imagePath) {
            // Try to remove from localStorage
            try {
              localStorage.removeItem(imagePath);
              console.log(`🗑️ Deleted ImageDetail from storage: ${imagePath}`);
            } catch (storageError) {
              console.warn(`⚠️ Could not delete from localStorage: ${imagePath}`, storageError);
            }
          }
        } catch (error) {
          const imagePath = item.Path || item.ImagePath;
          console.warn(`⚠️ Failed to delete ImageDetail: ${imagePath}`, error);
          writeErrorLog(`Image cleanup error: ${imagePath}`, error);
        }
      });
      
      await Promise.all(imageDeletePromises);
      
      // Delete database records for specific MGK keys
      for (const mgkKey of savedDataMGKs) {
        try {
          await deleteImageDetailByKey(mgkKey);
          console.log(`🗑️ Deleted ImageDetails from database for MGK: ${mgkKey}`);
        } catch (error) {
          console.warn(`⚠️ Failed to delete ImageDetails for MGK: ${mgkKey}`, error);
          writeErrorLog(`Database image deletion error for MGK: ${mgkKey}`, error);
        }
      }
    }
    
    // Cleanup NewPartyImages  
    if (newPartyImagesToCleanup.length > 0) {
      console.log(`🧹 Cleaning up ${newPartyImagesToCleanup.length} NewPartyImages...`);
      
      // Delete from localStorage (web equivalent)
      const newPartyDeletePromises = newPartyImagesToCleanup.map(async (item: any) => {
        try {
          const imagePath = item.ImagePath;
          if (imagePath) {
            // Try to remove from localStorage
            try {
              localStorage.removeItem(imagePath);
              console.log(`🗑️ Deleted NewPartyImage from storage: ${imagePath}`);
            } catch (storageError) {
              console.warn(`⚠️ Could not delete from localStorage: ${imagePath}`, storageError);
            }
          }
        } catch (error) {
          console.warn(`⚠️ Failed to delete NewPartyImage: ${item.ImagePath}`, error);
          writeErrorLog(`NewParty image cleanup error: ${item.ImagePath}`, error);
        }
      });
      
      await Promise.all(newPartyDeletePromises);
      
      // Delete database records for specific MGK keys
      for (const mgkKey of savedDataMGKs) {
        try {
          await deleteNewPartyImageDetailByKey(mgkKey);
          console.log(`🗑️ Deleted NewPartyImages from database for MGK: ${mgkKey}`);
        } catch (error) {
          console.warn(`⚠️ Failed to delete NewPartyImages for MGK: ${mgkKey}`, error);
          writeErrorLog(`Database new party image deletion error for MGK: ${mgkKey}`, error);
        }
      }
    }
    
    console.log(`✅ Image cleanup completed successfully for ${savedDataMGKs.length} MGK keys`);
    
  } catch (error) {
    console.error('❌ Error during image cleanup:', error);
    writeErrorLog('cleanupImagesAfterSync error', error);
    // Don't throw - cleanup errors shouldn't break the main sync flow
  }
};

