import React from 'react';
import { 
  Folder, 
  Plus, 
  Mail,
  Settings,
  Crown,
  HelpCircle,
  ClipboardList,
  Filter,
  Cloud,
  ChevronRight,
  Trash2
} from 'lucide-react';

/**
 * 应用全局侧边栏
 * 在除全屏模式外的所有页面显示
 */

interface SidebarFolder {
  id: string;
  name: string;
  noteCount: number;
  icon?: React.ComponentType<{ className?: string }>;
}

interface AppSidebarProps {
  /** 是否折叠 */
  isCollapsed: boolean;
  /** 当前激活的导航项 */
  activeNav?: string;
  /** 导航项点击回调 */
  onNavClick?: (navId: string) => void;
  /** 文件夹点击回调 */
  onFolderClick?: (folderId: string) => void;
}

const DEFAULT_FOLDERS: SidebarFolder[] = [
  { id: 'all', name: 'All Notes', noteCount: 48, icon: Folder },
  { id: 'recent', name: 'Recent', noteCount: 12, icon: ClipboardList },
  { id: 'favorites', name: 'Favorites', noteCount: 8, icon: Crown },
  { id: 'archive', name: 'Archive', noteCount: 15, icon: Cloud },
  { id: 'trash', name: 'Trash', noteCount: 3, icon: Trash2 },
];

export function AppSidebar({ 
  isCollapsed, 
  activeNav = 'notes',
  onNavClick,
  onFolderClick 
}: AppSidebarProps) {
  if (isCollapsed) {
    return null; // 或者返回一个窄的折叠版本
  }

  return (
    <div className="w-[240px] h-full bg-[#F8F9FA] border-r border-gray-200 flex flex-col">
      {/* Top Section: User/Settings */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
            U
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-900">User</div>
            <div className="text-xs text-gray-500">user@example.com</div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white rounded-lg transition-colors" title="Inbox">
            <Mail className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-white rounded-lg transition-colors" title="Settings">
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-white rounded-lg transition-colors" title="Help">
            <HelpCircle className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Middle Section: Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Folders Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Folders
            </h3>
            <button 
              className="p-1 hover:bg-white rounded transition-colors"
              title="New Folder"
            >
              <Plus className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          <div className="space-y-1">
            {DEFAULT_FOLDERS.map((folder) => {
              const Icon = folder.icon || Folder;
              const isActive = activeNav === folder.id;
              
              return (
                <button
                  key={folder.id}
                  onClick={() => onFolderClick?.(folder.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-700 hover:bg-white'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-left text-sm font-medium truncate">
                    {folder.name}
                  </span>
                  <span className="text-xs text-gray-500">{folder.noteCount}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Tags
            </h3>
            <button 
              className="p-1 hover:bg-white rounded transition-colors"
              title="Manage Tags"
            >
              <Filter className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          <div className="space-y-1">
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-white transition-colors">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="flex-1 text-left text-sm">Math</span>
              <span className="text-xs text-gray-500">12</span>
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-white transition-colors">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="flex-1 text-left text-sm">Physics</span>
              <span className="text-xs text-gray-500">8</span>
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-white transition-colors">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="flex-1 text-left text-sm">Chemistry</span>
              <span className="text-xs text-gray-500">6</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Storage/Upgrade */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-4 text-white">
          <div className="flex items-start gap-2 mb-2">
            <Crown className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold mb-1">Upgrade to Pro</h4>
              <p className="text-xs opacity-90">Unlock unlimited storage and AI features</p>
            </div>
          </div>
          <button className="w-full mt-3 bg-white text-purple-600 text-sm font-semibold py-2 rounded-lg hover:bg-opacity-90 transition-colors">
            Upgrade Now
          </button>
        </div>
        
        {/* Storage Info */}
        <div className="mt-3 text-xs text-gray-600">
          <div className="flex items-center justify-between mb-1">
            <span>Storage</span>
            <span>2.4GB / 5GB</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: '48%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppSidebar;