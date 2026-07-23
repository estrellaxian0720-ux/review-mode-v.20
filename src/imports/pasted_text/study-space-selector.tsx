import { useState } from 'react';
import { Plus, MoreVertical, Trash2, Edit3 } from 'lucide-react';
import StudySpaceEmptyState from '../components/StudySpaceEmptyState';

interface StudySpaceSelectorScreenProps {
  onSelectSpace: (spaceId: string) => void;
  onCreateNew: () => void;
}

interface StudySpace {
  id: string;
  name: string;
  icon: string;
  sourceCount: number;
  progress: number;
  lastStudiedDay: number;
  totalDays: number;
}

const DEMO_SPACES: StudySpace[] = [
  { id: '1', name: 'Linear Algebra',      icon: '📐', sourceCount: 10, progress: 68, lastStudiedDay: 3,  totalDays: 10 },
  { id: '2', name: 'CET-4 Preparation',   icon: '🎓', sourceCount: 15, progress: 45, lastStudiedDay: 7,  totalDays: 15 },
  { id: '3', name: 'Advanced Calculus',   icon: '∫',  sourceCount: 8,  progress: 92, lastStudiedDay: 14, totalDays: 15 },
  { id: '4', name: 'Organic Chemistry',   icon: '🧪', sourceCount: 12, progress: 23, lastStudiedDay: 2,  totalDays: 12 },
];

export function StudySpaceSelectorScreen({ onSelectSpace, onCreateNew }: StudySpaceSelectorScreenProps) {
  const [demoState, setDemoState] = useState<'empty' | 'with-spaces'>('empty');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [spaces, setSpaces] = useState<StudySpace[]>(DEMO_SPACES);

  return (
    <div className="bg-[#fafafa] relative h-full w-full flex flex-col">
      {/* Demo toggle */}
      <div className="absolute top-2 right-4 z-50">
        <select
          value={demoState}
          onChange={(e) => setDemoState(e.target.value as 'empty' | 'with-spaces')}
          className="text-xs border border-slate-300 rounded-full px-3 py-1.5 bg-white text-slate-700 font-medium shadow-sm outline-none cursor-pointer"
        >
          <option value="empty">Demo: Empty State</option>
          <option value="with-spaces">Demo: With Spaces</option>
        </select>
      </div>

      {/* Empty state */}
      {demoState === 'empty' && (
        <div className="flex-1 bg-white overflow-hidden">
          <StudySpaceEmptyState onCreateNew={onCreateNew} />
        </div>
      )}

      {/* With spaces */}
      {demoState === 'with-spaces' && (
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 pt-6 pb-4">
            <h2 className="text-[18px] font-bold text-[#333]">My Study Spaces</h2>
          </div>

          <div className="px-8 pb-8">
            <div className="grid grid-cols-3 gap-6 max-w-[900px]">
              {/* Create card */}
              <button
                onClick={onCreateNew}
                className="bg-white rounded-[16px] border-[1.5px] border-dashed border-[#d1d5dc] p-6 hover:border-[#FDEA3B] hover:bg-[#FFFDE7] transition-all flex flex-col items-center justify-center min-h-[200px] group"
              >
                <div className="w-12 h-12 bg-[#FFF9C4] rounded-[12px] flex items-center justify-center mb-3 group-hover:bg-[#FDEA3B] transition-colors">
                  <Plus className="w-6 h-6 text-[#92680A]" />
                </div>
                <p className="text-[14px] font-semibold text-[#9CA3AF] group-hover:text-[#374151] transition-colors">
                  Create a Study Space
                </p>
              </button>

              {/* Space cards */}
              {spaces.map((space) => (
                <div key={space.id} className="relative">
                  <div
                    onClick={() => onSelectSpace(space.id)}
                    className="w-full bg-white rounded-[16px] border-[1.5px] border-[#e5e7eb] p-6 hover:border-[#FDEA3B] hover:shadow-md transition-all cursor-pointer flex flex-col min-h-[200px]"
                  >
                    {/* Menu button */}
                    <div className="absolute top-4 right-4 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === space.id ? null : space.id);
                        }}
                        className="p-1.5 rounded-lg text-[#9CA3AF] hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === space.id && (
                        <div className="absolute top-full right-0 mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-20">
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}
                            className="w-full px-3 py-2 text-left text-[13px] text-[#374151] hover:bg-gray-50 flex items-center gap-2.5"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#9CA3AF]" /> Rename
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSpaces(prev => prev.filter(s => s.id !== space.id));
                              setOpenMenuId(null);
                            }}
                            className="w-full px-3 py-2 text-left text-[13px] text-red-500 hover:bg-red-50 flex items-center gap-2.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="w-12 h-12 bg-gradient-to-b from-[#FFF566] to-[#FDEA3B] rounded-[12px] flex items-center justify-center mb-3 text-[24px]">
                      {space.icon}
                    </div>
                    <h3 className="text-[16px] font-bold text-[#1f2937] mb-2 pr-6 tracking-tight">{space.name}</h3>
                    <p className="text-[12px] text-[#9CA3AF] mb-3">{space.sourceCount} resources</p>
                    <div className="mt-auto">
                      <div className="flex justify-between text-[12px] mb-1">
                        <span className="text-[#9CA3AF]">Progress</span>
                        <span className="font-semibold text-[#FDEA3B]" style={{ color: '#92680A' }}>{space.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#FDEA3B] rounded-full" style={{ width: `${space.progress}%` }} />
                      </div>
                      <p className="text-[11px] text-[#C4C4C4] mt-2">Day {space.lastStudiedDay} of {space.totalDays}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudySpaceSelectorScreen;
