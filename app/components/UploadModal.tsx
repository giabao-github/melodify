"use client";

import React, { ChangeEvent, useState } from 'react';
import toast from 'react-hot-toast';
import uniqid from 'uniqid';
import { FieldErrors, FieldValues, useForm } from 'react-hook-form';
import { FaTrashCan } from "react-icons/fa6";
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { useUser } from '../hooks/useUser';
import useUploadModal from '../hooks/useUploadModal';


const UploadModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSong, setSelectedSong] = useState<File | null>(null);
  const [selectedArtwork, setSelectedArtwork] = useState<File | null>(null);
  const uploadModal = useUploadModal();
  const { user } = useUser();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FieldValues>({
    defaultValues: {
      title: '',
      author: '',
      song: null,
      image: null,
    }
  });

  const onChange = (open: boolean) => {
    if (!open) {
      reset();
      setSelectedSong(null);
      setSelectedArtwork(null);
      uploadModal.onClose();
    }
  }

  const onSubmit = async (values: FieldValues) => {
    console.log('Form submitted with values:', values);
    try {
      console.log(user);
      setIsLoading(true);
      
      const songFile = watch('song');
      const imageFile = watch('image');

      if (!user) {
        toast.remove();
        toast.error('Please login first');
        return;
      }
      if (!songFile || songFile.length === 0) {
        toast.remove();
        toast.error('Please upload a song');
        return;
      }
      if (!imageFile|| imageFile.length === 0) {
        toast.remove();
        toast.error('Please upload an artwork');
        return;
      }

      const uniqueID = uniqid();

      // Upload song
      const { data: songData, error: songError } = await supabaseClient
        .storage
        .from('songs')
        .upload(`song-${values.title}-${uniqueID}`, songFile, { cacheControl: '3600', upsert: false });

      if (songError) {
        console.error("Song upload error:", songError);
        setIsLoading(false);
        toast.remove();
        return toast.error('Upload song failed');
      }
      console.log("Song uploaded successfully:", songData);

      // Upload artwork
      console.log("Uploading artwork...");
      const { data: imageData, error: imageError } = await supabaseClient
        .storage
        .from('images')
        .upload(`image-${values.title}-${uniqueID}`, imageFile, { cacheControl: '3600', upsert: false });

      if (imageError) {
        console.error("Artwork upload error:", imageError);
        setIsLoading(false);
        toast.remove();
        return toast.error('Upload artwork failed');
      }
      console.log("Artwork uploaded successfully:", imageData);

      // Insert the uploaded song to the table 'songs' in database
      const { error: supabaseError } = await supabaseClient
        .from('songs')
        .insert({
          user_id: user.id,
          title: values.title.trim(),
          author: values.author.trim(),
          album: values.album?.trim() || '',
          genre: values.genre.trim(),
          lyrics: values.lyrics?.trim() || '',
          song_path: songData.path,
          image_path: imageData.path,
        });

      if (supabaseError) {
        console.error("Database insert error:", supabaseError);
        setIsLoading(false);    
        toast.remove();
        return toast.error(supabaseError.message);
      }

      router.refresh();
      setIsLoading(false);
      toast.remove();
      toast.success('Song uploaded');
      reset();
      uploadModal.onClose();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.remove();
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  const onError = (errors: FieldErrors) => {
    if (errors.title) {
      toast.remove();
      toast.error(errors.title.message);
      return;
    }
    if (errors.author) {
      toast.remove();
      toast.error(errors.author.message);
      return;
    }
    if (errors.genre) {
      toast.remove();
      toast.error(errors.genre.message);
      return;
    }
  }; 

  const handleSongChange = (event: ChangeEvent<HTMLInputElement>) => {
    const song = event.target.files?.[0];
    if (song) {
      setSelectedSong(song);
      setValue('song', song);
    }
  };

  const handleArtworkChange = (event: ChangeEvent<HTMLInputElement>) => {
    const artwork = event.target.files?.[0];
    if (artwork) {
      setSelectedArtwork(artwork);
      setValue('image', artwork);
    }
  };

  const handleRemoveSong = () => {
    setSelectedSong(null);
  };

  const handleRemoveArtwork = () => {
    setSelectedArtwork(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setSelectedSong(file);
        setValue('song', file);
      } else if (file.type.startsWith('image/')) {
        setSelectedArtwork(file);
        setValue('image', file);
      }
    }
  };

  const resetFields = () => {
    reset();
    setSelectedSong(null);
    setSelectedArtwork(null); 
  };

  return (
    <Modal
      large={true}
      title='Add a song'
      description='Upload an audio file (mp3, flac, m4a, etc.)'
      isOpen={uploadModal.isOpen}
      onChange={onChange}
    >
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className='flex flex-col gap-y-6 mx-2'
      >
        <div className='flex flex-row justify-between'>
          <Input
            className='text-base border-white focus:border-yellow-500 w-[45%]'
            id='title'
            type='text'
            disabled={isLoading}
            {...register('title', { required: 'Song title is required' })}
            placeholder='Song title'
          />
          <Input
            className='text-base border-white focus:border-yellow-500 w-[45%]'
            id='author'
            type='text'
            disabled={isLoading}
            {...register('author', { required: 'Song artists are required' })}
            placeholder='Song artists'
          />
        </div>
        <div className='flex flex-row justify-between'>
          <Input
            className='text-base border-white focus:border-yellow-500 w-[45%]'
            id='album'
            type='text'
            disabled={isLoading}
            {...register('album')}
            placeholder='Song album'
          />
          <Input
            className='text-base border-white focus:border-yellow-500 w-[45%]'
            id='genre'
            type='text'
            disabled={isLoading}
            {...register('genre', { required: 'Song genres are required' })}
            placeholder='Song genres'
          />
        </div>  
        <Input
          className='text-base border-white focus:border-yellow-500'
          id='lyrics'
          type='text'
          disabled={isLoading}
          paragraph={true}
          {...register('lyrics')}
          placeholder='Song lyrics'
        />
        <div className='flex flex-row justify-between'>
          <div className='w-[45%]'>
            <div className='pb-2 ml-2 text-lg font-semibold'>Upload a song</div>
            <div 
              className={`border-gray-400 border-2 p-4 rounded-lg flex flex-row items-center justify-center ${selectedSong ? 'border-solid' : 'border-dashed'}`} 
              onDragOver={handleDragOver} 
              onDrop={handleDrop} 
            >
              <Input
                className='hidden'
                id='song'
                type='file'
                disabled={isLoading}
                accept='audio/*'
                onChange={handleSongChange}
              />
              <label htmlFor='song' className='w-full cursor-pointer bg-primaryAccent text-black px-2 py-2 rounded-lg flex justify-center font-semibold'>
                {selectedSong ? `${selectedSong.name.substring(0, 32)}${selectedSong.name.length > 32 ? '...' : ''}` : 'Choose File'}
              </label>
              {selectedSong && (
                <Button
                  type='button'
                  onClick={handleRemoveSong}
                  className='inline-flex items-center w-[10%] ml-3 bg-secondaryAccent text-black px-2 py-2 rounded-lg hover:opacity-100'
                >
                  <FaTrashCan />
                </Button>
              )}
            </div>
          </div>
          <div className='w-[45%]'>
            <div className='pb-2 ml-2 text-lg font-semibold'>Upload an artwork</div>
            <div 
              className={`border-gray-400 border-2 p-4 rounded-lg flex flex-row items-center justify-center ${selectedArtwork ? 'border-solid' : 'border-dashed'}`} 
              onDragOver={handleDragOver} 
              onDrop={handleDrop} 
            >
              <Input
                className='hidden'
                id='image'
                type='file'
                disabled={isLoading}
                accept='image/*'
                onChange={handleArtworkChange}
              />
              <label htmlFor='image' className='w-full cursor-pointer bg-primaryAccent text-black px-2 py-2 rounded-lg flex justify-center font-semibold'>
                {selectedArtwork ? `${selectedArtwork.name.substring(0, 32)}${selectedArtwork.name.length > 32 ? '...' : ''}` : 'Choose File'}
              </label>
              {selectedArtwork && (
                <Button
                  type='button'
                  onClick={handleRemoveArtwork}
                  className='inline-flex items-center w-[10%] ml-3 bg-secondaryAccent text-black px-2 py-2 rounded-lg hover:opacity-100'
                >
                  <FaTrashCan />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className='mt-10 flex flex-row justify-between'>
          <Button className='font-bold w-[45%] bg-rose-400' disabled={isLoading} type='button' onClick={resetFields}>
            {'RESET'}
          </Button>
          <Button className='font-bold w-[45%]' disabled={isLoading} type='submit'>
            {isLoading ? 'UPLOADING...' : 'ADD'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default UploadModal;
