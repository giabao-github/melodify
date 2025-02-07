import * as Dialog from '@radix-ui/react-dialog';
import { IoCloseCircle } from 'react-icons/io5';


interface ModalProps {
  isOpen: boolean;
  onChange: (isOpen: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
  large?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onChange, title, description, children, large = false }) => {
  return (
    <Dialog.Root
      open={isOpen}
      defaultOpen={isOpen}
      onOpenChange={onChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          className='bg-neutral-900/90 backdrop-blur-sm fixed inset-0 z-[2]'
        />
        <Dialog.Content
          className={`z-50 fixed drop-shadow-md border border-yellow-500 top-[50%] left-[50%] max-h-full h-full md:max-h-[95vh] md:h-auto w-full translate-x-[-50%] translate-y-[-50%] rounded-md bg-background p-[25px] md:p-5 focus:outline-none ${large ? 'md:w-[120vw] md:max-w-[850px]' : 'md:w-[100vw] md:max-w-[500px]'}` }
        >
          <Dialog.Title
            className='text-3xl md:text-2xl text-center font-bold my-4'
          >
            {title}
          </Dialog.Title>
          <Dialog.Description
            className='mb-10 text-lg md:text-base leading-normal text-center'
          >
            {description}
          </Dialog.Description>
          <div>
            {children}
          </div>
          <Dialog.Close asChild>
            <button
              title='Close'
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