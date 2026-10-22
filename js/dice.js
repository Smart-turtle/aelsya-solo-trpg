// 骰子检定系统
const Dice = {
  // 执行 D20 检定
  roll(attrName, dc = 10, bonus = 0) {
    const attrs = Game.getPlayerAttrs();
    const attrVal = attrs[attrName] || 10;
    const modifier = Utils.mod(attrVal) + bonus;
    const roll = Utils.d20();
    const total = roll + modifier;
    let result;
    if (roll === 20) result = '大成功';
    else if (roll === 1) result = '大失败';
    else if (total >= dc) result = '成功';
    else result = '失败';

    return { roll, modifier, total, dc, result, attrName };
  },

  // 显示检定动画
  showRoll(result, callback) {
    const layer = document.getElementById('dialog-layer');
    const dice = document.createElement('div');
    dice.className = 'dice-roll';
    dice.textContent = '🎲';
    layer.appendChild(dice);

    setTimeout(() => {
      dice.textContent = result.roll;
      const info = document.createElement('div');
      info.style.cssText = 'position:absolute;top:52%;left:50%;transform:translateX(-50%);text-align:center;z-index:25;';
      info.innerHTML = `
        <div style="font-size:18px;color:#a89878;">${this.attrNameZh(result.attrName)}检定</div>
        <div style="font-size:16px;color:#c0b090;">${result.roll} + ${result.modifier} = ${result.total} / DC ${result.dc}</div>
        <div style="font-size:24px;color:${this.resultColor(result.result)};font-weight:bold;margin-top:8px;">${result.result}</div>
      `;
      layer.appendChild(info);
      setTimeout(() => {
        dice.remove();
        info.remove();
        if (callback) callback(result);
      }, 1200);
    }, 400);
  },

  attrNameZh(name) {
    const map = { str: '力量', dex: '敏捷', int: '智力', wis: '感知', cha: '魅力', con: '体质' };
    return map[name] || name;
  },

  resultColor(result) {
    if (result === '大成功') return '#4ac96a';
    if (result === '成功') return '#7ac94a';
    if (result === '失败') return '#c97a4a';
    return '#c94a4a';
  }
};
