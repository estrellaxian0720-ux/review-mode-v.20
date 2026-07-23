import React from 'react';
import { DiagramBlock as DiagramBlockType, CompareData, TreeData, FlowData, TreeNode } from '../../types/tutoring';

interface DiagramBlockProps {
  diagram: DiagramBlockType;
}

function CompareTable({ data }: { data: CompareData }) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        <div className="text-center font-medium text-[#333] dark:text-[#E8E8E8] mb-3 text-sm">
          {data.title}
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-[#EFEFEF] dark:border-[#3A3A3A] bg-gray-50 dark:bg-[#333] p-2 text-sm font-medium text-[#666] dark:text-[#999]">
                {/* Empty corner */}
              </th>
              {data.columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className="border border-[#EFEFEF] dark:border-[#3A3A3A] bg-gray-50 dark:bg-[#333] p-2 text-sm font-medium text-[#333] dark:text-[#E8E8E8]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td className="border border-[#EFEFEF] dark:border-[#3A3A3A] bg-gray-50 dark:bg-[#333] p-2 text-sm font-medium text-[#666] dark:text-[#999]">
                  {row.label}
                </td>
                {row.cells.map((cell, cellIdx) => (
                  <td 
                    key={cellIdx} 
                    className="border border-[#EFEFEF] dark:border-[#3A3A3A] p-2 text-sm text-[#333] dark:text-[#E8E8E8]"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TreeDiagram({ data }: { data: TreeData }) {
  const renderNode = (node: TreeNode, level: number = 0) => (
    <div key={node.label} className="ml-4">
      <div className={`flex items-center gap-2 py-1.5 ${level === 0 ? 'font-medium' : ''}`}>
        <div className={`w-2 h-2 rounded-full ${level === 0 ? 'bg-[#2D8CFF]' : 'bg-[#999]'}`} />
        <span className="text-sm text-[#333] dark:text-[#E8E8E8]">{node.label}</span>
      </div>
      {node.children && (
        <div className="ml-4 border-l-2 border-[#EFEFEF] dark:border-[#3A3A3A] pl-2">
          {node.children.map(child => renderNode(child, level + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-2">
      <div className="text-center font-medium text-[#333] dark:text-[#E8E8E8] mb-3 text-sm">
        {data.title}
      </div>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-[#1a2332] dark:to-[#1f2937] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full bg-[#2D8CFF]" />
          <span className="font-medium text-[#333] dark:text-[#E8E8E8]">{data.root}</span>
        </div>
        <div className="ml-4 border-l-2 border-[#EFEFEF] dark:border-[#3A3A3A] pl-2">
          {data.children.map(child => renderNode(child, 0))}
        </div>
      </div>
    </div>
  );
}

function FlowDiagram({ data }: { data: FlowData }) {
  return (
    <div className="space-y-2">
      <div className="text-center font-medium text-[#333] dark:text-[#E8E8E8] mb-3 text-sm">
        {data.title}
      </div>
      <div className="flex flex-col gap-3">
        {data.steps.map((step, idx) => (
          <div key={step.id}>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#2D8CFF] text-white flex items-center justify-center text-sm font-medium">
                {idx + 1}
              </div>
              <div className="flex-1 bg-white dark:bg-[#2A2A2A] border border-[#EFEFEF] dark:border-[#3A3A3A] rounded-lg p-3 text-sm text-[#333] dark:text-[#E8E8E8]">
                {step.text}
              </div>
            </div>
            {idx < data.steps.length - 1 && (
              <div className="ml-4 w-0.5 h-6 bg-[#EFEFEF] dark:bg-[#3A3A3A]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DiagramBlock({ diagram }: DiagramBlockProps) {
  return (
    <div className="bg-white dark:bg-[#2A2A2A] border border-[#EFEFEF] dark:border-[#3A3A3A] rounded-xl p-4">
      {diagram.kind === 'compare' && <CompareTable data={diagram.data as CompareData} />}
      {diagram.kind === 'tree' && <TreeDiagram data={diagram.data as TreeData} />}
      {diagram.kind === 'flow' && <FlowDiagram data={diagram.data as FlowData} />}
    </div>
  );
}
