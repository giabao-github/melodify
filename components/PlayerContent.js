"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import MediaItem from './MediaItem';
import LikeButton from './LikeButton';
import { FaPlay, FaPause, FaForwardStep, FaBackwardStep, FaVolumeHigh, FaVolumeXmark, FaShuffle, FaRepeat, FaClock, FaDownload } from "react-icons/fa6";
import { IoRocket } from "react-icons/io5";
import { ImHeadphones } from "react-icons/im";
import { MdLyrics } from "react-icons/md";
import Slider from './Slider';
import usePlayer from '@/hooks/usePlayer';
import useSound from 'use-sound';
import useProgressBar from '@/hooks/useProgressBar';
import usePlayerSettings from '@/hooks/usePlayerSettings';
import useLyricsModal from '@/hooks/useLyricsModal';
import { useUser } from '@/hooks/useUser';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import toast from 'react-hot-toast';


const PlayerContent = ({ song, songUrl }) => {
  const player = usePlayer();
  const [previousVolume, setPreviousVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlayed, setIsPlayed] = useState(false);
  const [end, setEnd] = useState(false);
  const [playedSongs, setPlayedSongs] = useState([]);
  const [playedTime, setPlayedTime] = useState(0);
  const [trackedTime, setTrackedTime] = useState(0);
  const [playCount, setPlayCount] = useState(0);
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
          .eq('user_id', user.id)
          .eq('title', song.title)
          .eq('author', song.author)
          .single();

        if (fetchError) {
          console.error("Error fetching play count:", fetchError);
          toast.remove();
          return toast.error(fetchError.message);
        }

        // Update the play count in the database
        const newPlayCount = data.play_count + 1;
        setPlayCount(newPlayCount);
        const { error: updateError } = await supabaseClient
          .from('songs')
          .update({
            play_count: newPlayCount,
          })
          .eq('user_id', user.id)
          .eq('title', song.title)
          .eq('author', song.author)

        if (updateError) {
          console.error("Play count update error:", updateError);
          toast.remove();
          return toast.error(updateError.message);
        }

        // Update the local state of the song
        setSong((prevSong) => ({
          ...prevSong,
          play_count: newPlayCount,
        }));
      } catch (error) {
        console.error("Error updating play count:", error);
        toast.remove();
        return toast.error(error.message);
      }
    }
  }, [playedTime, setSong, song.author, song.duration, song.title, supabaseClient, user.id])


  const onPlayNext = useCallback(() => {
    setPlayedDuration(0);
    updatePlayCount();
    if (player.ids.length === 0) {
      return;
    }

    if (shuffle) {
      // Pick a random song index if shuffle is enabled
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * player.ids.length);
      } 
      while (playedSongs.includes(player.ids[randomIndex]));

      const nextSong = player.ids[randomIndex];
      setPlayedSongs([...playedSongs, nextSong]);
      player.setId(nextSong);
    } else {
      const currentIndex = player.ids.findIndex((id) => id === player.activeId);
      const nextSong = player.ids[currentIndex + 1];
      console.log(`current: ${player.activeId}, next: ${nextSong}, ids: ${player.ids}`);
      if (nextSong) {
        player.setId(nextSong);
      } else {
        player.setId(player.ids[0]);
      }
    }
  }, [playedSongs, player, setPlayedDuration, shuffle, updatePlayCount])


  const onPlayPrevious = () => {
    setPlayedDuration(0);
    updatePlayCount();
    if (player.ids.length === 0) {
      return;
    }
  
    if (shuffle) {
      // Pick a random song index if shuffle is on
      const randomIndex = Math.floor(Math.random() * player.ids.length);
      player.setId(player.ids[randomIndex]);
    } else {
      const currentIndex = player.ids.findIndex((id) => id === player.activeId);
      const previousSong = player.ids[currentIndex - 1];
  
      if (previousSong) {
        player.setId(previousSong);
      } else {
        player.setId(player.ids[player.ids.length - 1]);
      }
    }
  }


  const handlePlay = () => {
    if (!isPlaying) {
      play();
    } else {
      pause();
    }
  }

  const toggleLoop = () => {
    if (!loop)
      setShuffle(false);
    setLoop(!loop);
  }

  const toggleShuffle = () => {
    if (!shuffle)
      setLoop(false);
    setShuffle(!shuffle);
  }

  const handleSpeed = () => {
    if (!speed) 
      setSpeed(1);
    else {
      if (speed === 4)
        setSpeed(0.5);
      else
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
    if (isOpen)
      return onClose();
    return onOpen();
  }

  const handleDownload = async () => {
    if (!songUrl) {
      toast.remove();
      toast.error("This song is not support download yet");
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
      link.parentNode.removeChild(link);

    } catch (error) {
      console.error("Error downloading the file:", error);
      toast.remove();
      toast.error("Failed to download the song");
    }
  };

  const formatTime = (seconds) => {
    if (seconds < 0) seconds = 0;
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

  const formatNumber = (number) => {
    if (!number) return 0;
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
      setPlayedSongs([]);
    }
  }, [shuffle]);

  useEffect(() => {
    const onEndCallback = async () => {
      updatePlayCount();
      if (loop) {
        setCurrentTime(0);
        setPlayedDuration(0);
        sound?.play();
      } else {
        onPlayNext();
      }
    };
  
    sound?.on("end", onEndCallback);
  
    // Clean up listener on unmount
    return () => {
      sound?.off("end", onEndCallback);
    };
  }, [loop, sound, setCurrentTime, setPlayedDuration, onPlayNext, updatePlayCount]);

  useEffect(() => {
    // Set up an interval to update the current playback time every 0.5 seconds
    if (isPlaying && sound) {
      const intervalId = setInterval(() => {
        setCurrentTime((prevTime) => {
          const updatedTime = Math.min(prevTime + 0.5, progressBarDuration);
          setTrackedTime(prevTime);
          if (trackedTime <= updatedTime)
            setPlayedTime(playedTime + 0.5);
          if (updatedTime >= progressBarDuration) 
            clearInterval(intervalId);
          setPlayedDuration(updatedTime);
          return updatedTime;
        });
      }, 500);
      // console.log(`Loop: ${loop}, End: ${end}, Played time: ${playedTime}s`)
      console.log(`Duration: ${progressBarDuration}`)

      // Clear the interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [loop, isPlaying, progressBarDuration, setPlayedDuration, end, sound, playedTime, trackedTime]);

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
            onChange={(value) => setVolume(value)}
          />
        </div>
      </div>
    </div>
  );
};

export default PlayerContent;