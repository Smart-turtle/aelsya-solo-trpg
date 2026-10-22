// 剧情系统：节点、选择、结局
const Story = {
  nodes: {},
  currentNode: null,

  // 启动序章
  startPrologue(regionId, classId) {
    Game.state.currentStoryPath = `prologue_${regionId}`;
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
    // 应用进入效果
    if (node.onEnter) node.onEnter();
    UI.renderStory(node);
  },

  // 应用选项效果
  applyEffects(effects) {
    if (!effects) return;
    const p = Game.state.player;
    if (effects.hp) { p.hp = Utils.clamp(p.hp + effects.hp, 0, p.maxHp); }
    if (effects.mp) { p.mp = Utils.clamp(p.mp + effects.mp, 0, p.maxMp); }
    if (effects.gold) { p.gold += effects.gold; }
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
      if (!cond.hasItem.every(id => Game.hasItem(id))) return false;
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
    return true;
  },

  // 选择选项
  choose(choice) {
    if (choice.condition && !this.checkCondition(choice.condition)) {
      Utils.toast('条件不满足');
      return;
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
        if (choice.next) this.showNode(choice.next);
      });
      return;
    }
    // 战斗
    if (choice.combat) {
      Combat.start(choice.combat);
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

  // ========== 通用：路线选择 ==========
  this.nodes['career_choice'] = {
    speaker: '',
    text: '在你的旅途中，你需要选择一条属于自己的道路。你的选择将影响你与各国势力的关系，以及最终的命运。',
    choices: [
      { text: '从政——投身各国政治，追求权力', effects: { careerPath: 'politician' }, next: 'career_politics_intro' },
      { text: '经商——穿梭六国贸易，积累财富', effects: { careerPath: 'merchant' }, next: 'career_merchant_intro' },
      { text: '勇者——接受委托，探索未知', effects: { careerPath: 'adventurer' }, next: 'career_adventurer_intro' },
      { text: '法师——研究源力，追求真理', effects: { careerPath: 'mage' }, next: 'career_mage_intro' }
    ]
  };

  this.nodes['career_politics_intro'] = {
    speaker: '',
    text: '你选择了从政之路。各国的政体各异：神权、议会、寡头、隐秘统治……你将与各国的政治层级人物打交道，在权谋与外交中寻找自己的位置。',
    choices: [{ text: '继续旅程', next: 'region_generic_quest' }]
  };
  this.nodes['career_merchant_intro'] = {
    speaker: '',
    text: '你选择了经商之路。六国的物价各异，贸易协定与税收将影响你的利润。但要小心——商业永远与政治交织。',
    choices: [{ text: '继续旅程', next: 'region_generic_quest' }]
  };
  this.nodes['career_adventurer_intro'] = {
    speaker: '',
    text: '你选择了勇者之路。各国都有需要解决的问题与委托，你的实力与人脉将决定你能走多远。',
    choices: [{ text: '继续旅程', next: 'region_generic_quest' }]
  };
  this.nodes['career_mage_intro'] = {
    speaker: '',
    text: '你选择了法师之路。源力是这个世界的根基，各国对法术的态度不一——有的尊崇，有的忌惮。',
    choices: [{ text: '继续旅程', next: 'region_generic_quest' }]
  };

  // ========== 通用地区任务引导 ==========
  this.nodes['region_generic_quest'] = {
    speaker: '',
    text: '艾尔瑟亚大陆广袤无垠，六国各有故事。你可以在世界地图上自由探索，前往不同的地区触发独特的剧情。与 NPC 建立关系，提升好感，甚至可以与心爱之人结婚。你的每一个选择都将影响最终的结局。',
    choices: [
      { text: '打开世界地图', next: null, effects: {} },
      { text: '查看背包', next: 'open_inventory' }
    ]
  };

  this.nodes['open_inventory'] = {
    speaker: '',
    text: '你打开了背包。',
    choices: [{ text: '打开背包', next: null, onChoose: () => UI.openInventory() }]
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
      { text: '上前攀谈（魅力检定）', check: { attr: 'cha', dc: 13 }, success: { affinity: { cardinal_black: 10 }, flag: { he_politics_intro: true } }, fail: { affinity: { cardinal_black: -5 } }, next: 'career_choice', effects: { time: 2 } },
      { text: '旁听后离开', next: 'career_choice', effects: { time: 1 } }
    ]
  };
  this.nodes['he_politics_intro'] = {
    speaker: '',
    text: '你对帝国的神权政治有了初步了解。教宗与枢机院掌握神权，元老院分享世俗权力，而审判庭在暗中执行清洗。',
    choices: [{ text: '选择你的道路', next: 'career_choice' }]
  };
  this.nodes['he_explore_1'] = {
    speaker: '',
    text: '你在圣城中漫步，感受着帝国的繁华与秩序。集市上商品琳琅满目，教堂的歌声悠扬。',
    choices: [{ text: '继续探索', next: 'career_choice', effects: { gold: 20, time: 3 } }]
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
    choices: [{ text: '继续', next: 'career_choice', effects: { affinity: { elder_caelum: 20 }, exp: 50, gold: 30, time: 1 } }]
  };
  this.nodes['ec_after_1'] = {
    speaker: '',
    text: '你处理了森林的危机，翡翠议会对你刮目相看。',
    choices: [{ text: '继续', next: 'career_choice', effects: { exp: 30, time: 1 } }]
  };
  this.nodes['ec_learn_1'] = {
    speaker: '凯鲁姆长老',
    text: '「枯萎始于三年前，从森林边缘向内部蔓延。我们怀疑是暗影之地的亡灵法师所为，但没有证据。」',
    choices: [{ text: '「我明白了，我会帮忙调查。」', next: 'ec_quest_1', effects: { time: 1 } }]
  };
  this.nodes['ec_report_1'] = {
    speaker: '凯鲁姆长老',
    text: '「黑暗源力……果然是他们。感谢你的情报，森林会记住你的恩情。」',
    choices: [{ text: '继续', next: 'career_choice', effects: { affinity: { elder_caelum: 10 }, exp: 20, time: 1 } }]
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
    choices: [{ text: '「荣幸之至。」', next: 'career_choice', effects: { affinity: { lyralei: 10 }, time: 2 } }]
  };
  this.nodes['ec_explore_1'] = {
    speaker: '',
    text: '你在翡翠森林中漫步，古树的低语让你心旷神怡。你采集了一些草药。',
    choices: [{ text: '继续', next: 'career_choice', effects: { addItem: ['herb_pouch'], time: 3 } }]
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
    choices: [{ text: '继续', next: 'career_choice', effects: { gold: 40, exp: 25, time: 4 } }]
  };
  this.nodes['lc_merchant_1'] = {
    speaker: '恩贝尔夫人',
    text: '「生意归生意，朋友归朋友。邦联的矿产贸易利润丰厚，但各城邦的领主议会总想分一杯羹。你有兴趣做中间商吗？」',
    choices: [
      { text: '「我对经商有兴趣。」', next: 'lc_trade_1', effects: { time: 1 } },
      { text: '「我只是路过。」', next: 'career_choice', effects: { time: 1 } }
    ]
  };
  this.nodes['lc_trade_1'] = {
    speaker: '',
    text: '你参与了邦联的矿产贸易，赚取了第一桶金。',
    choices: [{ text: '继续', next: 'career_choice', effects: { gold: 60, time: 3 } }]
  };
  this.nodes['lc_explore_1'] = {
    speaker: '',
    text: '你参观了活火山，感受到了炽焰源力的脉动。你拾取了一块符文石。',
    choices: [{ text: '继续', next: 'career_choice', effects: { addItem: ['rune_stone'], time: 3 } }]
  };

  // ========== 自由城邦剧情 ==========
  this.nodes['fc_story_1'] = {
    speaker: '索林大法师',
    text: '「知识是最珍贵的财富。你对源力魔法感兴趣吗？学院正在筹备法师比武大会，有兴趣参加吗？」',
    choices: [
      { text: '「我想参加！」（智力检定）', check: { attr: 'int', dc: 12 }, success: { exp: 40, gold: 50 }, fail: { hp: -10 }, next: 'career_choice', effects: { time: 3 } },
      { text: '「我更想了解学院的研究。」', next: 'fc_academy_1', effects: { time: 1 } }
    ]
  };
  this.nodes['fc_academy_1'] = {
    speaker: '',
    text: '你在法师学院的图书馆中阅读了大量源力文献，受益匪浅。',
    choices: [{ text: '继续', next: 'career_choice', effects: { exp: 30, time: 3 } }]
  };
  this.nodes['fc_npc_vivienne_1'] = {
    speaker: '薇薇安',
    text: '「哦？又一个想发财的可怜虫。在自由城邦，信任是最贵的商品。你找我有什么事？」',
    choices: [
      { text: '「我想加入盗贼公会。」（敏捷检定）', check: { attr: 'dex', dc: 13 }, success: { affinity: { vivienne: 15 }, flag: { fc_thief: true } }, fail: { affinity: { vivienne: -10 } }, next: 'career_choice', effects: { time: 2 } },
      { text: '「我只是来打听消息。」', next: 'fc_info_1', effects: { time: 1 } }
    ]
  };
  this.nodes['fc_info_1'] = {
    speaker: '薇薇安',
    text: '「消息是要花钱的。不过看你顺眼，免费告诉你：最近商人议会要选举，各派都在暗中角力。」',
    choices: [{ text: '「多谢。」', next: 'career_choice', effects: { affinity: { vivienne: 5 }, time: 1 } }]
  };
  this.nodes['fc_merchant_1'] = {
    speaker: '',
    text: '你在集市中发现了商机——低价收购本地特产，高价卖到外地。',
    choices: [{ text: '尝试贸易', next: 'career_choice', effects: { gold: 50, time: 3 } }]
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
      { text: '用言语说服（魅力检定）', check: { attr: 'cha', dc: 14 }, success: { affinity: { mistress_nox: 10 }, exp: 30 }, next: 'career_choice', effects: { time: 2 } }
    ]
  };
  this.nodes['sl_done_1'] = {
    speaker: '诺克斯女士',
    text: '「不错……你通过了考验。暗影议会会记住你的。」',
    choices: [{ text: '继续', next: 'career_choice', effects: { affinity: { mistress_nox: 15 }, exp: 30, gold: 40, time: 1 } }]
  };
  this.nodes['sl_pass_1'] = {
    speaker: '',
    text: '你小心翼翼地穿过暗影之地，避免卷入政治斗争。',
    choices: [{ text: '继续', next: 'career_choice', effects: { time: 2 } }]
  };
  this.nodes['sl_npc_draven_1'] = {
    speaker: '德雷文领主',
    text: '「又一个自投罗网的猎物……别怕，我还没饿到那地步。说，你来我的城堡做什么？」',
    choices: [
      { text: '「我对吸血鬼的文化很感兴趣。」（魅力检定）', check: { attr: 'cha', dc: 13 }, success: { affinity: { lord_draven: 15 } }, fail: { hp: -10 }, next: 'career_choice', effects: { time: 2 } },
      { text: '「我来寻找关于暗影议会的情报。」', next: 'sl_draven_2', effects: { time: 1 } }
    ]
  };
  this.nodes['sl_draven_2'] = {
    speaker: '德雷文领主',
    text: '「暗影议会……哼，那群伪君子。你若帮我一个忙，我可以告诉你一些事。」',
    choices: [{ text: '「什么忙？」', next: 'career_choice', effects: { affinity: { lord_draven: 10 }, time: 1 } }]
  };
  this.nodes['sl_explore_1'] = {
    speaker: '',
    text: '你在迷雾中探索，发现了一座古老的墓穴。你拾取了一个骷髅护符。',
    choices: [{ text: '继续', next: 'career_choice', effects: { addItem: ['skull_amulet'], time: 3 } }]
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
    choices: [{ text: '继续', next: 'career_choice', effects: { affinity: { khan_batur: 5 }, time: 1 } }]
  };
  this.nodes['st_npc_aigul_1'] = {
    speaker: '艾古尔可敦',
    text: '「外来者！敢和我赛马吗？草原的风，会告诉我你的来意。」',
    choices: [
      { text: '「比就比！」（敏捷检定）', check: { attr: 'dex', dc: 12 }, success: { affinity: { khatun_aigul: 20 } }, fail: { affinity: { khatun_aigul: 5 } }, next: 'career_choice', effects: { time: 2 } },
      { text: '「我更想和你聊聊。」（魅力检定）', check: { attr: 'cha', dc: 11 }, success: { affinity: { khatun_aigul: 15 } }, next: 'career_choice', effects: { time: 2 } }
    ]
  };
  this.nodes['st_explore_1'] = {
    speaker: '',
    text: '你骑马驰骋在无垠的草原上，风在耳边呼啸。你感受到了自由的力量。',
    choices: [{ text: '继续', next: 'career_choice', effects: { exp: 15, time: 3 } }]
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

    return { title: ending.title, text: ending.text };
  }
};
