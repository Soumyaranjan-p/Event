"use client";


import React from 'react'
 import Image from "next/image";
 import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { BarLoader } from "react-spinners";
import { Authenticated, Unauthenticated } from "convex/react";
import { Button } from './ui/button';
const Header = () => {
  return (
<>
           <nav  className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-xl z-20 border-b">
  
      


              <div  className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
     {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/spott.png"
              alt="Spott logo"
              width={500}
              height={500}
              className="w-full h-11"
              priority
            />
                 </Link>


   
 <div className='flex items-center'>


               <Authenticated>
              <UserButton />

             </Authenticated>

         <Unauthenticated>
              <SignInButton mode='modal'>

                <Button  size="sm">
                    Sign In
                </Button>
              </SignInButton>
                
                 </Unauthenticated>


 </div>

   
         </div>
                  <div className="absolute bottom-0 left-0 w-full">
            <BarLoader width={"100%"} color="#a855f7" />
          </div>
   </nav>
</>
  )
}

export default Header
