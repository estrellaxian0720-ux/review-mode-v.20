import { useState } from 'react';
import { Plus, Search, MoreVertical, Filter, Cloud } from 'lucide-react';
import { NoteDetailView } from './NoteDetailView';

export interface Note {
  id: string;
  title: string;
  date: string;
  coverColor?: string;
  coverGradient?: string;
}

/**
 * All Notes View - 笔记网格视图
 * 注意：TopTabBar和Sidebar由App.tsx全局管理
 */
export function AllNotesView() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  
  // Sample notes data with colorful covers
  const [notes] = useState<Note[]>([
    { id: '1', title: 'Linear Algebra Notes', date: '3月 15', coverGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: '2', title: 'Eigenvalues Study', date: '3月 14', coverColor: '#f093fb' },
    { id: '3', title: 'Matrix Theory', date: '3月 13', coverGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: '4', title: 'Vector Spaces', date: '3月 12', coverColor: '#4facfe' },
    { id: '5', title: 'SVD Decomposition', date: '3月 11', coverGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { id: '6', title: 'Orthogonal Matrices', date: '3月 10', coverColor: '#fa709a' },
    { id: '7', title: 'Gram-Schmidt Process', date: '3月 9', coverGradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
    { id: '8', title: 'Determinants', date: '3月 8', coverColor: '#fee140' },
    { id: '9', title: 'Rank-Nullity Theorem', date: '3月 7', coverGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    { id: '10', title: 'Characteristic Polynomial', date: '3月 6', coverColor: '#c471f5' },
    { id: '11', title: 'Basis and Dimension', date: '3月 5', coverGradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
    { id: '12', title: 'Linear Transformations', date: '3月 4', coverColor: '#84fab0' },
    { id: '13', title: 'Inner Products', date: '3月 3', coverGradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
    { id: '14', title: 'Diagonalization', date: '3月 2', coverColor: '#fccb90' },
    { id: '15', title: 'Complex Numbers', date: '3月 1', coverGradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)' },
  ]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Notification Banner with Action Icons */}
      <div className="px-6 py-3 bg-[#FAFAFA] border-b border-gray-200">
        <div className="flex items-center justify-between">
          {/* Left: Notification */}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#999999]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-[13px] text-[#666666]">
              📄 <span className="text-[#2D8CFF] hover:underline cursor-pointer">点击</span>开启笔记备份，避免文件丢失
            </p>
          </div>

          {/* Right: Action Icons */}
          <div className="flex items-center gap-2">
            <button className="p-2 text-[#666666] hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button className="p-2 text-[#666666] hover:bg-gray-100 rounded-lg transition-colors">
              <Filter className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button className="p-2 text-[#666666] hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Note Cards Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-6 relative">
        <div className="grid grid-cols-5 gap-4 pb-20">
          {notes.map((note) => (
            <div
              key={note.id}
              className="group cursor-pointer w-[140px]"
              onClick={() => setSelectedNoteId(note.id)}
            >
              {/* Card Cover - Skeuomorphic notebook style */}
              <div 
                className="relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all w-[140px] h-[186px] mb-2"
                style={{
                  background: note.coverGradient || note.coverColor || '#E5E7EB'
                }}
              >
                {/* Cloud sync icon */}
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                    <Cloud className="w-3.5 h-3.5 text-[#666666]" strokeWidth={2} />
                  </div>
                </div>

                {/* Notebook binding effect */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/10" />
                
                {/* Page lines effect */}
                <div className="absolute inset-0 flex flex-col justify-center items-center p-4">
                  <div className="w-full space-y-2 opacity-20">
                    <div className="h-0.5 bg-white/40" />
                    <div className="h-0.5 bg-white/40" />
                    <div className="h-0.5 bg-white/40" />
                  </div>
                </div>
              </div>

              {/* Card Info */}
              <div>
                <h3 className="text-[14px] font-medium text-[#333333] mb-1 truncate">
                  {note.title}
                </h3>
                <p className="text-[10px] text-[#999999]">
                  {note.date}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Action Button (FAB) - Centered at bottom */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
          <button
            onClick={() => console.log('Create note')}
            className="w-14 h-14 bg-[#FDEA3B] hover:bg-[#FFEC3D] rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center pointer-events-auto"
          >
            <Plus className="w-7 h-7 text-[#333333]" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Note Detail View */}
      {selectedNoteId && (
        <div className="absolute inset-0 bg-white z-50">
          <NoteDetailView
            noteId={selectedNoteId}
            noteTitle={notes.find(n => n.id === selectedNoteId)?.title}
            onClose={() => setSelectedNoteId(null)}
          />
        </div>
      )}
    </div>
  );
}

export default AllNotesView;