import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { IoCloseCircle } from "react-icons/io5";

const Modal = ({ isOpen, onChange, title, description, children, large = false }) => {
  return (
    <Dialog.Root
      open={isOpen}
      defaultOpen={isOpen}
      onOpenChange={onChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          className='bg-neutral-900/90 backdrop-blur-sm fixed inset-0'
        />
        <Dialog.Content
          className={`fixed drop-shadow-md border border-yellow-500 top-[50%] left-[50%] max-h-full h-full md:h-auto md:max-h-[85vh] w-full translate-x-[-50%] translate-y-[-50%] rounded-md bg-background p-[25px] focus:outline-none ${large ? 'md:w-[120vw] md:max-w-[850px]' : 'md:w-[90vw] md:max-w-[450px]'}` }
        >
          <Dialog.Title
            className='text-3xl text-center font-bold mb-4'
          >
            {title}
          </Dialog.Title>
          <Dialog.Description
            className='mb-10 text-lg leading-normal text-center'
          >
            {description}
          </Dialog.Description>
          <div>
            {children}
          </div>
          <Dialog.Close asChild>
            <button
              className='text-neutral-400 hover:text-white absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:outline-none'
            >
              <IoCloseCircle size={20} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default Modal;