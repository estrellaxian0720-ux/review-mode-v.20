/**
 * Notes Management Types
 * 笔记管理相关类型定义
 */

/**
 * 笔记类型
 */
export type NoteType = 
  | 'text'        // 纯文本
  | 'markdown'    // Markdown
  | 'handwritten' // 手写
  | 'mixed';      // 混合

/**
 * 笔记数据模型
 */
export interface Note {
  /** 笔记ID */
  id: string;
  
  /** 笔记标题 */
  title: string;
  
  /** 笔记内容 */
  content: string;
  
  /** 笔记类型 */
  type: NoteType;
  
  /** 所属文件夹ID */
  folderId?: string;
  
  /** 创建时间 */
  createdAt: string;
  
  /** 最后修改时间 */
  updatedAt: string;
  
  /** 标签 */
  tags?: string[];
  
  /** 是否收藏 */
  isFavorite?: boolean;
  
  /** 颜色标记 */
  color?: string;
}

/**
 * 文件夹数据模型
 */
export interface Folder {
  /** 文件夹ID */
  id: string;
  
  /** 文件夹名称 */
  name: string;
  
  /** 父文件夹ID（用于嵌套） */
  parentId?: string;
  
  /** 创建时间 */
  createdAt: string;
  
  /** 笔记数量 */
  noteCount?: number;
  
  /** 颜色标记 */
  color?: string;
}

/**
 * 笔记显示方式
 */
export type NoteDisplayMethod = 
  | 'grid'   // 网格
  | 'list'   // 列表
  | 'kanban';// 看板

/**
 * 笔记排序方式
 */
export type NoteSortMethod = 
  | 'created-desc'    // 创建时间降序
  | 'created-asc'     // 创建时间升序
  | 'updated-desc'    // 修改时间降序
  | 'updated-asc'     // 修改时间升序
  | 'title-asc'       // 标题升序
  | 'title-desc';     // 标题降序

/**
 * 编辑工具类型
 */
export type EditorTool = 
  | 'pen'         // 画笔
  | 'highlighter' // 荧光笔
  | 'eraser'      // 橡皮擦
  | 'text'        // 文字
  | 'shape'       // 形状
  | 'image'       // 图片
  | 'voice';      // 语音

/**
 * 笔记编辑器配置
 */
export interface EditorConfig {
  /** 当前工具 */
  activeTool: EditorTool;
  
  /** 画笔颜色 */
  penColor: string;
  
  /** 画笔粗细 */
  penWidth: number;
  
  /** 荧光笔颜色 */
  highlightColor: string;
  
  /** 橡皮擦大小 */
  eraserSize: number;
  
  /** 字体大小 */
  fontSize: number;
  
  /** 字体颜色 */
  textColor: string;
}