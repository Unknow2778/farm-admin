'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Trash2, MapPin, Calendar } from 'lucide-react';
import OverviewSkeleton from './OverviewSkeleton';

export default function Overview({ markets, loading, fetchData }) {
  const router = useRouter();
  const { toast } = useToast();
  const [newMarketName, setNewMarketName] = useState('');
  const [newMarketLocation, setNewMarketLocation] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteMarketId, setDeleteMarketId] = useState(null);
  const [deleteMarketName, setDeleteMarketName] = useState('');
  const [deleteMarketLocation, setDeleteMarketLocation] = useState('');
  const [confirmDeleteLocation, setConfirmDeleteLocation] = useState('');

  const handleAddMarket = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/markets/addMarket`,
        {
          name: newMarketName,
          place: newMarketLocation,
        }
      );

      if (res.status === 201) {
        toast({
          title: 'Market added successfully!',
          description: 'Your market has been added to the list.',
        });
        setNewMarketName('');
        setNewMarketLocation('');
        setIsAddOpen(false);
        fetchData();
      } else {
        throw new Error('Failed to add market');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error.response?.data?.error ||
          'Failed to add market. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMarket = async () => {
    if (confirmDeleteLocation !== deleteMarketLocation) {
      toast({
        title: 'Delete failed',
        description: 'The location you entered does not match.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/markets/deleteMarket/${deleteMarketId}`
      );
      if (res.status === 200) {
        toast({
          title: 'Market deleted successfully!',
          description: 'The market has been removed from the list.',
        });
        setIsDeleteOpen(false);
        fetchData();
      } else {
        throw new Error('Failed to delete market');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error.response?.data?.error ||
          'Failed to delete market. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteMarketId(null);
      setDeleteMarketName('');
      setDeleteMarketLocation('');
      setConfirmDeleteLocation('');
    }
  };

  if (loading) {
    return <OverviewSkeleton />;
  }

  return (
    <div className='container mx-auto p-4 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold text-primary'>RMC Locations</h1>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' /> Add Market
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>Add New Market</DialogTitle>
              <DialogDescription>
                Enter the details of the new market location.
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid gap-2'>
                <Input
                  id='name'
                  placeholder='Market Name'
                  value={newMarketName}
                  onChange={(e) => setNewMarketName(e.target.value)}
                  autoComplete='off'
                />
                <Input
                  id='location'
                  placeholder='Location'
                  value={newMarketLocation}
                  onChange={(e) => setNewMarketLocation(e.target.value)}
                  autoComplete='off'
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddMarket}>Add Market</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {markets?.map((rmc) => (
          <Card
            key={rmc._id}
            className='w-full hover:shadow-lg transition-shadow duration-300 ease-in-out'
          >
            <CardHeader className='flex flex-row justify-between items-center'>
              <CardTitle className='text-xl font-semibold'>
                {rmc.name}
              </CardTitle>
              <Dialog
                open={isDeleteOpen}
                onOpenChange={(open) => {
                  setIsDeleteOpen(open);
                  if (!open) {
                    setConfirmDeleteLocation('');
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteMarketId(rmc._id);
                      setDeleteMarketName(rmc.name);
                      setDeleteMarketLocation(rmc.place);
                    }}
                  >
                    <Trash2 className='h-4 w-4 text-destructive' />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete the market "
                      {deleteMarketName}" in {deleteMarketLocation}? This action
                      cannot be undone. Please type the location to confirm.
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    placeholder='Enter location to confirm'
                    value={confirmDeleteLocation}
                    onChange={(e) => setConfirmDeleteLocation(e.target.value)}
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
                      onClick={handleDeleteMarket}
                      disabled={confirmDeleteLocation !== deleteMarketLocation}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent
              onClick={() => router.push(`/market/${rmc._id}`)}
              className='cursor-pointer space-y-2'
            >
              <div className='flex items-center text-muted-foreground'>
                <MapPin className='mr-2 h-4 w-4' />
                <p className='text-sm'>{rmc.place}</p>
              </div>
              <div className='flex items-center text-muted-foreground'>
                <Calendar className='mr-2 h-4 w-4' />
                <p className='text-sm'>
                  Created: {new Date(rmc.createdAt).toLocaleDateString()}
                </p>
              </div>
              <p className='text-sm text-muted-foreground'>ID: {rmc._id}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
