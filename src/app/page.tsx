
"use client"

import { Button } from '@/components/ui/button'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import React from 'react'
import { toast } from 'sonner'

  
  
  
  const Page = () => {
    const trpc=useTRPC()
    const invocke=useMutation(trpc.invocke.mutationOptions({
      onSuccess:()=>{
        toast.success("Background Jobs Started")
      }
    }))

   

    return (
      <div className='p-4'>
        <Button disabled={invocke.isPending} onClick={()=>invocke.mutate({text:"TTTTTTTT"})}>
          Background Job
        </Button>

      </div>
  
      

    )
  }
  export default Page