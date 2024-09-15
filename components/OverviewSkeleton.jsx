import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function OverviewSkeleton() {
  return (
    <div className='container p-4'>
      <div className='h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse'></div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {[...Array(6)].map((_, index) => (
          <Card key={index} className='w-full'>
            <CardHeader>
              <div className='h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <div className='h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
                <div className='h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
                <div className='h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
