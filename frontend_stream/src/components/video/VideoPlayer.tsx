import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useTranslation } from '../../lib/i18n';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  PictureInPicture, 
  Settings, 
  SkipBack, 
  SkipForward,
  Download
} from 'lucide-react';

interface VideoPlayerProps {
  src?: string;
  title: string;
  isLive?: boolean;
  captions?: Array<{ language: string; src: string; label: string }>;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  className?: string;
}

export function VideoPlayer({ 
  src, 
  title, 
  isLive = false, 
  captions = [], 
  onTimeUpdate,
  className = ""
}: VideoPlayerProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState('auto');
  const [selectedCaption, setSelectedCaption] = useState('off');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);
  const [isFullscreenSupported, setIsFullscreenSupported] = useState(false);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
  const [isPlayPromisePending, setIsPlayPromisePending] = useState(false);
  const mountedRef = useRef(true);
  const playAbortControllerRef = useRef<AbortController | null>(null);

  // Auto-hide controls
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isPlaying) {
      timeoutId = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => clearTimeout(timeoutId);
  }, [isPlaying, showControls]);

  // Reset metadata loaded state when src changes
  useEffect(() => {
    // Cancel any pending play operations when source changes
    if (playAbortControllerRef.current) {
      playAbortControllerRef.current.abort();
      playAbortControllerRef.current = null;
    }

    const resetVideoState = () => {
      if (mountedRef.current) {
        setIsMetadataLoaded(false);
        setDuration(0);
        setCurrentTime(0);
        setIsPlaying(false);
        setIsPlayPromisePending(false);
      }
    };

    resetVideoState();
    
    // Pause video when source changes to prevent AbortError
    if (videoRef.current && mountedRef.current) {
      try {
        videoRef.current.pause();
        // Wait a tick to ensure the pause has taken effect
        setTimeout(() => {
          if (videoRef.current && mountedRef.current) {
            videoRef.current.load(); // Reload the video element
          }
        }, 0);
      } catch (error) {
        console.warn('Error pausing video during source change:', error);
      }
    }
  }, [src]);

  // Check fullscreen support and listen for changes
  useEffect(() => {
    // Check if fullscreen API is supported and allowed
    const checkFullscreenSupport = () => {
      const hasFullscreenAPI = !!(
        document.fullscreenEnabled ||
        (document as any).webkitFullscreenEnabled ||
        (document as any).mozFullScreenEnabled ||
        (document as any).msFullscreenEnabled
      );
      
      setIsFullscreenSupported(hasFullscreenAPI);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      ));
    };

    checkFullscreenSupport();
    
    // Listen for fullscreen changes with vendor prefixes
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Handle escape key for pseudo-fullscreen
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isPseudoFullscreen) {
        setIsPseudoFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPseudoFullscreen]);

  // Cleanup on unmount and route changes to prevent AbortError
  useEffect(() => {
    mountedRef.current = true;
    
    const handleBeforeRouteChange = () => {
      // Immediately mark component as unmounted to prevent state updates
      mountedRef.current = false;
      
      // Cancel any pending play operations
      if (playAbortControllerRef.current) {
        playAbortControllerRef.current.abort();
        playAbortControllerRef.current = null;
      }
      
      // Pause video immediately to prevent AbortError
      if (videoRef.current) {
        try {
          videoRef.current.pause();
        } catch (error) {
          // Ignore errors during cleanup
        }
      }
    };

    // Listen for route changes
    window.addEventListener('beforeRouteChange', handleBeforeRouteChange);
    
    return () => {
      mountedRef.current = false;
      
      // Remove event listener
      window.removeEventListener('beforeRouteChange', handleBeforeRouteChange);
      
      // Cancel any pending play operations
      if (playAbortControllerRef.current) {
        playAbortControllerRef.current.abort();
        playAbortControllerRef.current = null;
      }
      
      // Pause video immediately to prevent AbortError
      if (videoRef.current) {
        try {
          videoRef.current.pause();
          videoRef.current.src = '';
          videoRef.current.load();
        } catch (error) {
          // Ignore errors during cleanup
        }
      }
    };
  }, []);

  const togglePlay = async () => {
    if (!videoRef.current || isPlayPromisePending || !mountedRef.current) return;

    try {
      if (isPlaying) {
        // Cancel any pending play operations
        if (playAbortControllerRef.current) {
          playAbortControllerRef.current.abort();
          playAbortControllerRef.current = null;
        }
        
        videoRef.current.pause();
        if (mountedRef.current) {
          setIsPlaying(false);
        }
      } else {
        // Check if video element is still valid and component is mounted
        if (!isVideoElementValid() || !mountedRef.current) {
          console.warn('Video element not valid, component unmounted, or no source available');
          return;
        }

        // Cancel any existing play operations
        if (playAbortControllerRef.current) {
          playAbortControllerRef.current.abort();
        }

        // Create new AbortController for this play operation
        playAbortControllerRef.current = new AbortController();
        const currentController = playAbortControllerRef.current;

        if (mountedRef.current) {
          setIsPlayPromisePending(true);
          setIsPlaying(true);
        }
        
        // Play with abort signal
        await videoRef.current.play();
        
        // Check if operation was aborted or component unmounted
        if (currentController.signal.aborted || !mountedRef.current) {
          return;
        }
        
        // Clear the controller on successful play
        if (playAbortControllerRef.current === currentController) {
          playAbortControllerRef.current = null;
        }
      }
    } catch (error) {
      // Only log errors if component is still mounted and operation wasn't aborted
      if (mountedRef.current) {
        console.error('Play error:', error);
        setIsPlaying(false);
        
        // Handle specific AbortError
        if (error instanceof DOMException && error.name === 'AbortError') {
          console.warn('Play request was aborted - video may have been removed or source changed');
        }
      }
    } finally {
      if (mountedRef.current) {
        setIsPlayPromisePending(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (mountedRef.current && videoRef.current && videoRef.current.parentNode && !isNaN(videoRef.current.currentTime)) {
      const current = videoRef.current.currentTime;
      setCurrentTime(current);
      onTimeUpdate?.(current, duration);
    }
  };

  const handleLoadedMetadata = () => {
    if (mountedRef.current && videoRef.current && videoRef.current.parentNode && !isNaN(videoRef.current.duration)) {
      setDuration(videoRef.current.duration);
      setIsMetadataLoaded(true);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current && isMetadataLoaded && duration > 0) {
      const seekTime = Math.max(0, Math.min(value[0], duration));
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current && isMetadataLoaded && duration > 0) {
      const newTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
      videoRef.current.currentTime = newTime;
    }
  };

  const changePlaybackRate = (rate: string) => {
    const rateNum = parseFloat(rate);
    setPlaybackRate(rateNum);
    if (videoRef.current) {
      videoRef.current.playbackRate = rateNum;
    }
  };

  const toggleFullscreen = async () => {
    if (!videoRef.current) return;

    // If native fullscreen is not supported, use pseudo-fullscreen
    if (!isFullscreenSupported) {
      setIsPseudoFullscreen(!isPseudoFullscreen);
      return;
    }

    try {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (!isCurrentlyFullscreen) {
        // Try different fullscreen methods with browser prefixes
        const element = videoRef.current;
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if ((element as any).webkitRequestFullscreen) {
          await (element as any).webkitRequestFullscreen();
        } else if ((element as any).mozRequestFullScreen) {
          await (element as any).mozRequestFullScreen();
        } else if ((element as any).msRequestFullscreen) {
          await (element as any).msRequestFullscreen();
        }
      } else {
        // Exit fullscreen with browser prefixes
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      // If it's a permissions policy error, fall back to pseudo-fullscreen
      if (error instanceof TypeError && error.message.includes('permissions policy')) {
        console.warn('Fullscreen blocked by permissions policy. Using pseudo-fullscreen mode.');
        setIsPseudoFullscreen(!isPseudoFullscreen);
      }
    }
  };

  const togglePictureInPicture = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current && isMetadataLoaded) {
        // Check if video has loaded enough metadata for PiP
        if (videoRef.current.readyState >= HTMLMediaElement.HAVE_METADATA) {
          await videoRef.current.requestPictureInPicture();
        } else {
          console.warn('Video metadata not yet loaded. Cannot enter Picture-in-Picture mode.');
        }
      }
    } catch (error) {
      console.error('PiP error:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper function to check if video element is valid
  const isVideoElementValid = () => {
    return videoRef.current && 
           videoRef.current.parentNode && 
           !videoRef.current.error &&
           src;
  };

  return (
    <div 
      className={`relative bg-black rounded-lg overflow-hidden group ${className} ${
        isPseudoFullscreen 
          ? 'fixed inset-0 z-[9999] rounded-none bg-black' 
          : ''
      }`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(isPlaying ? false : true)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => {
          if (mountedRef.current) {
            setIsPlaying(true);
            setIsPlayPromisePending(false);
          }
        }}
        onPause={() => {
          if (mountedRef.current) {
            setIsPlaying(false);
            setIsPlayPromisePending(false);
          }
        }}
        onLoadStart={() => {
          if (mountedRef.current) {
            setIsMetadataLoaded(false);
            setIsPlaying(false);
            setIsPlayPromisePending(false);
          }
        }}
        onError={() => {
          if (mountedRef.current) {
            setIsMetadataLoaded(false);
            setIsPlaying(false);
            setIsPlayPromisePending(false);
          }
        }}
        onWaiting={() => {
          if (mountedRef.current) {
            setIsPlaying(false);
          }
        }}
        onAbort={() => {
          if (mountedRef.current) {
            setIsPlaying(false);
            setIsPlayPromisePending(false);
          }
        }}
        onEnded={() => {
          if (mountedRef.current) {
            setIsPlaying(false);
            setIsPlayPromisePending(false);
          }
        }}
        onCanPlay={() => {
          if (videoRef.current?.readyState >= HTMLMediaElement.HAVE_METADATA) {
            setIsMetadataLoaded(true);
          }
        }}
        poster={!src ? "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=450" : undefined}
      >
        {src && <source src={src} type="application/x-mpegURL" />}
        {captions.map((caption) => (
          <track
            key={caption.language}
            kind="subtitles"
            src={caption.src}
            srcLang={caption.language}
            label={caption.label}
            default={caption.language === selectedCaption}
          />
        ))}
      </video>

      {/* Live Badge */}
      {isLive && (
        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
          {t('course.live')}
        </div>
      )}

      {/* Pseudo-fullscreen indicator */}
      {isPseudoFullscreen && (
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm flex items-center">
          {t('video.exitFullscreen')}
        </div>
      )}

      {/* No Stream Message */}
      {!src && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center">
            <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">{isLive ? t('video.waitingRoom') : t('video.offline')}</p>
            <p className="text-sm opacity-75">
              {isLive ? 'La session commencera bientot' : 'Aucun contenu disponible'}
            </p>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Play/Pause Center Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="bg-black/50 hover:bg-black/70 text-white w-16 h-16 rounded-full"
            disabled={!src || isPlayPromisePending}
          >
            {isPlayPromisePending ? (
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8" />
            )}
          </Button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          {/* Progress Bar */}
          {!isLive && src && (
            <Slider
              value={[currentTime]}
              onValueChange={handleSeek}
              max={duration}
              step={1}
              className="w-full"
            />
          )}

          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
                disabled={!src || isPlayPromisePending}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              {!isLive && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => skip(-10)}
                    className="text-white hover:bg-white/20"
                    disabled={!src}
                  >
                    <SkipBack className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => skip(10)}
                    className="text-white hover:bg-white/20"
                    disabled={!src}
                  >
                    <SkipForward className="w-5 h-5" />
                  </Button>
                </>
              )}

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                  disabled={!src}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  onValueChange={handleVolumeChange}
                  max={1}
                  step={0.1}
                  className="w-20"
                />
              </div>

              {/* Time Display */}
              {!isLive && src && (
                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              )}
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-2">
              {/* Captions */}
              {captions.length > 0 && (
                <Select value={selectedCaption} onValueChange={setSelectedCaption}>
                  <SelectTrigger className="w-32 bg-black/50 text-white border-white/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Off</SelectItem>
                    {captions.map((caption) => (
                      <SelectItem key={caption.language} value={caption.language}>
                        {caption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Playback Speed */}
              {!isLive && (
                <Select value={playbackRate.toString()} onValueChange={changePlaybackRate}>
                  <SelectTrigger className="w-20 bg-black/50 text-white border-white/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5x</SelectItem>
                    <SelectItem value="0.75">0.75x</SelectItem>
                    <SelectItem value="1">1x</SelectItem>
                    <SelectItem value="1.25">1.25x</SelectItem>
                    <SelectItem value="1.5">1.5x</SelectItem>
                    <SelectItem value="2">2x</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Quality */}
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger className="w-20 bg-black/50 text-white border-white/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="1080p">1080p</SelectItem>
                  <SelectItem value="720p">720p</SelectItem>
                  <SelectItem value="480p">480p</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="icon"
                onClick={togglePictureInPicture}
                className="text-white hover:bg-white/20"
                disabled={!src || !isMetadataLoaded}
                title={!isMetadataLoaded ? "Waiting for video to load..." : t('video.pip')}
              >
                <PictureInPicture className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
                title={
                  !isFullscreenSupported 
                    ? t('video.pseudoFullscreen')
                    : (isFullscreen || isPseudoFullscreen) 
                      ? t('video.exitFullscreenBtn')
                      : t('video.fullscreen')
                }
              >
                <Maximize className={`w-5 h-5 transition-transform ${(isFullscreen || isPseudoFullscreen) ? 'rotate-45 scale-90' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}