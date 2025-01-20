"use client";

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaCircleCheck } from 'react-icons/fa6';
import { Price, ProductWithPrice } from '../../types';
import Button from './Button';
import Modal from './Modal';
import { useUser } from '../hooks/useUser';
import { postData } from '../libs/helpers';
import { getStripe } from '../libs/stripeClient';


interface SubscribeModalProps {
  products: ProductWithPrice[];
}

const formatPrice = (price: Price) => {
  const priceString = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currency,
    minimumFractionDigits: 0,
  }).format((price?.unit_amount || 0) / 100);

  return priceString;
}

const SubscribeModal: React.FC<SubscribeModalProps> = ({ products }) => {
  const { user, isLoading, subscription } = useUser();
  const [priceIdLoading, setPriceIdLoading] = useState<string>();

  const handleCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);

    if (!user) {
      setPriceIdLoading(undefined);
      toast.remove();
      return toast.error('You must login first to subscribe a plan');
    }

    if (subscription) {
      setPriceIdLoading(undefined);
      toast.remove();
      return toast.success('Your account is already premium');
    }

    try {
      const { sessionId } = await postData({
        url: '/api/create-checkout-session',
        data: { price }
      });

      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      toast.remove();
      toast.error((error as Error)?.message);
    } finally {
      setPriceIdLoading(undefined);
    }
  }

  let content = (
    <div className='text-neutral-300 text-xl text-center py-8'>
      No products available
    </div>
  );

  if (products.length) {
    content = (
      <div className='py-4 flex items-center justify-center'>
        {products.map((product) => {
          if (!product.prices?.length) {
            return (
              <div key={product.id}>
                No prices available
              </div>
            );
          }
          return product.prices.map((price) => (
            <Button 
              key={price.id}
              onClick={() => handleCheckout(price)}
              disabled={isLoading || price.id === priceIdLoading}
              className='w-[80%]'
            >
              {`Subscribe Melodify Premium for ${formatPrice(price)} / ${price.interval}`}
            </Button>
          ))
        })}
      </div>
    )
  }

  if (subscription) {
    content = (
      <div className='flex justify-center items-center'>
        <p className='text-primaryAccent flex flex-row gap-x-3 items-center text-xl text-center py-8'>
          <FaCircleCheck size={16} />
          Already subscribed 
          <span>✨</span>
        </p>
      </div>
    );
  }


  return (
    <Modal
      title='Only for premium accounts'
      description='Enjoy music unlimited with Melodify Premium'
      isOpen
      large
      onChange={() => {}}
    >
      {content}
    </Modal>
  )
}

export default SubscribeModal;