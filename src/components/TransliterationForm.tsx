
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight, Languages, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { transliterateText, SCRIPT_OPTIONS, getScriptClass, downloadTextAsFile } from "@/lib/transliteration";

interface TransliterationFormProps {
  onTransliterationComplete: (text: string) => void;
}

const TransliterationForm: React.FC<TransliterationFormProps> = ({ onTransliterationComplete }) => {
  const [inputText, setInputText] = useState("");
  const [sourceScript, setSourceScript] = useState("Grantha");
  const [targetScript, setTargetScript] = useState("Tamil");
  const [isTransliterating, setIsTransliterating] = useState(false);
  const [outputText, setOutputText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Adjust textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputText]);

  // Swap source and target scripts
  const handleSwapScripts = () => {
    setSourceScript(targetScript);
    setTargetScript(sourceScript);
  };

  // Handle transliteration
  const handleTransliterate = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Empty Text",
        description: "Please enter some text to transliterate.",
        variant: "destructive"
      });
      return;
    }

    setIsTransliterating(true);

    try {
      const result = await transliterateText({
        text: inputText,
        sourceScript,
        targetScript
      });

      if (result.error) {
        toast({
          title: "Transliteration Error",
          description: result.error,
          variant: "destructive"
        });
        return;
      }

      setOutputText(result.transliteratedText);
      onTransliterationComplete(result.transliteratedText);
      
      toast({
        title: "Transliteration Complete",
        description: "Text has been successfully transliterated.",
      });
    } catch (error) {
      console.error("Transliteration error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTransliterating(false);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (!outputText) {
      toast({
        title: "No Output",
        description: "There is no transliterated text to download.",
        variant: "destructive"
      });
      return;
    }

    downloadTextAsFile(outputText);
    
    toast({
      title: "Download Started",
      description: "Your file is being downloaded.",
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-6"
    >
      <div className="space-y-4">
        <div className="relative">
          <Languages className="absolute top-3 left-3 text-muted-foreground" size={20} />
          <Textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to transliterate..."
            className={`min-h-[150px] pl-10 pr-4 py-3 resize-none transition-all duration-200 font-medium text-lg ${getScriptClass(sourceScript)}`}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-2">
            <label htmlFor="sourceScript" className="text-sm font-medium text-muted-foreground">
              Source Script
            </label>
            <Select value={sourceScript} onValueChange={setSourceScript}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select source script" />
              </SelectTrigger>
              <SelectContent>
                {SCRIPT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="pt-7"
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleSwapScripts}
              className="rounded-full"
            >
              <ArrowLeftRight size={18} />
            </Button>
          </motion.div>

          <div className="flex-1 space-y-2">
            <label htmlFor="targetScript" className="text-sm font-medium text-muted-foreground">
              Target Script
            </label>
            <Select value={targetScript} onValueChange={setTargetScript}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select target script" />
              </SelectTrigger>
              <SelectContent>
                {SCRIPT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button
          onClick={handleTransliterate}
          disabled={isTransliterating}
          className="w-40 transition-all duration-300"
        >
          {isTransliterating ? (
            <>
              <span className="mr-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              </span>
              Transliterating
            </>
          ) : (
            "Transliterate"
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={handleDownload}
          disabled={!outputText}
          className="w-40"
        >
          <FileDown size={18} className="mr-2" />
          Download
        </Button>
      </div>

      <AnimatePresence>
        {outputText && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-secondary/50 border rounded-lg">
              <h3 className="text-sm font-medium mb-2 text-muted-foreground">Transliterated Output:</h3>
              <div className={`whitespace-pre-wrap text-lg ${getScriptClass(targetScript)}`}>
                {outputText}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TransliterationForm;
