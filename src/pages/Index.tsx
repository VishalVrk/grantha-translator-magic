
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransliterationForm from "@/components/TransliterationForm";
import ImageUploadSection from "@/components/ImageUploadSection";
import { toast } from "@/components/ui/use-toast";

const Index: React.FC = () => {
  const [processedText, setProcessedText] = useState("");
  const [activeTab, setActiveTab] = useState("transliteration");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading state for smooth animation
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);

    // Inform users about script requirements
    const scriptTimer = setTimeout(() => {
      toast({
        title: "Special Fonts",
        description: "This application uses Grantha, Tamil, and Devanagari scripts. Make sure the required fonts are installed for the best experience.",
        duration: 6000,
      });
    }, 1500);

    return () => {
      clearTimeout(timer);
      clearTimeout(scriptTimer);
    };
  }, []);

  const handleProcessingComplete = (text: string) => {
    setProcessedText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex flex-col">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="py-8 text-center"
      >
        <motion.h1 
          className="text-3xl md:text-4xl font-bold tracking-tight"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Grantha Text Processing Tool
        </motion.h1>
        <motion.p 
          className="mt-2 text-muted-foreground max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          A modern tool for transliterating and translating the Grantha Script
        </motion.p>
      </motion.header>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 container max-w-4xl px-4 pb-16"
      >
        <Tabs
          defaultValue="transliteration"
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-8">
            <TabsTrigger value="transliteration">Text Processing</TabsTrigger>
            <TabsTrigger value="recognition">Character Recognition</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transliteration" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white/80 backdrop-blur border border-border/40 rounded-xl p-6 shadow-sm">
                <TransliterationForm onTransliterationComplete={handleProcessingComplete} />
              </div>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="recognition" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white/80 backdrop-blur border border-border/40 rounded-xl p-6 shadow-sm">
                <ImageUploadSection />
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.main>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="py-6 border-t border-border/40 bg-white/50 backdrop-blur-sm"
      >
        <div className="container text-center text-sm text-muted-foreground">
          {/* Footer text removed as requested */}
        </div>
      </motion.footer>
    </div>
  );
};

export default Index;
