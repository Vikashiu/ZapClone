
import { Button } from "flowbite-react";
import axios from "axios";
import { MdLocalSee } from "react-icons/md";
const BACKEND_URL = process.env.NEXT_BACKEND_URL;
export function TopBar({handlePublish} : {
  handlePublish : () => void;
}) {

    return <div className="flex justify-end items-center space-x-2 bg-gray-900 w-full p-1 ">
                <button className="text-sm px-3 py-1 hover:text-gray-500 hover:border-gray-500 text-white rounded border border-white">Undo</button>
                <button onClick={async () => {

                  const res = axios.get(`${BACKEND_URL}/auth`, {
                    headers:{
                      'Authorization': localStorage.getItem('token'),
                    }
                  })

                }} className="text-sm px-3 py-1 hover:text-gray-500 hover:border-gray-500 text-white text-center rounded border border-white">Connect</button>
                <Button onClick={handlePublish} className="mr-5">Publish</Button>
            </div>
}