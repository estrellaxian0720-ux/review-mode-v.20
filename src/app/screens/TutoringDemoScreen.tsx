import React, { useState } from 'react';
import { TutoringChat } from '../components/tutoring/TutoringChat';
import { TutoringSession, TutoringSurface } from '../types/tutoring';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

// 加载演示数据
import demoSessionData from '../../imports/pasted_text/bribery-tutoring-session.json';

export function TutoringDemoScreen() {
  const [activeSurface, setActiveSurface] = useState<TutoringSurface>('fullscreen');
  const [showChat, setShowChat] = useState(false);

  // 解析 JSON 数据
  const demoSession: TutoringSession = JSON.parse(
    demoSessionData[0].text
  ) as TutoringSession;

  // 创建不同 surface 的会话
  const getSessionForSurface = (surface: TutoringSurface): TutoringSession => {
    return {
      ...demoSession,
      surface,
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1E1E1E]">
      {/* 控制面板 */}
      <div className="bg-white dark:bg-[#2A2A2A] border-b border-[#EFEFEF] dark:border-[#3A3A3A] p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-semibold text-[#333] dark:text-[#E8E8E8] mb-4">
            AI 辅导对话演示
          </h1>
          <p className="text-sm text-[#666] dark:text-[#999] mb-6">
            展示富对话界面的三种形态：全屏、面板、浮窗。包含 6 种内嵌样式：选择题、判断题、闪卡、图表（对比表/体系树/流程图）、图片引用
          </p>

          <Tabs value={activeSurface} onValueChange={(v) => setActiveSurface(v as TutoringSurface)}>
            <TabsList>
              <TabsTrigger value="fullscreen">全屏模式</TabsTrigger>
              <TabsTrigger value="panel">面板模式</TabsTrigger>
              <TabsTrigger value="floating">浮窗模式</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="fullscreen">
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-[#1a2332] border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                    <h3 className="font-medium text-[#333] dark:text-[#E8E8E8] mb-2">
                      全屏模式特点
                    </h3>
                    <ul className="text-sm text-[#666] dark:text-[#999] space-y-1 list-disc list-inside">
                      <li>适用于深度学习和强制干预场景</li>
                      <li>单列居中布局，最大宽度 720px</li>
                      <li>支持所有内嵌内容块类型</li>
                      <li>20错触发时显示强制选择界面</li>
                    </ul>
                  </div>
                  <Button onClick={() => setShowChat(true)}>
                    打开全屏对话
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="panel">
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-[#1a2332] border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                    <h3 className="font-medium text-[#333] dark:text-[#E8E8E8] mb-2">
                      面板模式特点
                    </h3>
                    <ul className="text-sm text-[#666] dark:text-[#999] space-y-1 list-disc list-inside">
                      <li>右侧面板形式，约占 40% 宽度</li>
                      <li>可与练习题同屏显示</li>
                      <li>连续错3次触发时自动发送讲解请求</li>
                      <li>支持边练边问</li>
                    </ul>
                  </div>
                  <div className="grid grid-cols-[60%,40%] gap-4 h-[600px] border border-[#EFEFEF] dark:border-[#3A3A3A] rounded-lg overflow-hidden">
                    <div className="bg-white dark:bg-[#2A2A2A] p-6 flex items-center justify-center text-[#999]">
                      左侧练习题区域
                    </div>
                    <div className="border-l border-[#EFEFEF] dark:border-[#3A3A3A]">
                      <TutoringChat
                        session={getSessionForSurface('panel')}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="floating">
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-[#1a2332] border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                    <h3 className="font-medium text-[#333] dark:text-[#E8E8E8] mb-2">
                      浮窗模式特点
                    </h3>
                    <ul className="text-sm text-[#666] dark:text-[#999] space-y-1 list-disc list-inside">
                      <li>悬浮窗形式，可拖动和缩放</li>
                      <li>宽度约 384px，高度约 500px</li>
                      <li>Quiz 和 Flashcard 降级为摘要卡</li>
                      <li>适合对照看源、随手提问</li>
                    </ul>
                  </div>
                  <Button onClick={() => setShowChat(true)}>
                    打开浮窗对话
                  </Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* 全屏对话 */}
      {showChat && activeSurface === 'fullscreen' && (
        <TutoringChat
          session={getSessionForSurface('fullscreen')}
          onClose={() => setShowChat(false)}
          onAction={(actionId) => {
            console.log('Action:', actionId);
            if (actionId === 'skip') {
              setShowChat(false);
            }
          }}
        />
      )}

      {/* 浮窗对话 */}
      {showChat && activeSurface === 'floating' && (
        <div className="fixed bottom-6 right-6 z-50">
          <TutoringChat
            session={getSessionForSurface('floating')}
            onClose={() => setShowChat(false)}
          />
        </div>
      )}

      {/* 演示内容说明 */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white dark:bg-[#2A2A2A] rounded-lg border border-[#EFEFEF] dark:border-[#3A3A3A] p-6">
          <h2 className="text-lg font-medium text-[#333] dark:text-[#E8E8E8] mb-4">
            演示数据说明
          </h2>
          <div className="space-y-3 text-sm text-[#666] dark:text-[#999]">
            <div>
              <strong className="text-[#333] dark:text-[#E8E8E8]">知识点：</strong>
              {demoSession.conceptName}（{demoSession.conceptId}）
            </div>
            <div>
              <strong className="text-[#333] dark:text-[#E8E8E8]">触发条件：</strong>
              当日累计错误 {demoSession.dailyTotalWrongCount} 次，连续错误 {demoSession.dailyConsecutiveWrongCount} 次
            </div>
            <div>
              <strong className="text-[#333] dark:text-[#E8E8E8]">包含内容块：</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>选择题（答错态）- 展示红色反馈和解析</li>
                <li>判断题（答对态）- 展示绿色反馈</li>
                <li>对比表图表 - 既遂 vs 未遂</li>
                <li>体系树图表 - 受贿罪构成要件</li>
                <li>流程图 - 受贿罪认定步骤</li>
                <li>闪卡 - 职务便利概念</li>
                <li>教材原图（绿色徽标）、AI生成图片（灰色徽标）、网络来源图片（蓝色徽标）</li>
              </ul>
            </div>
            <div>
              <strong className="text-[#333] dark:text-[#E8E8E8]">三种触发入口：</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>入口1：闪卡后主动深度学习（flashcard_deep_learning）</li>
                <li>入口2：当日连续错3次轻提示（daily_3_consecutive_wrong）</li>
                <li>入口3：当日累计错20次强干预（daily_20_wrong）- 演示数据使用此触发</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
