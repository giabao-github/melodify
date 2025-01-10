"use client";
import React, { useEffect } from 'react'
import Modal from './Modal';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import '../css/AuthModal.css';
import Button from './Button';
import useOptionsModal from '../hooks/useOptionsModal';
import useAuthModal from '../hooks/useAuthModal';


const OptionsModal = () => {
  const router = useRouter();
  const { session } = useSessionContext();
  const { onClose, isOpen, title, description } = useOptionsModal();
  const { setButtonClick, onOpen } = useAuthModal();

  useEffect(() => {
    if (session) {
      router.refresh();
      onClose();
    }
  }, [session, router, onClose]);

  const onChange = (open) => {
    if (!open) {
      onClose();
    }
  }

  return (
    <Modal
      title={title}
      description={description}
      isOpen={isOpen}
      onChange={onChange}
    >
      <div className='flex justify-around items-center'>
        <div>
          <Button
            onClick={() => {
              setButtonClick('sign_up');
              onOpen();
              onClose();
            }} 
            className='bg-white hover:bg-secondaryAccent hover:opacity-100 px-[23px] py-2 font-bold transition-colors duration-200'
          >
            Sign up
          </Button>
        </div>
        <div>
          <Button
            onClick={() => {
              setButtonClick('sign_in'); 
              onOpen();
              onClose();
            }}
            className='bg-white hover:bg-primaryAccent hover:opacity-100 px-7 py-2 font-bold transition-colors duration-200'
          >
            Log in
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default OptionsModal;
