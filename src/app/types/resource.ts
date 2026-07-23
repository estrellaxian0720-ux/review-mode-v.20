/**
 * Resource Management Types
 * 资源管理相关类型定义
 */

/**
 * 资源类型
 */
export type ResourceType = 
  | 'notes'
  | 'pdf'
  | 'ppt'
  | 'audio'
  | 'video'
  | 'link';

/**
 * 资源来源
 */
export type ResourceSource = 
  | 'internal'  // 内部创建
  | 'external'; // 外部导入

/**
 * 资源优先级
 */
export type ResourcePriority = 
  | 'exam-leak'      // 考试重点
  | 'high-yield'     // 高产出
  | 'past-papers'    // 往年试题
  | 'basic'          // 基础内容
  | 'supplementary'  // 补充材料
  | 'routine';       // 常规内容

/**
 * 资源数据模型
 * 统一字段命名规范
 */
export interface Resource {
  /** 资源唯一标识 */
  id: string;
  
  /** 资源标题 */
  title: string;
  
  /** 资源类型 */
  type: ResourceType;
  
  /** 资源来源 */
  source: ResourceSource;
  
  /** 优先级 */
  priority: ResourcePriority;
  
  /** 最后更新时间 (ISO 8601 格式) */
  lastUpdated: string;
  
  /** 文件大小（可选，仅外部文件） */
  size?: string;
  
  /** 是否有未确认的更新 */
  hasUpdate: boolean;
}

/**
 * 资源待分类项（用于Micro Triage）
 */
export interface ResourceForTriage {
  id: string;
  title: string;
  type: ResourceType;
}