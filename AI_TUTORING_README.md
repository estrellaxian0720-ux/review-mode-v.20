# AI 辅导对话功能

这是一个完整的AI辅导对话系统，支持富文本对话、多种内嵌内容块和三种展示形态。

## 功能特点

### 三种展示形态
1. **全屏模式 (fullscreen)** - 适用于深度学习和强制干预场景
2. **面板模式 (panel)** - 右侧面板，可与练习题同屏显示
3. **浮窗模式 (floating)** - 悬浮窗形式，quiz和flashcard降级为摘要卡

### 六种内嵌内容块
1. **Markdown** - 文字讲解，支持粗体、换行等格式
2. **Quiz 测试题** - 支持选择题和判断题，带答题反馈和解析
3. **Flashcard 闪卡** - 可翻面的卡片，显示正面问题和背面答案
4. **Diagram 图表** - 三种类型：
   - Compare 对比表
   - Tree 体系树
   - Flow 流程图
5. **Image 图片** - 三种来源标识：
   - 教材原图（绿色徽标）
   - 网络来源（蓝色徽标）
   - AI生成（灰色徽标）
6. **Video 视频** - 视频内容（带加载状态）

### 三种触发入口
1. **闪卡后主动深度学习** (`flashcard_deep_learning`)
   - 用户点击"深度学习"按钮触发
   - 可随时关闭

2. **连续错3次轻提示** (`daily_3_consecutive_wrong`)
   - 在右侧面板显示引导提示
   - 不阻断练习流程

3. **累计错20次强干预** (`daily_20_wrong`)
   - 全屏显示强制选择界面
   - 提供"先跳过"或"开始强化学习"两个选项

## 文件结构

```
src/app/
├── types/
│   └── tutoring.ts                    # 类型定义
├── components/tutoring/
│   ├── index.ts                       # 导出文件
│   ├── TutoringChat.tsx              # 主聊天组件
│   ├── MessageBubble.tsx             # 消息气泡组件
│   ├── MarkdownContent.tsx           # Markdown渲染
│   ├── QuizBlock.tsx                 # 测试题组件
│   ├── FlashcardBlock.tsx            # 闪卡组件
│   ├── DiagramBlock.tsx              # 图表组件
│   └── ImageBlock.tsx                # 图片组件
└── screens/
    └── TutoringDemoScreen.tsx        # 演示页面

src/imports/pasted_text/
└── bribery-tutoring-session.json     # 演示数据
```

## 使用方法

### 查看演示

1. 打开 `/src/main.tsx`
2. 确保 `SHOW_TUTORING_DEMO` 设置为 `true`
3. 运行项目即可看到演示界面

```tsx
const SHOW_TUTORING_DEMO = true; // 设置为 true 查看演示
```

### 在项目中使用

```tsx
import { TutoringChat } from './components/tutoring';
import { TutoringSession } from './types/tutoring';

// 创建会话数据
const session: TutoringSession = {
  surface: 'fullscreen', // 或 'panel', 'floating'
  trigger: 'daily_20_wrong',
  conceptId: 'concept-123',
  conceptName: '概念名称',
  dailyConsecutiveWrongCount: 3,
  dailyTotalWrongCount: 20,
  messages: [
    {
      role: 'user',
      blocks: [
        { type: 'markdown', md: '用户的问题' }
      ]
    },
    {
      role: 'assistant',
      aiGenerated: true,
      blocks: [
        { type: 'markdown', md: 'AI的回答' },
        {
          type: 'quiz',
          kind: 'choice',
          conceptId: 'concept-123',
          stem: '题干',
          options: [
            { key: 'A', text: '选项A' },
            { key: 'B', text: '选项B' }
          ],
          answer: 'B',
          explanation: '解析内容'
        }
      ]
    }
  ]
};

// 使用组件
<TutoringChat
  session={session}
  onClose={() => console.log('关闭')}
  onAction={(actionId) => console.log('操作', actionId)}
/>
```

## 设计原则

1. **对话而非文档** - 气泡式聊天界面，不是课件或PPT
2. **类型名不可见** - 不显示"BLOCK"、"TYPE"等技术术语
3. **语义化反馈** - 答对显示绿色，答错显示红色，进行中显示蓝色
4. **来源透明** - 所有图片和视频必须标注来源
5. **AI生成声明** - AI生成内容底部显示免责声明

## 颜色规范

- **正确色**: `#00A63E` (绿色)
- **错误色**: `#FF6252` (红色)
- **进行中**: `#2D8CFF` (蓝色)
- **教材来源**: `#00A63E` (绿色徽标)
- **网络来源**: `#2D8CFF` (蓝色徽标)
- **AI生成**: `#8E99B0` (灰色徽标)

## 演示数据

演示数据展示了一个完整的"受贿罪既遂标准"学习场景，包含：
- 2个用户提问
- 2个AI回复
- 1道选择题（答错态）
- 1道判断题（答对态）
- 1个对比表
- 1个体系树
- 1个流程图
- 1张闪卡
- 3张图片（三种来源各一）

## 依赖

- `motion` - 动画效果
- `lucide-react` - 图标库
- `@radix-ui/*` - UI组件基础
- `tailwindcss` - 样式框架
