// 地图系统类
class MapSystem {
    constructor() {
        this.currentMap = 'humanStar';
        this.currentArea = 'village';
        this.visitedAreas = new Set(['humanStar:village']);
        this.unlockedMaps = new Set(['humanStar']);
    }

    // 获取当前位置
    getCurrentLocation() {
        return {
            map: this.currentMap,
            area: this.currentArea,
            mapData: MAPS[this.currentMap],
            areaData: MAPS[this.currentMap].areas[this.currentArea]
        };
    }

    // 移动到指定位置
    moveTo(mapId, areaId) {
        if (!MAPS[mapId]) {
            return {
                success: false,
                message: '未知的地图'
            };
        }

        if (!MAPS[mapId].areas[areaId]) {
            return {
                success: false,
                message: '未知的区域'
            };
        }

        // 检查是否解锁
        if (!this.unlockedMaps.has(mapId)) {
            return {
                success: false,
                message: '该地图尚未解锁'
            };
        }

        this.currentMap = mapId;
        this.currentArea = areaId;
        this.visitedAreas.add(`${mapId}:${areaId}`);

        return {
            success: true,
            message: `已移动到${MAPS[mapId].name}的${MAPS[mapId].areas[areaId].name}`
        };
    }

    // 解锁新地图
    unlockMap(mapId) {
        if (MAPS[mapId]) {
            this.unlockedMaps.add(mapId);
            return {
                success: true,
                message: `解锁了新地图：${MAPS[mapId].name}`
            };
        }
        return {
            success: false,
            message: '未知的地图'
        };
    }

    // 获取可用的移动选项
    getAvailableDestinations() {
        const destinations = [];
        
        for (const mapId of this.unlockedMaps) {
            const mapData = MAPS[mapId];
            for (const areaId in mapData.areas) {
                if (mapId !== this.currentMap || areaId !== this.currentArea) {
                    destinations.push({
                        mapId,
                        areaId,
                        name: `${mapData.name} - ${mapData.areas[areaId].name}`,
                        visited: this.visitedAreas.has(`${mapId}:${areaId}`)
                    });
                }
            }
        }

        return destinations;
    }

    // 探索当前区域
    explore() {
        const location = this.getCurrentLocation();
        const areaData = location.areaData;

        if (areaData.safe) {
            return this.exploreSafeArea(areaData);
        } else {
            return this.exploreDangerousArea(areaData);
        }
    }

    // 探索安全区域
    exploreSafeArea(areaData) {
        const events = [
            {
                type: 'npc',
                chance: 0.4,
                message: '你遇到了一个友善的NPC，他向你提供了一些有用的信息。'
            },
            {
                type: 'treasure',
                chance: 0.2,
                message: '你在角落里发现了一些遗落的物品。'
            },
            {
                type: 'nothing',
                chance: 0.4,
                message: '你在这个区域逛了一圈，没有发现什么特别的东西。'
            }
        ];

        return this.triggerRandomEvent(events);
    }

    // 探索危险区域
    exploreDangerousArea(areaData) {
        const events = [
            {
                type: 'monster',
                chance: 0.5,
                message: '你遇到了敌人！',
                data: areaData.monsters
            },
            {
                type: 'treasure',
                chance: 0.2,
                message: '你发现了一个隐藏的宝箱！'
            },
            {
                type: 'trap',
                chance: 0.1,
                message: '你踩到了陷阱！'
            },
            {
                type: 'nothing',
                chance: 0.2,
                message: '你小心翼翼地探索了一会儿，但没有遇到任何危险。'
            }
        ];

        return this.triggerRandomEvent(events);
    }

    // 触发随机事件
    triggerRandomEvent(events) {
        const random = Math.random();
        let cumulativeChance = 0;

        for (const event of events) {
            cumulativeChance += event.chance;
            if (random <= cumulativeChance) {
                return this.executeEvent(event);
            }
        }

        // 默认事件
        return {
            type: 'nothing',
            message: '什么也没有发生。'
        };
    }

    // 执行事件
    executeEvent(event) {
        switch (event.type) {
            case 'monster':
                return this.encounterMonster(event.data);
            case 'treasure':
                return this.findTreasure();
            case 'trap':
                return this.triggerTrap();
            case 'npc':
                return this.meetNPC();
            default:
                return {
                    type: event.type,
                    message: event.message
                };
        }
    }

    // 遭遇怪物
    encounterMonster(monsters) {
        if (!monsters || monsters.length === 0) {
            return {
                type: 'nothing',
                message: '这里很安静，没有发现任何敌人。'
            };
        }

        const randomMonster = monsters[Math.floor(Math.random() * monsters.length)];
        return {
            type: 'monster',
            message: `遭遇了${MONSTERS[randomMonster]?.name || '未知敌人'}！`,
            monsterId: randomMonster
        };
    }

    // 发现宝藏
    findTreasure() {
        const treasures = [
            { name: '血瓶', type: 'consumables', chance: 0.4 },
            { name: '破天铜牌', type: 'materials', chance: 0.3 },
            { name: '破天银牌', type: 'materials', chance: 0.2 },
            { name: '金币', type: 'gold', amount: 50, chance: 0.1 }
        ];

        const random = Math.random();
        let cumulativeChance = 0;

        for (const treasure of treasures) {
            cumulativeChance += treasure.chance;
            if (random <= cumulativeChance) {
                return {
                    type: 'treasure',
                    message: `发现了${treasure.name}！`,
                    treasure: treasure
                };
            }
        }

        return {
            type: 'treasure',
            message: '发现了一个空宝箱。'
        };
    }

    // 触发陷阱
    triggerTrap() {
        const damage = Math.floor(Math.random() * 20) + 10;
        return {
            type: 'trap',
            message: `踩到了陷阱！受到了${damage}点伤害！`,
            damage: damage
        };
    }

    // 遇到NPC
    meetNPC() {
        const npcs = [
            {
                name: '神秘商人',
                message: '神秘商人向你兜售一些稀有物品。',
                action: 'shop'
            },
            {
                name: '老者',
                message: '一位老者告诉了你一些关于破天圣物的传说。',
                action: 'info'
            },
            {
                name: '流浪武者',
                message: '一位流浪武者想要与你切磋武艺。',
                action: 'challenge'
            }
        ];

        const randomNPC = npcs[Math.floor(Math.random() * npcs.length)];
        return {
            type: 'npc',
            message: randomNPC.message,
            npc: randomNPC
        };
    }

    // 获取地图信息
    getMapInfo() {
        return {
            currentMap: this.currentMap,
            currentArea: this.currentArea,
            unlockedMaps: Array.from(this.unlockedMaps),
            visitedAreas: Array.from(this.visitedAreas),
            allMaps: Object.keys(MAPS).map(mapId => ({
                id: mapId,
                name: MAPS[mapId].name,
                unlocked: this.unlockedMaps.has(mapId)
            }))
        };
    }

    // 检查区域是否安全
    isCurrentAreaSafe() {
        return this.getCurrentLocation().areaData.safe;
    }

    // 获取当前区域的怪物
    getCurrentAreaMonsters() {
        const areaData = this.getCurrentLocation().areaData;
        return areaData.monsters || [];
    }

    // 导出地图数据
    export() {
        return {
            currentMap: this.currentMap,
            currentArea: this.currentArea,
            visitedAreas: Array.from(this.visitedAreas),
            unlockedMaps: Array.from(this.unlockedMaps)
        };
    }

    // 导入地图数据
    import(data) {
        this.currentMap = data.currentMap || 'humanStar';
        this.currentArea = data.currentArea || 'village';
        this.visitedAreas = new Set(data.visitedAreas || ['humanStar:village']);
        this.unlockedMaps = new Set(data.unlockedMaps || ['humanStar']);
    }
}

// 快速旅行系统
class FastTravel {
    constructor(mapSystem) {
        this.mapSystem = mapSystem;
        this.waypoints = new Map();
        this.initializeWaypoints();
    }

    // 初始化传送点
    initializeWaypoints() {
        // 安全区域可以设置为传送点
        for (const mapId in MAPS) {
            const mapData = MAPS[mapId];
            for (const areaId in mapData.areas) {
                if (mapData.areas[areaId].safe) {
                    this.waypoints.set(`${mapId}:${areaId}`, {
                        mapId,
                        areaId,
                        name: `${mapData.name} - ${mapData.areas[areaId].name}`,
                        unlocked: false
                    });
                }
            }
        }
    }

    // 解锁传送点
    unlockWaypoint(mapId, areaId) {
        const key = `${mapId}:${areaId}`;
        const waypoint = this.waypoints.get(key);
        
        if (waypoint) {
            waypoint.unlocked = true;
            return {
                success: true,
                message: `解锁了传送点：${waypoint.name}`
            };
        }
        
        return {
            success: false,
            message: '无效的传送点'
        };
    }

    // 获取可用传送点
    getAvailableWaypoints() {
        return Array.from(this.waypoints.values()).filter(waypoint => waypoint.unlocked);
    }

    // 快速旅行
    fastTravelTo(mapId, areaId) {
        const key = `${mapId}:${areaId}`;
        const waypoint = this.waypoints.get(key);
        
        if (!waypoint || !waypoint.unlocked) {
            return {
                success: false,
                message: '该传送点尚未解锁'
            };
        }

        return this.mapSystem.moveTo(mapId, areaId);
    }
}