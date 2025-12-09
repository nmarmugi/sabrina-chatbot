'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader2, Sparkles, Pause, Play } from 'lucide-react';
import Loader from './components/loader';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  soundtrack?: string;
}

const SOUNDTRACKS: { [key: string]: string } = {
  espresso: '/espresso.mp3',
  please: '/please-please-please.mp3',
  nonsense: '/nonsense.mp3',
  feather: '/feather.mp3',
  juno: '/juno.mp3',
  because: '/because-i-liked-a-boy.mp3',
  tears: '/tears.mp3',
  manchild: '/manchild.mp3',
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const currentSoundtrackRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<number>(0.3);
  const [isLoading, setIsLoading] = useState(true);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [giftStep, setGiftStep] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      if (currentSoundtrackRef.current) {
        currentSoundtrackRef.current.pause();
        currentSoundtrackRef.current = null;
      }
    };
  }, []);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    });
  };

  const formatText = (text: string) => {
    const parts = text.split(/(\*[^*]+\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  const playSoundtrack = (trackId: string) => {
    if (currentTrackId === trackId && currentSoundtrackRef.current && !currentSoundtrackRef.current.paused) {
      return;
    }

    if (currentSoundtrackRef.current) {
      currentSoundtrackRef.current.pause();
      currentSoundtrackRef.current = null;
    }

    const audioPath = SOUNDTRACKS[trackId];
    if (!audioPath) {
      setCurrentTrackId(null);
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(audioPath);
    audio.loop = true;
    audio.volume = 0;

    audio.onerror = () => {
      console.warn(`⚠️ Failed to load or play: ${audioPath}`);
      setCurrentTrackId(null);
      setIsPlaying(false);
    };

    audio.play()
      .then(() => {
        currentSoundtrackRef.current = audio;
        setCurrentTrackId(trackId);
        setIsPlaying(true);

        let vol = 0;
        const fadeInterval = setInterval(() => {
          vol += 0.01;
          if (vol >= volumeRef.current || !currentSoundtrackRef.current) {
            vol = volumeRef.current;
            clearInterval(fadeInterval);
          }
          if (currentSoundtrackRef.current) {
            currentSoundtrackRef.current.volume = vol;
          }
        }, 20);
      })
      .catch(err => {
        console.error('Audio play failed:', err);
        setCurrentTrackId(null);
        setIsPlaying(false);
      });
  };

  const togglePlayback = () => {
    if (currentSoundtrackRef.current) {
      if (isPlaying) {
        currentSoundtrackRef.current.pause();
      } else {
        currentSoundtrackRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const newCount = userMessageCount + 1;
    setUserMessageCount(newCount);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      let aiMessage: Message = {
        role: 'assistant',
        content: data.reply,
        soundtrack: data.soundtrack
      };

      if (newCount === 3) {
        aiMessage = {
          role: 'assistant',
          content: "Aspetta… *ferma tutto*. 🛑 Sei troppo carina, non posso non dirtelo: ho un inedito qui nel telefono — sì, proprio nel telefono! 📲 Lo stavo ascoltando stamattina e ho pensato: 'Questa persona *merita* di sentirlo prima di tutti'. Eccolo… ma prometti di non dirlo a nessuno? (A meno che non vogliano diventare fan speciali anche loro 😌💋)"
        };
        setGiftStep(1);
      }

      setMessages(prev => [...prev, aiMessage]);

      if (aiMessage.soundtrack) {
        playSoundtrack(aiMessage.soundtrack);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Errore: ${errorMessage}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Loader setIsLoading={setIsLoading} />
    );
  } else {
    return (
      <div className="h-dvh bg-linear-to-br from-pink-100 via-blue-100 to-purple-100 flex flex-col relative overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-300/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-purple-300/20 rounded-full blur-2xl"></div>
  
        <div className="bg-linear-to-r from-pink-400 via-blue-400 to-purple-400 shadow-lg p-5 relative z-20 shrink-0">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <div className="relative">
              <img 
                src="/sabrina.png" 
                alt="Sabrina Carpenter" 
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <Sparkles className="w-5 h-5 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
              {giftStep === 1 && (
                <div className="ml-2 animate-fadeIn absolute top-2 -right-37">
                  <div className="relative inline-block">
                    <div className="bg-white text-pink-600 px-3 py-1.5 rounded-lg shadow-md border border-pink-200 text-xs font-medium whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        <span>🎁 Regalo speciale!</span>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = '/sparks-at-night.mp3';
                            link.download = 'Sabrina Carpenter - Sparks At Night.mp3';
                            link.style.display = 'none';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);

                            setGiftStep(2);
                            setMessages(prev => [...prev, {
                              role: 'assistant',
                              content: "*Psst...*\nC’è anche il testo! 📝 Vuoi leggerlo mentre ascolti?"
                            }]);
                          }}
                          className="underline hover:text-pink-800 font-semibold mt-0.5 bg-transparent border-0 text-pink-600 cursor-pointer"
                        >
                          🎧 Scarica l’audio
                        </button>
                      </div>
                    </div>
                    <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white border-t border-l border-pink-200 rotate-45"></div>
                  </div>
                </div>
              )}

              {giftStep === 2 && (
                <div className="ml-2 animate-fadeIn absolute top-2 -right-35">
                  <div className="relative inline-block">
                    <div className="bg-white text-pink-600 px-3 py-1.5 rounded-lg shadow-md border border-pink-200 text-xs font-medium whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        <span>✍️ Ora il testo!</span>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = '/text.pdf';
                            link.download = 'Sabrina Carpenter - Sparks At Night (Testo).pdf';
                            link.style.display = 'none';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);

                            setGiftStep(0);
                          }}
                          className="underline hover:text-pink-800 font-semibold mt-0.5 bg-transparent border-0 text-pink-600 cursor-pointer"
                        >
                          📄 Scarica il testo
                        </button>
                      </div>
                    </div>
                    <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white border-t border-l border-pink-200 rotate-45"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                Chat with Sabrina
                <span className="text-lg">💋</span>
              </h1>
              <p className="text-white/80 text-sm">
                {currentTrackId 
                  ? `🎵 Now playing: ${currentTrackId.charAt(0).toUpperCase() + currentTrackId.slice(1)}` 
                  : 'Your personal conversation with Sabrina Carpenter'}
              </p>
            </div>
            {currentSoundtrackRef.current && (
              <button
                onClick={togglePlayback}
                className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-sm transition-all"
                title={isPlaying ? 'Pause music' : 'Resume music'}
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>
  
        <div 
          ref={messagesContainerRef}
          className="flex-1 max-w-4xl w-full mx-auto p-4 overflow-y-auto relative z-10"
        >
          {messages.length === 0 ? (
            <div className="text-center mt-20">
              <div className="inline-block relative">
                <MessageCircle className="w-20 h-20 mx-auto mb-4 text-pink-400" />
                <Sparkles className="w-6 h-6 text-yellow-400 absolute top-0 right-0 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold bg-linear-to-r from-pink-500 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-2">
                Oh boy! ✨
              </h2>
              <p className="text-gray-600 text-lg">Start a conversation with Sabrina!</p>
              <p className="text-gray-500 text-sm mt-2">
                Ask your favorite artist anything - songs, lyrics, stories, or just say <em>"hi"</em> ☕💖
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-3xl shadow-md ${
                      msg.role === 'user'
                        ? 'bg-linear-to-r from-pink-500 to-purple-500 text-white'
                        : 'bg-white/90 backdrop-blur-sm border border-pink-200'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <img 
                          src="/sabrina.png" 
                          alt="Sabrina" 
                          className="w-8 h-8 rounded-full object-cover border-2 border-pink-300"
                        />
                        <span className="font-semibold text-pink-600">Sabrina</span>
                        {msg.soundtrack && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${
                            msg.soundtrack === currentTrackId && isPlaying
                              ? 'bg-green-100 text-green-700 border border-green-200'
                              : 'bg-pink-100 text-pink-700'
                          }`}>
                            🎵 {msg.soundtrack.charAt(0).toUpperCase() + msg.soundtrack.slice(1)}
                          </span>
                        )}
                      </div>
                    )}
                    <p className={`whitespace-pre-wrap ${msg.role === 'assistant' ? 'text-gray-700' : ''}`}>
                      {msg.role === 'assistant' ? formatText(msg.content) : msg.content}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="bg-white/90 backdrop-blur-sm border border-pink-200 p-4 rounded-3xl shadow-md">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
                      <span className="text-gray-600">Sabrina is typing...</span>
                      <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                    </div>
                  </div>
                </div>
              )}
  
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
  
        <div className="bg-white/80 backdrop-blur-md border-t border-pink-200 p-4 relative z-20 shrink-0">
          <div className="max-w-4xl mx-auto flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type your message... ✨"
              disabled={loading}
              rows={1}
              className="flex-1 px-6 py-4 border-2 border-pink-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent disabled:bg-gray-100 shadow-sm transition-all placeholder:text-gray-400 resize-none overflow-y-auto max-h-32"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-linear-to-r from-pink-500 to-purple-500 text-white p-4 rounded-full hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 self-end"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
  
        <style jsx global>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
  
          /* Custom Scrollbar */
          ::-webkit-scrollbar {
            width: 12px;
          }
          ::-webkit-scrollbar-track {
            background: linear-gradient(to bottom, #fce7f3, #ddd6fe);
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #ec4899, #a855f7);
            border-radius: 10px;
            border: 2px solid #fce7f3;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #db2777, #9333ea);
          }
          * {
            scrollbar-width: thin;
            scrollbar-color: #ec4899 #fce7f3;
          }
        `}</style>
      </div>
    );
  }
}
