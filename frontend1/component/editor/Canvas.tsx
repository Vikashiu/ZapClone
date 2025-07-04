"use client";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "flowbite-react";
import { PrimaryButton } from "../buttons/PrimaryButton";
import { BACKEND_URL } from "@/app/config";
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  Edge,

  Node,
  MiniMap,
  useEdgesState,
  useNodesState,
  MarkerType,
  Connection,
  FinalConnectionState,
  getIncomers,
  getOutgoers,
  getConnectedEdges,

} from "@xyflow/react";
import '@xyflow/react/dist/style.css';

import { useReactFlow } from "@xyflow/react";
import axios from "axios";


const nodeOrigin: [number, number] = [0.5, 0];


const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    data: { label: "1. Trigger Node", metadata:{} },
    position: { x: 250, y: 50 },
    deletable: false,
  },

];

const initialEdges: Edge[] = [

];

type Trigger = {
  id: string;
  name: string;
  image: string;
  metadata?:any
};

type Action = {
  id: string;
  name: string;
  image: string;
  metadata?:any
};

type TriggerResponse = {
  availableTriggers: Trigger[];
};

type ActionResponse = {
  availableActions: Action[];
};

function useAvailableActionsAndTriggers() {
  const [availableActions, setAvailableActions] = useState<Action[]>([]);
  const [availableTriggers, setAvailableTriggers] = useState<Trigger[]>([]);

  useEffect(() => {
    axios
      .get<TriggerResponse>(`${BACKEND_URL}/api/v1/trigger/available`)
      .then((x) => setAvailableTriggers(x.data.availableTriggers));

    axios
      .get<ActionResponse>(`${BACKEND_URL}/api/v1/action/available`)
      .then((x) => setAvailableActions(x.data.availableActions));

    console.log(availableActions)
  }, []);

  return {
    availableActions,
    availableTriggers,
  };
}



export function Canvas() {
  const reactFlowWrapper = useRef(null);

  const { availableActions, availableTriggers } = useAvailableActionsAndTriggers();
  const { getNode } = useReactFlow();
 

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition } = useReactFlow();

  const [openModal, setOpenModal] = useState(false);
  const [openSecondModal, setSecondModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);


  const [nodeId, setNodeId] = useState("");

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onConnectEnd = useCallback(
    (
      event: MouseEvent | TouchEvent,
      connectionState: FinalConnectionState) => {
      // when a connection is dropped on the pane it's not valid
      if (!connectionState.isValid) {
        // we need to remove the wrapper bounds, in order to get the correct position
        // const id = getId();

        const { clientX, clientY } =
          'changedTouches' in event ? event.changedTouches[0] : event;

        const sourceId = (connectionState.fromNode != null) ? connectionState.fromNode.id : "2";
        const targetId = parseInt(sourceId) + 1;
        const edgeId = `e${sourceId}-${targetId.toString()}`;


        // setNodes((nds) => nds.concat(newNode));
        setNodes((nds) => {
          const updatedNodes = nds.map((node) => ({
            ...node,
            connectable: false,
          }));
          const newNode = {
            id: targetId.toString(),
            position: screenToFlowPosition({
              x: clientX - 90,
              y: clientY,
            }),
            data: { label: `${targetId}. Action` },
            nodeOrigin: nodeOrigin,
            connectable: true

          };
          return [...updatedNodes, newNode]

        })



        setEdges((eds) =>
          eds.concat({
            id: edgeId,
            source: sourceId,
            target: targetId.toString(),
            type: 'straight',

          }),
        );
      }
    },
    [screenToFlowPosition, setEdges, setNodes],
  );

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      const idsToDelete = new Set<string>();
      const updatedNodesMap = new Map<string, Node>();

      // Helper: recursively collect all outgoer node ids
      const collectOutgoerChain = (node: Node) => {
        if (idsToDelete.has(node.id)) return;

        idsToDelete.add(node.id);

        const outgoers = getOutgoers(node, nodes, edges);
        outgoers.forEach(collectOutgoerChain);
      };

      // Start from every deleted node
      deleted.forEach((node) => {
        // collect full downstream chain
        collectOutgoerChain(node);

        // Update incomers of the initially deleted node
        const incomers = getIncomers(node, nodes, edges);
        incomers.forEach((inNode) => {
          updatedNodesMap.set(inNode.id, {
            ...inNode,
            connectable: true,
          });
        });
      });

      // Delete nodes
      setNodes((prevNodes) => {
        const kept = prevNodes.filter((n) => !idsToDelete.has(n.id));
        const updated = Array.from(updatedNodesMap.values());

        const filteredKept = kept.filter(
          (n) => !updatedNodesMap.has(n.id)
        );

        return [...filteredKept, ...updated];
      });

      // Delete all connected edges
      setEdges((prevEdges) =>
        prevEdges.filter(
          (e) =>
            !idsToDelete.has(e.source) &&
            !idsToDelete.has(e.target)
        )
      );
    },
    [nodes, edges, setNodes, setEdges]
  );

  function onNodeClick(event: React.MouseEvent, node: Node) {
    setOpenModal(true);
    setNodeId(node.id);
    console.log(node);
    // setSelectedModalIndex(1);
  }

  const updateNodeMetadata = (metadata: any) => {
  setNodes((prevNodes) =>
    prevNodes.map((node) =>
      node.id === nodeId
        ? {
            ...node,
            data: {
              ...node.data,
              metadata,
            },
          }
        : node
      )
    );
    setSecondModal(false);
  };

  const handlePublish = async () => {
    const triggerNode = nodes.find((n) => n.id === "1");

  if (!triggerNode || !triggerNode.data?.label) {
    alert("Trigger not selected.");
    return;
  }

  // Extracting 'webhook' from '1. webhook'
  const availableTriggerId = (triggerNode.data.label as string).split('. ')[1];
  
    const actions = nodes
  .filter(n => n.id !== triggerNode.id)
  .map(n => {
    const availableActionId = (n.data.label as string)?.split(". ")[1] || "";

    return {
      availableActionId,
      sortingOrder: parseInt(n.id) - 1,
      actionMetadata: n.data.metadata || {},
    };
  });

    try {
      await axios.post(`${BACKEND_URL}/api/v1/zap/create`, {
        availableTriggerId: availableTriggerId,
        actions,
      },
      {
        headers: {
          Authorization: localStorage.getItem("token") || "", // no Bearer prefix
        },
      }

    );

      alert("Zap Created!");
    } catch (err) {
      alert("Failed to publish zap.");
    }
  };




  return (
    <div className="bg-gray-100" style={{ width: "100%", height: '100vh' }}>
      <Button onClick={handlePublish}>Publish</Button>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        onNodesDelete={onNodesDelete}
        onNodeClick={onNodeClick}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background color="black" bgColor="" gap={10} />
      </ReactFlow>

      <Modal show={openModal} onClose={() => setOpenModal(false)}>
              
        <div className="bg-white p-5 rounded-2xl flex flex-col gap-5">
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold">Select</h2>
            <Button color="gray" onClick={() => setOpenModal(false)}>Close</Button>
          </div>

          <div>
            {(nodeId == "1") ? <div className="flex flex-col gap-3 m-2">
                {availableTriggers.map((trigger) => (
                  <div onClick={() => {
                    const node = getNode(nodeId);
                    if(node != null) node.data.label =`${node.id}. ${trigger.name}`
                    setOpenModal(false)
                  }} className="flex gap-5 cursor-pointer h-5">
                    <img className="w-5 h-5 object-contain"  src={`${trigger.image}`} alt="" />
                    <span>{trigger.name}</span>
                  </div>
                )
                
                )}

            </div>  :   <div className="flex flex-col gap-3 m-2">

                {availableActions.map((action)=>(
                  <div onClick={() => {
                    const node = getNode(nodeId);
                    if(node != null) node.data.label =`${node.id}. ${action.name}`
                    
                    setOpenModal(false)
                    setSelectedAction(action);      
                    setSecondModal(true);           

                  }} className="flex gap-5 cursor-pointer h-5">

                    <img className="w-5 h-5 object-contain" src={`${action.image}`} alt="" />
                    <span>{action.name}</span>

                  </div>
                ))}


            </div>
            }
          </div>
        </div>
        
      </Modal>  


      <Modal show={openSecondModal} onClose={() => setSecondModal(false)}>
        <div className="bg-white p-5 rounded-2xl flex flex-col gap-5">
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">Configure: {selectedAction?.name}</h2>
            <Button color="gray" onClick={() => setSecondModal(false)}>Close</Button>
          </div>

          {/* You can add inputs here for configuration */}
          <div>
            {selectedAction?.name === "email" && <EmailSelector setMetadata={updateNodeMetadata} />}
            {selectedAction?.name === "Solana" && <SolanaSelector setMetadata={updateNodeMetadata} />}
          </div>
        </div>
      </Modal>
        
    </div>
  );
}

const Input = ({label, placeholder, onChange, type = "text"}: {
    label: string;
    placeholder: string;
    onChange: (e: any) => void;
    type?: "text" | "password"
}) => {
    return <div>
        <div className="text-sm pb-1 pt-2">
            * <label>{label}</label>
        </div>
        <input className="border rounded px-4 py-2 w-full border-black" type={type} placeholder={placeholder} onChange={onChange} />
    </div>
}

function EmailSelector({setMetadata}: {
    setMetadata: (params: any) => void;
}) {
    const [email, setEmail] = useState("");
    const [body, setBody] = useState("");

    return <div>
        <Input label={"To"} type={"text"} placeholder="To" onChange={(e) => setEmail(e.target.value)}></Input>
        <Input label={"Body"} type={"text"} placeholder="Body" onChange={(e) => setBody(e.target.value)}></Input>
        <div className="pt-2">
            <PrimaryButton onClick={() => {
                setMetadata({
                    email,
                    body
                })
            }}>Submit</PrimaryButton>
        </div>
    </div>
}

function SolanaSelector({setMetadata}: {
    setMetadata: (params: any) => void;
}) {
    const [amount, setAmount] = useState("");
    const [address, setAddress] = useState("");    

    return <div>
        <Input label={"To"} type={"text"} placeholder="To" onChange={(e) => setAddress(e.target.value)}></Input>
        <Input label={"Amount"} type={"text"} placeholder="To" onChange={(e) => setAmount(e.target.value)}></Input>
        <div className="pt-4">
        <PrimaryButton onClick={() => {
            setMetadata({
                amount,
                address
            })
        }}>Submit</PrimaryButton>
        </div>
    </div>
}

