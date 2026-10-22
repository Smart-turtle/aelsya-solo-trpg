// 工具函数
const Utils = {
  // 随机整数 [min, max]
  randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
  // 随机选择数组元素
  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  // 钳制值
  clamp(v, min, max) { return Math.max(min, Math.min(max, v)); },
  // D20 掷骰
  d20() { return this.randInt(1, 20); },
  // 属性修正值 (属性-10)/2 向下取整
  mod(attr) { return Math.floor((attr - 10) / 2); },
  // 浅拷贝
  clone(obj) { return JSON.parse(JSON.stringify(obj)); },
  // 显示提示
  toast(msg, duration = 2500) {
    const layer = document.getElementById('toast-layer');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    layer.appendChild(el);
    setTimeout(() => el.remove(), duration);
  },
  // 类型机效果
  typewriter(el, text, speed = 30, cb) {
    el.textContent = '';
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        el.textContent += text[i++];
      } else {
        clearInterval(timer);
        if (cb) cb();
      }
    }, speed);
    return timer;
  },
  // 关系阶段
  relationStage(affinity) {
    if (affinity < 20) return '陌生';
    if (affinity < 40) return '相识';
    if (affinity < 60) return '友好';
    if (affinity < 80) return '亲密';
    return '恋人';
  },
  // 季节
  season(month) {
    if (month >= 3 && month <= 5) return '春';
    if (month >= 6 && month <= 8) return '夏';
    if (month >= 9 && month <= 11) return '秋';
    return '冬';
  },
  // 时段
  timeOfDay(hour) {
    if (hour >= 5 && hour < 12) return '清晨';
    if (hour >= 12 && hour < 17) return '午后';
    if (hour >= 17 && hour < 21) return '黄昏';
    return '夜晚';
  }
};
