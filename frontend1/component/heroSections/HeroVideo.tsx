"use client"
// pages/index.js
import { useState } from "react";



export function HeroVideo(){
    const [activeTab, setActiveTab] = useState("AI Workflows");

    return (
        <div className="flex flex-col  mt-4">
            {/* // toggle buttons */}
            <div className="flex  h-11 justify-center border-y border-gray-500  ">
                {["AI Workflows", "AI Agents", "AiChatbots", "Tables", "Interfaces", "Canvas", "Enterprice", "Function"].map(tab => (
                    <button 
                        key = {tab}
                        onClick={() => setActiveTab(tab)}

                        className={`px-4 ${activeTab === tab ? "border-b-4  border-orange-600 font-semibold text-black " : "text-gray-600 hover:border-b-2 hover:border-gray-700"} `}
                    >{tab}</button>
                ))}
            </div>

            <div className="relative inline-block">
      {/* Image Frame */}
      <img src="./images/frame.jpg" alt="Frame" className="block" />

      {/* Video in Center */}
      {activeTab === "AI Workflows" && <video
        src="./videos/ai_workflow.webm"
        autoPlay
        loop
        muted
        className="absolute top-1/2 left-1/2 px-30 aspect-3/2"
        style={{
        
          transform: 'translate(-50%, -50%)',
          
        }}
      />}

      {activeTab === "AI Agents" && <video
        src="./videos/ai_agents.webm"
        autoPlay
        loop
        muted
        className="absolute top-1/2 left-1/2 px-30 aspect-3/2"
        style={{
        
          transform: 'translate(-50%, -50%)',
        }}
      />}

        {activeTab === "AiChatbots" && <video
        src="./videos/ai_chatbot.webm"
        autoPlay
        loop
        muted
        className="absolute top-1/2 left-1/2 px-30 aspect-3/2"
        style={{
        
          transform: 'translate(-50%, -50%)',
        }}
      />}

        {activeTab === "Tables" && <video
        src="./videos/Tables.webm"
        autoPlay
        loop
        muted
        className="absolute top-1/2 left-1/2 px-30 aspect-3/2"
        style={{
        
          transform: 'translate(-50%, -50%)',
        }}
      />}

        {activeTab === "Interfaces" && <video
        src="./videos/interfaces.webm"
        autoPlay
        loop
        muted
        className="absolute top-1/2 left-1/2 px-30 aspect-3/2"
        style={{
        
          transform: 'translate(-50%, -50%)',
        }}
      />}
        {activeTab === "Canvas" && <video
        src="./videos/canvas.webm"
        autoPlay
        loop
        muted
        className="absolute top-1/2 left-1/2 px-30 aspect-3/2"
        style={{
        
          transform: 'translate(-50%, -50%)',
        }}
      />}

        {activeTab === "Enterprice" && <video
        src="./videos/enterprice.webm"
        autoPlay
        loop
        muted
        className="absolute top-1/2 left-1/2 px-30 aspect-3/2"
        style={{
        
          transform: 'translate(-50%, -50%)',
        }}
      />}

        {activeTab === "Function" && <video
        src="./videos/functions.webm"
        autoPlay
        loop
        muted
        className="absolute top-1/2 left-1/2 px-30 aspect-3/2"
        style={{
        
          transform: 'translate(-50%, -50%)',
        }}
      />}

    </div>
            
        
        </div>
    )
}