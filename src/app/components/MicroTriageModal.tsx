import { X, ArrowRight, AlertCircle, TrendingUp, FileCheck, Folder } from 'lucide-react';
import { useState } from 'react';

interface Resource {
  id: string;
  title: string;
  type: string;
}

interface MicroTriageModalProps {
  resources: Resource[];
  onComplete: (resourcesWithPriority: any[]) => void;
  onCancel: () => void;
}

export function MicroTriageModal({ resources, onComplete, onCancel }: MicroTriageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [priorities, setPriorities] = useState<any[]>([]);

  const currentResource = resources[currentIndex];

  const handlePrioritySelect = (priority: string) => {
    const newPriorities = [...priorities, { ...currentResource, priority }];
    setPriorities(newPriorities);

    if (currentIndex < resources.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(newPriorities);
    }
  };

  const priorityOptions = [
    { 
      id: 'exam-leak', 
      label: 'Exam Leak', 
      emoji: '🔴', 
      desc: 'Final review & recent',
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50 hover:bg-red-100 border-red-200'
    },
    { 
      id: 'high-yield', 
      label: 'High Yield', 
      emoji: '🟠', 
      desc: 'Core concepts',
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50 hover:bg-orange-100 border-orange-200'
    },
    { 
      id: 'past-paper', 
      label: 'Past Paper', 
      emoji: '🟡', 
      desc: 'Previous exams',
      icon: FileCheck,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200'
    },
    { 
      id: 'routine', 
      label: 'Routine', 
      emoji: '⚪', 
      desc: 'Supplementary',
      icon: Folder,
      color: 'text-gray-600',
      bg: 'bg-gray-50 hover:bg-gray-100 border-gray-200'
    },
  ];

  if (!currentResource) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[500px] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-500">
            Resource {currentIndex + 1} of {resources.length}
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2 truncate px-4">
            {currentResource.title}
          </h3>
          <p className="text-sm text-gray-500 mb-8">
            How important is this resource for your prep?
          </p>

          <div className="grid grid-cols-2 gap-3">
            {priorityOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handlePrioritySelect(option.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${option.bg}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{option.emoji}</span>
                  <span className={`font-bold ${option.color}`}>{option.label}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium ml-8">
                  {option.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MicroTriageModal;