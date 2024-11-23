"use client"
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaPlay } from "react-icons/fa6";

const ListItem = ({image, name, href, alt}) => {
  const router = useRouter();

  const onClick = () => {
    // add authentication before push
    router.push(href);
  }

  return (
    <button 
      onClick={onClick}
      className='w-4/6 2xl:w-1/4 xl:w-1/4 lg:w-1/2 md:w-1/2 relative group flex items-center rounded-md overflow-hidden gap-x-4 bg-neutral-100/10 hover:bg-neutral-100/20 transition pr-4'>
      <div className='relative min-h-[64px] min-w-[64px]'>
        <Image 
          className='object-cover rounded-md' 
          fill
          sizes="64px 64px"
          alt={alt}
          src={image}
          priority
        />
      </div>
      <p className='font-bold truncate py-4 pr-[72px]'>{name}</p>
      <div className='absolute transition opacity-0 rounded-full flex items-center justify-center bg-yellow-500 p-4 drop-shadow-md right-5 group-hover:opacity-100 hover:scale-110'>
        <FaPlay className='text-black' size={18} />
      </div>
    </button>
  )
}

export default ListItem;