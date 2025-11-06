/**
 * ProductShowcase Component
 *
 * 产品功能展示组件，用于介绍 Surf AI 的核心功能
 * Product showcase component for introducing Surf AI's core features
 */

'use client';

import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';

export function ProductShowcase() {
  const { t } = useTranslation();

  const agentTools = [
    {
      title: t('socialSentiment'),
      description: t('socialSentimentDesc'),
      icon: '💭',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: t('technicalAnalysis'),
      description: t('technicalAnalysisDesc'),
      icon: '📊',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: t('onchainTracker'),
      description: t('onchainTrackerDesc'),
      icon: '🔗',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: t('deepSearch'),
      description: t('deepSearchDesc'),
      icon: '🔍',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const reportFeatures = [
    {
      title: t('professionalLayout'),
      description: t('professionalLayoutDesc'),
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      )
    },
    {
      title: t('nerHighlighting'),
      description: t('nerHighlightingDesc'),
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      )
    },
    {
      title: t('interactiveCharts'),
      description: t('interactiveChartsDesc'),
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="20" x2="12" y2="10" />
          <line x1="18" y1="20" x2="18" y2="4" />
          <line x1="6" y1="20" x2="6" y2="16" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* 产品介绍 */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Image
            src="https://ext.same-assets.com/501684899/3670575781.svg"
            alt="Surf AI"
            width={48}
            height={48}
          />
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
            Surf AI
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t('productIntro')}
        </p>
      </div>

      {/* AI 工具展示 */}
      <div>
        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          {t('aiToolsTitle')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agentTools.map((tool, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all"
            >
              {/* 渐变装饰条 */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tool.color} rounded-t-xl`} />

              <div className="text-3xl mb-3">{tool.icon}</div>
              <h5 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200">
                {tool.title}
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {tool.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 报告功能 */}
      <div>
        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          {t('reportFeaturesTitle')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reportFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-center hover:shadow-md transition-shadow"
            >
              <div className="flex justify-center mb-3 text-[#A78BFA]">
                {feature.icon}
              </div>
              <h5 className="font-bold mb-2 text-gray-900 dark:text-gray-200">
                {feature.title}
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 使用场景 */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          {t('useCasesTitle')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#A78BFA] text-white flex items-center justify-center shrink-0 font-bold">
              1
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white mb-1">
                {t('useCase1Title')}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('useCase1Desc')}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#A78BFA] text-white flex items-center justify-center shrink-0 font-bold">
              2
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white mb-1">
                {t('useCase2Title')}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('useCase2Desc')}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#A78BFA] text-white flex items-center justify-center shrink-0 font-bold">
              3
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white mb-1">
                {t('useCase3Title')}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('useCase3Desc')}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#A78BFA] text-white flex items-center justify-center shrink-0 font-bold">
              4
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white mb-1">
                {t('useCase4Title')}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('useCase4Desc')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 技术栈 */}
      <div className="text-center">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {t('techStackTitle')}
        </h4>
        <div className="flex flex-wrap justify-center gap-2">
          {['OpenAI GPT-4', 'LunarCrush API', 'CoinGecko API', 'Etherscan API', 'Base Network', 'USDC'].map((tech, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm border border-gray-200 dark:border-gray-700"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
