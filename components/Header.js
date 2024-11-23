"use client"
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { GoHomeFill } from "react-icons/go";
import { FaSearch } from "react-icons/fa";
import { FaUserAlt } from "react-icons/fa";
import { RiAiGenerate } from "react-icons/ri";
import { useUser } from "@/hooks/useUser";
import toast from "react-hot-toast";
import useAuthModal from "@/hooks/useAuthModal";
import Button from "./Button";
import { useEffect, useRef, useState } from "react";

const colorThemes = [
  { name: "Melodify Default", themeColor: "from-[#18FFFF]", bgColor: "bg-[#18FFFF]", textColor: "text-black" },
  { name: "Golden Hour", themeColor: "from-[#F7A800]", bgColor: "bg-[#F7A800]", textColor: "text-black" },
  { name: "Sunset Serenade", themeColor: "from-[#FF7F7F]", bgColor: "bg-[#FF7F7F]", textColor: "text-black" },
  { name: "Radiant Sunrise", themeColor: "from-[#FFB6C1]", bgColor: "bg-[#FFB6C1]", textColor: "text-black" },
  { name: "Electric Forest", themeColor: "from-[#00FF00]", bgColor: "bg-[#00FF00]", textColor: "text-black" },
  { name: "Icy Breeze", themeColor: "from-[#AEEEEE]", bgColor: "bg-[#AEEEEE]", textColor: "text-black" },
  { name: "Snowman", themeColor: "from-[#FFFAFA]", bgColor: "bg-[#FFFAFA]", textColor: "text-black" },
  { name: "Neon Dreams", themeColor: "from-[#9B59B6]", bgColor: "bg-[#9B59B6]", textColor: "text-white" },
  { name: "Forest Breeze", themeColor: "from-[#228B22]", bgColor: "bg-[#228B22]", textColor: "text-white" },
  { name: "Skyline Glow", themeColor: "from-[#87CEFA]", bgColor: "bg-[#87CEFA]", textColor: "text-white" },
  { name: "Neon Noir", themeColor: "from-[#333]", bgColor: "bg-[#333]", textColor: "text-white" },
  { name: "Ocean Waves", themeColor: "from-[#1E90FF]", bgColor: "bg-[#1E90FF]", textColor: "text-white" },
  { name: "Moonlit Jazz", themeColor: "from-[#B0C4DE]", bgColor: "bg-[#B0C4DE]", textColor: "text-black" },
  { name: "Cosmic Chill", themeColor: "from-[#7A6DFF]", bgColor: "bg-[#7A6DFF]", textColor: "text-white" },
  { name: "Crimson Wave", themeColor: "from-[#8B0000]", bgColor: "bg-[#8B0000]", textColor: "text-white" },
];

const Header = ({children, className}) => {
  const [userState, setUserState] = useState(null);
  const [hasShownWelcomeToast, setHasShownWelcomeToast] = useState(false);
  const [themeIndex, setThemeIndex] = useState(0);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null); 
  const router = useRouter();
  const { setButtonClick, onOpen } = useAuthModal();

  const supabaseClient = useSupabaseClient();
  const { user, userDetails } = useUser();

  const handleLogout = async () => {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      toast.remove();
      toast.error(error.message);
    } else {
      setUserState(false);
      toast.remove();
      toast.success('Logged out!');
    }

    router.refresh();
  }

  useEffect(() => {
    if (userDetails) {
      setUserState(true);
      if (!hasShownWelcomeToast) {
        toast.remove();
        toast.success(`Welcome back, ${userDetails.first_name} ${userDetails.last_name}!`);
        setHasShownWelcomeToast(true);
      }
    } else if (user) {
      setUserState(true);
      if (!hasShownWelcomeToast) { 
        toast.remove();
        toast.success(`Welcome back, ${user.email}!`);
        setHasShownWelcomeToast(true);
      }
    } else {
      setUserState(false);
      setHasShownWelcomeToast(false);
    }
  }, [user, userDetails, hasShownWelcomeToast]);

  const handleThemeSelection = (index) => {
    setThemeIndex(index);
    setIsDropdownVisible(false);
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !buttonRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const calculateDropdownPosition = () => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      return {
        top: buttonRect.top,
        left: buttonRect.right + window.scrollX,
      };
    }
    return { top: 0, left: 0 };
  };

  const currentTheme = colorThemes[themeIndex];
  const dropdownPosition = calculateDropdownPosition();

  return (
    <div 
      className={twMerge(
        `h-fit p-6 transition-all`, 
        className,
        `bg-gradient-to-b ${currentTheme.themeColor} to-neutral-900`
      )}
    >
      <div className='w-full mb-4 flex items-center justify-between'>
        <div className='hidden md:flex gap-x-2 items-center'>
          <Button
            onClick={() => router.back()}
            className='p-2 rounded-full bg-black flex items-center justify-center hover:opacity-100 transition'>
            <FaAngleLeft className='text-white hover:text-primaryAccent' size={24} />
          </Button>
          <Button
            onClick={() => router.forward()} 
            className='p-2 rounded-full bg-black flex items-center justify-center hover:opacity-100 transition'>
            <FaAngleRight className='text-white hover:text-primaryAccent' size={24} />
          </Button>
          <Button
            ref={buttonRef} 
            onClick={() => setIsDropdownVisible(!isDropdownVisible)} 
            className='border border-white bg-white hover:opacity-90 hover:scale-110 mx-6 px-6 py-2 whitespace-nowrap transition-none'
          >
            Switch theme
          </Button>
          {isDropdownVisible && (
            <div 
              ref={dropdownRef}
              className='absolute bg-neutral-200 shadow-lg rounded-lg p-4 max-w-full z-10 mx-4 flex flex-col gap-y-1'
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
              }}
            >
              <div className='grid grid-cols-3 gap-4'>
                {colorThemes.map((theme, index) => (
                  <Button 
                    key={index} 
                    onClick={() => handleThemeSelection(index)}
                    className={`${theme.textColor} py-2 px-4 ${theme.bgColor} hover:scale-105 hover:opacity-100 w-full text-left`}
                  >
                    {theme.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className='flex md:hidden gap-x-2 items-center'>
          <Button className='rounded-full p-2 bg-white flex items-center justify-center hover:opacity-75 transition'>
            <GoHomeFill className='text-black' size={24} />
          </Button>
          <Button className='rounded-full p-2 bg-white flex items-center justify-center hover:opacity-75 transition'>
            <FaSearch className='text-black' size={24} />
          </Button>
          <Button className='rounded-full p-2 bg-white flex items-center justify-center hover:opacity-75 transition'>
            <RiAiGenerate className='text-black' size={24} />
          </Button>
        </div>
        {userState === null ? (<></>) : (
          <div className='flex justify-between items-center gap-x-4'>
            {userState ? (
              <div className='flex gap-x-4 items-center'>
                <Button
                  onClick={handleLogout}
                  className='border border-white bg-white hover:opacity-90 hover:scale-110 px-6 py-2 whitespace-nowrap transition-none'
                >
                  Log out
                </Button>
                <Button
                  onClick={() => router.push('/account')}
                  className='border border-white bg-white hover:opacity-90 hover:scale-110 rounded-full p-4 ml-3 flex items-center justify-center transition-none'
                >
                  <FaUserAlt size={18} />
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <Button
                    onClick={() => {
                      setButtonClick('sign_up');
                      onOpen();
                    }} 
                    className='bg-white hover:opacity-90 hover:scale-110 px-6 py-2 font-bold transition-colors duration-200'
                  >
                    Sign up
                  </Button>
                </div>
                <div>
                  <Button
                    onClick={() => {
                      setButtonClick('sign_in'); 
                      onOpen();
                    }}
                    className='bg-white hover:opacity-90 hover:scale-110 px-6 py-2 font-bold transition-colors duration-200'
                  >
                    Log in
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}

export default Header;
