
/**
 * Handles image processing and machine learning predictions
 */

// TensorFlow.js & Teachable Machine model URLs
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/cWDmYkcUn/model.json";
const METADATA_URL = "https://teachablemachine.withgoogle.com/models/cWDmYkcUn/metadata.json";

// Character mapping for Tamil script
const TAMIL_MAPPING: Record<string, string> = {
  "a": "அ", "aa": "ஆ", "ai": "ஐ", "cha": "ச", "e": "எ", "ee": "ஏ",
  "i": "இ", "ii": "ஈ", "ka": "க", "la": "ல", "lla": "ள", "ma": "ம",
  "na": "ந", "nga": "ங", "nja": "ஞ", "nna": "ண", "nnna": "ன", "o": "ஒ",
  "oo": "ஓ", "pa": "ப", "ra": "ர", "rra": "ற", "ta": "த", "tha": "தா",
  "u": "உ", "uu": "ஊ", "va": "வ", "ya": "ய", "zha": "ழ"
};

// We'll use this to store the loaded model
let modelInstance: any = null;

/**
 * Load the Teachable Machine model
 */
export const loadModel = async (): Promise<boolean> => {
  try {
    // Ensure TensorFlow.js and Teachable Machine are available
    if (typeof window === 'undefined' || !window.tmImage) {
      console.error("Teachable Machine library not available");
      return false;
    }

    // Load the model
    modelInstance = await window.tmImage.load(MODEL_URL, METADATA_URL);
    console.log("Model loaded successfully");
    return true;
  } catch (error) {
    console.error("Error loading model:", error);
    return false;
  }
};

/**
 * Predict character from image
 */
export const predictCharacter = async (imageElement: HTMLImageElement): Promise<{
  character: string;
  probability: number;
  error?: string;
}> => {
  try {
    if (!modelInstance) {
      throw new Error("Model not loaded");
    }

    // Get predictions from the model
    const predictions = await modelInstance.predict(imageElement);
    
    // Find the prediction with highest probability
    const highestPrediction = predictions.reduce(
      (max: any, p: any) => (p.probability > max.probability ? p : max),
      predictions[0]
    );

    // Map the prediction to Tamil character if available
    const tamilChar = TAMIL_MAPPING[highestPrediction.className] || highestPrediction.className;
    
    return {
      character: tamilChar,
      probability: highestPrediction.probability
    };
  } catch (error) {
    console.error("Prediction error:", error);
    return {
      character: "",
      probability: 0,
      error: "Failed to predict. Please try another image."
    };
  }
};

// Declare the types for the global window object
declare global {
  interface Window {
    tmImage: {
      load: (modelURL: string, metadataURL: string) => Promise<any>;
    };
  }
}
