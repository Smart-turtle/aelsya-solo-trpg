// 骰子检定系统 — 3D 投掷动画
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

    return { roll, modifier, total, dc, result, attrName, diceCount: 1 };
  },

  // 显示检定动画（3D 骰子 + DC 期望值 + 结果）
  showRoll(result, callback) {
    const layer = document.getElementById('dialog-layer');

    // 背景遮罩
    const overlay = document.createElement('div');
    overlay.className = 'dice-overlay';

    // 检定信息面板
    const panel = document.createElement('div');
    panel.className = 'dice-panel';

    const attrZh = this.attrNameZh(result.attrName);
    const modSign = result.modifier >= 0 ? '+' : '';

    panel.innerHTML = `
      <div class="dice-header">
        <span class="dice-check-name">${attrZh}检定</span>
        <span class="dice-dc">难度等级 DC <b>${result.dc}</b></span>
      </div>
      <div class="dice-stage">
        <div class="dice-d20" id="dice-d20">
          <div class="dice-face dice-face-1">1</div>
          <div class="dice-face dice-face-2">2</div>
          <div class="dice-face dice-face-3">3</div>
          <div class="dice-face dice-face-4">4</div>
          <div class="dice-face dice-face-5">5</div>
          <div class="dice-face dice-face-6">6</div>
          <div class="dice-face dice-face-7">7</div>
          <div class="dice-face dice-face-8">8</div>
          <div class="dice-face dice-face-9">9</div>
          <div class="dice-face dice-face-10">10</div>
          <div class="dice-face dice-face-11">11</div>
          <div class="dice-face dice-face-12">12</div>
          <div class="dice-face dice-face-13">13</div>
          <div class="dice-face dice-face-14">14</div>
          <div class="dice-face dice-face-15">15</div>
          <div class="dice-face dice-face-16">16</div>
          <div class="dice-face dice-face-17">17</div>
          <div class="dice-face dice-face-18">18</div>
          <div class="dice-face dice-face-19">19</div>
          <div class="dice-face dice-face-20">20</div>
        </div>
      </div>
      <div class="dice-formula" id="dice-formula">
        <span class="dice-rolling">投掷中…</span>
      </div>
      <div class="dice-result" id="dice-result" style="display:none;"></div>
    `;

    overlay.appendChild(panel);
    layer.appendChild(overlay);

    // 骰子滚动动画：随机多圈旋转后停在结果面
    const diceEl = document.getElementById('dice-d20');
    const finalRoll = result.roll;

    // 预计算各面的目标旋转角度（让对应面朝上）
    const faceRotations = this._faceRotations();
    const targetRot = faceRotations[finalRoll] || { x: 0, y: 0 };

    // 随机滚动圈数
    const spinsX = (Math.floor(Math.random() * 4) + 4) * 360;
    const spinsY = (Math.floor(Math.random() * 4) + 4) * 360;

    // 先快速滚动数字（视觉反馈）
    let flickerTimer = setInterval(() => {
      const faces = diceEl.querySelectorAll('.dice-face');
      faces.forEach(f => f.classList.remove('is-showing'));
      const randomFace = Math.floor(Math.random() * 20) + 1;
      const f = diceEl.querySelector(`.dice-face-${randomFace}`);
      if (f) f.classList.add('is-showing');
    }, 60);

    // 滚动动画
    diceEl.style.transition = 'transform 1.8s cubic-bezier(0.15, 0.8, 0.25, 1)';
    requestAnimationFrame(() => {
      diceEl.style.transform = `rotateX(${spinsX + targetRot.x}deg) rotateY(${spinsY + targetRot.y}deg)`;
    });

    // 1.8s 后停止，显示结果
    setTimeout(() => {
      clearInterval(flickerTimer);

      // 让最终面显示
      const faces = diceEl.querySelectorAll('.dice-face');
      faces.forEach(f => f.classList.remove('is-showing'));
      const finalFace = diceEl.querySelector(`.dice-face-${finalRoll}`);
      if (finalFace) finalFace.classList.add('is-showing');

      // 显示公式与结果
      const formulaEl = document.getElementById('dice-formula');
      formulaEl.innerHTML = `
        <span class="dice-num">${result.roll}</span>
        <span class="dice-op">${modSign}${result.modifier}</span>
        <span class="dice-eq">=</span>
        <span class="dice-total ${result.total >= result.dc ? 'is-pass' : 'is-fail'}">${result.total}</span>
        <span class="dice-vs">/ DC ${result.dc}</span>
      `;

      const resultEl = document.getElementById('dice-result');
      const color = this.resultColor(result.result);
      resultEl.style.display = 'block';
      resultEl.style.color = color;
      resultEl.style.borderColor = color;
      resultEl.innerHTML = `<span class="dice-result-label">检定结果</span><span class="dice-result-text">${result.result}</span>`;
      resultEl.classList.add('dice-result-show');

      // 自动关闭
      setTimeout(() => {
        overlay.classList.add('dice-fade-out');
        setTimeout(() => {
          overlay.remove();
          if (callback) callback(result);
        }, 350);
      }, 1400);
    }, 1800);
  },

  // D20 各面朝上时的旋转角度（简化映射，每个面对应一组 x/y 旋转）
  _faceRotations() {
    const rots = {};
    // 用二十面体的近似面朝向，每面分配一组角度
    for (let i = 1; i <= 20; i++) {
      // 均匀分布在球面上的角度
      const theta = (i / 20) * Math.PI * 2;
      const phi = Math.acos(1 - 2 * (i - 0.5) / 20);
      rots[i] = {
        x: Math.round(phi * 180 / Math.PI),
        y: Math.round(theta * 180 / Math.PI)
      };
    }
    return rots;
  },

  attrNameZh(name) {
    const map = { str: '力量', dex: '敏捷', int: '智力', wis: '感知', cha: '魅力', con: '体质' };
    return map[name] || name;
  },

  resultColor(result) {
    if (result === '大成功') return '#4ac96a';
    if (result === '成功') return '#7ac94a';
    if (result === '失败') return '#c9a94a';
    return '#c94a4a';
  }
};
