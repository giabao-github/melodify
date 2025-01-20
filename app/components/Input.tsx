import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: string;
  paragraph?: boolean;
}

const Input = forwardRef<HTMLInputElement | HTMLAreaElement, InputProps>(({ className, type, disabled, paragraph = false, ...props }, ref) => {
  if (paragraph) {
    const { onChange, ...textareaProps } = props as React.TextareaHTMLAttributes<HTMLTextAreaElement>;
    return (
      <textarea
        rows={5}
        className={twMerge(`flex w-full rounded-md bg-neutral-700 border border-transparent px-3 py-3 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none`, className)}
        ref={ref as React.Ref<HTMLTextAreaElement>}
        disabled={disabled}
        onChange={onChange}
        {...textareaProps}
      />
    );
  } 

  return (
    <input
      type={type}
      className={twMerge(`flex w-full rounded-md bg-neutral-700 border border-transparent px-3 py-3 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none`, className)}
      disabled={disabled}
      ref={ref as React.Ref<HTMLInputElement>}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;
