"use client";

import useDebounce from '@/hooks/useDebounce';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import queryString from 'query-string';
import Input from './Input';
import { CiSearch } from "react-icons/ci";
import { IoCloseCircle } from "react-icons/io5";

const SearchInput = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTitle = searchParams.get('title') || '';
  const [value, setValue] = useState(initialTitle);
  const debouncedValue = useDebounce(value, 300);

  const getQueryParams = (url, param) => {
    const parts = url.split('?');
    if (parts.length < 2) return '';

    const stringQuery = parts.slice(1).join('?');
    try {
      const params = new URLSearchParams(stringQuery);
      return params.get(param);
    } catch (error) {
      console.error("Invalid query string:", error);
      return '';
    }
  }

  const clearInput = () => {
    setValue('');
    const url = queryString.stringifyUrl({
      url: '/search',
      query: { title: '' },
    });
    router.push(url, undefined, { shallow: true });
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
  
      router.push(url, undefined, { shallow: true });
    }
  }, [debouncedValue, router]);


  return (
    <div className='flex items-center bg-neutral-800 border-white border-2 rounded-full px-4 w-2/3'>
      <title>{`Melodify | ${value.length > 0 ? value : 'Search'}`}</title>
      <CiSearch className='text-white stroke-1' size={32} />
      <Input
        className='bg-neutral-800 placeholder-neutral-500 flex-1 outline-none text-base font-medium'
        placeholder='What do you want to listen to?'
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {value && (
        <button
          className="text-white opacity-70 hover:opacity-100"
          onClick={clearInput}
          >
          <IoCloseCircle size={20} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;