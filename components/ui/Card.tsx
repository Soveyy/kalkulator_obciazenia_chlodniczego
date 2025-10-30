
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

const Card: React.FC<CardProps> = ({ children, className = '', as: Component = 'div' }) => {
  const baseClasses = "bg-white dark:bg-slate-800 p-5 rounded-lg shadow-md transition-colors duration-300";
  return (
    <Component className={`${baseClasses} ${className}`}>
      {children}
    </Component>
  );
};

export default Card;
