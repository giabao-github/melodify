import { useContext, createContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User } from '@supabase/auth-helpers-nextjs';
import { useSessionContext, useSupabaseClient, useUser as useSupaUser } from '@supabase/auth-helpers-react';

import { Subscription, UserDetails } from '../../types';


type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  theme: string;
  index: number;
  setThemeGlobally: (value: string) => void;
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
  const supabaseClient = useSupabaseClient();
  const accessToken = session?.access_token ?? null;
  const [theme, setTheme] = useState('');
  const [themeIndex, setThemeIndex] = useState(0);
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

  const themes = useMemo(() => [
    'Melodify Default',
    'Golden Hour',
    'Sunset Serenade',
    'Radiant Sunrise',
    'Electric Forest',
    'Icy Breeze',
    'Snowman',
    'Neon Dreams',
    'Forest Breeze',
    'Skyline Glow',
    'Neon Noir',
    'Ocean Waves',
    'Moonlit Jazz',
    'Cosmic Chill',
    'Crimson Wave'
  ], []);

  useEffect(() => {
    const applyTheme = async () => {
      const { data } = await supabaseClient
        .from('users')
        .select('theme')
        .eq('id', user?.id)
      if (data) {
        setTheme(data[0].theme);
        setThemeIndex(themes.findIndex(colorTheme => colorTheme === theme) || 0);
      }
    }
    applyTheme();
  }, [supabaseClient, theme, themes, user?.id]);

  const setThemeGlobally = useCallback(async (themeName: string) => {
    setTheme(themeName);
    const index = themes.findIndex((colorTheme) => colorTheme === themeName);
    setThemeIndex(index);

    await supabaseClient
      .from('users')
      .update({ theme: themeName })
      .eq('id', user?.id);
  }, [supabaseClient, themes, user?.id]);

  const value = {
    accessToken,
    user,
    theme,
    index: themeIndex,
    setThemeGlobally,
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
