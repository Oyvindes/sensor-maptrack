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
      viewBox="0 0 140 50"
      width={width}
      height={height}
      className={className}
    >
      {/* Dot */}
      <rect x="115" y="2" width="10" height="10" fill="#6c5ce7"/>
      
      {/* BRIKS text */}
      <path
        d="M5,10 h25 v6 h-15 v6 h15 v6 h-25 v-18"
        fill="#6c5ce7"
        strokeWidth="4"
        stroke="#6c5ce7"
        strokeLinejoin="round"
      />
      <path
        d="M35,10 h20 l8,9 l-8,9 h-20 v-18"
        fill="#6c5ce7"
        strokeWidth="4"
        stroke="#6c5ce7"
        strokeLinejoin="round"
      />
      <path
        d="M65,10 h12 v18 h-12 v-18"
        fill="#6c5ce7"
        strokeWidth="4"
        stroke="#6c5ce7"
        strokeLinejoin="round"
      />
      <path
        d="M82,10 h12 l15,18 h-12 l-15,-18"
        fill="#6c5ce7"
        strokeWidth="4"
        stroke="#6c5ce7"
        strokeLinejoin="round"
      />
      <path
        d="M110,10 h25 v6 h-15 v6 h15 v6 h-25 v-18"
        fill="#6c5ce7"
        strokeWidth="4"
        stroke="#6c5ce7"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default BriksLogo;