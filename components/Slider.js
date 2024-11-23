"use client";

import React from 'react';
import * as RadixSlider from '@radix-ui/react-slider';

const Slider = ({ value = 1, onChange, label, background, foreground, thick, className, isRounded }) => {
  const handleChange = (newValue) => {
    onChange?.(newValue[0]);
  }

  return (
    <RadixSlider.Root
      defaultValue={[1]}
      value={[value]}
      onValueChange={handleChange}
      max={1}
      step={0.01}
      aria-label={label}
      title={label.length > 0 ? `${label}: ${Math.round(value * 100)}%` : ''}
      className={`relative flex items-center select-none touch-none w-full h-12 ${className}`}
    >
      <RadixSlider.Track
        className={`${background} relative grow ${isRounded} ${thick} cursor-pointer`}
      >
        <RadixSlider.Range className={`${foreground} absolute ${isRounded} h-full`} />
      </RadixSlider.Track>
    </RadixSlider.Root>
  );
};

export default Slider;