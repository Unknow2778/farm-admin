'use client';

import React, { useContext, useEffect, useState, useCallback } from 'react';
import { StoreContext } from '../context/store';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function Products() {
  const { products, setProducts } = useContext(StoreContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [deleteProductName, setDeleteProductName] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [confirmDeleteName, setConfirmDeleteName] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '',
    categoryId: '',
    imageFile: null,
    baseUnit: 'kg',
  });
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/markets/products`
      );
      setProducts(res.data.products);
    } catch (err) {
      setError('Failed to fetch products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/markets/categories`
      );
      setCategories(res.data.categories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    } else {
      setLoading(false);
    }
    fetchCategories();
  }, [setProducts]);

  const handleAddProduct = async () => {
    try {
      const formData = new FormData();
      formData.append('categoryId', newProduct.categoryId);
      formData.append('name', newProduct.name);
      formData.append('baseUnit', newProduct.baseUnit);
      if (newProduct.imageFile) {
        formData.append('image', newProduct.imageFile);
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/markets/addProduct`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (res.status === 201) {
        toast({
          title: 'Product added successfully',
          description: 'The new product has been added to the list.',
        });
        setNewProduct({
          name: '',
          categoryId: '',
          imageFile: null,
          baseUnit: 'kg',
        });
        setIsAddOpen(false);
        fetchProducts();
      } else {
        toast({
          title: 'Failed to add product',
          description: 'Please try again',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'An error occurred while adding the product',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (confirmDeleteName !== deleteProductName) {
      toast({
        title: 'Delete failed',
        description: 'The product name you entered does not match.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/markets/deleteProduct/${deleteProductId}`
      );
      if (res.status === 200) {
        toast({
          title: 'Product deleted successfully!',
          description: 'The product has been removed from the list.',
        });
        setIsDeleteOpen(false);
        fetchProducts();
      } else {
        toast({
          title: 'Failed to delete product.',
          description: 'Please try again.',
        });
      }
    } catch (error) {
      toast({
        title: `Error: ${error.response?.data?.error || 'Unknown error'}`,
        description: `Please try again.`,
      });
    } finally {
      setDeleteProductId(null);
      setDeleteProductName('');
      setConfirmDeleteName('');
    }
  };

  const handleDialogChange = useCallback((open) => {
    if (open) {
      // Prevent scrolling when the dialog is open
      document.body.style.overflow = 'hidden';
    } else {
      // Allow scrolling when the dialog is closed
      document.body.style.overflow = 'unset';
    }
    setIsAddOpen(open);
  }, []);

  if (loading) {
    return (
      <div className='container p-4'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl font-bold'>Products</h1>
          <Button disabled>
            <Plus className='mr-2 h-4 w-4' /> Add Product
          </Button>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {[...Array(8)].map((_, index) => (
            <Card key={index} className='w-full'>
              <Skeleton className='h-48 w-full' />
              <CardHeader>
                <Skeleton className='h-6 w-3/4' />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className='text-center text-red-500 p-4'>{error}</div>;
  }

  return (
    <div className='container p-4'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Products</h1>
        <Dialog open={isAddOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <Select
                onValueChange={(value) =>
                  setNewProduct({ ...newProduct, categoryId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select a category' />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder='Product Name'
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />
              <Select
                onValueChange={(value) =>
                  setNewProduct({ ...newProduct, baseUnit: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select a Unit' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='kg'>Kilogram</SelectItem>
                  <SelectItem value='piece'>Piece</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type='file'
                accept='image/*'
                onChange={(e) =>
                  setNewProduct({ ...newProduct, imageFile: e.target.files[0] })
                }
              />
            </div>
            <DialogFooter>
              <Button onClick={handleAddProduct}>Add Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {products?.map((product) => (
          <Card key={product._id} className='w-full overflow-hidden relative'>
            <CardHeader className='flex flex-row justify-between items-start'>
              <div className='relative h-16 w-full justify-center'>
                <Image
                  src={product?.imageURL}
                  alt={product?.name}
                  layout='fill'
                  objectFit='contain'
                />
              </div>
              <div className='flex flex-col justify-start gap-2 items-start w-full'>
                <CardTitle>{product.name}</CardTitle>
                <div className='text-sm text-muted-foreground'>
                  Base Unit: {product.baseUnit}
                </div>
              </div>
            </CardHeader>
            <Dialog
              open={isDeleteOpen}
              onOpenChange={(open) => {
                setIsDeleteOpen(open);
                if (!open) {
                  setConfirmDeleteName('');
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  className='m-2'
                  variant='destructive'
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteProductId(product._id);
                    setDeleteProductName(product.name);
                  }}
                >
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete the product "
                    {deleteProductName}"? This action cannot be undone. Please
                    type the product name to confirm.
                  </DialogDescription>
                </DialogHeader>
                <Input
                  placeholder='Enter product name to confirm'
                  value={confirmDeleteName}
                  onChange={(e) => setConfirmDeleteName(e.target.value)}
                />
                <DialogFooter>
                  <Button
                    variant='outline'
                    onClick={() => setIsDeleteOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant='destructive'
                    onClick={handleDeleteProduct}
                    disabled={confirmDeleteName !== deleteProductName}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Products;
