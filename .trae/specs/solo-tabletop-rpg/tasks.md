# 单人跑团游戏《源界：艾尔瑟亚》 - 实施计划

## Task 1: 项目骨架与核心引擎（含 Three.js）
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 创建 index.html、style.css、主 JS 入口
  - 引入并打包 Three.js（本地）
  - 建立游戏状态机（主菜单、角色创建、3D 世界地图、剧情、战斗、背包、结局）
  - 实现渲染循环（Three.js 3D + Canvas 2D UI）、输入处理、资源加载
  - 实现事件总线与游戏时钟
- **Acceptance Criteria Addressed**: AC-10, AC-12
- **Test Requirements**:
  - `rule` TR-1.1: 打开 index.html 后显示主菜单，可进入游戏状态机
  - `rule` TR-1.2: Three.js 3D 渲染正常，输入事件正确响应

## Task 2: 架空世界观设定（多地区多势力）
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 设计 6 个国家/地区：圣光帝国、翡翠森林议会、熔岩邦联、自由城邦联盟、暗影之地、草原部落联盟
  - 为每个地区设计地理、文化、历史、多种势力（每地区 3+ 势力）
  - 设计种族、神祇、源力体系
  - 输出为 JS 数据模块，供游戏内文本与事件引用
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `rubric` TR-2.1: 世界观丰富度；scale 1-5；anchors 1/3/5；threshold >= 4；evidence: 设定文档完整性
  - `rule` TR-2.2: 6 个地区均有 3+ 势力定义

## Task 3: 角色系统与地区特色职业
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**:
  - 实现六大属性与角色数据结构
  - 实现 6 个地区 × 2 种特色职业 = 12+ 职业数据
    - 圣光帝国：圣骑士、审判者
    - 翡翠森林：德鲁伊、游侠
    - 熔岩邦联：符文战士、工匠
    - 自由城邦：吟游诗人、盗贼
    - 暗影之地：亡灵法师、刺客
    - 草原部落：萨满、狂战士
  - 实现角色创建界面（选择地区→选择职业、属性展示、技能展示）
- **Acceptance Criteria Addressed**: AC-1, AC-3
- **Test Requirements**:
  - `rule` TR-3.1: 6 地区 × 2 职业均可选择，属性与技能正确加载
  - `rule` TR-3.2: 角色数据结构包含全部必需字段

## Task 4: 骰子检定系统
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 3
- **Description**:
  - 实现 D20 掷骰与修正值计算
  - 实现大成功(20)/大失败(1)/成功/失败判定
  - 实现检定 UI（骰子动画、结果展示）
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `rule` TR-4.1: 检定结果 = D20 + 修正值，边界判定正确
  - `rule` TR-4.2: 骰子有动画效果

## Task 5: 剧情节点与动态选择系统
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1, Task 3
- **Description**:
  - 实现剧情节点数据结构（文本、选项、条件、效果）
  - 实现选项条件过滤（属性、物品、关系、标记）
  - 实现选项效果应用（属性变化、物品增减、关系变化、标记设置）
  - 实现剧情展示 UI（类型机文字、选项按钮）
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `rule` TR-5.1: 选项根据条件正确过滤显示
  - `rule` TR-5.2: 选择后效果正确应用到游戏状态

## Task 6: 战斗系统（可选分支）
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 3, Task 4
- **Description**:
  - 实现回合制战斗流程（玩家回合→敌人回合），作为剧情可选分支
  - 实现攻击、技能、物品、防御、逃跑指令
  - 实现敌人 AI（根据血量/状态选择行动）
  - 实现战斗 UI（血条、指令菜单、动画）
  - 实现战斗结算（经验、金币、物品掉落）
  - 确保多数冲突场景提供对话/潜行/关系等非战斗选项
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `rule` TR-6.1: 战斗流程完整，可正常结束
  - `rule` TR-6.2: 敌人 AI 能根据状态选择行动
  - `rule` TR-6.3: 战斗结算正确发放奖励
  - `rule` TR-6.4: 冲突场景提供非战斗规避选项

## Task 7: 背包与装备系统
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 3
- **Description**:
  - 实现物品数据结构（武器、护甲、饰品、消耗品、关键物品）
  - 实现背包 UI（分类、查看、装备、使用、丢弃）
  - 实现装备属性加成与卸下
  - 实现消耗品使用效果
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `rule` TR-7.1: 装备后属性正确变化，卸下后恢复
  - `rule` TR-7.2: 消耗品使用后生效并从背包移除

## Task 8: NPC 好感度与关系系统
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 5
- **Description**:
  - 实现 NPC 数据（姓名、职业、好感度 0-100、关系阶段、对话树、是否可结婚、日程）
  - 实现关系阶段：陌生→相识→友好→亲密→恋人
  - 实现对话系统与好感度变化
  - 实现关系影响剧情选项与结局
  - 实现 NPC 互动（送礼、对话、委托）
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `rule` TR-8.1: 对话选项可改变 NPC 好感度
  - `rule` TR-8.2: 好感度阈值推进关系阶段
  - `rule` TR-8.3: 关系阶段影响可用对话选项

## Task 8b: 结婚系统
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 8
- **Description**:
  - 实现可结婚 NPC 列表与求婚条件
  - 实现求婚/订婚/结婚事件链
  - 实现婚后伴侣加成（属性/每日对话/特殊物品）
  - 实现婚姻专属剧情与结局分支
- **Acceptance Criteria Addressed**: AC-7b
- **Test Requirements**:
  - `rule` TR-8b.1: 恋人阶段 NPC 可触发求婚
  - `rule` TR-8b.2: 婚后伴侣加成正确生效
  - `rule` TR-8b.3: 婚姻解锁专属结局分支

## Task 9: 3D 世界地图与探索
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**:
  - 基于 Three.js 构建 3D 世界地图，覆盖 6 个国家/地区的地形、建筑、地标
  - 实现角色 3D 模型与 WASD/方向键移动控制、摄像机跟随
  - 实现地点交互点（进入触发剧情/商店/休息/战斗/社交）
  - 实现商店买卖系统（不同地区物价不同）
  - 实现营地休息与随机事件
  - 实现进入地区时触发地区剧情线
- **Acceptance Criteria Addressed**: AC-8, AC-10, AC-11, AC-2b
- **Test Requirements**:
  - `rule` TR-9.1: 3D 地图可操控角色在 6 个地区间移动
  - `rule` TR-9.2: 商店可买卖物品，金币正确变化，地区物价有差异
  - `rule` TR-9.3: 休息可恢复生命法力
  - `rule` TR-9.4: 进入地区触发对应地区剧情

## Task 9b: 活世界时间系统
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**:
  - 实现游戏内时间单位：日→月→年→纪元年（每纪元年 ≈ 1 小时游玩）
  - 实现时间推进机制（移动/休息/互动消耗时间）
  - 实现世界事件时间表（各地区按时间触发节日、战争、灾变、政治变动等）
  - 实现 NPC 日程系统（作息、工作、社交位置随时段变化）
  - 实现 NPC 人生事件（升迁、结婚、变故等随时间推进）
  - 实现时间对商店营业、天气、季节、事件可用性的影响
- **Acceptance Criteria Addressed**: AC-13
- **Test Requirements**:
  - `rule` TR-9b.1: 时间随玩家行动正确推进
  - `rule` TR-9b.2: 世界事件按时间表触发
  - `rule` TR-9b.3: NPC 位置与状态随时间变化

## Task 9c: 政治系统
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 2, Task 5
- **Description**:
  - 为 6 个地区设计政体：神权政治、议会共和、城邦联盟、商业寡头、隐秘统治、部落联盟
  - 为每个政体设计政治层级与政治 NPC（君主/议员/首领等）
  - 实现玩家职业路线选择（从政、经商、勇者、法师）
  - 实现从政路线：与各国政治 NPC 互动、政治事件（外交、权谋、选举、政变）
  - 实现非从政路线受政体影响（税收、贸易协定、任务委托、法令限制）
  - 实现政治倾向/声望系统，影响剧情选项与结局
- **Acceptance Criteria Addressed**: AC-14
- **Test Requirements**:
  - `rule` TR-9c.1: 6 个地区政体定义正确且各异
  - `rule` TR-9c.2: 从政路线可参与政治事件并与政治 NPC 互动
  - `rule` TR-9c.3: 非从政路线受到政体机制影响

## Task 10: 状态效果与等级成长
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 3, Task 6
- **Description**:
  - 实现状态效果（中毒、流血、眩晕、增益等）及其回合结算
  - 实现经验值与等级系统
  - 实现技能点与技能学习
- **Acceptance Criteria Addressed**: AC-12
- **Test Requirements**:
  - `rule` TR-10.1: 状态效果在回合结束时正确结算
  - `rule` TR-10.2: 升级后属性与技能点正确增加

## Task 11: 多结局系统
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 5, Task 8, Task 8b, Task 9c
- **Description**:
  - 实现结局判定表（职业 × 路线 × 关键标记 × 关系阶段 × 婚姻对象 × 政治倾向 × 属性 × 收集品）
  - 实现结局文本库（支持 50+ 种结局组合，含单身/各 NPC 婚姻结局、从政/经商/勇者/法师各路线结局）
  - 实现结局展示 UI
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `rule` TR-11.1: 结局判定逻辑覆盖 50+ 种组合
  - `rule` TR-11.2: 不同条件触发不同结局文本
  - `rule` TR-11.3: 婚姻对象与路线影响结局文本

## Task 12: 视觉与动画（3D + 2D）
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - 实现 3D 角色模型动画（行走、待机、互动）
  - 实现 3D 场景地形、建筑、地标渲染
  - 实现 2D UI 动画（淡入淡出、按钮反馈、转场、骰子动画）
  - 实现粒子效果（攻击命中、升级、场景特效等）
- **Acceptance Criteria Addressed**: AC-10
- **Test Requirements**:
  - `rubric` TR-12.1: 视觉表现质量；scale 1-5；anchors 1/3/5；threshold >= 4；evidence: 3D 场景与动画运行效果

## Task 13: 存档系统
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 1
- **Description**:
  - 实现 localStorage 存档/读档
  - 实现多存档位（至少 3 个）
  - 实现存档界面
- **Acceptance Criteria Addressed**: AC-11
- **Test Requirements**:
  - `rule` TR-13.1: 保存后状态完整，读取后恢复一致
  - `rule` TR-13.2: 支持至少 3 个存档位

## Task 14: 新手引导与主菜单
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 1
- **Description**:
  - 实现主菜单（新游戏、继续、设置、关于）
  - 实现新手引导教程关卡
  - 实现设置界面（音量、文字速度）
- **Acceptance Criteria Addressed**: AC-12
- **Test Requirements**:
  - `rule` TR-14.1: 主菜单功能完整可导航
  - `rule` TR-14.2: 教程引导玩家完成基础操作

## Task 15: 剧情内容填充（6 地区 + 多线 + 20h）
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 5, Task 9, Task 11
- **Description**:
  - 编写主线剧情节点（序章、第一至第三章、终章），以剧情/探索/社交为主
  - 编写 **6 个地区的独立剧情线**，每地区含势力冲突与抉择
  - 为冲突场景设计战斗与非战斗（对话/潜行/关系）双路径
  - 编写 12+ 职业专属支线
  - 编写可结婚 NPC 的个人剧情线、求婚事件、婚后日常（每地区 1-2 名可结婚 NPC）
  - 编写地点事件、随机事件、委托任务
  - 编写各地区世界事件时间表（节日、战争、灾变、政治变动）
  - 编写 NPC 日程与人生事件
  - 编写政治事件（外交、权谋、选举、政变）与从政/经商/勇者/法师各路线剧情
  - 编写 NPC 对话内容
  - 确保剧情逻辑自洽、选择有意义，总量支撑 20 小时以上游玩
- **Acceptance Criteria Addressed**: AC-2, AC-2b, AC-4, AC-7b, AC-9, AC-12
- **Test Requirements**:
  - `rubric` TR-15.1: 剧情丰富度；scale 1-5；anchors 1/3/5；threshold >= 4；evidence: 节点数量与文本量
  - `rule` TR-15.2: 主线可从序章推进到结局
  - `rule` TR-15.3: 冲突场景存在非战斗规避路径
  - `rule` TR-15.4: 6 个地区均有独立剧情线可触发

## Task 16: 整合测试与发布准备
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1-15
- **Description**:
  - 全流程测试：角色创建→序章→地图→战斗→剧情→结局
  - 修复发现的 bug
  - 优化性能与体验
  - 准备 GitHub 发布
- **Acceptance Criteria Addressed**: AC-1 至 AC-12
- **Test Requirements**:
  - `rule` TR-16.1: 完整流程可从开始走到结局无崩溃
  - `rule` TR-16.2: 所有系统联动正常
