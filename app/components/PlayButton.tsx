import { FaPlay } from 'react-icons/fa6';


const PlayButton = () => {
  return (
    <button 
      title='Play'
      className='transition opacity-0 rounded-full flex items-center bg-primaryAccent p-4 drop-shadow-md translate translate-y-1/4 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-110'>
      <FaPlay className='text-black text-xl' />
    </button>
  );
};

export default PlayButton;