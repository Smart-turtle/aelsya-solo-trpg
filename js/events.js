// 世界事件时间表（按时间触发，不依赖玩家）
const WorldEvents = [
  // 圣光帝国
  { id: 'feast_of_dawn', name: '黎明庆典', region: 'holy_empire', month: 3, day: 1,
    desc: '圣光帝国最盛大的节日，纪念黎明之神的诞辰。', effect: { reputation: { holy_empire: 5 } } },
  { id: 'inquisition_purge', name: '异端清洗', region: 'holy_empire', month: 7, day: 15,
    desc: '审判庭发动大规模异端清洗，帝国境内气氛紧张。', effect: { flag: 'purge_active' } },
  { id: 'crusade_call', name: '圣战号召', region: 'holy_empire', year: 2,
    desc: '教廷号召对暗影之地发动圣战。', effect: { flag: 'crusade_active', reputation: { shadow_lands: -10 } } },

  // 翡翠森林
  { id: 'blooming', name: '万木开花', region: 'emerald_council', month: 4, day: 1,
    desc: '森林中所有植物同时开花的奇观。', effect: { item: 'herb_pouch' } },
  { id: 'moon_festival', name: '月祭', region: 'emerald_council', month: 8, day: 15,
    desc: '月影氏族的神圣节日，向月之女神献祭。', effect: { reputation: { emerald_council: 5 } } },
  { id: 'blight', name: '枯萎之灾', region: 'emerald_council', year: 3,
    desc: '神秘的枯萎病蔓延森林，古树守护者紧急应对。', effect: { flag: 'blight_active' } },

  // 熔岩邦联
  { id: 'forge_festival', name: '熔炉节', region: 'lava_confederation', month: 6, day: 1,
    desc: '矮人最盛大的节日，展示锻造技艺与美酒。', effect: { priceMod: 0.8 } },
  { id: 'volcano_eruption', name: '火山爆发', region: 'lava_confederation', year: 2,
    desc: '主火山爆发，邦联进入紧急状态。', effect: { flag: 'volcano_active' } },
  { id: 'trade_fair', name: '矿产博览会', region: 'lava_confederation', month: 10, day: 1,
    desc: '大陆各国商人云集的矿产交易盛会。', effect: { flag: 'trade_fair_active' } },

  // 自由城邦
  { id: 'golden_auction', name: '黄金拍卖会', region: 'free_cities', month: 5, day: 20,
    desc: '一年中最盛大的拍卖会，稀世珍宝云集。', effect: { flag: 'auction_active' } },
  { id: 'merchant_council_election', name: '商人议会选举', region: 'free_cities', year: 2,
    desc: '商人议会换届选举，各派势力暗中角力。', effect: { flag: 'election_active' } },
  { id: 'mage_tournament', name: '法师比武大会', region: 'free_cities', month: 9, day: 1,
    desc: '法师学院举办的源力技艺大赛。', effect: { flag: 'tournament_active' } },

  // 暗影之地
  { id: 'night_of_blood', name: '血夜', region: 'shadow_lands', month: 12, day: 1,
    desc: '吸血鬼氏族的神圣之夜，血族的狂欢。', effect: { flag: 'blood_night' } },
  { id: 'shadow_purge', name: '暗影肃清', region: 'shadow_lands', year: 1,
    desc: '暗影议会内部肃清异己。', effect: { flag: 'shadow_purge' } },
  { id: 'necromancer_conclave', name: '亡灵法会', region: 'shadow_lands', month: 11, day: 15,
    desc: '亡灵法师的秘密集会。', effect: { flag: 'conclave_active' } },

  // 草原部落
  { id: 'great_hunt', name: '围猎大典', region: 'steppe_tribes', month: 7, day: 1,
    desc: '草原各部落联合围猎，展示勇武。', effect: { reputation: { steppe_tribes: 5 } } },
  { id: 'kurultai', name: '忽里勒台大会', region: 'steppe_tribes', year: 3,
    desc: '各部落首领集会，推举大可汗。', effect: { flag: 'kurultai_active' } },
  { id: 'horse_races', name: '那达慕大会', region: 'steppe_tribes', month: 8, day: 1,
    desc: '赛马、摔跤、射箭的草原盛会。', effect: { flag: 'nadam_active' } }
];

// 获取当前时间应触发的事件
WorldEvents.getForTime = function(era, year, month, day) {
  return this.filter(e => {
    if (e.year && e.year !== year) return false;
    if (e.month && e.month !== month) return false;
    if (e.day && e.day !== day) return false;
    return true;
  });
};

// 随机事件（休息/旅行时触发）
const RandomEvents = [
  { id: 'wandering_merchant', name: '流浪商人', desc: '你遇到了一位流浪商人，他有一些稀奇的货物。', options: ['查看商品', '离开'] },
  { id: 'lost_traveler', name: '迷路的旅人', desc: '一位旅人请求你的帮助。', options: ['帮助他', '忽略他'] },
  { id: 'strange_ruins', name: '神秘遗迹', desc: '你发现了一处古老的遗迹。', options: ['探索', '离开'] },
  { id: 'bandit_ambush', name: '强盗伏击', desc: '一群强盗拦住了你的去路！', options: ['战斗', '谈判', '逃跑'] },
  { id: 'wild_beast', name: '野兽袭击', desc: '一头野兽向你扑来！', options: ['战斗', '逃跑'] },
  { id: 'kind_stranger', name: '好心的陌生人', desc: '一位陌生人请你吃了顿饭。', options: ['感谢'] },
  { id: 'ancient_shrine', name: '古老神龛', desc: '路边有一座古老的神龛，似乎可以祈祷。', options: ['祈祷', '离开'] },
  { id: 'traveling_bard', name: '游吟诗人', desc: '一位游吟诗人为你讲述了远方的故事。', options: ['聆听'] }
];

RandomEvents.roll = function() {
  return this[Math.floor(Math.random() * this.length)];
};
