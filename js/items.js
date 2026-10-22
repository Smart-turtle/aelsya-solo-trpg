// 物品数据
const Items = {
  // 武器
  iron_sword: { id: 'iron_sword', name: '铁剑', type: 'weapon', icon: '⚔️', desc: '普通的铁制长剑。', atk: 3, price: 50, slot: 'weapon' },
  war_hammer: { id: 'war_hammer', name: '战锤', type: 'weapon', icon: '🔨', desc: '沉重的战锤，对护甲有效。', atk: 5, price: 80, slot: 'weapon' },
  oak_staff: { id: 'oak_staff', name: '橡木法杖', type: 'weapon', icon: '🪄', desc: '蕴含自然之力的法杖。', atk: 2, mp: 5, price: 60, slot: 'weapon' },
  longbow: { id: 'longbow', name: '长弓', type: 'weapon', icon: '🏹', desc: '精灵工艺的长弓，射程远。', atk: 4, price: 70, slot: 'weapon' },
  rune_axe: { id: 'rune_axe', name: '符文战斧', type: 'weapon', icon: '🪓', desc: '刻有源力符文的战斧。', atk: 7, price: 150, slot: 'weapon' },
  wrench: { id: 'wrench', name: '万能扳手', type: 'weapon', icon: '🔧', desc: '工匠的工具，也是武器。', atk: 2, int: 2, price: 40, slot: 'weapon' },
  lute: { id: 'lute', name: '鲁特琴', type: 'weapon', icon: '🎵', desc: '吟游诗人的乐器，能魅惑人心。', atk: 1, cha: 3, price: 50, slot: 'weapon' },
  twin_daggers: { id: 'twin_daggers', name: '双刃匕首', type: 'weapon', icon: '🗡️', desc: '一对锋利的匕首。', atk: 4, dex: 2, price: 60, slot: 'weapon' },
  bone_staff: { id: 'bone_staff', name: '白骨法杖', type: 'weapon', icon: '🦴', desc: '以骸骨制成的法杖，蕴含亡者之力。', atk: 3, mp: 8, price: 90, slot: 'weapon' },
  shadow_blade: { id: 'shadow_blade', name: '暗影之刃', type: 'weapon', icon: '🌙', desc: '融入暗影的利刃。', atk: 6, dex: 3, price: 120, slot: 'weapon' },
  totem_staff: { id: 'totem_staff', name: '图腾法杖', type: 'weapon', icon: '🗿', desc: '刻有部落图腾的法杖。', atk: 3, wis: 3, price: 70, slot: 'weapon' },
  greataxe: { id: 'greataxe', name: '巨斧', type: 'weapon', icon: '⚒️', desc: '草原战士的巨斧，威力惊人。', atk: 8, price: 130, slot: 'weapon' },
  silver_sword: { id: 'silver_sword', name: '银剑', type: 'weapon', icon: '⚔️', desc: '对亡灵与恶魔有效的银剑。', atk: 6, price: 110, slot: 'weapon' },
  arrows: { id: 'arrows', name: '箭矢', type: 'ammo', icon: '➶', desc: '弓箭的弹药。', price: 10, stack: 20 },

  // 护甲
  chain_mail: { id: 'chain_mail', name: '锁子甲', type: 'armor', icon: '🛡️', desc: '铁环编织的护甲。', def: 4, price: 80, slot: 'armor' },
  leather_armor: { id: 'leather_armor', name: '皮甲', type: 'armor', icon: '🦺', desc: '轻便的皮革护甲。', def: 2, dex: 1, price: 40, slot: 'armor' },
  plate_armor: { id: 'plate_armor', name: '板甲', type: 'armor', icon: '🛡️', desc: '厚重的全身板甲。', def: 8, price: 200, slot: 'armor' },
  robes: { id: 'robes', name: '法袍', type: 'armor', icon: '👘', desc: '适合施法者的长袍。', def: 1, mp: 5, price: 50, slot: 'armor' },
  dark_robes: { id: 'dark_robes', name: '暗影法袍', type: 'armor', icon: '🥋', desc: '融入暗影的法袍。', def: 2, mp: 8, price: 90, slot: 'armor' },
  fur_armor: { id: 'fur_armor', name: '毛皮甲', type: 'armor', icon: '🧥', desc: '兽皮制成的护甲，保暖。', def: 3, con: 1, price: 50, slot: 'armor' },
  dark_cloak: { id: 'dark_cloak', name: '暗影斗篷', type: 'armor', icon: '🧥', desc: '能隐匿身形的斗篷。', def: 2, dex: 3, price: 80, slot: 'armor' },
  performers_robe: { id: 'performers_robe', name: '艺人长袍', type: 'armor', icon: '👘', desc: '华丽的艺人长袍。', def: 1, cha: 3, price: 45, slot: 'armor' },
  tribal_robes: { id: 'tribal_robes', name: '部落法袍', type: 'armor', icon: '👘', desc: '萨满的部落法袍。', def: 1, wis: 3, price: 55, slot: 'armor' },
  work_gloves: { id: 'work_gloves', name: '工匠手套', type: 'armor', icon: '🧤', desc: '工匠的防护手套。', def: 1, int: 2, price: 35, slot: 'armor' },

  // 饰品
  holy_symbol: { id: 'holy_symbol', name: '圣光圣徽', type: 'accessory', icon: '🔆', desc: '圣光的象征。', wis: 2, price: 60, slot: 'accessory' },
  skull_amulet: { id: 'skull_amulet', name: '骷髅护符', type: 'accessory', icon: '💀', desc: '蕴含亡者之力的护符。', int: 2, price: 70, slot: 'accessory' },
  spirit_charm: { id: 'spirit_charm', name: '灵魂护符', type: 'accessory', icon: '🔮', desc: '祖灵庇护的护符。', wis: 2, price: 60, slot: 'accessory' },
  herb_pouch: { id: 'herb_pouch', name: '草药袋', type: 'accessory', icon: '🌿', desc: '装有草药的袋子。', wis: 1, healBonus: 5, price: 40, slot: 'accessory' },
  gold_ring: { id: 'gold_ring', name: '金戒指', type: 'accessory', icon: '💍', desc: '镶有宝石的金戒指。', cha: 2, price: 100, slot: 'accessory' },
  rune_stone: { id: 'rune_stone', name: '符文石', type: 'accessory', icon: '🪨', desc: '刻有符文的石头。', str: 2, price: 80, slot: 'accessory' },

  // 消耗品
  health_potion: { id: 'health_potion', name: '生命药水', type: 'consumable', icon: '🧪', desc: '恢复 30 点生命。', heal: 30, price: 30, stack: 10 },
  mana_potion: { id: 'mana_potion', name: '法力药水', type: 'consumable', icon: '🔵', desc: '恢复 20 点法力。', mp: 20, price: 35, stack: 10 },
  greater_health_potion: { id: 'greater_health_potion', name: '强效生命药水', type: 'consumable', icon: '🧪', desc: '恢复 60 点生命。', heal: 60, price: 70, stack: 10 },
  antidote: { id: 'antidote', name: '解毒剂', type: 'consumable', icon: '💊', desc: '解除中毒状态。', cure: 'poison', price: 25, stack: 5 },
  food: { id: 'food', name: '干粮', type: 'consumable', icon: '🍞', desc: '恢复 15 点生命。', heal: 15, price: 10, stack: 20 },
  lockpick: { id: 'lockpick', name: '开锁器', type: 'consumable', icon: '🔓', desc: '用于开锁。', price: 15, stack: 10 },
  poison_vial: { id: 'poison_vial', name: '毒药瓶', type: 'consumable', icon: '☠️', desc: '使敌人中毒。', price: 30, stack: 5 },
  crafting_kit: { id: 'crafting_kit', name: '锻造工具', type: 'consumable', icon: '⚒️', desc: '用于锻造装备。', price: 50, stack: 1 },
  scroll_of_truth: { id: 'scroll_of_truth', name: '真言卷轴', type: 'consumable', icon: '📜', desc: '揭示目标真实意图。', price: 40, stack: 3 },

  // 关键物品
  ancient_key: { id: 'ancient_key', name: '远古钥匙', type: 'key', icon: '🗝️', desc: '开启远古遗迹的钥匙。', price: 0, key: true },
  royal_letter: { id: 'royal_letter', name: '王室密信', type: 'key', icon: '✉️', desc: '来自王室的密信。', price: 0, key: true },
  source_crystal: { id: 'source_crystal', name: '源力水晶', type: 'key', icon: '💎', desc: '蕴含纯净源力的水晶。', price: 0, key: true },
  gold_coins: { id: 'gold_coins', name: '金币袋', type: 'key', icon: '💰', desc: '一袋金币。', price: 0, key: true, giveGold: 50 }
};

// 获取物品
Items.get = function(id) { return this[id] || null; };
