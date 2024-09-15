'use client';

import { createContext, useState } from 'react';

export const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [market, setMarket] = useState([]);
  const [products, setProducts] = useState([]);

  return (
    <StoreContext.Provider value={{ market, setMarket, products, setProducts }}>
      {children}
    </StoreContext.Provider>
  );
};
