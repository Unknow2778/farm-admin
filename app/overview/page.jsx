'use client';

import React, { useState, useEffect } from 'react';
import { GET } from '../api/api';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const OverviewPage = () => {
  const [market, setMarket] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await GET(`/markets/allMarketProducts`);
        setMarket(res.data.marketProducts);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const formatDate = (date) => {
    const formattedDate = new Date(date).toLocaleString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return formattedDate;
  };

  console.log(market);

  return (
    <div className='container px-2 '>
      <div className='flex flex-col gap-4'>
        {market.map((item) => (
          <div className='border rounded-md px-4 py-2'>
            <div className='flex flex-col gap-4 px-2'>
              <h1 className='text-2xl font-bold text-yellow-300'>
                {item.market.place}
              </h1>
            </div>
            <Table className=''>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>baseUnit</TableHead>
                  <TableHead>createdAt</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {item.products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.product.name}</TableCell>
                    <TableCell>{product.product.baseUnit}</TableCell>
                    <TableCell>
                      {formatDate(product.product.createdAt)}
                    </TableCell>
                    <TableCell>₹{product.currentPrice}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverviewPage;
