"use client";


import { SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';


interface ClientOnlyProps {
  children: React.ReactNode;
}

const ClientOnly: React.FC<ClientOnlyProps> = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return (
    <>
      <SessionProvider>
        {children}
      </SessionProvider>
    </>
  );
}

export default ClientOnly;