// NPC 肖像系统 — 为每个 NPC 生成独特的角色形象与表情反应
const NPCPortraits = {
  // 每个 NPC 的外观定义：背景色、角色 emoji、配色、装饰
  designs: {
    // ===== 圣光帝国 =====
    elena: {
      bg: 'linear-gradient(135deg, #f5e6c8 0%, #d4a84a 100%)',
      aura: 'rgba(245,215,110,0.4)',
      body: '⚔️',
      head: '👩‍🦰',
      accent: '#e8c547',
      frame: '#8b6914',
      // 表情符号映射
      expressions: { neutral: '😐', happy: '😊', friendly: '🥰', shy: '😳', angry: '😠' }
    },
    father_tomas: {
      bg: 'linear-gradient(135deg, #e8e0d0 0%, #a89878 100%)',
      aura: 'rgba(255,255,200,0.3)',
      body: '✝️',
      head: '👴',
      accent: '#c9a961',
      frame: '#6a5a3a',
      expressions: { neutral: '😐', happy: '😊', friendly: '🤗', sad: '😢', thoughtful: '🤔' }
    },
    cardinal_black: {
      bg: 'linear-gradient(135deg, #4a1a1a 0%, #8b2a2a 100%)',
      aura: 'rgba(200,50,50,0.3)',
      body: '👑',
      head: '🧔',
      accent: '#c44040',
      frame: '#3a0a0a',
      expressions: { neutral: '😐', happy: '😏', friendly: '😌', calculating: '🤔', cold: '😒' }
    },

    // ===== 翡翠森林 =====
    lyralei: {
      bg: 'linear-gradient(135deg, #1a4a2a 0%, #4a8a4a 100%)',
      aura: 'rgba(122,201,122,0.4)',
      body: '🏹',
      head: '🧝‍♀️',
      accent: '#7ac97a',
      frame: '#1a3a1a',
      expressions: { neutral: '😐', happy: '😊', friendly: '🥰', shy: '😳', cold: '😒' }
    },
    elder_caelum: {
      bg: 'linear-gradient(135deg, #0a2a1a 0%, #2a5a2a 100%)',
      aura: 'rgba(100,200,100,0.3)',
      body: '🌳',
      head: '🧓',
      accent: '#6aaa4a',
      frame: '#0a1a0a',
      expressions: { neutral: '😐', happy: '😊', wise: '😌', sad: '😢' }
    },

    // ===== 熔岩邦联 =====
    grunir: {
      bg: 'linear-gradient(135deg, #4a1a0a 0%, #8a3a1a 100%)',
      aura: 'rgba(255,120,40,0.4)',
      body: '⚒️',
      head: '🧔‍♂️',
      accent: '#ff7a28',
      frame: '#3a0a05',
      expressions: { neutral: '😐', happy: '😄', friendly: '😁', drunk: '🥴', angry: '😡' }
    },
    lady_ember: {
      bg: 'linear-gradient(135deg, #3a0a05 0%, #7a2a10 100%)',
      aura: 'rgba(255,80,30,0.4)',
      body: '🔥',
      head: '👩‍🦰',
      accent: '#ff5a1e',
      frame: '#2a0505',
      expressions: { neutral: '😐', happy: '😏', friendly: '😌', calculating: '🤔', cold: '😒' }
    },

    // ===== 自由城邦 =====
    vivienne: {
      bg: 'linear-gradient(135deg, #1a1f3a 0%, #3a2a4a 100%)',
      aura: 'rgba(122,170,255,0.3)',
      body: '🗡️',
      head: '🧛‍♀️',
      accent: '#7aaaff',
      frame: '#0a0f2a',
      expressions: { neutral: '😐', happy: '😏', friendly: '😌', seductive: '😘', cold: '😒' }
    },
    archmage_solin: {
      bg: 'linear-gradient(135deg, #1a2a5a 0%, #3a4a8a 100%)',
      aura: 'rgba(100,150,255,0.4)',
      body: '🧙',
      head: '🧓',
      accent: '#6a9aff',
      frame: '#0a1a3a',
      expressions: { neutral: '😐', happy: '😊', wise: '😌', surprised: '😮', thoughtful: '🤔' }
    },
    merchant_rico: {
      bg: 'linear-gradient(135deg, #5a4a2a 0%, #8a7a4a 100%)',
      aura: 'rgba(245,215,110,0.3)',
      body: '💰',
      head: '🧔',
      accent: '#d4b84a',
      frame: '#3a2a1a',
      expressions: { neutral: '😐', happy: '😄', greedy: '🤤', friendly: '😁' }
    },

    // ===== 暗影之地 =====
    lord_draven: {
      bg: 'linear-gradient(135deg, #1a0a1a 0%, #3a0a2a 100%)',
      aura: 'rgba(154,122,204,0.4)',
      body: '🦇',
      head: '🧛',
      accent: '#9a7acc',
      frame: '#0a0515',
      expressions: { neutral: '😐', happy: '😏', friendly: '😌', hungry: '😋', cold: '😒' }
    },
    mistress_nox: {
      bg: 'linear-gradient(135deg, #0a0515 0%, #2a1540 100%)',
      aura: 'rgba(154,122,204,0.3)',
      body: '🌑',
      head: '👩',
      accent: '#7a5aaa',
      frame: '#050510',
      expressions: { neutral: '😐', happy: '😏', calculating: '🤔', cold: '😒', mysterious: '😌' }
    },

    // ===== 草原部落 =====
    khatun_aigul: {
      bg: 'linear-gradient(135deg, #4a6a2a 0%, #8aaa4a 100%)',
      aura: 'rgba(170,204,90,0.4)',
      body: '🏹',
      head: '👩‍🦱',
      accent: '#aacc5a',
      frame: '#2a3a1a',
      expressions: { neutral: '😐', happy: '😄', friendly: '😁', proud: '😤', shy: '😳' }
    },
    khan_batur: {
      bg: 'linear-gradient(135deg, #3a2a1a 0%, #6a4a2a 100%)',
      aura: 'rgba(200,150,80,0.4)',
      body: '🏇',
      head: '🧔',
      accent: '#c89650',
      frame: '#1a1a0a',
      expressions: { neutral: '😐', happy: '😄', proud: '😤', angry: '😡', wise: '😌' }
    }
  },

  // 默认表情（当设计中没有指定表情时使用）
  defaultExpressions: { neutral: '😐', happy: '😊', friendly: '🙂', angry: '😠', sad: '😢', surprised: '😮' },

  // 生成 NPC 肖像 HTML
  render(npcId, expression = 'neutral', size = 120) {
    const design = this.designs[npcId] || this.designs.elena;
    const expr = design.expressions[expression] || this.defaultExpressions[expression] || '😐';
    return `
      <div class="npc-portrait" style="width:${size}px;height:${size * 1.3}px;">
        <div class="npc-portrait-bg" style="background:${design.bg};box-shadow:0 0 30px ${design.aura}, inset 0 0 20px rgba(0,0,0,0.3);">
          <div class="npc-portrait-aura" style="background:radial-gradient(circle, ${design.aura}, transparent 70%);"></div>
          <div class="npc-portrait-body">${design.body}</div>
          <div class="npc-portrait-head">${design.head}</div>
          <div class="npc-portrait-expr">${expr}</div>
          <div class="npc-portrait-frame" style="border-color:${design.frame};"></div>
        </div>
      </div>
    `;
  },

  // 根据玩家行为返回对应的 NPC 表情
  getExpressionForAction(action, npcId) {
    const design = this.designs[npcId];
    const hasExpr = (e) => design && design.expressions && design.expressions[e];
    switch (action) {
      case 'greet': return hasExpr('neutral') ? 'neutral' : 'neutral';
      case 'chat': return hasExpr('friendly') ? 'friendly' : 'happy';
      case 'gift_good': return hasExpr('happy') ? 'happy' : 'friendly';
      case 'gift_bad': return hasExpr('cold') ? 'cold' : 'neutral';
      case 'info': return hasExpr('wise') ? 'wise' : 'thoughtful';
      case 'leave': return hasExpr('neutral') ? 'neutral' : 'neutral';
      case 'flirt_success': return hasExpr('shy') ? 'shy' : 'happy';
      case 'flirt_fail': return hasExpr('cold') ? 'cold' : 'angry';
      case 'angry': return 'angry';
      case 'sad': return 'sad';
      default: return 'neutral';
    }
  },

  // 根据好感度阶段返回默认表情
  getExpressionForAffinity(affinity, npcId) {
    const stage = Utils.relationStage(affinity);
    switch (stage) {
      case 'stranger': return 'neutral';
      case 'acquaintance': return 'friendly';
      case 'friendly': return 'happy';
      case 'intimate': return 'shy';
      case 'lover': return 'friendly';
      default: return 'neutral';
    }
  }
};
