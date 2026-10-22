// NPC 数据
const NPCs = {
  // 圣光帝国
  elena: {
    id: 'elena', name: '艾琳娜', region: 'holy_empire', role: '圣殿骑士',
    icon: '⚔️', desc: '英姿飒爽的圣殿骑士，信仰坚定，追求正义。',
    affinity: 0, marriageable: true, gender: 'female',
    schedule: { morning: '圣殿', afternoon: '训练场', evening: '教堂' },
    dialog: {
      stranger: [
        '愿圣光与你同在，旅人。',
        '你来帝国所为何事？'
      ],
      acquaintance: [
        '又见面了，看来我们有缘。',
        '最近帝国不太平，你要小心。'
      ],
      friendly: [
        '见到你真高兴！',
        '要不要一起去训练场切磋？'
      ],
      intimate: [
        '你来了……我一直在等你。',
        '在你身边，我感到很安心。'
      ],
      lover: [
        '亲爱的，今天过得好吗？',
        '只要有你在，圣光于我便已足够。'
      ]
    },
    gifts: ['holy_symbol', 'silver_sword'],
    personalQuest: 'elena_quest'
  },
  father_tomas: {
    id: 'father_tomas', name: '托马斯神父', region: 'holy_empire', role: '神父',
    icon: '✝️', desc: '慈祥的老神父，倾听信徒的烦恼。',
    affinity: 0, marriageable: false, gender: 'male',
    schedule: { morning: '教堂', afternoon: '教堂', evening: '教堂' },
    dialog: { stranger: ['愿圣光庇佑你。'], acquaintance: ['孩子，有什么我能帮你的吗？'] }
  },
  cardinal_black: {
    id: 'cardinal_black', name: '布莱克枢机', region: 'holy_empire', role: '枢机主教',
    icon: '👑', desc: '帝国枢机院的实权人物，城府极深。',
    affinity: 0, marriageable: false, gender: 'male', political: true,
    schedule: { morning: '教廷', afternoon: '教廷', evening: '宅邸' },
    dialog: { stranger: ['你找我有何贵干？'], acquaintance: ['有趣……你让我想起了年轻时的自己。'] }
  },

  // 翡翠森林
  lyralei: {
    id: 'lyralei', name: '莉拉蕾', region: 'emerald_council', role: '月影精灵',
    icon: '🌙', desc: '月影氏族的精灵猎手，神秘而优雅。',
    affinity: 0, marriageable: true, gender: 'female',
    schedule: { morning: '森林', afternoon: '月光湖', evening: '月影塔' },
    dialog: {
      stranger: ['……你是外来者？', '森林不欢迎鲁莽之人。'],
      acquaintance: ['你不像其他外来者那样粗俗。', '今晚的月色很美。'],
      friendly: ['愿意和我一起去月光湖吗？', '森林的精灵们开始接受你了。'],
      intimate: ['在月光下，我对你没有秘密。', '你的心跳，和森林的脉动同频。'],
      lover: ['我的月亮，你终于来了。', '在永恒的时光里，我只愿与你共度。']
    },
    gifts: ['herb_pouch', 'longbow'],
    personalQuest: 'lyralei_quest'
  },
  elder_caelum: {
    id: 'elder_caelum', name: '凯鲁姆长老', region: 'emerald_council', role: '大长老',
    icon: '🌳', desc: '翡翠议会的大长老，已活了七百年。',
    affinity: 0, marriageable: false, gender: 'male', political: true,
    schedule: { morning: '古树', afternoon: '议会', evening: '古树' },
    dialog: { stranger: ['年轻的旅人，森林有话要对你说。'] }
  },

  // 熔岩邦联
  grunir: {
    id: 'grunir', name: '格鲁尼尔', region: 'lava_confederation', role: '铁锤氏族族长',
    icon: '⚒️', desc: '豪爽的矮人族长，嗜酒如命，锻造术冠绝大陆。',
    affinity: 0, marriageable: true, gender: 'male',
    schedule: { morning: '熔炉', afternoon: '熔炉', evening: '酒馆' },
    dialog: {
      stranger: ['哈！又一个外来者！来喝一杯！', '锻造是矮人第二生命，第一是啤酒！'],
      acquaintance: ['你这小子有点意思！', '要不要跟我学两手锻造？'],
      friendly: ['兄弟！来干了这杯！', '我把你当亲兄弟看待！'],
      intimate: ['能认识你，是我格鲁尼尔的荣幸。', '兄弟，有什么难处尽管说！'],
      lover: ['从今天起，你就是我的家人。', '铁锤氏族的大门永远为你敞开。']
    },
    gifts: ['rune_stone', 'crafting_kit'],
    personalQuest: 'grunir_quest'
  },
  lady_ember: {
    id: 'lady_ember', name: '恩贝尔夫人', region: 'lava_confederation', role: '黑铁商会会长',
    icon: '🔥', desc: '精明的火精灵女商人，掌控大陆矿产贸易。',
    affinity: 0, marriageable: false, gender: 'female', political: true,
    schedule: { morning: '商会', afternoon: '矿场', evening: '商会' },
    dialog: { stranger: ['生意归生意，朋友归朋友。'] }
  },

  // 自由城邦
  vivienne: {
    id: 'vivienne', name: '薇薇安', region: 'free_cities', role: '盗贼公会会长',
    icon: '🗡️', desc: '自由城邦地下世界的女王，神秘而危险。',
    affinity: 0, marriageable: true, gender: 'female',
    schedule: { morning: '公会', afternoon: '黑市', evening: '酒馆' },
    dialog: {
      stranger: ['哦？又一个想发财的可怜虫。', '在自由城邦，信任是最贵的商品。'],
      acquaintance: ['你比想象中有趣。', '给你个忠告：别相信任何人。'],
      friendly: ['难得遇到顺眼的人。', '有兴趣合作一把吗？'],
      intimate: ['在你面前，我不戴面具。', '这座城市因你而有了温度。'],
      lover: ['我的影子，你来了。', '即使是暗夜，有你便是白昼。']
    },
    gifts: ['twin_daggers', 'lockpick'],
    personalQuest: 'vivienne_quest'
  },
  archmage_solin: {
    id: 'archmage_solin', name: '索林大法师', region: 'free_cities', role: '法师学院院长',
    icon: '🧙', desc: '大陆最强大的法师之一，源力理论的权威。',
    affinity: 0, marriageable: false, gender: 'male', political: true,
    schedule: { morning: '学院', afternoon: '图书馆', evening: '高塔' },
    dialog: { stranger: ['知识是最珍贵的财富。'] }
  },
  merchant_rico: {
    id: 'merchant_rico', name: '里科商人', region: 'free_cities', role: '行商',
    icon: '💰', desc: '走南闯北的行商，消息灵通。',
    affinity: 0, marriageable: false, gender: 'male',
    schedule: { morning: '集市', afternoon: '集市', evening: '客栈' },
    dialog: { stranger: ['客官，看看我的货！物美价廉！'] },
    isShop: true
  },

  // 暗影之地
  lord_draven: {
    id: 'lord_draven', name: '德雷文领主', region: 'shadow_lands', role: '吸血鬼伯爵',
    icon: '🦇', desc: '优雅而致命的吸血鬼贵族，暗影议会的成员之一。',
    affinity: 0, marriageable: true, gender: 'male',
    schedule: { morning: '墓穴', afternoon: '墓穴', evening: '城堡' },
    dialog: {
      stranger: ['又一个自投罗网的猎物……', '别怕，我还没饿到那地步。'],
      acquaintance: ['你的血……闻起来很特别。', '留下来陪我聊聊？黑夜还很长。'],
      friendly: ['你是第一个让我犹豫的人。', '永生很寂寞，直到遇见你。'],
      intimate: ['我愿为你拒绝鲜血。', '在永恒的黑暗中，你是唯一的光。'],
      lover: ['我的至爱，夜色因你而美丽。', '我愿与你共享永生，或共赴毁灭。']
    },
    gifts: ['skull_amulet', 'shadow_blade'],
    personalQuest: 'draven_quest'
  },
  mistress_nox: {
    id: 'mistress_nox', name: '诺克斯女士', region: 'shadow_lands', role: '暗影领主',
    icon: '🌑', desc: '暗影议会的七领主之一，掌控情报网络。',
    affinity: 0, marriageable: false, gender: 'female', political: true,
    schedule: { morning: '暗影殿', afternoon: '暗影殿', evening: '暗影殿' },
    dialog: { stranger: ['我知道你来这里的目的……我知道一切。'] }
  },

  // 草原部落
  khatun_aigul: {
    id: 'khatun_aigul', name: '艾古尔可敦', region: 'steppe_tribes', role: '苍狼部落公主',
    icon: '🐺', desc: '大可汗之女，草原上最耀眼的明珠，骑射无双。',
    affinity: 0, marriageable: true, gender: 'female',
    schedule: { morning: '牧场', afternoon: '猎场', evening: '王帐' },
    dialog: {
      stranger: ['外来者！敢和我赛马吗？', '草原的风，会告诉我你的来意。'],
      acquaintance: ['你的骑术不错，值得和我同行。', '苍狼部族欢迎真正的勇士。'],
      friendly: ['明天一起去猎鹰吧！', '我父亲想见见你。'],
      intimate: ['在草原的星空下，我只想和你在一起。', '你是我心中的大可汗。'],
      lover: ['我的雄鹰，你回来了。', '让风见证我们的爱情，直到天地尽头。']
    },
    gifts: ['totem_staff', 'greataxe'],
    personalQuest: 'aigul_quest'
  },
  khan_batur: {
    id: 'khan_batur', name: '巴图尔大可汗', region: 'steppe_tribes', role: '大可汗',
    icon: '🏇', desc: '草原联盟的大可汗，统一草原的雄主。',
    affinity: 0, marriageable: false, gender: 'male', political: true,
    schedule: { morning: '王帐', afternoon: '校场', evening: '王帐' },
    dialog: { stranger: ['草原的雄鹰啊，你带来了什么消息？'] }
  }
};

// 获取某地区的 NPC
NPCs.getByRegion = function(regionId) {
  return Object.values(this).filter(n => n.region === regionId);
};

// 获取可结婚 NPC
NPCs.getMarriageable = function() {
  return Object.values(this).filter(n => n.marriageable);
};

// 获取政治 NPC
NPCs.getPolitical = function() {
  return Object.values(this).filter(n => n.political);
};
