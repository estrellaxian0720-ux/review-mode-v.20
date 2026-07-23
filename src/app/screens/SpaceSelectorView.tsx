import { useState } from 'react';
import { Plus, MoreVertical, Edit3, Trash2, Palette, MoreHorizontal, Layers } from 'lucide-react';
import StudySpaceEmptyState from '../components/StudySpaceEmptyState';
import SpaceStatusBadge from '../components/SpaceStatusBadge';
import LearningSpacesQuotaCard from '../components/LearningSpacesQuotaCard';
import { RenameSpacePopup } from '../components/RenameSpacePopup';
import { DeleteSpacePopup } from '../components/DeleteSpacePopup';
import { ChangeIconPopup } from '../components/ChangeIconPopup';
import { ViewOptionsPopup, type DisplayMethod, type SortMethod } from '../components/ViewOptionsPopup';

interface Props {
  onSelectSpace: (spaceId: string) => void;
  onCreateNew: () => void;
}

interface Space {
  id: string;
  name: string;
  icon: string;
  sourceCount: number;
  progress: number;
  lastStudiedDay: number;
  totalDays: number;
  lastAccessedAt: Date;
  createdAt: Date;
  status: 'active' | 'readonly';
}

const DEMO_SPACES: Space[] = [
  { id: '1', name: 'Linear Algebra',    icon: '📐', sourceCount: 10, progress: 68, lastStudiedDay: 3,  totalDays: 10, lastAccessedAt: new Date(), createdAt: new Date(), status: 'active' },
  { id: '2', name: 'CET-4 Preparation', icon: '🎓', sourceCount: 15, progress: 45, lastStudiedDay: 7,  totalDays: 15, lastAccessedAt: new Date(Date.now() - 86400000), createdAt: new Date(Date.now() - 86400000), status: 'readonly' },
  { id: '3', name: 'Advanced Calculus', icon: '∫',  sourceCount: 8,  progress: 92, lastStudiedDay: 14, totalDays: 15, lastAccessedAt: new Date(Date.now() - 172800000), createdAt: new Date(Date.now() - 172800000), status: 'active' },
  { id: '4', name: 'Organic Chemistry', icon: '🧪', sourceCount: 12, progress: 23, lastStudiedDay: 2,  totalDays: 12, lastAccessedAt: new Date(Date.now() - 259200000), createdAt: new Date(Date.now() - 259200000), status: 'readonly' },
];

export default function SpaceSelectorView({ onSelectSpace, onCreateNew }: Props) {
  const [demo, setDemo]           = useState<'empty' | 'with-spaces'>('empty');
  const [userPlan, setUserPlan]   = useState<'free' | 'paid' | 'expired'>('paid');
  const [spaces, setSpaces]       = useState<Space[]>(DEMO_SPACES);
  const [openMenuId, setOpenMenuId]       = useState<string | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [showRename, setShowRename]       = useState(false);
  const [showDelete, setShowDelete]       = useState(false);
  const [showChangeIcon, setShowChangeIcon] = useState(false);
  const [showViewOptions, setShowViewOptions] = useState(false);
  const [showBetaPopup, setShowBetaPopup] = useState(false);
  const [onWaitingList, setOnWaitingList] = useState(false);
  const [displayMethod, setDisplayMethod] = useState<DisplayMethod>('grid');
  const [sortMethod, setSortMethod]       = useState<SortMethod>('latest');

  const activeCount   = spaces.filter(s => s.status === 'active').length;
  const totalAllowed  = userPlan === 'paid' ? 10 : 1;

  const sorted = [...spaces].sort((a, b) => {
    if (sortMethod === 'latest')  return b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime();
    if (sortMethod === 'created') return b.createdAt.getTime() - a.createdAt.getTime();
    return a.name.localeCompare(b.name);
  });

  const handleCreateClick = () => {
    if (demo === 'with-spaces') { setShowBetaPopup(true); }
    else { onCreateNew(); }
  };

  const openRename = (space: Space) => { setSelectedSpace(space); setShowRename(true); setOpenMenuId(null); };
  const openDelete = (space: Space) => { setSelectedSpace(space); setShowDelete(true); setOpenMenuId(null); };
  const openChangeIcon = (space: Space) => { setSelectedSpace(space); setShowChangeIcon(true); setOpenMenuId(null); };

  const confirmRename = (name: string) => {
    if (selectedSpace) setSpaces(prev => prev.map(s => s.id === selectedSpace.id ? { ...s, name } : s));
    setShowRename(false); setSelectedSpace(null);
  };
  const confirmDelete = () => {
    if (selectedSpace) setSpaces(prev => prev.filter(s => s.id !== selectedSpace.id));
    setShowDelete(false); setSelectedSpace(null);
  };
  const confirmChangeIcon = (icon: string) => {
    if (selectedSpace) setSpaces(prev => prev.map(s => s.id === selectedSpace.id ? { ...s, icon } : s));
    setShowChangeIcon(false); setSelectedSpace(null);
  };

  return (
    <div className="bg-[#fafafa] relative h-full w-full flex flex-col">

      {/* Demo toggles */}
      <div className="absolute top-2 right-4 z-50 flex gap-2">
        <select value={demo} onChange={(e) => setDemo(e.target.value as 'empty' | 'with-spaces')}
          className="text-xs border border-slate-300 rounded-full px-3 py-1.5 bg-white text-slate-700 font-medium shadow-sm outline-none cursor-pointer">
          <option value="empty">Demo: Empty State</option>
          <option value="with-spaces">Demo: With Spaces</option>
        </select>
        {demo === 'with-spaces' && (
          <select value={userPlan} onChange={(e) => setUserPlan(e.target.value as 'free' | 'paid' | 'expired')}
            className="text-xs border border-slate-300 rounded-full px-3 py-1.5 bg-white text-slate-700 font-medium shadow-sm outline-none cursor-pointer">
            <option value="free">Free Plan</option>
            <option value="paid">Paid Plan</option>
            <option value="expired">Expired Plan</option>
          </select>
        )}
      </div>

      {/* ── Empty state ── */}
      {demo === 'empty' && (
        <div className="flex-1 bg-white overflow-hidden">
          <StudySpaceEmptyState onCreateNew={onCreateNew} />
        </div>
      )}

      {/* ── With-spaces state ── */}
      {demo === 'with-spaces' && (
        <div className="flex-1 overflow-y-auto">

          {/* Header */}
          <div className="px-8 pt-6 pb-1 flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-[#333]">My Study Spaces</h2>
            <button onClick={() => setShowViewOptions(true)}
              className="p-2 rounded-lg text-[#666] hover:text-[#333] hover:bg-white transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Quota bar */}
          <div className="px-8 pb-4">
            <LearningSpacesQuotaCard activeSpaces={activeCount} totalAllowed={totalAllowed} userPlan={userPlan} />
          </div>

          {/* Grid view */}
          {displayMethod === 'grid' && (
            <div className="px-8 pb-8">
              <div className="grid grid-cols-3 gap-6 max-w-[1200px]">

                {/* Create card */}
                <button onClick={handleCreateClick}
                  className="bg-white rounded-[16px] border-[1.667px] border-[#d1d5dc] p-6 hover:border-[#FDEA3B] hover:bg-[#FFF566]/5 transition-all flex flex-col items-center justify-center min-h-[290px] group">
                  <div className="w-16 h-16 bg-[rgba(255,245,102,0.3)] rounded-[14px] flex items-center justify-center mb-4 group-hover:bg-[rgba(253,234,59,0.4)] transition-colors">
                    <Plus className="w-8 h-8 text-[#666]" />
                  </div>
                  <p className="text-[16px] font-semibold text-[#666] group-hover:text-[#333] transition-colors">
                    Create a New Plan
                  </p>
                </button>

                {/* Space cards */}
                {sorted.map((space) => (
                  <div key={space.id} className="relative">
                    <div onClick={() => onSelectSpace(space.id)}
                      className="w-full bg-white rounded-[16px] border-[1.667px] border-[#d1d5dc] p-6 hover:border-[#2D8CFF]/30 hover:shadow-md transition-all text-left group cursor-pointer min-h-[290px] flex flex-col">

                      {/* Menu button */}
                      <div className="absolute top-4 right-4 z-10">
                        <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === space.id ? null : space.id); }}
                          className="p-2 rounded-[10px] text-[#666] hover:text-[#333] hover:bg-gray-100 transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {openMenuId === space.id && (
                          <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                            <button onClick={(e) => { e.stopPropagation(); openRename(space); }}
                              className="w-full px-4 py-2.5 text-left text-[14px] text-[#333] hover:bg-gray-50 flex items-center gap-3 transition-colors">
                              <Edit3 className="w-4 h-4 text-[#666]" /> Rename
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); openChangeIcon(space); }}
                              className="w-full px-4 py-2.5 text-left text-[14px] text-[#333] hover:bg-gray-50 flex items-center gap-3 transition-colors">
                              <Palette className="w-4 h-4 text-[#666]" /> Change Icon
                            </button>
                            <div className="border-t border-gray-100 my-1" />
                            <button onClick={(e) => { e.stopPropagation(); openDelete(space); }}
                              className="w-full px-4 py-2.5 text-left text-[14px] text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Icon */}
                      <div className="w-16 h-16 bg-gradient-to-b from-[#FFF566] to-[#FDEA3B] rounded-[14px] flex items-center justify-center mb-4 text-[32px] group-hover:scale-105 transition-transform">
                        {space.icon}
                      </div>

                      {/* Name + status */}
                      <div className="mb-3">
                        <h3 className="text-[18px] font-bold text-[#333] mb-2 line-clamp-2 tracking-[-0.44px] pr-8">
                          {space.name}
                        </h3>
                        <SpaceStatusBadge status={space.status} size="sm" />
                      </div>

                      {/* Metadata */}
                      <div className="space-y-2 mt-auto">
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-[#666]">{space.sourceCount} resources</span>
                          <span className="font-semibold text-[#2D8CFF]">{space.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#2D8CFF] rounded-full transition-all" style={{ width: `${space.progress}%` }} />
                        </div>
                        <p className="text-[12px] text-[#999] mt-1">Last studied: Day {space.lastStudiedDay} of {space.totalDays}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* List view */}
          {displayMethod === 'list' && (
            <div className="px-8 pb-8">
              <div className="space-y-4 max-w-[900px]">
                <button onClick={handleCreateClick}
                  className="w-full bg-white rounded-xl border-2 border-dashed border-gray-300 p-5 hover:border-[#FDEA3B] hover:bg-[#FFF566]/10 transition-all flex items-center gap-4 group">
                  <div className="w-14 h-14 bg-[#FFF566]/30 rounded-lg flex items-center justify-center group-hover:bg-[#FDEA3B]/30 transition-colors">
                    <Plus className="w-7 h-7 text-[#666]" />
                  </div>
                  <p className="text-[15px] font-semibold text-[#666] group-hover:text-[#333] transition-colors">
                    Create a New Study Plan
                  </p>
                </button>
                {sorted.map((space) => (
                  <div key={space.id} className="relative">
                    <div onClick={() => onSelectSpace(space.id)}
                      className="w-full bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-[#2D8CFF]/30 hover:shadow-lg transition-all text-left group flex items-center gap-5 cursor-pointer">
                      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-[#FFF566] to-[#FDEA3B] rounded-lg flex items-center justify-center text-[28px] group-hover:scale-110 transition-transform">
                        {space.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-[17px] font-bold text-[#333] truncate">{space.name}</h3>
                          <SpaceStatusBadge status={space.status} size="sm" />
                        </div>
                        <div className="flex items-center gap-6 text-[13px]">
                          <span className="text-[#666]">{space.sourceCount} resources</span>
                          <span className="text-[#999]">Day {space.lastStudiedDay} of {space.totalDays}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-4">
                        <div className="w-32">
                          <div className="flex items-center justify-between text-[12px] mb-1">
                            <span className="text-[#666]">Progress</span>
                            <span className="font-semibold text-[#2D8CFF]">{space.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#2D8CFF] rounded-full transition-all" style={{ width: `${space.progress}%` }} />
                          </div>
                        </div>
                        <div className="relative">
                          <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === space.id ? null : space.id); }}
                            className="p-2 rounded-lg text-[#666] hover:text-[#333] hover:bg-gray-100 transition-colors">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          {openMenuId === space.id && (
                            <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                              <button onClick={(e) => { e.stopPropagation(); openRename(space); }}
                                className="w-full px-4 py-2.5 text-left text-[14px] text-[#333] hover:bg-gray-50 flex items-center gap-3">
                                <Edit3 className="w-4 h-4 text-[#666]" /> Rename
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); openChangeIcon(space); }}
                                className="w-full px-4 py-2.5 text-left text-[14px] text-[#333] hover:bg-gray-50 flex items-center gap-3">
                                <Palette className="w-4 h-4 text-[#666]" /> Change Icon
                              </button>
                              <div className="border-t border-gray-100 my-1" />
                              <button onClick={(e) => { e.stopPropagation(); openDelete(space); }}
                                className="w-full px-4 py-2.5 text-left text-[14px] text-red-600 hover:bg-red-50 flex items-center gap-3">
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Beta / upgrade popup ── */}
      {showBetaPopup && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
          {!onWaitingList ? (
            <div className="relative bg-white rounded-[16px] shadow-2xl w-[460px] overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-[#2d8cff] via-[#7c3aed] to-[#f59e0b]" />
              <div className="flex flex-col gap-5 px-8 pt-7 pb-7">
                <div className="flex gap-4 items-start">
                  <div className="bg-gradient-to-b from-[#fff566] to-[#fdea3b] rounded-[14px] w-12 h-12 shrink-0 flex items-center justify-center">
                    <Layers className="w-6 h-6 text-[#333]" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-bold text-[#111827] text-[20px] leading-[1.3] tracking-[-0.5px]">
                      Need More Study Spaces?
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[12px] font-medium">🚀 产品升级中</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-[12px] font-medium">💎 Premium 套餐即将上线</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[12px] font-medium">⭐ 专属特权</span>
                </div>
                <div className="space-y-2">
                  <p className="text-[#374151] text-[14px] leading-[1.6]">
                    Unlimited Study Spaces are coming soon with our Premium plan.
                  </p>
                  <p className="text-[#6b7280] text-[13px] leading-[1.6]">
                    If you'd like access today, contact our team and we'll help you get set up before the official launch.
                  </p>
                </div>
                <button onClick={() => setOnWaitingList(true)}
                  className="bg-[#2d8cff] h-[44px] rounded-[10px] w-full hover:bg-[#2680ef] transition-colors flex items-center justify-center gap-2 shadow-[0px_4px_12px_rgba(45,140,255,0.3)]">
                  <span className="font-semibold text-[14px] text-white">Contact Support</span>
                </button>
              </div>
              <button onClick={() => { setShowBetaPopup(false); setOnWaitingList(false); }}
                className="absolute top-3 right-3 w-8 h-8 rounded-[10px] hover:bg-gray-100 transition-colors flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                  <path d="M15 5L5 15M5 5l10 10" stroke="#99A1AF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.67" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="relative bg-white rounded-[16px] shadow-2xl w-[380px] overflow-hidden">
              <div className="bg-[#07c160] px-6 py-5 text-center">
                <p className="text-white font-semibold text-[16px] mb-0.5">扫码添加客服</p>
                <p className="text-white/80 text-[12px]">Scan to add customer service on WeChat</p>
              </div>
              <div className="flex flex-col items-center px-8 py-6 gap-4">
                <div className="w-[160px] h-[160px] border-2 border-gray-200 rounded-[12px] p-3 bg-white flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="5" width="28" height="28" rx="3" fill="#111" /><rect x="9" y="9" width="20" height="20" rx="2" fill="white" /><rect x="13" y="13" width="12" height="12" rx="1" fill="#111" />
                    <rect x="67" y="5" width="28" height="28" rx="3" fill="#111" /><rect x="71" y="9" width="20" height="20" rx="2" fill="white" /><rect x="75" y="13" width="12" height="12" rx="1" fill="#111" />
                    <rect x="5" y="67" width="28" height="28" rx="3" fill="#111" /><rect x="9" y="71" width="20" height="20" rx="2" fill="white" /><rect x="13" y="75" width="12" height="12" rx="1" fill="#111" />
                    <rect x="37" y="5" width="6" height="6" fill="#111" /><rect x="49" y="5" width="6" height="6" fill="#111" /><rect x="57" y="5" width="6" height="6" fill="#111" />
                    <rect x="37" y="13" width="6" height="6" fill="#111" /><rect x="45" y="13" width="6" height="6" fill="#111" />
                    <rect x="5" y="37" width="6" height="6" fill="#111" /><rect x="17" y="37" width="6" height="6" fill="#111" /><rect x="41" y="37" width="6" height="6" fill="#111" /><rect x="65" y="37" width="6" height="6" fill="#111" /><rect x="89" y="37" width="6" height="6" fill="#111" />
                    <rect x="5" y="45" width="6" height="6" fill="#111" /><rect x="37" y="45" width="6" height="6" fill="#111" /><rect x="61" y="45" width="6" height="6" fill="#111" /><rect x="85" y="45" width="6" height="6" fill="#111" />
                    <rect x="37" y="61" width="6" height="6" fill="#111" /><rect x="49" y="61" width="6" height="6" fill="#111" /><rect x="89" y="61" width="6" height="6" fill="#111" />
                    <rect x="37" y="69" width="6" height="6" fill="#111" /><rect x="53" y="69" width="6" height="6" fill="#111" /><rect x="81" y="69" width="6" height="6" fill="#111" />
                    <rect x="41" y="77" width="6" height="6" fill="#111" /><rect x="57" y="77" width="6" height="6" fill="#111" />
                    <rect x="37" y="85" width="6" height="6" fill="#111" /><rect x="61" y="85" width="6" height="6" fill="#111" /><rect x="77" y="85" width="6" height="6" fill="#111" />
                  </svg>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[#111827] text-[14px] font-semibold">微信扫码，添加专属客服</p>
                  <p className="text-[#6b7280] text-[12px] leading-[1.5]">抢先体验 Premium 套餐 · 享受专属早鸟特权</p>
                </div>
                <div className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-[10px] px-4 py-3 text-center">
                  <p className="text-[#374151] text-[12px] leading-[1.6]">
                    🎁 <span className="font-semibold text-[#2d8cff]">限时早鸟优惠</span> · 官方上线前购买可享受专属特权，名额有限
                  </p>
                </div>
                <button onClick={() => { setShowBetaPopup(false); setOnWaitingList(false); }}
                  className="text-[#6b7280] text-[13px] hover:text-[#374151] transition-colors py-1">
                  稍后再说
                </button>
              </div>
              <button onClick={() => { setShowBetaPopup(false); setOnWaitingList(false); }}
                className="absolute top-3 right-3 w-8 h-8 rounded-[10px] hover:bg-black/10 transition-colors flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                  <path d="M15 5L5 15M5 5l10 10" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.67" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {showRename && selectedSpace && (
        <RenameSpacePopup currentName={selectedSpace.name} onConfirm={confirmRename}
          onCancel={() => { setShowRename(false); setSelectedSpace(null); }} />
      )}
      {showDelete && selectedSpace && (
        <DeleteSpacePopup spaceName={selectedSpace.name} onConfirm={confirmDelete}
          onCancel={() => { setShowDelete(false); setSelectedSpace(null); }} />
      )}
      {showChangeIcon && selectedSpace && (
        <ChangeIconPopup currentIcon={selectedSpace.icon} onConfirm={confirmChangeIcon}
          onCancel={() => { setShowChangeIcon(false); setSelectedSpace(null); }} />
      )}
      {showViewOptions && (
        <ViewOptionsPopup currentDisplay={displayMethod} currentSort={sortMethod}
          onDisplayChange={setDisplayMethod} onSortChange={setSortMethod}
          onClose={() => setShowViewOptions(false)} />
      )}
    </div>
  );
}
