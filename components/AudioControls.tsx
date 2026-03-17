'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Volume2, Loader2 } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';

const VOICES = [
  { id: 'Kore', name: 'Lady Kore', description: 'Voz suave e elegante' },
  { id: 'Charon', name: 'Barão Charon', description: 'Voz profunda e solene' },
  { id: 'Puck', name: 'Senhor Puck', description: 'Voz expressiva e teatral' },
  { id: 'Fenrir', name: 'Conde Fenrir', description: 'Voz forte e imponente' },
  { id: 'Zephyr', name: 'Duque Zephyr', description: 'Voz leve e melódica' },
];

function createWavBlob(pcmData: Uint8Array, sampleRate: number, numChannels: number): Blob {
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataSize = pcmData.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const pcmView = new Uint8Array(buffer, 44);
  pcmView.set(pcmData);

  return new Blob([buffer], { type: 'audio/wav' });
}

interface AudioControlsProps {
  text: string;
}

export default function AudioControls({ text }: AudioControlsProps) {
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingVoiceId, setLoadingVoiceId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleSelectAndTestVoice = async (voiceId: string) => {
    setLoadingVoiceId(voiceId);
    setSelectedVoice(voiceId);
    setAudioUrl(null); // Reset audio when voice changes
    handleStop();

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: 'Olá, eu sou a voz que narrará sua história.' }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceId },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const binaryString = window.atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBlob = createWavBlob(bytes, 24000, 1);
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        audio.play();
      }
    } catch (error: any) {
      console.error('Error testing voice:', error);
      if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        alert('Limite de cota excedido na API do Gemini. Por favor, tente novamente mais tarde ou verifique seu plano.');
      } else {
        alert('Erro ao testar a voz. Verifique sua chave API.');
      }
    } finally {
      setLoadingVoiceId(null);
    }
  };

  const generateAndPlay = async () => {
    if (!text) return;
    
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      // Clean up markdown for TTS
      const cleanText = text.replace(/\[(.*?)\]\(tooltip:.*?\)/g, '$1').replace(/[#*_~`]/g, '');

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: cleanText.substring(0, 4900) }] }], // Limit to ~5000 chars
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const binaryString = window.atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBlob = createWavBlob(bytes, 24000, 1);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play();
          setIsPlaying(true);
        }
      }
    } catch (error: any) {
      console.error('Error generating audio:', error);
      if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        alert('Limite de cota excedido na API do Gemini. Por favor, tente novamente mais tarde ou verifique seu plano.');
      } else {
        alert('Erro ao gerar áudio. A história pode ser muito longa ou ocorreu um erro na API.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-parchment border-ornate p-6 rounded-xl shadow-lg flex flex-col items-center gap-6 max-w-2xl mx-auto my-8">
      <h3 className="font-playfair text-2xl text-crimson mb-2">Escolha seu narrador preferido</h3>
      
      <div className="flex flex-wrap gap-4 justify-center">
        {VOICES.map((voice) => (
          <div key={voice.id} className="flex flex-col items-center gap-2">
            <button
              onClick={() => handleSelectAndTestVoice(voice.id)}
              disabled={loadingVoiceId !== null}
              className={`relative overflow-hidden px-4 py-2 rounded-full font-cormorant text-lg transition-all duration-300 border-2 ${
                selectedVoice === voice.id
                  ? 'bg-crimson text-parchment border-crimson shadow-md'
                  : 'bg-transparent text-ink border-ink/30 hover:border-crimson/50'
              }`}
            >
              {loadingVoiceId === voice.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-300/50 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
              )}
              <span className="relative z-10">{voice.name}</span>
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6 mt-4">
        <button
          onClick={isPlaying ? handlePause : generateAndPlay}
          disabled={isLoading || !text}
          className="w-16 h-16 rounded-full bg-gold text-ink flex items-center justify-center hover:bg-gold/80 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 size={32} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={32} fill="currentColor" />
          ) : (
            <Play size={32} fill="currentColor" className="ml-1" />
          )}
        </button>
        
        <button
          onClick={handleStop}
          disabled={!audioUrl}
          className="w-12 h-12 rounded-full bg-crimson/10 text-crimson flex items-center justify-center hover:bg-crimson/20 transition-colors border border-crimson/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Square size={20} fill="currentColor" />
        </button>
      </div>

      <audio 
        ref={audioRef} 
        onEnded={() => setIsPlaying(false)} 
        className="hidden" 
      />
    </div>
  );
}
