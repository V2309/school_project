"use client";
import React, { useCallback, useState } from "react";
import ReactFlow, {
	addEdge,
	Background,
	Controls,
	MiniMap,
	useNodesState,
	useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

const initialNodes = [
	{
		id: "1",
		data: { label: "Chủ đề chính" },
		position: { x: 250, y: 5 },
		type: "input",
	},
	{
		id: "2",
		data: { label: "Ý 1" },
		position: { x: 100, y: 100 },
	},
	{
		id: "3",
		data: { label: "Ý 2" },
		position: { x: 400, y: 100 },
	},
];

const initialEdges = [
	{ id: "e1-2", source: "1", target: "2" },
	{ id: "e1-3", source: "1", target: "3" },
];

export default function MindmapPage() {
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
	const [selectedNode, setSelectedNode] = useState(null);
	const [newNodeLabel, setNewNodeLabel] = useState("");

	const onConnect = useCallback(
		(params: any) => setEdges((eds: any) => addEdge(params, eds)),
		[setEdges]
	);

	// Thêm node mới
	const handleAddNode = () => {
		if (!newNodeLabel.trim()) return;
		const newId = (nodes.length + 1).toString();
		setNodes((nds) => [
			...nds,
			{
				id: newId,
				data: { label: newNodeLabel },
				position: { x: Math.random() * 400 + 50, y: Math.random() * 300 + 50 },
			},
		]);
		setNewNodeLabel("");
	};

	// Xóa node
	const handleDeleteNode = () => {
		if (!selectedNode) return;
		setNodes((nds) => nds.filter((n) => n.id !== selectedNode));
		setEdges((eds) => eds.filter((e) => e.source !== selectedNode && e.target !== selectedNode));
		setSelectedNode(null);
	};

	// Đổi tên node
	const handleRenameNode = () => {
		if (!selectedNode || !newNodeLabel.trim()) return;
		setNodes((nds) => nds.map((n) => n.id === selectedNode ? { ...n, data: { label: newNodeLabel } } : n));
		setNewNodeLabel("");
	};

	// Chọn node khi click
	const onNodeClick = (_event: any, node: any) => {
		setSelectedNode(node.id);
		setNewNodeLabel(node.data.label);
	};

	return (
		<div className="h-full bg-gray-100 p-4 md:p-6 lg:p-8 w-full">
			<div className="mb-4 flex gap-2 items-center">
				<input
					type="text"
					placeholder="Tên node mới hoặc đổi tên"
					value={newNodeLabel}
					onChange={(e) => setNewNodeLabel(e.target.value)}
					className="border px-2 py-1 rounded"
				/>
				<button onClick={handleAddNode} className="bg-blue-500 text-white px-3 py-1 rounded">Thêm node</button>
				<button onClick={handleRenameNode} disabled={!selectedNode} className="bg-yellow-500 text-white px-3 py-1 rounded">Đổi tên node</button>
				<button onClick={handleDeleteNode} disabled={!selectedNode} className="bg-red-500 text-white px-3 py-1 rounded">Xóa node</button>
				{selectedNode && <span className="ml-2 text-sm">Đang chọn: {selectedNode}</span>}
			</div>
			<div style={{ width: "100%", height: "70vh" }}>
				<ReactFlow
					nodes={nodes}
					edges={edges}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onConnect={onConnect}
					onNodeClick={onNodeClick}
					fitView
				>
					<MiniMap />
					<Controls />
					<Background color="#aaa" gap={16} />
				</ReactFlow>
			</div>
		</div>
	);
}


