import { create } from 'zustand';

interface OptionsModalStore {
  isOpen: boolean;
  buttonClick: string;
  title: string;
  description: string;
  onOpen: () => void;
  onClose: () => void;
  setButtonClick: (buttonClick: string) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
};

const useOptionsModal = create<OptionsModalStore>((set) => ({
  isOpen: false,
  buttonClick: '',
  title: '',
  description: '',
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  setButtonClick: (value) => set({ buttonClick: value }),
  setTitle: (value: string) => set({ title: value }),
  setDescription: (value: string) => set({ description: value }),
}));

export default useOptionsModal;