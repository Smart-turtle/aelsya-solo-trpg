// 角色职业（6地区 × 2特色职业 = 12职业）
const Classes = {
  // 圣光帝国
  paladin: {
    id: 'paladin', name: '圣骑士', region: 'holy_empire',
    desc: '圣光的武装信徒，以信仰与剑刃守护正义。兼具近战与治疗之力。',
    attrs: { str: 16, dex: 10, int: 10, wis: 12, cha: 14, con: 14 },
    hp: 32, mp: 12,
    skills: [
      { id: 'smite', name: '圣光打击', mp: 4, desc: '以圣光之力重击敌人，造成额外神圣伤害。', dmg: 1.8 },
      { id: 'lay_hands', name: '圣疗术', mp: 6, desc: '以圣光治愈自身或盟友，恢复生命。', heal: 20 },
      { id: 'aura', name: '正气光环', mp: 8, desc: '展开正气光环，提升自身防御与抗性。', buff: 'def' }
    ],
    startItems: ['iron_sword', 'chain_mail', 'holy_symbol', 'health_potion']
  },
  inquisitor: {
    id: 'inquisitor', name: '审判者', region: 'holy_empire',
    desc: '异端审判庭的执行者，擅长追查与裁决，能洞察谎言与黑暗。',
    attrs: { str: 14, dex: 12, int: 14, wis: 16, cha: 10, con: 12 },
    hp: 28, mp: 16,
    skills: [
      { id: 'judge', name: '审判之锤', mp: 5, desc: '以审判之力打击敌人，对邪恶目标伤害翻倍。', dmg: 1.6 },
      { id: 'detect', name: '识破谎言', mp: 3, desc: '洞察目标的真实意图，在对话中获得优势。', social: true },
      { id: 'smite_evil', name: '灭邪斩', mp: 7, desc: '对黑暗生物造成毁灭性打击。', dmg: 2.2 }
    ],
    startItems: ['war_hammer', 'leather_armor', 'scroll_of_truth', 'health_potion']
  },

  // 翡翠森林
  druid: {
    id: 'druid', name: '德鲁伊', region: 'emerald_council',
    desc: '自然之力的化身，能操控植物与动物，与自然共鸣。',
    attrs: { str: 10, dex: 12, int: 14, wis: 18, cha: 10, con: 12 },
    hp: 24, mp: 24,
    skills: [
      { id: 'entangle', name: '纠缠术', mp: 4, desc: '召唤藤蔓缠绕敌人，使其无法行动。', cc: true },
      { id: 'heal', name: '自然治愈', mp: 5, desc: '借助自然之力恢复生命。', heal: 18 },
      { id: 'wildshape', name: '野性变身', mp: 8, desc: '变身为野兽，大幅提升战斗力。', buff: 'atk' }
    ],
    startItems: ['oak_staff', 'robes', 'herb_pouch', 'health_potion']
  },
  ranger: {
    id: 'ranger', name: '游侠', region: 'emerald_council',
    desc: '森林的猎手与守护者，精通弓箭与追踪，在自然中如鱼得水。',
    attrs: { str: 12, dex: 18, int: 12, wis: 14, cha: 10, con: 12 },
    hp: 26, mp: 10,
    skills: [
      { id: 'aimed_shot', name: '精准射击', mp: 3, desc: '瞄准要害射出一箭，造成高额伤害。', dmg: 1.9 },
      { id: 'track', name: '追踪', mp: 2, desc: '追踪目标的踪迹，在探索中获得优势。', explore: true },
      { id: 'multishot', name: '多重射击', mp: 6, desc: '同时射出多支箭矢攻击多个目标。', dmg: 1.4 }
    ],
    startItems: ['longbow', 'leather_armor', 'arrows', 'health_potion']
  },

  // 熔岩邦联
  rune_warrior: {
    id: 'rune_warrior', name: '符文战士', region: 'lava_confederation',
    desc: '将源力符文铭刻于武器与护甲的战士，攻防兼备，爆发力惊人。',
    attrs: { str: 18, dex: 10, int: 12, wis: 10, cha: 8, con: 16 },
    hp: 36, mp: 10,
    skills: [
      { id: 'rune_smash', name: '符文重击', mp: 4, desc: '激活武器符文，造成毁灭性打击。', dmg: 2.0 },
      { id: 'rune_armor', name: '符文护甲', mp: 5, desc: '激活护甲符文，大幅提升防御。', buff: 'def' },
      { id: 'magma_burst', name: '熔岩爆发', mp: 7, desc: '召唤熔岩灼烧周围敌人。', dmg: 1.5 }
    ],
    startItems: ['rune_axe', 'plate_armor', 'rune_stone', 'health_potion']
  },
  artisan: {
    id: 'artisan', name: '工匠', region: 'lava_confederation',
    desc: '精通锻造与机械的大师，能制造强力装备与源力装置，以智慧取胜。',
    attrs: { str: 10, dex: 14, int: 18, wis: 12, cha: 10, con: 10 },
    hp: 22, mp: 18,
    skills: [
      { id: 'turret', name: '源力炮台', mp: 6, desc: '部署自动炮台攻击敌人。', dmg: 1.4 },
      { id: 'repair', name: '紧急修复', mp: 4, desc: '修复装备与状态，恢复生命。', heal: 15 },
      { id: 'bomb', name: '源力炸弹', mp: 5, desc: '投掷炸弹造成范围伤害。', dmg: 1.7 }
    ],
    startItems: ['wrench', 'work_gloves', 'crafting_kit', 'health_potion']
  },

  // 自由城邦
  bard: {
    id: 'bard', name: '吟游诗人', region: 'free_cities',
    desc: '游走四方的艺人与情报贩子，以言语与音乐影响人心，人脉广泛。',
    attrs: { str: 8, dex: 12, int: 12, wis: 10, cha: 18, con: 10 },
    hp: 22, mp: 20,
    skills: [
      { id: 'inspire', name: '鼓舞之歌', mp: 4, desc: '以歌声激励盟友，提升战斗力。', buff: 'atk' },
      { id: 'charm', name: '魅惑之语', mp: 5, desc: '以言语魅惑目标，使其放下戒备。', social: true },
      { id: 'lullaby', name: '安眠曲', mp: 6, desc: '让敌人陷入沉睡。', cc: true }
    ],
    startItems: ['lute', 'performers_robe', 'gold_coins', 'health_potion']
  },
  rogue: {
    id: 'rogue', name: '盗贼', region: 'free_cities',
    desc: '暗影中的行者，精通潜行、开锁与背刺，在城市中如鱼得水。',
    attrs: { str: 10, dex: 18, int: 12, wis: 10, cha: 12, con: 10 },
    hp: 24, mp: 8,
    skills: [
      { id: 'backstab', name: '背刺', mp: 3, desc: '从背后突袭敌人，造成巨额伤害。', dmg: 2.2 },
      { id: 'stealth', name: '潜行', mp: 2, desc: '隐藏身形，在探索中避开危险。', explore: true },
      { id: 'poison', name: '淬毒', mp: 4, desc: '为武器淬毒，使敌人中毒。', dot: true }
    ],
    startItems: ['twin_daggers', 'leather_armor', 'lockpick', 'health_potion']
  },

  // 暗影之地
  necromancer: {
    id: 'necromancer', name: '亡灵法师', region: 'shadow_lands',
    desc: '掌控亡者之力的黑暗法师，能召唤亡灵仆从，以生命为代价换取力量。',
    attrs: { str: 8, dex: 10, int: 18, wis: 14, cha: 10, con: 10 },
    hp: 20, mp: 28,
    skills: [
      { id: 'raise_dead', name: '召唤亡灵', mp: 6, desc: '召唤亡者为你而战。', summon: true },
      { id: 'drain', name: '生命汲取', mp: 5, desc: '汲取敌人生命为己所用。', dmg: 1.5, heal: 10 },
      { id: 'curse', name: '死亡诅咒', mp: 7, desc: '降下死亡诅咒，持续削弱敌人。', dot: true }
    ],
    startItems: ['bone_staff', 'dark_robes', 'skull_amulet', 'health_potion']
  },
  assassin: {
    id: 'assassin', name: '刺客', region: 'shadow_lands',
    desc: '暗影议会的利刃，擅长一击必杀与隐匿踪迹，是暗夜中的死神。',
    attrs: { str: 12, dex: 18, int: 12, wis: 12, cha: 10, con: 10 },
    hp: 24, mp: 10,
    skills: [
      { id: 'assassinate', name: '暗杀', mp: 5, desc: '精准的致命一击，有几率直接击杀目标。', dmg: 2.5 },
      { id: 'vanish', name: '消失', mp: 3, desc: '瞬间隐匿身形，脱离战斗或侦查。', explore: true },
      { id: 'poison_blade', name: '毒刃', mp: 4, desc: '以剧毒之刃攻击，使敌人虚弱。', dot: true }
    ],
    startItems: ['shadow_blade', 'dark_cloak', 'poison_vial', 'health_potion']
  },

  // 草原部落
  shaman: {
    id: 'shaman', name: '萨满', region: 'steppe_tribes',
    desc: '沟通风灵与祖灵的智者，能召唤元素之力，为部落带来祝福与灾厄。',
    attrs: { str: 10, dex: 12, int: 16, wis: 16, cha: 12, con: 10 },
    hp: 22, mp: 24,
    skills: [
      { id: 'lightning', name: '闪电链', mp: 5, desc: '召唤闪电链攻击多个敌人。', dmg: 1.6 },
      { id: 'blessing', name: '祖灵祝福', mp: 4, desc: '祈求祖灵祝福，提升全属性。', buff: 'all' },
      { id: 'wind_walk', name: '风行', mp: 3, desc: '借助风灵之力快速移动。', explore: true }
    ],
    startItems: ['totem_staff', 'tribal_robes', 'spirit_charm', 'health_potion']
  },
  berserker: {
    id: 'berserker', name: '狂战士', region: 'steppe_tribes',
    desc: '草原上的战斗机器，进入狂暴后力量倍增，以血还血。',
    attrs: { str: 18, dex: 12, int: 8, wis: 8, cha: 10, con: 16 },
    hp: 38, mp: 6,
    skills: [
      { id: 'rage', name: '狂暴', mp: 3, desc: '进入狂暴状态，攻击力大幅提升但防御下降。', buff: 'atk' },
      { id: 'cleave', name: '横扫', mp: 4, desc: '横扫攻击多个敌人。', dmg: 1.5 },
      { id: 'bloodlust', name: '嗜血', mp: 5, desc: '以自身生命为代价发动致命一击。', dmg: 2.3, hpCost: 10 }
    ],
    startItems: ['greataxe', 'fur_armor', 'war_paint', 'health_potion']
  }
};

// 职业列表按地区分组
Classes.getByRegion = function(regionId) {
  return Object.values(this).filter(c => c.region === regionId);
};
