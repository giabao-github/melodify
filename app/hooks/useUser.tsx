import React, { useContext, createContext, useEffect, useState, useCallback } from 'react';
import { Subscription, UserDetails } from '../../types';
import { User } from '@supabase/auth-helpers-nextjs';
import { useSessionContext, useUser as useSupaUser } from '@supabase/auth-helpers-react';


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

  const getUserDetails = useCallback(async (): Promise<{ data: UserDetails | null; error: string | null }> => {
    if (!user) {
      return { data: null, error: 'User not logged in' };
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .single();

    if (error) {
      setError(typeof error === 'string' ? error : error.message || 'Unknown error');
      return { data: null, error: typeof error === 'string' ? error : error.message || 'Unknown error' };
    }

    return { data: data.length > 0 ? (data[0] as UserDetails) : null, error: null };
  }, [supabase, user]);


  const getSubscription = useCallback(async (): Promise<{ data: Subscription | null; error: string | null }> => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, prices(*, products(*))')
      .in('status', ['trialing', 'active'])
      .single();

    if (error) {
      setError(typeof error === 'string' ? error : error.message || 'Unknown error');
      return { data: null, error: typeof error === 'string' ? error : error.message || 'Unknown error' };
    }

    return { data: data.length > 0 ? (data[0] as Subscription) : null, error: null };
  }, [supabase]);


  useEffect(() => {
    let isMounted = true;
    if (user && !isLoadingData && !userDetails && !subscription) {
      setError(null); 
      setIsLoadingData(true);

      Promise.allSettled([getUserDetails(), getSubscription()]).then(
        (results) => {
          if (!isMounted) {
            return;
          }

          const userDetailsPromise = results[0];
          const subscriptionPromise = results[1];

          // Handle user details response
          if (userDetailsPromise.status === 'fulfilled') {
            setUserDetails(userDetailsPromise.value.data as UserDetails);
          } else {
            // console.error("Error fetching user details:", userDetailsPromise.reason);
            setError(userDetailsPromise.reason);
          }

          // Handle subscription response
          if (subscriptionPromise.status === 'fulfilled') {
            setSubscription(subscriptionPromise.value.data as Subscription);
          } else {
            // console.error("Error fetching subscription:", subscriptionPromise.reason);
            setError(subscriptionPromise.reason);
          }

          setIsLoadingData(false);
        }
      );
    } else if (!user && !isLoadingUser && !isLoadingData) {
      setUserDetails(null);
      setSubscription(null);
    }

    return () => {
      isMounted = false;
    };
  }, [user, isLoadingUser, isLoadingData, userDetails, subscription, getUserDetails, getSubscription]);

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
