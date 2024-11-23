"use client"

import { Geologica,  } from "next/font/google";
import Box from "@/components/Box";
import Link from "next/link";
import Image from "next/image";
import { redirect, useRouter } from "next/navigation";


const geologica = Geologica({ subsets: ["latin", "cyrillic", "vietnamese", "greek"]});

export default function Page404({ pageTitle, title, description }) {
  const handleRedirect = () => {
    console.log("Redirecting to home...");
    redirect('/');
  };

  return (
    <html lang="en">
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
            <p className='text-xl'>
              Please return to the&nbsp;
              <Link
                href={'/'}
                onClick={handleRedirect}
                className='text-primaryAccent hover:underline'
              >
                Melodify home page
              </Link>
              .
            </p>
          </div>
        </Box>
      </body>
    </html>
  );
}
