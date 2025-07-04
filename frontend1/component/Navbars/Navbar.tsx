"use client"

import Image from "next/image"
import { LinkButton } from "../buttons/LinkButtons"
import { OrrButton } from "../buttons/OrrButton"
import { useRouter } from "next/navigation";


export function Navbar(){
    
    const router = useRouter();
    function onClickHandler(){
        router.push('/signup')
    }
    return <>
        <div className="flex h-1/10 border-b justify-between items-center pl-10 pr-10">

            <div className="flex items-center
            ">
                <Image src="/images/zapier_logo.png"
                    alt="logo"
                    width={100}                     
                    height={40}
                ></Image>
                
                <LinkButton text="Products"></LinkButton>
                <LinkButton text="Solutions"></LinkButton>
                <LinkButton text="Resources"></LinkButton>
                <LinkButton text="Enterprice"></LinkButton>
                <LinkButton text="Pricing"></LinkButton>
                
                
            </div>

            <div className="flex gap-2 justify-center items-center">

                <LinkButton text="explore apps"></LinkButton>
                <LinkButton text="Contact sales"></LinkButton>
                <LinkButton text="Log in" onClickHandler={() => {router.push('/signin')}}></LinkButton>
                <OrrButton text = "Sign up" onClickhandler={onClickHandler}></OrrButton>
            </div>

        </div>
    </>

}