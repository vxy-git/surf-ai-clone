/**
 * 测试智能代币解析器
 * 用法: node test-coin-resolver.mjs
 */

// 模拟环境变量
process.env.NEXT_PUBLIC_COINGECKO_API_KEY = 'CG-9tJBKj97fj4AxNSVqAjYodtB';
process.env.MOBULA_API_KEY = 'e871da0a-e686-4f7a-a2b9-b212ef7116cb';

// 动态导入 (因为我们的代码是 TypeScript)
// 这里我们需要使用 tsx 来运行 TypeScript 代码
console.log('⚠️ 请使用 pnpm tsx test-coin-resolver.mjs 来运行此测试');
console.log('或者直接在浏览器中测试功能\n');

const testCases = [
  { input: 'HYPE', expected: 'harrypotterhypermarioliquidfentjeffspectrum47i', description: '大写 symbol' },
  { input: 'hype', expected: 'harrypotterhypermarioliquidfentjeffspectrum47i', description: '小写 symbol' },
  { input: 'Hyperliquid', expected: 'hyperliquid', description: '项目全名' },
  { input: 'BTC', expected: 'bitcoin', description: '经典代币 BTC' },
  { input: 'btc', expected: 'bitcoin', description: '小写 btc' },
  { input: 'Bitcoin', expected: 'bitcoin', description: '全名 Bitcoin' },
  { input: 'ETH', expected: 'ethereum', description: '以太坊 symbol' },
  { input: 'Ethereum', expected: 'ethereum', description: '以太坊全名' },
];

console.log('📋 测试用例列表:\n');
testCases.forEach((tc, index) => {
  console.log(`${index + 1}. 输入: "${tc.input}" → 预期: "${tc.expected}" (${tc.description})`);
});

console.log('\n✅ 建议的测试步骤:');
console.log('1. 打开浏览器访问: http://localhost:3001');
console.log('2. 在聊天界面中输入以下问题,观察日志输出:');
console.log('   - "查询 HYPE 的价格"');
console.log('   - "Hyperliquid 的市值是多少"');
console.log('   - "BTC 最新行情"');
console.log('3. 检查浏览器控制台和终端日志,确认:');
console.log('   ✓ [CoinResolver] 日志显示正确的解析流程');
console.log('   ✓ [CoinGecko] 日志显示正确的 coin ID');
console.log('   ✓ 数据成功返回');
