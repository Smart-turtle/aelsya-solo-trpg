// 委托小游戏系统 — 接受委托后需通过小游戏才能完成
const MiniGames = {
  // 当前小游戏状态
  active: null,

  // 委托类型 → 小游戏类型映射
  gameTypes: {
    combat: { name: '战斗委托', icon: '⚔️', desc: '击败目标敌人' },
    collect: { name: '收集委托', icon: '🃏', desc: '记忆翻牌找出目标物品' },
    puzzle: { name: '解谜委托', icon: '🧩', desc: '解开数字谜题' },
    stealth: { name: '潜行委托', icon: '👁️', desc: '在正确时机行动' },
    escort: { name: '护送委托', icon: '🛡️', desc: '快速反应躲避威胁' }
  },

  // 随机选择一个小游戏类型
  randomType() {
    const types = Object.keys(this.gameTypes);
    // 战斗委托权重略高
    const weighted = [...types, 'combat', 'combat'];
    return Utils.pick(weighted);
  },

  // 启动小游戏
  start(type, onComplete) {
    this.active = { type, onComplete };
    const container = document.createElement('div');
    container.className = 'minigame-overlay';
    container.innerHTML = `
      <div class="minigame-modal">
        <div class="minigame-header">
          <span class="minigame-icon">${this.gameTypes[type].icon}</span>
          <span class="minigame-title">${this.gameTypes[type].name}</span>
        </div>
        <div class="minigame-desc">${this.gameTypes[type].desc}</div>
        <div class="minigame-area" id="minigame-area"></div>
        <div class="minigame-result" id="minigame-result"></div>
      </div>
    `;
    document.body.appendChild(container);

    // 根据类型启动对应游戏
    setTimeout(() => {
      switch (type) {
        case 'combat': this._startCombat(container); break;
        case 'collect': this._startCollect(container); break;
        case 'puzzle': this._startPuzzle(container); break;
        case 'stealth': this._startStealth(container); break;
        case 'escort': this._startEscort(container); break;
      }
    }, 100);
  },

  // 完成小游戏
  _finish(success, bonusText = '') {
    const overlay = document.querySelector('.minigame-overlay');
    const resultEl = document.getElementById('minigame-result');
    if (resultEl) {
      resultEl.innerHTML = success
        ? `<div class="mg-result success">✅ 任务完成！${bonusText}</div>`
        : `<div class="mg-result fail">❌ 任务失败……${bonusText}</div>`;
    }
    const cb = this.active?.onComplete;
    this.active = null;
    setTimeout(() => {
      overlay?.remove();
      if (cb) cb(success);
    }, 1500);
  },

  // ===== 小游戏1：战斗委托 =====
  _startCombat(container) {
    const area = container.querySelector('#minigame-area');
    area.innerHTML = '<div class="mg-loading">⚔️ 战斗即将开始……</div>';
    setTimeout(() => {
      container.remove();
      // 从现有敌人模板中随机选择
      const enemyPool = ['goblin', 'bandit', 'orc', 'skeleton', 'wolf_pack', 'thug', 'poacher', 'orc_raider'];
      const enemyId = Utils.pick(enemyPool);
      Combat.start([enemyId]);
      // 战斗结束后回调
      const origEnd = Combat.end;
      Combat.end = function(victory, defeated) {
        origEnd.call(this, victory, defeated);
        Combat.end = origEnd;
        setTimeout(() => {
          const cb = MiniGames.active?.onComplete;
          if (cb) cb(victory && !defeated);
        }, 500);
      };
    }, 800);
  },

  // ===== 小游戏2：收集委托（记忆翻牌）=====
  _startCollect(container) {
    const area = container.querySelector('#minigame-area');
    const items = ['🍎', '💎', '📜', '🌿', '🔮', '🗝️'];
    // 选出目标物品，需要翻到3对
    const target = Utils.pick(items);
    const pool = [];
    // 放3对目标 + 3对干扰
    for (let i = 0; i < 3; i++) pool.push(target, target);
    const others = items.filter(i => i !== target);
    for (let i = 0; i < 3; i++) {
      const o = Utils.pick(others);
      pool.push(o, o);
    }
    Utils.shuffle(pool);

    let foundPairs = 0;
    let flipped = [];
    let canClick = true;
    let attempts = 0;
    const maxAttempts = 12;

    area.innerHTML = `
      <div class="mg-info">找出 <span class="mg-target">${target}</span> ×3 对（翻牌次数：${attempts}/${maxAttempts}）</div>
      <div class="mg-cards" id="mg-cards"></div>
    `;
    const cardsEl = area.querySelector('#mg-cards');
    pool.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'mg-card';
      card.dataset.item = item;
      card.dataset.idx = idx;
      card.textContent = '❓';
      card.onclick = () => {
        if (!canClick || card.classList.contains('flipped') || card.classList.contains('matched')) return;
        card.textContent = item;
        card.classList.add('flipped');
        flipped.push(card);
        if (flipped.length === 2) {
          attempts++;
          area.querySelector('.mg-info').innerHTML = `找出 <span class="mg-target">${target}</span> ×3 对（翻牌次数：${attempts}/${maxAttempts}）`;
          canClick = false;
          const [a, b] = flipped;
          if (a.dataset.item === b.dataset.item) {
            setTimeout(() => {
              a.classList.add('matched');
              b.classList.add('matched');
              if (a.dataset.item === target) {
                foundPairs++;
                if (foundPairs >= 3) {
                  this._finish(true, `成功收集到 ${target}！`);
                  return;
                }
              }
              flipped = [];
              canClick = true;
            }, 400);
          } else {
            setTimeout(() => {
              a.textContent = '❓'; b.textContent = '❓';
              a.classList.remove('flipped'); b.classList.remove('flipped');
              flipped = [];
              canClick = true;
              if (attempts >= maxAttempts) {
                this._finish(false, `翻牌次数用尽，只收集到 ${foundPairs} 对。`);
              }
            }, 700);
          }
        }
      };
      cardsEl.appendChild(card);
    });
  },

  // ===== 小游戏3：解谜委托（数字推理）=====
  _startPuzzle(container) {
    const area = container.querySelector('#minigame-area');
    // 生成一个 1-100 的数字，玩家有 7 次猜测机会
    const answer = Utils.randInt(1, 100);
    let attempts = 0;
    const maxAttempts = 7;
    let history = [];

    area.innerHTML = `
      <div class="mg-info">猜出 1~100 之间的数字（剩余 ${maxAttempts} 次）</div>
      <div class="mg-puzzle-input">
        <input type="number" id="mg-guess" min="1" max="100" placeholder="输入猜测">
        <button class="btn" id="mg-submit">确认</button>
      </div>
      <div class="mg-history" id="mg-history"></div>
    `;
    const input = area.querySelector('#mg-guess');
    const submit = area.querySelector('#mg-submit');
    const info = area.querySelector('.mg-info');
    const historyEl = area.querySelector('#mg-history');

    const guess = () => {
      const val = parseInt(input.value);
      if (isNaN(val) || val < 1 || val > 100) return;
      attempts++;
      input.value = '';
      if (val === answer) {
        this._finish(true, `用了 ${attempts} 次猜中！`);
        return;
      }
      const hint = val < answer ? '太小了 ↑' : '太大了 ↓';
      history.unshift(`${val} — ${hint}`);
      historyEl.innerHTML = history.map(h => `<div class="mg-hint">${h}</div>`).join('');
      info.textContent = `猜出 1~100 之间的数字（剩余 ${maxAttempts - attempts} 次）`;
      if (attempts >= maxAttempts) {
        this._finish(false, `答案是 ${answer}。`);
      }
    };
    submit.onclick = guess;
    input.onkeydown = e => { if (e.key === 'Enter') guess(); };
    setTimeout(() => input.focus(), 100);
  },

  // ===== 小游戏4：潜行委托（时机点击）=====
  _startStealth(container) {
    const area = container.querySelector('#minigame-area');
    // 一个移动的指针，玩家需要在绿色安全区点击
    let success = false;
    let attempts = 0;
    const maxAttempts = 3;

    area.innerHTML = `
      <div class="mg-info">在绿色安全区内点击「行动」按钮（剩余 ${maxAttempts} 次机会）</div>
      <div class="mg-stealth-track">
        <div class="mg-stealth-zone" id="mg-zone"></div>
        <div class="mg-stealth-pointer" id="mg-pointer"></div>
      </div>
      <button class="btn mg-stealth-btn" id="mg-act">行动</button>
    `;
    const pointer = area.querySelector('#mg-pointer');
    const zone = area.querySelector('#mg-zone');
    const actBtn = area.querySelector('#mg-act');
    const info = area.querySelector('.mg-info');

    // 随机安全区位置
    const zoneLeft = Utils.randInt(20, 70);
    zone.style.left = zoneLeft + '%';

    let pos = 0;
    let dir = 1;
    const speed = 1.5;
    const anim = setInterval(() => {
      pos += dir * speed;
      if (pos >= 100) { pos = 100; dir = -1; }
      if (pos <= 0) { pos = 0; dir = 1; }
      pointer.style.left = pos + '%';
    }, 20);

    actBtn.onclick = () => {
      const pointerLeft = parseFloat(pointer.style.left);
      const zoneStart = zoneLeft;
      const zoneEnd = zoneLeft + 15;
      if (pointerLeft >= zoneStart && pointerLeft <= zoneEnd) {
        success = true;
        clearInterval(anim);
        this._finish(true, '成功潜行通过！');
      } else {
        attempts++;
        info.textContent = `在绿色安全区内点击「行动」按钮（剩余 ${maxAttempts - attempts} 次机会）`;
        if (attempts >= maxAttempts) {
          clearInterval(anim);
          this._finish(false, '被守卫发现了！');
        }
      }
    };
  },

  // ===== 小游戏5：护送委托（快速反应）=====
  _startEscort(container) {
    const area = container.querySelector('#minigame-area');
    // 30秒内点击出现的威胁图标，漏掉太多则失败
    let score = 0;
    let missed = 0;
    const maxMissed = 5;
    const targetScore = 8;
    let timeLeft = 20;

    area.innerHTML = `
      <div class="mg-info">点击出现的威胁 ⚠️ 来护送目标（命中 ${targetScore} 个成功，漏掉 ${maxMissed} 个失败）</div>
      <div class="mg-escort-stats">命中: <span id="mg-score">0</span>/${targetScore} | 漏掉: <span id="mg-missed">0</span>/${maxMissed} | 时间: <span id="mg-time">${timeLeft}</span>s</div>
      <div class="mg-escort-field" id="mg-field"></div>
    `;
    const field = area.querySelector('#mg-field');
    const scoreEl = area.querySelector('#mg-score');
    const missedEl = area.querySelector('#mg-missed');
    const timeEl = area.querySelector('#mg-time');

    const spawn = setInterval(() => {
      if (this.active?.type !== 'escort') return;
      const threat = document.createElement('div');
      threat.className = 'mg-threat';
      threat.textContent = Utils.pick(['⚠️', '🐍', '🏹', '🔥']);
      threat.style.left = Utils.randInt(5, 85) + '%';
      threat.style.top = Utils.randInt(10, 80) + '%';
      threat.onclick = () => {
        score++;
        scoreEl.textContent = score;
        threat.remove();
        if (score >= targetScore) {
          clearInterval(spawn);
          clearInterval(timer);
          this._finish(true, `成功护送！命中 ${score} 个威胁。`);
        }
      };
      field.appendChild(threat);
      setTimeout(() => {
        if (threat.parentNode) {
          threat.remove();
          missed++;
          missedEl.textContent = missed;
          if (missed >= maxMissed) {
            clearInterval(spawn);
            clearInterval(timer);
            this._finish(false, `漏掉了 ${missed} 个威胁，护送失败。`);
          }
        }
      }, 1800);
    }, 700);

    const timer = setInterval(() => {
      timeLeft--;
      timeEl.textContent = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(spawn);
        clearInterval(timer);
        if (score >= targetScore) {
          this._finish(true, `时间到，命中 ${score} 个威胁，护送成功！`);
        } else {
          this._finish(false, `时间到，只命中 ${score} 个威胁，护送失败。`);
        }
      }
    }, 1000);
  }
};
