"use client";

import { useMemo } from 'react';
import { usePathname} from 'next/navigation';
import { GoHomeFill } from 'react-icons/go';
import { FaSearch } from 'react-icons/fa';
import { RiAiGenerate } from 'react-icons/ri';
import { Alexandria } from 'next/font/google';
import { twMerge } from 'tailwind-merge';
import usePlayer from '../hooks/usePlayer';
import { Playlist, Song } from '../../types';
import Box from './Box';
import SidebarItem from './SidebarItem';
import Library from './Library';


const rowdies = Alexandria({ weight: '400', subsets: ['latin', 'vietnamese', 'arabic']});

interface SidebarProps {
  children: React.ReactNode;
  songs: Song[];
  playlists: Playlist[];
}

const Sidebar: React.FC<SidebarProps> = ({ children, songs, playlists }) => {
  const pathname = usePathname() || '';
  const player = usePlayer();

  // Define allowed paths
  const allowedPaths = useMemo(() => ['/', '/search', '/generate', '/favorite', '/account'], []);

  const routes = useMemo(() => [
    {
      icon: GoHomeFill,
      label: 'Home',
      active: pathname === '/',
      href: '/',
    },
    {
      icon: FaSearch,
      label: 'Search',
      active: pathname === '/search',
      href: '/search',
    },
    {
      icon: RiAiGenerate,
      label: 'Generate',
      active: pathname === '/generate',
      href: '/generate',
    }
  ], [pathname]);


  if (!allowedPaths.includes(pathname)) {
    return (
      <main className='h-full flex-1 overflow-y-auto py-1'>
        {children}
      </main>
    );
  }

  return (
    <div className={twMerge(`flex h-full`, player.activeId && 'h-[calc(100%-100px)]')}>
      <div className='hidden md:flex flex-col gap-y-2 bg-black h-full w-[300px] px-1 py-[2px]'>
        <Box>
          <div className={`flex flex-col gap-y-5 px-5 py-6 tracking-wider ${rowdies.className}`}>
            {routes.map((item) => (
              <SidebarItem key={item.label} {...item} />
            ))}
          </div>
        </Box>
        <Box className='overflow-y-auto bg-neutral-900 h-full'>
          <Library songs={songs} playlists={playlists} />
        </Box>
      </div>
      <main className='h-full flex-1 overflow-y-auto py-1'>
        {children}
      </main>
    </div>
  )
}

export default Sidebar;