'use client';

import React, { useState, useEffect } from 'react';
import { Feather, Sparkles, BookMarked, History } from 'lucide-react';
import { motion } from 'motion/react';
import StoryViewer from '@/components/StoryViewer';
import AudioControls from '@/components/AudioControls';
import { STORIES, Story } from '@/data/stories';

export default function Home() {
  const [story, setStory] = useState<Story | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('moralDaHistoria_saved');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Use a timeout to avoid synchronous setState in effect
        setTimeout(() => {
          setSavedStories(parsed);
        }, 0);
      } catch (e) {
        console.error("Error parsing saved stories", e);
      }
    }
  }, []);

  const saveToHistory = (newStory: Story) => {
    const exists = savedStories.some(s => s.id === newStory.id);
    if (!exists) {
      const updated = [newStory, ...savedStories];
      setSavedStories(updated);
      localStorage.setItem('moralDaHistoria_saved', JSON.stringify(updated));
    }
  };

  const generateStory = () => {
    setIsGenerating(true);
    setStory(null);
    setShowHistory(false);

    // Simulate a brief "conjuring" delay to show the new animation
    setTimeout(() => {
      // Pick a random story from the local DB
      const randomIndex = Math.floor(Math.random() * STORIES.length);
      const selectedStory = STORIES[randomIndex];
      
      setStory(selectedStory);
      saveToHistory(selectedStory);
      setIsGenerating(false);
    }, 2000);
  };

  const loadStory = (selectedStory: Story) => {
    setStory(selectedStory);
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-gold/20 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-crimson/10 blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center">
        
        <div className="text-center mb-12">
          <h1 className="font-playfair text-5xl md:text-7xl text-crimson mb-4 drop-shadow-sm">
            Moral da História
          </h1>
          <p className="font-cormorant text-2xl text-ink/80 italic max-w-2xl mx-auto">
            &quot;Cada dia uma nova página, cada conto uma nova lente para enxergar a vida.&quot;
          </p>
        </div>

        {!story && !isGenerating && !showHistory && (
          <div className="bg-parchment border-ornate p-12 rounded-xl shadow-2xl max-w-2xl text-center my-12 transform hover:scale-[1.02] transition-transform duration-500">
            <Feather size={48} className="mx-auto text-gold mb-6 opacity-80" />
            <h2 className="font-playfair text-3xl text-ink mb-6">Bem-vindo ao seu refúgio literário</h2>
            <p className="font-cormorant text-xl text-ink/80 mb-8 leading-relaxed">
              Permita-se uma pausa. Clique no botão abaixo para que as musas sussurrem uma história inédita, tecida com palavras raras e coroada com uma reflexão para a alma.
            </p>
            <button
              onClick={generateStory}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 font-playfair text-xl text-parchment bg-crimson hover:bg-crimson/90 rounded-sm overflow-hidden transition-all shadow-[0_0_15px_rgba(139,0,0,0.5)] hover:shadow-[0_0_25px_rgba(139,0,0,0.7)]"
            >
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
              <Sparkles className="transition-transform duration-300 group-hover:scale-125 group-hover:animate-[sparkle-pulse_1.5s_ease-in-out_infinite]" size={20} />
              <span>Conjurar Nova História</span>
            </button>
          </div>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center my-24 space-y-8">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 bg-parchment border-2 border-gold/50 rounded-sm shadow-inner transform rotate-3"></div>
              <motion.div
                animate={{ 
                  x: [-10, 15, -5, 10, -10],
                  y: [0, -5, 5, -2, 0],
                  rotate: [-15, 5, -10, 15, -15]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 text-crimson"
              >
                <Feather size={56} />
              </motion.div>
            </div>
            <p className="font-playfair text-2xl text-ink animate-pulse">As penas estão a escrever...</p>
          </div>
        )}

        {story && !isGenerating && !showHistory && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={generateStory}
                className="group flex items-center gap-2 px-6 py-3 font-playfair text-lg text-crimson bg-transparent border-2 border-crimson/30 hover:border-crimson hover:bg-crimson/5 rounded-full transition-all"
              >
                <Sparkles className="group-hover:animate-pulse" size={18} />
                <span>Ler Outra História</span>
              </button>
            </div>
            
            <AudioControls text={story.content} />
            <StoryViewer content={story.content} moral={story.moral} />
          </div>
        )}

        {showHistory && (
          <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="bg-parchment border-ornate p-8 rounded-xl shadow-xl">
              <div className="flex items-center justify-between mb-8 border-b-2 border-crimson/20 pb-4">
                <h2 className="font-playfair text-3xl text-crimson flex items-center gap-3">
                  <BookMarked size={28} />
                  Seu Acervo Pessoal
                </h2>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="text-ink/60 hover:text-crimson font-cormorant text-lg transition-colors"
                >
                  Voltar
                </button>
              </div>
              
              {savedStories.length === 0 ? (
                <p className="font-cormorant text-xl text-ink/70 text-center py-12 italic">
                  Sua biblioteca ainda está vazia. Conjure uma história para começar seu acervo.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {savedStories.map((s, idx) => (
                    <button
                      key={`${s.id}-${idx}`}
                      onClick={() => loadStory(s)}
                      className="text-left p-4 border border-gold/30 rounded-lg hover:bg-gold/10 transition-colors group flex flex-col gap-2"
                    >
                      <span className="font-playfair text-xl text-ink group-hover:text-crimson transition-colors">
                        {s.title}
                      </span>
                      <span className="font-cormorant text-sm text-ink/60 italic">
                        {s.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer / History Toggle */}
        {!isGenerating && (
          <div className="mt-16 text-center flex flex-col items-center gap-6">
            <div className="font-cormorant text-ink/80 italic text-lg">
              Criado por Dan F. Souza (danfreitaz), com carinho para sua mãe Iêda Carla 💕
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="inline-flex items-center gap-2 text-ink/60 hover:text-crimson font-cormorant text-xl transition-colors"
            >
              <History size={20} />
              {showHistory ? 'Ocultar Acervo' : 'Ver Histórias Salvas'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
