import { AiFillHome as HomeIcon } from "react-icons/ai";
import { MdApps } from 'react-icons/md';

export function TopBar() {

    return <div className="flex  w-screen bg-gray-900 text-white">
        <div className="flex justfiy-center items-center p-3.5">
            <button>
                <HomeIcon size={24}/>
            </button>
        </div>
       {/* Top Bar */}
        <div className="flex w-full  items-center justify-between px-6 py-3 shadow-sm ">

            <button>
                <MdApps size={24} />
            </button>

          {/* Breadcrumb + Zap name */}
          <div className="flex items-center space-x-2 text-sm">

            

            <span className="">Vikash Sinha</span>
            <span className="text-gray-400">/</span>
            <span className="font-medium">Untitled Zap</span>
            <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Draft</span>
          </div>

            {/* Buttons */}
          <div className="flex items-center space-x-2">
            <button className="text-sm px-3 py-1 hover:bg-gray-100 rounded border">Undo</button>
            <button className="text-sm px-3 py-1 hover:bg-gray-100 rounded border">Test run</button>
            <button className="text-sm px-3 py-1 bg-blue-600 text-white rounded">Publish</button>
          </div>


        </div>
    </div>
}