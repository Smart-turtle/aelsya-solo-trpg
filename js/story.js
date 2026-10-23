// 剧情系统：节点、选择、结局
const Story = {
  nodes: {},
  currentNode: null,

  // 获取地区入口节点（根据进度决定）
  getRegionEntryNode(regionId) {
    // 首次进入该地区：播放序章
    if (!Game.getFlag(`visited_${regionId}`)) {
      Game.setFlag(`visited_${regionId}`, true);
      return `prologue_${regionId}_start`;
    }
    // 已访问过：进入地区枢纽（可选择活动）
    return `hub_${regionId}`;
  },

  // 启动序章
  startPrologue(regionId, classId) {
    Game.state.currentStoryPath = `prologue_${regionId}`;
    // 标记该地区已访问，避免再次进入时重复播放序章
    Game.setFlag(`visited_${regionId}`, true);
    this.showNode(`prologue_${regionId}_start`);
  },

  // 显示剧情节点
  showNode(nodeId) {
    const node = this.nodes[nodeId];
    if (!node) {
      console.warn('剧情节点不存在:', nodeId);
      return;
    }
    Game.state.currentStoryNode = nodeId;
    Game.state.phase = 'story';
    // 重置待定数据
    this._pendingText = null;
    this._pendingChoices = null;
    this._pendingEffects = null;
    // 应用进入效果
    if (node.onEnter) node.onEnter();
    // 应用待定文本
    if (this._pendingText) {
      node._displayText = this._pendingText;
    } else {
      node._displayText = node.text || '';
    }
    // 应用待定选项
    if (this._pendingChoices) {
      node._displayChoices = this._pendingChoices;
    } else {
      node._displayChoices = node.choices || [];
    }
    UI.renderStory(node);
  },

  // 应用选项效果
  applyEffects(effects) {
    if (!effects) return;
    const p = Game.state.player;
    if (effects.hp) { p.hp = Utils.clamp(p.hp + effects.hp, 0, p.maxHp); }
    if (effects.mp) { p.mp = Utils.clamp(p.mp + effects.mp, 0, p.maxMp); }
    if (effects.gold) {
      p.gold = Math.max(0, p.gold + effects.gold);
      if (effects.gold !== 0) Utils.floatGold(effects.gold);
    }
    if (effects.exp) { Game.gainExp(effects.exp); }
    if (effects.attrs) {
      Object.entries(effects.attrs).forEach(([k, v]) => { p.attrs[k] += v; });
      Game.recalcStats();
    }
    if (effects.addItem) {
      effects.addItem.forEach(id => Game.addItem(id, effects.addItemCount?.[id] || 1));
    }
    if (effects.removeItem) {
      effects.removeItem.forEach(id => Game.removeItem(id));
    }
    if (effects.affinity) {
      Object.entries(effects.affinity).forEach(([npc, v]) => Game.changeAffinity(npc, v));
    }
    // 支持多个 affinity 对象（affinity2, affinity3...）
    Object.keys(effects).forEach(k => {
      if (k.startsWith('affinity') && k !== 'affinity') {
        Object.entries(effects[k]).forEach(([npc, v]) => Game.changeAffinity(npc, v));
      }
    });
    if (effects.reputation) {
      Object.entries(effects.reputation).forEach(([r, v]) => Game.changeReputation(r, v));
    }
    if (effects.flag) {
      Object.entries(effects.flag).forEach(([k, v]) => Game.setFlag(k, v));
    }
    if (effects.time) {
      Game.advanceTime(effects.time);
    }
    if (effects.careerPath) {
      Game.state.careerPath = effects.careerPath;
      Utils.toast(`你选择了【${World.careerPaths[effects.careerPath].name}】路线`);
    }
  },

  // 检查选项条件
  checkCondition(cond) {
    if (!cond) return true;
    const p = Game.state.player;
    const attrs = Game.getPlayerAttrs();
    if (cond.attrMin) {
      for (const [k, v] of Object.entries(cond.attrMin)) {
        if ((attrs[k] || 0) < v) return false;
      }
    }
    if (cond.hasItem) {
      // 统计每种物品需要的数量（数组中重复出现表示需要多个）
      const counts = {};
      cond.hasItem.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
      for (const [id, need] of Object.entries(counts)) {
        if (!Game.hasItem(id, need)) return false;
      }
    }
    if (cond.flag) {
      for (const [k, v] of Object.entries(cond.flag)) {
        if (Game.getFlag(k) !== v) return false;
      }
    }
    if (cond.affinityMin) {
      for (const [npc, v] of Object.entries(cond.affinityMin)) {
        if (Game.getAffinity(npc) < v) return false;
      }
    }
    if (cond.careerPath) {
      if (Game.state.careerPath !== cond.careerPath) return false;
    }
    if (cond.region) {
      if (Game.state.currentRegion !== cond.region) return false;
    }
    if (cond.gold !== undefined) {
      if (Game.state.player.gold < cond.gold) return false;
    }
    return true;
  },

  // 选择选项
  choose(choice) {
    if (choice.condition && !this.checkCondition(choice.condition)) {
      Utils.toast('条件不满足');
      return;
    }
    // onChoice 回调
    if (choice.onChoice) choice.onChoice();
    // 应用节点级待定效果（训练/社交/探索）
    if (this._pendingEffects) {
      this.applyEffects(this._pendingEffects);
      this._pendingEffects = null;
    }
    // 应用效果
    this.applyEffects(choice.effects);
    // 检定
    if (choice.check) {
      const result = Dice.roll(choice.check.attr, choice.check.dc || 10, choice.check.bonus || 0);
      Dice.showRoll(result, (r) => {
        if (r.result === '大成功' || r.result === '成功') {
          if (choice.success) this.applyEffects(choice.success);
          if (choice.successNode) { this.showNode(choice.successNode); return; }
        } else {
          if (choice.fail) this.applyEffects(choice.fail);
          if (choice.failNode) { this.showNode(choice.failNode); return; }
        }
        this._navigate(choice);
      });
      return;
    }
    // 战斗
    if (choice.combat) {
      Combat.start(choice.combat);
      return;
    }
    this._navigate(choice);
  },

  // 根据选项决定跳转目标
  _navigate(choice) {
    // 动态跳转到主线章节
    if (choice.dynamicChapter && this._pendingChapter) {
      this.showNode(this._pendingChapter);
      return;
    }
    // 动态返回当前地区的遭遇节点
    if (choice.dynamic) {
      this.showNode(`proc_encounter_${Game.state.currentRegion}`);
      return;
    }
    // 动态返回当前地区枢纽
    if (choice.dynamicHub) {
      this.showNode(`hub_${Game.state.currentRegion}`);
      return;
    }
    // 返回世界地图
    if (choice.toWorldMap) {
      Game.state.phase = 'worldMap';
      UI.renderWorldMap();
      return;
    }
    // 跳到下一节点
    if (choice.next) {
      this.showNode(choice.next);
    } else {
      // 返回地图
      Game.state.phase = 'worldMap';
      UI.renderWorldMap();
    }
  }
};

// 初始化剧情节点
Story.initNodes = function() {
  // ========== 序章（按地区） ==========
  // 圣光帝国序章
  this.nodes['prologue_holy_empire_start'] = {
    speaker: '',
    text: '圣光帝国的晨曦洒在圣城的尖塔上。你是帝国的子民，怀揣着梦想踏上了旅途。教廷的钟声悠扬，帝国元老院的议政声隐隐可闻。',
    choices: [
      { text: '前往圣殿，寻求骑士团的指引', next: 'he_story_1', effects: { time: 2 } },
      { text: '去元老院，了解帝国的政治局势', next: 'he_politics_1', effects: { time: 2 } },
      { text: '在城中逛逛，熟悉环境', next: 'he_explore_1', effects: { time: 3 } }
    ]
  };

  // 翡翠森林序章
  this.nodes['prologue_emerald_council_start'] = {
    speaker: '',
    text: '翡翠森林的绿意扑面而来，古树的低语在风中回荡。你是森林的一员，或远道而来的旅人。月光湖畔的精灵们正在筹备月祭。',
    choices: [
      { text: '前往古树，拜见大长老', next: 'ec_story_1', effects: { time: 2 } },
      { text: '去月光湖，结识月影精灵', next: 'ec_npc_lyralei_1', effects: { time: 2 } },
      { text: '在森林中探索', next: 'ec_explore_1', effects: { time: 3 } }
    ]
  };

  // 熔岩邦联序章
  this.nodes['prologue_lava_confederation_start'] = {
    speaker: '',
    text: '炽热的风裹挟着硫磺的气息，熔岩邦联的锻造声此起彼伏。矮人的铁锤敲打出大陆最精良的武器，火山的光芒映红了天空。',
    choices: [
      { text: '去熔炉，拜访铁锤氏族', next: 'lc_story_1', effects: { time: 2 } },
      { text: '前往黑铁商会，了解贸易', next: 'lc_merchant_1', effects: { time: 2 } },
      { text: '参观火山，感受源力', next: 'lc_explore_1', effects: { time: 3 } }
    ]
  };

  // 自由城邦序章
  this.nodes['prologue_free_cities_start'] = {
    speaker: '',
    text: '自由城邦的集市人声鼎沸，金币的叮当声与叫卖声交织。这里是大陆的贸易枢纽，也是机遇与危险并存之地。',
    choices: [
      { text: '去法师学院，拜访大法师', next: 'fc_story_1', effects: { time: 2 } },
      { text: '前往盗贼公会，试探地下世界', next: 'fc_npc_vivienne_1', effects: { time: 2 } },
      { text: '在集市中寻找商机', next: 'fc_merchant_1', effects: { time: 3 } }
    ]
  };

  // 暗影之地序章
  this.nodes['prologue_shadow_lands_start'] = {
    speaker: '',
    text: '暗影之地的迷雾终年不散，亡灵的低语在暗处徘徊。这里是光明的终点，也是黑暗的起点。你踏入了这片禁忌之地。',
    choices: [
      { text: '前往暗影殿，求见暗影领主', next: 'sl_story_1', effects: { time: 2 } },
      { text: '寻找吸血鬼城堡', next: 'sl_npc_draven_1', effects: { time: 2 } },
      { text: '在迷雾中探索', next: 'sl_explore_1', effects: { time: 3 } }
    ]
  };

  // 草原部落序章
  this.nodes['prologue_steppe_tribes_start'] = {
    speaker: '',
    text: '无垠的草原在脚下延伸，风带着牧草与马奶酒的气息。部落的旗帜在风中猎猎作响，大可汗的王帐矗立在草原中央。',
    choices: [
      { text: '前往王帐，拜见大可汗', next: 'st_story_1', effects: { time: 2 } },
      { text: '去牧场，结识苍狼部落', next: 'st_npc_aigul_1', effects: { time: 2 } },
      { text: '骑马驰骋草原', next: 'st_explore_1', effects: { time: 3 } }
    ]
  };

  // ========== 通用地区任务引导 ==========
  this.nodes['region_generic_quest'] = {
    speaker: '',
    text: '艾尔瑟亚大陆广袤无垠，六国各有故事。你可以在世界地图上自由探索，前往不同的地区触发独特的剧情。与 NPC 建立关系，提升好感，甚至可以与心爱之人结婚。你的每一个选择都将影响最终的结局。',
    choices: [
      { text: '打开世界地图', next: null, toWorldMap: true },
      { text: '查看背包', next: 'open_inventory' }
    ]
  };

  this.nodes['open_inventory'] = {
    speaker: '',
    text: '你打开了背包。',
    choices: [{ text: '打开背包', next: null, dynamicHub: true, onChoose: () => UI.openInventory() }]
  };

  // ========== 圣光帝国剧情 ==========
  this.nodes['he_story_1'] = {
    speaker: '',
    text: '圣殿骑士团的训练场上传来阵阵喝彩。一位英姿飒爽的女骑士正在指导新兵训练，她注意到了你。',
    choices: [
      { text: '「你好，我是新来的冒险者。」', next: 'he_elena_1', effects: { affinity: { elena: 5 }, time: 1 } },
      { text: '默默观察训练', next: 'he_watch_1', effects: { time: 1 } }
    ]
  };
  this.nodes['he_elena_1'] = {
    speaker: '艾琳娜',
    text: '「欢迎来到圣殿，旅人。我是艾琳娜，圣殿骑士。看你的气质，似乎不是普通人。来切磋几招如何？」',
    choices: [
      { text: '「乐意奉陪！」（力量检定）', check: { attr: 'str', dc: 12 }, successNode: 'he_duel_win', failNode: 'he_duel_lose', effects: { time: 1 } },
      { text: '「我更想用言语交流。」（魅力检定）', check: { attr: 'cha', dc: 12 }, success: { affinity: { elena: 10 } }, next: 'he_talk_1', effects: { time: 1 } },
      { text: '「改天吧，我还有事。」', next: 'he_story_1' }
    ]
  };
  this.nodes['he_duel_win'] = {
    speaker: '艾琳娜',
    text: '「不错！你的武艺很扎实。有空再来切磋！」她露出了赞许的笑容。',
    choices: [{ text: '继续', next: 'he_politics_intro', effects: { affinity: { elena: 15 }, exp: 20, time: 1 } }]
  };
  this.nodes['he_duel_lose'] = {
    speaker: '艾琳娜',
    text: '「别灰心，多加练习就好。圣殿的大门永远为勤奋者敞开。」',
    choices: [{ text: '继续', next: 'he_politics_intro', effects: { affinity: { elena: 5 }, hp: -5, time: 1 } }]
  };
  this.nodes['he_talk_1'] = {
    speaker: '艾琳娜',
    text: '「你说话很有分寸。最近帝国局势紧张，异端审判庭到处抓人，元老院也在和教廷争权。你要小心行事。」',
    choices: [{ text: '「多谢提醒。」', next: 'he_politics_intro', effects: { time: 1 } }]
  };
  this.nodes['he_watch_1'] = {
    speaker: '',
    text: '你静静地观察着骑士们的训练，从中领悟到了一些战斗技巧。',
    choices: [{ text: '继续', next: 'he_politics_intro', effects: { exp: 10, time: 2 } }]
  };
  this.nodes['he_politics_1'] = {
    speaker: '',
    text: '元老院的议政厅庄严肃穆，贵族们正在激烈讨论。一位枢机主教注意到了你。',
    choices: [
      { text: '上前攀谈（魅力检定）', check: { attr: 'cha', dc: 13 }, success: { affinity: { cardinal_black: 10 }, flag: { he_politics_intro: true } }, fail: { affinity: { cardinal_black: -5 } }, next: 'region_generic_quest', effects: { time: 2 } },
      { text: '旁听后离开', next: 'region_generic_quest', effects: { time: 1 } }
    ]
  };
  this.nodes['he_politics_intro'] = {
    speaker: '',
    text: '你对帝国的神权政治有了初步了解。教宗与枢机院掌握神权，元老院分享世俗权力，而审判庭在暗中执行清洗。',
    choices: [{ text: '选择你的道路', next: 'region_generic_quest' }]
  };
  this.nodes['he_explore_1'] = {
    speaker: '',
    text: '你在圣城中漫步，感受着帝国的繁华与秩序。集市上商品琳琅满目，教堂的歌声悠扬。',
    choices: [{ text: '继续探索', next: 'region_generic_quest', effects: { gold: 20, time: 3 } }]
  };

  // ========== 翡翠森林剧情 ==========
  this.nodes['ec_story_1'] = {
    speaker: '凯鲁姆长老',
    text: '「年轻的旅人，古树告诉我你会来。森林正在枯萎，我们需要找到污染源。你愿意帮助我们吗？」',
    choices: [
      { text: '「我愿意帮忙。」', next: 'ec_quest_1', effects: { affinity: { elder_caelum: 10 }, time: 1 } },
      { text: '「我需要先了解情况。」', next: 'ec_learn_1', effects: { time: 1 } }
    ]
  };
  this.nodes['ec_quest_1'] = {
    speaker: '',
    text: '你开始调查森林枯萎的原因。在森林深处，你发现了黑暗源力的痕迹。',
    choices: [
      { text: '追踪黑暗源力', next: 'ec_dark_1', effects: { time: 2 } },
      { text: '回报长老', next: 'ec_report_1', effects: { time: 1 } }
    ]
  };
  this.nodes['ec_dark_1'] = {
    speaker: '',
    text: '你追踪到了暗影之地的渗透者！他们正在向森林注入黑暗源力。',
    choices: [
      { text: '战斗！', combat: ['dark_mage'], next: 'ec_victory_1' },
      { text: '潜行监视（敏捷检定）', check: { attr: 'dex', dc: 13 }, success: { flag: { ec_spy: true }, exp: 30 }, fail: { hp: -15 }, next: 'ec_after_1', effects: { time: 2 } },
      { text: '谈判（魅力检定）', check: { attr: 'cha', dc: 14 }, success: { affinity: { elder_caelum: 15 }, flag: { ec_peace: true } }, fail: { hp: -10 }, next: 'ec_after_1', effects: { time: 1 } }
    ]
  };
  this.nodes['ec_victory_1'] = {
    speaker: '',
    text: '你击败了暗影渗透者，森林的枯萎暂时停止了。长老对你表示感谢。',
    choices: [{ text: '继续', next: 'region_generic_quest', effects: { affinity: { elder_caelum: 20 }, exp: 50, gold: 30, time: 1 } }]
  };
  this.nodes['ec_after_1'] = {
    speaker: '',
    text: '你处理了森林的危机，翡翠议会对你刮目相看。',
    choices: [{ text: '继续', next: 'region_generic_quest', effects: { exp: 30, time: 1 } }]
  };
  this.nodes['ec_learn_1'] = {
    speaker: '凯鲁姆长老',
    text: '「枯萎始于三年前，从森林边缘向内部蔓延。我们怀疑是暗影之地的亡灵法师所为，但没有证据。」',
    choices: [{ text: '「我明白了，我会帮忙调查。」', next: 'ec_quest_1', effects: { time: 1 } }]
  };
  this.nodes['ec_report_1'] = {
    speaker: '凯鲁姆长老',
    text: '「黑暗源力……果然是他们。感谢你的情报，森林会记住你的恩情。」',
    choices: [{ text: '继续', next: 'region_generic_quest', effects: { affinity: { elder_caelum: 10 }, exp: 20, time: 1 } }]
  };
  this.nodes['ec_npc_lyralei_1'] = {
    speaker: '莉拉蕾',
    text: '「……你是外来者？森林不欢迎鲁莽之人。但你看起来……不太一样。」',
    choices: [
      { text: '「我只是想欣赏月光湖的美景。」（魅力检定）', check: { attr: 'cha', dc: 11 }, success: { affinity: { lyralei: 15 } }, fail: { affinity: { lyralei: -5 } }, next: 'ec_lyralei_2', effects: { time: 1 } },
      { text: '「我来寻找德鲁伊的踪迹。」（感知检定）', check: { attr: 'wis', dc: 12 }, success: { affinity: { lyralei: 10 } }, next: 'ec_lyralei_2', effects: { time: 1 } }
    ]
  };
  this.nodes['ec_lyralei_2'] = {
    speaker: '莉拉蕾',
    text: '「今晚的月色很美，愿意和我一起走走吗？」',
    choices: [{ text: '「荣幸之至。」', next: 'region_generic_quest', effects: { affinity: { lyralei: 10 }, time: 2 } }]
  };
  this.nodes['ec_explore_1'] = {
    speaker: '',
    text: '你在翡翠森林中漫步，古树的低语让你心旷神怡。你采集了一些草药。',
    choices: [{ text: '继续', next: 'region_generic_quest', effects: { addItem: ['herb_pouch'], time: 3 } }]
  };

  // ========== 熔岩邦联剧情 ==========
  this.nodes['lc_story_1'] = {
    speaker: '格鲁尼尔',
    text: '「哈！又一个外来者！来喝一杯！我是格鲁尼尔，铁锤氏族族长！你看起来能喝点？」',
    choices: [
      { text: '「干杯！」（体质检定）', check: { attr: 'con', dc: 12 }, success: { affinity: { grunir: 15 } }, fail: { hp: -10 }, next: 'lc_grunir_2', effects: { time: 2 } },
      { text: '「我更想学锻造。」（智力检定）', check: { attr: 'int', dc: 11 }, success: { affinity: { grunir: 10 }, exp: 20 }, next: 'lc_grunir_2', effects: { time: 2 } }
    ]
  };
  this.nodes['lc_grunir_2'] = {
    speaker: '格鲁尼尔',
    text: '「哈哈！你这小子有意思！最近邦联在筹备熔炉节，需要大量矿石，你要帮忙吗？」',
    choices: [
      { text: '「我去矿场帮忙。」', next: 'lc_mine_1', effects: { time: 2 } },
      { text: '「我去黑铁商会看看。」', next: 'lc_merchant_1', effects: { time: 2 } }
    ]
  };
  this.nodes['lc_mine_1'] = {
    speaker: '',
    text: '你在矿场帮忙开采矿石，虽然辛苦但收获颇丰。',
    choices: [{ text: '继续', next: 'region_generic_quest', effects: { gold: 40, exp: 25, time: 4 } }]
  };
  this.nodes['lc_merchant_1'] = {
    speaker: '恩贝尔夫人',
    text: '「生意归生意，朋友归朋友。邦联的矿产贸易利润丰厚，但各城邦的领主议会总想分一杯羹。你有兴趣做中间商吗？」',
    choices: [
      { text: '「我对经商有兴趣。」', next: 'lc_trade_1', effects: { time: 1 } },
      { text: '「我只是路过。」', next: 'region_generic_quest', effects: { time: 1 } }
    ]
  };
  this.nodes['lc_trade_1'] = {
    speaker: '',
    text: '你参与了邦联的矿产贸易，赚取了第一桶金。',
    choices: [{ text: '继续', next: 'region_generic_quest', effects: { gold: 60, time: 3 } }]
  };
  this.nodes['lc_explore_1'] = {
    speaker: '',
    text: '你参观了活火山，感受到了炽焰源力的脉动。你拾取了一块符文石。',
    choices: [{ text: '继续', next: 'region_generic_quest', effects: { addItem: ['rune_stone'], time: 3 } }]
  };

  // ========== 自由城邦剧情 ==========
  this.nodes['fc_story_1'] = {
    speaker: '索林大法师',
    text: '「知识是最珍贵的财富。你对源力魔法感兴趣吗？学院正在筹备法师比武大会，有兴趣参加吗？」',
    choices: [
      { text: '「我想参加！」（智力检定）', check: { attr: 'int', dc: 12 }, success: { exp: 40, gold: 50 }, fail: { hp: -10 }, next: 'region_generic_quest', effects: { time: 3 } },
      { text: '「我更想了解学院的研究。」', next: 'fc_academy_1', effects: { time: 1 } }
    ]
  };
  this.nodes['fc_academy_1'] = {
    speaker: '',
    text: '你在法师学院的图书馆中阅读了大量源力文献，受益匪浅。',
    choices: [{ text: '继续', next: 'region_generic_quest', effects: { exp: 30, time: 3 } }]
  };
  this.nodes['fc_npc_vivienne_1'] = {
    speaker: '薇薇安',
    text: '「哦？又一个想发财的可怜虫。在自由城邦，信任是最贵的商品。你找我有什么事？」',
    choices: [
      { text: '「我想加入盗贼公会。」（敏捷检定）', check: { attr: 'dex', dc: 13 }, success: { affinity: { vivienne: 15 }, flag: { fc_thief: true } }, fail: { affinity: { vivienne: -10 } }, next: 'region_generic_quest', effects: { time: 2 } },
      { text: '「我只是来打听消息。」', next: 'fc_info_1', effects: { time: 1 } }
    ]
  };
  this.nodes['fc_info_1'] = {
    speaker: '薇薇安',
    text: '「消息是要花钱的。不过看你顺眼，免费告诉你：最近商人议会要选举，各派都在暗中角力。」',
    choices: [{ text: '「多谢。」', next: 'region_generic_quest', effects: { affinity: { vivienne: 5 }, time: 1 } }]
  };
  this.nodes['fc_merchant_1'] = {
    speaker: '',
    text: '你在集市中发现了商机——低价收购本地特产，高价卖到外地。',
    choices: [{ text: '尝试贸易', next: 'region_generic_quest', effects: { gold: 50, time: 3 } }]
  };

  // ========== 暗影之地剧情 ==========
  this.nodes['sl_story_1'] = {
    speaker: '诺克斯女士',
    text: '「我知道你来这里的目的……我知道一切。暗影议会正在肃清异己，你最好选对立场。」',
    choices: [
      { text: '「我想加入暗影议会。」', next: 'sl_join_1', effects: { time: 1 } },
      { text: '「我只是路过。」', next: 'sl_pass_1', effects: { time: 1 } }
    ]
  };
  this.nodes['sl_join_1'] = {
    speaker: '诺克斯女士',
    text: '「有趣……证明你的价值吧。去处理一个不听话的仆从。」',
    choices: [
      { text: '接受任务（战斗）', combat: ['skeleton'], next: 'sl_done_1' },
      { text: '用言语说服（魅力检定）', check: { attr: 'cha', dc: 14 }, success: { affinity: { mistress_nox: 10 }, exp: 30 }, next: 'region_generic_quest', effects: { time: 2 } }
    ]
  };
  this.nodes['sl_done_1'] = {
    speaker: '诺克斯女士',
    text: '「不错……你通过了考验。暗影议会会记住你的。」',
    choices: [{ text: '继续', next: 'region_generic_quest', effects: { affinity: { mistress_nox: 15 }, exp: 30, gold: 40, time: 1 } }]
  };
  this.nodes['sl_pass_1'] = {
    speaker: '',
    text: '你小心翼翼地穿过暗影之地，避免卷入政治斗争。',
    choices: [{ text: '继续', next: 'region_generic_quest', effects: { time: 2 } }]
  };
  this.nodes['sl_npc_draven_1'] = {
    speaker: '德雷文领主',
    text: '「又一个自投罗网的猎物……别怕，我还没饿到那地步。说，你来我的城堡做什么？」',
    choices: [
      { text: '「我对吸血鬼的文化很感兴趣。」（魅力检定）', check: { attr: 'cha', dc: 13 }, success: { affinity: { lord_draven: 15 } }, fail: { hp: -10 }, next: 'region_generic_quest', effects: { time: 2 } },
      { text: '「我来寻找关于暗影议会的情报。」', next: 'sl_draven_2', effects: { time: 1 } }
    ]
  };
  this.nodes['sl_draven_2'] = {
    speaker: '德雷文领主',
    text: '「暗影议会……哼，那群伪君子。你若帮我一个忙，我可以告诉你一些事。」',
    choices: [{ text: '「什么忙？」', next: 'region_generic_quest', effects: { affinity: { lord_draven: 10 }, time: 1 } }]
  };
  this.nodes['sl_explore_1'] = {
    speaker: '',
    text: '你在迷雾中探索，发现了一座古老的墓穴。你拾取了一个骷髅护符。',
    choices: [{ text: '继续', next: 'region_generic_quest', effects: { addItem: ['skull_amulet'], time: 3 } }]
  };

  // ========== 草原部落剧情 ==========
  this.nodes['st_story_1'] = {
    speaker: '巴图尔大可汗',
    text: '「草原的雄鹰啊，你带来了什么消息？各部落蠢蠢欲动，忽里勒台大会即将召开，你支持哪一方？」',
    choices: [
      { text: '「我支持大可汗您。」', next: 'st_support_1', effects: { affinity: { khan_batur: 15 }, time: 1 } },
      { text: '「我保持中立。」', next: 'st_neutral_1', effects: { time: 1 } }
    ]
  };
  this.nodes['st_support_1'] = {
    speaker: '巴图尔大可汗',
    text: '「好！草原需要忠诚的勇士。去见见我的女儿艾古尔吧，她会带你熟悉草原。」',
    choices: [{ text: '「遵命。」', next: 'st_npc_aigul_1', effects: { time: 1 } }]
  };
  this.nodes['st_neutral_1'] = {
    speaker: '巴图尔大可汗',
    text: '「中立……在草原上，中立者往往最先倒下。但我尊重你的选择。」',
    choices: [{ text: '继续', next: 'region_generic_quest', effects: { affinity: { khan_batur: 5 }, time: 1 } }]
  };
  this.nodes['st_npc_aigul_1'] = {
    speaker: '艾古尔可敦',
    text: '「外来者！敢和我赛马吗？草原的风，会告诉我你的来意。」',
    choices: [
      { text: '「比就比！」（敏捷检定）', check: { attr: 'dex', dc: 12 }, success: { affinity: { khatun_aigul: 20 } }, fail: { affinity: { khatun_aigul: 5 } }, next: 'region_generic_quest', effects: { time: 2 } },
      { text: '「我更想和你聊聊。」（魅力检定）', check: { attr: 'cha', dc: 11 }, success: { affinity: { khatun_aigul: 15 } }, next: 'region_generic_quest', effects: { time: 2 } }
    ]
  };
  this.nodes['st_explore_1'] = {
    speaker: '',
    text: '你骑马驰骋在无垠的草原上，风在耳边呼啸。你感受到了自由的力量。',
    choices: [{ text: '继续', next: 'region_generic_quest', effects: { exp: 15, time: 3 } }]
  };

  // ========== 地区深度剧情支线 ==========

  // --- 圣光帝国：异端审判与教廷阴谋 ---
  this.nodes['he_heresy_1'] = {
    speaker: '',
    text: '你在圣城的小巷中发现一名被审判庭追捕的少女。她自称是学者，只因研究了被教廷视为异端的源力文献而遭通缉。她恳求你的帮助。',
    choices: [
      { text: '帮助她躲避追捕（敏捷检定）', check: { attr: 'dex', dc: 13 }, success: { affinity: { elena: -5 }, flag: { he_helped_heretic: true }, exp: 30 }, fail: { hp: -20 }, next: 'he_heresy_2', effects: { time: 1 } },
      { text: '将她交给审判庭', next: 'he_heresy_report', effects: { reputation: { holy_empire: 10 }, time: 1 } },
      { text: '假装没看见', next: 'region_generic_quest', effects: { time: 1 } }
    ]
  };
  this.nodes['he_heresy_2'] = {
    speaker: '少女',
    text: '「谢谢你……我叫塞拉。我发现教廷高层在隐瞒关于源力崩裂的真相。如果你愿意，可以去城外的废弃修道院寻找证据。」',
    choices: [
      { text: '前往废弃修道院', next: 'he_monastery', effects: { time: 2 } },
      { text: '先送她离开', next: 'region_generic_quest', effects: { affinity: { elena: 5 }, exp: 20, time: 2 } }
    ]
  };
  this.nodes['he_heresy_report'] = {
    speaker: '审判官',
    text: '「做得好，信徒。教廷会记住你的忠诚。」审判官带走了少女，她回头看了你一眼，眼中满是绝望。',
    choices: [{ text: '继续', next: 'region_generic_quest', effects: { gold: 30, time: 1 } }]
  };
  this.nodes['he_monastery'] = {
    speaker: '',
    text: '废弃的修道院阴森恐怖。你在地下密室发现了一份古老的文献，上面记载着源力崩裂的真相——旧神并非自然陨落，而是被某种力量吞噬。',
    choices: [
      { text: '带走文献', next: 'region_generic_quest', effects: { addItem: ['ancient_scroll'], exp: 40, flag: { he_truth: true }, time: 2 } },
      { text: '销毁文献，避免事端', next: 'region_generic_quest', effects: { reputation: { holy_empire: 5 }, time: 1 } }
    ]
  };

  // --- 翡翠森林：世界树危机 ---
  this.nodes['ec_worldtree_1'] = {
    speaker: '凯鲁姆长老',
    text: '「世界树的根脉正在被黑暗侵蚀……我们需要深入根脉之穴，净化污染源。但那里危险重重。」',
    choices: [
      { text: '「我愿意前往根脉之穴。」', next: 'ec_root_cave', effects: { time: 2 } },
      { text: '「还有其他办法吗？」', next: 'ec_alt_1', effects: { time: 1 } }
    ]
  };
  this.nodes['ec_root_cave'] = {
    speaker: '',
    text: '根脉之穴中，黑暗源力凝成的怪物正在啃食世界树的根系。你必须击败它们，净化污染源。',
    choices: [
      { text: '战斗！', combat: ['dark_mage', 'giant_spider'], next: 'ec_root_victory' },
      { text: '用自然之力净化（感知检定）', check: { attr: 'wis', dc: 15 }, success: { exp: 80, affinity: { elder_caelum: 20 } }, fail: { hp: -25 }, next: 'ec_root_after', effects: { time: 2 } }
    ]
  };
  this.nodes['ec_root_victory'] = {
    speaker: '',
    text: '你击败了黑暗生物，世界树的根系重新焕发生机。长老对你感激不尽。',
    choices: [{ text: '继续', next: 'region_generic_quest', effects: { affinity: { elder_caelum: 25 }, exp: 80, gold: 60, addItem: ['spirit_charm'], time: 1 } }]
  };
  this.nodes['ec_root_after'] = {
    speaker: '',
    text: '你暂时缓解了世界树的危机，但黑暗的源头仍未根除。',
    choices: [{ text: '继续', next: 'region_generic_quest', effects: { exp: 40, time: 1 } }]
  };
  this.nodes['ec_alt_1'] = {
    speaker: '凯鲁姆长老',
    text: '「除非能找到传说中的月光花，它的花粉能净化黑暗。但月光花只在满月之夜的月光湖畔绽放。」',
    choices: [{ text: '「我去寻找月光花。」', next: 'ec_moonflower', effects: { time: 3 } }]
  };
  this.nodes['ec_moonflower'] = {
    speaker: '',
    text: '你在月光湖畔等待了整夜，终于在黎明前采到了月光花。它散发着柔和的银色光芒。',
    choices: [{ text: '将月光花交给长老', next: 'region_generic_quest', effects: { affinity: { elder_caelum: 20 }, affinity2: { lyralei: 10 }, exp: 50, time: 1 } }]
  };

  // --- 熔岩邦联：熔炉节与火山异变 ---
  this.nodes['lc_festival_1'] = {
    speaker: '格鲁尼尔',
    text: '「熔炉节到了！今年的重头戏是锻造大赛，冠军能获得传说中的「熔炉之心」碎片。小子，要不要参加？」',
    choices: [
      { text: '参加锻造大赛（智力检定）', check: { attr: 'int', dc: 13 }, success: { exp: 60, gold: 100, addItem: ['rune_fragment'] }, fail: { exp: 20 }, next: 'region_generic_quest', effects: { time: 4 } },
      { text: '帮格鲁尼尔准备熔炉节', next: 'lc_prepare', effects: { time: 3 } }
    ]
  };
  this.nodes['lc_prepare'] = {
    speaker: '',
    text: '你帮助格鲁尼尔筹备熔炉节，忙前忙后。在这个过程中，你学到了不少锻造知识，也和矮人们打成了一片。',
    choices: [{ text: '继续', next: 'region_generic_quest', effects: { affinity: { grunir: 15 }, exp: 30, gold: 40, time: 3 } }]
  };
  this.nodes['lc_volcano_1'] = {
    speaker: '',
    text: '火山活动突然加剧！熔岩祭司预言「熔炉之心」正在苏醒，如果不加以压制，整座城邦都将被火山吞没。',
    choices: [
      { text: '深入火山口压制熔炉之心', next: 'lc_volcano_core', effects: { time: 3 } },
      { text: '组织居民疏散', next: 'region_generic_quest', effects: { reputation: { lava_confederation: 15 }, exp: 40, time: 2 } }
    ]
  };
  this.nodes['lc_volcano_core'] = {
    speaker: '',
    text: '火山口深处，一个由熔岩构成的元素生物正在狂暴。它就是「熔炉之心」的化身。',
    choices: [
      { text: '战斗！', combat: ['fire_elemental', 'lava_beast'], next: 'lc_volcano_win' },
      { text: '以锻造之理安抚它（智力检定）', check: { attr: 'int', dc: 16 }, success: { exp: 100, addItem: ['rune_fragment'] }, fail: { hp: -30 }, next: 'region_generic_quest', effects: { time: 2 } }
    ]
  };
  this.nodes['lc_volcano_win'] = {
    speaker: '',
    text: '你击败了熔炉之心的化身，火山恢复了平静。邦联将你视为英雄。',
    choices: [{ text: '继续', next: 'region_generic_quest', effects: { reputation: { lava_confederation: 25 }, exp: 100, gold: 150, addItem: ['rune_fragment'], time: 1 } }]
  };

  // --- 自由城邦：商人议会选举与阴谋 ---
  this.nodes['fc_election_1'] = {
    speaker: '',
    text: '商人议会的选举即将开始，三大派系明争暗斗。现任执政官马洛雇佣你调查对手的黑料。',
    choices: [
      { text: '接受调查任务', next: 'fc_investigate', effects: { gold: 50, time: 2 } },
      { text: '拒绝，保持中立', next: 'region_generic_quest', effects: { time: 1 } }
    ]
  };
  this.nodes['fc_investigate'] = {
    speaker: '',
    text: '你潜入了对手的仓库，发现了他们与暗影之地走私者勾结的证据。但你也被发现了！',
    choices: [
      { text: '战斗突围', combat: ['thug', 'escapee'], next: 'fc_investigate_win' },
      { text: '潜行逃脱（敏捷检定）', check: { attr: 'dex', dc: 14 }, success: { exp: 40 }, fail: { hp: -15 }, next: 'fc_investigate_win', effects: { time: 1 } }
    ]
  };
  this.nodes['fc_investigate_win'] = {
    speaker: '马洛',
    text: '「干得漂亮！有了这些证据，我连任无忧。这是你的报酬。」',
    choices: [{ text: '继续', next: 'region_generic_quest', effects: { gold: 100, reputation: { free_cities: 10 }, exp: 50, time: 1 } }]
  };
  this.nodes['fc_academy_tournament'] = {
    speaker: '索林大法师',
    text: '「学院举办的源力比武大会即将开始，冠军能获得进入禁书区阅读的资格。你有兴趣吗？」',
    choices: [
      { text: '参加比武（智力检定）', check: { attr: 'int', dc: 13 }, success: { exp: 70, addItem: ['ancient_scroll'] }, fail: { hp: -15 }, next: 'region_generic_quest', effects: { time: 3 } },
      { text: '在图书馆自修', next: 'region_generic_quest', effects: { exp: 30, time: 3 } }
    ]
  };

  // --- 暗影之地：吸血鬼氏族与暗影议会 ---
  this.nodes['sl_vampire_war_1'] = {
    speaker: '德雷文领主',
    text: '「暗影议会要剥夺我氏族的领地。如果你帮我对付议会的人，我可以分享议会的秘密。」',
    choices: [
      { text: '帮助德雷文', next: 'sl_vampire_war_2', effects: { affinity: { lord_draven: 20 }, time: 2 } },
      { text: '向暗影议会告密', next: 'sl_betray_draven', effects: { affinity: { mistress_nox: 15 }, affinity2: { lord_draven: -30 }, time: 1 } },
      { text: '拒绝参与', next: 'region_generic_quest', effects: { time: 1 } }
    ]
  };
  this.nodes['sl_vampire_war_2'] = {
    speaker: '',
    text: '你和德雷文的氏族战士伏击了议会的运输队。战斗一触即发！',
    choices: [
      { text: '战斗！', combat: ['renegade', 'ghoul'], next: 'sl_vampire_win' }
    ]
  };
  this.nodes['sl_vampire_win'] = {
    speaker: '德雷文领主',
    text: '「干得好。这是暗影议会的密信，你拿去。记住，在暗影之地，没有永远的朋友。」',
    choices: [{ text: '继续', next: 'region_generic_quest', effects: { affinity: { lord_draven: 25 }, addItem: ['royal_letter'], exp: 60, gold: 80, time: 1 } }]
  };
  this.nodes['sl_betray_draven'] = {
    speaker: '诺克斯女士',
    text: '「明智的选择。德雷文那家伙早就该被肃清了。这是你的奖赏。」',
    choices: [{ text: '继续', next: 'region_generic_quest', effects: { gold: 120, reputation: { shadow_lands: 10 }, exp: 50, time: 1 } }]
  };
  this.nodes['sl_necromancer_1'] = {
    speaker: '',
    text: '一位亡灵法师找到你，声称能让你与亡者对话。他需要你帮忙收集「灵魂之尘」。',
    choices: [
      { text: '帮忙收集（探索墓穴）', next: 'sl_grave', effects: { time: 3 } },
      { text: '拒绝这种邪术', next: 'region_generic_quest', effects: { time: 1 } }
    ]
  };
  this.nodes['sl_grave'] = {
    speaker: '',
    text: '古老的墓穴中，亡灵游荡。你击败了它们，收集到了灵魂之尘。',
    choices: [
      { text: '战斗！', combat: ['skeleton', 'ghoul'], next: 'sl_grave_win' }
    ]
  };
  this.nodes['sl_grave_win'] = {
    speaker: '',
    text: '你带着灵魂之尘返回，亡灵法师十分满意。',
    choices: [{ text: '继续', next: 'region_generic_quest', effects: { exp: 50, addItem: ['skull_shard'], gold: 50, time: 1 } }]
  };

  // --- 草原部落：忽里勒台大会与部落纷争 ---
  this.nodes['st_khuraldai_1'] = {
    speaker: '巴图尔大可汗',
    text: '「忽里勒台大会即将召开，各部落首领齐聚。苍狼部落的首领想夺权，你帮我稳住他们，我必有重谢。」',
    choices: [
      { text: '帮助大可汗', next: 'st_khuraldai_2', effects: { affinity: { khan_batur: 15 }, time: 2 } },
      { text: '暗中支持苍狼部落', next: 'st_wolf_support', effects: { time: 1 } }
    ]
  };
  this.nodes['st_khuraldai_2'] = {
    speaker: '',
    text: '大会上，苍狼部落的首领公然挑战大可汗的权威，双方剑拔弩张。',
    choices: [
      { text: '为大可汗辩护（魅力检定）', check: { attr: 'cha', dc: 14 }, success: { reputation: { steppe_tribes: 15 } }, fail: { reputation: { steppe_tribes: -5 } }, next: 'st_khuraldai_end', effects: { time: 1 } },
      { text: '以武力压制反对者（力量检定）', check: { attr: 'str', dc: 13 }, success: { reputation: { steppe_tribes: 10 } }, fail: { hp: -10 }, next: 'st_khuraldai_end', effects: { time: 1 } }
    ]
  };
  this.nodes['st_khuraldai_end'] = {
    speaker: '巴图尔大可汗',
    text: '「你帮我稳住了联盟。草原会记住你的功劳。」',
    choices: [{ text: '继续', next: 'region_generic_quest', effects: { gold: 80, exp: 50, addItem: ['totem_staff'], time: 1 } }]
  };
  this.nodes['st_wolf_support'] = {
    speaker: '苍狼首领',
    text: '「你愿意支持我？很好。事成之后，草原的一半归你。」',
    choices: [{ text: '继续', next: 'region_generic_quest', effects: { affinity: { khatun_aigul: -10 }, gold: 100, exp: 40, time: 1 } }]
  };
  this.nodes['st_hunt_1'] = {
    speaker: '艾古尔可敦',
    text: '「草原上出现了一头巨大的白狼，它威胁着牧民的安全。和我一起去狩猎吧！」',
    choices: [
      { text: '「当然！」', next: 'st_hunt_2', effects: { affinity: { khatun_aigul: 10 }, time: 2 } }
    ]
  };
  this.nodes['st_hunt_2'] = {
    speaker: '',
    text: '你和艾古尔追踪到了白狼的踪迹。这头巨狼比普通狼大上三倍，眼神中透着智慧。',
    choices: [
      { text: '射杀白狼', combat: ['wolf_pack'], next: 'st_hunt_win' },
      { text: '尝试驯服它（感知检定）', check: { attr: 'wis', dc: 15 }, success: { affinity: { khatun_aigul: 20 }, exp: 60, addItem: ['spirit_charm'] }, fail: { hp: -20 }, next: 'region_generic_quest', effects: { time: 1 } }
    ]
  };
  this.nodes['st_hunt_win'] = {
    speaker: '艾古尔可敦',
    text: '「好箭法！这头白狼的毛皮能做一件上好的斗篷。」',
    choices: [{ text: '继续', next: 'region_generic_quest', effects: { affinity: { khatun_aigul: 15 }, exp: 50, gold: 60, time: 1 } }]
  };

  // ========== 结婚事件 ==========
  this.nodes['marriage_proposal'] = {
    speaker: '',
    text: '你和心爱之人的感情已经深厚到可以托付终身。你决定向TA求婚。',
    choices: [
      { text: '单膝跪地，献上戒指', next: 'marriage_accept', effects: { gold: -100, time: 1 } },
      { text: '再等等吧', next: null }
    ]
  };
  this.nodes['marriage_accept'] = {
    speaker: '',
    text: '「我愿意。」TA的眼中闪烁着幸福的泪光。你们在亲友的祝福下结为连理。',
    onEnter: () => { Game.state.spouse = Game.state.currentProposalTarget; },
    choices: [{ text: '开始新生活', next: null, effects: { flag: { married: true } } }]
  };

  // ========== 结局 ==========
  this.nodes['ending'] = {
    speaker: '',
    text: '你的旅途即将结束。艾尔瑟亚大陆的命运，因你而改变。',
    choices: [{ text: '查看结局', next: 'ending_calculate' }]
  };
  this.nodes['ending_calculate'] = {
    speaker: '',
    text: '',
    onEnter: () => { UI.showEnding(); },
    choices: []
  };

  // ========== 地区枢纽节点 ==========
  // 每个地区的枢纽提供：主线/探查/训练/社交/探索/委托/商店/旅店/锻造/赌博/NPC/离开
  const hubRegions = Object.keys(World.regions);
  hubRegions.forEach(regionId => {
    const region = World.regions[regionId];
    const atm = Procedural.atmosphere[regionId];
    const atmText = atm ? `${atm.sight}\n\n${atm.smell}\n\n` : '';
    this.nodes[`hub_${regionId}`] = {
      speaker: region.name,
      text: `你来到了${region.name}。这里是${region.government}。\n\n${atmText}你可以在此停留，探索这片土地的秘密。`,
      choices: [
        { text: '⚔️ 主线任务', next: 'main_quest' },
        { text: '🔍 探查周围', next: `proc_encounter_${regionId}` },
        { text: '💪 训练能力', next: `proc_train_${regionId}` },
        { text: '🗣️ 社交活动', next: `proc_social_${regionId}` },
        { text: '🌿 探索区域', next: `proc_explore_${regionId}` },
        { text: '📜 接受委托', next: `proc_job_${regionId}` },
        { text: '🤝 拜访NPC', next: `proc_npc_${regionId}` },
        { text: '📖 地区支线', next: `side_quest_${regionId}` },
        { text: '🏨 旅店休息', next: 'proc_inn' },
        { text: '⚒️ 锻造装备', next: 'proc_craft' },
        { text: '🎲 赌场博弈', next: 'proc_gamble' },
        { text: '🏪 查看商店', next: 'shop' },
        { text: '🚶 离开地区', next: 'world_map' }
      ]
    };

    // 随机遭遇节点
    this.nodes[`proc_encounter_${regionId}`] = {
      speaker: '',
      onEnter: () => {
        const enc = Procedural.generateEncounter(regionId);
        const career = Game.state.careerPath || 'adventurer';
        const timeOfDay = Utils.timeOfDay(Game.state.time.hour);
        const atmosphere = Procedural.getAtmosphere(regionId);
        this._pendingText = `${Procedural.timeFlavor[timeOfDay] || ''} ${Procedural.careerFlavor[career] || ''}\n\n${atmosphere}\n\n${enc.text}`;
        this._pendingChoices = Procedural.generateChoices(enc, regionId);
        this._pendingRegion = regionId;
        this._pendingType = enc.type;
      },
      text: '',
      choices: []
    };

    // 训练节点
    this.nodes[`proc_train_${regionId}`] = {
      speaker: '',
      onEnter: () => {
        const t = Procedural.generateTraining();
        this._pendingText = t.text;
        this._pendingEffects = t.effects;
      },
      text: '',
      choices: [
        { text: '返回', next: `hub_${regionId}` }
      ],
      onChoice: () => {
        if (this._pendingEffects) Game.applyEffects(this._pendingEffects);
      }
    };

    // 社交节点
    this.nodes[`proc_social_${regionId}`] = {
      speaker: '',
      onEnter: () => {
        const e = Procedural.generateSocialEvent(regionId);
        this._pendingText = e.text;
        this._pendingEffects = e.effects;
      },
      text: '',
      choices: [
        { text: '返回', next: `hub_${regionId}` }
      ],
      onChoice: () => {
        if (this._pendingEffects) Game.applyEffects(this._pendingEffects);
      }
    };

    // 探索节点
    this.nodes[`proc_explore_${regionId}`] = {
      speaker: '',
      onEnter: () => {
        const e = Procedural.generateExploration(regionId);
        this._pendingText = e.text;
        this._pendingEffects = e.effects;
      },
      text: '',
      choices: [
        { text: '返回', next: `hub_${regionId}` }
      ],
      onChoice: () => {
        if (this._pendingEffects) Game.applyEffects(this._pendingEffects);
      }
    };

    // NPC 对话节点
    this.nodes[`proc_npc_${regionId}`] = {
      speaker: '',
      onEnter: () => {
        const npcs = NPCs.getByRegion(regionId);
        if (npcs.length === 0) {
          this._pendingText = '这里没有你认识的人。';
          this._pendingChoices = [{ text: '返回', next: `hub_${regionId}` }];
          return;
        }
        const list = npcs.map(n => {
          const aff = Game.getAffinity(n.id);
          const stage = Utils.relationStage(aff);
          return { text: `${n.icon} ${n.name}（${n.role}）- ${stage}`, next: `npc_talk_${n.id}` };
        });
        list.push({ text: '返回', next: `hub_${regionId}` });
        this._pendingText = `你在${region.name}可以拜访以下人物：`;
        this._pendingChoices = list;
      },
      text: '',
      choices: []
    };

    // 地区支线任务节点
    const sideQuests = {
      holy_empire: [
        { text: '异端审判：被追捕的少女', next: 'he_heresy_1' },
        { text: '深入修道院', next: 'he_monastery', condition: { flag: { he_helped_heretic: true } } }
      ],
      emerald_council: [
        { text: '世界树危机', next: 'ec_worldtree_1' },
        { text: '寻找月光花', next: 'ec_alt_1' }
      ],
      lava_confederation: [
        { text: '熔炉节锻造大赛', next: 'lc_festival_1' },
        { text: '火山异变', next: 'lc_volcano_1' }
      ],
      free_cities: [
        { text: '商人议会选举', next: 'fc_election_1' },
        { text: '学院比武大会', next: 'fc_academy_tournament' }
      ],
      shadow_lands: [
        { text: '吸血鬼氏族战争', next: 'sl_vampire_war_1' },
        { text: '亡灵法师的委托', next: 'sl_necromancer_1' }
      ],
      steppe_tribes: [
        { text: '忽里勒台大会', next: 'st_khuraldai_1' },
        { text: '白狼狩猎', next: 'st_hunt_1' }
      ]
    };
    this.nodes[`side_quest_${regionId}`] = {
      speaker: '',
      text: `你在${region.name}可以接取以下支线任务：`,
      choices: (sideQuests[regionId] || []).concat([{ text: '返回', next: `hub_${regionId}` }])
    };

    // 委托节点
    this.nodes[`proc_job_${regionId}`] = {
      speaker: '',
      onEnter: () => {
        const enc = Procedural.generateEncounter(regionId, 'job');
        this._pendingText = enc.text;
        this._pendingChoices = Procedural.generateChoices(enc, regionId);
      },
      text: '',
      choices: []
    };
  });

  // ========== NPC 对话节点（动态生成） ==========
  Object.values(NPCs).forEach(npc => {
    this.nodes[`npc_talk_${npc.id}`] = {
      speaker: npc.name,
      onEnter: () => {
        const aff = Game.getAffinity(npc.id);
        const stage = Utils.relationStage(aff);
        const dialogs = npc.dialog[stage] || npc.dialog.stranger || ['……'];
        const line = Utils.pick(dialogs);
        this._pendingText = line;
      },
      text: '',
      choices: [
        { text: '闲聊（+好感）', next: `npc_talk_${npc.id}`, effects: { affinity: { [npc.id]: 3 }, time: 1 } },
        { text: '赠送礼物', next: `npc_gift_${npc.id}` },
        { text: '询问情报', next: `npc_info_${npc.id}`, effects: { time: 1 } },
        { text: '离开', next: null, dynamicHub: true }
      ]
    };

    // 赠送礼物节点
    this.nodes[`npc_gift_${npc.id}`] = {
      speaker: npc.name,
      onEnter: () => {
        const gifts = npc.gifts || [];
        const ownedGift = gifts.find(g => Game.hasItem(g));
        if (ownedGift) {
          Game.removeItem(ownedGift);
          Game.changeAffinity(npc.id, 20);
          this._pendingText = `「这是……送给我的吗？谢谢你！」${npc.name}十分高兴。`;
        } else if (gifts.length === 0) {
          this._pendingText = `${npc.name}似乎对礼物不感兴趣。`;
        } else {
          const giftNames = gifts.map(g => Items.get(g)?.name || g).join('、');
          this._pendingText = `「如果你想送礼，我更喜欢${giftNames}。」`;
        }
      },
      text: '',
      choices: [{ text: '返回', next: `npc_talk_${npc.id}` }]
    };

    // 询问情报节点
    this.nodes[`npc_info_${npc.id}`] = {
      speaker: npc.name,
      onEnter: () => {
        const region = World.regions[npc.region];
        const info = [
          `${region.name}的政体是${region.government}。`,
          `这里的主要势力有${region.factions.map(f => f.name).join('、')}。`,
          `信仰${World.gods[Object.keys(World.gods).find(g => World.gods[g].followers === region.name)]?.name || '本地神祇'}。`
        ];
        this._pendingText = Utils.pick(info);
      },
      text: '',
      choices: [{ text: '返回', next: `npc_talk_${npc.id}` }]
    };
  });

  // ========== 旅店休息 ==========
  this.nodes['proc_inn'] = {
    speaker: '旅店老板',
    text: '欢迎光临！住一晚只要 20 金币，保证让你恢复精力。或者花 50 金币享受豪华套房，完全恢复状态。',
    choices: [
      { text: '普通住宿（20金币，恢复50%生命法力）', next: 'proc_inn_rest', effects: { gold: -20, time: 8 }, condition: { gold: 20 } },
      { text: '豪华套房（50金币，完全恢复）', next: 'proc_inn_luxury', effects: { gold: -50, time: 8 }, condition: { gold: 50 } },
      { text: '离开', next: null, dynamicHub: true }
    ]
  };
  this.nodes['proc_inn_rest'] = {
    speaker: '',
    onEnter: () => {
      const p = Game.state.player;
      p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * 0.5));
      p.mp = Math.min(p.maxMp, p.mp + Math.floor(p.maxMp * 0.5));
      Utils.sleepZzz();
      this._pendingText = '💤 你在旅店美美地睡了一觉，恢复了不少精力。';
    },
    text: '',
    choices: [{ text: '返回', next: null, dynamicHub: true }]
  };
  this.nodes['proc_inn_luxury'] = {
    speaker: '',
    onEnter: () => {
      const p = Game.state.player;
      p.hp = p.maxHp;
      p.mp = p.maxMp;
      Utils.sleepZzz();
      this._pendingText = '💤 豪华套房的服务无可挑剔，你完全恢复了状态，甚至感到精神焕发。';
      Game.gainExp(10);
    },
    text: '',
    choices: [{ text: '返回', next: null, dynamicHub: true }]
  };

  // ========== 锻造系统 ==========
  this.nodes['proc_craft'] = {
    speaker: '锻造师',
    text: '欢迎来到锻造坊！你可以用材料强化装备，或打造新物品。需要锻造工具和相应的材料。',
    choices: [
      { text: '强化武器（需要武器强化石×1）', next: 'craft_weapon', condition: { hasItem: ['weapon_stone'] } },
      { text: '强化护甲（需要护甲强化石×1）', next: 'craft_armor', condition: { hasItem: ['armor_stone'] } },
      { text: '炼制药水（需要神秘草药×2）', next: 'craft_potion', condition: { hasItem: ['mysterious_herb', 'mysterious_herb'] } },
      { text: '离开', next: null, dynamicHub: true }
    ]
  };
  this.nodes['craft_weapon'] = {
    speaker: '',
    onEnter: () => {
      Game.removeItem('weapon_stone');
      Utils.forgeSparks(10);
      const p = Game.state.player;
      p.craftBonus = p.craftBonus || { weapon: 0, armor: 0 };
      p.craftBonus.weapon += 2;
      const w = p.equipment.weapon;
      if (w) {
        this._pendingText = `🔥 锻造炉中火星四溅，你的${Items.get(w).name}被强化了！攻击力 +2。`;
      } else {
        Game.addItem('iron_sword');
        this._pendingText = '你没有装备武器，锻造师为你打造了一把铁剑。';
      }
      Game.gainExp(15);
    },
    text: '',
    choices: [{ text: '返回', next: 'proc_craft' }]
  };
  this.nodes['craft_armor'] = {
    speaker: '',
    onEnter: () => {
      Game.removeItem('armor_stone');
      Utils.forgeSparks(10);
      const p = Game.state.player;
      p.craftBonus = p.craftBonus || { weapon: 0, armor: 0 };
      p.craftBonus.armor += 2;
      const a = p.equipment.armor;
      if (a) {
        this._pendingText = `🔥 锤声铮铮，你的${Items.get(a).name}被强化了！防御力 +2。`;
      } else {
        Game.addItem('leather_armor');
        this._pendingText = '你没有装备护甲，锻造师为你打造了一件皮甲。';
      }
      Game.gainExp(15);
    },
    text: '',
    choices: [{ text: '返回', next: 'proc_craft' }]
  };
  this.nodes['craft_potion'] = {
    speaker: '',
    onEnter: () => {
      Game.removeItem('mysterious_herb', 2);
      Utils.forgeSparks(6);
      Game.addItem('greater_health_potion');
      this._pendingText = '🫧 草药在坩埚中沸腾，你炼制成了一瓶强效生命药水。';
      Game.gainExp(10);
    },
    text: '',
    choices: [{ text: '返回', next: 'proc_craft' }]
  };

  // ========== 赌场博弈 ==========
  this.nodes['proc_gamble'] = {
    speaker: '庄家',
    text: '来试试手气吧！押注金币，猜大小。猜对翻倍，猜错全输。',
    choices: [
      { text: '押 10 金币猜大', next: 'gamble_big', effects: { gold: -10 }, condition: { gold: 10 } },
      { text: '押 10 金币猜小', next: 'gamble_small', effects: { gold: -10 }, condition: { gold: 10 } },
      { text: '押 50 金币猜大', next: 'gamble_big50', effects: { gold: -50 }, condition: { gold: 50 } },
      { text: '离开', next: null, dynamicHub: true }
    ]
  };
  const gambleResult = (bet, guessBig) => {
    Utils.gambleDice();
    const roll = Utils.d20();
    const isBig = roll >= 11;
    const win = (guessBig && isBig) || (!guessBig && !isBig);
    if (win) {
      Game.addGold(bet * 2);
      return `🎲 骰子开出了 ${roll}（${isBig ? '大' : '小'}），你猜对了！赢得 ${bet * 2} 金币！`;
    }
    return `🎲 骰子开出了 ${roll}（${isBig ? '大' : '小'}），你猜错了，损失了 ${bet} 金币。`;
  };
  this.nodes['gamble_big'] = { speaker: '', onEnter: () => { this._pendingText = gambleResult(10, true); }, text: '', choices: [{ text: '再来一局', next: 'proc_gamble' }, { text: '离开', next: null, dynamicHub: true }] };
  this.nodes['gamble_small'] = { speaker: '', onEnter: () => { this._pendingText = gambleResult(10, false); }, text: '', choices: [{ text: '再来一局', next: 'proc_gamble' }, { text: '离开', next: null, dynamicHub: true }] };
  this.nodes['gamble_big50'] = { speaker: '', onEnter: () => { this._pendingText = gambleResult(50, true); }, text: '', choices: [{ text: '再来一局', next: 'proc_gamble' }, { text: '离开', next: null, dynamicHub: true }] };

  // ========== 程序化事件结果节点 ==========
  this.nodes['procedural_after'] = {
    speaker: '',
    text: '',
    onEnter: () => {
      const region = Game.state.currentRegion;
      this._pendingText = '事件结束了。你继续前行。';
    },
    choices: [
      { text: '继续探查', next: null, dynamic: true },
      { text: '返回地区', next: null, dynamicHub: true }
    ]
  };

  this.nodes['procedural_job'] = {
    speaker: '',
    text: '你接受了委托。经过一番努力，任务完成了。',
    choices: [
      { text: '领取报酬', next: 'procedural_job_reward' }
    ]
  };

  this.nodes['procedural_job_reward'] = {
    speaker: '',
    onEnter: () => {
      const region = Game.state.currentRegion;
      const gold = Utils.randInt(30, 80);
      const exp = Utils.randInt(20, 50);
      Game.addGold(gold);
      Game.addExp(exp);
      Game.addReputation(region, 3);
      Game.advanceTime(2);
      this._pendingText = `你获得了 ${gold} 金币、${exp} 经验值，在${World.regions[region].name}的声望提升了。`;
    },
    text: '',
    choices: [
      { text: '返回地区', next: null, dynamicHub: true }
    ]
  };

  // 返回世界地图节点
  this.nodes['world_map'] = {
    speaker: '',
    text: '你离开了这里，踏上了新的旅途。',
    choices: [
      { text: '继续', next: null, toWorldMap: true }
    ]
  };

  // 商店节点
  this.nodes['shop'] = {
    speaker: '商人',
    text: '欢迎光临！这里有各种商品可供选购。',
    choices: [
      { text: '购买治疗药水（50金币）', next: 'shop', effects: { gold: -50, addItem: ['health_potion'] }, condition: { gold: 50 } },
      { text: '购买法力药水（60金币）', next: 'shop', effects: { gold: -60, addItem: ['mana_potion'] }, condition: { gold: 60 } },
      { text: '购买武器强化石（100金币）', next: 'shop', effects: { gold: -100, addItem: ['weapon_stone'] }, condition: { gold: 100 } },
      { text: '购买护甲强化石（100金币）', next: 'shop', effects: { gold: -100, addItem: ['armor_stone'] }, condition: { gold: 100 } },
      { text: '购买神秘卷轴（150金币）', next: 'shop', effects: { gold: -150, addItem: ['ancient_scroll'] }, condition: { gold: 150 } },
      { text: '离开商店', next: null, dynamicHub: true }
    ]
  };

  // ========== 主线任务（按等级解锁章节） ==========
  this.nodes['main_quest'] = {
    speaker: '主线任务',
    onEnter: () => {
      const level = Game.state.player.level;
      const region = World.regions[Game.state.currentRegion];
      let chapter, text;
      if (level >= 20) { chapter = 'mq_ch5'; text = '最终章：命运的抉择。你已拥有改变大陆的力量，是时候面对最终的宿命了。'; }
      else if (level >= 15) { chapter = 'mq_ch4'; text = '第四章：暗影降临。黑暗势力在大陆各地蠢蠢欲动，你必须集结力量，迎接即将到来的风暴。'; }
      else if (level >= 10) { chapter = 'mq_ch3'; text = '第三章：风起云涌。各国之间的矛盾日益尖锐，一场波及整个大陆的危机正在酝酿。'; }
      else if (level >= 5) { chapter = 'mq_ch2'; text = '第二章：盟友与敌人。在旅途中，你结识了许多人，也树敌不少。是时候扩大你的影响力了。'; }
      else { chapter = 'mq_ch1'; text = '第一章：初出茅庐。你刚刚踏上旅途，艾尔瑟亚大陆的秘密等待你去发现。先提升自己的实力吧。'; }
      this._pendingText = `【${chapter.replace('mq_ch','第').replace('ch','章')}】\n\n${text}\n\n你当前的等级是 ${level} 级。`;
      this._pendingChapter = chapter;
    },
    text: '',
    choices: [
      { text: '继续', next: null, dynamicChapter: true }
    ]
  };

  // 第一章
  this.nodes['mq_ch1'] = {
    speaker: '',
    text: '你在旅途中听到了一个传说：在艾尔瑟亚大陆的深处，沉睡着一股名为「源力」的远古力量。据说，谁能掌握源力，谁就能改变世界的命运。\n\n一位神秘的老者拦住了你：「年轻人，源力之路凶险万分。在踏上征途之前，你可愿意接受一个小小的考验？」',
    choices: [
      { text: '「我愿意接受考验。」', next: 'mq_ch1_test', effects: { time: 1 } },
      { text: '「不必了，我会用自己的方式变强。」', next: null, dynamicHub: true }
    ]
  };
  this.nodes['mq_ch1_test'] = {
    speaker: '老者',
    text: '「很好。考验很简单——回答我一个问题：在这片大陆上，什么才是最强大的力量？」',
    choices: [
      { text: '「是武力，强者为尊。」（力量检定）', check: { attr: 'str', dc: 10 }, success: { exp: 40 }, fail: { exp: 10 }, next: 'mq_ch1_result', effects: { time: 1 } },
      { text: '「是智慧，知识改变命运。」（智力检定）', check: { attr: 'int', dc: 10 }, success: { exp: 40 }, fail: { exp: 10 }, next: 'mq_ch1_result', effects: { time: 1 } },
      { text: '「是人心，得民心者得天下。」（魅力检定）', check: { attr: 'cha', dc: 10 }, success: { exp: 40 }, fail: { exp: 10 }, next: 'mq_ch1_result', effects: { time: 1 } }
    ]
  };
  this.nodes['mq_ch1_result'] = {
    speaker: '老者',
    text: '「哈哈哈，答案没有对错，只有选择。你的回答，决定了你未来的道路。去吧，在六国历练，提升到5级，再来找我。」老者消失在风中，只留下一枚源力水晶。',
    choices: [{ text: '继续旅程', next: null, dynamicHub: true, effects: { addItem: ['source_crystal'], exp: 20, time: 1 } }]
  };

  // 第二章
  this.nodes['mq_ch2'] = {
    speaker: '',
    text: '你的实力已经初露锋芒。各国的势力开始注意到你。\n\n在自由城邦的酒馆里，一个戴兜帽的人递给你一张羊皮纸：「低语者在寻找『源力之钥』，如果你先找到它，就能掌握先机。线索在翡翠森林的世界树根部。」',
    choices: [
      { text: '前往翡翠森林寻找线索', next: 'mq_ch2_forest', effects: { time: 3 } },
      { text: '先调查低语者的底细', next: 'mq_ch2_investigate', effects: { time: 2 } }
    ]
  };
  this.nodes['mq_ch2_forest'] = {
    speaker: '',
    text: '你来到世界树的根部，发现一个精灵守卫正在与几个黑衣人战斗。他们就是低语者！',
    choices: [
      { text: '帮助精灵守卫', combat: ['dark_mage', 'thug'], next: 'mq_ch2_forest_win' },
      { text: '趁乱抢夺源力之钥', next: 'mq_ch2_steal', effects: { time: 1 } }
    ]
  };
  this.nodes['mq_ch2_forest_win'] = {
    speaker: '精灵守卫',
    text: '「感谢你的援手！这些低语者觊觎世界树的秘密。这枚源力碎片是长老让我交给有缘人的。」',
    choices: [{ text: '收下碎片', next: null, dynamicHub: true, effects: { addItem: ['source_crystal'], exp: 80, reputation: { emerald_council: 10 }, time: 1 } }]
  };
  this.nodes['mq_ch2_steal'] = {
    speaker: '',
    text: '你趁乱拿到了源力碎片，但被精灵守卫发现了。他们对你产生了敌意。',
    choices: [{ text: '快速逃离', next: null, dynamicHub: true, effects: { addItem: ['source_crystal'], exp: 50, reputation: { emerald_council: -10 }, time: 1 } }]
  };
  this.nodes['mq_ch2_investigate'] = {
    speaker: '',
    text: '你调查了低语者的背景。这个组织遍布六国，暗中收集源力遗物。他们的最终目的似乎是复活「虚无使者」。',
    choices: [{ text: '继续', next: null, dynamicHub: true, effects: { exp: 60, flag: { know_void: true }, time: 2 } }]
  };

  // 第三章
  this.nodes['mq_ch3'] = {
    speaker: '',
    text: '大陆的局势愈发紧张。圣光帝国与暗影之地的边境冲突不断升级，熔岩邦联的火山活动异常活跃。\n\n你在探索中发现了一块古老的石板，上面刻着「源力觉醒」的预言：当六国纷争达到顶点时，源力将选择它的继承者。\n\n你需要在各国之间斡旋，为即将到来的风暴做准备。',
    choices: [
      { text: '前往圣光帝国调停', next: 'mq_ch3_empire', effects: { time: 3 } },
      { text: '前往暗影之地探查', next: 'mq_ch3_shadow', effects: { time: 3 } },
      { text: '集结你认识的盟友', next: 'mq_ch3_allies', effects: { time: 2 } }
    ]
  };
  this.nodes['mq_ch3_empire'] = {
    speaker: '布莱克枢机',
    text: '「暗影之地的亡灵越境袭击，我们必须先发制人！」枢机主教态度强硬。你能说服他冷静吗？',
    choices: [
      { text: '劝说枢机保持克制（魅力检定）', check: { attr: 'cha', dc: 14 }, success: { reputation: { holy_empire: 15, shadow_lands: 5 } }, fail: { reputation: { holy_empire: -5 } }, next: null, dynamicHub: true, effects: { exp: 100, time: 2 } },
      { text: '支持先发制人', next: null, dynamicHub: true, effects: { reputation: { holy_empire: 10, shadow_lands: -10 }, exp: 50, time: 1 } }
    ]
  };
  this.nodes['mq_ch3_shadow'] = {
    speaker: '诺克斯女士',
    text: '「帝国想开战？正好。但你要知道，真正的敌人不在边境，而在暗处。低语者正在策划一场大阴谋。」',
    choices: [
      { text: '与诺克斯合作调查', next: null, dynamicHub: true, effects: { affinity: { mistress_nox: 15 }, exp: 80, flag: { nox_alliance: true }, time: 2 } },
      { text: '婉拒，独自调查', next: null, dynamicHub: true, effects: { exp: 50, time: 1 } }
    ]
  };
  this.nodes['mq_ch3_allies'] = {
    speaker: '',
    text: '你联系了旅途中结识的盟友。艾琳娜、莉拉蕾、格鲁尼尔、薇薇安、德雷文、艾古尔……他们都表示愿意在关键时刻助你一臂之力。',
    choices: [{ text: '继续', next: null, dynamicHub: true, effects: { exp: 100, addItem: ['ancient_scroll'], time: 2 } }]
  };

  // 第四章
  this.nodes['mq_ch4'] = {
    speaker: '',
    text: '黑暗终于露出了獠牙。「虚无使者」的分身出现在大陆各地，屠戮生灵。\n\n你必须在六国之间奔走，说服他们放下分歧，共同对抗虚无使者。你的声望、人脉和实力将经受前所未有的考验。',
    choices: [
      { text: '在圣光帝国发表演说，号召联合（魅力检定）', check: { attr: 'cha', dc: 16 }, success: { reputation: { holy_empire: 20 } }, fail: { hp: -10 }, next: 'mq_ch4_rally', effects: { time: 3 } },
      { text: '直接向六国展示源力水晶的力量', next: 'mq_ch4_show', effects: { time: 2 } }
    ]
  };
  this.nodes['mq_ch4_rally'] = {
    speaker: '',
    text: '你的演说震撼了众人。六国的代表纷纷表示愿意组成联军，共同对抗虚无使者。',
    choices: [{ text: '继续', next: null, dynamicHub: true, effects: { exp: 200, gold: 200, flag: { alliance_formed: true }, time: 2 } }]
  };
  this.nodes['mq_ch4_show'] = {
    speaker: '',
    text: '你展示了源力水晶的力量，光芒笼罩了整个议事厅。各国代表震惊之余，同意联合抗敌。',
    choices: [{ text: '继续', next: null, dynamicHub: true, effects: { exp: 150, gold: 100, flag: { alliance_formed: true }, time: 1 } }]
  };

  // 第五章（最终章）
  this.nodes['mq_ch5'] = {
    speaker: '',
    text: '你终于站在了命运的十字路口。虚无使者的真身就在大陆的中心——源力之渊。\n\n六国的联军已经集结，他们等待着你的领导。你将带领他们进入源力之渊，与虚无使者展开最终决战。\n\n胜，则大陆重获光明；败，则万物归于虚无。',
    choices: [
      { text: '进入源力之渊，迎接最终决战', next: 'mq_final_prep' },
      { text: '再准备一下', next: null, dynamicHub: true }
    ]
  };

  this.nodes['mq_final_prep'] = {
    speaker: '',
    text: '进入源力之渊前，你有最后的准备机会。盟友们为你加油打气。',
    choices: [
      { text: '接受盟友的祝福（恢复全部状态）', next: 'mq_final_boss', effects: { time: 1 } },
      { text: '直接进入决战', next: 'mq_final_boss' }
    ],
    onEnter: () => {
      const p = Game.state.player;
      p.hp = p.maxHp;
      p.mp = p.maxMp;
    }
  };

  // 最终BOSS
  this.nodes['mq_final_boss'] = {
    speaker: '虚无使者',
    text: '「渺小的凡人……你以为区区六国联军就能阻挡虚无？源力本就该归于虚无！」虚无使者的力量令人窒息，但你已无路可退。',
    choices: [
      { text: '战斗！', combat: ['void_herald'], next: 'mq_ending' }
    ]
  };

  this.nodes['mq_ending'] = {
    speaker: '',
    text: '虚无使者在你的面前消散。源力之渊的光芒重新绽放，大陆恢复了和平。\n\n你成为了艾尔瑟亚大陆的救世主，你的名字将被永远铭记。六国的人民在你的旗帜下团结一心，开启了新的纪元。',
    choices: [{ text: '查看结局', next: 'ending_calculate' }]
  };
};

// 结局判定系统
const Endings = {
  // 计算结局
  calculate() {
    const p = Game.state.player;
    const s = Game.state;
    let endingKey = '';
    let endingText = '';
    let endingTitle = '';

    // 基于路线的结局
    const path = s.careerPath || 'adventurer';
    // 基于婚姻
    const spouse = s.spouse;
    // 基于地区声望
    const topRegion = Object.entries(s.reputation).sort((a, b) => b[1] - a[1])[0];
    // 基于属性
    const attrs = Game.getPlayerAttrs();
    const topAttr = Object.entries(attrs).sort((a, b) => b[1] - a[1])[0];

    // 构建结局（组合逻辑，50+ 种）
    const factors = {
      path,
      classId: p.classId,
      spouse: spouse || 'none',
      topRegion: topRegion ? topRegion[0] : 'free_cities',
      topAttr: topAttr ? topAttr[0] : 'str',
      married: !!s.spouse,
      level: p.level
    };

    endingKey = `${path}_${factors.topRegion}_${factors.married ? 'm' : 's'}`;

    const endings = {
      // 从政路线结局
      politician_holy_empire_m: { title: '圣光之相', text: '你以政治家的身份登上了圣光帝国的权力巅峰，与爱人携手治理神权国度。教廷与元老院在你的斡旋下达成和解，帝国迎来了黄金时代。' },
      politician_holy_empire_s: { title: '帝国权臣', text: '你成为了圣光帝国最有权势的政治家，但高处不胜寒。你推行的改革触动了太多人的利益，最终在一场政变中黯然退场。' },
      politician_emerald_council_m: { title: '翡翠议长', text: '你被选为翡翠议会的议长，与精灵伴侣共同守护森林。古树在你的治理下重新焕发生机。' },
      politician_emerald_council_s: { title: '森林外交官', text: '你穿梭于各国之间，以高超的外交手腕维护着翡翠森林的利益。' },
      politician_lava_confederation_m: { title: '邦联议长', text: '你成为了熔岩邦联的轮值议长，与矮人伴侣共同推动了邦联的繁荣。' },
      politician_lava_confederation_s: { title: '城邦调停者', text: '你在各城邦之间斡旋，避免了多次内战。' },
      politician_free_cities_m: { title: '商业执政官', text: '你当选自由城邦的商业执政官，与爱人共同建立了大陆最繁荣的商业联盟。' },
      politician_free_cities_s: { title: '幕后操盘手', text: '你在幕后操纵着自由城邦的经济命脉，无人知晓你的真名。' },
      politician_shadow_lands_m: { title: '暗影之主', text: '你成为了暗影议会的新任领袖，与吸血鬼伴侣共同统治着暗夜。' },
      politician_shadow_lands_s: { title: '暗夜权臣', text: '你在暗影之地的权力斗争中胜出，但永远无法摆脱黑暗的纠缠。' },
      politician_steppe_tribes_m: { title: '草原摄政王', text: '你辅佐大可汗治理草原，与公主伴侣共同守护着游牧民族的自由。' },
      politician_steppe_tribes_s: { title: '部落军师', text: '你成为了草原各部落争相延揽的智囊。' },

      // 经商路线结局
      merchant_holy_empire_m: { title: '圣光首富', text: '你垄断了帝国的圣物贸易，与爱人富甲一方。' },
      merchant_holy_empire_s: { title: '教会商人', text: '你与教廷合作，成为了帝国最大的物资供应商。' },
      merchant_emerald_council_m: { title: '森林商人', text: '你与精灵伴侣共同经营着珍稀草药与魔法物品的贸易。' },
      merchant_emerald_council_s: { title: '草药大亨', text: '你掌控了大陆的草药贸易。' },
      merchant_lava_confederation_m: { title: '矿产之王', text: '你与矮人伴侣垄断了大陆的矿产贸易。' },
      merchant_lava_confederation_s: { title: '矿石商人', text: '你通过矿产贸易积累了巨额财富。' },
      merchant_free_cities_m: { title: '商界传奇', text: '你与爱人建立了大陆最大的商帮，富可敌国。' },
      merchant_free_cities_s: { title: '白手起家', text: '你从一无所有到富甲一方，成为了自由城邦的传奇。' },
      merchant_shadow_lands_m: { title: '暗影商人', text: '你与吸血鬼伴侣在暗中经营着大陆最隐秘的贸易网络。' },
      merchant_shadow_lands_s: { title: '黑市之王', text: '你掌控了大陆的地下贸易。' },
      merchant_steppe_tribes_m: { title: '草原商王', text: '你与公主伴侣垄断了草原的马匹贸易。' },
      merchant_steppe_tribes_s: { title: '马背商人', text: '你在草原与中原之间建立了繁荣的商路。' },

      // 勇者路线结局
      adventurer_holy_empire_m: { title: '圣光英雄', text: '你以勇者的身份拯救了帝国，与爱人被封为帝国的守护英雄。' },
      adventurer_holy_empire_s: { title: '帝国勇者', text: '你的英勇事迹在帝国广为传颂。' },
      adventurer_emerald_council_m: { title: '森林守护者', text: '你与精灵伴侣共同守护着翡翠森林。' },
      adventurer_emerald_council_s: { title: '丛林猎手', text: '你成为了森林中最传奇的猎手。' },
      adventurer_lava_confederation_m: { title: '熔炉勇者', text: '你与矮人伴侣共同抵御了火山的灾变。' },
      adventurer_lava_confederation_s: { title: '火山英雄', text: '你的勇气在邦联传为佳话。' },
      adventurer_free_cities_m: { title: '自由之城的守护者', text: '你与爱人守护着自由城邦的和平。' },
      adventurer_free_cities_s: { title: '都市游侠', text: '你在自由城邦行侠仗义。' },
      adventurer_shadow_lands_m: { title: '暗夜猎手', text: '你与吸血鬼伴侣在暗夜中审判罪恶。' },
      adventurer_shadow_lands_s: { title: '暗影克星', text: '你成为了暗影之地的噩梦。' },
      adventurer_steppe_tribes_m: { title: '草原雄鹰', text: '你与公主伴侣在草原上驰骋，守护着部落的安宁。' },
      adventurer_steppe_tribes_s: { title: '草原勇士', text: '你的勇武在草原上广为流传。' },

      // 法师路线结局
      mage_holy_empire_m: { title: '圣光大法师', text: '你将圣光与魔法结合，与爱人共同开创了新的魔法流派。' },
      mage_holy_empire_s: { title: '教会法师', text: '你成为了教廷的首席法师。' },
      mage_emerald_council_m: { title: '自然大法师', text: '你与精灵伴侣共同研究自然魔法，成为了森林的守护者。' },
      mage_emerald_council_s: { title: '森林贤者', text: '你在翡翠森林隐居，研究自然之力。' },
      mage_lava_confederation_m: { title: '符文宗师', text: '你与矮人伴侣共同完善了符文魔法体系。' },
      mage_lava_confederation_s: { title: '熔炉学者', text: '你在邦联研究源力与锻造的结合。' },
      mage_free_cities_m: { title: '源力权威', text: '你与爱人成为了法师学院的院长，源力理论的集大成者。' },
      mage_free_cities_s: { title: '学院大法师', text: '你在法师学院教书育人。' },
      mage_shadow_lands_m: { title: '死灵大法师', text: '你与吸血鬼伴侣共同探索生死的奥秘。' },
      mage_shadow_lands_s: { title: '暗影学者', text: '你在暗影之地研究禁忌魔法。' },
      mage_steppe_tribes_m: { title: '风之大萨满', text: '你与公主伴侣共同沟通风灵，成为了草原最伟大的萨满。' },
      mage_steppe_tribes_s: { title: '草原萨满', text: '你在草原上传授萨满之道。' }
    };

    const ending = endings[endingKey] || { title: '无名旅人', text: '你在艾尔瑟亚大陆留下了自己的足迹，虽然没有惊天动地的事迹，但你的故事将被人们铭记。' };

    // 添加婚姻对象信息
    if (factors.married && s.spouse) {
      const spouseNpc = NPCs[s.spouse];
      ending.text += ` 你的伴侣是${spouseNpc ? spouseNpc.name : '神秘人'}，TA与你共度了余生。`;
    } else {
      ending.text += ' 你选择了孤独终老，但内心从未后悔自己的选择。';
    }

    // 添加等级信息
    ending.text += ` 你以${p.level}级的实力结束了这段传奇。`;

    return { title: ending.title, text: ending.text, factors };
  }
};
