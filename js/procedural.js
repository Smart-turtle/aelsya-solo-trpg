// 程序化剧情生成引擎 —— 根据地区/职业/时间/NPC关系动态生成海量剧情内容
const Procedural = {
  // 各地区的随机事件模板池
  encounterTemplates: {
    holy_empire: {
      social: [
        '一位枢机主教在街角向你传教，他的眼中闪烁着狂热的光芒。',
        '圣殿骑士团正在招募志愿者，前往边境清剿异端。',
        '元老院的传令官张贴了新的法令，引发市民议论纷纷。',
        '一位修女在分发面包，她微笑着邀请你共进午餐。',
        '帝国卫队正在盘查路人，似乎在追捕逃犯。',
        '教廷的钟声响起，人们纷纷停下脚步祈祷。',
        '一位贵族向你投来审视的目光，似乎在评估你的价值。',
        '集市上，一个孩子丢失了父母，正在哭泣。',
        '审判庭的黑衣人出现在街道上，人群自动让开道路。',
        '一位老神父向你请教关于源力的见解。'
      ],
      combat: [
        '一群异端分子袭击了巡逻队，需要支援！',
        '边境的兽人部落越境劫掠，帝国需要勇士。',
        '堕落的骑士在城外盘踞，危害一方。',
        '邪教徒在地下室举行仪式，必须阻止他们。'
      ],
      explore: [
        '古老的地下墓穴入口被发现，里面藏着什么秘密？',
        '废弃的修道院中传来奇怪的声响。',
        '圣城的下水道似乎连通着某个被遗忘的区域。',
        '传闻城外的森林中有圣光遗迹。'
      ],
      job: [
        '教廷委托你运送圣物到邻近教区。',
        '元老院需要信使前往各国递送外交文书。',
        '商人雇佣你护送商队穿越危险地带。',
        '贵族邀请你担任私人保镖，陪同出行。'
      ]
    },
    emerald_council: {
      social: [
        '精灵长者在古树下冥想，他示意你坐下聆听。',
        '森林的动物们行为异常，似乎在逃避什么。',
        '月光湖畔，精灵们正在举行祭典，邀请你参加。',
        '一位德鲁伊正在救治受伤的小鹿，她需要帮助。',
        '古树的低语变得急促，森林似乎在警告什么。',
        '星辰精灵的占星师预言了不祥之兆。',
        '游侠从森林深处归来，带回了黑暗的消息。',
        '孩子们在林间追逐嬉戏，笑声回荡。',
        '一位精灵诗人正在吟诵古老的史诗。',
        '森林的泉水泛起奇异的光芒。'
      ],
      combat: [
        '暗影渗透者再次出现，正在污染森林！',
        '巨型蜘蛛在古道上结网，袭击旅人。',
        '疯狂的树妖攻击了采集队。',
        '盗猎者正在捕杀珍稀的魔法生物。'
      ],
      explore: [
        '一条被藤蔓覆盖的古道通向未知的深处。',
        '瀑布后似乎隐藏着一个洞穴。',
        '古树的根系延伸向地下，形成了天然的迷宫。',
        '传说中的世界树种子出现在森林深处。'
      ],
      job: [
        '议会委托你调查森林枯萎的源头。',
        '精灵商人需要你护送珍稀草药到自由城邦。',
        '长老请你寻找走失的年轻精灵。',
        '德鲁伊需要你采集稀有的月光花。'
      ]
    },
    lava_confederation: {
      social: [
        '矮人铁匠铺前围满了人，似乎在展示新锻造的武器。',
        '黑铁商会的拍卖会上，一件上古符文甲胄即将成交。',
        '熔炉节的筹备如火如荼，到处是喜庆的气氛。',
        '一位矮人长老邀请你品尝麦酒，聊聊邦联的近况。',
        '城邦议会正在争论矿权分配，气氛紧张。',
        '工匠联盟展示了新发明的源力机械。',
        '火山的活动加剧，祭司们正在举行安抚仪式。',
        '矮人们在酒馆里高歌，杯盏交错。',
        '一位火精灵舞者在街头表演，引来阵阵喝彩。',
        '邦联的传令官宣布了新一轮的采矿配额。'
      ],
      combat: [
        '矿洞深处出现了火焰元素生物！',
        '盗矿者袭击了运输队，必须追回矿石。',
        '火山中的熔岩巨兽苏醒了！',
        '敌对城邦的雇佣兵潜入了矿场。'
      ],
      explore: [
        '一座被遗弃的矮人遗迹被发现。',
        '火山口的裂缝中似乎有什么在发光。',
        '地下河的尽头连接着未知的洞穴。',
        '传说中的熔炉之心藏在火山最深处。'
      ],
      job: [
        '铁锤氏族需要你护送一批精钢到自由城邦。',
        '黑铁商会雇佣你押运金币到暗影之地。',
        '城邦委托你勘测新的矿脉。',
        '工匠大师需要你寻找稀有矿石。'
      ]
    },
    free_cities: {
      social: [
        '商人议会的选举即将开始，各派都在拉票。',
        '盗贼公会的眼线在人群中穿梭，寻找目标。',
        '法师学院的学生在街头表演魔法，引得围观。',
        '一位富商正在招募人手，报酬丰厚。',
        '佣兵行会的布告栏上贴满了委托。',
        '赌场里人声鼎沸，金币的叮当声此起彼伏。',
        '一位吟游诗人在广场上演唱最新的歌谣。',
        '拍卖行即将开始，珍稀物品即将亮相。',
        '码头边，水手们在谈论远方的奇闻。',
        '乞丐向你伸出手，眼中带着哀求。'
      ],
      combat: [
        '盗贼公会的内斗波及到了无辜者。',
        '海盗袭击了商船，需要有人追回货物。',
        '城市守卫在追捕越狱的重犯。',
        '邪教徒在下水道中密谋，必须阻止。'
      ],
      explore: [
        '废弃的仓库区似乎藏着什么秘密。',
        '老城区的地下通道错综复杂。',
        '港口的沉船中可能有宝藏。',
        '法师学院的禁书区有东西在作祟。'
      ],
      job: [
        '商人议会委托你运送货物到各国。',
        '盗贼公会需要你传递密信。',
        '法师学院雇佣你收集魔法材料。',
        '佣兵行会有大量战斗委托。'
      ]
    },
    shadow_lands: {
      social: [
        '迷雾中传来低语，似乎有人在呼唤你的名字。',
        '吸血鬼贵族的马车驶过街道，行人纷纷回避。',
        '暗影议会的传令官带来了新的指令。',
        '亡灵法师在墓地进行实验，散发着诡异的气息。',
        '低语者的情报贩子向你兜售消息。',
        '一座古老的墓穴前，有人在进行神秘仪式。',
        '吸血鬼氏族的晚宴邀请送到了你的手中。',
        '迷雾中传来歌声，凄美而诡异。',
        '一位亡灵商人展示着来自生者世界的商品。',
        '暗影领主的城堡灯火通明，似乎在商议大事。'
      ],
      combat: [
        '失控的亡灵在街道上游荡，攻击活人。',
        '吸血鬼猎人闯入了暗影之地，引发冲突。',
        '叛乱的仆从试图推翻主人。',
        '死灵法师的实验体逃脱了，正在肆虐。'
      ],
      explore: [
        '一座被遗忘的吸血鬼陵墓被发现。',
        '迷雾深处传来古老的钟声。',
        '地下墓穴的最深处藏着什么？',
        '暗影议会的密室入口若隐若现。'
      ],
      job: [
        '暗影议会需要你执行一项秘密任务。',
        '吸血鬼领主雇佣你处理不听话的仆从。',
        '亡灵法师需要你收集特殊材料。',
        '低语者需要你调查敌对势力的动向。'
      ]
    },
    steppe_tribes: {
      social: [
        '部落的骑手们在草原上驰骋，马蹄声如雷。',
        '忽里勒台大会即将召开，各部落首领齐聚。',
        '萨满在火坛前占卜，解读风灵的旨意。',
        '牧人们在篝火旁唱歌，讲述古老的传说。',
        '一场赛马比赛正在进行，欢呼声震天。',
        '大可汗的使者带来了新的命令。',
        '部落之间因牧场发生争执，气氛紧张。',
        '一位老牧民邀请你喝马奶酒，聊聊草原的故事。',
        '孩子们在练习骑射，认真而专注。',
        '草原的风中带着远方的消息。'
      ],
      combat: [
        '马匪袭击了商队，需要追击！',
        '敌对部落的劫掠队出现了。',
        '草原狼群异常凶猛，威胁牧民。',
        '入侵者越过了边境，必须击退。'
      ],
      explore: [
        '草原深处有一座古老的石碑。',
        '传说中的圣泉在草原的某个角落。',
        '一座被遗弃的部落营地引起了注意。',
        '风蚀的岩洞中似乎有壁画。'
      ],
      job: [
        '大可汗需要你传递命令给各部落。',
        '部落首领雇佣你护送商队。',
        '萨满需要你寻找稀有的灵草。',
        '牧民请你帮忙寻找走失的马群。'
      ]
    }
  },

  // 职业相关的事件描述
  careerFlavor: {
    politician: '作为从政者，你时刻关注着权力的动向。',
    merchant: '作为商人，你敏锐地捕捉着每一个商机。',
    adventurer: '作为勇者，你随时准备迎接挑战。',
    mage: '作为法师，你感受着源力的流动。'
  },

  // 时间相关的氛围
  timeFlavor: {
    清晨: '晨光初露，新的一天开始了。',
    正午: '烈日当空，万物都在阳光下活动。',
    午后: '午后的阳光暖洋洋的，人们有些慵懒。',
    黄昏: '夕阳西下，天边染上了金红色。',
    夜晚: '夜幕降临，世界陷入寂静。'
  },

  // 生成一个随机遭遇事件
  generateEncounter(regionId, type) {
    const region = this.encounterTemplates[regionId];
    if (!region) return null;
    const pool = type ? region[type] : this._flattenPool(region);
    if (!pool || pool.length === 0) return null;
    const text = Utils.pick(pool);
    return { text, type: type || this._pickType(region) };
  },

  _flattenPool(region) {
    return [...region.social, ...region.combat, ...region.explore, ...region.job];
  },

  _pickType(region) {
    const types = [];
    if (region.social.length) types.push('social');
    if (region.combat.length) types.push('combat');
    if (region.explore.length) types.push('explore');
    if (region.job.length) types.push('job');
    return Utils.pick(types);
  },

  // 生成遭遇后的选项
  generateChoices(encounter, regionId) {
    const choices = [];
    const attrs = Game.getPlayerAttrs();
    const career = Game.state.careerPath || 'adventurer';

    // 根据遭遇类型生成选项
    switch (encounter.type) {
      case 'social':
        choices.push({ text: '上前交谈（魅力检定）', check: { attr: 'cha', dc: 11 }, success: { exp: 15, gold: 10 }, fail: { affinity: {} }, next: 'procedural_after' });
        choices.push({ text: '观察后离开（感知检定）', check: { attr: 'wis', dc: 10 }, success: { exp: 10 }, next: 'procedural_after' });
        if (career === 'politician') choices.push({ text: '利用政治身份介入', next: 'procedural_after', effects: { exp: 20, reputation: { [regionId]: 5 }, time: 2 } });
        if (career === 'merchant') choices.push({ text: '寻找商机', next: 'procedural_after', effects: { gold: 20, time: 2 } });
        break;
      case 'combat':
        choices.push({ text: '战斗！', combat: this._pickEnemy(regionId), next: 'procedural_after', effects: { time: 1 } });
        choices.push({ text: '潜行绕过（敏捷检定）', check: { attr: 'dex', dc: 12 }, success: { exp: 15 }, fail: { hp: -15 }, next: 'procedural_after' });
        choices.push({ text: '谈判解决（魅力检定）', check: { attr: 'cha', dc: 14 }, success: { exp: 25, gold: 15 }, fail: { hp: -10 }, next: 'procedural_after' });
        break;
      case 'explore':
        choices.push({ text: '进入探索', next: 'procedural_after', effects: { exp: 20, time: 3 } });
        choices.push({ text: '仔细调查（智力检定）', check: { attr: 'int', dc: 12 }, success: { exp: 30, addItem: ['health_potion'] }, fail: { hp: -5 }, next: 'procedural_after' });
        choices.push({ text: '标记位置后离开', next: 'procedural_after', effects: { time: 1 } });
        break;
      case 'job':
        choices.push({ text: '接受委托', next: 'procedural_job', effects: { time: 2 } });
        choices.push({ text: '讨价还价（魅力检定）', check: { attr: 'cha', dc: 11 }, success: { gold: 30 }, next: 'procedural_job', effects: { time: 2 } });
        choices.push({ text: '拒绝并离开', next: 'procedural_after' });
        break;
    }
    choices.push({ text: '离开此地', next: null });
    return choices;
  },

  _pickEnemy(regionId) {
    const enemies = {
      holy_empire: ['heretic', 'bandit', 'orc_raider'],
      emerald_council: ['dark_mage', 'giant_spider', 'poacher'],
      lava_confederation: ['fire_elemental', 'ore_thief', 'lava_beast'],
      free_cities: ['thug', 'pirate', 'escapee'],
      shadow_lands: ['skeleton', 'ghoul', 'renegade'],
      steppe_tribes: ['horse_thief', 'wolf_pack', 'raider']
    };
    return [Utils.pick(enemies[regionId] || ['bandit'])];
  },

  // 生成训练活动
  generateTraining() {
    const trainings = [
      { text: '你进行了体能训练，感到力量有所提升。', effects: { exp: 15, time: 4 } },
      { text: '你练习了法术，对源力的理解更深了。', effects: { exp: 15, mp: 5, time: 4 } },
      { text: '你与武技高手切磋，受益匪浅。', effects: { exp: 20, hp: -5, time: 4 } },
      { text: '你研读了古籍，增长了见识。', effects: { exp: 12, time: 3 } },
      { text: '你进行了冥想，精神更加集中。', effects: { exp: 10, mp: 10, time: 3 } }
    ];
    return Utils.pick(trainings);
  },

  // 生成社交事件
  generateSocialEvent(regionId) {
    const events = [
      { text: '你与当地人交谈，了解了不少风土人情。', effects: { affinity: {}, exp: 8, time: 2 } },
      { text: '你参加了当地的节庆活动，气氛热烈。', effects: { exp: 12, time: 3 } },
      { text: '你在酒馆中听了许多奇闻轶事。', effects: { exp: 10, time: 2 } },
      { text: '你帮助了一位当地人，对方十分感激。', effects: { exp: 15, reputation: { [regionId]: 3 }, time: 2 } }
    ];
    return Utils.pick(events);
  },

  // 生成探索发现
  generateExploration(regionId) {
    const loot = ['health_potion', 'mana_potion', 'gold_coin', 'ancient_scroll', 'mysterious_herb'];
    const finds = [
      { text: '你在角落里发现了一些有用的物品。', effects: { addItem: [Utils.pick(loot)], exp: 10, time: 2 } },
      { text: '你发现了一条隐秘的通道。', effects: { exp: 15, time: 3 } },
      { text: '你找到了前人留下的笔记，学到了一些东西。', effects: { exp: 20, time: 2 } },
      { text: '你在探索中触发了陷阱！', effects: { hp: -10, time: 2 } },
      { text: '你欣赏了美丽的风景，心情愉悦。', effects: { exp: 5, mp: 5, time: 2 } }
    ];
    return Utils.pick(finds);
  }
};
