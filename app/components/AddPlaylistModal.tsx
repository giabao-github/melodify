import Image from 'next/image';
import { useState, useCallback, useMemo } from 'react';
import { FaTimes, FaMusic, FaPlus } from 'react-icons/fa';
import { Playlist, Song } from '../../types';
import toast from 'react-hot-toast';
import useLoadImage from '../hooks/useLoadImage';
import { FiMusic } from 'react-icons/fi';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useUser } from '../hooks/useUser';


interface AddPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: Playlist[];
  selectedSong: Song;
}

const AddToPlaylistModal: React.FC<AddPlaylistModalProps> = ({ isOpen, onClose, playlists, selectedSong }) => {
  const song = selectedSong;
  const { user } = useUser();
  const songArtworkUrl = useLoadImage(song);
  const supabaseClient = useSupabaseClient();
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  const handleConfirm = useCallback(async () => {
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
        toast.error('This song is already in the selected playlist');
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

      toast.remove();
      toast.success(`Added to ${selectedPlaylist.name}`);
      onClose();
    } catch (err) {
      toast.remove();
      toast.error('Something went wrong');
    }
  }, [selectedPlaylist, supabaseClient, user?.id, selectedSong.id, onClose]);
  

  if (!isOpen)  {
    return null;
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // const getPlaylistThumbnail = (playlist: Playlist) => {
  //   if (playlist.songs.length === 0) {
  //     return (
  //       <div className='w-full h-full bg-secondary flex items-center justify-center'>
  //         <FiMusic className='text-2xl text-white' />
  //       </div>
  //     );
  //   }

  //   const playlistSongs = songs.filter((song) => playlist?.songs.toString().includes(song.id));

    
  //   if (playlistSongs.length >= 1) {
  //     const { data: imageData } = supabaseClient
  //       .storage
  //       .from('images')
  //       .getPublicUrl(playlistSongs[0].image_path);

  //     return (
  //       <div className='relative rounded-md min-h-[48px] min-w-[48px] overflow-hidden'>
  //         <Image
  //           src={imageData.publicUrl}
  //           alt={playlist.name}
  //           fill
  //           sizes='auto auto'
  //           priority
  //           className='object-cover'
  //         />
  //       </div>
  //     );
  //   }
  // }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='w-full max-w-md bg-neutral-800 rounded-lg shadow-lg p-6 transform transition-all'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold text-foreground'>Add to Playlist</h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-muted rounded-full transition-colors'
            aria-label='Close modal'
          >
            <FaTimes className='hover:text-neutral-400' />
          </button>
        </div>

        <div className='mb-6 text-center'>
          <div className='relative w-48 h-48 mx-auto mb-4 rounded-lg overflow-hidden'>
            <Image
              src={songArtworkUrl || '/images/liked.png'}
              alt={song.title}
              fill
              className='w-full h-full object-cover'
            />
          </div>
          <h3 className='text-xl font-bold text-foreground mb-1'>{song.title}</h3>
          <p className='text-muted-foreground'>{song.author}</p>
          <p className='text-sm text-muted-foreground mt-1'>
            {formatDuration(song.duration)}
          </p>
        </div>

        <div className='max-h-60 overflow-y-auto mb-6'>
          {playlists.length === 0 ? (
            <div className='text-center py-8'>
              <FaMusic className='mx-auto text-4xl text-muted-foreground mb-2' />
              <p className='text-muted-foreground mb-4'>No playlists found</p>
              <button className='inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors'>
                <FaPlus className='mr-2' /> Create Playlist
              </button>
            </div>
          ) : (
            playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => setSelectedPlaylist(playlist)}
                className={`w-full flex items-center p-3 rounded-md mb-2 transition-colors ${selectedPlaylist?.id === playlist.id
                  ? 'bg-button text-neutral-800'
                  : 'hover:bg-button hover:text-neutral-800'
                }`}
              >
                <Image
                  src={playlist.image_url || '/images/liked.png'}
                  alt={playlist.name}
                  width={48}
                  height={48}
                  className='rounded object-cover'
                />
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
            className='px-4 py-2 border border-white rounded-md hover:bg-button hover:text-neutral-100 transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedPlaylist}
            className={`px-4 py-2 rounded-md border border-white transition-colors ${selectedPlaylist
              ? 'hover:bg-button hover:text-neutral-100'
              : 'cursor-not-allowed'}`}
          >
            Add to Playlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;