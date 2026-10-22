// 战斗系统（可选分支）
const Combat = {
  active: false,
  enemies: [],
  turn: 'player',
  log: [],

  // 敌人模板
  enemyTemplates: {
    goblin: { name: '哥布林', hp: 20, atk: 5, def: 2, exp: 15, gold: 10, icon: '👺' },
    bandit: { name: '强盗', hp: 30, atk: 7, def: 3, exp: 25, gold: 20, icon: '🥷' },
    wolf: { name: '野狼', hp: 25, atk: 8, def: 1, exp: 20, gold: 5, icon: '🐺' },
    skeleton: { name: '骷髅兵', hp: 35, atk: 6, def: 5, exp: 30, gold: 15, icon: '💀' },
    dark_mage: { name: '黑暗法师', hp: 28, atk: 10, def: 2, exp: 40, gold: 30, icon: '🧙' },
    orc: { name: '兽人战士', hp: 50, atk: 10, def: 4, exp: 50, gold: 35, icon: '👹' },
    vampire: { name: '吸血鬼', hp: 60, atk: 12, def: 6, exp: 80, gold: 60, icon: '🦇' },
    dragon: { name: '幼龙', hp: 100, atk: 18, def: 8, exp: 200, gold: 150, icon: '🐉' },
    // 各地区特有敌人
    heretic: { name: '异端分子', hp: 35, atk: 8, def: 3, exp: 30, gold: 25, icon: '⛪' },
    orc_raider: { name: '兽人劫掠者', hp: 45, atk: 10, def: 4, exp: 45, gold: 30, icon: '👹' },
    giant_spider: { name: '巨型蜘蛛', hp: 40, atk: 11, def: 2, exp: 40, gold: 20, icon: '🕷️' },
    poacher: { name: '盗猎者', hp: 32, atk: 9, def: 3, exp: 35, gold: 28, icon: '🏹' },
    fire_elemental: { name: '火焰元素', hp: 55, atk: 14, def: 5, exp: 60, gold: 40, icon: '🔥' },
    ore_thief: { name: '盗矿者', hp: 38, atk: 9, def: 4, exp: 38, gold: 45, icon: '⛏️' },
    lava_beast: { name: '熔岩巨兽', hp: 70, atk: 15, def: 7, exp: 90, gold: 60, icon: '🌋' },
    thug: { name: '暴徒', hp: 30, atk: 8, def: 3, exp: 28, gold: 22, icon: '👊' },
    pirate: { name: '海盗', hp: 42, atk: 10, def: 4, exp: 42, gold: 50, icon: '🏴‍☠️' },
    escapee: { name: '越狱逃犯', hp: 36, atk: 9, def: 3, exp: 36, gold: 18, icon: '🔗' },
    ghoul: { name: '食尸鬼', hp: 50, atk: 12, def: 4, exp: 55, gold: 30, icon: '🧟' },
    renegade: { name: '叛乱仆从', hp: 44, atk: 11, def: 5, exp: 48, gold: 35, icon: '🗡️' },
    horse_thief: { name: '马贼', hp: 34, atk: 10, def: 3, exp: 34, gold: 30, icon: '🐎' },
    wolf_pack: { name: '狼群', hp: 38, atk: 11, def: 2, exp: 32, gold: 10, icon: '🐺' },
    raider: { name: '入侵者', hp: 48, atk: 11, def: 5, exp: 50, gold: 35, icon: '⚔️' },
    // 最终BOSS
    void_herald: { name: '虚无使者', hp: 300, atk: 25, def: 12, exp: 1000, gold: 500, icon: '👁️' }
  },

  // 开始战斗
  start(enemyIds) {
    this.enemies = enemyIds.map(id => ({ ...this.enemyTemplates[id], id, maxHp: this.enemyTemplates[id].hp }));
    this.active = true;
    this.turn = 'player';
    this.log = [];
    Game.state.phase = 'combat';
    UI.renderCombat();
  },

  // 玩家攻击
  playerAttack() {
    if (this.turn !== 'player') return;
    const p = Game.state.player;
    const target = this.enemies.find(e => e.hp > 0);
    if (!target) return;
    const atk = Game.getAttack();
    const roll = Utils.d20();
    if (roll === 1) {
      this.log.push(`你攻击失误！`);
    } else {
      const hit = roll + atk;
      const dmg = Math.max(1, hit - target.def + Utils.randInt(0, 4));
      target.hp -= dmg;
      this.log.push(`你对${target.name}造成了 ${dmg} 点伤害！`);
      if (target.hp <= 0) {
        target.hp = 0;
        this.log.push(`${target.name}被击败了！`);
      }
    }
    this.checkEnd();
    if (this.active) this.enemyTurn();
  },

  // 玩家使用技能
  playerSkill(skillId) {
    if (this.turn !== 'player') return;
    const p = Game.state.player;
    const skill = Classes[p.classId].skills.find(s => s.id === skillId);
    if (!skill) return;
    if (p.mp < skill.mp) {
      this.log.push('法力不足！');
      return;
    }
    p.mp -= skill.mp;
    const target = this.enemies.find(e => e.hp > 0);
    if (!target) return;

    if (skill.dmg) {
      const baseDmg = Math.floor(Game.getAttack() * skill.dmg);
      const dmg = Math.max(1, baseDmg - target.def + Utils.randInt(0, 5));
      target.hp -= dmg;
      this.log.push(`你使用【${skill.name}】，对${target.name}造成 ${dmg} 点伤害！`);
      if (skill.heal) {
        p.hp = Math.min(p.maxHp, p.hp + skill.heal);
        this.log.push(`你恢复了 ${skill.heal} 点生命。`);
      }
      if (target.hp <= 0) {
        target.hp = 0;
        this.log.push(`${target.name}被击败了！`);
      }
    } else if (skill.heal) {
      p.hp = Math.min(p.maxHp, p.hp + skill.heal);
      this.log.push(`你使用【${skill.name}】，恢复了 ${skill.heal} 点生命。`);
    } else if (skill.buff) {
      p.statusEffects.push({ type: 'buff', stat: skill.buff, duration: 3 });
      this.log.push(`你使用【${skill.name}】，获得了增益！`);
    } else if (skill.cc) {
      target.statusEffects = target.statusEffects || [];
      target.statusEffects.push({ type: 'stun', duration: 1 });
      this.log.push(`你使用【${skill.name}】，${target.name}被控制了！`);
    }
    if (skill.hpCost) {
      p.hp = Math.max(1, p.hp - skill.hpCost);
    }
    this.checkEnd();
    if (this.active) this.enemyTurn();
  },

  // 玩家使用物品
  playerUseItem(itemId) {
    if (this.turn !== 'player') return;
    const item = Items.get(itemId);
    if (!item) return;
    if (item.heal) {
      Game.state.player.hp = Math.min(Game.state.player.maxHp, Game.state.player.hp + item.heal);
      this.log.push(`你使用了${item.name}，恢复 ${item.heal} 点生命。`);
    }
    if (item.mp) {
      Game.state.player.mp = Math.min(Game.state.player.maxMp, Game.state.player.mp + item.mp);
      this.log.push(`你使用了${item.name}，恢复 ${item.mp} 点法力。`);
    }
    Game.removeItem(itemId);
    this.enemyTurn();
  },

  // 玩家防御
  playerDefend() {
    if (this.turn !== 'player') return;
    Game.state.player.statusEffects.push({ type: 'defending', duration: 1 });
    this.log.push('你进入了防御姿态。');
    this.enemyTurn();
  },

  // 玩家逃跑
  playerFlee() {
    if (this.turn !== 'player') return;
    const roll = Utils.d20() + Utils.mod(Game.getPlayerAttrs().dex);
    if (roll >= 12) {
      this.log.push('你成功逃跑了！');
      this.end(false);
    } else {
      this.log.push('逃跑失败！');
      this.enemyTurn();
    }
  },

  // 敌人回合
  enemyTurn() {
    this.turn = 'enemy';
    setTimeout(() => {
      this.enemies.forEach(e => {
        if (e.hp <= 0) return;
        // 检查眩晕
        const stunned = (e.statusEffects || []).find(s => s.type === 'stun');
        if (stunned) {
          this.log.push(`${e.name}被控制，无法行动。`);
          return;
        }
        // 简单 AI：血量低时攻击，随机选择
        const p = Game.state.player;
        const defending = p.statusEffects.find(s => s.type === 'defending');
        const def = defending ? Game.getDefense() + 5 : Game.getDefense();
        const roll = Utils.d20();
        if (roll === 1) {
          this.log.push(`${e.name}攻击失误！`);
        } else {
          const dmg = Math.max(1, e.atk + Utils.randInt(0, 3) - def);
          p.hp -= dmg;
          this.log.push(`${e.name}对你造成了 ${dmg} 点伤害！`);
          if (p.hp <= 0) {
            p.hp = 0;
          }
        }
      });
      // 清除临时状态
      Game.state.player.statusEffects = Game.state.player.statusEffects.filter(s => {
        if (s.duration) s.duration--;
        return s.duration > 0;
      });
      this.enemies.forEach(e => {
        if (e.statusEffects) {
          e.statusEffects = e.statusEffects.filter(s => {
            if (s.duration) s.duration--;
            return s.duration > 0;
          });
        }
      });
      this.turn = 'player';
      this.checkEnd();
      UI.renderCombat();
    }, 800);
  },

  // 检查战斗结束
  checkEnd() {
    const p = Game.state.player;
    if (p.hp <= 0) {
      this.log.push('你被击败了……');
      setTimeout(() => this.end(false, true), 1000);
      return;
    }
    if (this.enemies.every(e => e.hp <= 0)) {
      this.log.push('战斗胜利！');
      setTimeout(() => this.end(true), 1000);
    }
  },

  // 结束战斗
  end(victory, defeated = false) {
    this.active = false;
    if (victory) {
      let totalExp = 0, totalGold = 0;
      this.enemies.forEach(e => {
        totalExp += e.exp;
        totalGold += e.gold;
      });
      Game.gainExp(totalExp);
      Game.state.player.gold += totalGold;
      Game.state.log.push(`获得 ${totalExp} 经验，${totalGold} 金币`);
      Utils.toast(`获得 ${totalExp} 经验，${totalGold} 金币`);
      // 随机掉落
      if (Math.random() < 0.5) {
        const drops = ['health_potion', 'mana_potion', 'food'];
        Game.addItem(Utils.pick(drops));
      }
    }
    Game.state.phase = 'story';
    UI.renderStory();
  }
};
