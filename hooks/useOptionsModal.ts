import { create } from 'zustand';

interface OptionsModalStore {
  isOpen: boolean;
  buttonClick: string;
  onOpen: () => void;
  onClose: () => void;
  setButtonClick: (buttonClick: string) => void;
};

const useOptionsModal = create<OptionsModalStore>((set) => ({
  isOpen: false,
  buttonClick: '',
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  setButtonClick: (value) => set({ buttonClick: value }),
}));

export default useOptionsModal;