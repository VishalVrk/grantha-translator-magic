
/**
 * Handles transliteration between different scripts and translation
 */

interface TransliterationParams {
  text: string;
  sourceScript: string;
  targetScript: string;
  options?: TransliterationOptions;
}

export interface TransliterationOptions {
  disableUu?: boolean;
  subscriptNumerals?: boolean;
  markFirstVarga?: boolean;
  removeApostrophe?: boolean;
  removeDiacriticNumerals?: boolean;
  oldOrthography?: boolean;
  granthaVisarga?: boolean;
  disableIlm?: boolean;
  contextualNna?: boolean;
  onlyWordFinalNna?: boolean;
  nativeNumerals?: boolean;
  useDandas?: boolean;
  preserveSource?: boolean;
}

interface TransliterationResult {
  transliteratedText: string;
  error?: string;
}

interface TranslationParams {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceScript?: string;
}

interface TranslationResult {
  translatedText: string;
  error?: string;
}

/**
 * Transliterate text from one script to another using the Aksharamukha API
 */
export const transliterateText = async ({
  text,
  sourceScript,
  targetScript,
  options = {},
}: TransliterationParams): Promise<TransliterationResult> => {
  if (!text.trim()) {
    return { transliteratedText: "", error: "Please enter some text to transliterate" };
  }

  try {
    // Build the URL with all options
    let apiUrl = `https://aksharamukha-plugin.appspot.com/api/public?source=${sourceScript}&target=${targetScript}&text=${encodeURIComponent(text)}`;
    
    // Add options to the URL if they are specified
    if (options.disableUu) apiUrl += "&disableUu=true";
    if (options.subscriptNumerals) apiUrl += "&subscriptNumerals=true";
    if (options.markFirstVarga) apiUrl += "&markFirstVarga=true";
    if (options.removeApostrophe) apiUrl += "&removeApostrophe=true";
    if (options.removeDiacriticNumerals) apiUrl += "&removeDiacriticNumerals=true";
    if (options.oldOrthography) apiUrl += "&oldOrthography=true";
    if (options.granthaVisarga) apiUrl += "&granthaVisarga=true";
    if (options.disableIlm) apiUrl += "&disableIlm=true";
    if (options.contextualNna) apiUrl += "&contextualNna=true";
    if (options.onlyWordFinalNna) apiUrl += "&onlyWordFinalNna=true";
    if (options.nativeNumerals) apiUrl += "&nativeNumerals=true";
    if (options.useDandas) apiUrl += "&useDandas=true";
    if (options.preserveSource) apiUrl += "&preserveSource=true";
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.text();
    return { transliteratedText: result };
  } catch (error) {
    console.error("Transliteration error:", error);
    return { 
      transliteratedText: "", 
      error: "An error occurred during transliteration. Please try again." 
    };
  }
};

/**
 * Translate text using LibreTranslate API
 * For Grantha script, it first transliterates to an intermediate script
 */
export const translateText = async ({
  text,
  sourceLanguage,
  targetLanguage,
  sourceScript,
}: TranslationParams): Promise<TranslationResult> => {
  if (!text.trim()) {
    return { translatedText: "", error: "Please enter some text to translate" };
  }

  try {
    let textToTranslate = text;
    
    // Handle Grantha script translation by first transliterating to a language LibreTranslate understands
    if (sourceScript === "Grantha") {
      // Determine which script to transliterate to based on the source language
      let intermediateScript = "Tamil";
      if (sourceLanguage === "hi" || sourceLanguage === "sa") {
        intermediateScript = "Devanagari";
      }
      
      // Transliterate from Grantha to the intermediate script
      const transliterationResult = await transliterateText({
        text,
        sourceScript: "Grantha",
        targetScript: intermediateScript
      });
      
      if (transliterationResult.error) {
        return { translatedText: "", error: transliterationResult.error };
      }
      
      textToTranslate = transliterationResult.transliteratedText;
    }

    const response = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: textToTranslate,
        source: sourceLanguage,
        target: targetLanguage,
        format: "text",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return { translatedText: result.translatedText };
  } catch (error) {
    console.error("Translation error:", error);
    return {
      translatedText: "",
      error: "An error occurred during translation. Please try again.",
    };
  }
};

/**
 * Download text as a file
 */
export const downloadTextAsFile = (text: string, filename = "output.txt"): void => {
  if (!text) {
    console.error("No text to download");
    return;
  }
  
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const SCRIPT_OPTIONS = [
  { value: "Grantha", label: "Grantha" },
  { value: "Tamil", label: "Tamil" },
  { value: "HK", label: "English (Roman)" },
  { value: "Devanagari", label: "Devanagari" }
];

export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "ta", label: "Tamil" },
  { value: "hi", label: "Hindi" },
  { value: "sa", label: "Sanskrit" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "de", label: "German" },
  { value: "Grantha", label: "Grantha" } // Added Grantha as a language option
];

/**
 * Aksharamukha Transliteration Options
 */
export const TRANSLITERATION_OPTIONS = [
  { 
    id: "disableUu", 
    label: "Disable ūṃ", 
    description: "ūṃ → ūṁ²" 
  },
  { 
    id: "subscriptNumerals", 
    label: "Subscript numerals", 
    description: "क¹क²क³ → क₁क₂क₃" 
  },
  { 
    id: "markFirstVarga", 
    label: "Mark the first varga", 
    description: "தி³பம் → தி³பம்" 
  },
  { 
    id: "removeApostrophe", 
    label: "Remove apostrophe", 
    description: "ருʼம் → ரும்" 
  },
  { 
    id: "removeDiacriticNumerals", 
    label: "Remove diacritic numerals", 
    description: "க¹க²க³ → ககக" 
  },
  { 
    id: "oldOrthography", 
    label: "Old orthography", 
    description: "லை னா → லை (லை)" 
  },
  { 
    id: "granthaVisarga", 
    label: "Grantha Visarga", 
    description: "நம: → நம꞉" 
  },
  { 
    id: "disableIlm", 
    label: "Disable ஃ", 
    description: "ஃ → ஂ" 
  },
  { 
    id: "contextualNna", 
    label: "Contextual ன", 
    description: "(Experimental) ப்ரவய → ப்ரனய" 
  },
  { 
    id: "onlyWordFinalNna", 
    label: "Only word-final ன", 
    description: "ஆனனன் → ஆநன்" 
  },
  { 
    id: "nativeNumerals", 
    label: "Native numerals", 
    description: "Use native numerals in output script" 
  },
  { 
    id: "useDandas", 
    label: "Use dandas", 
    description: "Use dandas for punctuation" 
  },
  { 
    id: "preserveSource", 
    label: "Preserve source", 
    description: "mamtana → மம்³தந not மந்தன" 
  },
];

/**
 * Get the appropriate CSS class for a script
 */
export const getScriptClass = (script: string): string => {
  const scriptMap: Record<string, string> = {
    "Grantha": "text-grantha",
    "Tamil": "text-tamil",
    "Devanagari": "text-devanagari",
    "HK": "font-mono"
  };
  
  return scriptMap[script] || "";
};
