import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { GET, POST, DELETE, PUT } from '@/app/api/api';
import { formatDate } from '@/app/helperfun/formatDate';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { useToast } from '@/hooks/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

function ProductsPrice({ product, onBack }) {
  const [priceHistory, setPriceHistory] = useState([]);
  const { slug } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [price, setPrice] = useState('');
  const [marketProductPriceId, setMarketProductPriceId] = useState(null);
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [priceToDelete, setPriceToDelete] = useState(null);
  const [date, setDate] = useState(null);

  const fetchProductPrice = async () => {
    if (product && slug) {
      try {
        const res = await GET(
          `/markets/allPriceByMarketProduct/${slug[0]}?productId=${product._id}`
        );
        if (res.status === 200) {
          setPriceHistory(res.data.prices);
        } else {
          console.error('Failed to fetch price history');
        }
      } catch (error) {
        console.error('Error fetching price history:', error);
      }
    }
  };

  useEffect(() => {
    fetchProductPrice();
  }, [product, slug]);

  const handlePriceAction = async () => {
    try {
      let res;
      if (marketProductPriceId) {
        // Update existing price
        res = await PUT(
          `/markets/updateMarketProductPrice/${marketProductPriceId}`,
          {
            price: price,
            date: date ? format(date, 'yyyy-MM-dd') : null,
          }
        );
      }

      if (res.status === 200 || res.status === 201) {
        toast({
          title: marketProductPriceId ? 'Price updated' : 'Price added',
          description: marketProductPriceId
            ? 'The price and date have been updated successfully.'
            : 'New price and date have been added to the product.',
        });
        setIsDialogOpen(false);
        setPrice('');
        setDate(null);
        setMarketProductPriceId(null);
        fetchProductPrice();
      } else {
        toast({
          title: 'Error',
          description: marketProductPriceId
            ? 'Failed to update price'
            : 'Failed to add new price',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error handling price action:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while processing your request',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePrice = async (priceId) => {
    if (deleteConfirmation.toLowerCase() !== 'confirm') {
      toast({
        title: 'Delete failed',
        description: 'Please type "confirm" to delete the price.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await DELETE(`/markets/deleteMarketProductPrice/${priceId}`);

      if (res.status === 200) {
        toast({
          title: 'Price deleted',
          description: 'The price has been deleted successfully.',
        });
        setIsDeleteDialogOpen(false);
        setDeleteConfirmation('');
        setPriceToDelete(null);
        fetchProductPrice();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete price',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting price:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while deleting the price',
        variant: 'destructive',
      });
    }
  };

  if (!product) {
    return <div>No product selected</div>;
  }

  return (
    <div className='container p-4'>
      <div className='flex justify-between gap-4'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-2xl font-bold '>{product.name}</h1>
          <p>Base Unit: {product.baseUnit}</p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={onBack} className='mb-4'>
            Back to Products
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setMarketProductPriceId(null);
                  setPrice('');
                  setDate(null);
                }}
              >
                Add Price
              </Button>
            </DialogTrigger>
            <DialogContent className='flex flex-col gap-4'>
              <DialogHeader>
                <DialogTitle>
                  {marketProductPriceId ? 'Update Price' : 'Add New Price'}
                </DialogTitle>
                <DialogDescription>
                  Enter the {marketProductPriceId ? 'new' : ''} price and date
                  for the product.
                </DialogDescription>
              </DialogHeader>
              <Input
                placeholder='Price'
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant='default' onClick={handlePriceAction}>
                  {marketProductPriceId ? 'Update' : 'Add'} Price
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <h2 className='text-xl font-semibold mt-4 mb-2'>Price History</h2>
      {priceHistory?.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {priceHistory.map((price) => (
              <TableRow key={price._id}>
                <TableCell>{formatDate(price.date)}</TableCell>
                <TableCell>₹{price.price}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => {
                      setMarketProductPriceId(price._id);
                      setPrice(price.price.toString());
                      setDate(new Date(price.date));
                      setIsDialogOpen(true);
                    }}
                    className='mr-2'
                  >
                    Update
                  </Button>
                  <Dialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant='destructive'
                        onClick={() => {
                          setPriceToDelete(price._id);
                          setDeleteConfirmation('');
                        }}
                      >
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this price? This
                          action cannot be undone. Please type "confirm" to
                          delete the price.
                        </DialogDescription>
                      </DialogHeader>
                      <Input
                        placeholder='Type "confirm" to delete'
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                      />
                      <DialogFooter>
                        <Button
                          variant='outline'
                          onClick={() => setIsDeleteDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant='destructive'
                          onClick={() => handleDeletePrice(priceToDelete)}
                          disabled={
                            deleteConfirmation.toLowerCase() !== 'confirm'
                          }
                        >
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p>No price history available</p>
      )}
    </div>
  );
}

export default ProductsPrice;
