"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import queryString from 'query-string';
import { CiSearch } from 'react-icons/ci';
import { IoCloseCircle } from 'react-icons/io5';
import useDebounce from '../hooks/useDebounce';
import Input from './Input';


const SearchInput = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTitle = searchParams?.get('title') || '';
  const [value, setValue] = useState(initialTitle);
  const debouncedValue = useDebounce(value, 300);

  const getQueryParams = (url: string, param: string) => {
    const parts = url.split('?');
    if (parts.length < 2) {
      return '';
    }

    const stringQuery = parts.slice(1).join('?');
    try {
      const params = new URLSearchParams(stringQuery);
      return params.get(param);
    } catch (error) {
      console.error('Invalid query string:', error);
      return '';
    }
  }

  const clearInput = () => {
    setValue('');
    const url = queryString.stringifyUrl({
      url: '/search',
      query: { title: '' },
    });
    router.push(url);
  };


  useEffect(() => {
    if (debouncedValue.trim() !== '') {
      const query = {
        title: debouncedValue,
      };
  
      const url = queryString.stringifyUrl({
        url: '/search',
        query: query,
      });
  
      router.push(url);
    }
  }, [debouncedValue, router]);


  return (
    <div className='flex items-center bg-neutral-800 border-white border-2 rounded-full px-4 w-2/3'>
      <CiSearch className='text-white stroke-1' size={32} />
      <Input
        className='bg-neutral-800 placeholder-neutral-500 flex-1 outline-none text-base font-medium'
        placeholder='What do you want to listen to?'
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {value && (
        <button
          title='Clear input'
          className='text-white opacity-70 hover:opacity-100'
          onClick={clearInput}
          >
          <IoCloseCircle size={20} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;