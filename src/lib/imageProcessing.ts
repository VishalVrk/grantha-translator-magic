
/**
 * Handles image processing and text extraction
 */

const API_ENDPOINT = "https://granthabackend.onrender.com/extract_text/";

/**
 * Extract text from an image using the Grantha backend API
 */
export const extractTextFromImage = async (file: File): Promise<{
  text: string;
  error?: string;
}> => {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    // Create form data to send the image
    const formData = new FormData();
    formData.append("image", file);

    // Make the API request
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    // Parse the response with the new format
    const result = await response.json();
    return {
      text: result.grantha_text || "",
    };
  } catch (error) {
    console.error("Text extraction error:", error);
    return {
      text: "",
      error: error instanceof Error ? error.message : "Failed to extract text. Please try another image."
    };
  }
};
