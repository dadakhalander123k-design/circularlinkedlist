import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  AlertCircle,
  Video as VideoIcon,
  Tv,
  Check,
  Loader2,
} from 'lucide-react';
import { LessonItem, VIDEO_LESSONS } from '../data/videoLessons';
import { soundManager } from '../utils/audio';
import { progressManager } from '../utils/progressManager';

export const VideoTutorialsView: React.FC = () => {
  const [selectedLesson, setSelectedLesson] = useState<LessonItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.9);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isFullscreenControlsVisible, setIsFullscreenControlsVisible] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [completedVideos, setCompletedVideos] = useState<string[]>(() => {
    return progressManager.getVideoStats().completedVideos;
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync completion state from progressManager
  useEffect(() => {
    const unsub = progressManager.subscribe((state) => {
      setCompletedVideos(state.completedVideos || []);
    });
    return unsub;
  }, []);

  // Format time in mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Immediate, robust video loading when selected lesson changes
  useEffect(() => {
    if (!selectedLesson) return;
    const video = videoRef.current;
    if (!video) return;

    setHasError(false);
    setIsLoading(true);
    setCurrentTime(0);
    setDuration(0);

    video.src = selectedLesson.videoSrc;
    video.load();

    const handleReadyToPlay = () => {
      setIsLoading(false);
      setHasError(false);
      if (isPlaying) {
        video.play().catch(() => {
          setIsPlaying(false);
        });
      }
    };

    video.addEventListener('loadeddata', handleReadyToPlay, { once: true });
    video.addEventListener('canplay', handleReadyToPlay, { once: true });

    return () => {
      video.removeEventListener('loadeddata', handleReadyToPlay);
      video.removeEventListener('canplay', handleReadyToPlay);
    };
  }, [selectedLesson?.id]);

  // Select lesson and trigger immediate load + play
  const handleSelectLesson = useCallback((lesson: LessonItem, autoPlay: boolean = true) => {
    soundManager.playSelect();
    setHasError(false);

    if (selectedLesson?.id === lesson.id && videoRef.current) {
      if (!isPlaying && autoPlay) {
        soundManager.playVideoPlay();
        videoRef.current.play().catch(() => { });
        setIsPlaying(true);
      }
      return;
    }

    setSelectedLesson(lesson);
    if (autoPlay) {
      setIsPlaying(true);
    }
  }, [selectedLesson, isPlaying]);

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    if (!videoRef.current || !selectedLesson) return;

    if (isPlaying) {
      soundManager.playVideoPause();
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      soundManager.playVideoPlay();
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(() => {
            setIsPlaying(false);
            setIsLoading(false);
          });
      }
    }
  }, [isPlaying, selectedLesson]);

  // Strict Pause (for 'K' keyboard shortcut)
  const pauseVideoStrict = useCallback(() => {
    if (!videoRef.current || !selectedLesson) return;
    if (isPlaying) {
      soundManager.playVideoPause();
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isPlaying, selectedLesson]);

  // 1. REWIND (Left button, moves backward 10s, seeks to 0:00 if < 10s)
  const handleRewind = useCallback(() => {
    if (!videoRef.current) return;
    soundManager.playVideoSeek();
    const newTime = Math.max(0, videoRef.current.currentTime - 10);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  // 3. FORWARD (Right button, moves forward 10s, never exceeds duration)
  const handleForward = useCallback(() => {
    if (!videoRef.current) return;
    soundManager.playVideoSeek();
    const maxTime = duration || videoRef.current.duration || 0;
    const newTime = Math.min(maxTime, videoRef.current.currentTime + 10);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  // Timeline scrubber seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Speed selector
  const handleChangeSpeed = useCallback((spd: number) => {
    soundManager.playVideoSpeed();
    setPlaybackSpeed(spd);
    if (videoRef.current) {
      videoRef.current.playbackRate = spd;
    }
  }, []);

  // Volume slider
  const handleVolumeChange = (newVol: number) => {
    soundManager.playVideoSeek();
    setVolume(newVol);
    const muted = newVol === 0;
    setIsMuted(muted);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = muted;
    }
  };

  // Mute / Unmute toggle
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    soundManager.playVideoSeek();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
  }, [isMuted]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!playerContainerRef.current) return;
    const isDocFs = !!document.fullscreenElement;
    soundManager.playVideoFullscreen(!isDocFs);

    if (!isDocFs) {
      playerContainerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
          setIsFullscreenControlsVisible(true);
        })
        .catch(() => { });
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
          setIsFullscreenControlsVisible(true);
        })
        .catch(() => { });
    }
  }, []);

  // Retry loading current provided video
  const handleRetry = () => {
    if (!selectedLesson || !videoRef.current) return;
    soundManager.playClick();
    setHasError(false);
    setIsLoading(true);
    videoRef.current.src = selectedLesson.videoSrc;
    videoRef.current.load();
    const playPromise = videoRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(() => {
          setIsPlaying(false);
          setIsLoading(false);
        });
    }
  };

  // HTML5 Video Lifecycle Handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      setIsLoading(false);
      setHasError(false);
      videoRef.current.playbackRate = playbackSpeed;
      videoRef.current.volume = isMuted ? 0 : volume;
      videoRef.current.muted = isMuted;

      if (isPlaying) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              setIsLoading(false);
            })
            .catch(() => {
              setIsPlaying(false);
              setIsLoading(false);
            });
        }
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setCurrentTime(cur);
      if (selectedLesson && dur > 0 && cur >= dur * 0.90) {
        progressManager.completeVideo(selectedLesson.id);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (selectedLesson) {
      soundManager.playVideoComplete();
      progressManager.completeVideo(selectedLesson.id);
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setIsPlaying(false);
    setHasError(true);
  };

  const handleWaiting = () => {
    setIsLoading(true);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  // Activity trigger for auto-hiding fullscreen controls
  const triggerFullscreenActivity = useCallback(() => {
    if (!isFullscreen) return;
    setIsFullscreenControlsVisible(true);

    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }

    if (isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setIsFullscreenControlsVisible(false);
      }, 2800);
    }
  }, [isFullscreen, isPlaying]);

  // Keep controls visible when interacting with control elements directly
  const handleControlsInteraction = () => {
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    setIsFullscreenControlsVisible(true);
  };

  // Automatically start hide timer upon playing in fullscreen
  useEffect(() => {
    if (isFullscreen && isPlaying) {
      triggerFullscreenActivity();
    } else if (!isPlaying) {
      setIsFullscreenControlsVisible(true);
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    }
  }, [isFullscreen, isPlaying, triggerFullscreenActivity]);

  // Keyboard Shortcuts Listener (Space, J, K, L, F, ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        handleRewind();
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        pauseVideoStrict();
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        handleForward();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePlay, handleRewind, pauseVideoStrict, handleForward, toggleFullscreen]);

  // Sync document fullscreen state
  useEffect(() => {
    const onFsChange = () => {
      const isDocFs = !!document.fullscreenElement;
      setIsFullscreen(isDocFs);
      setIsFullscreenControlsVisible(true);
      if (!isDocFs && hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Top Header Banner for Section */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-100 dark:border-blue-500/15 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-[#3B82F6] text-xs font-bold font-mono uppercase tracking-wider rounded-lg border border-[#DBEAFE] dark:border-blue-500/30">
            <VideoIcon className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
            <span>Video Masterclass</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Circular Linked List In Action
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight animate-heading-enter">
            Circular Linked List Video Tutorials
          </h1>
          <p className="text-sm sm:text-base font-semibold text-[#2563EB] dark:text-[#3B82F6]">
            Watch step-by-step visual explanations of circular linked lists and their operations.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            Select a video lesson below to visually understand circular linked list concepts and operations step by step.
          </p>
        </div>
      </div>

      {/* =========================================================================
          PART 3 — TWO LESSON CARDS (SIDE BY SIDE ON DESKTOP, STACKED ON MOBILE)
          ========================================================================= */}
      <section aria-label="Video Lessons Selection">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {VIDEO_LESSONS.map((lesson) => {
            const isSelected = selectedLesson?.id === lesson.id;
            const isCompleted = completedVideos.includes(lesson.id);

            return (
              <div
                key={lesson.id}
                id={`video-card-${lesson.id}`}
                onClick={() => handleSelectLesson(lesson, true)}
                className={`p-6 sm:p-7 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between border ${isSelected
                    ? 'bg-white dark:bg-[#111827] border-[#2563EB] dark:border-[#3B82F6] shadow-md dark:shadow-lg ring-2 ring-[#2563EB]/20 dark:ring-blue-500/30'
                    : 'bg-white dark:bg-[#111827]/85 border-[#E2E8F0] dark:border-blue-500/20 hover:border-[#DBEAFE] dark:hover:border-blue-500/50 shadow-xs'
                  }`}
              >
                <div>
                  {/* Lesson Header Pill & Completion Indicator */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-3 py-1 rounded-md text-xs font-bold font-mono border tracking-wide transition-colors ${isSelected
                            ? 'bg-[#EFF6FF] dark:bg-blue-950/80 text-[#2563EB] dark:text-[#3B82F6] border-[#DBEAFE] dark:border-blue-500/40'
                            : 'bg-[#F8FAFC] dark:bg-blue-950/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-blue-500/20'
                          }`}
                      >
                        {lesson.lessonNumber}
                      </span>

                      {/* Small Minimal Completion Indicator */}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>COMPLETED</span>
                        </span>
                      )}
                    </div>

                    <div
                      className={`p-2 rounded-xl transition-colors ${isSelected
                          ? 'bg-[#2563EB] dark:bg-[#3B82F6] text-white shadow-xs'
                          : 'bg-[#EFF6FF] dark:bg-blue-950/30 text-[#2563EB] dark:text-[#3B82F6]'
                        }`}
                    >
                      <VideoIcon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h2 className="text-xl sm:text-2xl font-extrabold font-sans text-slate-900 dark:text-white tracking-tight leading-snug mb-2.5 break-words">
                    {lesson.title}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5 font-normal break-words">
                    {lesson.description}
                  </p>

                  {/* Topic Labels */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {lesson.topics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#F1F5F9] dark:bg-[#0F172A] text-[#334155] dark:text-slate-200 border border-slate-200/90 dark:border-blue-500/25 tracking-normal"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Primary Button: CLICK TO WATCH */}
                <button
                  id={`btn-watch-${lesson.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectLesson(lesson, true);
                  }}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98] ${isSelected
                      ? 'bg-[#2563EB] dark:bg-[#2563EB] hover:bg-[#1D4ED8] dark:hover:bg-[#1D4ED8] text-white shadow-md'
                      : 'bg-[#EFF6FF] dark:bg-blue-950/50 hover:bg-[#DBEAFE] dark:hover:bg-blue-900/60 text-[#2563EB] dark:text-[#3B82F6] border border-[#DBEAFE] dark:border-blue-500/30'
                    }`}
                  aria-label={`Click to watch ${lesson.title}`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>CLICK TO WATCH</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          PART 7 — VIDEO PLAYER AREA
          ========================================================================= */}
      <section
        aria-label="Video Player Area"
        className="p-4 sm:p-8 rounded-2xl bg-white dark:bg-[#111827]/90 border border-slate-200 dark:border-blue-500/20 shadow-[0_4px_24px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] space-y-4 sm:space-y-6"
      >
        {/* Now Playing Header Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-100 dark:border-blue-500/20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/50 text-[#2563EB] dark:text-[#3B82F6] border border-[#DBEAFE] dark:border-blue-500/30 shrink-0 shadow-xs">
              <Tv className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Current Lesson
              </span>
              <h3 className="text-base sm:text-xl font-bold font-sans text-slate-900 dark:text-white break-words leading-snug">
                {selectedLesson
                  ? `NOW PLAYING: ${selectedLesson.nowPlayingTitle}`
                  : 'Select a lesson to begin'}
              </h3>
            </div>
          </div>

          {selectedLesson && (
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              {completedVideos.includes(selectedLesson.id) && (
                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-lg font-mono flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Completed</span>
                </span>
              )}
              <span className="px-3 py-1 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-blue-500/25 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg font-mono">
                {selectedLesson.filename}
              </span>
            </div>
          )}
        </div>

        {/* Video Player Display Container (Refined Border, Radius & Soft Shadow) */}
        <div
          ref={playerContainerRef}
          onMouseMove={triggerFullscreenActivity}
          onPointerMove={triggerFullscreenActivity}
          onTouchStart={triggerFullscreenActivity}
          onClick={triggerFullscreenActivity}
          className={`relative w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800/80 dark:border-blue-500/30 shadow-[0_8px_30px_rgba(0,0,0,0.25)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-center group select-none ${isFullscreen
              ? `fixed inset-0 z-50 rounded-none w-screen h-screen ${!isFullscreenControlsVisible ? 'cursor-none' : 'cursor-default'
              }`
              : 'aspect-video'
            }`}
        >
          {/* Case 1: No lesson selected yet (Initial instructional state) */}
          {!selectedLesson && (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 to-[#0F172A] text-slate-300 space-y-3.5 select-none">
              <div className="w-16 h-16 rounded-2xl bg-blue-950/50 dark:bg-blue-950/60 border border-blue-500/30 dark:border-blue-500/30 flex items-center justify-center text-[#2563EB] dark:text-[#3B82F6] shadow-md">
                <VideoIcon className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white font-sans">
                Select a lesson and click CLICK TO WATCH.
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md font-sans leading-relaxed">
                Choose between What is Circular Linked List or Operations of Circular Linked List to load and play the provided video lesson.
              </p>
            </div>
          )}

          {/* Case 2: Error State (Provided video genuinely cannot load) */}
          {selectedLesson && hasError && (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 to-[#0F172A] text-slate-200 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-md">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white font-sans">
                  VIDEO COULD NOT BE LOADED
                </h4>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
                  Please check the provided video file: <code className="text-rose-300 font-mono">{selectedLesson.filename}</code>
                </p>
              </div>
              <button
                id="btn-video-try-again"
                onClick={handleRetry}
                className="btn-modern-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>TRY AGAIN</span>
              </button>
            </div>
          )}

          {/* Case 3: HTML5 Video Element (Always present, preload="metadata", object-fit: contain) */}
          <video
            ref={videoRef}
            preload="metadata"
            playsInline
            className={`w-full h-full object-contain ${selectedLesson && !hasError ? 'block' : 'hidden'
              }`}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onError={handleError}
            onWaiting={handleWaiting}
            onCanPlay={handleCanPlay}
            onClick={togglePlay}
          />

          {/* Clean Professional Loading State */}
          {selectedLesson && isLoading && !hasError && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-3 pointer-events-none text-white">
              <Loader2 className="w-8 h-8 text-[#2563EB] dark:text-[#3B82F6] animate-spin" />
              <span className="text-xs font-bold font-mono tracking-wider uppercase">
                LOADING VIDEO...
              </span>
            </div>
          )}

          {/* =========================================================================
              FULLSCREEN MODE: GLASS CONTROL OVERLAY (AUTO-HIDES ON INACTIVITY)
              Exact Order: [ REWIND ] [ PLAY / PAUSE ] [ FORWARD ] | SPEED | VOLUME | FULLSCREEN
              ========================================================================= */}
          {isFullscreen && selectedLesson && (
            <div
              onMouseEnter={handleControlsInteraction}
              onTouchStart={handleControlsInteraction}
              onClick={(e) => e.stopPropagation()}
              className={`absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 z-50 bg-slate-900/65 dark:bg-[#0F172A]/75 backdrop-blur-xl border border-white/15 dark:border-blue-500/30 rounded-2xl p-3 sm:p-4 shadow-2xl space-y-3 transition-all duration-300 ease-out ${isFullscreenControlsVisible
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
            >
              {/* Progress Scrubber & Timestamp */}
              <div className="space-y-1">
                <div className="relative flex items-center group/scrub">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2.5 bg-white/20 dark:bg-slate-700/60 rounded-full appearance-none cursor-pointer accent-[#2563EB] dark:accent-[#3B82F6] focus:outline-none"
                    aria-label="Seek video progress"
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-300 dark:text-slate-400 font-semibold px-0.5">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Exact Control Order: LEFT (1. Rewind, 2. Play/Pause, 3. Forward) | MIDDLE (Speed) | RIGHT (Volume, Slider, Fullscreen) */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-white">
                {/* Left Side: [ REWIND ] [ PLAY / PAUSE ] [ FORWARD ] */}
                <div className="flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3">
                  {/* 1. REWIND BUTTON */}
                  <button
                    onClick={handleRewind}
                    className="h-10 w-10 sm:h-9 sm:w-9 rounded-xl bg-white/10 hover:bg-white/20 dark:bg-blue-950/40 text-slate-200 hover:text-white transition-colors cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
                    title="Rewind 10s (J)"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* 2. PLAY / PAUSE BUTTON */}
                  <button
                    onClick={togglePlay}
                    className="btn-modern-primary h-11 sm:h-10 px-5 sm:px-6 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all"
                    title={isPlaying ? 'Pause video (Space/K)' : 'Play video (Space)'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <Play className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" />}
                    <span className="uppercase font-bold text-xs">{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>

                  {/* 3. FORWARD BUTTON */}
                  <button
                    onClick={handleForward}
                    className="h-10 w-10 sm:h-9 sm:w-9 rounded-xl bg-white/10 hover:bg-white/20 dark:bg-blue-950/40 text-slate-200 hover:text-white transition-colors cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
                    title="Forward 10s (L)"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>

                {/* Right Side: Speed Selector + Volume + Fullscreen */}
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
                  {/* 4. PLAYBACK SPEED SELECTOR */}
                  <div className="flex items-center gap-0.5 sm:gap-1 bg-black/40 border border-white/10 dark:border-blue-500/30 rounded-xl p-1 shadow-inner shrink-0">
                    {[0.5, 1, 1.5, 2].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => handleChangeSpeed(spd)}
                        className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-mono font-bold transition-all cursor-pointer ${playbackSpeed === spd
                            ? 'bg-[#2563EB] dark:bg-[#2563EB] text-white shadow-xs'
                            : 'text-slate-400 hover:text-white'
                          }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>

                  {/* 5. VOLUME ICON, 6. VOLUME SLIDER, 7. FULLSCREEN EXIT */}
                  <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                    <button
                      onClick={toggleMute}
                      className="p-2 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white cursor-pointer transition-colors"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-14 sm:w-20 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#2563EB] dark:accent-[#3B82F6] hidden min-[380px]:inline-block"
                      aria-label="Volume slider"
                    />

                    <button
                      onClick={toggleFullscreen}
                      className="h-10 w-10 sm:h-9 sm:w-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white cursor-pointer transition-colors active:scale-95 flex items-center justify-center shrink-0"
                      title="Exit Fullscreen (F / ESC)"
                    >
                      <Minimize className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            NORMAL VIDEO MODE: DOCKED RESPONSIVE CONTROLS MATCHING REFERENCE
            Exact Order:
            Left:   1. REWIND  →  2. PLAY / PAUSE  →  3. FORWARD
            Middle: 4. PLAYBACK SPEED
            Right:  5. VOLUME  →  6. VOLUME SLIDER  →  7. FULLSCREEN
            ========================================================================= */}
        {selectedLesson && !isFullscreen && (
          <div
            id="video-controls-container"
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-blue-500/25 shadow-md dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] space-y-3 sm:space-y-4"
          >
            {/* Horizontal Progress Bar & Time Display */}
            <div className="space-y-1.5">
              <div className="relative flex items-center group/scrub">
                <input
                  id="video-timeline-scrubber"
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  disabled={hasError || duration === 0}
                  className="w-full h-3 sm:h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-[#2563EB] dark:accent-[#3B82F6] focus:outline-none transition-all disabled:opacity-50"
                  aria-label="Seek video progress"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 font-semibold px-0.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Exact Control Order Bar: [ REWIND ] [ PLAY / PAUSE ] [ FORWARD ] | SPEED | VOLUME | FULLSCREEN */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-0.5">
              {/* LEFT SIDE: [ REWIND ] [ PLAY / PAUSE ] [ FORWARD ] (Centered on mobile, left on desktop) */}
              <div className="flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3">
                {/* 1. REWIND BUTTON (FIRST) */}
                <button
                  id="btn-video-rewind"
                  onClick={handleRewind}
                  disabled={hasError}
                  className="h-10 w-10 sm:h-9 sm:w-9 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#0F172A] dark:hover:bg-blue-950/40 border border-slate-200/90 dark:border-blue-500/25 text-slate-700 dark:text-slate-300 transition-all cursor-pointer active:scale-95 shadow-xs flex items-center justify-center shrink-0"
                  title="Rewind 10 seconds (J)"
                  aria-label="Rewind 10 seconds"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* 2. PLAY / PAUSE BUTTON (SECOND / CENTER) */}
                <button
                  id="btn-video-play-pause"
                  onClick={togglePlay}
                  disabled={hasError}
                  className="btn-modern-primary h-11 sm:h-10 px-5 sm:px-6 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                  title={isPlaying ? 'Pause video (Space/K)' : 'Play video (Space)'}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <Play className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" />}
                  <span className="tracking-wide uppercase font-bold text-xs">{isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                {/* 3. FORWARD BUTTON (THIRD) */}
                <button
                  id="btn-video-forward"
                  onClick={handleForward}
                  disabled={hasError}
                  className="h-10 w-10 sm:h-9 sm:w-9 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#0F172A] dark:hover:bg-blue-950/40 border border-slate-200/90 dark:border-blue-500/25 text-slate-700 dark:text-slate-300 transition-all cursor-pointer active:scale-95 shadow-xs flex items-center justify-center shrink-0"
                  title="Forward 10 seconds (L)"
                  aria-label="Forward 10 seconds"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>

              {/* SECONDARY CONTROLS: Speed Selector + Volume + Fullscreen */}
              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3.5 border-t sm:border-t-0 border-slate-100 dark:border-blue-500/15 pt-2.5 sm:pt-0">
                {/* 4. PLAYBACK SPEED (0.5x | 1x | 1.5x | 2x) */}
                <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-100 dark:bg-[#0F172A] border border-slate-200/90 dark:border-blue-500/25 rounded-xl p-1 shadow-inner shrink-0">
                  {[0.5, 1, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      id={`btn-video-speed-${spd}`}
                      onClick={() => handleChangeSpeed(spd)}
                      className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-mono font-bold transition-all cursor-pointer ${playbackSpeed === spd
                          ? 'bg-[#2563EB] dark:bg-[#2563EB] text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      aria-label={`Set speed to ${spd}x`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                {/* RIGHT SIDE: 5. VOLUME, 6. VOLUME SLIDER, 7. FULLSCREEN */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* 5. VOLUME ICON BUTTON */}
                  <button
                    id="btn-video-mute"
                    onClick={toggleMute}
                    className="p-2 sm:p-2.5 hover:bg-slate-100 dark:hover:bg-blue-950/40 rounded-xl text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title={isMuted ? 'Unmute' : 'Mute'}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-slate-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                    )}
                  </button>

                  {/* 6. VOLUME SLIDER */}
                  <input
                    id="video-volume-slider"
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-14 sm:w-20 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#2563EB] dark:accent-[#3B82F6] hidden min-[380px]:inline-block"
                    aria-label="Volume slider"
                  />

                  {/* 7. FULLSCREEN BUTTON */}
                  <button
                    id="btn-video-fullscreen"
                    onClick={toggleFullscreen}
                    className="h-10 w-10 sm:h-9 sm:w-9 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#0F172A] dark:hover:bg-blue-950/40 border border-slate-200/90 dark:border-blue-500/25 text-slate-700 dark:text-slate-300 transition-all cursor-pointer active:scale-95 shadow-xs flex items-center justify-center shrink-0"
                    title={isFullscreen ? 'Exit Fullscreen (F / ESC)' : 'Enter Fullscreen (F)'}
                    aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
