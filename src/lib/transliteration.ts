
/**
 * Handles transliteration between different scripts
 */

interface TransliterationParams {
  text: string;
  sourceScript: string;
  targetScript: string;
}

interface TransliterationResult {
  transliteratedText: string;
  error?: string;
}

/**
 * Transliterate text from one script to another using the Aksharamukha API
 */
export const transliterateText = async ({
  text,
  sourceScript,
  targetScript,
}: TransliterationParams): Promise<TransliterationResult> => {
  if (!text.trim()) {
    return { transliteratedText: "", error: "Please enter some text to transliterate" };
  }

  try {
    const response = await fetch(
      `https://aksharamukha-plugin.appspot.com/api/public?source=${sourceScript}&target=${targetScript}&text=${encodeURIComponent(text)}`
    );
    
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
