import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient, trpc } from '@/trpc/server';
import { Suspense } from 'react';
import Client from './client';
export default async function Home() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.hello.queryOptions({
    text:"CCPP"
    }),
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <Client/>
      </Suspense>
     
    </HydrationBoundary>
  );
}