"use client";

import React, { useState, useEffect } from 'react';

interface TypewriterProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export function WordTypewriter({ 
  texts, 
  typingSpeed = 40,   // Fast and smooth character typing
  deletingSpeed = 20, // Even faster deletion
  pauseDuration = 2500 
}: TypewriterProps) {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const currentFullText = texts[textIndex];
    
    // Finished typing current text
    if (!isDeleting && charIndex === currentFullText.length) {
      const timer = setTimeout(() => setIsDeleting(true), pauseDuration);
      return () => clearTimeout(timer);
    }
    
    // Finished deleting current text
    if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setTextIndex((prev) => (prev + 1) % texts.length);
      return;
    }

    // Type or delete next character
    const timer = setTimeout(() => {
      setCharIndex(prev => isDeleting ? prev - 1 : prev + 1);
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, textIndex, texts, typingSpeed, deletingSpeed, pauseDuration]);

  const displayedText = texts[textIndex].substring(0, charIndex);

  return (
    <span className="inline-block min-h-[5rem]">
      {displayedText.split('\n').map((line, i, arr) => (
        <React.Fragment key={i}>
          {line}
          {i < arr.length - 1 && <br />}
        </React.Fragment>
      ))}
      <span className="animate-pulse inline-block ml-1 bg-black w-3 h-4 align-middle"></span>
    </span>
  );
}
