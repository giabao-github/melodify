"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSubscribeModal from '../../hooks/useSubscribeModal';
import { useUser } from '../../hooks/useUser';
import { postData } from '../../libs/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/Button';




const AccountContent = () => {
  const router = useRouter();
  const subscribeModal = useSubscribeModal();
  const { isLoading, subscription, user } = useUser();
  const [loading, setLoading] = useState(false);

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    };
    const formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);
    return formattedDate;
  }

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [isLoading, user, router]);

  const redirectToCustomerPortal = async () => {
    setLoading(true);
    try {
      const { url, error } = await postData({
        url: '/api/create-portal-link'
      });
      window.location.assign(url);
    } catch (error) {
      if (error) {
        toast.remove();
        toast.error((error as Error).message);
      }
    }
    setLoading(false);
  }

  return (
    <div className='my-8 mx-4 px-10'>
      <p className='text-2xl font-semibold mb-12 text-primaryAccent'>❄️ Subscription Details</p>
      {!subscription && (
        <div className='flex flex-col gap-y-4'>
          <p className='text-lg mb-12'>
            You are using <b>Melodify Free</b>
          </p>
          <Button
            onClick={subscribeModal.onOpen}
            className='w-[300px]'
          >
            Subscribe to Melodify Premium
          </Button>
        </div>
      )}
      {subscription && (
        <div className='flex flex-col gap-y-4'>
          <div className='mb-12'>
            <p className='text-lg mb-6'>
              You have subscribed to <b>{subscription?.prices?.products?.name}</b> since {formatDate(subscription?.created)}.
            </p>
            <p className='text-lg'>
              Your plan will expire in {formatDate(subscription?.current_period_end)}.
            </p>
          </div>
          <Button
            disabled={loading || isLoading}
            onClick={redirectToCustomerPortal}
            className='w-[300px]'
          >
            Open customer portal
          </Button>
        </div>
      )}
    </div>
  );
}

export default AccountContent;