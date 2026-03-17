'use client';

import React, { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Info, Copy, Check } from 'lucide-react';

interface StoryViewerProps {
  content: string;
  moral: string;
}

export default function StoryViewer({ content, moral }: StoryViewerProps) {
  const [showMoral, setShowMoral] = useState(false);
  const [copied, setCopied] = useState(false);

  // Pre-process the content to convert [word](tooltip:definition) into a valid markdown link format
  // that react-markdown can parse without stripping it out.
  const processedContent = content.replace(/\[([^\]]+)\]\(tooltip:([^)]+)\)/g, (match, word, definition) => {
    return `[${word}](#tooltip:${encodeURIComponent(definition)})`;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(moral);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8 md:p-12 bg-parchment border-ornate relative">
      
      <div className="relative z-10">
        <div className="markdown-body font-cormorant text-xl leading-relaxed text-ink">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ node, ...props }) => <h1 className="font-playfair text-4xl md:text-5xl text-crimson text-center mb-8 pb-4 border-b-2 border-crimson/30" {...props} />,
              h2: ({ node, ...props }) => <h2 className="font-playfair text-3xl text-gold mt-8 mb-4" {...props} />,
              h3: ({ node, ...props }) => <h3 className="font-playfair text-2xl text-ink mt-6 mb-3 italic" {...props} />,
              p: ({ node, ...props }) => <p className="mb-6 text-justify" {...props} />,
              hr: ({ node, ...props }) => <hr className="my-8 border-t-2 border-crimson/20 border-dashed" {...props} />,
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-gold pl-6 py-2 my-6 italic bg-gold/5 text-2xl font-playfair" {...props} />
              ),
              a: ({ node, href, children, ...props }) => {
                if (href?.startsWith('#tooltip:')) {
                  const definition = decodeURIComponent(href.replace('#tooltip:', ''));
                  return (
                    <span className="relative inline-block group cursor-help border-b border-dashed border-crimson text-crimson">
                      {children}
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white text-ink text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 shadow-2xl font-sans border border-ink/10">
                        <span className="font-bold block mb-1 border-b border-ink/10 pb-1 flex items-center gap-1 text-crimson">
                          <Info size={14} /> Definição
                        </span>
                        {definition}
                        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"></span>
                      </span>
                    </span>
                  );
                }
                return <a href={href} className="text-crimson hover:underline" {...props}>{children}</a>;
              },
              strong: ({ node, ...props }) => <strong className="font-bold text-crimson" {...props} />,
              em: ({ node, ...props }) => <em className="italic text-gold" {...props} />,
            }}
          >
            {processedContent}
          </Markdown>
        </div>

        {moral && (
          <div className="mt-16 pt-8 border-t-4 border-double border-crimson/30">
            <button
              onClick={() => setShowMoral(!showMoral)}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-crimson/5 hover:bg-crimson/10 border border-crimson/20 rounded-lg transition-colors duration-300 font-playfair text-2xl text-crimson"
            >
              <BookOpen size={24} />
              {showMoral ? 'Ocultar a Moral da História' : 'Revelar a Moral da História'}
            </button>

            <AnimatePresence>
              {showMoral && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="p-8 mt-6 bg-[#8b6508] border-2 border-[#b8860b] rounded-xl shadow-inner relative group">
                    <button 
                      onClick={handleCopy} 
                      className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors" 
                      title="Copiar moral"
                    >
                      {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                    <h3 className="font-playfair text-3xl text-center text-white mb-6">A Moral da História</h3>
                    <div className="font-cormorant text-2xl text-white text-center italic leading-relaxed">
                      <Markdown>{moral}</Markdown>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
