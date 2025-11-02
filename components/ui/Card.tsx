import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ children, className = '', as: Component = 'div' }, ref) => {
  const baseClasses = "bg-white dark:bg-slate-800 p-5 rounded-lg shadow-md transition-colors duration-300";
  return (
    <Component className={`${baseClasses} ${className}`} ref={ref}>
      {children}
    </Component>
  );
});

Card.displayName = 'Card';

export default Card;