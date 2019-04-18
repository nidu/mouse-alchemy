import { useRef, useEffect, useState } from 'react';

export function firestoreDocsToArray(snapshot) {
  const els = [];
  snapshot.forEach(doc => els.push({
    ...doc.data(),
    id: doc.id
  }));
  return els;
}

export function usePulse({ min, step, max, immediate, interval }) {
  min = min || 0;
  max = max || 1;
  step = step || 1;
  interval = interval || 1000;

  const [currentStep, setCurrentStep] = useState(min);
  const currentStepRef = useRef(currentStep);
  const signRef = useRef(1);
  
  function advance() {
    const newStep = currentStepRef.current + step * signRef.current;
    if (newStep <= min || newStep >= max) {
      signRef.current = -signRef.current;
    }
    currentStepRef.current = newStep;
    setCurrentStep(newStep);
  }

  useEffect(() => {
    if (immediate) {
      setTimeout(advance);
    }
    const timer = setInterval(() => {
      advance();
    }, interval);
    return () => clearInterval(timer);
  }, [min, max, interval]);

  return currentStep;
}

export function useShaker({steps, shake, interval, shakeOnMount}) {
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (shake && (shakeOnMount || mounted)) {
      let i = steps;
      setStep(i);
      const timer = setInterval(() => {
        if (i === 0) {
          clearInterval(timer);
        } else {
          i -= 1;
        }
        setStep(i);
      }, interval);
    }

    if (!mounted) setMounted(true);
  }, [shake]);

  return step;
}