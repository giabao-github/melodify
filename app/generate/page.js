'use client';

import Header from '@/components/Header';
import { Geologica } from 'next/font/google';
import WaveSurfer from 'wavesurfer.js';
import React, { useEffect, useRef, useState } from 'react';
import { FaRocket, FaMusic } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { ScaleLoader } from 'react-spinners';
import axios from 'axios';

const geologica = Geologica({ weight: ['400', '700'], subsets: ["latin", "cyrillic", "vietnamese", "greek"]});

const Generate = ({}) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(20);
  const [audioUrl, setAudioUrl] = useState('');
  const waveformRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const downloadLinkRef = useRef(null);

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.remove();
      toast.error('Please provide a description');
      return;
    }

    setLoading(true);
    setAudioUrl(null);

    try {
      const response = await axios.post("http://localhost:5000/api/generate-music", {
        description,
        duration,
      });

      if (response.data.success) {
        const generatedAudioUrl = response.data.file_url;
        if (generatedAudioUrl) {
          setAudioUrl(generatedAudioUrl);
        } else {
          toast.remove();
          toast.error("Music generation failed: missing file URL");
        }
      } else {
        toast.remove();
        toast.error("Music generation failed: " + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error("Error during music generation:", error);
      toast.remove();
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (audioUrl && waveformRef.current) {
      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#D2D8D7',
        progressColor: '#00A2FF',
        height: 128,
        barWidth: 2,
      });
  
      wavesurfer.load(audioUrl);
    }
  }, [audioUrl]);
  


  return (
    <div className='bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto'>
      <title>Melodify | Generate Music</title>
      <Header>
        <div className="mb-2 flex flex-col gap-y-6">
          <h1 className="text-white text-4xl font-bold my-4 mx-4">Generate Music</h1>
        </div>
      </Header>
      <main className='w-full flex flex-col items-center justify-center mt-10'>
        <div className='w-full flex justify-center flex-wrap md:flex-col md:items-center'>
          <form
            className='relative w-3/5 lg:h-40 xs:w-full flex flex-col justify-center items-center border-4 border-white rounded-md mb-1 bg-gradient-to-r from-primaryAccent via-white to-secondaryAccent md:self-center'
          >
            <span
              title='Generated Music'
              className='flex flex-col justify-center items-center cursor-pointer'
            >
              <p className={`text-black font-normal mt-1 text-2xl md:text-xl sm:text-lg xs:hidden ${geologica.className}`}>
                Generated Music will be shown here
              </p>
            </span>
          </form>
        </div>
        <div className='w-full flex justify-center flex-wrap my-4 md:flex-col md:items-center'>
          <div className='relative w-3/5 xs:w-full border-4 border-gray-400 rounded-md bg-gradient-to-r from-primaryAccent via-white to-secondaryAccent focus-within:border-white'>
            <textarea
              id='description'
              title='Describe your music'
              className='bg-gradient-to-r from-primaryAccent via-white to-secondaryAccent w-full pt-2 px-4 rounded-md border-none resize-none outline-none text-black text-lg font-bold placeholder:text-black/40'
              placeholder='A romantic song with a catchy melody'
              maxLength={1000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Tab') {
                  e.preventDefault();
                  setDescription(e.target.placeholder);
                }
              }}
            />
            <div className='my-1'>
              <button
                onClick={() => {
                  if (description.length > 0)
                    setDescription('');
                  else
                    setDescription(document.querySelector('textarea').placeholder);
                }}
                className='block absolute left-4 xxs:left-3 bottom-0 mr-[14px] my-2 px-2 py-[1px] rounded-[4px] bg-gradient-to-r from-primaryAccent via-white to-secondaryAccent text-black font-bold border border-solid border-black text-[0.65rem] xs:!text-[0.55rem] xxs:!text-[0.5rem]'
              >
                {description.length > 0 ? 'Clear' : 'Tab'}
              </button>
              <p className='w-full px-4 xxs:px-3 pb-1 flex justify-end bg-gradient-to-r from-primaryAccent via-white to-secondaryAccent text-sm font-semibold text-black'>{`${description.length}/1000`}</p>
            </div>
          </div>
        </div>
        <div className='w-full flex justify-center mt-1 mb-4 flex-wrap md:flex-col md:items-center'>
          <div className='w-2/5 flex justify-center items-center bg-gradient-to-r from-primaryAccent via-white to-secondaryAccent p-4 rounded-lg shadow-md border-4 border-white'>
            <FaMusic className='text-xl mr-3 text-black' />
            <label
              htmlFor='duration'
              className='font-bold text-lg text-black'
            >
              Music Duration:
            </label>
            <input
              type='range'
              id='duration'
              value={duration}
              onChange={(e) => setDuration(Math.max(10, Math.min(20, parseInt(e.target.value))))}
              min='10'
              max='20'
              className='w-48 mx-8 transition-all ease-in-out'
              style={{
                background: `linear-gradient(
                  to right,
                  #000 ${((duration - 10) / (20 - 10)) * 100}%,
                  #ccc ${((duration - 10) / (20 - 10)) * 100}%
                )`,
              }}
            />
            <span className='font-bold text-lg text-black'>
              {duration} seconds
            </span>
          </div>
        </div>
        <button
          className='text-black mt-10 flex items-center bg-gradient-to-r from-primaryAccent via-white to-secondaryAccent hover:bg-gradient-to-l hover:from-primaryAccent hover:via-white hover:to-secondaryAccent text-light py-3 px-6 rounded-2xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-400 text-lg font-bold border-2 border-solid border-white 0.75xl:text-base md:text-lg transition-all ease-in-out duration-100'
          onClick={handleGenerate}
        >
          Generate&nbsp;&nbsp;
          <FaRocket />
        </button>

        {loading && (
          <div className='flex justify-center items-center mt-10'>
            <ScaleLoader color='#18FFFF' />
          </div>
        )}

        {audioUrl && (
          <div ref={audioPlayerRef} className='text-center mt-6'>
            <h4 className='text-center mb-3'>AI Generated Music Below</h4>
            <audio controls>
            <source src={audioUrl} type="audio/wav" />
              Your browser does not support the audio tag.
            </audio>
            <div className='row'>
              <div className='col-sm-12'>
                <div ref={waveformRef} id='waveform' className='waveform'></div>
              </div>
              <div className='col-sm-1 pt-3 d-none'>
                <div className='text-end mt-4'>
                  <a
                    ref={downloadLinkRef}
                    href={audioUrl}
                    className='text-pink-600 text-2xl'
                    download
                  >
                    <i className='fas fa-download'></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Generate;
