import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface PlanGenerationLoadingScreenProps {
  onComplete: () => void;
}

// Animation stages with timing
const stages = [
  { text: "Analyzing your notes…", duration: 1200 },
  { text: "Extracting key concepts", duration: 1200 },
  { text: "Organizing your study plan", duration: 1000 },
  { text: "Turning into practice cards", duration: 1000 },
  { text: "Almost ready…", duration: 600 }
];

export function PlanGenerationLoadingScreen({ onComplete }: PlanGenerationLoadingScreenProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let accumulatedTime = 0;
    const timers: NodeJS.Timeout[] = [];
    
    // Stage transitions
    stages.forEach((stage, index) => {
      const timer = setTimeout(() => {
        setCurrentStage(index);
      }, accumulatedTime);
      timers.push(timer);
      accumulatedTime += stage.duration;
    });

    // Smooth progress animation
    const totalDuration = stages.reduce((sum, s) => sum + s.duration, 0);
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const next = prev + (100 / totalDuration) * 50;
        return next >= 100 ? 100 : next;
      });
    }, 50);

    // Complete after all stages
    const completeTimer = setTimeout(() => {
      onComplete();
    }, totalDuration);
    timers.push(completeTimer);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="w-full h-full bg-[#FFFEF8] flex items-center justify-center overflow-hidden relative">
      {/* Notebook paper lines background */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="notebook-lines" x="0" y="0" width="100" height="32" patternUnits="userSpaceOnUse">
              <path d="M 0 32 Q 25 31 50 32 T 100 32" stroke="#D4B896" strokeWidth="1" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#notebook-lines)" />
        </svg>
      </div>

      {/* Vertical margin line like a real notebook */}
      <div className="absolute left-16 top-0 bottom-0 w-px bg-red-300 opacity-30" />

      {/* Main content container */}
      <div className="flex flex-col items-center w-full max-w-3xl px-8 relative z-10 py-8">
        
        {/* Title - Handwritten style */}
        <motion.h1 
          className="text-3xl text-gray-800 mb-6"
          style={{ fontFamily: "'Caveat', cursive", fontWeight: 600 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Creating your study plan
        </motion.h1>
        
        {/* Hand-drawn illustration area */}
        <div className="relative w-full h-64 mb-6 flex items-center justify-center">
          
          {/* Stage 1: Note with pen - handwritten lines */}
          {currentStage === 0 && (
            <motion.svg 
              width="280" 
              height="220" 
              viewBox="0 0 280 220"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Paper outline - wobbly hand-drawn */}
              <motion.path
                d="M 35 20 Q 37 18 40 18 L 238 19 Q 242 20 243 24 L 242 198 Q 241 202 237 203 L 42 204 Q 38 203 37 199 Z"
                fill="#FFFBF0"
                stroke="#666"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
              
              {/* Handwritten text lines - wobbly */}
              <motion.path
                d="M 55 50 Q 80 48 120 50 Q 160 51 215 49"
                stroke="#444"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              />
              <motion.path
                d="M 55 75 Q 90 73 130 75 Q 170 76 200 74"
                stroke="#444"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              />
              <motion.path
                d="M 55 100 Q 80 98 115 100 Q 155 101 210 99"
                stroke="#444"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              />
              <motion.path
                d="M 55 125 Q 75 123 110 125 Q 145 126 195 124"
                stroke="#444"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              />
              
              {/* Yellow highlighter - imperfect shape */}
              <motion.path
                d="M 53 69 L 202 68 L 203 81 L 54 82 Z"
                fill="#FDEA3B"
                opacity="0.4"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 0.4 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                style={{ transformOrigin: 'left center' }}
              />
              
              {/* Hand-drawn underline - wobbly */}
              <motion.path
                d="M 55 108 Q 95 110 145 108 Q 185 107 215 109"
                stroke="#2D8CFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              />
              
              {/* Animated pen */}
              <motion.g
                animate={{ 
                  x: [190, 200, 190],
                  y: [80, 85, 80],
                  rotate: [-35, -30, -35]
                }}
                transition={{ 
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Pen body */}
                <path d="M 0 0 L 10 10 L 8 12 L -2 2 Z" fill="#2D8CFF" />
                <path d="M 10 10 L 15 15" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
                <circle cx="14" cy="14" r="1.5" fill="#1a1a1a" />
              </motion.g>
            </motion.svg>
          )}

          {/* Stage 2: Notes splitting - scissors cutting */}
          {currentStage === 1 && (
            <motion.svg 
              width="360" 
              height="220" 
              viewBox="0 0 360 220"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* Dotted cutting line */}
              <motion.path
                d="M 180 30 Q 182 65 180 100 Q 178 135 180 170 Q 182 195 180 210"
                stroke="#2D8CFF"
                strokeWidth="2.5"
                strokeDasharray="6,8"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.0 }}
              />
              
              {/* Left card - wobbly edges */}
              <motion.g
                initial={{ x: 0 }}
                animate={{ x: -40 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                <path
                  d="M 50 70 Q 52 68 55 68 L 140 69 Q 144 70 145 74 L 144 146 Q 143 150 139 151 L 55 152 Q 51 151 50 147 Z"
                  fill="#FFFBF0"
                  stroke="#555"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path d="M 65 95 Q 80 94 115 95" stroke="#666" strokeWidth="2" strokeLinecap="round" fill="none" />
                <path d="M 65 115 Q 75 114 105 115" stroke="#666" strokeWidth="2" strokeLinecap="round" fill="none" />
              </motion.g>
              
              {/* Right card */}
              <motion.g
                initial={{ x: 0 }}
                animate={{ x: 40 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                <path
                  d="M 215 70 Q 217 68 220 68 L 305 69 Q 309 70 310 74 L 309 146 Q 308 150 304 151 L 220 152 Q 216 151 215 147 Z"
                  fill="#FFFBF0"
                  stroke="#555"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path d="M 230 95 Q 245 94 280 95" stroke="#666" strokeWidth="2" strokeLinecap="round" fill="none" />
                <path d="M 230 115 Q 240 114 270 115" stroke="#666" strokeWidth="2" strokeLinecap="round" fill="none" />
              </motion.g>
              
              {/* Scissors moving down */}
              <motion.g
                initial={{ y: 0 }}
                animate={{ y: 145 }}
                transition={{ duration: 1.0, ease: "easeInOut" }}
              >
                <circle cx="174" cy="35" r="7" fill="none" stroke="#333" strokeWidth="2" />
                <circle cx="186" cy="35" r="7" fill="none" stroke="#333" strokeWidth="2" />
                <path d="M 174 42 L 180 55" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 186 42 L 180 55" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
              </motion.g>
            </motion.svg>
          )}

          {/* Stage 3: Cards organizing into grid */}
          {currentStage === 2 && (
            <motion.svg 
              width="420" 
              height="220" 
              viewBox="0 0 420 220"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {[
                { x: 30, y: 35, delay: 0 },
                { x: 150, y: 35, delay: 0.1 },
                { x: 270, y: 35, delay: 0.2 },
                { x: 30, y: 130, delay: 0.15 },
                { x: 150, y: 130, delay: 0.25 },
                { x: 270, y: 130, delay: 0.35 }
              ].map((pos, i) => (
                <motion.g
                  key={i}
                  initial={{ 
                    x: 210, 
                    y: 110,
                    scale: 0,
                    rotate: Math.random() * 360 - 180
                  }}
                  animate={{ 
                    x: pos.x, 
                    y: pos.y,
                    scale: 1,
                    rotate: Math.random() * 6 - 3
                  }}
                  transition={{ 
                    duration: 0.7,
                    delay: pos.delay,
                    type: "spring",
                    stiffness: 110,
                    damping: 13
                  }}
                >
                  {/* Wobbly card */}
                  <path
                    d={`M ${5 + Math.random()} ${5 + Math.random()} Q ${7 + Math.random()} ${3 + Math.random()} ${10 + Math.random()} ${4 + Math.random()} L ${88 + Math.random()} ${5 + Math.random()} Q ${92 + Math.random()} ${6 + Math.random()} ${93 + Math.random()} ${10 + Math.random()} L ${92 + Math.random()} ${70 + Math.random()} Q ${91 + Math.random()} ${74 + Math.random()} ${87 + Math.random()} ${75 + Math.random()} L ${10 + Math.random()} ${76 + Math.random()} Q ${6 + Math.random()} ${75 + Math.random()} ${5 + Math.random()} ${71 + Math.random()} Z`}
                    fill="#FFFBF0"
                    stroke="#555"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path d="M 13 22 Q 30 21 68 22" stroke="#666" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <path d="M 13 35 Q 25 34 58 35" stroke="#666" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <circle cx="82" cy="15" r="4" fill="#FDEA3B" />
                </motion.g>
              ))}
            </motion.svg>
          )}

          {/* Stage 4: Flashcards with Q&A */}
          {currentStage === 3 && (
            <motion.svg 
              width="380" 
              height="220" 
              viewBox="0 0 380 220"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.g
                  key={i}
                  initial={{ rotateY: 0, x: 125 * i + 15 }}
                  animate={{ rotateY: 180, x: 125 * i + 15 }}
                  transition={{ 
                    duration: 0.7,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                  style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
                >
                  {/* Card with wobbly edges */}
                  <path
                    d="M 5 5 Q 7 3 10 3 L 98 4 Q 104 5 105 11 L 104 124 Q 103 130 97 131 L 10 132 Q 4 131 3 125 Z"
                    fill="#FFFBF0"
                    stroke="#555"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  
                  {/* Q - hand-drawn style */}
                  <text 
                    x="17" 
                    y="35" 
                    fontSize="26" 
                    fontWeight="600" 
                    fill="#2D8CFF"
                    fontFamily="'Caveat', cursive"
                  >
                    Q
                  </text>
                  <path d="M 17 46 Q 33 45 67 46" stroke="#666" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <path d="M 17 58 Q 29 57 62 58" stroke="#666" strokeWidth="2" strokeLinecap="round" fill="none" />
                  
                  {/* Divider - dashed yellow line */}
                  <path 
                    d="M 17 79 Q 37 80 58 79 Q 79 78 90 79" 
                    stroke="#FDEA3B" 
                    strokeWidth="3" 
                    strokeDasharray="5,4" 
                    strokeLinecap="round"
                    fill="none"
                  />
                  
                  {/* A - hand-drawn style */}
                  <text 
                    x="17" 
                    y="106" 
                    fontSize="26" 
                    fontWeight="600" 
                    fill="#10B981"
                    fontFamily="'Caveat', cursive"
                  >
                    A
                  </text>
                  <path d="M 17 117 Q 33 116 70 117" stroke="#666" strokeWidth="2" strokeLinecap="round" fill="none" />
                </motion.g>
              ))}
            </motion.svg>
          )}

          {/* Stage 5: Ready - Cards breathing */}
          {currentStage === 4 && (
            <motion.svg 
              width="400" 
              height="220" 
              viewBox="0 0 400 220"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {[0, 1, 2, 3].map((i) => (
                <motion.g
                  key={i}
                  animate={{ 
                    scale: [1, 1.06, 1],
                    y: [0, -8, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                  style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
                >
                  <g transform={`translate(${i * 96 + 15}, 40)`}>
                    {/* Wobbly card */}
                    <path
                      d="M 4 4 Q 6 2 9 2 L 71 3 Q 77 4 78 10 L 77 108 Q 76 114 70 115 L 9 116 Q 3 115 2 109 Z"
                      fill="#FFFBF0"
                      stroke="#555"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    
                    {/* Plus icon - hand-drawn */}
                    <circle cx="40" cy="59" r="17" fill="#FDEA3B" opacity="0.35" />
                    <path d="M 40 46 Q 40.5 51 40 59 Q 39.5 67 40 72" stroke="#2D8CFF" strokeWidth="3" strokeLinecap="round" fill="none" />
                    <path d="M 27 59 Q 32 59.5 40 59 Q 48 58.5 53 59" stroke="#2D8CFF" strokeWidth="3" strokeLinecap="round" fill="none" />
                  </g>
                </motion.g>
              ))}
            </motion.svg>
          )}
        </div>

        {/* Dynamic text - Handwritten style */}
        <motion.p 
          key={currentStage}
          className="text-xl text-gray-700 mb-8"
          style={{ fontFamily: "'Caveat', cursive", fontWeight: 500 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {stages[currentStage].text}
        </motion.p>

        {/* Hand-drawn progress bar */}
        <div className="w-full max-w-lg mb-4">
          <svg width="100%" height="30" viewBox="0 0 500 30" preserveAspectRatio="none">
            {/* Background track - wobbly line */}
            <motion.path
              d="M 15 20 Q 125 18 250 20 Q 375 22 485 20"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="10"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8 }}
            />
            
            {/* Progress fill - wobbly line */}
            <motion.path
              d="M 15 20 Q 125 18 250 20 Q 375 22 485 20"
              fill="none"
              stroke="#2D8CFF"
              strokeWidth="10"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progress / 100 }}
              transition={{ duration: 0.15 }}
            />
            
            {/* Moving dot with hand-drawn circle */}
            <motion.circle
              cx="15"
              cy="20"
              r="8"
              fill="#FDEA3B"
              stroke="#333"
              strokeWidth="2.5"
              initial={{ cx: 15 }}
              animate={{ cx: 15 + (470 * progress / 100) }}
              transition={{ duration: 0.15 }}
            />
          </svg>
          
          {/* Progress percentage - handwritten */}
          <p 
            className="text-base text-gray-600 text-center mt-3"
            style={{ fontFamily: "'Patrick Hand', cursive" }}
          >
            {Math.floor(progress)}%
          </p>
        </div>

        {/* Stage dots - hand-drawn circles */}
        <div className="flex gap-4">
          {stages.map((_, index) => (
            <motion.svg
              key={index}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              initial={{ scale: 0.9 }}
              animate={{ scale: index === currentStage ? 1.4 : 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hand-drawn circle */}
              <motion.circle
                cx="12"
                cy="12"
                r="8"
                fill={index <= currentStage ? '#2D8CFF' : 'transparent'}
                stroke={index <= currentStage ? '#2D8CFF' : '#D1D5DB'}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {index <= currentStage && (
                <motion.path
                  d="M 7 12 Q 9 14 10 15 Q 12 13 17 8"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                />
              )}
            </motion.svg>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PlanGenerationLoadingScreen;