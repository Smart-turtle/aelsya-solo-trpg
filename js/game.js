// 游戏状态管理
const Game = {
  state: {
    // 玩家
    player: null,
    // 游戏阶段
    phase: 'menu', // menu, charCreate, worldMap, story, combat, inventory, ending
    // 当前剧情节点
    currentStoryNode: null,
    currentStoryPath: null,
    // 游戏内时间
    time: { era: 4, year: 1, month: 1, day: 1, hour: 8 },
    // 标记
    flags: {},
    // 地区声望
    reputation: {},
    // 政治路线
    careerPath: null,
    // 政治立场
    politicalStance: {},
    // 婚姻
    spouse: null,
    // NPC 好感度
    npcAffinity: {},
    // 已触发事件
    triggeredEvents: [],
    // 当前地区
    currentRegion: null,
    // 当前地点
    currentLocation: null,
    // 消息日志
    log: []
  },

  // 初始化新游戏
  newGame(regionId, classId, playerName) {
    const cls = Classes[classId];
    const region = World.regions[regionId];
    this.state.player = {
      name: playerName || '旅人',
      region: regionId,
      classId: classId,
      className: cls.name,
      level: 1,
      exp: 0,
      expToNext: 100,
      gold: 100,
      attrs: { ...cls.attrs },
      hp: cls.hp,
      maxHp: cls.hp,
      mp: cls.mp,
      maxMp: cls.mp,
      skills: cls.skills.map(s => s.id),
      inventory: cls.startItems.map(id => ({ id, count: 1 })),
      equipment: { weapon: null, armor: null, accessory: null },
      statusEffects: [],
      skillPoints: 0
    };
    // 装备起始物品
    cls.startItems.forEach(id => {
      const item = Items.get(id);
      if (item && item.slot) {
        if (!this.state.player.equipment[item.slot]) {
          this.state.player.equipment[item.slot] = id;
        }
      }
    });
    // 初始化地区声望
    Object.keys(World.regions).forEach(r => {
      this.state.reputation[r] = 0;
      this.state.politicalStance[r] = 0;
    });
    // 初始化 NPC 好感度
    Object.keys(NPCs).forEach(id => {
      this.state.npcAffinity[id] = 0;
    });
    this.state.phase = 'story';
    this.state.currentRegion = regionId;
    // 进入序章
    Story.startPrologue(regionId, classId);
  },

  // 获取玩家总属性（含装备加成）
  getPlayerAttrs() {
    const p = this.state.player;
    const attrs = { ...p.attrs };
    Object.values(p.equipment).forEach(itemId => {
      const item = Items.get(itemId);
      if (item) {
        ['str', 'dex', 'int', 'wis', 'cha', 'con'].forEach(a => {
          if (item[a]) attrs[a] += item[a];
        });
        if (item.mp) p.maxMp += 0; // handled separately
      }
    });
    return attrs;
  },

  // 获取攻击力
  getAttack() {
    const attrs = this.getPlayerAttrs();
    let atk = Utils.mod(attrs.str) + this.state.player.level;
    const weapon = Items.get(this.state.player.equipment.weapon);
    if (weapon && weapon.atk) atk += weapon.atk;
    return atk;
  },

  // 获取防御
  getDefense() {
    const attrs = this.getPlayerAttrs();
    let def = Utils.mod(attrs.dex);
    const armor = Items.get(this.state.player.equipment.armor);
    if (armor && armor.def) def += armor.def;
    return def;
  },

  // 添加物品到背包
  addItem(itemId, count = 1) {
    const item = Items.get(itemId);
    if (!item) return false;
    const p = this.state.player;
    const existing = p.inventory.find(i => i.id === itemId);
    if (existing) {
      existing.count += count;
    } else {
      p.inventory.push({ id: itemId, count });
    }
    if (item.giveGold) {
      p.gold += item.giveGold;
      p.inventory = p.inventory.filter(i => i.id !== itemId);
    }
    return true;
  },

  // 移除物品
  removeItem(itemId, count = 1) {
    const p = this.state.player;
    const idx = p.inventory.findIndex(i => i.id === itemId);
    if (idx === -1) return false;
    p.inventory[idx].count -= count;
    if (p.inventory[idx].count <= 0) {
      p.inventory.splice(idx, 1);
    }
    return true;
  },

  // 检查是否拥有物品
  hasItem(itemId, count = 1) {
    const p = this.state.player;
    const it = p.inventory.find(i => i.id === itemId);
    return it && it.count >= count;
  },

  // 装备物品
  equipItem(itemId) {
    const item = Items.get(itemId);
    if (!item || !item.slot) return false;
    const p = this.state.player;
    const slot = item.slot;
    // 卸下当前装备
    if (p.equipment[slot]) {
      this.addItem(p.equipment[slot]);
    }
    p.equipment[slot] = itemId;
    this.removeItem(itemId);
    // 更新最大生命法力
    this.recalcStats();
    return true;
  },

  // 卸下装备
  unequipItem(slot) {
    const p = this.state.player;
    if (!p.equipment[slot]) return false;
    this.addItem(p.equipment[slot]);
    p.equipment[slot] = null;
    this.recalcStats();
    return true;
  },

  // 重新计算属性
  recalcStats() {
    const p = this.state.player;
    const cls = Classes[p.classId];
    p.maxHp = cls.hp + (p.level - 1) * 5;
    p.maxMp = cls.mp + (p.level - 1) * 3;
    // 装备加成
    Object.values(p.equipment).forEach(itemId => {
      const item = Items.get(itemId);
      if (item) {
        if (item.mp) p.maxMp += item.mp;
        if (item.con) p.maxHp += item.con * 2;
      }
    });
    p.hp = Math.min(p.hp, p.maxHp);
    p.mp = Math.min(p.mp, p.maxMp);
  },

  // 使用消耗品
  useItem(itemId) {
    const item = Items.get(itemId);
    if (!item || item.type !== 'consumable') return false;
    const p = this.state.player;
    if (item.heal) {
      p.hp = Math.min(p.maxHp, p.hp + item.heal);
      Utils.toast(`恢复了 ${item.heal} 点生命`);
    }
    if (item.mp) {
      p.mp = Math.min(p.maxMp, p.mp + item.mp);
      Utils.toast(`恢复了 ${item.mp} 点法力`);
    }
    if (item.exp) {
      this.gainExp(item.exp);
      Utils.toast(`获得了 ${item.exp} 点经验`);
    }
    if (item.cure) {
      p.statusEffects = p.statusEffects.filter(e => e.type !== item.cure);
      Utils.toast('解除了负面状态');
    }
    this.removeItem(itemId);
    return true;
  },

  // 获得经验
  gainExp(amount) {
    const p = this.state.player;
    p.exp += amount;
    while (p.exp >= p.expToNext) {
      p.exp -= p.expToNext;
      p.level++;
      p.skillPoints += 1;
      p.expToNext = Math.floor(p.expToNext * 1.5);
      this.recalcStats();
      p.hp = p.maxHp;
      p.mp = p.maxMp;
      Utils.toast(`升级了！当前等级：${p.level}`);
    }
  },

  // 改变 NPC 好感度
  changeAffinity(npcId, amount) {
    if (this.state.npcAffinity[npcId] === undefined) {
      this.state.npcAffinity[npcId] = 0;
    }
    this.state.npcAffinity[npcId] = Utils.clamp(
      this.state.npcAffinity[npcId] + amount, 0, 100
    );
    const stage = Utils.relationStage(this.state.npcAffinity[npcId]);
    if (amount > 0) Utils.toast(`${NPCs[npcId]?.name || ''} 好感度 +${amount}（${stage}）`);
    else if (amount < 0) Utils.toast(`${NPCs[npcId]?.name || ''} 好感度 ${amount}`);
  },

  // 获取 NPC 好感度
  getAffinity(npcId) {
    return this.state.npcAffinity[npcId] || 0;
  },

  // 改变地区声望
  changeReputation(regionId, amount) {
    if (this.state.reputation[regionId] === undefined) {
      this.state.reputation[regionId] = 0;
    }
    this.state.reputation[regionId] += amount;
  },

  // 便捷方法
  addGold(amount) { this.state.player.gold += amount; },
  addExp(amount) { this.gainExp(amount); },
  addReputation(regionId, amount) { this.changeReputation(regionId, amount); },
  applyEffects(effects) { if (Story && Story.applyEffects) Story.applyEffects(effects); },

  // 设置标记
  setFlag(name, value = true) {
    this.state.flags[name] = value;
  },

  getFlag(name) {
    return this.state.flags[name];
  },

  // 推进时间
  advanceTime(hours = 1) {
    const t = this.state.time;
    t.hour += hours;
    while (t.hour >= 24) {
      t.hour -= 24;
      t.day++;
      // 触发每日事件检查
      this.checkDailyEvents();
    }
    while (t.day > 30) {
      t.day -= 30;
      t.month++;
    }
    while (t.month > 12) {
      t.month -= 12;
      t.year++;
    }
    // 纪元年推进（每10年为一纪元年，约对应1小时游玩）
    const newEra = 4 + Math.floor((t.year - 1) / 10);
    if (newEra !== t.era) {
      t.era = newEra;
      Utils.toast(`进入${World.eras[t.era]?.name || '新纪元年'}`);
    }
  },

  // 检查每日事件
  checkDailyEvents() {
    const t = this.state.time;
    const events = WorldEvents.getForTime(t.era, t.year, t.month, t.day);
    events.forEach(e => {
      const key = `${e.id}_${t.year}_${t.month}_${t.day}`;
      if (!this.state.triggeredEvents.includes(key)) {
        this.state.triggeredEvents.push(key);
        Utils.toast(`【${e.name}】${e.desc}`);
        if (e.effect) {
          if (e.effect.flag) this.setFlag(e.effect.flag, true);
          if (e.effect.reputation) {
            Object.entries(e.effect.reputation).forEach(([r, v]) => this.changeReputation(r, v));
          }
        }
      }
    });
  },

  // 获取时间字符串
  getTimeString() {
    const t = this.state.time;
    return `${World.eras[t.era]?.name || '未知纪元'} 第${t.year}年 ${t.month}月${t.day}日 ${Utils.timeOfDay(t.hour)}`;
  },

  // 存档
  save(slot = 0) {
    try {
      localStorage.setItem(`aelsya_save_${slot}`, JSON.stringify(this.state));
      Utils.toast('存档成功');
      return true;
    } catch (e) {
      Utils.toast('存档失败');
      return false;
    }
  },

  // 读档
  load(slot = 0) {
    try {
      const data = localStorage.getItem(`aelsya_save_${slot}`);
      if (!data) return false;
      this.state = JSON.parse(data);
      return true;
    } catch (e) {
      return false;
    }
  },

  // 检查存档是否存在
  hasSave(slot = 0) {
    return localStorage.getItem(`aelsya_save_${slot}`) !== null;
  }
};
