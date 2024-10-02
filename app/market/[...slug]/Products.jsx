'use client';

import React, { useEffect, useState, useRef } from 'react';
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
import { CalendarIcon, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function Products({ onProductClick }) {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [date, setDate] = useState(new Date());
  const [productPriceObjArray, setProductPriceObjArray] = useState([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false); // Add this line
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const fileInputRef = useRef(null);

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

  const handlePriceChange = (productId, price) => {
    // Convert price to a number and check if it's non-negative
    const numericPrice = Number(price);
    if (numericPrice < 0 || isNaN(numericPrice)) {
      toast({
        title: 'Invalid Price',
        description: 'Price must be a non-negative number.',
        variant: 'destructive',
      });
      return;
    }

    setProductPriceObjArray((prevArray) => {
      const existingIndex = prevArray.findIndex(
        (item) => item.productId === productId
      );
      if (existingIndex !== -1) {
        if (price === '') {
          // Remove the product if price is empty
          return prevArray.filter((item) => item.productId !== productId);
        }
        return prevArray.map((item, index) =>
          index === existingIndex ? { ...item, price: numericPrice } : item
        );
      } else {
        if (price !== '') {
          // Only add the product if price is not empty
          return [...prevArray, { productId, price: numericPrice }];
        }
        return prevArray;
      }
    });
  };

  // Add this new function to get the current price for a product
  const getCurrentPrice = (productId) => {
    const priceObj = productPriceObjArray.find(
      (item) => item.productId === productId
    );
    return priceObj ? priceObj.price : '';
  };

  const handleAddProductsPrice = () => {
    // Filter out products with no price
    const productsWithPrice = productPriceObjArray.filter(
      (product) =>
        product.price !== '' &&
        product.price !== null &&
        product.price !== undefined
    );

    if (productsWithPrice.length === 0) {
      toast({
        title: 'No prices entered',
        description: 'Please enter at least one product price before adding.',
        variant: 'destructive',
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmAddProductsPrice = async () => {
    setShowConfirmDialog(false);
    if (isLoading) return;
    setIsLoading(true);
    try {
      const productsWithPrice = productPriceObjArray.filter(
        (product) =>
          product.price !== '' &&
          product.price !== null &&
          product.price !== undefined
      );

      const res = await POST(`/markets/addProductPrice`, {
        date: date,
        marketId: slug[0],
        products: productsWithPrice,
      });
      if (res.status === 201) {
        toast({
          title: 'Success',
          description: 'Product prices added successfully',
          variant: 'success',
        });
        // Clear the productPriceObjArray after successful addition
        setProductPriceObjArray([]);
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
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        processCSV(content);
      };
      reader.readAsText(file);
    }
  };

  const processCSV = (content) => {
    const rows = content.split('\n');
    const headers = rows[0].split(',');
    const commodityIndex = headers.findIndex(
      (h) => h.trim().toLowerCase() === 'commodity'
    );
    const priceIndex = headers.findIndex(
      (h) => h.trim().toLowerCase() === 'price'
    );

    if (commodityIndex === -1 || priceIndex === -1) {
      toast({
        title: 'Invalid CSV format',
        description:
          'The CSV file must contain "Commodity" and "Price" columns.',
        variant: 'destructive',
      });
      return;
    }

    const newPrices = rows.slice(1).reduce((acc, row) => {
      const columns = row.split(',');
      const commodity = columns[commodityIndex].trim().toLowerCase();
      const price = parseFloat(columns[priceIndex]);

      if (commodity && !isNaN(price) && price > 0) {
        const matchingProducts = products.filter(
          (p) =>
            commodity.includes(p.name.toLowerCase()) ||
            p.name.toLowerCase().includes(commodity)
        );

        if (matchingProducts.length > 0) {
          matchingProducts.forEach((product) => {
            acc.push({ productId: product._id, price });
          });
        } else {
          console.log(`No match found for commodity: ${commodity}`);
        }
      }
      return acc;
    }, []);

    setProductPriceObjArray(newPrices);
    toast({
      title: 'CSV Processed',
      description: `${newPrices.length} product prices loaded from CSV.`,
      variant: 'success',
    });
  };

  console.log(productPriceObjArray);

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
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            onClick={() => fileInputRef.current.click()}
          >
            <Upload className='mr-2 h-4 w-4' />
            Upload CSV
          </Button>
          <input
            type='file'
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept='.csv'
            className='hidden'
          />
        </div>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {products
          ?.sort((a, b) => b.priority - a.priority)
          .map((product) => (
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
                    value={getCurrentPrice(product._id)}
                    onChange={(e) =>
                      handlePriceChange(product._id, e.target.value)
                    }
                    className='flex-grow'
                    min='1' // Add this line to prevent negative input
                    step='1' // Add this line for decimal precision
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
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogTrigger asChild>
            <Button
              onClick={handleAddProductsPrice}
              className='w-full max-w-md'
              disabled={isLoading}
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
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Price Update</DialogTitle>
              <DialogDescription>
                Are you sure you want to add these product prices? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={confirmAddProductsPrice}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
