import React from 'react';

interface SafeImageProps {
  id?: string;
  src?: string | null;
  alt: string;
  className?: string;
}

export default function SafeImage({ id, src, alt, className = '' }: SafeImageProps) {
  const isExternalOrPlaceholder = !src || src.includes('unsplash.com') || src.startsWith('http');

  if (isExternalOrPlaceholder) {
    return (
      <div id={id} className={`image-placeholder flex flex-col items-center justify-center p-6 text-center bg-slate-50/70 border border-dashed border-slate-200 text-slate-500 rounded-2xl min-h-[180px] h-full w-full font-sans text-xs gap-2 ${className}`}>
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-slate-450" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <span className="font-semibold text-slate-600 block">Photo Coming Soon</span>
        <span className="text-[10px] text-slate-400 max-w-[200px] block leading-tight">{alt}</span>
      </div>
    );
  }

  return (
    <img 
      id={id}
      src={src} 
      alt={alt} 
      className={className} 
      referrerPolicy="no-referrer"
    />
  );
}
