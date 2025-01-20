import { create } from 'zustand';

interface SubscribeModalStore {
  isOpen: boolean;
  buttonClick: string;
  onOpen: () => void;
  onClose: () => void;
  setButtonClick: (buttonClick: string) => void;
};

const useSubscribeModal = create<SubscribeModalStore>((set) => ({
  isOpen: false,
  buttonClick: '',
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  setButtonClick: (value) => set({ buttonClick: value }),
}));

export default useSubscribeModal;