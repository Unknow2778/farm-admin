import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import OverviewSkeleton from './OverviewSkeleton';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

export default function Overview({ markets, loading, fetchData }) {
  const router = useRouter();
  const [newMarketName, setNewMarketName] = useState('');
  const [newMarketLocation, setNewMarketLocation] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteMarketId, setDeleteMarketId] = useState(null);
  const [deleteMarketName, setDeleteMarketName] = useState('');
  const [deleteMarketLocation, setDeleteMarketLocation] = useState('');
  const [confirmDeleteLocation, setConfirmDeleteLocation] = useState('');
  const { toast } = useToast();

  const handleAddMarket = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/markets/addMarket`,
        {
          name: newMarketName,
          place: newMarketLocation,
        }
      );

      if (res.status == 201) {
        toast({
          title: 'Market added successfully!',
          description: 'Your market has been added to the list.',
        });
        setNewMarketName('');
        setNewMarketLocation('');
        setIsAddOpen(false);
        fetchData();
        // Optionally, you can refresh the markets list here
        // For example: refetchMarkets();
      } else {
        toast({
          title: 'Failed to add market.',
          description: 'Please try again.',
        });
      }
    } catch (error) {
      toast({
        title: `Error: ${error.response?.data?.error || 'Unknown error'}`,
        description: `Please try again.`,
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
      console.log(res);
      if (res.status === 200) {
        toast({
          title: 'Market deleted successfully!',
          description: 'The market has been removed from the list.',
        });
        setIsDeleteOpen(false);
        fetchData();
      } else {
        toast({
          title: 'Failed to delete market.',
          description: 'Please try again.',
        });
      }
    } catch (error) {
      toast({
        title: `Error: ${error.response?.data?.error || 'Unknown error'}`,
        description: `Please try again.`,
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
    <div className='container p-4'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-purple-500'>RMC Locations</h1>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' /> Add Market
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>Add New Market</DialogTitle>
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
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {markets?.map((rmc) => (
          <Card
            key={rmc._id}
            className='w-full hover:shadow-lg transition-shadow'
          >
            <CardHeader className='flex flex-row justify-between items-center'>
              <CardTitle className='text-lg'>
                {rmc.name} - {rmc.place}
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
                    <Trash2 className='h-4 w-4' />
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
              className='cursor-pointer'
            >
              <p className='text-sm text-muted-foreground'>ID: {rmc._id}</p>
              <p className='text-sm text-muted-foreground'>
                Created: {new Date(rmc.createdAt).toLocaleDateString()}
              </p>
              <p className='text-sm text-muted-foreground'>
                Updated: {new Date(rmc.updatedAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
