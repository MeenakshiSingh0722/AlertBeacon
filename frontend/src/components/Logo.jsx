import React from 'react';

const Logo = ({ className = "", size = "small" }) => {
  const sizeClasses = {
    small: "w-8 h-8 text-sm",
    medium: "w-12 h-12 text-lg",
    large: "w-16 h-16 text-xl"
  };

  return (
    <div className={`
      ${sizeClasses[size]} 
      ${className}
      bg-gradient-to-br from-blue-600 to-blue-800 
      rounded-lg 
      flex items-center justify-center
      font-bold text-white
      shadow-lg
      border border-blue-500
    `}>
      AB
    </div>
  );
};

export default Logo;
