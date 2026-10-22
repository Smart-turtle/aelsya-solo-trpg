// 艾尔瑟亚世界设定
const World = {
  name: '艾尔瑟亚',
  intro: '在远古的「源力崩裂」之后，旧神陨落，祂们的神力化作「源力」散落于大陆各处。千年以降，六个国度在源力的余烬中崛起，各有其政体、信仰与野心。你，将在这片大陆上书写属于自己的传奇。',

  // 六大地区
  regions: {
    holy_empire: {
      id: 'holy_empire',
      name: '圣光帝国',
      desc: '位于大陆西部的神权国度，以圣光教廷为核心，信仰黎明之神。帝国疆域辽阔，骑士与僧侣遍布各地，是大陆上最强大的军事与宗教力量。',
      government: '神权政治',
      governmentDesc: '由教宗与枢机院共同统治，教宗被视为黎明之神在人间的代行者。',
      climate: '温带大陆性气候，四季分明，西部沿海温暖湿润。',
      factions: [
        { id: 'holy_church', name: '圣光教廷', desc: '帝国的统治核心，掌控信仰与神权。', power: 90 },
        { id: 'templar', name: '圣殿骑士团', desc: '帝国的军事支柱，以圣光武装的精锐骑士。', power: 75 },
        { id: 'senate', name: '帝国元老院', desc: '由贵族组成的议政机构，与教廷分享世俗权力。', power: 60 },
        { id: 'inquisition', name: '异端审判庭', desc: '追查异端与源力滥用的秘密机构。', power: 55 }
      ],
      govLevel: ['教宗', '枢机主教', '大主教', '主教', '神父'],
      priceMod: 1.0,
      color: 0xf5e6c8,
      position: { x: -120, z: -80 }
    },
    emerald_council: {
      id: 'emerald_council',
      name: '翡翠森林议会',
      desc: '大陆北部的广袤森林，由精灵与自然种族组成的议会制国度。古树参天，源力浓郁，居民与自然共生，守护着世界树的根脉。',
      government: '议会共和',
      governmentDesc: '由各族长老组成的翡翠议会共同决策，议席按氏族分配。',
      climate: '温带海洋性气候，常年湿润，森林终年常绿。',
      factions: [
        { id: 'moon_clan', name: '月影氏族', desc: '擅长月之魔法与潜行的精灵氏族。', power: 70 },
        { id: 'leaf_clan', name: '翠叶氏族', desc: '掌握自然之力的德鲁伊氏族。', power: 65 },
        { id: 'ancient_guard', name: '古树守护者', desc: '守护世界树的古老战士。', power: 60 },
        { id: 'star_elves', name: '星辰精灵', desc: '研究星象与预言的精灵学者。', power: 45 }
      ],
      govLevel: ['翡翠议长', '大长老', '长老', '氏族代表', '族人'],
      priceMod: 1.1,
      color: 0x4a8a3a,
      position: { x: 0, z: -140 }
    },
    lava_confederation: {
      id: 'lava_confederation',
      name: '熔岩邦联',
      desc: '大陆南部的火山地带，由矮人与火精灵建立的城邦联盟。这里矿藏丰富，锻造技艺冠绝大陆，各城邦以议会形式联合。',
      government: '城邦联盟',
      governmentDesc: '各城邦高度自治，通过邦联议会协调外交与防务，议长由各邦领主轮值。',
      climate: '亚热带火山气候，炎热干燥，多火山与地热温泉。',
      factions: [
        { id: 'iron_clan', name: '铁锤氏族', desc: '掌握顶级锻造术的矮人氏族。', power: 75 },
        { id: 'blackiron', name: '黑铁商会', desc: '掌控大陆矿产贸易的商业组织。', power: 70 },
        { id: 'lava_priests', name: '熔岩祭司', desc: '崇拜火焰之心的祭司团体。', power: 55 },
        { id: 'engineers', name: '工匠联盟', desc: '研究机械与源力科技的工匠。', power: 50 }
      ],
      govLevel: ['邦联议长', '城邦领主', '长老', '工匠大师', '邦民'],
      priceMod: 0.85,
      color: 0xc9612a,
      position: { x: 100, z: -60 }
    },
    free_cities: {
      id: 'free_cities',
      name: '自由城邦联盟',
      desc: '大陆中部的贸易枢纽，由多个自由城市组成的商业联盟。这里种族混杂、文化交融，是大陆最繁华也最混乱的地区，金钱即是权力。',
      government: '商业寡头',
      governmentDesc: '由各大商帮的代表组成商人议会，经济实力决定政治地位。',
      climate: '地中海气候，温暖宜人，港口众多。',
      factions: [
        { id: 'merchant_council', name: '商人议会', desc: '联盟的最高决策机构，由富商组成。', power: 80 },
        { id: 'thieves_guild', name: '盗贼公会', desc: '掌控地下世界的秘密组织。', power: 60 },
        { id: 'mage_academy', name: '法师学院', desc: '大陆最高学府，研究源力魔法。', power: 65 },
        { id: 'mercenaries', name: '佣兵行会', desc: '提供武装力量的佣兵组织。', power: 50 }
      ],
      govLevel: ['商业执政官', '大商人', '商会代表', '市民', '流民'],
      priceMod: 0.95,
      color: 0x6a7ac9,
      position: { x: 0, z: 0 }
    },
    shadow_lands: {
      id: 'shadow_lands',
      name: '暗影之地',
      desc: '大陆东部的迷雾笼罩之地，亡灵、吸血鬼与暗影术士在此繁衍生息。这里的统治不为人知，权力在暗处流转，是大陆最神秘也最危险的地区。',
      government: '隐秘统治',
      governmentDesc: '由暗影议会在幕后操控，表面上的统治者只是傀儡。',
      climate: '阴冷多雾，常年不见阳光，土地贫瘠。',
      factions: [
        { id: 'shadow_council', name: '暗影议会', desc: '真正的统治者，由七位暗影领主组成。', power: 85 },
        { id: 'necromancers', name: '亡灵法师', desc: '研究亡者之力的法师。', power: 65 },
        { id: 'vampire_clan', name: '吸血鬼氏族', desc: '永生的血族贵族。', power: 60 },
        { id: 'whisperers', name: '低语者', desc: '情报与暗杀组织。', power: 45 }
      ],
      govLevel: ['暗影之主', '暗影领主', '血裔', '仆从', '凡人'],
      priceMod: 1.15,
      color: 0x4a3a6a,
      position: { x: -100, z: 80 }
    },
    steppe_tribes: {
      id: 'steppe_tribes',
      name: '草原部落联盟',
      desc: '大陆东南部的无垠草原，游牧民族在此逐水草而居。各部落勇武好战，在大可汗的旗帜下时而联合、时而纷争，骑射之术名震大陆。',
      government: '部落联盟',
      governmentDesc: '由各部落首领组成的忽里勒台大会推举大可汗，共同决策联盟事务。',
      climate: '温带草原气候，昼夜温差大，冬季严寒。',
      factions: [
        { id: 'wolf_tribe', name: '苍狼部落', desc: '最强大的战斗部落，以狼为图腾。', power: 75 },
        { id: 'eagle_tribe', name: '雄鹰部落', desc: '以弓箭和侦察闻名的部落。', power: 60 },
        { id: 'wind_speakers', name: '风语者', desc: '沟通风灵的萨满部族。', power: 55 },
        { id: 'horse_lords', name: '骏马氏族', desc: '掌控草原贸易与马匹的氏族。', power: 50 }
      ],
      govLevel: ['大可汗', '部落首领', '勇士长', '萨满', '牧民'],
      priceMod: 0.9,
      color: 0x8ac94a,
      position: { x: 120, z: 80 }
    }
  },

  // 种族
  races: {
    human: { name: '人类', desc: '分布最广的种族，适应力强，潜力无限。' },
    elf: { name: '精灵', desc: '长寿且优雅，与自然亲和，擅长魔法。' },
    dwarf: { name: '矮人', desc: '坚毅的山地种族，擅长锻造与战斗。' },
    halfling: { name: '半身人', desc: '灵巧的小个子，善于潜行与社交。' },
    orc: { name: '兽人', desc: '强壮的战斗种族，崇尚力量。' },
    undead: { name: '亡灵', desc: '超越生死的存在，拥有黑暗之力。' },
    tiefling: { name: '恶魔后裔', desc: '带有恶魔血脉的种族，魅力与危险并存。' }
  },

  // 神祇
  gods: {
    dawn: { name: '黎明之神', domain: '光明、正义、新生', followers: '圣光帝国' },
    nature: { name: '自然之母', domain: '生命、自然、丰饶', followers: '翡翠森林' },
    forge: { name: '熔炉之主', domain: '锻造、火焰、工艺', followers: '熔岩邦联' },
    wealth: { name: '商贾之神', domain: '财富、贸易、机遇', followers: '自由城邦' },
    shadow: { name: '暗夜之主', domain: '死亡、暗影、隐秘', followers: '暗影之地' },
    storm: { name: '风暴之灵', domain: '风暴、自由、狩猎', followers: '草原部落' }
  },

  // 源力体系
  sourceEnergy: {
    desc: '旧神陨落后散落的神力，是魔法与超凡力量的源泉。源力浓度因地而异，影响着各地的文明形态。',
    types: ['圣光源力', '自然源力', '炽焰源力', '秘法源力', '暗影源力', '风暴源力']
  },

  // 历史纪元
  eras: [
    { name: '神代纪元', desc: '旧神统治世界的时代，源力充盈。' },
    { name: '崩裂纪元', desc: '源力崩裂，旧神陨落，世界陷入混乱。' },
    { name: '黑暗纪元', desc: '文明倒退，种族在废墟中挣扎求存。' },
    { name: '复兴纪元', desc: '六国崛起，文明重建，源力重新被掌控。' },
    { name: '风云纪元', desc: '当前纪元，六国博弈，暗流涌动。' }
  ],

  // 政治路线
  careerPaths: {
    politician: { name: '从政', desc: '投身各国政治，参与权谋与外交，追求权力与地位。', keyStat: 'cha' },
    merchant: { name: '经商', desc: '穿梭六国贸易，积累财富与人脉，受各国税制影响。', keyStat: 'int' },
    adventurer: { name: '勇者', desc: '接受委托、探索遗迹、讨伐威胁，受各国势力委托。', keyStat: 'str' },
    mage: { name: '法师', desc: '研究源力魔法，在学院与高塔中追求真理，受法术法令约束。', keyStat: 'int' }
  }
};
