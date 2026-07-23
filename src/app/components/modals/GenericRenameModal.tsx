import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * 通用重命名Modal组件
 * 可用于重命名文件夹、笔记、学习空间等任何需要重命名的实体
 */

interface GenericRenameModalProps {
  /** Modal标题 */
  title: string;
  /** 输入框标签 */
  label: string;
  /** 输入框占位符 */
  placeholder: string;
  /** 当前名称（初始值） */
  currentName: string;
  /** 确认按钮文本 */
  confirmText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 确认回调 */
  onConfirm: (newName: string) => void;
  /** 取消回调 */
  onCancel: () => void;
  /** 自定义验证函数 */
  validate?: (name: string) => string | null; // 返回错误信息，null表示验证通过
}

export function GenericRenameModal({
  title,
  label,
  placeholder,
  currentName,
  confirmText = 'Rename',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  validate,
}: GenericRenameModalProps) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  const handleConfirm = () => {
    // 验证
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    // 自定义验证
    if (validate) {
      const validationError = validate(name.trim());
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    onConfirm(name.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[400px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null); // 清除错误提示
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              error
                ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
            }`}
            autoFocus
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}