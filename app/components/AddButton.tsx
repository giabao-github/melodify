import { MdPlaylistAddCircle } from 'react-icons/md';

const AddButton = () => {
  return (
    <button 
      title='Add to library'
      className='transition opacity-0 rounded-full flex items-center bg-primaryAccent drop-shadow-md translate translate-y-1/4 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-110'>
      <MdPlaylistAddCircle className='text-black text-2xl' />
    </button>
  );
};

export default AddButton;