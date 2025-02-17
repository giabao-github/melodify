"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import toast from 'react-hot-toast';
import { FaAngleLeft, FaAngleRight, FaCircleUser } from 'react-icons/fa6';
import { FaSearch } from 'react-icons/fa';
import { GoHomeFill } from 'react-icons/go';
import { RiAiGenerate } from 'react-icons/ri';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useUser } from '../hooks/useUser';
import useAuthModal from '../hooks/useAuthModal';
import Button from './Button';
import useSubscribeModal from '../hooks/useSubscribeModal';
import useUploadModal from '../hooks/useUploadModal';
import useOptionsModal from '../hooks/useOptionsModal';
import usePlaylistModal from '../hooks/usePlaylistModal';
import useLyricsModal from '../hooks/useLyricsModal';


const colorThemes = [
  { name: 'Melodify Default', themeColor: 'from-[#18FFFF]', bgColor: 'bg-[#18FFFF]', textColor: 'text-black' },
  { name: 'Golden Hour', themeColor: 'from-[#F7A800]', bgColor: 'bg-[#F7A800]', textColor: 'text-black' },
  { name: 'Sunset Serenade', themeColor: 'from-[#FF7F7F]', bgColor: 'bg-[#FF7F7F]', textColor: 'text-black' },
  { name: 'Radiant Sunrise', themeColor: 'from-[#FFB6C1]', bgColor: 'bg-[#FFB6C1]', textColor: 'text-black' },
  { name: 'Electric Forest', themeColor: 'from-[#00FF00]', bgColor: 'bg-[#00FF00]', textColor: 'text-black' },
  { name: 'Icy Breeze', themeColor: 'from-[#AEEEEE]', bgColor: 'bg-[#AEEEEE]', textColor: 'text-black' },
  { name: 'Snowman', themeColor: 'from-[#FFFAFA]', bgColor: 'bg-[#FFFAFA]', textColor: 'text-black' },
  { name: 'Neon Dreams', themeColor: 'from-[#9B59B6]', bgColor: 'bg-[#9B59B6]', textColor: 'text-white' },
  { name: 'Forest Breeze', themeColor: 'from-[#228B22]', bgColor: 'bg-[#228B22]', textColor: 'text-white' },
  { name: 'Skyline Glow', themeColor: 'from-[#87CEFA]', bgColor: 'bg-[#87CEFA]', textColor: 'text-black' },
  { name: 'Neon Noir', themeColor: 'from-[#333]', bgColor: 'bg-[#333]', textColor: 'text-white' },
  { name: 'Ocean Waves', themeColor: 'from-[#1E90FF]', bgColor: 'bg-[#1E90FF]', textColor: 'text-white' },
  { name: 'Moonlit Jazz', themeColor: 'from-[#B0C4DE]', bgColor: 'bg-[#B0C4DE]', textColor: 'text-black' },
  { name: 'Cosmic Chill', themeColor: 'from-[#7A6DFF]', bgColor: 'bg-[#7A6DFF]', textColor: 'text-white' },
  { name: 'Crimson Wave', themeColor: 'from-[#8B0000]', bgColor: 'bg-[#8B0000]', textColor: 'text-white' },
];

const adminEmails = ['khophim.sonicthehedgehog@gmail.com'];

interface HeaderProps {
  children: React.ReactNode;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({children, className}) => {
  const router = useRouter();
  const { setButtonClick, onOpen } = useAuthModal();
  const subscribeModal = useSubscribeModal();
  const lyricsModal = useLyricsModal();
  const playlistModal = usePlaylistModal();
  const optionsModal = useOptionsModal();
  const uploadModal = useUploadModal();
  const [userState, setUserState] = useState<boolean | null>(null);
  const [hasShownWelcomeToast, setHasShownWelcomeToast] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null); 
  
  const supabaseClient = useSupabaseClient();
  const { user, subscription, theme, index, setThemeGlobally, userDetails } = useUser();
  const [themeIndex, setThemeIndex] = useState(index >= 0 ? index : 0);
  const [themeName, setThemeName] = useState(theme || '');

  const handleLogout = async () => {
    const { error } = await supabaseClient.auth.signOut();
    router.refresh();

    if (error) {
      toast.remove();
      toast.error(error.message);
    } else {
      setUserState(false);
      playlistModal.onClose();
      toast.remove();
      toast.success('Logged out');
    }
  }

  const handleAddSong = () => {
    lyricsModal.onClose();
    playlistModal.onClose();

    if (!user) {
      optionsModal.setTitle('Login required');
      optionsModal.setDescription('You need to login first in order to create your own playlists');
      lyricsModal.onClose();
      playlistModal.onClose();
      return optionsModal.onOpen();
    }

    if (!subscription) {
      lyricsModal.onClose();
      playlistModal.onClose();
      return subscribeModal.onOpen();
    }

    return uploadModal.onOpen();
  }

  useEffect(() => {
    if (userDetails?.full_name) {
      setUserState(true);
      if (!hasShownWelcomeToast) {
        toast.remove();
        toast.success(`Welcome, ${userDetails.first_name} ${userDetails.last_name}!`);
        setHasShownWelcomeToast(true);
      }
    } else if (user) {
      setUserState(true);
      if (!hasShownWelcomeToast) { 
        toast.remove();
        toast.success(`Welcome, ${user.email}!`);
        setHasShownWelcomeToast(true);
      }
    } else {
      setUserState(false);
      setHasShownWelcomeToast(false);
    }
  }, [user, userDetails, hasShownWelcomeToast]);

  useEffect(() => {
    const updateThemeFromLocalStorage = () => {
      const storedTheme = localStorage.getItem('selectedTheme');
      if (storedTheme) {
        const index = colorThemes.findIndex((theme) => theme.name === storedTheme);
        setThemeIndex(index);
        setThemeName(storedTheme);
      }
    };
  
    // Listen for storage changes
    window.addEventListener('storage', updateThemeFromLocalStorage);
  
    // Initial theme update
    updateThemeFromLocalStorage();
  
    return () => {
      window.removeEventListener('storage', updateThemeFromLocalStorage);
    };
  }, []);

  const handleThemeSelection = (index: number, name: string) => {
    setThemeGlobally(name);
    setThemeIndex(index);
    setThemeName(name);
    setIsDropdownVisible(false);
    localStorage.setItem('selectedTheme', name);
  }

  useEffect(() => {
    const updateTheme = async () => {
      await  supabaseClient
        .from('users')
        .update({
          theme: themeName
        })
        .eq('id', user?.id)
    }
    if (themeName.length > 0) {
      updateTheme();
    }
  }, [supabaseClient, themeName, user?.id]);

  useEffect(() => {
    const applyTheme = async () => {
      const { data } = await supabaseClient
        .from('users')
        .select('theme')
        .eq('id', user?.id)
      if (data) {
        const index = colorThemes.findIndex(theme => theme.name === data[0].theme);
        setThemeIndex(index);
        setThemeName(data[0].theme);
      }
    }
    applyTheme();
  }, [supabaseClient, user?.id])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) && 
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const screenWidth = window.innerWidth;

  const calculateDropdownPosition = useCallback(() => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      
      if (screenWidth < 1175) {
        return {
          top: buttonRect.top + 50, 
          left: buttonRect.left + 200,
        };
      }
      return {
        top: buttonRect.top,
        left: buttonRect.right + window.scrollX,
      };
    }
    return { top: 80, left: 320 };
  }, [screenWidth]);

  useEffect(() => {
    const handleResize = () => setDropdownPosition(calculateDropdownPosition());
    window.addEventListener('resize', handleResize);
  
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [calculateDropdownPosition]);


  const currentTheme = colorThemes[themeIndex];
  const [dropdownPosition, setDropdownPosition] = useState(calculateDropdownPosition());

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
            title='Switch theme'
            ref={buttonRef} 
            onClick={() => setIsDropdownVisible(!isDropdownVisible)} 
            className='bg-white/50 hover:opacity-100 hover: mx-6 px-6 py-2 whitespace-nowrap transition-none'
          >
            {`${themeName || 'Switch theme'}`}
          </Button>
          {isDropdownVisible && (
            <div 
              ref={dropdownRef}
              className='absolute bg-neutral-200 shadow-lg rounded-lg p-4 max-w-full z-10 mx-4 flex flex-col gap-y-1'
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
              }}
            >
              <div className='grid grid-cols-3 gap-4'>
                {colorThemes.map((theme, index) => (
                  <Button 
                    key={index} 
                    onClick={() => handleThemeSelection(index, theme.name)}
                    className={`${theme.textColor} py-2 px-4 ${theme.bgColor} border border-neutral-400 hover:scale-105 hover:opacity-100 w-full text-center`}
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
              <div className='flex gap-x-6 items-center'>
                {user?.email && adminEmails.includes(user.email) && (
                  <Button
                    onClick={handleAddSong}
                    className='bg-white hover:bg-white/75 hover:opacity-100 px-6 py-2 whitespace-nowrap transition-none'
                  >
                    Add song
                  </Button>
                )}
                {user?.email && !subscription && (
                  <Button
                    onClick={subscribeModal.onOpen}
                    className='bg-white hover:bg-white/75 hover:opacity-100 px-6 py-2 whitespace-nowrap transition-none'
                  >
                    Subscribe
                  </Button>
                )}
                <Button
                  onClick={handleLogout}
                  className='bg-white hover:bg-white/75 hover:opacity-100 px-6 py-2 whitespace-nowrap transition-none'
                >
                  Log out
                </Button>
                <Button
                  onClick={() => router.push('/account')}
                  className='bg-white hover:bg-white/75 hover:opacity-100 rounded-full ml-3 p-0 flex items-center justify-center transition-none'
                >
                  <FaCircleUser size={42} />
                </Button>
              </div>
            ) : (
              <div className='flex gap-x-6 items-center'>
                <div>
                  <Button
                    onClick={() => {
                      setButtonClick('sign_up');
                      onOpen();
                    }} 
                    className='bg-white hover:bg-white/75 hover:opacity-100 px-6 py-2 font-bold transition-colors duration-200'
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
                    className='bg-white hover:bg-white/75 hover:opacity-100 px-6 py-2 font-bold transition-colors duration-200'
                  >
                    Log in
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}

export default Header;
