"use client";

import React from "react";
import { MyUserContextProvider } from "../app/hooks/useUser";

interface UserProviderProps {
  children: React.ReactNode;
};

const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  return (
    <MyUserContextProvider>
      {children}
    </MyUserContextProvider>
  );
};

export default UserProvider;