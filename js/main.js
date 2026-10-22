// 游戏主入口
window.addEventListener('DOMContentLoaded', () => {
  // 初始化剧情节点
  Story.initNodes();
  // 初始化 UI
  UI.init();
  console.log('《源界：艾尔瑟亚》已加载完成');
});

// 全局错误处理
window.addEventListener('error', (e) => {
  console.error('游戏错误:', e.message);
  Utils.toast('发生错误：' + e.message);
});
