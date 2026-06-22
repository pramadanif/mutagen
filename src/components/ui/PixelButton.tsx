import React, { ButtonHTMLAttributes } from 'react';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function PixelButton({ children, className = '', ...props }: PixelButtonProps) {
  return (
    <button
      className={`bg-mutagen-green text-black border-4 border-black uppercase font-header text-[0.8rem] cursor-pointer transition-all duration-100 relative inline-flex items-center justify-center shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] hover:bg-[#5cff42] active:translate-x-[4px] active:translate-y-[4px] active:shadow-[0px_0px_0px_transparent] active:bg-[#2ccc0d] after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:h-[3px] after:bg-[rgba(255,255,255,0.4)] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
