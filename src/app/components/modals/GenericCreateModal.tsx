import React, { useState } from 'react';
import { X } from 'lucide-react';

/**
 * 通用创建Modal组件
 * 可用于创建文件夹、笔记、学习空间等任何需要创建的实体
 */

export interface CreateFormField {
  /** 字段名称（用于数据key） */
  name: string;
  /** 字段标签 */
  label: string;
  /** 输入类型 */
  type: 'text' | 'textarea' | 'select' | 'number';
  /** 占位符 */
  placeholder?: string;
  /** 是否必填 */
  required?: boolean;
  /** 默认值 */
  defaultValue?: string | number;
  /** 选项（仅type='select'时使用） */
  options?: Array<{ value: string; label: string }>;
  /** 自定义验证 */
  validate?: (value: any) => string | null;
}

interface GenericCreateModalProps {
  /** Modal标题 */
  title: string;
  /** 表单字段配置 */
  fields: CreateFormField[];
  /** 确认按钮文本 */
  confirmText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 确认回调 */
  onConfirm: (data: Record<string, any>) => void;
  /** 取消回调 */
  onCancel: () => void;
}

export function GenericCreateModal({
  title,
  fields,
  confirmText = 'Create',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: GenericCreateModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach(field => {
      initial[field.name] = field.defaultValue ?? '';
    });
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    // 清除该字段的错误
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const value = formData[field.name];

      // 必填验证
      if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
        newErrors[field.name] = `${field.label} is required`;
        return;
      }

      // 自定义验证
      if (field.validate && value) {
        const error = field.validate(value);
        if (error) {
          newErrors[field.name] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validate()) {
      onConfirm(formData);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const renderField = (field: CreateFormField) => {
    const value = formData[field.name];
    const error = errors[field.name];

    const commonClasses = `w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
      error
        ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
    }`;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={`${commonClasses} min-h-[100px] resize-none`}
            rows={4}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={commonClasses}
          >
            <option value="">{field.placeholder || 'Select...'}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(field.name, parseFloat(e.target.value) || '')}
            placeholder={field.placeholder}
            className={commonClasses}
          />
        );

      case 'text':
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={field.placeholder}
            className={commonClasses}
            autoFocus={fields[0].name === field.name}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[480px] max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          <div className="space-y-4">
            {fields.map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
                {errors[field.name] && (
                  <p className="mt-1.5 text-sm text-red-600">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
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