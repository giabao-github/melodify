'use client';

import axios from 'axios';
import { Geologica } from 'next/font/google';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ScaleLoader } from 'react-spinners';
import { BiReset } from 'react-icons/bi';
import { MdSpeed } from 'react-icons/md';
import { FaPlay, FaPause, FaWandMagicSparkles, FaDownload, FaVolumeXmark, FaVolumeHigh } from 'react-icons/fa6';
import { IoMusicalNotes, IoRocket } from 'react-icons/io5';
import Header from '../components/Header';

const geologica = Geologica({ weight: ['400', '700'], subsets: ['latin', 'cyrillic', 'vietnamese', 'greek']});

const Generate = ({}) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(5);
  const [music, setMusic] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [maxTime, setMaxTime] = useState(0); 
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const previousVolume = useRef(volume);
  const exampleDescription = 'Ethereal piano melodies with ambient synth pads';

  const handleInputChange = (e) => {
    const input = e.target.value;
    if (input.length <= 1000) {
      setDescription(input);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.load();
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressClick = (e) => {
    const progressBar = progressBarRef.current;
    const clickPosition = e.nativeEvent.offsetX;
    const progressBarWidth = progressBar.offsetWidth;
    const newProgress = (clickPosition / progressBarWidth) * 100;
    const newTime = (clickPosition / progressBarWidth) * duration;
    setProgress(newProgress);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleSpeedChange = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
    if (audioRef.current) {
      audioRef.current.playbackRate = speeds[nextIndex];
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0) {
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
  };

  const handleMute = () => {
    if (isMuted) {
      setVolume(previousVolume.current);
    } else {
      previousVolume.current = volume;
      setVolume(0); 
    }
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const handleDownload = async () => {
    if (music) {
      try {
        const response = await fetch(music);
        const blob = await response.blob();
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = 'generated-music.wav';
        link.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading audio:', error);
        toast.remove();
        toast.error('Download failed');
      }
    } else {
      toast.remove();
      toast.error('No audio available for download');
    }
  };
  

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleGenerate = async (description) => {
    if (!description.trim()) {
      toast.remove();
      toast.error('Please provide a description');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/generate', {
        description,
        duration,
      });
      if (response.data.audio_file) {
        setMusic(`http://localhost:8000/${response.data.audio_file}`);
        toast.remove();
        toast.success('Music generated successfully');
      } else {
        toast.remove();
        toast.error('Failed to generate music');
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleTabKeyPress = (e) => {
      if (e.key === 'Tab') {
        setDescription(exampleDescription);
      }
    };

    document.addEventListener('keydown', handleTabKeyPress);

    return () => {
      document.removeEventListener('keydown', handleTabKeyPress);
    };
  }, []);


  return (
    <div className='bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto'>
      <title>Melodify | Generate Music</title>
      <Header>
        <div className='mb-2 flex flex-col gap-y-6'>
          <h1 className='text-white text-4xl font-bold my-4 mx-4'>Generate Music</h1>
        </div>
      </Header>
      <main className={`w-full flex flex-col items-center justify-center mt-10 ${geologica.className}`}>
        <div className='w-[70%] mx-auto space-y-16 py-16'>
          <div className='relative'>
            <label className='block text-lg font-medium mb-4'>Description</label>
            <textarea
              value={description}
              onChange={handleInputChange}
              placeholder={exampleDescription}
              className='w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none'
            />
            <div className='flex flex-row justify-between items-center m-2'>
              <div className='flex gap-4'>
                <button
                  onClick={() => setDescription(exampleDescription)}
                  className='bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md text-sm flex items-center gap-2'
                >
                  <FaWandMagicSparkles /> Tab
                </button>
                <button
                  onClick={() => setDescription('')}
                  className='bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md text-sm flex items-center gap-2'
                >
                  <BiReset /> Clear
                </button>
              </div>
              <div className='text-right text-sm text-gray-400 mt-1'>
                {description.length}/1000
              </div>
            </div>
          </div>

          <div className='flex flex-col space-y-6 w-full'>
            <label className='block text-lg font-medium'>Duration:&nbsp; {duration} seconds</label>
            <div className='flex flex-col gap-y-4'>
              <input
                type='range'
                min='5'
                max='25'
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className='h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer custom-slider'
                style={{
                  background: `linear-gradient(to right, rgb(168, 85, 247) ${((duration - 5) / 20) * 100}%, rgb(55, 65, 81) ${((duration - 5) / 20) * 100}%)`
                }}
              />
              <div className='flex justify-between text-sm text-gray-400'>
                <span>5s</span>
                <span>25s</span>
              </div>
            </div>
          </div>
          <style jsx>
            {`
              .custom-slider {
                width: 100%
              }

              .custom-slider::-webkit-slider-thumb {
                appearance: none;
                width: 16px;
                height: 16px;
                background-color: white;
                border-radius: 50%;
                border: 2px solid rgb(168, 85, 247);
                cursor: pointer;
              }

              .custom-slider::-moz-range-thumb {
                width: 16px;
                height: 16px;
                background-color: white;
                border-radius: 50%;
                border: 2px solid rgb(168, 85, 247);
                cursor: pointer;
              }

              .custom-slider::-ms-thumb {
                width: 16px;
                height: 16px;
                background-color: white;
                border-radius: 50%;
                border: 2px solid rgb(168, 85, 247);
                cursor: pointer;
              }
            `}
          </style>

          {loading ? (
            <div className='flex justify-center items-center mt-10'>
              <ScaleLoader color='#18FFFF' />
            </div>
          ) : (
            <button
              onClick={() => handleGenerate(description)}
              className='flex flex-row gap-x-4 justify-center items-center w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform'
            >
              Generate
              <IoRocket />
            </button>
          )}

          <div className='bg-gray-800 rounded-lg p-6 space-y-4'>
            {music ? (
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                    <div className='flex gap-x-4'>
                      <div className='flex justify-between items-center'>
                        <button
                          title={`Volume: ${volume * 100}%`}
                          onClick={handleMute}
                          className='p-3 rounded-full bg-gray-700 hover:bg-gray-600'
                        >
                          {isMuted ? <FaVolumeXmark /> : <FaVolumeHigh />}
                        </button>
                        <input
                          type='range'
                          min='0'
                          max='1'
                          step='0.01'
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className='w-full mx-4 cursor-pointer custom-slider'
                          style={{ background: `linear-gradient(to right, rgb(168, 85, 247) ${(volume) * 100}%, rgb(55, 65, 81) ${(volume) * 100}%)` }}
                        />
                      </div>
                      <button
                        onClick={handleSpeedChange}
                        className='w-[87px] ml-2 flex justify-center items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-full'
                      >
                        <MdSpeed />
                        {playbackSpeed}x
                      </button>
                    </div>
                  <button 
                    onClick={handleDownload}
                    className='bg-gray-700 hover:bg-gray-600 p-3 rounded-full'
                  >
                    <FaDownload />
                  </button>
                </div>

                <div 
                  ref={progressBarRef}
                  onClick={handleProgressClick}
                  className='bg-gray-700 h-2 rounded-full overflow-hidden cursor-pointer'
                >
                  <div
                    className='bg-purple-500 h-full transition-all duration-300'
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <audio
                  src={music} 
                  type='audio/wav'
                  ref={audioRef}
                  onTimeUpdate={(e) => {
                    const current = e.target.currentTime;
                    const total = e.target.duration;
                    setCurrentTime(current);
                    setProgress((current / total) * 100);
                  }}
                  onLoadedMetadata={(e) => setMaxTime(e.target.duration)}
                  onEnded={() => setIsPlaying(false)}
                />
                <div className='mt-4 flex justify-between text-sm'>
                  <span>{formatTime(currentTime)}</span>
                  <button
                    onClick={handlePlayPause}
                    className='bg-purple-500 hover:bg-purple-400 p-4 rounded-full'
                  >
                    {isPlaying ? <FaPause size={24} /> : <FaPlay size={24} />}
                  </button>
                  <span>{formatTime(maxTime)}</span>
                </div>
              </div>
            ) : (
              <div className='flex flex-col gap-y-2 justify-center items-center py-8'>
                <IoMusicalNotes className='text-4xl mb-2' />
                <p>Your generated music will appear here</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Generate;
