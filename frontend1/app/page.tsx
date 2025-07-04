import Image from "next/image";
import { Navbar } from "@/component/Navbars/Navbar";
import { HeroLanding } from "@/component/heroSections/HeroSection";
import { HeroVideo } from "@/component/heroSections/HeroVideo";
export default function Home() {
  return (
    <div className="h-screen">

      <Navbar></Navbar>
      <div className="mx-30 border-x">
        <HeroLanding></HeroLanding>
        <div className="flex justify-center items-center pt-10">
          
          YOUR COMPLETE TOOLKIT FOR AI AUTOMATION</div>

        <HeroVideo></HeroVideo>
      </div>
      

    </div>
  );
}
