import { useEffect, useRef, useState } from 'react';

export default function TypeWriter({ texts = [], speed = 60, pause = 2000, className = '' }) {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!texts.length) return;
    const current = texts[textIndex];

    if (!deleting && charIndex < current.length) {
      timeoutRef.current = setTimeout(() => {
        setDisplayText(current.slice(0, charIndex + 1));
        setCharIndex(i => i + 1);
      }, speed);
    } else if (!deleting && charIndex === current.length) {
      timeoutRef.current = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIndex > 0) {
      timeoutRef.current = setTimeout(() => {
        setDisplayText(current.slice(0, charIndex - 1));
        setCharIndex(i => i - 1);
      }, speed / 2);
    } else if (deleting && charIndex === 0) {
      setDeleting(false);
      setTextIndex(i => (i + 1) % texts.length);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [charIndex, deleting, textIndex, texts, speed, pause]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-type-cursor border-r-2 border-phish-primary ml-0.5 inline-block">&nbsp;</span>
    </span>
  );
}
