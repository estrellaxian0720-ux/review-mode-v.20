import { X, Grid3x3, List, Clock, Calendar, ArrowDownAZ } from 'lucide-react';

export type DisplayMethod = 'grid' | 'list';
export type SortMethod = 'latest' | 'created' | 'name';

interface ViewOptionsPopupProps {
  currentDisplay: DisplayMethod;
  currentSort: SortMethod;
  onDisplayChange: (method: DisplayMethod) => void;
  onSortChange: (method: SortMethod) => void;
  onClose: () => void;
}

export function ViewOptionsPopup({ 
  currentDisplay, 
  currentSort, 
  onDisplayChange, 
  onSortChange, 
  onClose 
}: ViewOptionsPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-[420px] w-full mx-4">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-[#333]">
              View Options
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-[#666] hover:text-[#333] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-6">
          {/* Display Method */}
          <div>
            <label className="block text-[14px] font-semibold text-[#333] mb-3">
              Display Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onDisplayChange('grid')}
                className={`px-4 py-3 rounded-lg text-[14px] font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                  currentDisplay === 'grid'
                    ? 'border-[#2D8CFF] bg-[#2D8CFF]/10 text-[#2D8CFF]'
                    : 'border-gray-200 bg-white text-[#666] hover:border-gray-300'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
                Grid
              </button>
              <button
                onClick={() => onDisplayChange('list')}
                className={`px-4 py-3 rounded-lg text-[14px] font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                  currentDisplay === 'list'
                    ? 'border-[#2D8CFF] bg-[#2D8CFF]/10 text-[#2D8CFF]'
                    : 'border-gray-200 bg-white text-[#666] hover:border-gray-300'
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[14px] font-semibold text-[#333] mb-3">
              Sort By
            </label>
            <div className="space-y-2">
              <button
                onClick={() => onSortChange('latest')}
                className={`w-full px-4 py-3 rounded-lg text-[14px] font-semibold border-2 transition-all flex items-center gap-3 ${
                  currentSort === 'latest'
                    ? 'border-[#2D8CFF] bg-[#2D8CFF]/10 text-[#2D8CFF]'
                    : 'border-gray-200 bg-white text-[#666] hover:border-gray-300'
                }`}
              >
                <Clock className="w-4 h-4" />
                Latest Update
              </button>
              <button
                onClick={() => onSortChange('created')}
                className={`w-full px-4 py-3 rounded-lg text-[14px] font-semibold border-2 transition-all flex items-center gap-3 ${
                  currentSort === 'created'
                    ? 'border-[#2D8CFF] bg-[#2D8CFF]/10 text-[#2D8CFF]'
                    : 'border-gray-200 bg-white text-[#666] hover:border-gray-300'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Create Time
              </button>
              <button
                onClick={() => onSortChange('name')}
                className={`w-full px-4 py-3 rounded-lg text-[14px] font-semibold border-2 transition-all flex items-center gap-3 ${
                  currentSort === 'name'
                    ? 'border-[#2D8CFF] bg-[#2D8CFF]/10 text-[#2D8CFF]'
                    : 'border-gray-200 bg-white text-[#666] hover:border-gray-300'
                }`}
              >
                <ArrowDownAZ className="w-4 h-4" />
                Name (A-Z)
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 py-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-[#2D8CFF] text-white rounded-lg text-[14px] font-bold hover:bg-[#1D7CEF] transition-all"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}