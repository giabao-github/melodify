import { League_Spartan , Bungee_Inline, Geologica } from 'next/font/google';
import React from 'react';
import { IoCloseCircle } from "react-icons/io5";


const spartan = League_Spartan({ weight: '400', subsets: ["latin", "vietnamese"]});
const geologica = Geologica({ subsets: ["latin", "cyrillic", "vietnamese", "greek"]});
const bungee = Bungee_Inline({ weight: '400' ,subsets: ["latin", "vietnamese"]});

const InteractiveModal = ({ isOpen, onChange, title, description, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed drop-shadow-md border border-primaryAccent top-[50%] left-[50%] max-h-full md:h-[83vh] w-full md:w-[85vw] md:max-w-[650px] translate-x-[-50%] translate-y-[-56%] rounded-md bg-neutral-700 p-[25px] z-[1000]`}
    >
      <div className={`flex justify-center items-center text-3xl text-center font-black mb-4 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 px-5 py-2 rounded-full shadow-md max-w-fit uppercase ${bungee.className}`}>
        {title}
      </div>
      <div className={`mb-10 text-lg font-semibold leading-normal text-center flex justify-center items-center border-b border-neutral-500 pb-4 m-auto max-w-[90%] ${geologica.className}`}>
        {description}
      </div>

      <div className={`${spartan.className}`}>
        {children}
      </div>
      <button
        onClick={() => onChange(false)}
        className='text-neutral-400 hover:text-white absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full'
      >
        <IoCloseCircle size={20} />
      </button>
    </div>
  );
}

export default InteractiveModal;
