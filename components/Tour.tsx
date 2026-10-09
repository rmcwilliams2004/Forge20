import React, { useLayoutEffect, useState, useRef, useEffect } from 'react';
import { useTts } from '../hooks/useTts';

interface TourStep {
  targetId?: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'center';
}

interface TourProps {
  isOpen: boolean;
  stepIndex: number;
  steps: readonly TourStep[];
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  tts: ReturnType<typeof useTts>;
}

interface PopoverPosition {
  top: number;
  left: number;
}

const SpeakerIcon = ({ active }: { active: boolean }) => (
    active ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /></svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6.375a9 9 0 0 1 18 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75a9 9 0 0 1 18 0v.008c0 .016 0 .031 0 .046l-7.5 7.5-1.42-1.42m-6.096 2.046a9 9 0 0 1-2.083-11.543" /></svg>
    )
);


export const Tour = ({ isOpen, stepIndex, steps, onClose, onNext, onPrev, tts }: TourProps) => {
  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition | null>(null);
  const currentStep = steps[stepIndex];
  const popoverRef = useRef<HTMLDivElement>(null);
  const [finalPosition, setFinalPosition] = useState(currentStep?.position || 'bottom');
  const [isVerbal, setIsVerbal] = useState(false);

  useEffect(() => {
    if (isOpen) {
        // Reset verbal state when tour opens
        setIsVerbal(false);
    } else {
        // Ensure audio stops when tour is closed externally
        tts.stop();
    }
  }, [isOpen, tts]);

  useEffect(() => {
    if (isOpen && isVerbal) {
      tts.speak(currentStep.content, 'Kore');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isVerbal, stepIndex, currentStep.content]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      tts.stop();
    }
  }, [tts]);

  const handleToggleVerbal = () => {
    const newIsVerbal = !isVerbal;
    setIsVerbal(newIsVerbal);
    if (!newIsVerbal) {
      tts.stop();
    }
  };

  const handleNext = () => {
    tts.stop();
    onNext();
  };
  
  const handlePrev = () => {
    tts.stop();
    onPrev();
  };
  
  const handleClose = () => {
    tts.stop();
    onClose();
  };


  useLayoutEffect(() => {
    document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
    
    if (!isOpen || !currentStep) {
      return;
    }

    const popoverEl = popoverRef.current;

    if (currentStep.targetId) {
      const element = document.getElementById(currentStep.targetId);
      if (element && popoverEl) {
        element.classList.add('tour-highlight');
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

        const rect = element.getBoundingClientRect();
        const popoverRect = popoverEl.getBoundingClientRect();
        
        let position = currentStep.position || 'bottom';
        const offset = 15;

        // Check vertical bounds and flip if necessary to keep popover in viewport
        if (position === 'bottom' && rect.bottom + popoverRect.height + offset > window.innerHeight) {
          position = 'top';
        }
        if (position === 'top' && rect.top - popoverRect.height - offset < 0) {
          position = 'bottom';
        }
        
        setFinalPosition(position);

        const pos: PopoverPosition = { top: 0, left: 0 };
        if (position === 'top') {
          pos.top = rect.top - offset;
          pos.left = rect.left + rect.width / 2;
        } else {
          pos.top = rect.bottom + offset;
          pos.left = rect.left + rect.width / 2;
        }
        setPopoverPosition(pos);
      } else {
        setPopoverPosition(null);
      }
    } else {
      setPopoverPosition(null);
    }
  }, [isOpen, currentStep]);

  if (!isOpen) {
    return null;
  }

  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;

  const popoverStyle: React.CSSProperties = {};
  if (popoverPosition) {
    popoverStyle.top = `${popoverPosition.top}px`;
    popoverStyle.left = `${popoverPosition.left}px`;
    if (finalPosition === 'top') {
      popoverStyle.transform = 'translate(-50%, -100%)';
    } else {
      popoverStyle.transform = 'translateX(-50%)';
    }
  } else {
    popoverStyle.top = '50%';
    popoverStyle.left = '50%';
    popoverStyle.transform = 'translate(-50%, -50%)';
  }

  return (
    <>
      {!currentStep.targetId && <div className="tour-overlay" style={{ pointerEvents: 'auto' }} onClick={handleClose} />}
      <div ref={popoverRef} className="tour-popover" style={popoverStyle}>
        {popoverPosition && <div className={`tour-popover-arrow ${finalPosition === 'top' ? 'bottom' : 'top'}`}></div>}
        <h3 className="text-xl font-bold text-brand-light mb-2">{currentStep.title}</h3>
        <p className="text-gray-300 mb-4">{currentStep.content}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
                onClick={handleToggleVerbal}
                title={isVerbal ? 'Disable Verbal Guide' : 'Enable Verbal Guide'}
                className={`p-1.5 rounded-full transition-colors ${isVerbal ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:bg-gray-700'}`}
            >
                <SpeakerIcon active={isVerbal} />
            </button>
            <span className="text-sm text-gray-400">{stepIndex + 1} / {steps.length}</span>
          </div>
          <div className="flex gap-2">
            {!isFirstStep && (
              <button onClick={handlePrev} className="py-1 px-3 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition">
                Prev
              </button>
            )}
            <button onClick={isLastStep ? handleClose : handleNext} className="py-1 px-3 bg-brand-cyan text-white font-bold rounded-md hover:bg-cyan-500 transition">
              {isLastStep ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
        <button onClick={handleClose} className="absolute top-2 right-2 text-gray-500 hover:text-white transition text-2xl font-bold">&times;</button>
      </div>
    </>
  );
};