import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMusic, FiSearch, FiChevronLeft, FiRepeat, FiShuffle } from 'react-icons/fi';
import { PiMusicNoteFill } from 'react-icons/pi';
import { PiPlaylistBold } from 'react-icons/pi';
import { GoKebabHorizontal } from 'react-icons/go';
import { FaPenToSquare, FaTrash } from 'react-icons/fa6';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import useAuthModal from '../hooks/useAuthModal';
import { useUser } from '../hooks/useUser';
import { Playlist, Song } from '../../types';
import MediaItem from './MediaItem';
import useOnPlay from '../hooks/useOnPlay';
import usePlaylist from '../hooks/usePlaylist';
import usePlayer from '../hooks/usePlayer';
import usePlayerSettings from '../hooks/usePlayerSettings';


interface PlaylistContentProps {
  songs: Song[];
  playlists: Playlist[]
}

const PlaylistContent: React.FC<PlaylistContentProps> = ({ songs, playlists }) => {
  const router = useRouter();
  const { user } = useUser();
  const { activeId } = usePlayer();
  const supabaseClient = useSupabaseClient();
  const authModal = useAuthModal();
  const playlist = usePlaylist();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [optionId, setOptionId] = useState<string | null>(null);
  const [editPlaylistId, setEditPlaylistId] = useState<string | null>(null);
  const [editPlaylistName, setEditPlaylistName] = useState('');
  const [deletePlaylistId, setDeletePlaylistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');
  const { loop, shuffle } = usePlayerSettings();
  const [sortBy, setSortBy] = useState('name');
  const optionsRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const playlistSongs = useMemo(() => {
    return playlist.activePlaylist?.songs
      .map((id) => songs.find((song) => Number(song.id) === id))
      .filter(Boolean);
  }, [playlist.activePlaylist?.songs, songs]);

  const onPlay = useOnPlay((playlistSongs || []).filter((song): song is Song => song !== undefined));


  useEffect(() => {
    playlist.setPlaylists(playlists);
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
    const trimmedName = newPlaylistName.trim();

    if (trimmedName.length < 1) {
      setCreateError('Empty playlist name');
      setIsLoading(false);
      return;
    } else if (trimmedName.length > 32) {
      setCreateError('Playlist name contains 1-32 characters');
      setIsLoading(false);
      return;
    }

    if (playlist.playlists.some((playlist: Playlist) => playlist.name === trimmedName)) {
      setCreateError('Duplicate playlist name');
      setIsLoading(false);
      return;
    }

    // Insert the created playlist to the table 'playlists' in database
    const { data, error: supabaseError } = await supabaseClient
      .from('playlists')
      .insert({
        user_id: user?.id,
        name: trimmedName,
        songs: [],
      })
      .select()
      .single();

    if (supabaseError) {
      console.error('Database insert error:', supabaseError);
      setIsLoading(false);    
      toast.remove();
      return toast.error(supabaseError.message);
    }

    router.refresh();
    playlist.setPlaylists([...playlist.playlists, data]);
    toast.remove();
    toast.success(`Created playlist ${trimmedName}`);
    setIsLoading(false);
    setNewPlaylistName('');
    playlist.setIsCreateOpen(false);
    setCreateError('');
  };

  const handleEditPlaylist = async (playlistId: string) => {
    setIsLoading(true);
    const editedPlaylist = playlist.playlists.find(playlist => playlist.id === playlistId);
    const trimmedName = editPlaylistName.trim();

    if (trimmedName.length < 1) {
      setEditError('Empty playlist name');
      setIsLoading(false);
      return;
    } else if (trimmedName.length > 32) {
      setEditError('Playlist name contains 1-32 characters');
      setIsLoading(false);
      return;
    }

    if (playlist.playlists.some((playlist: Playlist) => playlist.name === trimmedName) && editPlaylistId !== playlistId) {
      setEditError('Duplicate playlist name');
      setIsLoading(false);
      return;
    }

    if (editedPlaylist) {
      setIsLoading(true);

      const { error: supabaseError } = await supabaseClient
        .from('playlists')
        .update({
          name: trimmedName
        })
        .eq('id', playlistId)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (supabaseError) {
        console.error('Database update error:', supabaseError);
        setIsLoading(false);    
        toast.remove();
        return toast.error(supabaseError.message);
      }

      router.refresh();
      playlist.setPlaylists(
        [...playlist.playlists.map((playlist) =>
          playlist.id === playlistId ? { ...playlist, name: trimmedName } : playlist
        )]
      );
      setIsLoading(false);
      setEditPlaylistName('');
      setEditError('');
      setIsEditModalOpen(false);
    }
  }

  const handleDeletePlaylist = async (deletedPlaylist: Playlist) => {
    const index = playlist.playlists.findIndex((playlist: Playlist) => playlist.id === deletedPlaylist.id);

    if (!user) {
      return authModal.onOpen();
    }

    if (index > -1) {
      setIsLoading(true);

      const { error: supabaseError } = await supabaseClient
        .from('playlists')
        .delete()
        .eq('id', deletedPlaylist.id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (supabaseError) {
        console.error('Database delete error:', supabaseError);
        setIsLoading(false);    
        toast.remove();
        return toast.error(supabaseError.message);
      }

      router.refresh();
      playlist.setPlaylists(playlist.playlists.filter((playlist) => playlist.id !== deletedPlaylist.id));
      toast.remove();
      toast.success(`Deleted playlist ${deletedPlaylist.name}`);
      setIsLoading(false);
      setIsDeleteModalOpen(false);
    }
  }

  const handleSelectPlaylist = (selectedPlaylist: Playlist) => {
    playlist.setActivePlaylist(selectedPlaylist);
  }

  const getPlaylistThumbnail = useCallback((currentPlaylist: Playlist) => {
    if (currentPlaylist.songs.length === 0) {
      return (
        <div className='w-full h-full bg-secondary flex items-center justify-center'>
          <FiMusic className='text-2xl text-white' />
        </div>
      );
    }
    
    const songsMap = new Map(songs.map((song) => [Number(song.id), song]));
    const playlistSongs = currentPlaylist.songs
      .map((songId) => songsMap.get(songId))
      .filter((song) => song !== undefined);

    if (playlistSongs.length >= 1 && playlistSongs[0]) {
      const { data: imageData } = supabaseClient
        .storage
        .from('images')
        .getPublicUrl(playlistSongs[0].image_path);

      return (
        <div className='relative rounded-md min-h-[56px] min-w-[56px] overflow-hidden'>
          <Image
            src={imageData.publicUrl}
            alt={currentPlaylist.name}
            fill
            sizes='auto auto'
            priority
            className='object-cover'
          />
        </div>
      );
    }
  }, [songs, supabaseClient.storage]);

  const formatNumberShorthand = (num: number): string => {
    if (num >= 1e9) {
      const value = (num / 1e9).toFixed(1);
      return value.endsWith('.0') ? `${value.slice(0, -2)} B` : `${value} B`;
    } else if (num >= 1e6) {
      const value = (num / 1e6).toFixed(1);
      return value.endsWith('.0') ? `${value.slice(0, -2)} M` : `${value} M`;
    } else if (num >= 1e3) {
      const value = (num / 1e3).toFixed(1);
      return value.endsWith('.0') ? `${value.slice(0, -2)} K` : `${value} K`;
    } else {
      return num.toString();
    }
  }

  const filteredPlaylists = useMemo(() => {
    return playlist.playlists
      .filter((playlist) =>
        playlist.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
      .sort((a, b) =>
        sortBy === 'name'
          ? a.name.localeCompare(b.name)
          : 0
      );
  }, [playlist.playlists, searchQuery, sortBy]);

  return (
    <div className='h-fit w-full flex flex-col'>
      {!playlist.activePlaylist && (
        <div className='border-b border-neutral-700'>
          {playlist.isCreateOpen && (
            <div className='mx-4 flex items-center mb-8'>
              <div className='rounded-lg shadow-lg w-full'>
                <input
                  type='text'
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder='New playlist name'
                  className='w-full py-2 px-3 bg-gray-800 border border-primaryAccent rounded-md focus:outline-none focus:ring-1 focus:ring-primaryAccent'
                />
                {createError && <p className='text-sm text-red-400 my-3'>{createError}</p>}
                <div className='mt-4 flex justify-end space-x-4'>
                  <button
                    disabled={isLoading}
                    onClick={() => {
                      playlist.setIsCreateOpen(false);
                      setNewPlaylistName('');
                      setCreateError('');
                    }}
                    className='px-4 py-2 text-black select-none font-semibold bg-button rounded-md hover:ring-2 hover:ring-white disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isLoading}
                    onClick={handleCreatePlaylist}
                    className='px-4 py-2 text-black select-none font-semibold bg-primaryAccent rounded-md hover:ring-2 hover:ring-white disabled:opacity-50 disabled:cursor-not-allowed'
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
              className='my-6 w-full p-2 select-none font-semibold bg-primaryAccent/70 rounded-md focus:outline-none focus:ring-1 focus:ring-primaryAccent'
            >
              <option className='bg-neutral-700 cursor-pointer' value='name'>Sort by name</option>
              <option className='bg-neutral-700 cursor-pointer' value='recent'>Sort by recent</option>
            </select>
          </div>
        </div>
      )}

      <div className='flex-1 max-h-fit'>
        <AnimatePresence mode='wait'>
          {playlist.activePlaylist ? (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className='pb-4'
            >
              <div className='flex items-center justify-between px-4 mb-4'>
                <div className='flex flex-row gap-x-3'>
                  <div
                    onClick={() => {
                      playlist.setActivePlaylist(null);
                    }}
                    className='flex items-center cursor-pointer hover:text-primaryAccent'
                  >
                    <FiChevronLeft size={20} />
                  </div>
                  <h3 
                    title={playlist.activePlaylist.name} 
                    className='text-lg font-semibold'
                  >
                    {playlist.activePlaylist.name.length > 16 ? playlist.activePlaylist.name.slice(0, 16) + '...' : playlist.activePlaylist.name}
                  </h3>
                </div>
                <div className='flex flex-row'>
                  <div
                    title={`Loop is togged ${loop ? 'on' : 'off'}`}
                    className={`p-2 cursor-default rounded-full ${loop ? 'bg-primaryAccent/70 text-black' : ''}`}
                  >
                    <FiRepeat />
                  </div>
                  <div
                    title={`Shuffle is toggled ${shuffle ? 'on' : 'off'}`}
                    className={`p-2 cursor-default rounded-full ${shuffle ? 'bg-primaryAccent/70 text-black' : ''}`}
                  >
                    <FiShuffle />
                  </div>
                </div>
              </div>
              <div className='w-full flex flex-col gap-y-2 mt-6 px-1 font-bold text-lg'>
                {
                  playlistSongs?.map((item) => item && (
                    <MediaItem
                      onClick={(id: string) => onPlay(id)}
                      key={item.id}
                      data={item}
                      activeSong={item.id === activeId ? item : undefined}
                      songs={songs}
                      selectedPlaylist={playlist.activePlaylist}
                      type='library'
                    />
                  ))
                }
              </div>
              {playlist.activePlaylist.songs.length === 0 && (
                <div className={`${activeId ? 'h-[427px]' : 'h-[527px]'} flex flex-row gap-x-2 text-neutral-500 font-medium text-lg justify-center items-center select-none`}>
                  <PiMusicNoteFill size={18} />
                  <p>No songs in this playlist</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className='px-2 py-4 space-y-3'
            >
              {filteredPlaylists.length === 0 && (
                <div className={`${activeId ? '2xl:h-[336px] md:h-[134px]' : '2xl:h-[402px] md:h-[230px]'} flex flex-row gap-x-2 text-neutral-500 font-medium text-lg justify-center items-center select-none`}>
                  <PiPlaylistBold size={18} />
                  <p>No playlists</p>
                </div>
              )}
              {filteredPlaylists.map((playlist: Playlist) => (
                <div
                  key={playlist.id}
                  className='flex flex-col gap-y-4'
                >
                  <div
                    onClick={() => handleSelectPlaylist(playlist)} 
                    className='group flex items-center w-full p-3 bg-neutral-800 hover:bg-neutral-700 rounded-md cursor-pointer select-none'
                  >
                    <div className='w-14 h-14 border border-neutral-600 rounded-md overflow-hidden mr-3'>
                      {getPlaylistThumbnail(playlist)}
                    </div>
                    <div className='flex-1 flex flex-col gap-1 w-full'>
                      <p 
                        title={playlist.name} 
                        className='font-semibold text-lg'
                      >
                        {playlist.name.length > 20 ? playlist.name.slice(0, 20) + '...' : playlist.name}
                      </p>
                      <div className='flex flex-row justify-between w-full'>
                        <p className='text-sm text-neutral-400'>
                          {formatNumberShorthand(playlist.songs.length)} {Number(playlist.songs.length) <= 1 ? 'song' : 'songs'}
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
                        {editError && <p className='text-sm text-red-400 my-3'>{editError}</p>}
                        <div className='mt-4 flex justify-end space-x-4'>
                          <button
                            disabled={isLoading}
                            onClick={() => {
                              setIsEditModalOpen(false);
                              setEditPlaylistId(null);
                              setEditPlaylistName('');
                              setEditError('');
                            }}
                            className='px-4 py-2 text-black select-none font-semibold bg-button rounded-md hover:ring-2 hover:ring-white disabled:opacity-50 disabled:cursor-not-allowed'
                          >
                            Cancel
                          </button>
                          <button
                            disabled={isLoading}
                            onClick={() => {
                              handleEditPlaylist(playlist.id);
                              setEditPlaylistId(null);
                            }}
                            className='px-4 py-2 text-black select-none font-semibold bg-primaryAccent rounded-md hover:ring-2 hover:ring-white disabled:opacity-50 disabled:cursor-not-allowed'
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
                          className='w-full py-2 px-3 font-semibold bg-red-400 text-black rounded-lg select-none'
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
                            className='px-4 py-2 text-black select-none font-semibold bg-button rounded-md hover:ring-2 hover:ring-white disabled:opacity-50 disabled:cursor-not-allowed'
                          >
                            Cancel
                          </button>
                          <button
                            disabled={isLoading}
                            onClick={() =>{
                              handleDeletePlaylist(playlist);
                              setDeletePlaylistId(null);
                            }}
                            className='px-4 py-2 text-black select-none font-semibold bg-secondaryAccent rounded-md hover:ring-2 hover:ring-white disabled:opacity-50 disabled:cursor-not-allowed'
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