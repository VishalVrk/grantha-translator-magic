
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { extractTextFromImage } from "@/lib/imageProcessing";

const ImageUploadSection: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    
    if (!selectedFile) {
      return;
    }
    
    // Check if file is an image
    if (!selectedFile.type.includes("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file (jpg, png, etc).",
        variant: "destructive"
      });
      return;
    }
    
    setFile(selectedFile);
    setExtractedText("");
    
    // Create and set preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  // Handle text extraction
  const handleExtractText = async () => {
    if (!file) {
      toast({
        title: "No Image",
        description: "Please upload an image first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const result = await extractTextFromImage(file);
      
      if (result.error) {
        toast({
          title: "Extraction Error",
          description: result.error,
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      setExtractedText(result.text);
      
      toast({
        title: "Text Extracted",
        description: "Text has been successfully extracted from the image.",
      });
    } catch (error) {
      console.error("Extraction error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during text extraction.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file selection click
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <ImageIcon size={20} className="text-primary" />
          Text Extraction
        </CardTitle>
        <CardDescription>
          Upload an image containing Grantha text to extract its content
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-0">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">
                Loading text extraction service...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div 
                className={`
                  relative border-2 border-dashed rounded-lg p-4 transition-all duration-200
                  ${imagePreview ? 'border-primary/20 bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/20 hover:bg-secondary/50'}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                
                <div className="flex flex-col items-center justify-center gap-4">
                  {imagePreview ? (
                    <div className="relative w-full max-w-xs mx-auto">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="relative rounded-md overflow-hidden"
                      >
                        <motion.img
                          src={imagePreview}
                          alt="Uploaded image"
                          className="w-full h-auto object-contain max-h-[200px]"
                          initial={{ filter: "blur(8px)" }}
                          animate={{ filter: "blur(0px)" }}
                          transition={{ duration: 0.5 }}
                        />
                      </motion.div>
                      
                      <button
                        onClick={handleSelectFile}
                        className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-md hover:bg-black/80 transition-colors"
                        title="Change image"
                      >
                        <Upload size={14} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={handleSelectFile}
                      className="w-full flex flex-col items-center justify-center py-10 cursor-pointer"
                    >
                      <div className="mb-4 rounded-full bg-primary/10 p-4">
                        <Upload size={24} className="text-primary" />
                      </div>
                      <p className="text-sm font-medium">
                        <span className="text-primary">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG, or GIF (max 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <AnimatePresence>
                {imagePreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      onClick={handleExtractText}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <span className="mr-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            />
                          </span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Extract Text
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      
      <AnimatePresence>
        {extractedText && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardFooter className="flex-col items-start pt-4">
              <div className="w-full p-4 bg-secondary/50 rounded-lg">
                <h3 className="text-sm font-medium mb-2 text-muted-foreground">
                  Extracted Text:
                </h3>
                <div className="prose prose-sm max-w-none">
                  {extractedText.split('\n').map((line, index) => (
                    <p key={index}>{line || <br />}</p>
                  ))}
                </div>
              </div>
            </CardFooter>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default ImageUploadSection;
