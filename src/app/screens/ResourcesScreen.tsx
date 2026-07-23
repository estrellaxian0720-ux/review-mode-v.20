import { ArrowLeft, FileText, Presentation, BookOpen, Headphones, Link as LinkIcon, X, Plus, MoreVertical, Menu, LayoutDashboard, TrendingUp } from 'lucide-react';
import { useState } from 'react';

type Priority = 'exam-leak' | 'high-yield' | 'past-papers' | 'routine';

interface Resource {
  id: number;
  name: string;
  type: 'pdf' | 'ppt' | 'notes' | 'audio' | 'link';
  source: 'internal' | 'external';
  priority: Priority;
  lastUpdated?: string;
  size?: string;
  hasUnacknowledgedUpdate?: boolean;
}

interface ResourcesScreenProps {
  onBack: () => void;
  onNavigateToCollection?: () => void;
  onNavigateToDashboard?: () => void;
  onStartMockExam?: () => void;
  resources: Resource[];
  onAcknowledgeUpdate: (id: number) => void;
  onUpdatePriority: (id: number, priority: Priority) => void;
  onRemoveResource: (id: number) => void;
  hasResourceUpdates?: boolean;
}

export function ResourcesScreen({
  onBack,
  onNavigateToCollection,
  onNavigateToDashboard,
  onStartMockExam,
  resources,
  onAcknowledgeUpdate,
  onUpdatePriority,
  onRemoveResource,
  hasResourceUpdates
}: ResourcesScreenProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showPriorityModal, setShowPriorityModal] = useState<number | null>(null);
  const [showDeleteSpaceWarning, setShowDeleteSpaceWarning] = useState(false);
  const [pendingDeleteResourceId, setPendingDeleteResourceId] = useState<number | null>(null);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'ppt':
        return <Presentation className="w-5 h-5 text-orange-500" />;
      case 'notes':
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'audio':
        return <Headphones className="w-5 h-5 text-purple-500" />;
      case 'link':
        return <LinkIcon className="w-5 h-5 text-green-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'exam-leak':
        return { emoji: '🔴', label: 'Exam Leak', color: 'bg-red-50 text-red-700 border-red-200' };
      case 'high-yield':
        return { emoji: '🟠', label: 'High Yield', color: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'past-papers':
        return { emoji: '🟡', label: 'Past Papers', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
      case 'routine':
        return { emoji: '⚪', label: 'Routine', color: 'bg-gray-50 text-gray-700 border-gray-200' };
    }
  };

  const handleAddResources = () => {
    if (onNavigateToCollection) {
      onNavigateToCollection();
    }
  };

  const handleRemoveResourceClick = (resourceId: number) => {
    // Check if this is the last resource
    if (resources.length === 1) {
      setPendingDeleteResourceId(resourceId);
      setShowDeleteSpaceWarning(true);
    } else {
      onRemoveResource(resourceId);
    }
  };

  const handleConfirmDeleteSpace = () => {
    // In a real implementation, this would delete the entire space
    // For now, we just remove the resource
    if (pendingDeleteResourceId !== null) {
      onRemoveResource(pendingDeleteResourceId);
    }
    setShowDeleteSpaceWarning(false);
    setPendingDeleteResourceId(null);
  };

  const handleCancelDeleteSpace = () => {
    setShowDeleteSpaceWarning(false);
    setPendingDeleteResourceId(null);
  };

  return (
    <div className="h-full flex flex-col bg-[#F9FAFB]">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-white">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[24px] font-bold text-[#333] mb-1">Course Resources</h1>
              <p className="text-[14px] text-[#666]">Materials used to generate your study plan</p>
            </div>

            <button
              onClick={handleAddResources}
              className="flex items-center gap-2 bg-[#FDEA3B] text-[#333] px-6 py-3 rounded-lg font-semibold text-[14px] hover:bg-[#FDD835] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add More Resources
            </button>
          </div>
        </div>

        {/* Resource List */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-6">
            {resources.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-[#CCC] mx-auto mb-4" />
                <p className="text-[16px] text-[#666] mb-2">No resources added yet</p>
                <p className="text-[14px] text-[#999] max-w-md mx-auto">
                  Adding more materials helps the AI better predict exam focus.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Resource Rows */}
                {resources.map((resource) => {
                  const priorityBadge = getPriorityBadge(resource.priority);
                  
                  return (
                    <div
                      key={resource.id}
                      className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors group relative"
                    >
                      {/* File Icon */}
                      <div className="flex-shrink-0">
                        {getResourceIcon(resource.type)}
                      </div>

                      {/* Resource Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[15px] font-semibold text-[#333] mb-1 line-clamp-1">
                            {resource.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 text-[12px] text-[#999]">
                          {/* Priority Badge */}
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${priorityBadge.color}`}>
                            {priorityBadge.emoji} {priorityBadge.label}
                          </span>

                          {resource.lastUpdated && (
                            <>
                              <span className="text-[#CCC]">•</span>
                              <span>Updated {resource.lastUpdated}</span>
                            </>
                          )}
                          {resource.size && (
                            <>
                              <span className="text-[#CCC]">•</span>
                              <span>{resource.size}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Update Indicator Pill - Placed next to content */}
                      {resource.hasUnacknowledgedUpdate && (
                        <div className="flex-shrink-0 mr-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAcknowledgeUpdate(resource.id);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-[11px] font-bold transition-all border border-blue-100 hover:border-blue-200 shadow-sm active:scale-95"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                            Get Latest Version
                          </button>
                        </div>
                      )}

                      {/* Overflow Menu */}
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === resource.id ? null : resource.id)}
                            className="p-2 text-[#999] hover:text-[#666] hover:bg-gray-100 rounded-lg transition-all"
                            title="More options"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          {/* Dropdown Menu */}
                          {openMenuId === resource.id && (
                            <>
                              {/* Backdrop */}
                              <div 
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenuId(null)}
                              />
                              
                              {/* Menu */}
                              <div className="absolute right-0 top-full mt-1 w-[180px] bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                                <button
                                  onClick={() => {
                                    setShowPriorityModal(resource.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-[13px] text-[#666] hover:bg-gray-50 transition-colors"
                                >
                                  Change priority
                                </button>
                                <button
                                  onClick={() => handleRemoveResourceClick(resource.id)}
                                  className="w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  Remove from plan
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Quick Remove Button */}
                        <button
                          onClick={() => handleRemoveResourceClick(resource.id)}
                          className="p-2 text-[#999] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Remove resource"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Subtle Helper Text at Bottom */}
                {resources.length > 0 && resources.length < 10 && (
                  <div className="pt-6 pb-2">
                    <p className="text-[12px] text-[#999] text-center">
                      Adding more materials helps the AI better predict exam focus.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Delete Space Warning Modal */}
        {showDeleteSpaceWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={handleCancelDeleteSpace}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-[450px] z-10">
              <div className="mb-4">
                <h3 className="text-[18px] font-bold text-[#333] mb-2">删除最后一个资源</h3>
                <p className="text-[14px] text-[#666] leading-relaxed">
                  最少需要保留1本笔记。如果删除最后一本笔记,则会删除整个学习空间。
                </p>
                <p className="text-[14px] text-red-600 font-semibold mt-3">
                  是否删除空间?
                </p>
              </div>

              {/* Footer */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancelDeleteSpace}
                  className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  否
                </button>
                <button
                  onClick={handleConfirmDeleteSpace}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors"
                >
                  是
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Priority Change Modal */}
        {showPriorityModal !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowPriorityModal(null)}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-[400px] z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-[18px] font-bold text-[#333]">Change Priority</h3>
                  <p className="text-[13px] text-[#666] mt-1">
                    How important is this resource for exam prep?
                  </p>
                </div>
                <button
                  onClick={() => setShowPriorityModal(null)}
                  className="p-1 text-[#999] hover:text-[#666] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Priority Options */}
              <div className="space-y-2">
                {(['exam-leak', 'high-yield', 'past-papers', 'routine'] as Priority[]).map((priority) => {
                  const badge = getPriorityBadge(priority);
                  const currentResource = resources.find(r => r.id === showPriorityModal);
                  const isSelected = currentResource?.priority === priority;

                  return (
                    <button
                      key={priority}
                      onClick={() => {
                        onUpdatePriority(showPriorityModal, priority);
                        setShowPriorityModal(null);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-[#FDEA3B] bg-[#FFFEF0]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[20px]">{badge.emoji}</span>
                        <div>
                          <div className="text-[14px] font-semibold text-[#333]">{badge.label}</div>
                          <div className="text-[12px] text-[#666]">
                            {priority === 'exam-leak' && 'Professor hints, leaked topics, high-confidence predictions'}
                            {priority === 'high-yield' && 'Core concepts, frequently tested material'}
                            {priority === 'past-papers' && 'Previous exams, practice questions'}
                            {priority === 'routine' && 'General reference, background reading'}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowPriorityModal(null)}
                  className="px-4 py-2 text-[13px] font-medium text-[#666] hover:text-[#333] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResourcesScreen;