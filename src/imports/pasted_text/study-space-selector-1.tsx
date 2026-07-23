import { useState } from 'react';
import { Plus, MoreVertical, Edit3, Trash2, Palette, MoreHorizontal } from 'lucide-react';
import { RenameSpacePopup } from '../components/RenameSpacePopup';
import { DeleteSpacePopup } from '../components/DeleteSpacePopup';
import { ChangeIconPopup } from '../components/ChangeIconPopup';
import { ViewOptionsPopup, type DisplayMethod, type SortMethod } from '../components/ViewOptionsPopup';
import SpaceStatusBadge from '../components/SpaceStatusBadge';
import LearningSpacesQuotaCard from '../components/LearningSpacesQuotaCard';
import svgPathsEmpty from '../imports/svg-xrp75gdswl';
import svgPathsPopup from '../imports/svg-j6jym3gyfa';
import svgPathsCheck from '../imports/svg-ipsknnjn1w';

interface StudySpace {
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

interface StudySpaceSelectorScreenProps {
  onSelectSpace: (spaceId: string) => void;
  onCreateNew: () => void;
}

export function StudySpaceSelectorScreen({ onSelectSpace, onCreateNew }: StudySpaceSelectorScreenProps) {
  const [showBetaPopup, setShowBetaPopup] = useState(false);
  const [onWaitingList, setOnWaitingList] = useState(false);
  
  // Demo state toggle
  const [demoState, setDemoState] = useState<'empty' | 'with-spaces'>('empty');

  // User plan state - toggle between free, paid, and expired
  const [userPlan, setUserPlan] = useState<'free' | 'paid' | 'expired'>('paid');

  // Study spaces state
  const [studySpaces, setStudySpaces] = useState<StudySpace[]>([
    {
      id: 'space-1',
      name: 'Linear Algebra',
      icon: '📐',
      sourceCount: 10,
      progress: 68,
      lastStudiedDay: 3,
      totalDays: 10,
      lastAccessedAt: new Date(),
      createdAt: new Date(),
      status: 'active',
    },
    {
      id: 'space-2',
      name: 'CET-4 Preparation',
      icon: '🎓',
      sourceCount: 15,
      progress: 45,
      lastStudiedDay: 7,
      totalDays: 15,
      lastAccessedAt: new Date(Date.now() - 86400000),
      createdAt: new Date(Date.now() - 86400000),
      status: 'readonly',
    },
    {
      id: 'space-3',
      name: 'Advanced Calculus',
      icon: '∫',
      sourceCount: 8,
      progress: 92,
      lastStudiedDay: 14,
      totalDays: 15,
      lastAccessedAt: new Date(Date.now() - 172800000),
      createdAt: new Date(Date.now() - 172800000),
      status: 'active',
    },
    {
      id: 'space-4',
      name: 'Organic Chemistry',
      icon: '🧪',
      sourceCount: 12,
      progress: 23,
      lastStudiedDay: 2,
      totalDays: 12,
      lastAccessedAt: new Date(Date.now() - 259200000),
      createdAt: new Date(Date.now() - 259200000),
      status: 'readonly',
    },
  ]);

  // Calculate active spaces
  const activeSpacesCount = studySpaces.filter(s => s.status === 'active').length;
  const totalSpacesAllowed = userPlan === 'free' || userPlan === 'expired' ? 1 : 10;

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showRenamePopup, setShowRenamePopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showChangeIconPopup, setShowChangeIconPopup] = useState(false);
  const [showViewOptions, setShowViewOptions] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<StudySpace | null>(null);
  const [displayMethod, setDisplayMethod] = useState<'grid' | 'list'>('grid');
  const [sortMethod, setSortMethod] = useState<'latest' | 'created' | 'name'>('latest');

  const handleCreateClick = () => {
    if (demoState === 'with-spaces') {
      setShowBetaPopup(true);
    } else {
      onCreateNew();
    }
  };

  const handleContactSupport = () => {
    setOnWaitingList(true);
  };

  const handleCloseBetaPopup = () => {
    setShowBetaPopup(false);
    setTimeout(() => {
      setOnWaitingList(false);
    }, 300);
  };

  const handleRename = (spaceId: string) => {
    const space = studySpaces.find(s => s.id === spaceId);
    if (space) {
      setSelectedSpace(space);
      setShowRenamePopup(true);
      setOpenMenuId(null);
    }
  };

  const handleDelete = (spaceId: string) => {
    const space = studySpaces.find(s => s.id === spaceId);
    if (space) {
      setSelectedSpace(space);
      setShowDeletePopup(true);
      setOpenMenuId(null);
    }
  };

  const handleChangeIcon = (spaceId: string) => {
    const space = studySpaces.find(s => s.id === spaceId);
    if (space) {
      setSelectedSpace(space);
      setShowChangeIconPopup(true);
      setOpenMenuId(null);
    }
  };

  const confirmRename = (newName: string) => {
    if (selectedSpace) {
      setStudySpaces(spaces =>
        spaces.map(s => s.id === selectedSpace.id ? { ...s, name: newName } : s)
      );
    }
    setShowRenamePopup(false);
    setSelectedSpace(null);
  };

  const confirmDelete = () => {
    if (selectedSpace) {
      setStudySpaces(spaces => spaces.filter(s => s.id !== selectedSpace.id));
    }
    setShowDeletePopup(false);
    setSelectedSpace(null);
  };

  const confirmChangeIcon = (newIcon: string) => {
    if (selectedSpace) {
      setStudySpaces(spaces =>
        spaces.map(s => s.id === selectedSpace.id ? { ...s, icon: newIcon } : s)
      );
    }
    setShowChangeIconPopup(false);
    setSelectedSpace(null);
  };

  const sortedSpaces = [...studySpaces].sort((a, b) => {
    switch (sortMethod) {
      case 'latest':
        return b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime();
      case 'created':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="bg-[#fafafa] relative size-full flex flex-col">
      {/* Demo State Toggle - Positioned at very top */}
      <div className="absolute top-2 right-4 z-50 flex gap-2">
        <select
          value={demoState}
          onChange={(e) => setDemoState(e.target.value as 'empty' | 'with-spaces')}
          className="text-xs border border-slate-300 rounded-full px-3 py-1.5 bg-white text-slate-700 font-medium shadow-sm outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="empty">Demo: Empty State</option>
          <option value="with-spaces">Demo: With Spaces</option>
        </select>
        {demoState === 'with-spaces' && (
          <select
            value={userPlan}
            onChange={(e) => setUserPlan(e.target.value as 'free' | 'paid' | 'expired')}
            className="text-xs border border-slate-300 rounded-full px-3 py-1.5 bg-white text-slate-700 font-medium shadow-sm outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="free">Free Plan (1/1 active)</option>
            <option value="paid">Paid Plan (2/10 active)</option>
            <option value="expired">Expired Plan (3/1 over limit)</option>
          </select>
        )}
      </div>

      {/* Content Area - Empty State */}
      {demoState === 'empty' && (
        <div className="flex-1 bg-white flex items-center justify-center overflow-clip">
          <div className="relative w-[425.347px] h-[452.101px]">
            {/* Main Title */}
            <div className="absolute h-[39.002px] left-0 top-0 w-[425.347px]">
              <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[39px] left-1/2 -translate-x-1/2 not-italic text-[#333] text-[24px] text-center top-0 tracking-[0.1406px] whitespace-nowrap">
                Turn your notes into a clear study plan
              </p>
            </div>

            {/* Icon with BETA Badge */}
            <div className="absolute left-[164.67px] w-[95.998px] h-[95.998px] top-[87px]">
              {/* Icon Background */}
              <div className="absolute bg-gradient-to-b from-[#fff566] to-[#fdea3b] left-0 rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] w-[95.998px] h-[95.998px] top-0">
                {/* Layers Icon */}
                <div className="absolute left-[24px] w-[47.995px] h-[47.995px] top-[24px]">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 47.9948 47.9948">
                    <g id="Layers">
                      <path d={svgPathsEmpty.p2f6eb800} id="Vector" stroke="#333333" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.99957" />
                      <path d={svgPathsEmpty.p3552ac40} id="Vector_2" stroke="#333333" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.99957" />
                      <path d={svgPathsEmpty.p379a6480} id="Vector_3" stroke="#333333" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.99957" />
                    </g>
                  </svg>
                </div>
              </div>
              
              {/* BETA Badge */}
              <div className="absolute bg-[#2d8cff] h-[24.479px] left-[54.79px] rounded-[18641400px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] top-[-7.99px] w-[49.201px]">
                <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[16.5px] left-1/2 -translate-x-1/2 not-italic text-[11px] text-center text-white top-[4.66px] tracking-[0.0645px] whitespace-nowrap">
                  BETA
                </p>
              </div>
            </div>

            {/* What you can do section */}
            <div className="absolute h-[134.618px] left-0 top-[230.99px] w-[425.347px]">
              {/* Section Title */}
              <div className="absolute h-[24.375px] left-0 top-0 w-[425.347px]">
                <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[24.375px] left-1/2 -translate-x-1/2 not-italic text-[15px] text-black text-center top-[-1.22px] tracking-[-0.4688px] whitespace-nowrap">
                  What you can do
                </p>
              </div>

              {/* Bullet List */}
              <div className="absolute flex flex-col gap-[10px] h-[94.245px] left-[12.67px] top-[40.37px] w-[400px]">
                {/* Bullet 1 */}
                <div className="flex gap-[11.997px] items-start w-full">
                  <div className="h-[22.752px] w-[6.484px] shrink-0">
                    <p className="font-['Inter:Bold',sans-serif] font-bold leading-[22.75px] not-italic text-[#2d8cff] text-[14px] tracking-[-0.3004px] whitespace-nowrap">
                      •
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="font-['Inter:Regular',sans-serif] font-normal leading-[22.75px] not-italic text-[#666] text-[14px] tracking-[-0.3004px]">
                      Organize your study materials with AI guidance
                    </p>
                  </div>
                </div>

                {/* Bullet 2 */}
                <div className="flex gap-[11.997px] items-start w-full">
                  <div className="h-[22.752px] w-[6.484px] shrink-0">
                    <p className="font-['Inter:Bold',sans-serif] font-bold leading-[22.75px] not-italic text-[#2d8cff] text-[14px] tracking-[-0.3004px] whitespace-nowrap">
                      •
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="font-['Inter:Regular',sans-serif] font-normal leading-[22.75px] not-italic text-[#666] text-[14px] tracking-[-0.3004px]">
                      Identify what's most likely to be tested
                    </p>
                  </div>
                </div>

                {/* Bullet 3 */}
                <div className="flex gap-[11.997px] items-start w-full">
                  <div className="h-[22.752px] w-[6.484px] shrink-0">
                    <p className="font-['Inter:Bold',sans-serif] font-bold leading-[22.75px] not-italic text-[#2d8cff] text-[14px] tracking-[-0.3004px] whitespace-nowrap">
                      •
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="font-['Inter:Regular',sans-serif] font-normal leading-[22.75px] not-italic text-[#666] text-[14px] tracking-[-0.3004px]">
                      Get a personalized daily practice schedule
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreateClick}
              className="absolute bg-[#fdea3b] h-[54.497px] left-[93.5px] rounded-[14px] top-[397.6px] w-[238.351px] hover:bg-[#fde82b] transition-colors"
            >
              <p className="font-['Inter:Bold',sans-serif] font-bold leading-[22.5px] not-italic text-[#333] text-[15px] text-center tracking-[-0.4688px] whitespace-nowrap">
                Create a New Study Plan
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Content Area - With Spaces State */}
      {demoState === 'with-spaces' && (
        <div className="flex-1 overflow-y-auto">
          {/* Header with View Options */}
          <div className="px-8 pt-6 pb-1">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#333]">
                My Study Spaces
              </h2>

              {/* View Options Button */}
              <button
                onClick={() => setShowViewOptions(true)}
                className="p-2 rounded-lg text-[#666] hover:text-[#333] hover:bg-white transition-colors"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Compact Space Quota Indicator */}
          <div className="px-8 pb-4">
            <LearningSpacesQuotaCard
              activeSpaces={activeSpacesCount}
              totalAllowed={totalSpacesAllowed}
              userPlan={userPlan}
            />
          </div>

          {/* Grid View */}
          {displayMethod === 'grid' && (
            <div className="px-8 pb-8">
              <div className="grid grid-cols-3 gap-6 max-w-[1200px]">
                {/* Create New Plan Card - FIRST */}
                <button
                  onClick={handleCreateClick}
                  className="bg-white rounded-[16px] border-[1.667px] border-[#d1d5dc] p-6 hover:border-[#FDEA3B] hover:bg-[#FFF566]/5 transition-all flex flex-col items-center justify-center min-h-[290px] group"
                >
                  <div className="w-16 h-16 bg-[rgba(255,245,102,0.3)] rounded-[14px] flex items-center justify-center mb-4 group-hover:bg-[rgba(253,234,59,0.4)] transition-colors">
                    <Plus className="w-8 h-8 text-[#666]" />
                  </div>
                  <p className="text-[16px] font-semibold text-[#666] group-hover:text-[#333] transition-colors">
                    Create a New Plan
                  </p>
                </button>

                {/* Study Space Cards */}
                {sortedSpaces.map((space) => (
                  <div key={space.id} className="relative">
                    <div
                      onClick={() => onSelectSpace(space.id)}
                      className="w-full bg-white rounded-[16px] border-[1.667px] border-[#d1d5dc] p-6 hover:border-[#2D8CFF]/30 hover:shadow-md transition-all text-left group cursor-pointer min-h-[290px] flex flex-col"
                    >
                      {/* More Options Button */}
                      <div className="absolute top-4 right-4 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === space.id ? null : space.id);
                          }}
                          className="p-2 rounded-[10px] text-[#666] hover:text-[#333] hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuId === space.id && (
                          <div
                            className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRename(space.id);
                              }}
                              className="w-full px-4 py-2.5 text-left text-[14px] text-[#333] hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                              <Edit3 className="w-4 h-4 text-[#666]" />
                              Rename
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleChangeIcon(space.id);
                              }}
                              className="w-full px-4 py-2.5 text-left text-[14px] text-[#333] hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                              <Palette className="w-4 h-4 text-[#666]" />
                              Change Icon
                            </button>
                            <div className="border-t border-gray-100 my-1" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(space.id);
                              }}
                              className="w-full px-4 py-2.5 text-left text-[14px] text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Icon */}
                      <div className="w-16 h-16 bg-gradient-to-b from-[#FFF566] to-[#FDEA3B] rounded-[14px] flex items-center justify-center mb-4 text-[32px] group-hover:scale-105 transition-transform">
                        {space.icon}
                      </div>

                      {/* Course Name and Status Badge */}
                      <div className="mb-3">
                        <h3 className="text-[18px] font-bold text-[#333] mb-2 line-clamp-2 tracking-[-0.44px]">
                          {space.name}
                        </h3>
                        <SpaceStatusBadge status={space.status} size="sm" />
                      </div>

                      {/* Metadata */}
                      <div className="space-y-2 mt-auto">
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-[#666] tracking-[-0.076px]">{space.sourceCount} resources</span>
                          <span className="font-semibold text-[#2D8CFF] tracking-[-0.076px]">{space.progress}%</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#2D8CFF] rounded-full transition-all"
                            style={{ width: `${space.progress}%` }}
                          />
                        </div>

                        {/* Last Studied */}
                        <p className="text-[12px] text-[#999] mt-3 tracking-[-0.07px]">
                          Last studied: Day {space.lastStudiedDay} of {space.totalDays}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* List View */}
          {displayMethod === 'list' && (
            <div className="px-8 pb-8">
              <div className="space-y-4 max-w-[900px]">
                {/* Create New Plan Card - FIRST */}
                <button
                  onClick={handleCreateClick}
                  className="w-full bg-white rounded-xl border-2 border-dashed border-gray-300 p-5 hover:border-[#FDEA3B] hover:bg-[#FFF566]/10 transition-all flex items-center gap-4 group"
                >
                  <div className="w-14 h-14 bg-[#FFF566]/30 rounded-lg flex items-center justify-center group-hover:bg-[#FDEA3B]/30 transition-colors">
                    <Plus className="w-7 h-7 text-[#666]" />
                  </div>
                  <p className="text-[15px] font-semibold text-[#666] group-hover:text-[#333] transition-colors">
                    Create a New Study Plan
                  </p>
                </button>

                {/* Study Space List Items */}
                {sortedSpaces.map((space) => (
                  <div key={space.id} className="relative">
                    <div
                      onClick={() => onSelectSpace(space.id)}
                      className="w-full bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-[#2D8CFF]/30 hover:shadow-lg transition-all text-left group flex items-center gap-5 cursor-pointer"
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-[#FFF566] to-[#FDEA3B] rounded-lg flex items-center justify-center text-[28px] group-hover:scale-110 transition-transform">
                        {space.icon}
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-[17px] font-bold text-[#333] truncate">
                            {space.name}
                          </h3>
                          <SpaceStatusBadge status={space.status} size="sm" />
                        </div>
                        <div className="flex items-center gap-6 text-[13px]">
                          <span className="text-[#666]">{space.sourceCount} resources</span>
                          <span className="text-[#999]">Day {space.lastStudiedDay} of {space.totalDays}</span>
                        </div>
                      </div>

                      {/* Progress Info */}
                      <div className="flex-shrink-0 flex items-center gap-4">
                        <div className="w-32">
                          <div className="flex items-center justify-between text-[12px] mb-1">
                            <span className="text-[#666]">Progress</span>
                            <span className="font-semibold text-[#2D8CFF]">{space.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#2D8CFF] rounded-full transition-all"
                              style={{ width: `${space.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* More Options Button */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === space.id ? null : space.id);
                            }}
                            className="p-2 rounded-lg text-[#666] hover:text-[#333] hover:bg-gray-100 transition-colors"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          {/* Dropdown Menu */}
                          {openMenuId === space.id && (
                            <div
                              className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20"
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRename(space.id);
                                }}
                                className="w-full px-4 py-2.5 text-left text-[14px] text-[#333] hover:bg-gray-50 flex items-center gap-3 transition-colors"
                              >
                                <Edit3 className="w-4 h-4 text-[#666]" />
                                Rename
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleChangeIcon(space.id);
                                }}
                                className="w-full px-4 py-2.5 text-left text-[14px] text-[#333] hover:bg-gray-50 flex items-center gap-3 transition-colors"
                              >
                                <Palette className="w-4 h-4 text-[#666]" />
                                Change Icon
                              </button>
                              <div className="border-t border-gray-100 my-1" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(space.id);
                                }}
                                className="w-full px-4 py-2.5 text-left text-[14px] text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
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

      {/* Beta Limitation Popup */}
      {showBetaPopup && (
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-50">
          {!onWaitingList ? (
            // Initial State - Need More Study Spaces
            <div className="relative bg-white rounded-[16px] shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)] w-[460px] overflow-hidden">
              {/* Gradient accent bar at top */}
              <div className="h-1 w-full bg-gradient-to-r from-[#2d8cff] via-[#7c3aed] to-[#f59e0b]" />

              {/* Content */}
              <div className="flex flex-col gap-5 px-8 pt-7 pb-7">
                {/* Icon and Title */}
                <div className="flex gap-4 items-start">
                  <div className="bg-gradient-to-b from-[#fff566] to-[#fdea3b] rounded-[14px] w-12 h-12 shrink-0 flex items-center justify-center">
                    <div className="w-6 h-6">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.9931 23.9931">
                        <g clipPath="url(#clip0_layers_v2)">
                          <path d={svgPathsPopup.p6a65f80} stroke="#333333" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99942" />
                          <path d={svgPathsPopup.p13598100} stroke="#333333" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99942" />
                          <path d={svgPathsPopup.p3515f580} stroke="#333333" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.99942" />
                        </g>
                        <defs>
                          <clipPath id="clip0_layers_v2">
                            <rect fill="white" height="23.9931" width="23.9931" />
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-['Inter:Bold',sans-serif] font-bold text-[#111827] text-[20px] leading-[1.3] tracking-[-0.5px]">
                      Need More Study Spaces?
                    </p>
                  </div>
                </div>

                {/* Feature badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[12px] font-medium">
                    <span>🚀</span> 产品升级中
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-[12px] font-medium">
                    <span>💎</span> Premium 套餐即将上线
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[12px] font-medium">
                    <span>⭐</span> 专属特权
                  </span>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <p className="font-['Inter:Regular',sans-serif] font-normal text-[#374151] text-[14px] leading-[1.6]">
                    Unlimited Study Spaces are coming soon with our Premium plan.
                  </p>
                  <p className="font-['Inter:Regular',sans-serif] font-normal text-[#6b7280] text-[13px] leading-[1.6]">
                    If you'd like access today, contact our team and we'll help you get set up before the official launch.
                  </p>
                </div>

                {/* Contact Support Button */}
                <button
                  onClick={handleContactSupport}
                  className="bg-[#2d8cff] h-[44px] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(43,127,255,0.2),0px_4px_6px_0px_rgba(43,127,255,0.2)] w-full hover:bg-[#2680ef] transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                  </svg>
                  <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] text-white tracking-[-0.3px]">
                    Contact Support
                  </span>
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={handleCloseBetaPopup}
                className="absolute top-3 right-3 w-8 h-8 rounded-[10px] hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
                  <path d="M15 5L5 15" stroke="#99A1AF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                  <path d="M5 5L15 15" stroke="#99A1AF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                </svg>
              </button>
            </div>
          ) : (
            // QR Code State - Scan to add customer service on WeChat
            <div className="relative bg-white rounded-[16px] shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)] w-[380px] overflow-hidden">
              {/* WeChat green header */}
              <div className="bg-[#07c160] px-6 py-5 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.295.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c-.032-.276-.047-.556-.047-.837C8.649 11.887 12.736 8.5 17.79 8.5c.09 0 .18.004.271.006C16.92 4.91 13.148 2.188 8.69 2.188z"/>
                    <path d="M17.79 9.586c-4.13 0-7.481 2.898-7.481 6.478 0 3.58 3.351 6.479 7.481 6.479a8.78 8.78 0 0 0 2.465-.352.748.748 0 0 1 .619.085l1.648.964a.282.282 0 0 0 .145.047.256.256 0 0 0 .256-.256c0-.063-.026-.122-.042-.184l-.338-1.284a.512.512 0 0 1 .185-.577C23.995 19.935 25 18.165 25 16.064c0-3.58-3.351-6.478-7.21-6.478z"/>
                  </svg>
                  <p className="text-white font-semibold text-[16px]">扫码添加客服</p>
                </div>
                <p className="text-white/80 text-[12px]">Scan to add customer service on WeChat</p>
              </div>

              {/* QR Code area */}
              <div className="flex flex-col items-center px-8 py-6 gap-4">
                {/* QR Code placeholder */}
                <div className="w-[180px] h-[180px] border-2 border-gray-200 rounded-[12px] p-3 bg-white shadow-inner flex items-center justify-center">
                  <div className="w-full h-full relative">
                    {/* Simulated QR code grid */}
                    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      {/* Top-left finder pattern */}
                      <rect x="5" y="5" width="28" height="28" rx="3" fill="#111" />
                      <rect x="9" y="9" width="20" height="20" rx="2" fill="white" />
                      <rect x="13" y="13" width="12" height="12" rx="1" fill="#111" />
                      {/* Top-right finder pattern */}
                      <rect x="67" y="5" width="28" height="28" rx="3" fill="#111" />
                      <rect x="71" y="9" width="20" height="20" rx="2" fill="white" />
                      <rect x="75" y="13" width="12" height="12" rx="1" fill="#111" />
                      {/* Bottom-left finder pattern */}
                      <rect x="5" y="67" width="28" height="28" rx="3" fill="#111" />
                      <rect x="9" y="71" width="20" height="20" rx="2" fill="white" />
                      <rect x="13" y="75" width="12" height="12" rx="1" fill="#111" />
                      {/* Data modules (random-looking pattern) */}
                      <rect x="37" y="5" width="6" height="6" fill="#111" /><rect x="49" y="5" width="6" height="6" fill="#111" /><rect x="57" y="5" width="6" height="6" fill="#111" />
                      <rect x="37" y="13" width="6" height="6" fill="#111" /><rect x="45" y="13" width="6" height="6" fill="#111" /><rect x="57" y="13" width="6" height="6" fill="#111" />
                      <rect x="41" y="21" width="6" height="6" fill="#111" /><rect x="53" y="21" width="6" height="6" fill="#111" /><rect x="61" y="21" width="6" height="6" fill="#111" />
                      <rect x="5" y="37" width="6" height="6" fill="#111" /><rect x="17" y="37" width="6" height="6" fill="#111" /><rect x="29" y="37" width="6" height="6" fill="#111" /><rect x="41" y="37" width="6" height="6" fill="#111" /><rect x="53" y="37" width="6" height="6" fill="#111" /><rect x="65" y="37" width="6" height="6" fill="#111" /><rect x="77" y="37" width="6" height="6" fill="#111" /><rect x="89" y="37" width="6" height="6" fill="#111" />
                      <rect x="5" y="45" width="6" height="6" fill="#111" /><rect x="21" y="45" width="6" height="6" fill="#111" /><rect x="37" y="45" width="6" height="6" fill="#111" /><rect x="49" y="45" width="6" height="6" fill="#111" /><rect x="61" y="45" width="6" height="6" fill="#111" /><rect x="73" y="45" width="6" height="6" fill="#111" /><rect x="85" y="45" width="6" height="6" fill="#111" />
                      <rect x="9" y="53" width="6" height="6" fill="#111" /><rect x="25" y="53" width="6" height="6" fill="#111" /><rect x="41" y="53" width="6" height="6" fill="#111" /><rect x="57" y="53" width="6" height="6" fill="#111" /><rect x="69" y="53" width="6" height="6" fill="#111" /><rect x="81" y="53" width="6" height="6" fill="#111" /><rect x="89" y="53" width="6" height="6" fill="#111" />
                      <rect x="37" y="61" width="6" height="6" fill="#111" /><rect x="49" y="61" width="6" height="6" fill="#111" /><rect x="61" y="61" width="6" height="6" fill="#111" /><rect x="77" y="61" width="6" height="6" fill="#111" /><rect x="89" y="61" width="6" height="6" fill="#111" />
                      <rect x="37" y="69" width="6" height="6" fill="#111" /><rect x="53" y="69" width="6" height="6" fill="#111" /><rect x="65" y="69" width="6" height="6" fill="#111" /><rect x="81" y="69" width="6" height="6" fill="#111" />
                      <rect x="41" y="77" width="6" height="6" fill="#111" /><rect x="57" y="77" width="6" height="6" fill="#111" /><rect x="73" y="77" width="6" height="6" fill="#111" /><rect x="85" y="77" width="6" height="6" fill="#111" />
                      <rect x="37" y="85" width="6" height="6" fill="#111" /><rect x="49" y="85" width="6" height="6" fill="#111" /><rect x="61" y="85" width="6" height="6" fill="#111" /><rect x="77" y="85" width="6" height="6" fill="#111" /><rect x="89" y="85" width="6" height="6" fill="#111" />
                      <rect x="37" y="93" width="6" height="6" fill="#111" /><rect x="53" y="93" width="6" height="6" fill="#111" /><rect x="69" y="93" width="6" height="6" fill="#111" /><rect x="85" y="93" width="6" height="6" fill="#111" />
                    </svg>
                  </div>
                </div>

                {/* Instruction */}
                <div className="text-center space-y-1">
                  <p className="text-[#111827] text-[14px] font-semibold">微信扫码，添加专属客服</p>
                  <p className="text-[#6b7280] text-[12px] leading-[1.5]">
                    抢先体验 Premium 套餐 · 享受专属早鸟特权
                  </p>
                </div>

                {/* Early access badge */}
                <div className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-[10px] px-4 py-3 text-center">
                  <p className="text-[#374151] text-[12px] leading-[1.6]">
                    🎁 <span className="font-semibold text-[#2d8cff]">限时早鸟优惠</span> · 官方上线前购买可享受专属特权，名额有限
                  </p>
                </div>

                <button
                  onClick={handleCloseBetaPopup}
                  className="text-[#6b7280] text-[13px] hover:text-[#374151] transition-colors py-1"
                >
                  稍后再说
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={handleCloseBetaPopup}
                className="absolute top-3 right-3 w-8 h-8 rounded-[10px] hover:bg-black/10 transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
                  <path d="M15 5L5 15" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                  <path d="M5 5L15 15" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Rename Space Popup */}
      {showRenamePopup && selectedSpace && (
        <RenameSpacePopup
          currentName={selectedSpace.name}
          onConfirm={confirmRename}
          onCancel={() => {
            setShowRenamePopup(false);
            setSelectedSpace(null);
          }}
        />
      )}

      {/* Delete Space Popup */}
      {showDeletePopup && selectedSpace && (
        <DeleteSpacePopup
          spaceName={selectedSpace.name}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeletePopup(false);
            setSelectedSpace(null);
          }}
        />
      )}

      {/* Change Icon Popup */}
      {showChangeIconPopup && selectedSpace && (
        <ChangeIconPopup
          currentIcon={selectedSpace.icon}
          onConfirm={confirmChangeIcon}
          onCancel={() => {
            setShowChangeIconPopup(false);
            setSelectedSpace(null);
          }}
        />
      )}

      {/* View Options Popup */}
      {showViewOptions && (
        <ViewOptionsPopup
          currentDisplay={displayMethod}
          currentSort={sortMethod}
          onDisplayChange={setDisplayMethod}
          onSortChange={setSortMethod}
          onClose={() => setShowViewOptions(false)}
        />
      )}
    </div>
  );
}

export default StudySpaceSelectorScreen;
