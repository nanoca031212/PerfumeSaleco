"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Trophy, DollarSign } from "lucide-react"
import Image from "next/image"
import PriceAnchoring from "@/components/price-anchoring"
import styles from '@/styles/animations.module.css'
import { trackQuizStep } from "@/lib/utils"
import { useRouter } from 'next/router'
import { useCart } from '@/contexts/CartContext'

// Add animated border keyframes for progress
const progressBarStyles = `
  @keyframes progress {
    from { width: 100%; }
    to { width: 0%; }
  }
  
  @keyframes progressReverse {
    from { width: 0%; }
    to { width: 100%; }
  }

  @keyframes borderGlow {
    0% {
      border-color: #ff0000;
      box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
    }
    25% {
      border-color: #ff6600;
      box-shadow: 0 0 20px rgba(255, 102, 0, 0.5);
    }
    50% {
      border-color: #ffff00;
      box-shadow: 0 0 20px rgba(255, 255, 0, 0.5);
    }
    75% {
      border-color: #ff6600;
      box-shadow: 0 0 20px rgba(255, 102, 0, 0.5);
    }
    100% {
      border-color: #ff0000;
      box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
    }
  }

  @keyframes discountShine {
    0% {
      background-position: -100% 0;
    }
    100% {
      background-position: 100% 0;
    }
  }

  .discount-progress-bar {
    background: linear-gradient(90deg, #1eff00, #49d610);
    background-size: 200% 100%;
    animation: discountShine 2s ease-in-out infinite right;
    position: relative;
    overflow: hidden;
  }

  .discount-progress-bar::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: discountShine 2s ease-in-out infinite;
  }

  .animated-border {
    position: relative;
    overflow: hidden;
  }

  .animated-border::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #ff0000, #ff6600, #ffff00, #ff6600, #ff0000);
    background-size: 300% 300%;
    border-radius: 14px;
    z-index: -1;
    animation: borderAnimation 3s ease-in-out infinite;
  }

  @keyframes borderAnimation {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  .progress-container {
    width: 100%;
    height: 8px;
    background-color: #e5e7eb;
    border-radius: 9999px;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(to right, #ca2020, #ff0000);
    border-radius: 9999px;
    transition: width 0.1s linear;
  }
`

// Declare tipos globais para os pixels
declare global {
  interface Window {
    TiktokAnalyticsObject?: string;
    ttq?: any;
    pixelId?: string;
  }
}

interface Question {
  id: number
  question: string
  options: string[]
  correct: number
  explanation: string
}

const questions: Question[] = [
  {
    id: 1,
    question: "When choosing the perfect perfume, what matters most to you?",
    options: ["The scent / fragrance notes 🌸", "How long it lasts on the skin ⏳", "The brand ✨", "The price 💷"],
    correct: 0,
    explanation: "The fragrance notes are the heart of any great perfume!",
  },
  {
    id: 2,
    question: "Where do you usually discover new perfumes?",
    options: ["In physical stores 🏬", "On social media 📱", "Through online ads 💻", "From friends or family 👥"],
    correct: 0,
    explanation: "Physical stores offer the best experience to test and discover new scents!",
  },
  {
    id: 3,
    question: "How often do you buy a new perfume?",
    options: ["Once a year", "Two to three times a year", "Every season (four times a year)", "Monthly or more"],
    correct: 0,
    explanation: "Taking time to choose the perfect perfume makes each purchase special!",
  },
  {
    id: 4,
    question: "What influences your decision the most when buying a new perfume?",
    options: ["Recommendations from friends or family", "Online reviews", "Testing in store", "Promotions or discounts"],
    correct: 0,
    explanation: "Personal recommendations from trusted people are invaluable when choosing fragrances!",
  },
  {
    id: 5,
    question: "Which type of promotion interests you the most?",
    options: ["Direct discount on price", "Multi-product kits", "Free samples with purchase", "Cashback or loyalty points"],
    correct: 0,
    explanation: "Direct discounts provide immediate value on your favorite fragrances!",
  },
  {
    id: 6,
    question: "Do you usually buy perfumes more for yourself or as gifts?",
    options: ["For myself 🎁", "As a gift 🎀", "Both equally ⚖️", "Depends on the occasion 🗓️"],
    correct: 0,
    explanation: "Treating yourself to a beautiful fragrance is always a wonderful choice!",
  },
]

// Enhanced notification component with better animations
const SuccessNotification = ({ show, onClose }: { show: boolean; onClose: () => void }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      setProgress(100)
      
      // Update progress every 100ms for smoother animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(progressInterval)
            return 0
          }
          return prev - 2 // Decrease 2% every 100ms = 5 seconds total
        })
      }, 100)
      
      const timer = setTimeout(() => {
        setIsExiting(true)
        setTimeout(() => {
          setIsVisible(false)
          setTimeout(() => {
            onClose()
            setIsExiting(false)
            setProgress(100) // Reset progress
          }, 500) // Increased exit animation time
        }, 200)
      }, 5000) // Increased display time to 5 seconds

      return () => {
        clearTimeout(timer)
        clearInterval(progressInterval)
      }
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-700 transform ${
        isVisible && !isExiting 
          ? "translate-x-0 opacity-100 scale-100" 
          : "translate-x-full opacity-0 scale-95"
      }`}
    >
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 border border-green-400 backdrop-blur-sm">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
          <DollarSign className="h-8 w-8 text-green-500 animate-bounce" />
        </div>
        <div>
          <p className="font-bold text-lg">Congratulations! 🎉</p>
          <p className="text-sm opacity-90">You've earned a £20 discount!</p>
        </div>
        <button 
          onClick={onClose}
          className="ml-2 text-white hover:text-gray-200 transition-colors duration-200"
          aria-label="Close notification"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="absolute bottom-0 left-0 h-1 bg-green-300 rounded-b-xl" style={{ 
          width: `${progress}%`,
          transition: 'width 0.1s linear'
        }}></div>
      </div>
    </div>
  )
}

// Falling hearts component
const FallingHeart = ({ delay }: { delay: number }) => (
  <div 
    className={`absolute text-red-500 text-2xl pointer-events-none ${styles.fall}`}
    style={{
      left: `${Math.random() * 100}%`,
      top: '-50px',
      animationDelay: `${delay}ms`
    }}
  >
    ❤️
  </div>
)

// Chelsea lion icon component
const ChelseaLionIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-8 h-8"
    fill="currentColor"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);



// Loading component for better UX
const LoadingSpinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }
  
  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-[#f00] border-t-white`}></div>
  )
}

const ImageCarousel = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = ["/per1.png", "/per2.png", "/per3.png", "/per4.png", "/per5.png", "/per6.png", "/per7.png", "/per8.png", "/per9.png", "/per10.png", "/per11.png"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full" style={{ paddingBottom: '75%' }}>
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        {images.map((image, index) => (
          <Image
            key={index}
            src={image}
            alt={`WWE SummerSlam Image ${index + 1}`}
            fill
            className={`object-cover transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ borderRadius: '25px' }}
          />
        ))}
      </div>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentImageIndex 
                ? 'bg-white shadow-lg' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};


// Componente de vídeo simplificado
const VideoPlayer = React.memo(({ isReady }: { isReady: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showMuteButton, setShowMuteButton] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const forcePlay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {
            console.log("Unable to start video automatically");
          });
        });
      }
    };

    forcePlay();
    video.addEventListener('canplay', forcePlay);
    video.addEventListener('loadeddata', forcePlay);
    setTimeout(forcePlay, 1000);

    return () => {
      video.removeEventListener('canplay', forcePlay);
      video.removeEventListener('loadeddata', forcePlay);
    };
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      if (videoRef.current.muted) {
        // Disparar vsl_view apenas na primeira vez que desmuta
        trackQuizStep('vsl_view');
      }
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
      if (!videoRef.current.muted) {
        // If unmuted, hide button after small delay
        setTimeout(() => {
          setShowMuteButton(false);
        }, 500);
      }
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
      <video
        ref={videoRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '25px'
        }}
        autoPlay
        playsInline
        controls={false}
        preload="auto"
        src="videos/vsl.mp4"
      />
      {showMuteButton && (
        <button
          onClick={toggleMute}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            background: 'rgba(0, 0, 0, 0.6)',
            border: 'none',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            transition: 'opacity 0.3s ease'
          }}
        >
          {isMuted ? (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

// Componente de Layout para os scripts simplificado - removido pois já está no layout global
// const PixelScripts = () => (
//   <>
//   </>
// );

// Hook para controlar o carregamento dos pixels - simplificado
const usePixelLoader = () => {
  const [isPixelsReady, setPixelsReady] = useState(false);
  const pixelsInitialized = useRef(false);

  useEffect(() => {
    if (pixelsInitialized.current) {
      setPixelsReady(true);
      return;
    }

    // Verifica se os pixels estão carregados (Facebook no layout global)
    const checkPixels = () => {
      return typeof window.fbq === 'function' && typeof window.ttq !== 'undefined' && window.ttq;
    };

    // Função que verifica os pixels
    const checkAll = () => {
      if (checkPixels()) {
        setPixelsReady(true);
        pixelsInitialized.current = true;
        clearInterval(checkInterval);
      }
    };

    // Inicia verificação periódica
    const checkInterval = setInterval(checkAll, 500);

    // Timeout de segurança após 5 segundos
    const timeoutId = setTimeout(() => {
      setPixelsReady(true);
      pixelsInitialized.current = true;
      clearInterval(checkInterval);
    }, 5000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeoutId);
    };
  }, []);

  return isPixelsReady;
};

// Rastrear visualização da VSL removido do carregamento automático
const useTrackVSLView = () => {
  // Evento agora é disparado no toggleMute do VideoPlayer
};

// Hook personalizado para gerenciar elementos escondidos (não é mais necessário)
function useDelayedElements() {
  // O delay agora é controlado pelo VTurb
  return null;
}

const useAudioSystem = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAudio = () => {
      try {
        if (!audioRef.current) {
          const audio = new Audio("https://cdn.shopify.com/s/files/1/0946/2290/8699/files/notifica_o-venda.mp3?v=1749150271");
          audio.preload = "auto";
          audio.volume = 1;
          audioRef.current = audio;

          // Inicializa o contexto de áudio para dispositivos móveis
          const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
          if (AudioContext) {
            const audioContext = new AudioContext();
            if (audioContext.state === "suspended") {
              audioContext.resume();
            }
          }
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    // Inicializa na primeira interação
    const handleFirstInteraction = () => {
      initializeAudio();
      document.removeEventListener("touchstart", handleFirstInteraction);
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };

    document.addEventListener("touchstart", handleFirstInteraction, { passive: true });
    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);

    return () => {
      document.removeEventListener("touchstart", handleFirstInteraction);
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

  const playSound = useCallback(() => {
    try {
      if (audioRef.current && isInitialized) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(error => {
          console.error('Error playing sound:', error);
        });
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, [isInitialized]);

  return { playSound, isInitialized };
};

// Componente do painel USP - versão minimalista Adidas
const USPPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-20 flex items-start justify-center">
      <div className="bg-white w-full max-w-4xl mt-12 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4">
          <div className="text-xs font-medium uppercase tracking-[0.25em] text-black">WWE SummerSlam</div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-50 transition-colors duration-150"
            aria-label="Close"
          >
            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-3 gap-px bg-gray-100">
          {/* History */}
          <div className="p-12 text-center bg-white">
            <div className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-6">Since 1988</div>
            <div className="text-sm text-gray-900 mb-2 leading-relaxed">
              The Biggest Party
            </div>
            <div className="text-xs text-gray-500">
              Of The Summer
            </div>
          </div>

          {/* Achievements */}
          <div className="p-12 text-center bg-white">
            <div className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-6">Legend</div>
            <div className="text-sm text-gray-900 mb-2 leading-relaxed">
              John Cena
            </div>
            <div className="text-xs text-gray-500">
              Farewell Tour
            </div>
          </div>

          {/* Legacy */}
          <div className="p-12 text-center bg-white">
            <div className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-6">Champion</div>
            <div className="text-sm text-gray-900 mb-2 leading-relaxed">
              Cody Rhodes
            </div>
            <div className="text-xs text-gray-500">
              American Nightmare
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 text-center">
          <div className="text-xs text-gray-400 uppercase tracking-[0.2em]">The Biggest Event of the Summer</div>
        </div>
      </div>
    </div>
  )
}



// Componente do ícone de coração moderno
const HeartIcon = ({ isLiked, onClick }: { isLiked: boolean; onClick: () => void }) => {
  const [showBurst, setShowBurst] = useState(false);
  
  const handleClick = () => {
    onClick();
    if (!isLiked) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 700);
    }
  };

  return (
    <div className="relative">
      {showBurst && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`absolute w-full h-full ${styles.heartBurst}`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-red-500 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 60}deg) translateY(-10px)`,
                }}
              />
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
};

// Componente do ícone do Trustpilot
const TrustpilotStars = () => (
  <div className="flex items-center space-x-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg key={star} className="w-4 h-4 text-[#00b67a]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ))}
  </div>
);

// Modificar o CompleteHeader para incluir o carrossel na posição correta
const CompleteHeader = ({ onUSPClick }: { onUSPClick: () => void }) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <header data-auto-id="header" className="bg-white font-size-12 border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      {/* Logo Section - Nova seção no topo */}
      <div className="w-full bg-black border-b border-gray-100 py-3">
        <div className="flex justify-center">
          <a href="#" aria-label="Homepage" className="flex items-center hover:opacity-80 transition-opacity duration-200" data-auto-id="logo">
            <img src="/logo.avif" alt="Drapeau France" className="w-30 h-10" />
          </a>
        </div>
      </div>

      {/* USP Bar */}
     <div className="w-full bg-[#e7071d] border-b border-gray-200 transition-colors duration-200 py-2 group">
      <div className="flex items-center justify-center space-x-2 px-4">
        <div className="text-sm font-medium text-[#ffffff] uppercase tracking-wide">
Take the perfume quiz and get up to £120 off
        </div>
      </div>
     </div>
    </header>
  );
};

// Remover o MinimalHeader e USPHeader antigos e usar apenas o CompleteHeader
export default function WWESummerSlamQuiz() {
  const router = useRouter()
  const { addItem, setIsOpen } = useCart()
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUSPPanel, setShowUSPPanel] = useState(false);

  // Add styles to document head
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = progressBarStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const isPixelsReady = usePixelLoader()
  const { playSound, isInitialized: audioInitialized } = useAudioSystem();
  const [progressValue, setProgressValue] = useState(100);
  const progressTimer = useRef<NodeJS.Timeout | null>(null);

  // Remover o useEffect que adiciona os estilos
  useEffect(() => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
    }

    if (gameStarted && !quizCompleted) {
      progressTimer.current = setInterval(() => {
        setProgressValue(prev => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            if (progressTimer.current) {
              clearInterval(progressTimer.current);
            }
            // Avança automaticamente para a próxima pergunta quando o tempo acabar
            handleAnswer();
            return 100;
          }
          return newValue;
        });
      }, 100); // 10 seconds total (100 * 100ms = 10000ms)
    }

    return () => {
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
    };
  }, [gameStarted, currentQuestion, quizCompleted]);

  // Reset progress quando mudar de pergunta
  useEffect(() => {
    setProgressValue(100);
    
    // Rastrear visualização da pergunta quando gameStarted está true
    if (gameStarted && !quizCompleted) {
      trackQuizStep('question_viewed', currentQuestion + 1);
    }
  }, [currentQuestion, gameStarted, quizCompleted]);

  // Debug para verificar o estado
  useEffect(() => {
    console.log('showUSPPanel state changed:', showUSPPanel)
  }, [showUSPPanel])

  // Usar o hook de delay
  const delayedElements = useDelayedElements()

  // Função para abrir o painel USP
  const handleUSPClick = () => {
    console.log('handleUSPClick called')
    setShowUSPPanel(true)
  }

  // Função para fechar o painel USP
  const handleUSPClose = () => {
    console.log('handleUSPClose called')
    setShowUSPPanel(false)
  }

  // Modificar a função de início do quiz com loading e scroll automático
  const handleStartQuiz = () => {
    setIsLoading(true)
    trackQuizStep('quiz_start'); // Rastrear início do quiz
    
    // Simular um pequeno delay para melhor UX
    setTimeout(() => {
      setGameStarted(true)
      setIsLoading(false)
      // Scroll automático para o topo ao iniciar quiz
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 800)
  }

  // Função para lidar com o clique no botão de compra
  const handleBuyNowClick = (selectedKit: string) => {
    trackQuizStep('go_to_store'); // Evento final - ir para a loja
    
    // Garantir que o carrinho esteja fechado para não atrapalhar a navegação
    setIsOpen(false);
    
    // Redirecionar para a loja
    router.push('/');
  }

  // Modificar a função de resposta com loading e scroll automático
  const handleAnswer = () => {
    if (isSubmitting) return
    
    // Verificar se temos uma pergunta válida
    if (currentQuestion < 0 || currentQuestion >= questions.length) {
      console.error('Current question index out of bounds:', currentQuestion, 'Total questions:', questions.length);
      return;
    }
    
    const currentQuestionData = questions[currentQuestion];
    if (!currentQuestionData) {
      console.error('Pergunta atual não encontrada');
      return;
    }
    
    // Verificar se uma resposta foi selecionada
    if (selectedAnswer === '' || selectedAnswer === null) {
      console.warn('No answer selected, skipping...');
      return;
    }
    
    setIsSubmitting(true)
    const isCorrect = Number.parseInt(selectedAnswer) === currentQuestionData.correct
    const questionNumber = currentQuestion + 1

    // Sempre incrementar o contador, independente da resposta estar correta
    setCorrectAnswers(prev => {
      const newValue = prev + 1;
      console.log('Discount updated:', newValue);
      return newValue;
    });

    // Tracking de eventos - rastrear cada pergunta
    trackQuizStep('question_answered', questionNumber, isCorrect);
    
    // Sempre mostrar a notificação
    setShowNotification(true);
    playSound();

    // Avançar diretamente para a próxima pergunta ou finalizar o quiz
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1)
        setSelectedAnswer("")
        // Scroll automático para o topo ao avançar pergunta
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setQuizCompleted(true)
        trackQuizStep('quiz_completed'); // Rastrear conclusão do quiz
        // Scroll automático para o topo ao completar quiz
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setIsSubmitting(false)
    }, 600)
  }

  // Modificar nextQuestion com loading
  const nextQuestion = () => {
    setIsLoading(true)
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1)
        setSelectedAnswer("")
      } else {
        setQuizCompleted(true)
        trackQuizStep('quiz_completed'); // Rastrear conclusão do quiz
      }
      setIsLoading(false)
    }, 400)
  }

  const handleRestart = () => {
    trackQuizStep('quiz_restart'); // Rastrear reinício do quiz
    setGameStarted(false);
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setCorrectAnswers(0);
    setQuizCompleted(false);
    setShowNotification(false);
    // Scroll automático para o topo ao reiniciar quiz
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const discount = correctAnswers * 20
  const originalPrice = 170.00
  const finalPrice = Math.max(originalPrice - discount, 49.99)

  useTrackVSLView(); // Comentado junto com o VSL

  // Rastrear visualização da página final
  useEffect(() => {
    if (quizCompleted) {
      trackQuizStep('final_page_viewed');
    }
  }, [quizCompleted]);

  // Initial screen with the president
  if (!gameStarted) {
    return (
      <>
        <div className="min-h-screen bg-white flex flex-col">
          <CompleteHeader onUSPClick={handleUSPClick} />
          <USPPanel isOpen={showUSPPanel} onClose={handleUSPClose} />
          <div className="flex-grow">
            <div className="container mx-auto pt-20 gap-10">
              <div className="text-center mb-10 animate-fadeIn">
                <h1 className="text-4xl font-normal font-product-sans text-gray-900">Message from The Perfume Shop CEO</h1>
              </div>
              
              <div className="space-y-14">
                <div className="animate-scaleIn">
                  {/* <VideoPlayer isReady={true} /> */}
                  <VideoPlayer isReady={true} />
                </div>

                <div className="bg-black font-product-sans border-[2px] border-[#f00] p-3 shadow-sm animate-slideIn animated-border">
                  <blockquote className="text-xl md:text-lg text-[#ffffff] text-center leading-relaxed">
                    "Answer 6 questions about your perfume preferences and get £120 off a set of perfumes."
                  </blockquote>
                </div>

                <Button
                  onClick={handleStartQuiz}
                  disabled={isLoading}
                  className="w-full bg-black border-2 border-[#f00] hover:border-[#f00] hover:bg-[#f00] text-white hover:text-white text-xl py-7 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-4"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="md" />
                      Starting Quiz...
                    </>
                  ) : (
                    <>
                      <Trophy className="h-6 w-6" />
                      Start Quiz
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (quizCompleted) {
    return (
      <>
        <div className="min-h-screen bg-white flex flex-col">
          <CompleteHeader onUSPClick={handleUSPClick} />
          <USPPanel isOpen={showUSPPanel} onClose={handleUSPClose} />
          <div className="flex-grow container mx-auto">
            <div className="space-y-4">
              <div className="transform transition-all duration-500">
                <PriceAnchoring correctAnswers={correctAnswers} onBuyClick={handleBuyNowClick} />
              </div>

              <div className="flex flex-col gap-4">
                {/* Discount progress bar */}
                <DiscountProgressBar correctAnswers={correctAnswers} />
                
              </div>
            </div>
          </div>

        </div>
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col">
        <CompleteHeader onUSPClick={handleUSPClick} />
        <USPPanel isOpen={showUSPPanel} onClose={handleUSPClose} />
        <div className="flex-grow container mx-auto px-1 py-4">
          <SuccessNotification show={showNotification} onClose={() => setShowNotification(false)} />

          <div className="w-full max-w-2xl mx-auto space-y-18">
            <div className="mb-6 animate-fadeIn">
              <div className="flex justify-center mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Your discount</p>
                  <p className={`text-2xl font-bold text-[#1bca32] transform transition-all duration-500 ${
                    correctAnswers > 0 ? 'scale-125 animate-pulse' : ''
                  }`}>
                    £{correctAnswers * 20}
                  </p>
                  <p className="text-xs text-gray-500">Participation reward</p>
                </div>
              </div>
              {gameStarted && !quizCompleted && (
                <div className="progress-container">
                  <div
                    className="progress-bar"
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="animate-slideIn">
                {questions[currentQuestion] && (
                  <div className="bg-white p-6 border border-[#f00] shadow-sm transition-all duration-300 hover:shadow-md mb-4">
                    <h3 className="text-xl font-semibold mb-4 text-black border-b border-[#f00] pb-2">{questions[currentQuestion].question}</h3>

                    <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} className="space-y-4">
                      {questions[currentQuestion].options.map((option: string, index: number) => (
                        <div
                          key={index}
                          className={`flex items-center space-x-3 p-4 transition-all duration-200 cursor-pointer bg-white border border-[#f00] ${
                            selectedAnswer === index.toString() 
                              ? 'bg-[#e90a0a] shadow-sm transform scale-105' 
                              : 'bg-black hover:transform hover:scale-105'
                          }`}
                        >
                          <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="flex-1 text-black cursor-pointer font-medium">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                <Button
                  onClick={handleAnswer}
                  disabled={!selectedAnswer || isSubmitting}
                  className={`w-full py-4 mt-3 text-white transition-all duration-200 transform hover:scale-105 ${
                    isSubmitting 
                      ? 'bg-[#f00] cursor-not-allowed' 
                      : 'bg-[#f00] hover:bg-gray-800 hover:shadow-lg'
                  }`}
                  size="lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Processing...
                    </div>
                  ) : (
                    "Confirm Answer"
                  )}
                </Button>

                {/* Discount progress bar instead of quiz progress */}
                <DiscountProgressBar correctAnswers={correctAnswers} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Discount progress bar component
const DiscountProgressBar = ({ correctAnswers }: { correctAnswers: number }) => {
  const discount = correctAnswers * 20;
  const maxDiscount = 120;
  const progressPercentage = (discount / maxDiscount) * 100;

  return (
    <div className="bg- p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Discount progress:</span>
        <div>
        <span className="font-semibold">£{discount} /</span>
        <span className="font-semibold text-red-600">£{maxDiscount}</span>
        </div>
      </div>
      <div 
        aria-valuemax={100} 
        aria-valuemin={0} 
        aria-valuenow={progressPercentage}
        role="progressbar" 
        className="relative h-4 w-full overflow-hidden rounded-full bg-gray-200 mt-2"
      >
        <div 
          className="discount-progress-bar h-full transition-all duration-500 ease-out" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};
