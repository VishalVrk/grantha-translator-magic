
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight, Languages, FileDown, Globe, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { 
  transliterateText, 
  translateText,
  SCRIPT_OPTIONS, 
  LANGUAGE_OPTIONS,
  TRANSLITERATION_OPTIONS,
  getScriptClass, 
  downloadTextAsFile,
  TransliterationOptions
} from "@/lib/transliteration";

interface TransliterationFormProps {
  onTransliterationComplete: (text: string) => void;
}

const TransliterationForm: React.FC<TransliterationFormProps> = ({ onTransliterationComplete }) => {
  const [inputText, setInputText] = useState("");
  const [sourceScript, setSourceScript] = useState("Grantha");
  const [targetScript, setTargetScript] = useState("Tamil");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("ta");
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputText, setOutputText] = useState("");
  const [activeTab, setActiveTab] = useState("transliterate");
  const [options, setOptions] = useState<TransliterationOptions>({});
  const [showOptions, setShowOptions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Adjust textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputText]);

  // Handle option change
  const handleOptionChange = (optionId: keyof TransliterationOptions, value: boolean) => {
    setOptions(prev => ({
      ...prev,
      [optionId]: value
    }));
  };

  // Swap source and target scripts
  const handleSwapScripts = () => {
    setSourceScript(targetScript);
    setTargetScript(sourceScript);
  };

  // Swap source and target languages
  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
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

    setIsProcessing(true);

    try {
      const result = await transliterateText({
        text: inputText,
        sourceScript,
        targetScript,
        options
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
      setIsProcessing(false);
    }
  };

  // Handle translation
  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Empty Text",
        description: "Please enter some text to translate.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const result = await translateText({
        text: inputText,
        sourceLanguage,
        targetLanguage,
        sourceScript // Pass the source script to handle Grantha properly
      });

      if (result.error) {
        toast({
          title: "Translation Error",
          description: result.error,
          variant: "destructive"
        });
        return;
      }

      setOutputText(result.translatedText);
      onTransliterationComplete(result.translatedText);
      
      toast({
        title: "Translation Complete",
        description: "Text has been successfully translated.",
      });
    } catch (error) {
      console.error("Translation error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (!outputText) {
      toast({
        title: "No Output",
        description: "There is no processed text to download.",
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

  // Process text based on active tab
  const handleProcessText = () => {
    if (activeTab === "transliterate") {
      handleTransliterate();
    } else {
      handleTranslate();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-6"
    >
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="transliterate" className="flex items-center gap-2">
            <Languages size={16} />
            Transliterate
          </TabsTrigger>
          <TabsTrigger value="translate" className="flex items-center gap-2">
            <Globe size={16} />
            Translate
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transliterate" className="space-y-4">
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

          {/* Transliteration Options Button */}
          <div className="flex justify-end">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <Settings size={16} />
                  Output Options ({Object.values(options).filter(Boolean).length} active)
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-4" align="end">
                <h3 className="text-sm font-medium mb-3">Transliteration Options</h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {TRANSLITERATION_OPTIONS.slice(0, 10).map((option) => (
                    <div key={option.id} className="flex items-start space-x-2">
                      <Checkbox 
                        id={option.id} 
                        checked={!!options[option.id as keyof TransliterationOptions]}
                        onCheckedChange={(checked) => 
                          handleOptionChange(
                            option.id as keyof TransliterationOptions, 
                            checked as boolean
                          )
                        }
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor={option.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {option.label}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Switch options for the bottom three */}
                  {TRANSLITERATION_OPTIONS.slice(10).map((option) => (
                    <div key={option.id} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label
                          htmlFor={option.id}
                          className="text-sm font-medium"
                        >
                          {option.label}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                      <Switch
                        id={option.id}
                        checked={!!options[option.id as keyof TransliterationOptions]}
                        onCheckedChange={(checked) => 
                          handleOptionChange(
                            option.id as keyof TransliterationOptions, 
                            checked
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </TabsContent>

        <TabsContent value="translate" className="space-y-4">
          <div className="relative">
            <Globe className="absolute top-3 left-3 text-muted-foreground" size={20} />
            <Textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to translate..."
              className="min-h-[150px] pl-10 pr-4 py-3 resize-none transition-all duration-200 font-medium text-lg"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <label htmlFor="sourceLanguage" className="text-sm font-medium text-muted-foreground">
                Source Language
              </label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select source language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((option) => (
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
                onClick={handleSwapLanguages}
                className="rounded-full"
              >
                <ArrowLeftRight size={18} />
              </Button>
            </motion.div>

            <div className="flex-1 space-y-2">
              <label htmlFor="targetLanguage" className="text-sm font-medium text-muted-foreground">
                Target Language
              </label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select target language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center gap-4">
        <Button
          onClick={handleProcessText}
          disabled={isProcessing}
          className="w-40 transition-all duration-300"
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
              {activeTab === "transliterate" ? "Processing..." : "Translating..."}
            </>
          ) : (
            activeTab === "transliterate" ? "Transliterate" : "Translate"
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
              <h3 className="text-sm font-medium mb-2 text-muted-foreground">
                {activeTab === "transliterate" ? "Transliterated Output:" : "Translated Output:"}
              </h3>
              <div className={`whitespace-pre-wrap text-lg ${activeTab === "transliterate" ? getScriptClass(targetScript) : ""}`}>
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
