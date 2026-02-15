import { ArrowRight } from 'lucide-react';
import Image from "next/image";
import brainImage from "@/assets/images/brain.svg";
export const HeroSection = ()  => {
    return (
        <div  className="w-full px-[179px] py-[150px] flex flex-row items-center justify-between ">
            <div className="w-[60%] flex flex-col justify-center">
               <h1 className="text-[35px] text-[#CC34FF] font-bold">THE INTELLIGENCE LAYER</h1>
                <h1 className='text-[35px] text-[#610081] font-bold'>FOR EVERY DEVICE</h1>
                <p className='mt-[30px]'>
                    FloBrain is the central intelligence layer that powers AI-enabled devices and applications. Build smarter products with workflow orchestration, persistent memory, and real-time AI—all privacy-first.
                </p>
                <button className='py-7 rounded-[16px] bg-black text-white flex flex-row items-center justify-center gap-2 w-full mt-[50px]'>
                    Get started
                    <ArrowRight />
                </button>
            </div>
            <div>
               <Image 
                    src={brainImage} 
                    alt="FloBrain" 
                />
            </div>
        </div>
    )
}