"use client";

import axios from 'axios';
import { Geologica } from 'next/font/google';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ScaleLoader } from 'react-spinners';
import { BiReset } from 'react-icons/bi';
import { MdSpeed } from 'react-icons/md';
import { FaPlay, FaPause, FaWandMagicSparkles, FaDownload, FaVolumeXmark, FaVolumeHigh } from 'react-icons/fa6';
import { IoMusicalNotes } from 'react-icons/io5';
import Header from '../components/Header';

const geologica = Geologica({ weight: ['400', '700'], subsets: ['latin', 'cyrillic', 'vietnamese', 'greek'] });

interface GenerateProps {}

const Generate: React.FC<GenerateProps> = ({}) => {
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const previousVolume = useRef<number>(volume);
  const exampleDescription = 'Ethereal piano melodies with ambient synth pads';

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressBarRef.current;
    const clickPosition = e.nativeEvent.offsetX;
    const progressBarWidth = progressBar?.offsetWidth || 0;
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
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

  const formatTime = (time: number) => {
    if (time < 0 || !time) {
      time = 0;
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleGenerate = async (description: string) => {
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
      toast.error(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleTabKeyPress = (e: KeyboardEvent) => {
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
          <h1 className='text-white text-4xl font-bold my-6 mx-4'>Generate Music</h1>
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
                title={`Duration: ${duration}s`}
                type='range'
                min='5'
                max='25'
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                className='h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer custom-slider'
                style={{
                  background: `linear-gradient(to right, rgb(168, 85, 247) ${((duration - 5) / 20) * 100}%, rgb(55, 65, 81) ${((duration - 5) / 20) * 100}%)`,
                }}
              />
              <div className='flex justify-between text-sm text-gray-400'>
                <span>5s</span>
                <span>25s</span>
              </div>
            </div>
          </div>
          <style jsx>{`
            .custom-slider {
              width: 100%;
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
          `}</style>

          {loading ? (
            <div className='flex justify-center items-center mt-10'>
              <ScaleLoader color='#18FFFF' />
            </div>
          ) : (
            <button
              onClick={() => handleGenerate(description)}
              className='flex flex-row gap-x-4 justify-center items-center w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 py-4 rounded-lg font-bold text-lg transition-all duration-300 text-white'
            >
              <IoMusicalNotes size={24} />
              <span>Generate Music</span>
            </button>
          )}

          {music && (
            <div className='bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center'>
              <div className='flex justify-between items-center gap-4 mb-4 w-full'>
                <div className='flex flex-row gap-x-4'>
                  <button
                    title='Play'
                    onClick={handlePlayPause}
                    className='p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white flex items-center justify-center'
                  >
                    {isPlaying ? <FaPause size={18} /> : <FaPlay size={18} />}
                  </button>
                  <div className='flex items-center gap-4'>
                    <button onClick={handleMute} className='p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white flex items-center justify-center'>
                      {isMuted ? <FaVolumeXmark size={18} /> : <FaVolumeHigh size={18} />}
                    </button>
                    <input
                      title={`Volume: ${volume * 100}%`}
                      type='range'
                      min='0'
                      max='1'
                      step='0.01'
                      value={volume}
                      onChange={handleVolumeChange}
                      className='h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer custom-slider'
                      style={{
                        background: `linear-gradient(to right, rgb(168, 85, 247) ${volume * 100}%, rgb(55, 65, 81) ${volume * 100}%)`,
                      }}
                    />
                    <span className='text-sm text-gray-400 w-full'>Volume: {Math.round(volume * 100)}%</span>
                  </div>
                </div>
                <button
                  title='Download audio'
                  onClick={handleDownload}
                  className='p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white flex items-center justify-center'
                >
                  <FaDownload size={18} />
                </button>
              </div>
              <audio
                ref={audioRef}
                src={music}
                onTimeUpdate={() => {
                  if (audioRef.current) {
                    const currentTime = audioRef.current.currentTime;
                    const maxTime = audioRef.current.duration;
                    setCurrentTime(currentTime);
                    setMaxTime(maxTime);
                    setProgress((currentTime / maxTime) * 100);
                  }
                }}
                onLoadedMetadata={() => {
                  if (audioRef.current) {
                    setMaxTime(audioRef.current.duration);
                  }
                }}
              />
              <div className='w-full h-2 bg-gray-700 rounded-lg mt-4 cursor-pointer' onClick={handleProgressClick} ref={progressBarRef}>
                <div
                  className='h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg'
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className='flex items-center justify-between text-sm mt-4 text-gray-400'>
                <span>{formatTime(currentTime)}&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                <span>{formatTime(maxTime)}</span>
              </div>
              <div className='flex flex-col items-center justify-center mt-4 gap-y-4'>
                <div className='flex items-center gap-4'>
                  <button 
                    title={`Speed: ${playbackSpeed}`}
                    onClick={handleSpeedChange} className='p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white flex items-center justify-center'
                  >
                    <MdSpeed size={22} />
                  </button>
                  <span className='text-sm text-gray-400'>Speed: {playbackSpeed}x</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Generate;
