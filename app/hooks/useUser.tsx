import { useContext, createContext, useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/auth-helpers-nextjs';
import { useSessionContext, useUser as useSupaUser } from '@supabase/auth-helpers-react';

import { Subscription, UserDetails } from '../../types';


type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  subscription: Subscription | null;  
  error: string | null;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);


export interface Props {
  [propName: string]: any;
};


export const MyUserContextProvider = (props: Props) => {
  const {
    session,
    isLoading: isLoadingUser,
    supabaseClient: supabase
  } = useSessionContext();
  const user = useSupaUser();
  const accessToken = session?.access_token ?? null;
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getUserDetails = () => supabase
    .from('users')
    .select('*')
    .single();

  const getSubscription = () => supabase
      .from('subscriptions')
      .select('*, prices(*, products(*))')
      .in('status', ['trialing', 'active'])
      .single();

  useEffect(() => {
    if (user && !isLoadingData && !userDetails && !subscription) {
      setError(null); 
      setIsLoadingData(true);

      Promise.allSettled([getUserDetails(), getSubscription()]).then(
        (results) => {
          const userDetailsPromise = results[0];
          const subscriptionPromise = results[1];

          // Handle user details response
          if (userDetailsPromise.status === 'fulfilled') {
            setUserDetails(userDetailsPromise.value.data as UserDetails);
          } else {
            console.error("Error fetching user details:", userDetailsPromise.reason);
            setError(userDetailsPromise.reason);
          }

          // Handle subscription response
          if (subscriptionPromise.status === 'fulfilled') {
            setSubscription(subscriptionPromise.value.data as Subscription);
          } else {
            console.error("Error fetching subscription:", subscriptionPromise.reason);
            setError(subscriptionPromise.reason);
          }

          setIsLoadingData(false);
        }
      );
    } else if (!user && !isLoadingUser && !isLoadingData) {
      setUserDetails(null);
      setSubscription(null);
    }
  }, [user, isLoadingUser]);

  const value = {
    accessToken,
    user,
    userDetails,
    isLoading: isLoadingUser || isLoadingData,
    subscription,
    error
  };

  return <UserContext.Provider value={value} {...props} />
};


export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a MyUserContextProvider!");
  }

  return context;
};
