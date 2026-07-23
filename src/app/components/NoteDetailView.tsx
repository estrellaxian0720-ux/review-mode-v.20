import { useState, useRef } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  ChevronLeft,
  Grid3x3,
  Bookmark,
  PlusSquare,
  Crop,
  Layers,
  Search,
  Shirt,
  Pen,
  Eye,
  BookOpen,
  MoreVertical,
  Undo2,
  Redo2,
  Image,
  Music,
  Type,
  Square,
  Paperclip,
  Sparkles,
  Mic,
  Clock,
  Sticker,
  ScanText,
  ChevronDown,
  Crown,
  Cloud,
  Languages,
  MessageSquare
} from 'lucide-react';

interface NoteDetailViewProps {
  noteId?: string;
  noteTitle?: string;
  onClose?: () => void;
}

type EditorMode = 'pen' | 'insert' | 'view';

interface CanvasItem {
  id: string;
  type: string;
  x: number;
  y: number;
  icon?: any;
  text?: string;
}

interface DraggableToolProps {
  type: string;
  icon: React.ReactNode;
  label: string;
  isPremium?: boolean;
  isFree?: boolean;
}

// Draggable Tool Component
function DraggableTool({ type, icon, label, isPremium, isFree }: DraggableToolProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'tool',
    item: { type, label },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <button
      ref={drag}
      className={`relative text-gray-700 hover:bg-gray-100 p-1.5 rounded transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
      title={label}
      style={{ cursor: 'grab' }}
    >
      {icon}
      {isPremium && (
        <Crown className="absolute -top-1 -right-1 w-2.5 h-2.5 text-orange-400" strokeWidth={2} />
      )}
      {isFree && (
        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] px-1 rounded-full font-bold">
          Free
        </span>
      )}
    </button>
  );
}

// Draggable Page Indicator
function DraggablePageIndicator({ currentPage, totalPages, onPrev, onNext }: any) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'page-indicator',
    item: { type: 'page-indicator', currentPage, totalPages },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`bg-white border border-gray-100 rounded-full px-3 py-1 flex items-center gap-2 text-xs text-gray-400 shadow-sm ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={{ cursor: 'grab' }}
    >
      <button onClick={onPrev} className="hover:text-gray-600 transition-colors">
        &lt;
      </button>
      <span>
        {currentPage} / {totalPages}
      </span>
      <button onClick={onNext} className="hover:text-gray-600 transition-colors">
        &gt;
      </button>
    </div>
  );
}

// Draggable Cloud Widget
function DraggableCloudWidget() {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'cloud-widget',
    item: { type: 'cloud-widget' },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <button
      ref={drag}
      className={`w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white shadow-md hover:shadow-lg transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={{ cursor: 'grab' }}
    >
      <Cloud className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
    </button>
  );
}

// Canvas Item Component
function CanvasItemComponent({ item, onRemove }: { item: CanvasItem; onRemove: () => void }) {
  const [position, setPosition] = useState({ x: item.x, y: item.y });
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'canvas-item',
    item: { ...item, position },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`absolute ${isDragging ? 'opacity-50' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        cursor: 'move',
      }}
      onDoubleClick={onRemove}
    >
      {item.type === 'page-indicator' && (
        <div className="bg-white border border-gray-100 rounded-full px-3 py-1 flex items-center gap-2 text-xs text-gray-400 shadow-sm">
          <span>&lt;</span>
          <span>{item.text}</span>
          <span>&gt;</span>
        </div>
      )}
      {item.type === 'cloud-widget' && (
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white shadow-md">
          <Cloud className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
        </div>
      )}
      {item.type !== 'page-indicator' && item.type !== 'cloud-widget' && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-md">
          <span className="text-sm text-gray-700">{item.text || item.type}</span>
        </div>
      )}
    </div>
  );
}

function NoteDetailViewContent({ noteId, noteTitle = 'Untitled Note', onClose }: NoteDetailViewProps) {
  const [editorMode, setEditorMode] = useState<EditorMode>('insert');
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(2);
  const [totalPages, setTotalPages] = useState(3);
  const [selectedColor, setSelectedColor] = useState('blue-800');
  const [selectedThickness, setSelectedThickness] = useState(2);
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Color palette
  const colors = [
    { name: 'blue-800', class: 'bg-blue-800' },
    { name: 'blue-900', class: 'bg-blue-900' },
    { name: 'red-600', class: 'bg-red-600' },
    { name: 'black', class: 'bg-black' },
  ];

  // Line thickness options
  const thicknesses = [1, 2, 3, 4];

  // Drop zone for canvas
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['tool', 'page-indicator', 'cloud-widget', 'canvas-item'],
    drop: (item: any, monitor) => {
      const offset = monitor.getClientOffset();
      if (offset && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const x = offset.x - canvasRect.left;
        const y = offset.y - canvasRect.top;

        // If it's a canvas item being repositioned, update its position
        if (item.id) {
          setCanvasItems((prev) =>
            prev.map((ci) =>
              ci.id === item.id ? { ...ci, x, y } : ci
            )
          );
        } else {
          // New item being dropped
          const newItem: CanvasItem = {
            id: `item-${Date.now()}`,
            type: item.type,
            x,
            y,
            text: item.label || item.type,
          };
          setCanvasItems((prev) => [...prev, newItem]);
        }
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const removeCanvasItem = (id: string) => {
    setCanvasItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-[#fdfdfd]">
      {/* Top Navbar - Dark Purple */}
      <div className="h-12 w-full bg-[#544665] flex items-center justify-between px-4 flex-shrink-0">
        {/* Left Icons */}
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="text-gray-200 hover:text-white transition-colors"
            title="Back"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button className="text-gray-200 hover:text-white transition-colors" title="Grid View">
            <Grid3x3 className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button className="text-gray-200 hover:text-white transition-colors" title="Bookmark">
            <Bookmark className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button className="text-gray-200 hover:text-white transition-colors" title="Add Page">
            <PlusSquare className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button className="text-gray-200 hover:text-white transition-colors" title="Crop">
            <Crop className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button className="text-gray-200 hover:text-white transition-colors" title="Layers">
            <Layers className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-4">
          <button className="text-gray-200 hover:text-white transition-colors" title="Search">
            <Search className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button className="relative text-gray-200 hover:text-white transition-colors" title="Theme">
            <Shirt className="w-5 h-5" strokeWidth={1.5} />
            <Crown className="absolute -top-1 -right-1 w-2.5 h-2.5 text-orange-400" strokeWidth={2} />
          </button>
          <button
            className={`text-gray-200 hover:text-white transition-colors ${
              editorMode === 'pen' ? 'text-white' : ''
            }`}
            title="Pen Mode"
            onClick={() => setEditorMode('pen')}
          >
            <Pen className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button className="text-gray-200 hover:text-white transition-colors" title="View">
            <Eye className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button className="text-gray-200 hover:text-white transition-colors" title="Library">
            <BookOpen className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button className="text-gray-200 hover:text-white transition-colors" title="More">
            <MoreVertical className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Contextual Toolbar - White */}
      <div className="h-12 w-full bg-white border-b border-gray-200 flex items-center px-4 justify-between flex-shrink-0">
        {/* Left Group - History */}
        <div className="flex items-center gap-3">
          <button className="text-gray-700 hover:bg-gray-100 p-1.5 rounded transition-colors" title="Undo">
            <Undo2 className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button className="text-gray-700 hover:bg-gray-100 p-1.5 rounded transition-colors" title="Redo">
            <Redo2 className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Divider */}
        <div className="border-l border-gray-300 h-6 mx-2" />

        {/* Middle Group - Tools (Draggable) */}
        <div className="flex items-center gap-3 flex-1 justify-center">
          {editorMode === 'insert' ? (
            <>
              <DraggableTool
                type="image"
                icon={<Image className="w-5 h-5" strokeWidth={1.5} />}
                label="Image"
              />
              <DraggableTool
                type="music"
                icon={<Music className="w-5 h-5" strokeWidth={1.5} />}
                label="Music"
                isFree
              />
              <DraggableTool
                type="text"
                icon={<Type className="w-5 h-5" strokeWidth={1.5} />}
                label="Text"
              />
              <DraggableTool
                type="shapes"
                icon={<Square className="w-5 h-5" strokeWidth={1.5} />}
                label="Shapes"
              />
              <DraggableTool
                type="tape"
                icon={<Paperclip className="w-5 h-5" strokeWidth={1.5} />}
                label="Tape"
              />
              <DraggableTool
                type="ai"
                icon={<Sparkles className="w-5 h-5" strokeWidth={1.5} />}
                label="AI Tools"
                isPremium
              />
              <DraggableTool
                type="voice"
                icon={<Mic className="w-5 h-5" strokeWidth={1.5} />}
                label="Voice"
              />
              <DraggableTool
                type="time"
                icon={<Clock className="w-5 h-5" strokeWidth={1.5} />}
                label="Time"
              />
              <DraggableTool
                type="sticker"
                icon={<Sticker className="w-5 h-5" strokeWidth={1.5} />}
                label="Sticker"
              />
              <DraggableTool
                type="ocr"
                icon={<ScanText className="w-5 h-5" strokeWidth={1.5} />}
                label="OCR"
                isFree
              />
            </>
          ) : (
            // Pen mode tools
            <>
              <button className="text-gray-700 hover:bg-gray-100 p-1.5 rounded transition-colors" title="Pen">
                <Pen className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <button className="text-gray-700 hover:bg-gray-100 p-1.5 rounded transition-colors" title="Highlighter">
                <div className="w-5 h-5 border-b-2 border-yellow-400" />
              </button>
              <button className="text-gray-700 hover:bg-gray-100 p-1.5 rounded transition-colors" title="Eraser">
                <div className="w-5 h-5 bg-gray-200 rounded" />
              </button>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="border-l border-gray-300 h-6 mx-2" />

        {/* Right Group - Properties */}
        <div className="flex items-center gap-3">
          <button className="text-gray-700 hover:bg-gray-100 p-1.5 rounded transition-colors" title="More Colors">
            <ChevronDown className="w-5 h-5" strokeWidth={1.5} />
          </button>

          {/* Color Swatches */}
          <div className="flex items-center gap-2">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color.name)}
                className={`w-5 h-5 rounded-full ${color.class} ${
                  selectedColor === color.name ? 'ring-2 ring-offset-1 ring-gray-400' : ''
                } hover:ring-2 hover:ring-offset-1 hover:ring-gray-300 transition-all`}
                title={color.name}
              />
            ))}
          </div>

          {/* Line Thickness */}
          <div className="flex items-center gap-2 ml-2">
            {thicknesses.map((thickness) => (
              <button
                key={thickness}
                onClick={() => setSelectedThickness(thickness)}
                className={`hover:bg-gray-100 p-1.5 rounded transition-colors ${
                  selectedThickness === thickness ? 'bg-gray-100' : ''
                }`}
                title={`Thickness ${thickness}`}
              >
                <div
                  className="bg-gray-700"
                  style={{
                    width: '20px',
                    height: `${thickness}px`,
                    borderRadius: '2px',
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Canvas Area - Lined Paper */}
      <div className="flex-1 relative overflow-auto mx-4 mt-4 mb-4">
        <div
          ref={(node) => {
            canvasRef.current = node;
            drop(node);
          }}
          className={`min-h-full bg-white shadow-sm border border-gray-200 relative ${
            isOver ? 'ring-2 ring-blue-400' : ''
          }`}
        >
          {/* Date Header */}
          <div className="absolute top-0 left-0 px-8 py-4">
            <p className="text-gray-300 font-light text-2xl">Date: /</p>
          </div>

          {/* Page Indicator - Draggable */}
          <div className="absolute top-4 right-4">
            <DraggablePageIndicator
              currentPage={currentPage}
              totalPages={totalPages}
              onPrev={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              onNext={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
            />
          </div>

          {/* Lined Paper Background */}
          <div className="pt-20 pb-8 px-8">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="h-12 border-b border-gray-200" />
            ))}
          </div>

          {/* Cloud Widget - Draggable */}
          <div className="absolute top-1/4 right-4">
            <DraggableCloudWidget />
          </div>

          {/* Canvas Items */}
          {canvasItems.map((item) => (
            <CanvasItemComponent
              key={item.id}
              item={item}
              onRemove={() => removeCanvasItem(item.id)}
            />
          ))}

          {/* AI Context Menu - Floating (Conditionally Shown) */}
          {showAIMenu && (
            <div className="absolute top-4 right-20">
              <div className="w-12 bg-gray-100 rounded-full flex flex-col items-center py-2 gap-4 shadow-lg border border-gray-200">
                <button
                  className="text-gray-700 hover:bg-gray-200 p-2 rounded-full transition-colors"
                  title="AI Generate"
                >
                  <Sparkles className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <button
                  className="text-gray-700 hover:bg-gray-200 p-2 rounded-full transition-colors"
                  title="OCR"
                >
                  <ScanText className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <button
                  className="text-gray-700 hover:bg-gray-200 p-2 rounded-full transition-colors"
                  title="Translate"
                >
                  <Languages className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <button
                  className="text-gray-700 hover:bg-gray-200 p-2 rounded-full transition-colors"
                  title="Summarize"
                >
                  <BookOpen className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <button
                  className="text-gray-700 hover:bg-gray-200 p-2 rounded-full transition-colors"
                  title="Chat"
                >
                  <MessageSquare className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function NoteDetailView(props: NoteDetailViewProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <NoteDetailViewContent {...props} />
    </DndProvider>
  );
}