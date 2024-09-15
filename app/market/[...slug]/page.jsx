'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { GET } from '@/app/api/api';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import { POST } from '@/app/api/api';
import { useToast } from '@/hooks/use-toast';

function MarketPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [openDialogs, setOpenDialogs] = useState({});
  const [prices, setPrices] = useState({});
  const { toast } = useToast();

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

  const handleOpenChange = (id, isOpen) => {
    setOpenDialogs((prev) => ({ ...prev, [id]: isOpen }));
  };

  const handlePriceChange = (id, price) => {
    setPrices((prev) => ({ ...prev, [id]: price }));
  };

  const handleAddProduct = async (productId) => {
    const res = await POST(`/markets/addProductPrice`, {
      productId: productId,
      marketId: slug[0],
      price: prices[productId],
    });

    if (res.status === 201) {
      handleOpenChange(productId, false);
      setPrices((prev) => ({ ...prev, [productId]: '' }));
      toast({
        title: 'Product added',
        description: 'Product added to the market',
      });
      fetchProducts(); // Refresh the products list
    } else {
      toast({
        title: 'Error',
        description: 'Error adding product',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='container p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
      {products?.map((product) => (
        <Card
          key={product._id}
          className='overflow-hidden relative p-4 cursor-pointer'
        >
          <CardHeader className='flex flex-row justify-between items-start p-2'>
            <div className='relative h-16 w-full justify-center'>
              <Image
                src={product?.imageURL}
                alt={product?.name}
                layout='fill'
                objectFit='contain'
              />
            </div>
            <div className='flex flex-col gap-2 justify-between items-start w-full capitalize'>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>Unit In {product.baseUnit}</CardDescription>
            </div>
          </CardHeader>
          <Dialog
            open={openDialogs[product._id]}
            onOpenChange={(open) => handleOpenChange(product._id, open)}
          >
            <DialogTrigger asChild>
              <Button className='w-full max-w-xs'>Update</Button>
            </DialogTrigger>
            <DialogContent className='flex flex-col gap-4'>
              <DialogHeader>
                <DialogTitle>Update Product</DialogTitle>
                <DialogDescription>
                  Enter the new price for the product.
                </DialogDescription>
              </DialogHeader>
              <Input
                placeholder='Price'
                value={prices[product._id] || ''}
                onChange={(e) => handlePriceChange(product._id, e.target.value)}
              />
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => handleOpenChange(product._id, false)}
                >
                  Cancel
                </Button>
                <Button
                  variant='default'
                  onClick={() => handleAddProduct(product._id)}
                >
                  Update
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Card>
      ))}
    </div>
  );
}

export default MarketPage;
