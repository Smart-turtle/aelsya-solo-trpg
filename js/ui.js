// UI 渲染系统
const UI = {
  uiLayer: null,
  dialogLayer: null,

  init() {
    this.uiLayer = document.getElementById('ui-layer');
    this.dialogLayer = document.getElementById('dialog-layer');
    this.renderMainMenu();
  },

  clear() {
    this.uiLayer.innerHTML = '';
    this.dialogLayer.innerHTML = '';
  },

  // 主菜单
  renderMainMenu() {
    this.clear();
    const menu = document.createElement('div');
    menu.id = 'main-menu';
    menu.innerHTML = `
      <h1 class="title">源界：艾尔瑟亚</h1>
      <p class="subtitle">单人跑团 · 架空世界冒险</p>
      <div class="menu-btns">
        <button class="btn btn-primary" id="btn-new">新的游戏</button>
        <button class="btn" id="btn-load">继续游戏</button>
        <button class="btn" id="btn-about">关于游戏</button>
      </div>
    `;
    this.uiLayer.appendChild(menu);
    document.getElementById('btn-new').onclick = () => this.renderCharCreate();
    document.getElementById('btn-load').onclick = () => this.showLoadMenu();
    document.getElementById('btn-about').onclick = () => this.showAbout();
  },

  showAbout() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="panel modal-content">
        <h2 class="title" style="font-size:24px;">关于《源界：艾尔瑟亚》</h2>
        <p style="margin:16px 0;line-height:1.8;">
          一款单人跑团风格的角色扮演游戏。在架空世界「艾尔瑟亚」中，六大国度各有政体与特色职业。
          你可以选择从政、经商、勇者或法师之路，与 NPC 建立关系甚至结婚。
          每一个选择都将影响你的结局，数十种结局等你探索。<br><br>
          操作：WASD/方向键移动，鼠标点击交互。
        </p>
        <button class="btn" onclick="this.closest('.modal').remove()">关闭</button>
      </div>
    `;
    this.uiLayer.appendChild(modal);
  },

  // 读档菜单
  showLoadMenu() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    let slots = '';
    for (let i = 0; i < 3; i++) {
      const has = Game.hasSave(i);
      slots += `<div class="shop-item">
        <div class="info">存档位 ${i + 1}${has ? ' - 有存档' : ' - 空'}</div>
        <button class="btn" ${has ? '' : 'disabled'} onclick="UI.loadGame(${i})">${has ? '读取' : '空'}</button>
      </div>`;
    }
    modal.innerHTML = `
      <div class="panel modal-content">
        <h2 class="title" style="font-size:24px;">读取存档</h2>
        <div class="shop-list" style="margin:16px 0;">${slots}</div>
        <button class="btn" onclick="this.closest('.modal').remove()">取消</button>
      </div>
    `;
    this.uiLayer.appendChild(modal);
  },

  loadGame(slot) {
    if (Game.load(slot)) {
      Utils.toast('读档成功');
      Game.state.phase = 'worldMap';
      this.renderWorldMap();
    } else {
      Utils.toast('读档失败');
    }
  },

  // 角色创建
  renderCharCreate() {
    this.clear();
    const container = document.createElement('div');
    container.id = 'char-create';
    container.innerHTML = `
      <h1 class="title">选择你的出身</h1>
      <p class="subtitle">选择一个国家/地区开始你的冒险</p>
      <div class="region-grid" id="region-grid"></div>
      <div id="class-section" style="margin-top:24px;display:none;">
        <h2 class="title" style="font-size:20px;">选择特色职业</h2>
        <div class="class-grid" id="class-grid"></div>
      </div>
      <div id="char-confirm" style="margin-top:24px;display:none;">
        <input type="text" id="player-name" placeholder="输入角色名称" maxlength="10" style="padding:10px;font-size:16px;width:200px;background:#1a1520;border:1px solid #5a4a30;color:#e8e0d0;border-radius:4px;">
        <button class="btn btn-primary" id="btn-start" style="margin-left:12px;">开始冒险</button>
      </div>
    `;
    this.uiLayer.appendChild(container);

    let selectedRegion = null, selectedClass = null;

    const regionGrid = document.getElementById('region-grid');
    Object.values(World.regions).forEach(r => {
      const card = document.createElement('div');
      card.className = 'region-card';
      card.innerHTML = `<h3>${r.name}</h3><p><b>政体：</b>${r.government}</p><p>${r.desc}</p>`;
      card.onclick = () => {
        document.querySelectorAll('.region-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedRegion = r.id;
        this.showClasses(r.id);
      };
      regionGrid.appendChild(card);
    });

    this.showClasses = (regionId) => {
      const section = document.getElementById('class-section');
      const grid = document.getElementById('class-grid');
      grid.innerHTML = '';
      section.style.display = 'block';
      Classes.getByRegion(regionId).forEach(cls => {
        const card = document.createElement('div');
        card.className = 'class-card';
        const attrs = Object.entries(cls.attrs).map(([k, v]) => `${this.attrShort(k)}${v}`).join(' ');
        card.innerHTML = `<h4>${cls.name}</h4><p style="font-size:12px;color:#a89878;margin:6px 0;">${cls.desc}</p><div class="attr-row">${attrs}</div>`;
        card.onclick = () => {
          document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          selectedClass = cls.id;
          document.getElementById('char-confirm').style.display = 'block';
        };
        grid.appendChild(card);
      });
    };

    document.getElementById('btn-start').onclick = () => {
      const name = document.getElementById('player-name').value.trim() || '旅人';
      if (selectedRegion && selectedClass) {
        Game.newGame(selectedRegion, selectedClass, name);
        Scene3D.init();
        this.renderStory();
      }
    };
  },

  attrShort(name) {
    const map = { str: '力', dex: '敏', int: '智', wis: '感', cha: '魅', con: '体' };
    return map[name] + ' ';
  },

  // HUD
  renderHUD() {
    const p = Game.state.player;
    if (!p) return;
    const old = document.getElementById('hud');
    if (old) old.remove();
    const hud = document.createElement('div');
    hud.id = 'hud';
    const mpPercent = (p.mp / p.maxMp) * 100;
    const hpPercent = (p.hp / p.maxHp) * 100;
    const expPercent = (p.exp / p.expToNext) * 100;
    hud.innerHTML = `
      <div class="hud-left">
        <div class="hud-panel panel">
          <div><b>${p.name}</b> · ${p.className} · Lv.${p.level}</div>
          <div class="hud-bar">HP<div class="bar-bg"><div class="bar-fill bar-hp" style="width:${hpPercent}%"></div></div>${p.hp}/${p.maxHp}</div>
          <div class="hud-bar">MP<div class="bar-bg"><div class="bar-fill bar-mp" style="width:${mpPercent}%"></div></div>${p.mp}/${p.maxMp}</div>
          <div class="hud-bar">EXP<div class="bar-bg"><div class="bar-fill bar-exp" style="width:${expPercent}%"></div></div></div>
          <div>💰 ${p.gold} 金币</div>
        </div>
      </div>
      <div class="hud-right">
        <div class="hud-panel panel">
          <div class="hud-time">${Game.getTimeString()}</div>
          <div>${Game.state.careerPath ? '路线：' + World.careerPaths[Game.state.careerPath].name : ''}</div>
          <div>${Game.state.spouse ? '伴侣：' + (NPCs[Game.state.spouse]?.name || '') : ''}</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn" onclick="UI.openInventory()">背包</button>
          <button class="btn" onclick="UI.openMap()">地图</button>
          <button class="btn" onclick="UI.openSaveMenu()">存档</button>
          <button class="btn" onclick="UI.showEndingNode()">结局</button>
        </div>
      </div>
    `;
    this.uiLayer.appendChild(hud);
  },

  // 剧情展示
  renderStory(node) {
    this.clear();
    this.renderHUD();
    if (!node) node = Story.nodes[Game.state.currentStoryNode];
    if (!node) { this.renderWorldMap(); return; }

    const panel = document.createElement('div');
    panel.id = 'story-panel';
    panel.className = 'fade-in';
    const speakerHtml = node.speaker ? `<div class="story-speaker">${node.speaker}</div>` : '';
    panel.innerHTML = `${speakerHtml}<div class="story-text" id="story-text"></div>`;
    this.dialogLayer.appendChild(panel);

    const textEl = document.getElementById('story-text');
    Utils.typewriter(textEl, node.text, 25, () => {
      const choicesDiv = document.createElement('div');
      choicesDiv.className = 'choices';
      (node.choices || []).forEach((ch, idx) => {
        if (ch.condition && !Story.checkCondition(ch.condition)) return;
        const btn = document.createElement('button');
        btn.className = 'btn choice-btn slide-up';
        btn.style.animationDelay = (idx * 0.05) + 's';
        btn.textContent = ch.text;
        btn.onclick = () => {
          if (ch.onChoose) ch.onChoose();
          Story.choose(ch);
        };
        choicesDiv.appendChild(btn);
      });
      panel.appendChild(choicesDiv);
    });
  },

  // 3D 世界地图
  renderWorldMap() {
    this.clear();
    this.renderHUD();
    Game.state.phase = 'worldMap';
    const hint = document.createElement('div');
    hint.style.cssText = 'position:absolute;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.7);padding:10px 20px;border-radius:6px;font-size:14px;';
    hint.textContent = 'WASD/方向键移动 · 接近地区触发剧情 · 点击右上角按钮打开功能';
    this.uiLayer.appendChild(hint);
  },

  // 显示进入地区
  showRegionEnter(region) {
    Utils.toast(`进入${region.name}（${region.government}）`);
  },

  // 背包
  openInventory() {
    const p = Game.state.player;
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'inventory-modal';

    let invHtml = '';
    p.inventory.forEach(item => {
      const it = Items.get(item.id);
      if (!it) return;
      invHtml += `<div class="inv-slot" onclick="UI.itemAction('${item.id}')">
        <div class="icon">${it.icon}</div>
        <div>${it.name}</div>
        ${item.count > 1 ? `<div class="count">×${item.count}</div>` : ''}
      </div>`;
    });
    if (!invHtml) invHtml = '<div style="grid-column:span 6;text-align:center;color:#a89878;padding:20px;">背包空空如也</div>';

    let equipHtml = '';
    ['weapon', 'armor', 'accessory'].forEach(slot => {
      const itemId = p.equipment[slot];
      const it = itemId ? Items.get(itemId) : null;
      equipHtml += `<div class="equip-slot">
        <div style="color:#8b7340;font-size:11px;">${slot === 'weapon' ? '武器' : slot === 'armor' ? '护甲' : '饰品'}</div>
        <div>${it ? it.icon + ' ' + it.name : '—'}</div>
        ${it ? `<button class="btn" style="margin-top:6px;font-size:11px;padding:4px 8px;" onclick="UI.unequip('${slot}')">卸下</button>` : ''}
      </div>`;
    });

    modal.innerHTML = `
      <div class="panel modal-content">
        <h2 class="title" style="font-size:22px;">背包</h2>
        <div class="equip-section">
          <h3 style="color:#c9a961;margin-bottom:8px;">装备</h3>
          <div class="equip-slots">${equipHtml}</div>
        </div>
        <h3 style="color:#c9a961;margin:16px 0 8px;">物品</h3>
        <div class="inv-grid">${invHtml}</div>
        <button class="btn" onclick="document.getElementById('inventory-modal').remove()">关闭</button>
      </div>
    `;
    this.uiLayer.appendChild(modal);
  },

  itemAction(itemId) {
    const item = Items.get(itemId);
    const p = Game.state.player;
    if (!item) return;
    if (item.slot) {
      if (confirm(`装备 ${item.name}？`)) {
        Game.equipItem(itemId);
        this.openInventory();
      }
    } else if (item.type === 'consumable') {
      if (confirm(`使用 ${item.name}？`)) {
        Game.useItem(itemId);
        this.openInventory();
        this.renderHUD();
      }
    } else {
      Utils.toast(item.desc);
    }
  },

  unequip(slot) {
    Game.unequipItem(slot);
    this.openInventory();
    this.renderHUD();
  },

  // 存档菜单
  openSaveMenu() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    let slots = '';
    for (let i = 0; i < 3; i++) {
      const has = Game.hasSave(i);
      slots += `<div class="shop-item">
        <div class="info">存档位 ${i + 1}${has ? ' - 有存档' : ' - 空'}</div>
        <div>
          <button class="btn" onclick="UI.saveGame(${i})">保存</button>
          <button class="btn" ${has ? '' : 'disabled'} onclick="UI.loadGame(${i})">读取</button>
        </div>
      </div>`;
    }
    modal.innerHTML = `
      <div class="panel modal-content">
        <h2 class="title" style="font-size:22px;">存档 / 读档</h2>
        <div class="shop-list" style="margin:16px 0;">${slots}</div>
        <button class="btn" onclick="this.closest('.modal').remove()">关闭</button>
      </div>
    `;
    this.uiLayer.appendChild(modal);
  },

  saveGame(slot) {
    Game.save(slot);
  },

  // 地图（快速传送）
  openMap() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    let regions = '';
    Object.values(World.regions).forEach(r => {
      regions += `<div class="shop-item">
        <div class="info"><b>${r.name}</b>（${r.government}）<br><span style="font-size:12px;color:#a89878;">${r.desc.substring(0, 40)}...</span></div>
        <button class="btn" onclick="UI.travelTo('${r.id}')">前往</button>
      </div>`;
    });
    modal.innerHTML = `
      <div class="panel modal-content">
        <h2 class="title" style="font-size:22px;">世界地图 - 快速旅行</h2>
        <p style="color:#a89878;margin:12px 0;">选择前往的地区（消耗时间）</p>
        <div class="shop-list">${regions}</div>
        <button class="btn" onclick="this.closest('.modal').remove()">关闭</button>
      </div>
    `;
    this.uiLayer.appendChild(modal);
  },

  travelTo(regionId) {
    Scene3D.teleportTo(regionId);
    Game.advanceTime(6);
    document.querySelector('.modal')?.remove();
    this.renderWorldMap();
    // 触发地区剧情
    const r = World.regions[regionId];
    Utils.toast(`到达${r.name}`);
  },

  // 战斗界面
  renderCombat() {
    this.clear();
    const p = Game.state.player;
    const panel = document.createElement('div');
    panel.id = 'combat-panel';
    let enemiesHtml = '';
    Combat.enemies.forEach((e, i) => {
      if (e.hp > 0) {
        const hpPct = (e.hp / e.maxHp) * 100;
        enemiesHtml += `<div class="combatant">
          <div class="avatar">${e.icon}</div>
          <h3>${e.name}</h3>
          <div class="hud-bar">HP<div class="bar-bg"><div class="bar-fill bar-hp" style="width:${hpPct}%"></div></div>${e.hp}/${e.maxHp}</div>
        </div>`;
      }
    });

    const skills = p.skills.map(id => Classes[p.classId].skills.find(s => s.id === id)).filter(Boolean);
    let skillsHtml = skills.map(s => `<button class="btn" onclick="Combat.playerSkill('${s.id}')" ${p.mp < s.mp ? 'disabled' : ''}>${s.name}(${s.mp}MP)</button>`).join('');

    panel.innerHTML = `
      <div class="combat-top">
        <div class="combatant">
          <div class="avatar">🧑‍🦱</div>
          <h3>${p.name}</h3>
          <div class="hud-bar">HP<div class="bar-bg"><div class="bar-fill bar-hp" style="width:${(p.hp/p.maxHp)*100}%"></div></div>${p.hp}/${p.maxHp}</div>
          <div class="hud-bar">MP<div class="bar-bg"><div class="bar-fill bar-mp" style="width:${(p.mp/p.maxMp)*100}%"></div></div>${p.mp}/${p.maxMp}</div>
        </div>
        <div style="display:flex;gap:20px;flex-wrap:wrap;justify-content:center;">${enemiesHtml}</div>
      </div>
      <div class="combat-bottom">
        <div class="combat-log" id="combat-log">${Combat.log.slice(-5).map(l => `<div>${l}</div>`).join('')}</div>
        <div class="combat-actions">
          <button class="btn btn-primary" onclick="Combat.playerAttack()">攻击</button>
          ${skillsHtml}
          <button class="btn" onclick="UI.combatUseItem()">物品</button>
          <button class="btn" onclick="Combat.playerDefend()">防御</button>
          <button class="btn btn-danger" onclick="Combat.playerFlee()">逃跑</button>
        </div>
      </div>
    `;
    this.uiLayer.appendChild(panel);
  },

  combatUseItem() {
    const p = Game.state.player;
    const consumables = p.inventory.filter(i => Items.get(i.id)?.type === 'consumable' && Items.get(i.id)?.heal);
    if (consumables.length === 0) { Utils.toast('没有可用物品'); return; }
    const item = consumables[0];
    Combat.playerUseItem(item.id);
    this.renderCombat();
  },

  // 显示结局
  showEndingNode() {
    if (Game.state.player.level < 3) {
      Utils.toast('至少需要 3 级才能触发结局');
      return;
    }
    this.showEnding();
  },

  showEnding() {
    const ending = Endings.calculate();
    this.clear();
    const screen = document.createElement('div');
    screen.id = 'ending-screen';
    screen.innerHTML = `
      <h2>${ending.title}</h2>
      <div class="ending-text">${ending.text}</div>
      <button class="btn btn-primary" onclick="UI.renderMainMenu()">返回主菜单</button>
    `;
    this.uiLayer.appendChild(screen);
  }
};
