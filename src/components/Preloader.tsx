'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete();
      }, 300); // Wait for fade out animation
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="text-center">
        {/* Logo */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-white p-3 rounded-lg shadow-2xl">
            <Image
              src="/logo.png"
              alt="College Logo"
              width={96}
              height={96}
              className="object-contain w-full h-full"
            />
          </div>
        </div>
        
        {/* Loading Text */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-2">Sarala Birla University</h2>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-blue-200 text-sm mt-4">Loading Dashboard...</p>
        </div>
      </div>
    </div>
  );
}

