import { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Type,
  Minus,
  Circle,
  Square,
  Edit3,
  Highlighter,
  Eraser,
  Undo,
  Redo,
  MoreVertical,
  ChevronDown
} from 'lucide-react';
import { Note } from './AllNotesView';

interface NoteEditorProps {
  note: Note;
  folderName: string;
  onBack: () => void;
  onContentChange: (content: string) => void;
}

type Tool = 'pen' | 'highlighter' | 'eraser' | 'text' | 'line' | 'circle' | 'rectangle';
type ColorOption = { name: string; value: string; };

const PEN_COLORS: ColorOption[] = [
  { name: 'Black', value: '#1F2937' },
  { name: 'Blue', value: '#2D8CFF' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Orange', value: '#F97316' },
];

const HIGHLIGHTER_COLORS: ColorOption[] = [
  { name: 'Yellow', value: '#FEF08A' },
  { name: 'Pink', value: '#FBCFE8' },
  { name: 'Blue', value: '#BFDBFE' },
  { name: 'Green', value: '#BBF7D0' },
  { name: 'Purple', value: '#DDD6FE' },
  { name: 'Orange', value: '#FED7AA' },
];

const STROKE_WIDTHS = [
  { label: 'Thin', value: 2 },
  { label: 'Medium', value: 4 },
  { label: 'Thick', value: 6 },
];

export function NoteEditor({ note, folderName, onBack, onContentChange }: NoteEditorProps) {
  const [activeTool, setActiveTool] = useState<Tool>('text');
  const [penColor, setPenColor] = useState(PEN_COLORS[0].value);
  const [highlighterColor, setHighlighterColor] = useState(HIGHLIGHTER_COLORS[0].value);
  const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTHS[1].value);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showStrokePicker, setShowStrokePicker] = useState(false);
  const [textContent, setTextContent] = useState(note.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTextContent(note.content);
  }, [note.id, note.content]);

  const handleTextChange = (value: string) => {
    setTextContent(value);
    onContentChange(value);
  };

  const currentColor = activeTool === 'highlighter' ? highlighterColor : penColor;
  const colorOptions = activeTool === 'highlighter' ? HIGHLIGHTER_COLORS : PEN_COLORS;

  const toolButtons: { icon: React.ReactNode; tool: Tool; label: string }[] = [
    { icon: <Edit3 className="w-5 h-5" />, tool: 'pen', label: 'Pen' },
    { icon: <Highlighter className="w-5 h-5" />, tool: 'highlighter', label: 'Highlighter' },
    { icon: <Eraser className="w-5 h-5" />, tool: 'eraser', label: 'Eraser' },
    { icon: <Type className="w-5 h-5" />, tool: 'text', label: 'Text' },
    { icon: <Minus className="w-5 h-5" />, tool: 'line', label: 'Line' },
    { icon: <Circle className="w-5 h-5" />, tool: 'circle', label: 'Circle' },
    { icon: <Square className="w-5 h-5" />, tool: 'rectangle', label: 'Rectangle' },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Top Navigation Bar */}
      <div className="h-[60px] border-b-2 border-gray-200 px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div className="h-6 w-px bg-gray-200" />
          <div>
            <p className="text-[11px] text-[#9CA3AF] font-semibold uppercase tracking-wide">
              {folderName}
            </p>
            <h1 className="text-[16px] font-bold text-[#111827]">
              {note.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tool Header */}
      <div className="h-[56px] border-b-2 border-gray-200 px-6 flex items-center justify-between flex-shrink-0 bg-[#FAFAFA]">
        <div className="flex items-center gap-1">
          {toolButtons.map(({ icon, tool, label }) => (
            <button
              key={tool}
              onClick={() => setActiveTool(tool)}
              className={`p-2.5 rounded-lg transition-all ${
                activeTool === tool
                  ? 'bg-yellow-400 text-[#111827] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#111827] hover:bg-gray-100'
              }`}
              title={label}
            >
              {icon}
            </button>
          ))}
          
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          <button
            className="p-2.5 text-[#9CA3AF] hover:text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors"
            title="Undo"
          >
            <Undo className="w-5 h-5" />
          </button>
          <button
            className="p-2.5 text-[#9CA3AF] hover:text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors"
            title="Redo"
          >
            <Redo className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Color Picker */}
          {(activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'line' || activeTool === 'circle' || activeTool === 'rectangle') && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowColorPicker(!showColorPicker);
                  setShowStrokePicker(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div 
                  className="w-5 h-5 rounded border-2 border-gray-300"
                  style={{ backgroundColor: currentColor }}
                />
                <ChevronDown className="w-4 h-4 text-[#6B7280]" />
              </button>

              {showColorPicker && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setShowColorPicker(false)}
                  />
                  <div className="absolute top-full right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl p-4 z-20 min-w-[200px]">
                    <p className="text-[11px] text-[#9CA3AF] font-bold uppercase tracking-wider mb-3">
                      {activeTool === 'highlighter' ? 'Highlighter Color' : 'Pen Color'}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => {
                            if (activeTool === 'highlighter') {
                              setHighlighterColor(color.value);
                            } else {
                              setPenColor(color.value);
                            }
                            setShowColorPicker(false);
                          }}
                          className={`w-10 h-10 rounded-lg border-2 transition-all ${
                            currentColor === color.value
                              ? 'border-gray-800 scale-110'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Stroke Width Picker */}
          {(activeTool === 'pen' || activeTool === 'line' || activeTool === 'circle' || activeTool === 'rectangle') && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowStrokePicker(!showStrokePicker);
                  setShowColorPicker(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div 
                  className="rounded-full bg-[#1F2937]"
                  style={{ 
                    width: `${strokeWidth * 2}px`, 
                    height: `${strokeWidth * 2}px` 
                  }}
                />
                <ChevronDown className="w-4 h-4 text-[#6B7280]" />
              </button>

              {showStrokePicker && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setShowStrokePicker(false)}
                  />
                  <div className="absolute top-full right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl p-4 z-20 min-w-[160px]">
                    <p className="text-[11px] text-[#9CA3AF] font-bold uppercase tracking-wider mb-3">
                      Stroke Width
                    </p>
                    <div className="space-y-2">
                      {STROKE_WIDTHS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setStrokeWidth(option.value);
                            setShowStrokePicker(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                            strokeWidth === option.value
                              ? 'bg-yellow-50 border-2 border-yellow-400'
                              : 'border-2 border-transparent hover:bg-gray-50'
                          }`}
                        >
                          <div 
                            className="rounded-full bg-[#1F2937]"
                            style={{ 
                              width: `${option.value * 2}px`, 
                              height: `${option.value * 2}px` 
                            }}
                          />
                          <span className="text-[13px] font-semibold text-[#374151]">
                            {option.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {activeTool === 'text' ? (
            /* Text Editor Mode */
            <div className="min-h-[500px]">
              <textarea
                ref={textareaRef}
                value={textContent}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Start typing your notes..."
                className="w-full min-h-[500px] text-[15px] leading-relaxed text-[#374151] placeholder:text-[#9CA3AF] outline-none resize-none bg-transparent"
                style={{
                  backgroundImage: 'repeating-linear-gradient(transparent, transparent 39px, #E5E7EB 39px, #E5E7EB 40px)',
                  lineHeight: '40px',
                  paddingTop: '0px',
                }}
              />
            </div>
          ) : (
            /* Drawing Canvas Mode */
            <div className="min-h-[500px] border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <p className="text-[14px] text-[#6B7280] mb-2">Drawing Canvas</p>
                <p className="text-[12px] text-[#9CA3AF]">
                  Canvas functionality will be implemented here
                </p>
                <p className="text-[12px] text-[#9CA3AF] mt-4">
                  For now, use <span className="font-bold">Text tool</span> to write notes
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}