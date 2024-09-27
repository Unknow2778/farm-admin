'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
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
import { useProducts } from '@/hooks/useProducts'; // Create this custom hook

export default function Products() {
  const { products, loading, error, fetchProducts } = useProducts();
  const [categories, setCategories] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [newProduct, setNewProduct] = useState({
    name: '',
    categoryId: '',
    imageFile: null,
    baseUnit: 'kg',
    isInDemand: false,
    priority: 0,
  });
  const [deleteDialogState, setDeleteDialogState] = useState({
    isOpen: false,
    productId: null,
    productName: '',
  });
  const [confirmDeleteName, setConfirmDeleteName] = useState('');

  const { toast } = useToast();

  // Fetch categories only once when component mounts
  useEffect(() => {
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
    fetchCategories();
  }, []);

  const handleDialogChange = useCallback(
    (dialogSetter) => (open) => {
      document.body.style.overflow = open ? 'hidden' : '';
      dialogSetter(open);
    },
    []
  );

  const handleAddDialogChange = useCallback(handleDialogChange(setIsAddOpen), [
    handleDialogChange,
  ]);
  const handleDeleteDialogChange = useCallback(
    (open, productId = null, productName = '') => {
      setDeleteDialogState({ isOpen: open, productId, productName });
      document.body.style.overflow = open ? 'hidden' : '';
    },
    []
  );

  const handleAddProduct = useCallback(
    async (e) => {
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
        formData.append('isInDemand', newProduct.isInDemand);
        formData.append('priority', newProduct.priority);
        if (newProduct.imageFile) {
          formData.append('image', newProduct.imageFile);
        }

        console.log(formData);

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
            isInDemand: false,
            priority: 0,
          });
          handleAddDialogChange(false);
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
    },
    [newProduct, toast, fetchProducts, handleAddDialogChange]
  );

  const handleUpdateProduct = useCallback(
    async (updatedProduct) => {
      if (
        !updatedProduct.name ||
        !updatedProduct.categoryId ||
        !updatedProduct.baseUnit
      ) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields.',
          variant: 'destructive',
        });
        return;
      }

      try {
        const formData = new FormData();
        formData.append('name', updatedProduct.name);
        formData.append('categoryId', updatedProduct.categoryId);
        formData.append('baseUnit', updatedProduct.baseUnit);
        formData.append('isInDemand', updatedProduct.isInDemand);
        formData.append('priority', updatedProduct.priority);

        console.log(updatedProduct);
        // Add this check for the image file
        if (updatedProduct.imageFile) {
          formData.append('image', updatedProduct.imageFile);
        }

        const res = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/markets/updateProduct/${updatedProduct._id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (res.status === 200) {
          toast({
            title: 'Product updated successfully',
            description: 'The product has been updated.',
          });
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
    },
    [toast, fetchProducts]
  );

  const handleDeleteProduct = useCallback(async () => {
    if (confirmDeleteName !== deleteDialogState.productName) {
      toast({
        title: 'Delete failed',
        description: 'The product name you entered does not match.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/markets/deleteProduct/${deleteDialogState.productId}`
      );
      if (res.status === 200) {
        toast({
          title: 'Product deleted successfully!',
          description: 'The product has been removed from the list.',
        });
        handleDeleteDialogChange(false);
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
      setConfirmDeleteName('');
    }
  }, [deleteDialogState, confirmDeleteName, toast, fetchProducts]);

  const filteredProducts = useMemo(() => {
    return products
      .sort((a, b) => b.priority - a.priority)
      .filter((product) => {
        const matchesSearch = product.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesCategory =
          filterCategory === 'all' || product.categoryId === filterCategory;
        const matchesPriority =
          filterPriority === 'all' ||
          product.priority.toString() === filterPriority;
        return matchesSearch && matchesCategory && matchesPriority;
      });
  }, [products, searchTerm, filterCategory, filterPriority]);

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
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Filter by priority' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Priorities</SelectItem>
              <SelectItem value='0'>0</SelectItem>
              <SelectItem value='1'>1</SelectItem>
              <SelectItem value='2'>2</SelectItem>
              <SelectItem value='3'>3</SelectItem>
              <SelectItem value='4'>4</SelectItem>
              <SelectItem value='5'>5</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isAddOpen} onOpenChange={handleAddDialogChange}>
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
                    value={newProduct.isInDemand.toString()}
                    onValueChange={(value) =>
                      setNewProduct({
                        ...newProduct,
                        isInDemand: value === 'true',
                      })
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
                      setNewProduct({
                        ...newProduct,
                        priority: parseInt(e.target.value),
                      })
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
          <ProductCard
            key={product._id}
            product={product}
            categories={categories}
            handleDeleteDialogChange={handleDeleteDialogChange}
            handleUpdateProduct={handleUpdateProduct}
          />
        ))}
      </div>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogState.isOpen}
        onOpenChange={(open) => handleDeleteDialogChange(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the product "
              {deleteDialogState.productName}"? This action cannot be undone.
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
              onClick={() => handleDeleteDialogChange(false)}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteProduct}
              disabled={confirmDeleteName !== deleteDialogState.productName}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}

// Separate component for product card to reduce re-renders
const ProductCard = React.memo(function ProductCard({
  product,
  categories,
  handleDeleteDialogChange,
  handleUpdateProduct,
}) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [localUpdateProduct, setLocalUpdateProduct] = useState({
    ...product,
    categoryId: Array.isArray(product.categoryId)
      ? product.categoryId[0]
      : product.categoryId,
  });

  const openUpdateDialog = useCallback(() => {
    setLocalUpdateProduct({
      ...product,
      categoryId: Array.isArray(product.categoryId)
        ? product.categoryId[0]
        : product.categoryId,
    });
    setIsUpdateOpen(true);
  }, [product]);

  const handleLocalUpdate = (e) => {
    e.preventDefault();
    handleUpdateProduct(localUpdateProduct);
    setIsUpdateOpen(false);
  };

  useEffect(() => {
    if (isUpdateOpen) {
      setLocalUpdateProduct({
        ...product,
        categoryId: Array.isArray(product.categoryId)
          ? product.categoryId[0]
          : product.categoryId,
      });
    }
  }, [isUpdateOpen, product]);

  return (
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
              if (!open) {
                setLocalUpdateProduct(product);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button variant='outline' size='sm' onClick={openUpdateDialog}>
                <Edit className='mr-2 h-4 w-4' /> Edit
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Update Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleLocalUpdate} className='grid gap-4 py-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='updateCategory'>Category</Label>
                  <Select
                    value={localUpdateProduct.categoryId}
                    onValueChange={(value) =>
                      setLocalUpdateProduct({
                        ...localUpdateProduct,
                        categoryId: value,
                      })
                    }
                  >
                    <SelectTrigger id='updateCategory'>
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
                  <Label htmlFor='updateName'>Product Name</Label>
                  <Input
                    id='updateName'
                    value={localUpdateProduct.name}
                    onChange={(e) =>
                      setLocalUpdateProduct({
                        ...localUpdateProduct,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='updateBaseUnit'>Base Unit</Label>
                  <Select
                    value={localUpdateProduct.baseUnit}
                    onValueChange={(value) =>
                      setLocalUpdateProduct({
                        ...localUpdateProduct,
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
                    value={localUpdateProduct.isInDemand.toString()}
                    onValueChange={(value) =>
                      setLocalUpdateProduct({
                        ...localUpdateProduct,
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
                    value={localUpdateProduct.priority}
                    onChange={(e) =>
                      setLocalUpdateProduct({
                        ...localUpdateProduct,
                        priority: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='updateImage'>Product Image</Label>
                  <Input
                    id='updateImage'
                    type='file'
                    accept='image/*'
                    onChange={(e) =>
                      setLocalUpdateProduct({
                        ...localUpdateProduct,
                        imageFile: e.target.files[0],
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
          <Button
            variant='destructive'
            size='sm'
            onClick={() =>
              handleDeleteDialogChange(true, product._id, product.name)
            }
          >
            <Trash2 className='mr-2 h-4 w-4' /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
