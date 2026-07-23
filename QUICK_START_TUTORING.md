# AI 辅导功能快速开始

## 5分钟快速上手

### 1. 查看演示 (最简单)

打开 `/src/main.tsx`，确保演示模式开启：

```tsx
const SHOW_TUTORING_DEMO = true;
```

然后运行项目：

```bash
npm run dev
# 或
pnpm dev
```

现在你应该能看到完整的AI辅导演示界面！

### 2. 切换回正常应用

如果想回到原应用，只需要：

```tsx
const SHOW_TUTORING_DEMO = false;
```

### 3. 三种展示模式

演示界面顶部有三个标签：

- **全屏模式** - 点击"打开全屏对话"按钮查看
- **面板模式** - 直接显示在右侧面板
- **浮窗模式** - 点击"打开浮窗对话"按钮查看

### 4. 包含的演示内容

你会看到一个完整的"受贿罪既遂标准"学习对话，包含：

✅ **2个用户提问**
- "受贿罪到底什么时候算既遂？"
- "再帮我理一下受贿罪整体怎么构成"

✅ **2个AI详细回复**，包含：
- 文字讲解（带粗体格式）
- 对比表（既遂 vs 未遂）
- 体系树（四要件结构）
- 流程图（认定步骤）
- 选择题（演示答错态，红色反馈）
- 判断题（演示答对态，绿色反馈）
- 闪卡（可点击翻面）
- 3种来源的图片（教材、网络、AI生成）

### 5. 交互测试

#### 测试选择题
1. 找到第一个AI回复中的选择题
2. 查看已选择的错误答案（A）
3. 观察红色反馈和解析卡

#### 测试判断题
1. 找到第二个AI回复中的判断题
2. 查看已选择的正确答案（错误）
3. 观察绿色反馈

#### 测试闪卡
1. 找到闪卡组件
2. 点击翻面按钮
3. 观察正面/背面切换动画

#### 测试输入
1. 在底部输入框输入问题
2. 点击发送或按Enter
3. 观察AI模拟回复（1秒后出现）

#### 测试快捷提示
1. 点击输入框上方的快捷按钮
2. 观察文字自动填充到输入框

### 6. 强制选择界面

在全屏模式下，如果是"20错触发"，你会首先看到：

- 一个警告图标
- "需要加强这个知识点"标题
- 错误次数说明
- 两个按钮：
  - "先跳过" - 关闭对话
  - "开始强化学习" - 显示AI对话内容

点击"开始强化学习"即可查看完整对话。

### 7. 暗色模式

组件已适配暗色模式！如果你的系统使用暗色主题，界面会自动调整：

- 背景色: `#1E1E1E`
- 卡片背景: `#2A2A2A`
- 边框: `#3A3A3A`
- 文字: `#E8E8E8`

### 8. 颜色说明

- 🟢 **绿色 (#00A63E)** - 正确答案、教材来源
- 🔴 **红色 (#FF6252)** - 错误答案
- 🔵 **蓝色 (#2D8CFF)** - 进行中状态、网络来源
- ⚪ **灰色 (#8E99B0)** - AI生成内容

### 9. 在自己的代码中使用

```tsx
import { TutoringChat } from './components/tutoring';

// 最简单的使用
<TutoringChat
  session={{
    surface: 'fullscreen',
    trigger: 'flashcard_deep_learning',
    conceptId: 'my-concept',
    conceptName: '我的知识点',
    dailyConsecutiveWrongCount: 0,
    dailyTotalWrongCount: 0,
    messages: [
      {
        role: 'user',
        blocks: [{ type: 'markdown', md: '请解释这个概念' }]
      },
      {
        role: 'assistant',
        aiGenerated: true,
        blocks: [{ type: 'markdown', md: '这个概念是...' }]
      }
    ]
  }}
  onClose={() => console.log('关闭')}
/>
```

### 10. 故障排查

#### 问题：看不到演示界面
**解决**：检查 `/src/main.tsx` 中 `SHOW_TUTORING_DEMO` 是否为 `true`

#### 问题：样式不正确
**解决**：确保 Tailwind CSS 正确配置，运行 `npm run dev` 重启开发服务器

#### 问题：图片无法加载
**解决**：图片使用的是Unsplash占位图，需要网络连接

#### 问题：TypeScript 错误
**解决**：运行 `npm install` 确保所有依赖已安装

### 11. 下一步

- 📖 阅读 `AI_TUTORING_README.md` 了解详细功能
- 📝 查看 `CHANGELOG_TUTORING.md` 了解技术细节
- 💻 修改 `/src/app/components/tutoring/SimpleTutoringTest.tsx` 自定义演示数据
- 🎨 调整颜色和样式以匹配你的品牌

### 12. 需要帮助？

查看这些文件：
- `AI_TUTORING_README.md` - 完整文档
- `CHANGELOG_TUTORING.md` - 更新日志
- `/src/app/types/tutoring.ts` - 类型定义
- `/src/app/components/tutoring/` - 组件源码

---

**享受使用AI辅导功能！** 🎉
