// 工具函数
const Utils = {
  // 随机整数 [min, max]
  randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
  // 随机选择数组元素
  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  // Fisher-Yates 洗牌（修改原数组并返回）
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },
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
  },

  // ===== 行为动画辅助 =====
  // 飘字（金币/经验/伤害）
  floatText(text, className = 'gold-float', duration = 1800) {
    const el = document.createElement('div');
    el.className = className;
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), duration);
  },
  // 金币飘字
  floatGold(amount) {
    this.floatText(`${amount > 0 ? '+' : ''}${amount} 金币`, 'gold-float', 1800);
  },
  // 经验飘字
  floatExp(amount) {
    this.floatText(`+${amount} 经验`, 'exp-float', 1800);
  },
  // 物品获得动画
  floatItem(icon) {
    const el = document.createElement('div');
    el.className = 'item-gain';
    el.textContent = icon;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  },
  // 升级光环
  levelUpBurst() {
    const el = document.createElement('div');
    el.className = 'level-up-burst';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  },
  // 锻造火花
  forgeSparks(count = 8) {
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'forge-spark';
      el.style.setProperty('--sx', (Math.random() * 120 - 60) + 'px');
      el.style.setProperty('--sy', (Math.random() * -80 - 20) + 'px');
      el.style.animationDelay = (i * 0.05) + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 900);
    }
  },
  // 旅店睡梦
  sleepZzz() {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'sleep-zzz';
        el.textContent = 'Z';
        el.style.animationDelay = '0s';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2000);
      }, i * 400);
    }
  },
  // 赌场骰子
  gambleDice() {
    const el = document.createElement('div');
    el.className = 'gamble-dice';
    el.textContent = '🎲';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }
};
