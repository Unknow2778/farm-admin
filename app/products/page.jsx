'use client';

import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { StoreContext } from '../context/store';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Search, Filter, Edit, Package } from 'lucide-react';
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Add this import
import { Toaster } from '@/components/ui/toaster';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function Products() {
  const { products, setProducts } = useContext(StoreContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [deleteProductName, setDeleteProductName] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [confirmDeleteName, setConfirmDeleteName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const [newProduct, setNewProduct] = useState({
    name: '',
    categoryId: '',
    imageFile: null,
    baseUnit: 'kg',
  });
  const { toast } = useToast();

  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [updateProduct, setUpdateProduct] = useState({
    _id: '',
    name: '',
    categoryId: '',
    baseUnit: '',
    isInDemand: false,
    priority: 0,
  });

  const fetchProducts = useCallback(async () => {
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
  }, [setProducts]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/markets/categories`
      );
      setCategories(res.data.categories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    } else {
      setLoading(false);
    }
    fetchCategories();
  }, [fetchProducts, fetchCategories, products.length]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.categoryId || !newProduct.baseUnit) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

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
        throw new Error('Failed to add product');
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
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error.response?.data?.error ||
          'Failed to delete product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteProductId(null);
      setDeleteProductName('');
      setConfirmDeleteName('');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (
      !updateProduct.name ||
      !updateProduct.categoryId ||
      !updateProduct.baseUnit
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/markets/updateProduct/${updateProduct._id}`,
        updateProduct
      );

      if (res.status === 200) {
        toast({
          title: 'Product updated successfully',
          description: 'The product has been updated.',
        });
        setIsUpdateOpen(false);
        fetchProducts();
      } else {
        throw new Error('Failed to update product');
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'An error occurred while updating the product',
        variant: 'destructive',
      });
    }
  };

  const handleDialogChange = useCallback((open) => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    setIsAddOpen(open);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === 'all' || product.categoryId === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, filterCategory]);

  if (loading) {
    return (
      <div className='container p-4'>
        <div className='flex justify-between  items-center mb-6'>
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
    return <div className='text-center text-destructive p-4'>{error}</div>;
  }

  return (
    <div className='container p-6 space-y-8'>
      <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
        <h1 className='text-3xl font-bold tracking-tight'>Products</h1>
        <div className='flex items-center gap-4 flex-col lg:flex-row'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
            <Input
              placeholder='Search products...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10 pr-4 w-[200px] sm:w-[300px]'
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Filter by category' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              <form onSubmit={handleAddProduct} className='space-y-6'>
                <div className='grid gap-2'>
                  <Label htmlFor='category'>Category</Label>
                  <Select
                    value={newProduct.categoryId}
                    onValueChange={(value) =>
                      setNewProduct({ ...newProduct, categoryId: value })
                    }
                  >
                    <SelectTrigger id='category'>
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
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='name'>Product Name</Label>
                  <Input
                    id='name'
                    placeholder='Product Name'
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='baseUnit'>Base Unit</Label>
                  <Select
                    value={newProduct.baseUnit}
                    onValueChange={(value) =>
                      setNewProduct({ ...newProduct, baseUnit: value })
                    }
                  >
                    <SelectTrigger id='baseUnit'>
                      <SelectValue placeholder='Select a Unit' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='kg'>Kilogram</SelectItem>
                      <SelectItem value='piece'>Piece</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='isInDemand'>Is In Demand</Label>
                  <Select
                    value={newProduct.isInDemand || 'false'}
                    onValueChange={(value) =>
                      setNewProduct({ ...newProduct, isInDemand: value })
                    }
                  >
                    <SelectTrigger id='isInDemand'>
                      <SelectValue placeholder='Is In Demand' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='true'>True</SelectItem>
                      <SelectItem value='false'>False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='priority'>Priority</Label>
                  <Input
                    id='priority'
                    type='number'
                    value={newProduct.priority}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, priority: e.target.value })
                    }
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='image'>Product Image</Label>
                  <Input
                    id='image'
                    type='file'
                    accept='image/*'
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        imageFile: e.target.files[0],
                      })
                    }
                  />
                </div>
                <DialogFooter>
                  <Button type='submit'>Add Product</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Separator />
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {filteredProducts.map((product) => (
          <Card
            key={product._id}
            className='overflow-hidden transition-shadow hover:shadow-lg'
          >
            <div className='relative h-20'>
              <Image
                src={product?.imageURL || '/placeholder.svg'}
                alt={product?.name}
                layout='fill'
                objectFit='contain'
                className='transition-transform hover:scale-105'
              />
              {product.isInDemand && (
                <Badge className='absolute top-2 right-2 bg-yellow-500'>
                  In Demand
                </Badge>
              )}
            </div>
            <CardHeader>
              <CardTitle className='text-lg font-semibold truncate'>
                {product.name}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='flex items-center text-sm text-muted-foreground'>
                <Package className='mr-2 h-4 w-4' />
                Base Unit: {product.baseUnit}
              </div>
              <div className='flex items-center text-sm text-muted-foreground'>
                <Badge variant='outline' className='mr-2'>
                  Priority: {product.priority}
                </Badge>
              </div>
              <div className='flex justify-between mt-4'>
                <Dialog
                  open={isUpdateOpen}
                  onOpenChange={(open) => {
                    setIsUpdateOpen(open);
                    document.body.style.overflow = open ? 'hidden' : '';
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setUpdateProduct(product)}
                    >
                      <Edit className='mr-2 h-4 w-4' /> Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-[425px]'>
                    <DialogHeader>
                      <DialogTitle>Update Product</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={handleUpdateProduct}
                      className='grid gap-4 py-4'
                    >
                      <div className='grid gap-2'>
                        <Label htmlFor='updateCategory'>Category</Label>
                        <Select
                          value={updateProduct.categoryId}
                          onValueChange={(value) =>
                            setUpdateProduct({
                              ...updateProduct,
                              categoryId: value,
                            })
                          }
                        >
                          <SelectTrigger id='updateCategory'>
                            <SelectValue placeholder='Select a category' />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem
                                key={category._id}
                                value={category._id}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='grid gap-2'>
                        <Label htmlFor='updateName'>Product Name</Label>
                        <Input
                          id='updateName'
                          value={updateProduct.name}
                          onChange={(e) =>
                            setUpdateProduct({
                              ...updateProduct,
                              name: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className='grid gap-2'>
                        <Label htmlFor='updateBaseUnit'>Base Unit</Label>
                        <Select
                          value={updateProduct.baseUnit}
                          onValueChange={(value) =>
                            setUpdateProduct({
                              ...updateProduct,
                              baseUnit: value,
                            })
                          }
                        >
                          <SelectTrigger id='updateBaseUnit'>
                            <SelectValue placeholder='Select a Unit' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='kg'>Kilogram</SelectItem>
                            <SelectItem value='piece'>Piece</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='grid gap-2'>
                        <Label htmlFor='updateIsInDemand'>Is In Demand</Label>
                        <Select
                          value={updateProduct.isInDemand.toString()}
                          onValueChange={(value) =>
                            setUpdateProduct({
                              ...updateProduct,
                              isInDemand: value === 'true',
                            })
                          }
                        >
                          <SelectTrigger id='updateIsInDemand'>
                            <SelectValue placeholder='Is In Demand' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='true'>True</SelectItem>
                            <SelectItem value='false'>False</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='grid gap-2'>
                        <Label htmlFor='updatePriority'>Priority</Label>
                        <Input
                          id='updatePriority'
                          type='number'
                          value={updateProduct.priority}
                          onChange={(e) =>
                            setUpdateProduct({
                              ...updateProduct,
                              priority: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <DialogFooter>
                        <Button type='submit'>Update Product</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                <Dialog
                  open={isDeleteOpen}
                  onOpenChange={(open) => {
                    setIsDeleteOpen(open);
                    if (!open) {
                      setConfirmDeleteName('');
                    }
                    document.body.style.overflow = open ? 'hidden' : '';
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteProductId(product._id);
                        setDeleteProductName(product.name);
                      }}
                    >
                      <Trash2 className='mr-2 h-4 w-4' /> Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Deletion</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete the product "
                        {deleteProductName}"? This action cannot be undone.
                        Please type the product name to confirm.
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Toaster />
    </div>
  );
}
