/**
 * Hugging Face Inference API utilities for image classification
 * Uses the Hugging Face vision models to analyze city problem images
 * Falls back to filename-based analysis when API is unavailable
 */

const HF_API_URL = 'https://api-inference.huggingface.co/models';
const HF_API_KEY = process.env.HF_API_KEY;

// Models to try in order
const MODELS_TO_TRY = [
  'Salesforce/blip-image-captioning-base',
  'nlpconnect/vit-gpt2-image-captioning',
];

// Keywords in filenames that indicate problem types
const FILENAME_KEYWORDS: Record<string, string> = {
  pothole: 'Road Damage',
  'road damage': 'Road Damage',
  crack: 'Road Damage',
  asphalt: 'Road Damage',
  garbage: 'Garbage/Waste',
  trash: 'Garbage/Waste',
  litter: 'Garbage/Waste',
  waste: 'Garbage/Waste',
  graffiti: 'Graffiti',
  vandalism: 'Graffiti',
  'street light': 'Street Lighting',
  'street lamp': 'Street Lighting',
  'light pole': 'Street Lighting',
  flooding: 'Flooding',
  flood: 'Flooding',
  water: 'Flooding',
  'water leak': 'Water Leakage',
  leak: 'Water Leakage',
  tree: 'Tree Maintenance',
  branch: 'Tree Maintenance',
  'broken tree': 'Tree Maintenance',
  park: 'Park Maintenance',
  sidewalk: 'Sidewalk Issues',
  'side walk': 'Sidewalk Issues',
  pavement: 'Sidewalk Issues',
  traffic: 'Traffic',
  'traffic sign': 'Traffic',
  sign: 'Traffic',
  bridge: 'Bridge',
  sewer: 'Sewer Issues',
  'sewer grate': 'Sewer Issues',
  manhole: 'Sewer Issues',
  air: 'Air Quality',
  smoke: 'Air Quality',
  noise: 'Noise Pollution',
};

// Category mapping from Hugging Face predictions to local categories
// Maps common city problems to category names
// Simplified to match only actual database categories
const CATEGORY_MAPPING: Record<string, string> = {
  // Road Damage
  pothole: 'Road Damage',
  'road damage': 'Road Damage',
  asphalt: 'Road Damage',
  'damaged road': 'Road Damage',
  road: 'Road Damage',
  crack: 'Road Damage',
  pavement: 'Road Damage',
  surface: 'Road Damage',

  // Garbage/Waste
  garbage: 'Garbage/Waste',
  trash: 'Garbage/Waste',
  litter: 'Garbage/Waste',
  'waste management': 'Garbage/Waste',
  debris: 'Garbage/Waste',
  rubbish: 'Garbage/Waste',
  refuse: 'Garbage/Waste',

  // Graffiti
  graffiti: 'Graffiti',
  vandalism: 'Graffiti',
  'spray paint': 'Graffiti',
  wall: 'Graffiti',
  markings: 'Graffiti',

  // Street Lighting
  'street light': 'Street Lighting',
  'street lamp': 'Street Lighting',
  'light pole': 'Street Lighting',
  light: 'Street Lighting',
  lighting: 'Street Lighting',
  lamp: 'Street Lighting',
  'broken light': 'Street Lighting',

  // Flooding
  flood: 'Flooding',
  water: 'Flooding',
  'water level': 'Flooding',
  inundation: 'Flooding',
  standing: 'Flooding',

  // Water Leakage
  'water leak': 'Water Leakage',
  'water leakage': 'Water Leakage',
  leak: 'Water Leakage',
  leaking: 'Water Leakage',
  'pipe leak': 'Water Leakage',

  // Tree Maintenance
  tree: 'Tree Maintenance',
  'tree damage': 'Tree Maintenance',
  'broken tree': 'Tree Maintenance',
  'fallen tree': 'Tree Maintenance',
  branch: 'Tree Maintenance',
  'dead tree': 'Tree Maintenance',

  // Park Maintenance
  park: 'Park Maintenance',
  'park bench': 'Park Maintenance',
  'park equipment': 'Park Maintenance',
  playground: 'Park Maintenance',

  // Sidewalk Issues
  sidewalk: 'Sidewalk Issues',
  'side walk': 'Sidewalk Issues',
  'concrete damage': 'Sidewalk Issues',
  'broken concrete': 'Sidewalk Issues',
  curb: 'Sidewalk Issues',

  // Traffic
  traffic: 'Traffic',
  'traffic sign': 'Traffic',
  'traffic light': 'Traffic',
  'traffic control': 'Traffic',
  sign: 'Traffic',
  junction: 'Traffic',

  // Bridge
  bridge: 'Bridge',
  'bridge damage': 'Bridge',
  overpass: 'Bridge',

  // Sewer Issues
  sewer: 'Sewer Issues',
  'sewer grate': 'Sewer Issues',
  manhole: 'Sewer Issues',
  'sewer cover': 'Sewer Issues',

  // Utilities
  utility: 'Utilities',
  'utility pole': 'Utilities',
  electric: 'Utilities',
  pipe: 'Utilities',
  'power line': 'Utilities',
  cable: 'Utilities',

  // Parking
  parking: 'Parking',
  'parking lot': 'Parking',
  'parking space': 'Parking',

  // Air Quality
  pollution: 'Air Quality',
  'air quality': 'Air Quality',
  emission: 'Air Quality',

  // Building Issues
  building: 'Building Issues',
  'building damage': 'Building Issues',
  'facade damage': 'Building Issues',
  'broken door': 'Building Issues',
  'broken glass': 'Building Issues',
  facade: 'Building Issues',
  
  // Noise Pollution
  noise: 'Noise Pollution',
};

export interface HuggingFaceResponse {
  label: string;
  score: number;
}

export interface CategoryPrediction {
  categoryName: string;
  confidence: number;
  rawLabel: string;
}

/**
 * Analyzes an image using filename-based keywords as a fallback
 * This works when the Hugging Face API is unavailable
 */
function analyzeByFilename(filename: string): CategoryPrediction | null {
  const filenameLower = filename.toLowerCase();
  console.log('🔍 Analyzing filename for keywords:', filename);

  for (const [keyword, categoryName] of Object.entries(FILENAME_KEYWORDS)) {
    if (filenameLower.includes(keyword)) {
      console.log(`✨ Matched filename keyword: "${keyword}" → "${categoryName}"`);
      return {
        categoryName,
        confidence: 0.7,
        rawLabel: keyword,
      };
    }
  }

  console.log('📌 No keywords found in filename');
  return null;
}

/**
 * Analyzes an image using Hugging Face image-to-text (captioning)
 * Falls back to filename analysis if HF API is unavailable
 * Returns the most likely category based on the caption or filename
 */
export async function analyzeImageWithHuggingFace(
  imageBuffer: Buffer,
  filename?: string
): Promise<CategoryPrediction | null> {
  if (!HF_API_KEY) {
    console.warn('⚠️ HF_API_KEY not configured, using filename analysis fallback');
    if (filename) {
      return analyzeByFilename(filename);
    }
    return null;
  }

  console.log('🤖 Starting image analysis...');
  console.log('📦 Image buffer size:', imageBuffer.length, 'bytes');
  if (filename) console.log('📄 Filename:', filename);

  // Try each model in order until one works
  for (const model of MODELS_TO_TRY) {
    try {
      console.log(`🔄 Trying model: ${model}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(
        `${HF_API_URL}/${model}`,
        {
          headers: { 
            Authorization: `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/octet-stream',
          },
          method: 'POST',
          body: imageBuffer as unknown as BodyInit,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      console.log(`📡 Response status from ${model}:`, response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`⚠️ ${model} failed with ${response.status}`);
        continue; // Try next model
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await response.json();
      console.log('📊 Raw response received');

      // Handle image captioning response
      let caption = '';
      if (Array.isArray(result) && result[0]?.generated_text) {
        caption = result[0].generated_text;
      } else if (result.generated_text) {
        caption = result.generated_text;
      } else if (typeof result === 'string') {
        caption = result;
      }

      if (!caption) {
        console.warn(`⚠️ No caption from ${model}, trying next...`);
        continue;
      }

      console.log('📝 Caption:', caption.substring(0, 100));

      // Analyze the caption to find matching category
      const captionLower = caption.toLowerCase();
      let bestMatch: CategoryPrediction | null = null;
      let highestMatchScore = 0;

      for (const [keyword, categoryName] of Object.entries(CATEGORY_MAPPING)) {
        const keywordLower = keyword.toLowerCase();
        
        if (captionLower.includes(keywordLower)) {
          const currentScore = (bestMatch?.categoryName === categoryName ? 1 : 0) + 1;
          
          if (currentScore > highestMatchScore) {
            highestMatchScore = currentScore;
            bestMatch = {
              categoryName,
              confidence: 0.8,
              rawLabel: keyword,
            };
          }
        }
      }

      if (bestMatch) {
        console.log(`✅ Matched caption: "${bestMatch.categoryName}"`);
        return bestMatch;
      }

      // No keyword match - return safe default
      console.log('📌 Using default category');
      return {
        categoryName: 'Garbage/Waste',
        confidence: 0.5,
        rawLabel: 'unknown',
      };

    } catch (error) {
      console.warn(`❌ ${model} error:`, String(error).substring(0, 50));
      continue;
    }
  }

  // All Hugging Face models failed - fall back to filename analysis
  console.log('⚠️ Hugging Face unavailable, using filename fallback');
  if (filename) {
    const result = analyzeByFilename(filename);
    if (result) return result;
  }

  // Final fallback
  console.log('📌 Using default category as last resort');
  return {
    categoryName: 'Garbage/Waste',
    confidence: 0.3,
    rawLabel: 'default',
  };
}

/**
 * Maps a predicted category name to an existing category ID in the database
 */
export async function mapPredictionToCategoryId(
  categoryName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  availableCategories: any[]
): Promise<string | null> {
  if (!categoryName || !availableCategories) {
    console.warn('❌ mapPredictionToCategoryId: Missing categoryName or categories');
    return null;
  }

  console.log('🔍 mapPredictionToCategoryId called with:', categoryName);
  console.log('📊 Available categories:', availableCategories.map((c) => c.name));

  // Try exact match first
  let match = availableCategories.find(
    (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
  );

  if (match) {
    console.log(`✅ Exact match found: "${categoryName}" → ID: ${match.id}`);
    return match.id;
  }

  console.log('❌ No exact match, trying partial match...');

  // Try partial match
  const categoryLower = categoryName.toLowerCase();
  match = availableCategories.find((cat) => {
    const catNameLower = cat.name.toLowerCase();
    const isPartialMatch =
      catNameLower.includes(categoryLower) ||
      categoryLower.includes(catNameLower);
    
    if (isPartialMatch) {
      console.log(`  ✓ Partial match: "${cat.name}" ≈ "${categoryName}"`);
    }
    return isPartialMatch;
  });

  if (match) {
    console.log(`✅ Partial match found: "${match.name}" → ID: ${match.id}`);
    return match.id;
  }

  console.log(`❌ No match found for "${categoryName}"`);
  return null;
}
