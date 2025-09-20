
"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import React, { useState } from 'react'
import { toast } from 'sonner'

  
  
  
  const Page = () => {
    const [value,setValue]=useState("")
    const trpc=useTRPC()
    const invocke=useMutation(trpc.invocke.mutationOptions({
      onSuccess:()=>{
        toast.success("Background Jobs Started")
      }
    }))

   

    return (
      <div className='p-4'>
        <Input value={value} onChange={(e)=>setValue(e.target.value)}/>
        <Button disabled={invocke.isPending} onClick={()=>invocke.mutate({value:value})}>
          Background Job
        </Button>

      </div>
  
      

    )
  }
  export default Page