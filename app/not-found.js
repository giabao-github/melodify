"use client";

import { useEffect, useMemo, useState } from 'react';
import { Geologica,  } from 'next/font/google';
import { redirect, usePathname, useRouter } from 'next/navigation';
import Box from '../app/components/Box';
import Image from 'next/image';
import ClientOnly from './components/ClientOnly';


const geologica = Geologica({ subsets: ['latin', 'cyrillic', 'vietnamese', 'greek']});

const Page404 = ({ pageTitle, title, description }) => {
  const router = useRouter();
  const pathname = usePathname();
  const allowedPaths = useMemo(() => ['/', '/search', '/generate', '/favorite'], []);

  useEffect(() => {
    if (allowedPaths.includes(pathname)) {
      window.location.reload();
    }
  });

  const handleRedirect = () => {
    window.location.replace('/');
  };


  return (
    <ClientOnly>
      <body>
        <Box className={`h-full flex flex-col gap-y-20 items-center justify-center ${geologica.className}`}>
          <title>{pageTitle}</title>
          <Image 
            src={'/images/logo.jpeg'} 
            priority 
            alt='Melodify logo'
            height={240} width={240} 
            className='border-4 border-white rounded-[60px]'
          />
          <div className='font-bold text-5xl'>
            {title}
          </div>
          <div className='flex flex-col gap-y-10 justify-center items-center'>
            <p className='text-neutral-400 text-xl'>
              {description}
            </p>
            <p className='text-xl flex flex-row'>
              Please return to the&nbsp;
              <div
                onClick={() => handleRedirect()}
                className='text-primaryAccent hover:underline cursor-pointer'
              >
                Melodify home page
              </div>
              .
            </p>
          </div>
        </Box>
      </body>
    </ClientOnly>
  );
}

export default Page404;