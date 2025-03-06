import React from 'react';

interface BriksLogoProps {
  className?: string;
  height?: number;
  width?: number;
}

export const BriksLogo: React.FC<BriksLogoProps> = ({ 
  className = "", 
  height = 40, 
  width = 120 
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 200 50" 
      width={width} 
      height={height}
      className={className}
    >
      {/* B */}
      <path d="M10,10 H30 C35,10 40,15 40,20 C40,25 35,30 30,30 H10 Z" fill="#6c5ce7"/>
      <path d="M10,30 H30 C35,30 40,35 40,40 C40,45 35,50 30,50 H10 Z" fill="#6c5ce7"/>
      <rect x="10" y="10" width="8" height="40" fill="#6c5ce7"/>
      
      {/* R */}
      <path d="M50,10 H70 C75,10 80,15 80,20 C80,25 75,30 70,30 H50 Z" fill="#6c5ce7"/>
      <path d="M50,30 L65,50" stroke="#6c5ce7" strokeWidth="8" strokeLinecap="round"/>
      <rect x="50" y="10" width="8" height="40" fill="#6c5ce7"/>
      
      {/* I */}
      <rect x="90" y="10" width="8" height="40" fill="#6c5ce7"/>
      
      {/* K */}
      <rect x="110" y="10" width="8" height="40" fill="#6c5ce7"/>
      <path d="M118,30 L135,10" stroke="#6c5ce7" strokeWidth="8" strokeLinecap="round"/>
      <path d="M118,30 L135,50" stroke="#6c5ce7" strokeWidth="8" strokeLinecap="round"/>
      
      {/* S */}
      <path d="M145,15 C145,12 148,10 155,10 C162,10 165,12 165,15 C165,25 145,25 145,35 C145,38 148,40 155,40 C162,40 165,38 165,35" stroke="#6c5ce7" strokeWidth="8" strokeLinecap="round" fill="none"/>
    </svg>
  );
};

export default BriksLogo;