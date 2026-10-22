// UI 渲染系统
const UI = {
  uiLayer: null,
  dialogLayer: null,

  // 地区视觉配置（图标、主题色、辉光色）
  regionVisual: {
    holy_empire: { icon: '⛪', color: '#f5d76e', glow: 'rgba(245,215,110,0.35)' },
    emerald_council: { icon: '🌲', color: '#5cb85c', glow: 'rgba(92,184,92,0.35)' },
    lava_confederation: { icon: '🌋', color: '#e8743c', glow: 'rgba(232,116,60,0.35)' },
    free_cities: { icon: '🏛️', color: '#7a8ef0', glow: 'rgba(122,142,240,0.35)' },
    shadow_lands: { icon: '🌙', color: '#9b7ac9', glow: 'rgba(155,122,201,0.35)' },
    steppe_tribes: { icon: '🐎', color: '#9ad64a', glow: 'rgba(154,214,74,0.35)' }
  },

  // 职业图标
  classIcons: {
    paladin: '🛡️', inquisitor: '⚖️', druid: '🌿', ranger: '🏹',
    rune_warrior: '🪓', artisan: '🔧', bard: '🎵', rogue: '🗡️',
    necromancer: '💀', assassin: '🥷', shaman: '🪶', berserker: '🪓'
  },

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

  // 地区视觉主题
  regionTheme(regionId) {
    const themes = {
      holy_empire: {
        emblem: '✦', gradient: 'linear-gradient(135deg, #3a2a1a 0%, #2a1a0a 50%, #4a3520 100%)',
        accent: '#f5e6c8', god: '黎明之神', icon: '⚔️', pattern: 'radial-gradient(circle at 30% 20%, rgba(245,230,200,0.12), transparent 50%)'
      },
      emerald_council: {
        emblem: '❦', gradient: 'linear-gradient(135deg, #1a3a1a 0%, #0a2a1a 50%, #2a4a2a 100%)',
        accent: '#7ac97a', god: '自然之母', icon: '🌿', pattern: 'radial-gradient(circle at 70% 30%, rgba(122,201,122,0.12), transparent 50%)'
      },
      lava_confederation: {
        emblem: '⚒', gradient: 'linear-gradient(135deg, #3a1a0a 0%, #2a0a05 50%, #4a2510 100%)',
        accent: '#ff8a3a', god: '熔炉之主', icon: '🔥', pattern: 'radial-gradient(circle at 50% 80%, rgba(255,138,58,0.15), transparent 50%)'
      },
      free_cities: {
        emblem: '⚖', gradient: 'linear-gradient(135deg, #1a1f3a 0%, #0a1025 50%, #253050 100%)',
        accent: '#7aaaff', god: '商贾之神', icon: '💰', pattern: 'radial-gradient(circle at 20% 70%, rgba(122,170,255,0.12), transparent 50%)'
      },
      shadow_lands: {
        emblem: '☾', gradient: 'linear-gradient(135deg, #1a0a2a 0%, #0a0515 50%, #251540 100%)',
        accent: '#9a7acc', god: '暗夜之主', icon: '🦇', pattern: 'radial-gradient(circle at 80% 50%, rgba(154,122,204,0.12), transparent 50%)'
      },
      steppe_tribes: {
        emblem: '✧', gradient: 'linear-gradient(135deg, #2a3a1a 0%, #1a250a 50%, #405020 100%)',
        accent: '#aacc5a', god: '风暴之灵', icon: '🏹', pattern: 'radial-gradient(circle at 60% 60%, rgba(170,204,90,0.12), transparent 50%)'
      }
    };
    return themes[regionId] || themes.holy_empire;
  },

  // 角色创建
  renderCharCreate() {
    this.clear();
    const container = document.createElement('div');
    container.id = 'char-create';
    container.innerHTML = `
      <h1 class="title">选择你的出身</h1>
      <p class="subtitle">选择一个国家/地区开始你的冒险 · 每个国度都有独特的政体、信仰与势力</p>
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
      const theme = this.regionTheme(r.id);
      const factionsList = r.factions.slice(0, 3).map(f => f.name).join('、');
      const card = document.createElement('div');
      card.className = 'region-card';
      card.style.setProperty('--region-color', theme.accent);
      card.style.setProperty('--region-glow', theme.accent + '55');
      card.innerHTML = `
        <div class="region-icon">${theme.icon}</div>
        <h3>${r.name}</h3>
        <span class="gov-tag">${r.government}</span>
        <span class="gov-tag" style="margin-left:6px;">信仰 ${theme.god}</span>
        <p>${r.desc}</p>
        <div style="display:flex;gap:14px;font-size:11px;color:#8a7a5a;margin-top:6px;">
          <span>🌡 ${r.climate.split('，')[0]}</span>
          <span>💰 物价 ${Math.round(r.priceMod * 100)}%</span>
        </div>
        <div class="region-factions"><b>主要势力：</b>${factionsList}</div>
      `;
      card.onclick = () => {
        document.querySelectorAll('.region-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedRegion = r.id;
        this.showClasses(r.id, theme);
      };
      regionGrid.appendChild(card);
    });

    this.showClasses = (regionId, theme) => {
      const section = document.getElementById('class-section');
      const grid = document.getElementById('class-grid');
      grid.innerHTML = '';
      section.style.display = 'block';
      Classes.getByRegion(regionId).forEach(cls => {
        const card = document.createElement('div');
        card.className = 'class-card';
        const attrs = Object.entries(cls.attrs).map(([k, v]) => `${this.attrShort(k)}${v}`).join(' ');
        const icon = this.classIcons[cls.id] || '⚔️';
        card.innerHTML = `
          <div class="class-icon">${icon}</div>
          <h4 style="color:${theme.accent}">${cls.name}</h4>
          <p style="font-size:12px;color:#a89878;margin:6px 0;">${cls.desc}</p>
          <div class="attr-row">${attrs}</div>
        `;
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
    const displayText = node._displayText != null ? node._displayText : (node.text || '');
    const displayChoices = node._displayChoices || node.choices || [];
    Utils.typewriter(textEl, displayText, 25, () => {
      const choicesDiv = document.createElement('div');
      choicesDiv.className = 'choices';
      displayChoices.forEach((ch, idx) => {
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
    hint.textContent = 'WASD/方向键移动 · 接近地区后按 E 或点击进入 · 右上角按钮打开功能';
    this.uiLayer.appendChild(hint);
  },

  // 显示进入地区提示（可点击确认）
  showRegionPrompt(region) {
    let prompt = document.getElementById('region-prompt');
    if (!prompt) {
      prompt = document.createElement('div');
      prompt.id = 'region-prompt';
      this.uiLayer.appendChild(prompt);
    }
    const vis = this.regionVisual[region.id] || { icon: '🏰', color: '#c9a961' };
    prompt.innerHTML = `
      <div class="region-prompt-box" style="border-color:${vis.color};color:${vis.color};">
        <span class="region-prompt-icon">${vis.icon}</span>
        <span class="region-prompt-name">${region.name}</span>
        <span class="region-prompt-hint">按 E 或点击进入</span>
        <button class="btn region-prompt-btn" style="border-color:${vis.color};color:${vis.color};" onclick="Scene3D.enterRegion('${region.id}')">进入</button>
      </div>
    `;
    prompt.style.display = 'flex';
  },

  hideRegionPrompt() {
    const prompt = document.getElementById('region-prompt');
    if (prompt) prompt.style.display = 'none';
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
    modal.id = 'save-modal';
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
    modal.id = 'map-modal';
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
    const factors = ending.factors || {};
    const region = World.regions[factors.topRegion] || World.regions.free_cities;
    const theme = this.regionTheme(factors.topRegion);
    const path = World.careerPaths[factors.path] || World.careerPaths.adventurer;
    const pathGlyphs = { politician: '♛', merchant: '💰', adventurer: '⚔', mage: '✦' };
    const p = Game.state.player;
    const attrs = Game.getPlayerAttrs();

    this.clear();
    const screen = document.createElement('div');
    screen.id = 'ending-screen';
    screen.className = `ending-${factors.path || 'adventurer'}`;
    screen.style.setProperty('--end-color', theme.accent);
    screen.style.setProperty('--end-glow', theme.accent + '40');
    screen.style.setProperty('--end-glyph', `"${pathGlyphs[factors.path] || '✦'}"`);
    screen.innerHTML = `
      <div class="ending-bg-pattern"></div>
      <div class="ending-content">
        <div class="ending-emblem" style="color:${theme.accent};border-color:${theme.accent};">${theme.emblem}</div>
        <div class="ending-region-label">${region.name} · ${path.name}之路</div>
        <h2 class="ending-title" style="color:${theme.accent};">${ending.title}</h2>
        <div class="ending-divider"></div>
        <div class="ending-text">${ending.text}</div>
        <div class="ending-stats">
          <div class="ending-stat">
            <span class="stat-label">角色</span>
            <span class="stat-value">${p.name}</span>
          </div>
          <div class="ending-stat">
            <span class="stat-label">职业</span>
            <span class="stat-value">${p.className}</span>
          </div>
          <div class="ending-stat">
            <span class="stat-label">等级</span>
            <span class="stat-value">Lv.${p.level}</span>
          </div>
          <div class="ending-stat">
            <span class="stat-label">伴侣</span>
            <span class="stat-value">${factors.married ? (NPCs[Game.state.spouse]?.name || '神秘人') : '无'}</span>
          </div>
        </div>
        <div class="ending-attrs">
          ${Object.entries(attrs).map(([k, v]) => `<div class="attr-pill"><span>${this.attrShort(k).trim()}</span><b>${v}</b></div>`).join('')}
        </div>
        <button class="btn btn-primary ending-return" onclick="UI.renderMainMenu()">返回主菜单</button>
      </div>
    `;
    this.uiLayer.appendChild(screen);
  }
};
