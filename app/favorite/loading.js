"use client";

import Box from '@/components/Box';
import { BounceLoader } from 'react-spinners';

const Loading = () => {
  return (
    <Box className='h-full flex justify-center items-center'>
      <BounceLoader color='#18FFFF' size={50} />
    </Box>
  )
}

export default Loading;