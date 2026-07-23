{
  "surface": "fullscreen",
  "trigger": "daily_20_wrong",
  "conceptId": "ch1s7-c-shouhui-jisui",
  "conceptName": "受贿罪的既遂标准",
  "dailyConsecutiveWrongCount": 6,
  "dailyTotalWrongCount": 20,
  "forcedEntryActions": [
    { "id": "skip", "label": "先跳过", "completionReason": "MAX_DAILY_WRONG_SKIPPED" },
    { "id": "learn", "label": "开始强化学习", "completionReason": "MAX_DAILY_WRONG_TUTOR_PASS" }
  ],
  "entryFlashcardActionSample": {
    "afterFlip": true,
    "actions": ["下一题", "跳过该知识点", "深度学习"],
    "deepLearningTrigger": "flashcard_deep_learning"
  },
  "threeWrongPromptSample": {
    "trigger": "daily_3_consecutive_wrong",
    "text": "这个知识点已经连续错了3次，要不要找 AI Tutor 帮帮你？",
    "actions": ["给我讲解这个知识点", "暂时不需要"],
    "surface": "panel",
    "blocking": false
  },
  "messages": [
    {
      "role": "user",
      "blocks": [
        { "type": "markdown", "md": "受贿罪到底什么时候算既遂？我老是和未遂搞混。" }
      ]
    },
    {
      "role": "assistant",
      "aiGenerated": true,
      "blocks": [
        {
          "type": "markdown",
          "md": "好的，我们一步步来。**受贿罪的既遂标准**核心只有一句话：国家工作人员**实际取得对财物的控制**，就既遂了——不要求把钱花掉，也不要求办成事。"
        },
        {
          "type": "diagram",
          "kind": "compare",
          "data": {
            "title": "既遂 vs 未遂",
            "columns": ["受贿既遂", "受贿未遂"],
            "rows": [
              { "label": "判断标准", "cells": ["实际控制财物", "因意志以外原因未能控制"] },
              { "label": "是否需办成事", "cells": ["不需要", "不需要"] },
              { "label": "典型情形", "cells": ["收款入卡 / 收存折并掌握密码", "钱在途中被截获 / 当场拒收上交"] }
            ]
          }
        },
        {
          "type": "markdown",
          "md": "我出一道题确认你掌握了 👇"
        },
        {
          "type": "quiz",
          "kind": "choice",
          "conceptId": "ch1s7-c-shouhui-jisui",
          "stem": "甲收受请托人 50 万元转账支票，尚未到银行提取现金即案发。关于既遂认定，正确的是？",
          "options": [
            { "key": "A", "text": "未遂，因为现金尚未提取" },
            { "key": "B", "text": "既遂，取得支票即已控制财物" },
            { "key": "C", "text": "未遂，因为请托事项尚未办成" },
            { "key": "D", "text": "不构成受贿罪" }
          ],
          "answer": "B",
          "userAnswer": "A",
          "explanation": "收受转账支票，行为人已取得对财物的控制力，是否提现不影响既遂认定；是否办成请托事项也与既遂无关。故选 B。",
          "traceback": { "conceptId": "ch1s7-c-shouhui-jisui", "label": "Traceback 看来源" }
        },
        {
          "type": "image",
          "src": "asset://textbook/shouhui-jisui-flow.png",
          "source": "asset",
          "caption": "受贿罪既遂认定流程（教材原图）",
          "ref": { "book": "刑法分论讲义", "page": 142 }
        },
        {
          "type": "markdown",
          "md": "这张是教材里的认定流程图，配合上面的对比一起记。还想再练一道吗？"
        }
      ]
    },
    {
      "role": "user",
      "blocks": [
        { "type": "markdown", "md": "再帮我理一下受贿罪整体怎么构成，最好有张图。" }
      ]
    },
    {
      "role": "assistant",
      "aiGenerated": true,
      "blocks": [
        {
          "type": "markdown",
          "md": "没问题。受贿罪和其他犯罪一样，按**四要件**拆解最清楚，先看这张体系树："
        },
        {
          "type": "diagram",
          "kind": "tree",
          "data": {
            "title": "受贿罪构成要件",
            "root": "受贿罪",
            "children": [
              { "label": "主体", "children": [ { "label": "国家工作人员（身份犯）" } ] },
              { "label": "主观方面", "children": [ { "label": "直接故意" }, { "label": "为他人谋取利益的认识" } ] },
              { "label": "客体", "children": [ { "label": "职务行为的廉洁性" } ] },
              { "label": "客观方面", "children": [ { "label": "利用职务便利" }, { "label": "收受 / 索取财物" } ] }
            ]
          }
        },
        {
          "type": "markdown",
          "md": "其中「利用职务便利」是最容易考的点，做成一张闪卡帮你随手翻："
        },
        {
          "type": "flashcard",
          "conceptId": "ch1s7-c-zhiwu-bianli",
          "front": "受贿罪中「利用职务便利」具体指什么？",
          "back": "指利用本人职务范围内的权力，或利用职务、地位形成的便利条件，通过第三人职务行为为请托人谋利（后者即斡旋型）。不含单纯的亲友关系、私人影响力。"
        },
        {
          "type": "markdown",
          "md": "判断一下，确认你分清了 👇"
        },
        {
          "type": "quiz",
          "kind": "judgment",
          "conceptId": "ch1s7-c-zhiwu-bianli",
          "stem": "国家工作人员仅凭私人感情、未利用任何职务便利为他人办事并收受财物的，构成受贿罪。",
          "options": [
            { "key": "T", "text": "正确" },
            { "key": "F", "text": "错误" }
          ],
          "answer": "F",
          "userAnswer": "F",
          "explanation": "受贿罪以「利用职务便利」为必备客观要件。纯凭私人感情、未利用职务便利的，缺少该要件，不构成受贿罪。故判断为「错误」。",
          "traceback": { "conceptId": "ch1s7-c-zhiwu-bianli", "label": "Traceback 看来源" }
        },
        {
          "type": "markdown",
          "md": "本地教材没有现成的认定步骤图，我按通说帮你画了一张流程示意，**仅供理解、以教材为准**："
        },
        {
          "type": "image",
          "src": "aigen://shouhui-flow-sketch.png",
          "source": "ai_gen",
          "caption": "受贿罪认定四步流程（AI 生成示意）",
          "disclaimer": "仅供理解，以教材为准"
        },
        {
          "type": "diagram",
          "kind": "flow",
          "data": {
            "title": "受贿罪认定步骤",
            "steps": [
              { "id": "s1", "text": "是否为国家工作人员？" },
              { "id": "s2", "text": "是否利用职务便利？" },
              { "id": "s3", "text": "是否收受 / 索取财物？" },
              { "id": "s4", "text": "是否实际控制财物（既遂）？" }
            ],
            "edges": [
              { "from": "s1", "to": "s2" },
              { "from": "s2", "to": "s3" },
              { "from": "s3", "to": "s4" }
            ]
          }
        },
        {
          "type": "markdown",
          "md": "想看真实判例怎么说，我也找到一份公开裁判文书可以对照："
        },
        {
          "type": "image",
          "src": "https://example.com/cases/shouhui-jisui-judgment.png",
          "source": "web",
          "caption": "受贿既遂认定参考判例（网络来源）",
          "ref": { "site": "中国裁判文书网", "url": "https://example.com/cases/shouhui-jisui-judgment" }
        }
      ]
    }
  ],
  "exitQuiz": {
    "note": "当日累计错20次强干预：完成强化小测后当天mastery=100、进入D+1；也可选择先跳过并以MAX_DAILY_WRONG_SKIPPED收口",
    "items": [
      {
        "conceptId": "ch1s7-c-shouhui-jisui",
        "stem": "国家工作人员收受存折并掌握密码，但未取款。受贿罪是否既遂？",
        "options": [
          { "key": "A", "text": "既遂" },
          { "key": "B", "text": "未遂" }
        ],
        "answer": "A"
      },
      {
        "conceptId": "ch1s7-c-shouhui-jisui",
        "stem": "受贿既遂是否要求请托事项已经办成？",
        "options": [
          { "key": "A", "text": "要求办成" },
          { "key": "B", "text": "不要求办成" }
        ],
        "answer": "B"
      }
    ]
  },
  "sourceBadgeSamples": [
    { "source": "asset", "label": "教材原图", "color": "#00A63E" },
    { "source": "web", "label": "网络 · 中国裁判文书网", "color": "#2D8CFF", "url": "https://example.com" },
    { "source": "ai_gen", "label": "AI 生成", "color": "#8E99B0", "disclaimer": "仅供理解，以教材为准" }
  ],
  "floatingDowngradeSample": {
    "note": "悬浮窗形态下，quiz 降级成这一行摘要卡",
    "summary": "为你准备了 1 道练习题",
    "cta": "去练习"
  }
}