import { create } from 'zustand';

interface AuthModalStore {
  isOpen: boolean;
  buttonClick: string;
  onOpen: () => void;
  onClose: () => void;
  setButtonClick: (buttonClick: string) => void;
};

const useAuthModal = create<AuthModalStore>((set) => ({
  isOpen: false,
  buttonClick: '',
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  setButtonClick: (value) => set({ buttonClick: value }),
}));

export default useAuthModal;