import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMusic, FiPlus, FiSearch, FiChevronLeft, FiRepeat, FiShuffle } from 'react-icons/fi';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import useAuthModal from '../hooks/useAuthModal';
import { useUser } from '../hooks/useUser';
import { Playlist, Song } from '../../types';
import { GoKebabHorizontal } from 'react-icons/go';
import { FaPenToSquare, FaTrash } from 'react-icons/fa6';
import MediaItem from './MediaItem';
import useOnPlay from '../hooks/useOnPlay';


interface PlaylistContentProps {
  songs: Song[];
  playlists: Playlist[]
}

const PlaylistContent: React.FC<PlaylistContentProps> = ({ songs, playlists }) => {
  const { user } = useUser();
  const supabaseClient = useSupabaseClient();
  const authModal = useAuthModal();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [optionId, setOptionId] = useState<string | null>(null);
  const [editPlaylistId, setEditPlaylistId] = useState<string | null>(null);
  const [editPlaylistName, setEditPlaylistName] = useState('');
  const [deletePlaylistId, setDeletePlaylistId] = useState<string | null>(null);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [isLoopActive, setIsLoopActive] = useState(false);
  const [isShuffleActive, setIsShuffleActive] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const optionsRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const playlistSongs = useMemo(() => {
    return songs.filter((song) => selectedPlaylist?.songs.toString().includes(song.id));
  }, [selectedPlaylist, songs]);

  const onPlay = useOnPlay(playlistSongs);


  useEffect(() => {
    localStorage.setItem('playlists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionsRef.current && !optionsRef.current.contains(event.target as Node) && 
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (event: React.MouseEvent<SVGElement>) => {
    event.stopPropagation();
    setShowOptions(prev => !prev);
  }

  const handleCreatePlaylist = async () => {
    setIsLoading(true);

    if (newPlaylistName.length < 1) {
      setError('Empty playlist name');
      return;
    } else if (newPlaylistName.length > 32) {
      setError('Playlist name contains 1-32 characters');
      return;
    }

    if (playlists.some((playlist: Playlist) => playlist.name === newPlaylistName)) {
      setError('Duplicate playlist name');
      return;
    }

    // Insert the created playlist to the table 'playlists' in database
    const { error: supabaseError } = await supabaseClient
      .from('playlists')
      .insert({
        user_id: user?.id,
        name: newPlaylistName,
        songs: [],
      });

    if (supabaseError) {
      console.error("Database insert error:", supabaseError);
      setIsLoading(false);    
      toast.remove();
      return toast.error(supabaseError.message);
    }

    router.refresh();
    toast.remove();
    toast.success('Playlist created');
    setIsLoading(false);
    setNewPlaylistName('');
    setIsCreateModalOpen(false);
    setError('');
  };

  const handleEditPlaylist = async (playlistId: string) => {
    const playlist = playlists.find(playlist => playlist.id === playlistId);

    if (editPlaylistName.length < 1) {
      setError('Empty playlist name');
      return;
    } else if (editPlaylistName.length > 32) {
      setError('Playlist name contains 1-32 characters');
      return;
    }

    if (playlists.some((playlist: Playlist) => playlist.name === editPlaylistName) && editPlaylistId !== playlistId) {
      setError('Duplicate playlist name');
      return;
    }

    if (playlist) {
      setIsLoading(true);

      const { error: supabaseError } = await supabaseClient
        .from('playlists')
        .update({
          name: editPlaylistName
        })
        .eq('id', playlistId)
        .eq('user_id', user?.id);

      if (supabaseError) {
        console.error("Database update error:", supabaseError);
        setIsLoading(false);    
        toast.remove();
        return toast.error(supabaseError.message);
      }

      router.refresh();
      setIsLoading(false);
      setEditPlaylistName('');
      setIsEditModalOpen(false);
    }
  }

  const handleDeletePlaylist = async (playlistId: string) => {
    const index = playlists.findIndex((playlist: Playlist) => playlist.id === playlistId);

    if (!user) {
      return authModal.onOpen();
    }

    if (index > -1) {
      setIsLoading(true);

      const { error: supabaseError } = await supabaseClient
      .from('playlists')
      .delete()
      .eq('id', playlistId)
      .eq('user_id', user?.id);

      if (supabaseError) {
        console.error("Database delete error:", supabaseError);
        setIsLoading(false);    
        toast.remove();
        return toast.error(supabaseError.message);
      }

      router.refresh();
      setIsLoading(false);
      setIsDeleteModalOpen(false);
    }
  }

  const getPlaylistThumbnail = (playlist: Playlist) => {
    if (playlist.songs.length === 0) {
      return (
        <div className='w-full h-full bg-secondary flex items-center justify-center'>
          <FiMusic className='text-2xl text-white' />
        </div>
      );
    }

    const playlistSongs = songs.filter((song) => playlist?.songs.toString().includes(song.id));

    if (playlistSongs.length >= 1) {
      const { data: imageData } = supabaseClient
        .storage
        .from('images')
        .getPublicUrl(playlistSongs[0].image_path);

      supabaseClient
        .from('playlists')
        .update({
          image_url: imageData.publicUrl
        })
        .eq('user_id', user?.id)
        .eq('id', playlist.id)

      return (
        <div className='relative rounded-md min-h-[48px] min-w-[48px] overflow-hidden'>
          <Image
            src={imageData.publicUrl}
            alt={playlist.name}
            fill
            sizes='auto auto'
            priority
            className='object-cover'
          />
        </div>
      );
    }
  }

  const filteredPlaylists = playlists
    .filter((playlist: Playlist) =>
      playlist.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    )
    .sort((playlist: Playlist, otherPlaylist: Playlist) => {
      if (sortBy === 'name') {
        return playlist.name.localeCompare(otherPlaylist.name);
      }
      if (sortBy === 'recent') {
        return Number(otherPlaylist.id) - Number(playlist.id);
      }
      return 0;
    });

  return (
    <div className='h-fit w-full flex flex-col'>
      <div className='border-b border-neutral-700'>
        <div className='mx-4 flex items-center justify-between mb-4'>
          <div
            onClick={() => {
              if (!user) {
                return authModal.onOpen();
              }
              setIsCreateModalOpen(true);
            }}
            className='p-2 hover:bg-secondary rounded-full transition-colors cursor-pointer'
          >
            <FiPlus className='text-xl text-foreground' />
          </div>
        </div>
        {isCreateModalOpen && (
          <div className='mx-4 flex items-center mb-8'>
            <div className='rounded-lg shadow-lg w-full'>
              <input
                type='text'
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder='Playlist name'
                className='w-full py-2 px-3 bg-gray-800 border border-primaryAccent rounded-md focus:outline-none focus:ring-1 focus:ring-primaryAccent'
              />
              {error && <p className='text-sm text-red-400 my-3'>{error}</p>}
              <div className='mt-4 flex justify-end space-x-4'>
                <button
                  disabled={isLoading}
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setNewPlaylistName('');
                    setError('');
                  }}
                  className='px-4 py-2 text-black font-semibold bg-button rounded-md hover:ring-2 hover:ring-white'
                >
                  Cancel
                </button>
                <button
                  disabled={isLoading}
                  onClick={handleCreatePlaylist}
                  className='px-4 py-2 text-black font-semibold bg-primaryAccent rounded-md hover:ring-2 hover:ring-white'
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
        <div className='mx-4 relative'>
          <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2' />
          <input
            type='text'
            placeholder='Search playlists'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full px-10 py-2 bg-gray-800 border border-primaryAccent rounded-md focus:outline-none focus:ring-1 focus:ring-primaryAccent'
          />
        </div>
        <div className='mx-4'>
          <select
            title='Sorting options'
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className='my-6 w-full p-2 font-semibold bg-primaryAccent/70 rounded-md focus:outline-none focus:ring-1 focus:ring-primaryAccent'
          >
            <option className='bg-neutral-700 cursor-pointer' value='name'>Sort by name</option>
            <option className='bg-neutral-700 cursor-pointer' value='recent'>Sort by recent</option>
          </select>
        </div>
      </div>

      <div className='mt-4 flex-1 max-h-fit'>
        <AnimatePresence mode='wait'>
          {selectedPlaylist ? (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className='py-4'
            >
              <div className='flex items-center justify-between px-4 mb-4'>
                <div className='flex flex-row gap-x-4'>
                  <div
                    onClick={() => setSelectedPlaylist(null)}
                    className='flex items-center cursor-pointer'
                  >
                    <FiChevronLeft size={20} />
                  </div>
                  <h3 
                    title={selectedPlaylist.name} 
                    className='text-lg font-semibold'
                  >
                    {selectedPlaylist.name.length > 12 ? selectedPlaylist.name.slice(0, 12) + '...' : selectedPlaylist.name}
                  </h3>
                </div>
                <div className='flex space-x-2'>
                  <div
                    title={`Loop: ${isLoopActive ? 'On' : 'Off'}`}
                    onClick={() => setIsLoopActive(!isLoopActive)}
                    className={`p-2 cursor-pointer rounded-full ${isLoopActive ? 'bg-primaryAccent/70 text-black' : 'hover:bg-primaryAccent/70'}`}
                  >
                    <FiRepeat />
                  </div>
                  <div
                    title={`Shuffle: ${isShuffleActive ? 'On' : 'Off'}`}
                    onClick={() => setIsShuffleActive(!isShuffleActive)}
                    className={`p-2 cursor-pointer rounded-full ${isShuffleActive ? 'bg-primaryAccent/70 text-black' : 'hover:bg-primaryAccent/70'}`}
                  >
                    <FiShuffle />
                  </div>
                </div>
              </div>
              <div className='w-full flex flex-col gap-y-2 mt-6 px-3 font-bold text-lg'>
                {
                  playlistSongs.map((item) => (
                    <MediaItem
                      onClick={(id: string) => onPlay(id)}
                      key={item.id}
                      data={item}
                      type='library'
                    />
                  ))
                }
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className='p-4 space-y-3'
            >
              {filteredPlaylists.map((playlist: Playlist) => (
                <div
                  key={playlist.id}
                  className='flex flex-col gap-y-4'
                >
                  <div
                    onClick={() => setSelectedPlaylist(playlist)} 
                    className='group flex items-center w-full p-3 bg-neutral-800 hover:bg-neutral-700 rounded-md cursor-pointer'
                  >
                    <div className='w-12 h-12 border border-neutral-600 rounded-md overflow-hidden mr-3'>
                      {getPlaylistThumbnail(playlist)}
                    </div>
                    <div className='flex-1 flex flex-col gap-1 w-full'>
                      <p 
                        title={playlist.name} 
                        className='font-semibold text-lg'
                      >
                        {playlist.name.length > 12 ? playlist.name.slice(0, 12) + '...' : playlist.name}
                      </p>
                      <div className='flex flex-row justify-between w-full'>
                        <p className='text-sm text-neutral-400'>
                          {playlist.songs.length} {Number(playlist.songs.length) <= 1 ? 'song' : 'songs'}
                        </p>
                        <div ref={buttonRef}>
                          <GoKebabHorizontal 
                            onClick={(e) => {
                              setOptionId(playlist.id);
                              handleOptionClick(e);
                            }}
                            size={24}
                            className='cursor-pointer transition hover:text-neutral-400' 
                          />
                        </div>
                      </div>
                    </div>
                    {showOptions && optionId === playlist.id && (
                      <div ref={optionsRef} className='relative'>
                        <div className='flex flex-col absolute right-0 top-10 bg-neutral-800 text-white border border-neutral-300 text-sm font-normal rounded-md shadow-lg p-2 w-52 z-10'>
                          <p
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!user) {
                                return authModal.onOpen();
                              }
                              setShowOptions(false);
                              setIsEditModalOpen(true);
                              setEditPlaylistId(playlist.id);
                              setEditPlaylistName(playlist.name);
                            }}
                            className='hover:bg-neutral-700 p-2 rounded cursor-pointer flex flex-row items-center select-none'
                          >
                            <FaPenToSquare className='mr-3' />
                            Edit playlist
                          </p>
                          <p
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!user) {
                                return authModal.onOpen();
                              }
                              setShowOptions(false);
                              setIsDeleteModalOpen(true);
                              setDeletePlaylistId(playlist.id);
                            }}
                            className='hover:bg-neutral-700 p-2 rounded cursor-pointer flex flex-row items-center select-none'
                          >
                            <FaTrash className='mr-3' />
                            Delete playlist
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {isEditModalOpen && playlist.id === editPlaylistId && (
                    <div className='mx-4 flex items-center mb-8'>
                      <div className='rounded-lg shadow-lg w-full'>
                        <input
                          type='text'
                          value={editPlaylistName}
                          onChange={(e) => setEditPlaylistName(e.target.value)}
                          placeholder='Playlist name'
                          className='w-full py-2 px-3 bg-gray-800 border border-primaryAccent rounded-md focus:outline-none focus:ring-1 focus:ring-primaryAccent'
                        />
                        {error && <p className='text-sm text-red-400 my-3'>{error}</p>}
                        <div className='mt-4 flex justify-end space-x-4'>
                          <button
                            disabled={isLoading}
                            onClick={() => {
                              setIsEditModalOpen(false);
                              setEditPlaylistId(null);
                              setEditPlaylistName('');
                              setError('');
                            }}
                            className='px-4 py-2 text-black font-semibold bg-button rounded-md hover:ring-2 hover:ring-white disabled:opacity-50'
                          >
                            Cancel
                          </button>
                          <button
                            disabled={isLoading}
                            onClick={() =>{
                              handleEditPlaylist(playlist.id);
                              setEditPlaylistId(null);
                            }}
                            className='px-4 py-2 text-black font-semibold bg-primaryAccent rounded-md hover:ring-2 hover:ring-white disabled:opacity-50'
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {isDeleteModalOpen && playlist.id === deletePlaylistId && (
                    <div className='mx-4 flex items-center mb-8'>
                      <div className='rounded-lg shadow-lg w-full'>
                        <p
                          className='w-full py-2 px-3 font-semibold bg-red-400 text-black rounded-lg'
                        >
                          Delete this playlist?
                        </p>
                        <div className='mt-4 flex justify-end space-x-4'>
                          <button
                            disabled={isLoading}
                            onClick={() => {
                              setIsDeleteModalOpen(false);
                              setDeletePlaylistId(null);
                            }}
                            className='px-4 py-2 text-black font-semibold bg-button rounded-md hover:ring-2 hover:ring-white disabled:opacity-50'
                          >
                            Cancel
                          </button>
                          <button
                            disabled={isLoading}
                            onClick={() =>{
                              handleDeletePlaylist(playlist.id);
                              setDeletePlaylistId(null);
                            }}
                            className='px-4 py-2 text-black font-semibold bg-secondaryAccent rounded-md hover:ring-2 hover:ring-white disabled:opacity-50'
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PlaylistContent;