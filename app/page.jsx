'use client';

import React, { useContext, useEffect, useState } from 'react';
import MarketOverview from '@/components/MarketOverview';
import axios from 'axios';
import { StoreContext } from './context/store';

export default function Home() {
  const { market, setMarket } = useContext(StoreContext);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/markets/allMarkets`
      );
      console.log(res.data);
      setMarket(res.data.markets);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (market.length === 0) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className=''>
      <MarketOverview
        markets={market}
        loading={loading}
        fetchData={fetchData}
      />
    </div>
  );
}
