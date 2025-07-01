// 破天一剑游戏数据配置文件

// 角色职业数据
const CHARACTERS = {
    yijian: {
        id: 'yijian',
        name: '一剑',
        type: '近战输出',
        element: 'light', // 光属性
        trigram: 'qian', // 乾卦
        description: '掌握乾光神功，攻击力无出其右，速攻绝技震慑四方。',
        baseStats: {
            constitution: 12,
            agility: 9,
            wisdom: 9
        },
        weapons: ['sword', 'blade', 'axe'],
        primaryWeapon: 'sword',
        skills: ['speedAttack', 'resurrection'],
        auxiliarySkills: ['refine', 'swiftMove', 'goldenBell', 'starAbsorb', 'summon', 'recovery']
    },
    xiuya: {
        id: 'xiuya',
        name: '秀雅',
        type: '远程输出',
        element: 'fire', // 火属性
        trigram: 'li', // 离卦
        description: '离火神功炉火纯青，弓箭如流星，复活绝技救死扶伤。',
        baseStats: {
            constitution: 9,
            agility: 12,
            wisdom: 9
        },
        weapons: ['sword', 'blade', 'axe'],
        primaryWeapon: 'bow',
        skills: ['resurrection', 'speedAttack'],
        auxiliarySkills: ['refine', 'swiftMove', 'goldenBell', 'starAbsorb', 'summon', 'recovery']
    },
    murong: {
        id: 'murong',
        name: '慕容指路',
        type: '灵活型',
        element: 'wind', // 风属性
        trigram: 'xun', // 巽卦
        description: '巽风神功飘逸灵动，身法如风，炼化绝技增强武器。',
        baseStats: {
            constitution: 9,
            agility: 10,
            wisdom: 11
        },
        weapons: ['sword', 'blade', 'axe'],
        primaryWeapon: 'fan',
        skills: ['refine', 'swiftMove'],
        auxiliarySkills: ['speedAttack', 'resurrection', 'goldenBell', 'starAbsorb', 'summon', 'recovery']
    },
    yunting: {
        id: 'yunting',
        name: '云婷',
        type: '内功型',
        element: 'ice', // 冰属性
        trigram: 'kan', // 坎卦
        description: '坎冰神功刚柔并济，神行绝技瞬息千里，冰莲觉醒威力无穷。',
        baseStats: {
            constitution: 10,
            agility: 11,
            wisdom: 9
        },
        weapons: ['sword', 'blade', 'axe'],
        primaryWeapon: 'hammer',
        skills: ['refine', 'swiftMove'],
        auxiliarySkills: ['speedAttack', 'resurrection', 'goldenBell', 'starAbsorb', 'summon', 'recovery']
    },
    nangong: {
        id: 'nangong',
        name: '南宫不败',
        type: '防御型',
        element: 'earth', // 地属性
        trigram: 'kun', // 坤卦
        description: '坤地神功气势磅礴，金钟绝技坚不可摧，义盖云天的铁男儿。',
        baseStats: {
            constitution: 11,
            agility: 9,
            wisdom: 10
        },
        weapons: ['sword', 'blade', 'axe'],
        primaryWeapon: 'slash',
        skills: ['goldenBell', 'starAbsorb'],
        auxiliarySkills: ['speedAttack', 'resurrection', 'refine', 'swiftMove', 'summon', 'recovery']
    },
    jiaohong: {
        id: 'jiaohong',
        name: '娇红',
        type: '毒系型',
        element: 'poison', // 毒属性
        trigram: 'dui', // 兑卦
        description: '兑毒神功防不胜防，吸星绝技吸取生命，至情至性的奇女子。',
        baseStats: {
            constitution: 9,
            agility: 9,
            wisdom: 12
        },
        weapons: ['sword', 'blade', 'axe'],
        primaryWeapon: 'whip',
        skills: ['starAbsorb', 'goldenBell'],
        auxiliarySkills: ['speedAttack', 'resurrection', 'refine', 'swiftMove', 'summon', 'recovery']
    },
    wushen: {
        id: 'wushen',
        name: '悟神',
        type: '召唤型',
        element: 'dark', // 暗属性
        trigram: 'gen', // 艮卦
        description: '艮暗神功变幻莫测，召唤绝技御兽如神，大智若愚的老顽童。',
        baseStats: {
            constitution: 10,
            agility: 9,
            wisdom: 11
        },
        weapons: ['sword', 'blade', 'axe'],
        primaryWeapon: 'axe',
        skills: ['summon', 'recovery'],
        auxiliarySkills: ['speedAttack', 'resurrection', 'refine', 'swiftMove', 'goldenBell', 'starAbsorb']
    },
    muzhi: {
        id: 'muzhi',
        name: '拇指',
        type: '治疗型',
        element: 'thunder', // 雷属性
        trigram: 'zhen', // 震卦
        description: '震雷神功有板有眼，回复绝技救死扶伤，天真浪漫的小丫头。',
        baseStats: {
            constitution: 11,
            agility: 10,
            wisdom: 9
        },
        weapons: ['sword', 'blade', 'axe'],
        primaryWeapon: 'dart',
        skills: ['recovery', 'summon'],
        auxiliarySkills: ['speedAttack', 'resurrection', 'refine', 'swiftMove', 'goldenBell', 'starAbsorb']
    }
};

// 技能数据
const SKILLS = {
    speedAttack: {
        id: 'speedAttack',
        name: '速攻',
        description: '增加攻击速度，让敌人应接不暇',
        type: 'buff',
        cost: 10,
        effect: {
            type: 'attackSpeed',
            value: 1.5,
            duration: 3
        }
    },
    resurrection: {
        id: 'resurrection',
        name: '复活',
        description: '复活自己或队友，也可复活怪物助战',
        type: 'heal',
        cost: 20,
        effect: {
            type: 'revive',
            value: 0.5
        }
    },
    refine: {
        id: 'refine',
        name: '炼化',
        description: '增加武器攻击力，提升战斗威力',
        type: 'buff',
        cost: 15,
        effect: {
            type: 'weaponPower',
            value: 1.3,
            duration: 5
        }
    },
    swiftMove: {
        id: 'swiftMove',
        name: '神行',
        description: '瞬间移动，在画面内快速转移位置',
        type: 'utility',
        cost: 8,
        effect: {
            type: 'teleport',
            value: 1
        }
    },
    goldenBell: {
        id: 'goldenBell',
        name: '金钟',
        description: '增加防御力，抵御敌人攻击',
        type: 'buff',
        cost: 12,
        effect: {
            type: 'defense',
            value: 1.5,
            duration: 4
        }
    },
    starAbsorb: {
        id: 'starAbsorb',
        name: '吸星',
        description: '攻击时吸收敌人体力为己用',
        type: 'attack',
        cost: 15,
        effect: {
            type: 'lifeDrain',
            value: 0.3
        }
    },
    summon: {
        id: 'summon',
        name: '召唤',
        description: '召唤怪物帮助战斗',
        type: 'summon',
        cost: 25,
        effect: {
            type: 'summonCreature',
            duration: 6
        }
    },
    recovery: {
        id: 'recovery',
        name: '回复',
        description: '增加体力数值和体力恢复速度',
        type: 'heal',
        cost: 10,
        effect: {
            type: 'heal',
            value: 0.4
        }
    }
};

// 装备数据
const EQUIPMENT = {
    weapons: {
        sword: {
            basic: { name: '铁剑', attack: 10, level: 1 },
            advanced: { name: '精钢剑', attack: 25, level: 10 },
            rare: { name: '寒光剑', attack: 50, level: 25 },
            legendary: { name: '破天剑', attack: 100, level: 50 }
        },
        bow: {
            basic: { name: '木弓', attack: 8, level: 1 },
            advanced: { name: '精铁弓', attack: 22, level: 10 },
            rare: { name: '神臂弓', attack: 45, level: 25 },
            legendary: { name: '追星弓', attack: 95, level: 50 }
        },
        fan: {
            basic: { name: '纸扇', attack: 6, level: 1 },
            advanced: { name: '铁骨扇', attack: 18, level: 10 },
            rare: { name: '七星扇', attack: 40, level: 25 },
            legendary: { name: '乾坤扇', attack: 90, level: 50 }
        }
    },
    armor: {
        head: {
            basic: { name: '布头巾', defense: 3, level: 1 },
            advanced: { name: '皮帽', defense: 8, level: 10 },
            rare: { name: '铁盔', defense: 18, level: 25 }
        },
        body: {
            basic: { name: '布衣', defense: 5, level: 1 },
            advanced: { name: '皮甲', defense: 12, level: 10 },
            rare: { name: '链甲', defense: 25, level: 25 }
        }
    }
};

// 怪物数据
const MONSTERS = {
    slime: {
        name: '史莱姆',
        level: 1,
        hp: 30,
        attack: 5,
        defense: 2,
        exp: 10,
        gold: 5,
        drops: ['铜币', '破天铜牌']
    },
    wolf: {
        name: '野狼',
        level: 3,
        hp: 60,
        attack: 12,
        defense: 5,
        exp: 25,
        gold: 12,
        drops: ['狼皮', '破天铜牌', '血瓶']
    },
    orc: {
        name: '兽人战士',
        level: 8,
        hp: 150,
        attack: 25,
        defense: 12,
        exp: 60,
        gold: 30,
        drops: ['兽人斧', '破天银牌', '大血瓶']
    },
    skeleton: {
        name: '骷髅兵',
        level: 12,
        hp: 200,
        attack: 35,
        defense: 15,
        exp: 100,
        gold: 50,
        drops: ['骨剑', '破天银牌', '灵魂石']
    },
    darkMage: {
        name: '黑暗法师',
        level: 20,
        hp: 350,
        attack: 60,
        defense: 25,
        exp: 200,
        gold: 100,
        drops: ['法师袍', '魔法石', '破天金牌']
    }
};

// 地图数据
const MAPS = {
    humanStar: {
        name: '人极星',
        areas: {
            village: {
                name: '汉罗山庄',
                description: '人极星的主要城镇，这里是冒险者的聚集地...',
                safe: true,
                npcs: ['商人', '铁匠', '药师']
            },
            forest: {
                name: '迷雾森林',
                description: '笼罩在迷雾中的神秘森林，危险与机遇并存...',
                safe: false,
                monsters: ['slime', 'wolf'],
                level: [1, 5]
            },
            cave: {
                name: '幽暗洞穴',
                description: '深不见底的洞穴，传说中有古老的宝藏...',
                safe: false,
                monsters: ['skeleton', 'darkMage'],
                level: [10, 25]
            }
        }
    },
    wuLingStar: {
        name: '午灵星',
        areas: {
            desert: {
                name: '烈焰沙漠',
                description: '炽热的沙漠，只有强者才能在这里生存...',
                safe: false,
                monsters: ['orc', 'darkMage'],
                level: [15, 30]
            }
        }
    }
};

// 物品数据
const ITEMS = {
    consumables: {
        healthPotion: {
            name: '血瓶',
            description: '恢复少量生命值',
            effect: { type: 'heal', value: 50 },
            price: 10
        },
        bigHealthPotion: {
            name: '大血瓶',
            description: '恢复大量生命值',
            effect: { type: 'heal', value: 150 },
            price: 30
        },
        manaPotion: {
            name: '蓝瓶',
            description: '恢复内力值',
            effect: { type: 'mana', value: 30 },
            price: 15
        }
    },
    materials: {
        copperPlate: {
            name: '破天铜牌',
            description: '用于强化装备的材料',
            price: 20
        },
        silverPlate: {
            name: '破天银牌',
            description: '用于强化高级装备的材料',
            price: 50
        },
        goldPlate: {
            name: '破天金牌',
            description: '用于强化神器的珍贵材料',
            price: 200
        }
    }
};

// 故事剧情数据
const STORY_DATA = {
    prologue: {
        title: '序章：天道轮回',
        content: `
            创世之初，天极星、人极星、地极星、四象星、大天王星、修罗星、12圣灵星，构成了整个宇宙。
            太极八卦封印了由明的创世之神和暗的逆天之神互通的神界之门。
            
            紫微星是太初宇宙的中心，历经了万年的时光，18星宿上的生灵各自繁衍互不干涉。
            然天道轮回，时逢紫微星转暗，创世之神黯然消陨，缺少了紫微星光彩能量的世界，
            光明的力量逐渐消弱，逆天之神强大的黑暗能量开始膨胀。
            
            只有人极星在创世之神的元神守护下，没有陷入逆天之神的黑暗笼罩。
            你，作为人极星的武者，必须踏上寻找3件亘古圣物的征程：
            破天剑、破天牌、破天秘笈，阻止整个宇宙沦为逆天之神主宰的漫无边际的黑洞。
        `,
        choices: [
            { text: '踏上征程', action: 'startAdventure' },
            { text: '了解更多', action: 'showMoreInfo' }
        ]
    }
};

// 五行相克关系
const ELEMENT_RELATIONS = {
    fire: { strong: ['ice', 'dark'], weak: ['water', 'earth'] },
    water: { strong: ['fire', 'earth'], weak: ['ice', 'thunder'] },
    earth: { strong: ['water', 'wind'], weak: ['fire', 'poison'] },
    wind: { strong: ['earth', 'thunder'], weak: ['light', 'dark'] },
    ice: { strong: ['wind', 'poison'], weak: ['fire', 'light'] },
    thunder: { strong: ['ice', 'light'], weak: ['water', 'wind'] },
    light: { strong: ['dark', 'poison'], weak: ['thunder', 'ice'] },
    dark: { strong: ['light', 'thunder'], weak: ['fire', 'wind'] },
    poison: { strong: ['light', 'earth'], weak: ['ice', 'dark'] }
};

// 游戏配置
const GAME_CONFIG = {
    maxLevel: 100,
    baseExp: 100,
    expMultiplier: 1.2,
    maxInventorySlots: 20,
    autoSaveInterval: 30000, // 30秒自动保存
    battleAnimationSpeed: 1000 // 战斗动画速度
};