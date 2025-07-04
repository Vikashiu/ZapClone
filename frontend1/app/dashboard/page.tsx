"use client"

import { DarkButton } from "@/component/buttons/DarkButton";
import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL, HOOKS_URL } from "../config";
import { LinkButton } from "@/component/buttons/LinkButtons";
import { useRouter } from "next/navigation";

type Zap = {
  id: string;
  TriggerId: string;
  userId: number;
  actions: {
    id: string;
    zapId: string;
    ActionId: string;
    metadata: Record<string, any>;
    type: {
      id: string;
      name: string;
      image: string;
    };
  }[];
  trigger: {
    id: string;
    zapId: string;
    TriggerId: string;
    metadata: Record<string, any>;
    type: {
      id: string;
      name: string;
      image: string;
    };
  };
};

type GetAllZapResponse = {
  zaps: Zap[];
};

// interface Zap {
//     "id": string,
//     "triggerId": string,
//     "userId": number,
//     "actions": {
//         "id": string,
//         "zapId": string,
//         "actionId": string,
//         "sortingOrder": number,
//         "type": {
//             "id": string,
//             "name": string
//             "image": string
//         }
//     }[],
//     "trigger": {
//         "id": string,
//         "zapId": string,
//         "triggerId": string,
//         "type": {
//             "id": string,
//             "name": string,
//             "image": string
//         }
//     }
// }

function useZaps() {
    const [loading, setLoading] = useState(true);
    const [zaps, setZaps] = useState<Zap[]>([]);

    useEffect(() => {
        axios.get<GetAllZapResponse>(`${BACKEND_URL}/api/v1/zap/allzap`, {
            headers: {
                "authorization": localStorage.getItem("token")
            }
        })
            .then(res => {
                setZaps(res.data.zaps);
                setLoading(false)
            })
    }, []);

    return {
        loading, zaps
    }
}

export default function() {
    const { loading, zaps } = useZaps();
    const router = useRouter();
    
    return <div className="">


        <div className="flex justify-center pt-8">
            <div className="max-w-screen-lg	 w-full">
                <div className="flex justify-between pr-8 ">
                    <div className="text-2xl font-bold">
                        My Zaps
                    </div>
                    <DarkButton onClick={() => {
                        router.push("/editor");
                    }}>Create</DarkButton>
                </div>
            </div>
        </div>
        {loading ? "Loading..." : <div className="flex justify-center"> <ZapTable zaps={zaps} /> </div>}
    </div>
}

function ZapTable({ zaps }: {zaps: Zap[]}) {
    const router = useRouter();

    return <div className="p-8 max-w-screen-lg w-full">
        <div className="flex">
                <div className="flex-1">Name</div>
                <div className="flex-1">ID</div>
                <div className="flex-1">Created at</div>
                <div className="flex-1">Webhook URL</div>
                <div className="flex-1">Go</div>
        </div>
        {zaps.map(z => 
        
        <div className="flex border-b border-t py-4">
            <div className="flex-1 flex"><img src={z.trigger.type.image} className="w-[30px] h-[30px]" /> {z.actions.map(x => <img src={x.type.image} className="w-[30px] h-[30px]" />)}</div>
            <div className="flex-1">{z.id}</div>
            <div className="flex-1">Nov 13, 2023</div>
            <div className="flex-1">{`${HOOKS_URL}/hooks/catch/1/${z.id}`}</div>
            <div className="flex-1"><LinkButton text="Go" onClickHandler={() => {
                    router.push("/zap/" + z.id)
                }}></LinkButton></div>
        </div>)}
    </div>
}
// export  function Dashboard() {
//   return (
//     <div className="min-h-screen bg-gray-50">
        
//       <Topbar />
//       <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="md:col-span-2 space-y-4">
//           <h2 className="text-xl font-bold">Recent Zaps</h2>
          
          

//         </div>
//       </div>
//     </div>
//   );
// }
