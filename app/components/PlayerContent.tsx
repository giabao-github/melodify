'use client';

import React, { useCallback, useEffect, useState } from 'react';
import MediaItem from './MediaItem';
import LikeButton from './LikeButton';
import { FaPlay, FaPause, FaForwardStep, FaBackwardStep, FaVolumeHigh, FaVolumeXmark, FaShuffle, FaRepeat, FaClock, FaDownload } from 'react-icons/fa6';
import { IoRocket } from 'react-icons/io5';
import { ImHeadphones } from 'react-icons/im';
import { MdLyrics } from 'react-icons/md';
import Slider from './Slider';
import usePlayer from '../hooks/usePlayer';
import useSound from 'use-sound';
import useProgressBar from '../hooks/useProgressBar';
import usePlayerSettings from '../hooks/usePlayerSettings';
import useLyricsModal from '../hooks/useLyricsModal';
import { useUser } from '../hooks/useUser';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import toast from 'react-hot-toast';
import { Song } from '../../types';


interface PlayerContentProps {
  song: Song;
  songUrl: string;
}

const PlayerContent: React.FC<PlayerContentProps> = ({ song, songUrl }) => {
  const player = usePlayer();
  const [previousVolume, setPreviousVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlayed, setIsPlayed] = useState(false);
  const [playedSongs, setPlayedSongs] = useState<Song[]>([]);
  const [playedTime, setPlayedTime] = useState(0);
  const [trackedTime, setTrackedTime] = useState(0);
  const [shuffledIds, setShuffledIds] = useState<string[]>([]);
  const [playHistory, setPlayHistory] = useState<string[]>([]);
  const { progressBarDuration, playedDuration, setProgressBarDuration, setPlayedDuration, setSound } = useProgressBar();
  const { volume, loop, shuffle, speed, setVolume, setLoop, setShuffle, setSpeed } = usePlayerSettings();
  const { isOpen, setSong, onOpen, onClose } = useLyricsModal();

  const { user } = useUser();
  const supabaseClient = useSupabaseClient();

  const Icon = isPlaying ? FaPause : FaPlay;
  const VolumeIcon = volume === 0 ? FaVolumeXmark : FaVolumeHigh;


  const [play, { pause, sound } ] = useSound(
    songUrl,
    {
      volume: volume,
      playbackRate: 1,
      onplay: () => {
        setIsPlaying(true);
      },
      onpause: () => {
        setIsPlaying(false);
      },
      onload: () => {
        setSong(song);
        setPlayedDuration(0);
        // setPlayedSongs([...playedSongs, song]);
        // console.log(playedSongs)
      },
      format: ['flac', 'mp3']
    },
  );


  const updatePlayCount = useCallback(async () => {
    if (playedTime / song?.duration >= 0.01) {
      try {
        // Fetch the current play_count
          const { data, error: fetchError } = await supabaseClient
          .from('songs')
          .select('play_count')
          .eq('user_id', user?.id)
          .eq('title', song.title)
          .eq('author', song.author)
          .single();

        if (fetchError) {
          console.error('Error fetching play count:', fetchError);
          toast.remove();
          return toast.error(fetchError.message);
        }

        // Update the play count in the database
        const newPlayCount = data.play_count + 1;
        const { error: updateError } = await supabaseClient
          .from('songs')
          .update({
            play_count: newPlayCount,
          })
          .eq('user_id', user?.id)
          .eq('title', song.title)
          .eq('author', song.author)

        if (updateError) {
          console.error('Play count update error:', updateError);
          toast.remove();
          return toast.error(updateError.message);
        }

        // Update the local state of the song
        setSong((prevSong: Song) => ({
          ...prevSong,
          play_count: newPlayCount,
        }));
      } catch (error: any) {
        console.error('Error updating play count:', error);
        toast.remove();
        return toast.error(error.message);
      }
    }
  }, [playedTime, setSong, song.author, song.duration, song.title, supabaseClient, user])


  const shuffleArray = (array: string[]) => {
    return array
      .map((id) => ({ id, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ id }) => id);
  };
  
  const onPlayNext = useCallback(() => {
    if (user) {
      updatePlayCount();
    }

    if (shuffle) {
      const currentIndex = shuffledIds.findIndex((id) => id === player.activeId);
      const nextSong = shuffledIds[currentIndex + 1];
  
      if (nextSong) {
        player.setId(nextSong);
        setPlayHistory((prev) => [...prev, nextSong]);
      } else {
        // Reshuffle when all songs have been played
        const reshuffled = shuffleArray(player.ids);
        setShuffledIds(reshuffled);
        player.setId(reshuffled[0]);
        setPlayHistory([reshuffled[0]]);
      }
    } else {
      const currentIds = player.ids;
      if (currentIds.length === 0) {
        return;
      }
  
      const currentIndex = currentIds.findIndex((id) => id === player.activeId);
      const nextSong = currentIds[currentIndex + 1] || currentIds[0];
      player.setId(nextSong);
  
      // Update play history for non-shuffle mode
      setPlayHistory((prev) => [...prev, nextSong]);
    }
  }, [player, shuffle, shuffledIds, updatePlayCount, user]);


  const onPlayPrevious = useCallback(() => {
    if (user) {
      updatePlayCount();
    }

    if (shuffle) {
      if (playHistory.length > 1) {
        const updatedHistory = [...playHistory];
        updatedHistory.pop(); // Remove the current song
        const previousSong = updatedHistory[updatedHistory.length - 1];
        setPlayHistory(updatedHistory); // Update play history
        player.setId(previousSong); // Play the previous song
      } else if (playHistory.length === 1) {
        player.setId(playHistory[0]);
      }
    } else {
      const currentIds = player.ids;
      if (currentIds.length === 0) {
        return;
      }
  
      const currentIndex = currentIds.findIndex((id) => id === player.activeId);
      const previousSong = currentIds[currentIndex - 1] || currentIds[currentIds.length - 1];
      player.setId(previousSong);
  
      // Update play history for non-shuffle mode
      setPlayHistory((prev) => [...prev, previousSong]);
    }
  }, [user, shuffle, updatePlayCount, playHistory, player]);


  const handlePlay = () => {
    if (!isPlaying) {
      play();
    } else {
      pause();
    }
  }

  const toggleLoop = () => {
    if (!loop) {
      setShuffle(false);
    }
    setLoop(!loop);
  }

  const toggleShuffle = () => {
    if (!shuffle) {
      const shuffled = shuffleArray(player.ids);
      setShuffledIds(shuffled);
      setLoop(false);
      if (player.activeId) {
        setPlayHistory([player.activeId]);
        player.setId(shuffled[0]);
      } else {
        setPlayHistory([]);
      }
    } else {
      setShuffledIds([]);
      setPlayHistory([]);
    }
    setShuffle(!shuffle);
  }

  const handleSpeed = () => {
    if (!speed) {
      setSpeed(1);
    }
    else if (speed === 4) {
      setSpeed(0.5);
    }
    else {
      setSpeed(speed + 0.25);
    }
  }

  const toggleMute = () => {
    if (volume === 0) {
      setVolume(previousVolume);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
    }
  }

  const handleShowLyrics = () => {
    if (isOpen) {
      return onClose();
    }
    return onOpen();
  }

  const handleDownload = async () => {
    if (!songUrl) {
      toast.remove();
      toast.error('This song is not support download yet');
      return;
    }
  
    try {
      toast.remove();
      toast.success(`Downloading ${song.title}...`);
      const response = await fetch(songUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      });
  
      if (!response.ok) {
        toast.remove();
        toast.error('Internet connection issue');
        throw new Error('Network response was not ok');
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${song.title} - ${song.author}.flac`);
  
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

    } catch (error) {
      console.error('Error downloading the file:', error);
      toast.remove();
      toast.error('Failed to download the song');
    }
  };

  const formatTime = (seconds: number) => {
    seconds = Math.max(seconds, 0);
    const flooredSeconds = Math.floor(seconds);
    const hours = Math.floor(flooredSeconds / 3600);
    const minutes = Math.floor((flooredSeconds % 3600) / 60);
    const secs = flooredSeconds % 60;
  
    if (hours > 0) {
      return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        secs.toString().padStart(2, '0')
      ].join(':');
    } else {
      return [
        minutes.toString().padStart(2, '0'),
        secs.toString().padStart(2, '0')
      ].join(':');
    }
  }

  const formatNumber = (number: number) => {
    if (!number) {
      return 0;
    }
    if (number >= 1_000_000) {
      const result = number / 1_000_000;
      const formattedResult = (Math.floor(result * 10) / 10).toFixed(1);
      return formattedResult + 'M';
    } else if (number >= 1_000) {
      const result = number / 1_000;
      const formattedResult = (Math.floor(result * 10) / 10).toFixed(1);
      return formattedResult + 'K'; 
    }
    return number.toString();
  }


  useEffect(() => {
    sound?.play();
    setIsPlayed(true);
    // console.log(`ids: ${player.ids}, active id: ${song.id}`)
    return () => {
      sound?.unload();
    }
  }, [sound, setIsPlayed]);

  useEffect(() => {
    // Update loop and sound settings
    setLoop(loop);
    setSound(sound);

    // Sync currentTime with playedDuration
    setCurrentTime(playedDuration);

    if (sound && typeof sound.duration === 'function') {
      setProgressBarDuration(sound.duration());
    }
  }, [loop, setLoop, setSound, sound, playedDuration, setProgressBarDuration]);

  useEffect(() => {
    if (!shuffle) {
      setShuffledIds([]);
    }
  }, [shuffle]);

  useEffect(() => {
    const onEndCallback = async () => {
      if (user) {
        updatePlayCount();
      }
      if (loop) {
        setCurrentTime(0);
        setPlayedDuration(0);
        sound?.play();
      } else {
        onPlayNext();
      }
    };
  
    sound?.on('end', onEndCallback);
  
    // Clean up listener on unmount
    return () => {
      sound?.off('end', onEndCallback);
    };
  }, [loop, sound, setCurrentTime, setPlayedDuration, onPlayNext, updatePlayCount, user]);

  useEffect(() => {
    // Set up an interval to update the current playback time every 0.5 seconds
    if (isPlaying && sound) {
      const intervalId = setInterval(() => {
        setCurrentTime((prevTime) => {
          const updatedTime = Math.min(prevTime + 0.5, progressBarDuration);
          setTrackedTime(prevTime);
          if (trackedTime <= updatedTime) {
            setPlayedTime(playedTime + 0.5);
          }
          if (updatedTime >= progressBarDuration) {
            clearInterval(intervalId);
          }
          setPlayedDuration(updatedTime);
          return updatedTime;
        });
      }, 500);
      console.log(`Duration: ${progressBarDuration}`)

      // Clear the interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [loop, isPlaying, progressBarDuration, setPlayedDuration, sound, playedTime, trackedTime]);

  useEffect(() => {
    if (!isPlayed) {
      return; 
    } 
    const updateDuration = () => {
      const soundDuration = sound?.duration();
      if (soundDuration) {
        setProgressBarDuration(soundDuration);
      }
    };

    updateDuration();
  }, [isPlayed, progressBarDuration, setProgressBarDuration, sound]);

  useEffect(() => {
    console.log(shuffle ? 'shuffle' : 'no shuffle')
    console.log('shuffled list', shuffledIds)
    console.log('history', playHistory)
  }, [playHistory, shuffle, shuffledIds])


  return (
    <div className='grid grid-cols-6 md:grid-cols-5 h-full w-full'>
      <div className='flex w-full justify-start items-center'>
        <div className='flex items-center gap-x-4 ml-2'>
          <LikeButton songId={song.id} />
          <MediaItem data={song} type='player' />
        </div>
      </div>

      <div className='hidden h-full w-full max-w-[328px] gap-x-10 md:flex justify-between items-center'>
        <p
          className='flex justify-center items-center text-lg font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-1 rounded-full shadow-md select-none'
        >
          <ImHeadphones />&nbsp;&nbsp;{formatNumber(song.play_count)}
        </p>
        <p className='flex justify-center items-center text-lg font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-1 rounded-full shadow-md select-none'>
          <FaClock />&nbsp;&nbsp;{formatTime(playedDuration)}&nbsp;&nbsp;|&nbsp;&nbsp;{formatTime(progressBarDuration)}
        </p>
      </div>

      <div className='flex md:hidden col-auto justify-end items-center h-full w-full'>
        <FaBackwardStep
          onClick={onPlayPrevious}
          size={30}
          className='text-neutral-600 cursor-pointer hover:text-white transition'
        />
        <div
          onClick={handlePlay}
          className={`flex items-center justify-center h-16 w-16 rounded-full bg-white hover:bg-primaryAccent cursor-pointer transition ${Icon === FaPlay ? 'pl-1' : ''}`}
        >
          <Icon size={Icon === FaPlay ? 20 : 24} className='text-black' />
        </div>
        <FaForwardStep
          onClick={onPlayNext}
          size={30}
          className='text-neutral-600 cursor-pointer hover:text-white transition'
        />
      </div>

      <div className='hidden h-full w-full max-w-[722px] gap-x-10 md:flex justify-center items-center'>
        <FaRepeat
          onClick={toggleLoop}
          size={24}
          title={`${loop ? 'Loop: On' : 'Loop: Off'}`}
          className={`cursor-pointer hover:text-white transition ${loop ? 'text-white' : 'text-neutral-600'}`}
        />
        <FaBackwardStep
          onClick={onPlayPrevious}
          size={30}
          className='text-neutral-600 cursor-pointer hover:text-white transition'
        />
        <div
          onClick={handlePlay}
          className={`flex items-center justify-center h-16 w-16 rounded-full bg-white hover:bg-primaryAccent cursor-pointer transition ${Icon === FaPlay ? 'pl-1' : ''}`}
        >
          <Icon size={Icon === FaPlay ? 20 : 24} className='text-black' />
        </div>
        <FaForwardStep
          onClick={onPlayNext}
          size={30}
          className='text-neutral-600 cursor-pointer hover:text-white transition'
        />
        <FaShuffle
          onClick={toggleShuffle}
          size={24}
          title={`${shuffle ? 'Shuffle: On' : 'Shuffle: Off'}`}
          className={`cursor-pointer hover:text-white transition ${shuffle ? 'text-white' : 'text-neutral-600'}`}
        />
      </div>

      <div className='hidden h-full w-full max-w-[300px] gap-x-10 md:flex justify-between items-center mx-12'>
        <button
          onClick={handleSpeed} 
          className='flex justify-center items-center text-lg font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 px-3 py-1 rounded-full shadow-md transition-all duration-1000 ease-in-out'
        >
          <IoRocket
            className='cursor-pointer'
            size={24}
          />&nbsp;
          x{speed}
        </button>
        <button
          onClick={handleShowLyrics}
          className='flex justify-center items-center text-lg font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 px-3 py-1 rounded-full shadow-md transition-all duration-1000 ease-in-out'
        >
          <MdLyrics
            className='cursor-pointer'
            size={24}
          />&nbsp;
          Show lyrics
        </button>
      </div>

      <div className='hidden h-full w-full max-w-[400px] gap-x-0 md:flex justify-between items-center pl-[14px]'>
        <button
          onClick={handleDownload}
          className='flex justify-center items-center text-lg font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 px-3 py-1 rounded-full shadow-md transition-all duration-1000 ease-in-out'
        >
          <FaDownload
            className='cursor-pointer'
            size={20}
          />&nbsp;
          Download
        </button>
        <div className='hidden md:flex items-center gap-x-2 w-[120px] pr-4'>
          <VolumeIcon
            onClick={toggleMute}
            className='cursor-pointer'
            size={34}
          />
          <Slider
            value={volume}
            label='Volume'
            thick='h-[4px]'
            isRounded='rounded-full'
            background='bg-neutral-600'
            foreground={`${volume === 1 ? 'bg-primaryAccent' : 'bg-white'}`}
            onChange={(value: number) => setVolume(value)}
          />
        </div>
      </div>
    </div>
  );
};

export default PlayerContent;