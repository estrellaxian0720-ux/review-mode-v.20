import React from 'react';
import 'katex/dist/katex.min.css';

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  // Simple markdown parser (can be enhanced with a library like react-markdown)
  const parseMarkdown = (text: string) => {
    // Replace **bold** with <strong>
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Replace KaTeX inline math $...$ (simplified)
    text = text.replace(/\$(.+?)\$/g, '<span class="katex-inline">$1</span>');
    return text;
  };

  return (
    <div 
      className="text-[#333] dark:text-[#E8E8E8] leading-relaxed"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
}
