import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

const SidebarItem = ({icon: Icon, label, active, href}) => {
  const handleClick = (event) => {
    if (!href) {
      event.preventDefault();
      console.warn('Attempted to navigate to an undefined route!');
    }
  };

  return (
    <div onClick={handleClick}>
      <Link 
        href={href}
        className={twMerge(`flex flex-row h-auto items-center w-full gap-x-4 text-md font-medium cursor-pointer hover:text-primaryAccent transition text-white px-4 py-3`, active && 'text-primaryAccent bg-gray-800 rounded-3xl shadow-lg')}>
        <Icon size={28} />
        <p className='truncate w-full font-bold text-xl'>{label}</p>
      </Link>
    </div>
  )
}

export default SidebarItem;