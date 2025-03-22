import React from 'react';

type BasquiatHeaderProps = {
  title: string;
  subtitle?: string;
};

export function BasquiatHeader({ title, subtitle }: BasquiatHeaderProps) {
  return (
    <div className="relative pb-8 mb-4">
      {/* Background elements */}
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#ff445b] opacity-30"></div>
      <div className="absolute top-1/4 right-1/4 w-8 h-8 border-2 border-[#f3e600] transform rotate-45 opacity-60"></div>
      <div className="absolute bottom-0 left-1/3 w-12 h-3 bg-[#12ff7d] opacity-50"></div>
      
      {/* Title with paint-like effect */}
      <h1 className="text-4xl md:text-5xl font-bold uppercase relative inline-block mb-2">
        <span className="relative z-10">{title}</span>
        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-[#ff445b]"></div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-[#12ff7d]"></div>
        
        {/* Text scratch effect */}
        <div className="absolute top-1/2 left-0 w-full h-[3px] bg-black transform -rotate-1"></div>
      </h1>
      
      {/* Subtitle with chaotic styling */}
      {subtitle && (
        <div className="text-sm uppercase tracking-wide text-gray-400 relative ml-4">
          <span className="relative z-10">{subtitle}</span>
          <div className="absolute -bottom-1 left-0 h-3 w-3/4 bg-[#ff445b] opacity-10 transform -skew-x-12"></div>
          
          {/* Random Basquiat-style elements */}
          <div className="absolute -left-3 top-1/2 w-1 h-1 rounded-full bg-[#f3e600]"></div>
          <div className="absolute right-1/4 bottom-0 w-2 h-2 bg-[#12ff7d]"></div>
        </div>
      )}
      
      {/* Crown - Basquiat signature element */}
      <div className="absolute -top-3 right-0 transform rotate-12">
        <div className="relative">
          <div className="flex space-x-1">
            <div className="w-2 h-4 bg-[#f3e600]"></div>
            <div className="w-2 h-6 bg-[#f3e600]"></div>
            <div className="w-2 h-5 bg-[#f3e600]"></div>
          </div>
          <div className="absolute top-full left-0 text-xs font-bold text-[#f3e600]">©</div>
        </div>
      </div>
    </div>
  );
} 