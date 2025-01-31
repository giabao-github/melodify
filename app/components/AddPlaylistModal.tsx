import Image from 'next/image';
import { useState, useCallback } from 'react';
import { FaTimes, FaMusic, FaPlus } from 'react-icons/fa';
import { Playlist, Song } from '../../types';
import toast from 'react-hot-toast';
import useLoadImage from '../hooks/useLoadImage';
import { FiMusic } from 'react-icons/fi';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useUser } from '../hooks/useUser';
import usePlaylist from '../hooks/usePlaylist';


interface AddPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSong: Song;
  songs: Song[];
}

const AddToPlaylistModal: React.FC<AddPlaylistModalProps> = ({ isOpen, onClose, selectedSong, songs }) => {
  const { user } = useUser();
  const playlist = usePlaylist();
  const songArtworkUrl = useLoadImage(selectedSong);
  const supabaseClient = useSupabaseClient();
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  const handleConfirm = async () => {
    if (!selectedPlaylist) {
      return;
    }

    try {
      // Fetch current songs array from the playlist
      const { data, error } = await supabaseClient
        .from('playlists')
        .select('songs')
        .eq('user_id', user?.id)
        .eq('id', selectedPlaylist.id)
        .single();

      if (error) {
        toast.remove();
        toast.error('Failed to fetch playlist data');
        return;
      }
  
      let currentSongs: string[] = data?.songs || [];

      // Check if the song is already in the playlist
      if (currentSongs.includes(selectedSong.id)) {
        toast.remove();
        toast.error(`${selectedSong.title} already exists in ${selectedPlaylist.name}`);
        return;
      }
  
      // Add new song ID
      const updatedSongs = [...currentSongs, selectedSong.id];

      // Update the playlist with the new songs array
      const { error: updateError } = await supabaseClient
        .from('playlists')
        .update({ songs: updatedSongs })
        .eq('id', selectedPlaylist.id)
        .eq('user_id', user?.id);
  
      if (updateError) {
        toast.remove();
        toast.error('Failed to add song to playlist');
        return;
      }

      playlist.setPlaylists([...playlist.playlists, { ...selectedPlaylist, songs: updatedSongs.map(Number) }])

      toast.remove();
      toast.success(`Added ${selectedSong.title} to ${selectedPlaylist.name}`);
      onClose();
    } catch (err) {
      toast.remove();
      toast.error('Something went wrong');
    }
  }


  if (!isOpen)  {
    return null;
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes >= 10 ? minutes : `0${minutes}`}:${remainingSeconds.toString().padStart(2, '0')}`;
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

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='w-full max-w-md bg-neutral-800 rounded-lg shadow-lg p-6 transform transition-all'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold text-foreground'>Add to Playlist</h2>
          <button
            onClick={onClose}
            className='p-2 rounded-full transition-colors'
            aria-label='Close modal'
          >
            <FaTimes className='hover:text-neutral-400' />
          </button>
        </div>

        <div className='mb-6 text-center'>
          <div className='relative w-48 h-48 mx-auto mb-4 rounded-lg overflow-hidden'>
            <Image
              src={songArtworkUrl || '/images/liked.png'}
              alt={selectedSong.title}
              fill
              className='w-full h-full object-cover'
            />
          </div>
          <h3 className='text-xl font-bold'>{selectedSong.title}</h3>
          <p className='my-1'>{selectedSong.author}</p>
          <p className='text-sm'>
            {formatDuration(selectedSong.duration)}
          </p>
        </div>

        <div className='max-h-60 overflow-y-auto mb-6'>
          {playlist.playlists.length === 0 ? (
            <div className='text-center py-6'>
              <FaMusic className='mx-auto text-4xl mb-3' />
              <p className='mb-6'>No playlists found</p>
              <button
                onClick={() => {
                  onClose();
                  playlist.setIsCreateOpen(true);
                }} 
                className='inline-flex items-center px-4 py-2 bg-secondaryAccent rounded-md hover:ring-1 hover:ring-white'
              >
                <FaPlus className='mr-2' /> 
                Create Playlist
              </button>
            </div>
          ) : (
            playlist.playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => setSelectedPlaylist(playlist)}
                className={`w-full flex items-center p-3 rounded-md mb-2 transition-colors ${selectedPlaylist?.id === playlist.id
                  ? 'bg-button text-neutral-800'
                  : 'hover:bg-button hover:text-neutral-800'
                }`}
              >
                <div className='w-12 h-12 border border-neutral-600 rounded-md overflow-hidden mr-3'>
                  {getPlaylistThumbnail(playlist)}
                </div>
                <div className='ml-4 text-left'>
                  <p className='font-semibold text-lg'>{playlist.name}</p>
                  <p className='text-sm'>
                    {`${playlist.songs.length} ${playlist.songs.length > 1 ? 'songs' : 'song'}`}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        <div className='flex justify-end space-x-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 border border-white rounded-md hover:ring-1 hover:ring-white hover:text-neutral-100 transition'
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedPlaylist}
            className={`bg-button px-4 py-2 rounded-md border border-white transition-colors ${selectedPlaylist
              ? 'hover:ring-1 hover:ring-white hover:text-neutral-100'
              : 'opacity-50 cursor-not-allowed'}`}
          >
            Add to Playlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;