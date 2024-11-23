"use client";
import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToasterProvider = () => {
  return (
    <Toaster
      toastOptions={{
        style: {
          background: '#333',
          color: '#fff',
          maxWidth: '100%',
          marginTop: '8px'
        }
      }} 
    />
  );
};

export default ToasterProvider;