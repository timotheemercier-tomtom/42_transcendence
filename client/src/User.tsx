/**
 * This file defines a React context for user information, allowing user data to be
 * easily accessed and manipulated across the different components of the application.
 *
 *? UserContextType:
 * A TypeScript type definition for the context's value,
 * specifying the shape of the user data and a function to update it.
 *
 *? UserContext:
 * The actual context created with a default value.
 * It holds the user information and provides a way to update it.
 *
 *? UserProvider:
 * A component that wraps its children with UserContext.Provider,
 * making the user context available to any child components in the component tree.
 * It uses React's useState hook to manage the user state.
 *
 *? useUser:
 * A custom hook that simplifies the usage of UserContext in other components.
 * It provides easy access to the user data and the setUser function.
 */


import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Define the type for the context value
type UserContextType = {
  user: any; // Replace 'any' with a more specific type as per your user object
  setUser: React.Dispatch<React.SetStateAction<any>>; // Same here for the specific type
};

// Create context with a default value of type UserContextType
const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserContextType['user']>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

