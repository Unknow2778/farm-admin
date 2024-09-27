'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { GET, POST } from '@/app/api/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react'; // Add this import

export default function Products({ onProductClick }) {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [date, setDate] = useState(new Date());
  const [productPriceObjArray, setProductPriceObjArray] = useState([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false); // Add this line

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await GET(`/markets/products`);
    if (res.status === 200) {
      setProducts(res.data.products);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to fetch products',
        variant: 'destructive',
      });
    }
  };

  const addProductsPrice = async () => {
    if (isLoading) return; // Prevent multiple calls if already loading
    setIsLoading(true); // Set loading state to true
    try {
      const res = await POST(`/markets/addProductPrice`, {
        date: date,
        marketId: slug[0],
        products: productPriceObjArray,
      });
      if (res.status === 201) {
        toast({
          title: 'Success',
          description: 'Product prices added successfully',
          variant: 'success',
        });
      } else {
        throw new Error('Failed to add product prices');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add product prices',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false); // Set loading state back to false
    }
  };

  const handlePriceChange = (productId, price) => {
    setProductPriceObjArray((prevArray) => {
      const existingIndex = prevArray.findIndex(
        (item) => item.productId === productId
      );
      if (existingIndex !== -1) {
        return prevArray.map((item, index) =>
          index === existingIndex ? { ...item, price } : item
        );
      } else {
        return [...prevArray, { productId, price }];
      }
    });
  };

  return (
    <div className='container mx-auto p-4 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Product Prices</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className={cn(
                'w-[240px] justify-start text-left font-normal',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className='mr-2 h-4 w-4' />
              {date ? format(date, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='end'>
            <Calendar
              mode='single'
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {products?.map((product) => (
          <Card key={product._id} className='overflow-hidden'>
            <CardHeader className='p-4'>
              <div className='flex items-center space-x-4'>
                <div className='relative h-16 w-16 rounded-full overflow-hidden'>
                  <Image
                    src={product?.imageURL}
                    alt={product?.name}
                    layout='fill'
                    objectFit='cover'
                  />
                </div>
                <div>
                  <CardTitle className='text-lg capitalize'>
                    {product.name}
                  </CardTitle>
                  <p className='text-sm text-muted-foreground'>
                    Unit: {product.baseUnit}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='flex items-center space-x-2'>
                <Input
                  type='number'
                  placeholder='Enter price'
                  onChange={(e) =>
                    handlePriceChange(product._id, e.target.value)
                  }
                  className='flex-grow'
                />
                <Button
                  variant='outline'
                  onClick={() => onProductClick(product)}
                >
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className='flex justify-center'>
        <Button
          onClick={addProductsPrice}
          className='w-full max-w-md'
          disabled={isLoading} // Disable button when loading
        >
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Adding Prices...
            </>
          ) : (
            'Add Product Prices'
          )}
        </Button>
      </div>
    </div>
  );
}
