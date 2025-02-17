'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaCheck, FaCircleCheck, FaDownload, FaMicrophone, FaMusic, FaRobot } from 'react-icons/fa6';

import { Price, ProductWithPrice } from '../../types';
import Modal from './Modal';
import { useUser } from '../hooks/useUser';
import { postData } from '../libs/helpers';
import { getStripe } from '../libs/stripeClient';
import useSubscribeModal from '../hooks/useSubscribeModal';

interface SubscribeModalProps {
  products: ProductWithPrice[];
}

const plans = [
  {
    name: 'Melodify Premium',
    price: '$10',
    period: '/ month',
    badge: 'Most Popular',
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    features: [
      { text: 'Download songs', icon: <FaDownload /> },
      { text: 'Access song lyrics', icon: <FaMicrophone /> },
      { text: 'Ad-free listening', icon: <FaMusic /> },
    ],
  },
  {
    name: 'Melodify Ultra',
    price: '$20',
    period: '/ month',
    badge: 'Best Value',
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
    features: [
      { text: 'All Premium features', icon: <FaCheck /> },
      { text: 'AI music generator', icon: <FaRobot /> },
      { text: 'Early access to new features', icon: <FaMusic /> },
    ],
  },
];

const SubscribeModal: React.FC<SubscribeModalProps> = ({ products }) => {
  const subscribeModal = useSubscribeModal();
  const { user, subscription } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [priceIdLoading, setPriceIdLoading] = useState<string | null>(null);

  const onChange = (open: boolean) => {
    if (!open) {
      subscribeModal.onClose();
    }
  };

  const handleCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);

    if (!user) {
      setPriceIdLoading(null);
      toast.remove();
      toast.error('You must log in first to subscribe to a plan');
      return;
    }

    if (subscription) {
      setPriceIdLoading(null);
      toast.remove();
      toast.success('Your account is already subscribed');
      return;
    }

    try {
      const { sessionId } = await postData({
        url: '/api/create-checkout-session',
        data: { price },
      });

      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      toast.error((error as Error)?.message);
    } finally {
      setPriceIdLoading(null);
    }
  };

  const formatPrice = (price: Price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency,
      minimumFractionDigits: 0,
    }).format((price.unit_amount || 0) / 100);
  };

  let content = (
    <div className='p-4'>
      <div className='grid md:grid-cols-2 gap-6'>
        {plans.map((plan, index) => {
          const correspondingProduct = products[index];
          const price = correspondingProduct?.prices?.[0];

          if (!price) {
            return null;
          }

          const isSelected = selectedPlan === index;

          return (
            <div
              onClick={() => setSelectedPlan(index)}
              key={index}
              className={`relative cursor-pointer p-6 rounded-xl border ${
                isSelected ? 'ring-2 ring-button border-button' : 'border-gray-400'
              } transition-transform hover:shadow-lg`}
            >
              {plan.badge && (
                <span
                  className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${plan.color} text-white px-4 py-1 rounded-full text-sm font-semibold`}
                >
                  {plan.badge}
                </span>
              )}

              <div className='text-center mt-4 mb-8'>
                <h3 className='text-2xl font-bold mb-2'>{plan.name}</h3>
                <div className='flex items-center justify-center'>
                  <span className='text-4xl font-bold'>{formatPrice(price)}&nbsp;</span>
                  <span className='text-gray-500'>{plan.period}</span>
                </div>
              </div>

              <div className='space-y-6 px-10 my-2'>
                {plan.features.map((feature, idx) => (
                  <div key={idx} className='flex items-center space-x-3'>
                    <span className='text-green-500'>{feature.icon}</span>
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheckout(price);
                }}
                className={`w-full mt-6 ${plan.color} ${plan.hoverColor} text-white py-3 rounded-lg font-semibold transition-colors focus:outline-none disabled:opacity-50`}
                disabled={priceIdLoading === price.id}
              >
                {priceIdLoading === price.id
                  ? 'Processing...'
                  : `Choose Plan`}
              </button>
            </div>
          );
        })}
      </div>
      <p className='text-center text-gray-400 mt-8'>
        All plans include a 30-day money-back guarantee
      </p>
    </div>
  );

  if (subscription) {
    content = (
      <div className='flex justify-center items-center'>
        <p className='text-primaryAccent flex flex-row gap-x-3 items-center text-xl text-center py-8'>
          <FaCircleCheck size={16} />
          Already subscribed <span>✨</span>
        </p>
      </div>
    );
  }

  return (
    <Modal
      title='Choose a plan'
      description='Enjoy unlimited music with Melodify Premium and Melodify Ultra'
      large
      isOpen={subscribeModal.isOpen}
      onChange={onChange}
      titleSize='text-4xl'
    >
      {content}
    </Modal>
  );
};

export default SubscribeModal;
