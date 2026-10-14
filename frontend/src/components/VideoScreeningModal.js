import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Mic,
  Square,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  X,
  Clock,
  Send,
  FileText
} from 'lucide-react';
import { Button } from './Button.js';
import { speechTranscriptionService, SCREENING_PROMPTS } from '../utils/speechTranscriptionService.js';
import './VideoScreeningModal.css';

export function VideoScreeningModal({ isOpen, onClose, candidate, onScreeningSaved }) {
  if (!isOpen || !candidate) return null;

  const [activePromptIdx, setActivePromptIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const currentPrompt = SCREENING_PROMPTS[activePromptIdx];

  // Request webcam stream when modal opens
  useEffect(() => {
    let activeStream = null;
    if (isOpen) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          activeStream = stream;
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          // Camera permission fallback
        });
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isOpen]);

  // Recording countdown timer
  useEffect(() => {
    let timer = null;
    if (isRecording && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (isRecording && secondsLeft === 0) {
      handleStopRecording();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording, secondsLeft]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setSecondsLeft(60);
    setHasRecorded(false);
    setAnalysisResult(null);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setHasRecorded(true);
    setIsAnalyzing(true);

    setTimeout(() => {
      const result = speechTranscriptionService.generateTranscriptAndScores(currentPrompt.id);
      setAnalysisResult(result);
      setIsAnalyzing(false);
      speechTranscriptionService.saveCandidateVideoScreening(candidate.id, result);
    }, 1200);
  };

  const handleSaveAndClose = () => {
    if (onScreeningSaved && analysisResult) {
      onScreeningSaved(analysisResult);
    }
    onClose();
  };

  return (
    <div className="ats-modal-overlay" onClick={onClose}>
      <div className="ats-video-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ats-modal-header border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Video Screening Booth</h3>
              <p className="text-[11px] text-slate-500">
                Candidate: <strong className="text-slate-700">{candidate.name}</strong> • Asynchronous WebRTC Assessment
              </p>
            </div>
          </div>

          <button
            type="button"
            className="ats-modal-close-btn text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Question Prompt Pill */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                Question {activePromptIdx + 1} of {SCREENING_PROMPTS.length}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Max 60 Seconds</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 leading-snug pt-1">
              "{currentPrompt.question}"
            </h4>
          </div>

          {/* Camera Viewport */}
          <div className="ats-camera-viewport">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Live Recording HUD */}
            {isRecording && (
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-900/80 px-2.5 py-1 rounded-full text-white text-xs font-mono backdrop-blur-md">
                <div className="ats-camera-rec-dot" />
                <span>REC 00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}</span>
              </div>
            )}

            {!isRecording && !hasRecorded && (
              <div className="absolute inset-0 bg-slate-950/40 flex flex-col items-center justify-center gap-2 text-white">
                <Button
                  variant="primary"
                  size="md"
                  icon={Play}
                  onClick={handleStartRecording}
                >
                  Start 60s Recording
                </Button>
                <span className="text-[11px] text-slate-300">Ensure microphone and webcam are aligned</span>
              </div>
            )}

            {isRecording && (
              <div className="absolute bottom-4">
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  Finish Recording Early
                </button>
              </div>
            )}
          </div>

          {/* AI Analysis Loading / Results Card */}
          {isAnalyzing && (
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-center space-y-2">
              <Sparkles className="w-6 h-6 text-indigo-600 mx-auto animate-spin" />
              <h5 className="text-xs font-bold text-indigo-900">Transcribing Speech & Analyzing STAR Delivery...</h5>
              <p className="text-[11px] text-indigo-600">Extracting keyword competencies and clarity metrics</p>
            </div>
          )}

          {analysisResult && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  AI Speech Transcript
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {analysisResult.scores.overallClarity}% Clarity Fit
                </span>
              </div>

              <p className="text-xs text-slate-700 italic leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                "{analysisResult.transcript}"
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">STAR Adherence</span>
                  <span className="font-semibold text-slate-800">{analysisResult.scores.starMethodAdherence}</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tone Evaluation</span>
                  <span className="font-semibold text-indigo-600">{analysisResult.scores.sentiment}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Keywords Detected:</span>
                <div className="flex flex-wrap gap-1">
                  {analysisResult.scores.keyKeywordsDetected.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="ats-modal-footer border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleStartRecording}
            icon={RotateCcw}
            disabled={isRecording}
          >
            Re-record
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveAndClose}
            disabled={!analysisResult}
            icon={CheckCircle2}
          >
            Save Screening to Profile
          </Button>
        </div>
      </div>
    </div>
  );
}

export default VideoScreeningModal;
