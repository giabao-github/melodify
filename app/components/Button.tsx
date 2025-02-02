import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';


interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, children, disabled, type = 'button', ...props }, ref) => {
  return (
    <button 
      ref={ref} 
      type={type} 
      className={twMerge(`w-full rounded-full select-none text-black font-bold bg-button border border-transparent px-3 py-3 disabled:cursor-not-allowed disabled:opacity-50 disabled:ring-0 hover:ring-2 hover:ring-white transition`, className)} 
      disabled={disabled} 
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
