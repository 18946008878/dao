// 角色类定义
class Character {
    constructor(data) {
        this.id = data.id || '';
        this.name = data.name || '无名';
        this.type = data.type || '';
        this.element = data.element || 'none';
        this.trigram = data.trigram || 'none';
        
        // 基础属性
        this.level = data.level || 1;
        this.exp = data.exp || 0;
        this.constitution = data.constitution || 10;
        this.agility = data.agility || 10;
        this.wisdom = data.wisdom || 10;
        
        // 状态属性
        this.maxHp = this.calculateMaxHp();
        this.currentHp = data.currentHp || this.maxHp;
        this.maxMp = this.calculateMaxMp();
        this.currentMp = data.currentMp || this.maxMp;
        this.gold = data.gold || 0;
        
        // 战斗属性
        this.attack = this.calculateAttack();
        this.defense = this.calculateDefense();
        this.speed = this.calculateSpeed();
        
        // 技能
        this.skills = data.skills || [];
        this.auxiliarySkills = data.auxiliarySkills || [];
        
        // 装备
        this.equipment = {
            weapon: null,
            head: null,
            body: null,
            accessory: null
        };
        
        // 状态效果
        this.buffs = [];
        this.debuffs = [];
        
        // 敌人标识
        this.isEnemy = data.isEnemy || false;
    }

    // 计算最大生命值
    calculateMaxHp() {
        return 100 + (this.constitution * 10) + (this.level * 15);
    }

    // 计算最大内力值
    calculateMaxMp() {
        return 50 + (this.wisdom * 5) + (this.level * 10);
    }

    // 计算攻击力
    calculateAttack() {
        let baseAttack = 10 + (this.constitution * 2) + (this.level * 3);
        
        // 装备加成
        if (this.equipment.weapon) {
            baseAttack += this.equipment.weapon.attack || 0;
        }
        
        return baseAttack;
    }

    // 计算防御力
    calculateDefense() {
        let baseDefense = 5 + this.constitution + (this.level * 2);
        
        // 装备加成
        Object.values(this.equipment).forEach(item => {
            if (item && item.defense) {
                baseDefense += item.defense;
            }
        });
        
        return baseDefense;
    }

    // 计算速度
    calculateSpeed() {
        return this.agility + (this.level * 2);
    }

    // 升级
    levelUp() {
        this.level++;
        this.exp = 0;
        
        // 增加属性点
        this.constitution += 1;
        this.agility += 1;
        this.wisdom += 1;
        
        // 重新计算属性
        this.updateAttributes();
        
        // 恢复生命值和内力
        this.currentHp = this.maxHp;
        this.currentMp = this.maxMp;
        
        return {
            message: `${this.name} 升级了！等级提升到 ${this.level}！`,
            newLevel: this.level
        };
    }

    // 更新属性
    updateAttributes() {
        const oldMaxHp = this.maxHp;
        const oldMaxMp = this.maxMp;
        
        this.maxHp = this.calculateMaxHp();
        this.maxMp = this.calculateMaxMp();
        this.attack = this.calculateAttack();
        this.defense = this.calculateDefense();
        this.speed = this.calculateSpeed();
        
        // 如果最大值增加，按比例增加当前值
        if (this.maxHp > oldMaxHp) {
            this.currentHp += (this.maxHp - oldMaxHp);
        }
        if (this.maxMp > oldMaxMp) {
            this.currentMp += (this.maxMp - oldMaxMp);
        }
    }

    // 装备物品
    equipItem(item) {
        if (item.type === 'weapon') {
            this.equipment.weapon = item;
        } else if (item.type === 'armor') {
            this.equipment[item.slot] = item;
        }
        
        this.updateAttributes();
        
        return {
            success: true,
            message: `装备了 ${item.name}`
        };
    }

    // 卸下装备
    unequipItem(slot) {
        if (this.equipment[slot]) {
            const item = this.equipment[slot];
            this.equipment[slot] = null;
            this.updateAttributes();
            
            return {
                success: true,
                item: item,
                message: `卸下了 ${item.name}`
            };
        }
        
        return {
            success: false,
            message: '该位置没有装备'
        };
    }

    // 使用技能
    useSkill(skillId, target = null) {
        const skill = SKILLS[skillId];
        if (!skill) {
            return {
                success: false,
                message: '未知技能'
            };
        }

        // 检查内力
        if (this.currentMp < skill.cost) {
            return {
                success: false,
                message: '内力不足'
            };
        }

        // 检查是否拥有该技能
        if (!this.skills.includes(skillId) && !this.auxiliarySkills.includes(skillId)) {
            return {
                success: false,
                message: '未学会该技能'
            };
        }

        // 消耗内力
        this.currentMp -= skill.cost;

        // 执行技能效果
        return this.executeSkillEffect(skill, target);
    }

    // 执行技能效果
    executeSkillEffect(skill, target) {
        const effect = skill.effect;
        let result = {
            success: true,
            message: `${this.name} 使用了 ${skill.name}！`,
            damage: 0,
            heal: 0
        };

        switch (effect.type) {
            case 'heal':
                const healAmount = Math.floor(this.maxHp * effect.value);
                this.currentHp = Math.min(this.maxHp, this.currentHp + healAmount);
                result.heal = healAmount;
                result.message += ` 恢复了 ${healAmount} 点生命值！`;
                break;

            case 'lifeDrain':
                if (target) {
                    const damage = Math.floor(this.attack * 1.2);
                    const drainAmount = Math.floor(damage * effect.value);
                    result.damage = damage;
                    result.heal = drainAmount;
                    this.currentHp = Math.min(this.maxHp, this.currentHp + drainAmount);
                    result.message += ` 造成 ${damage} 点伤害并吸收 ${drainAmount} 点生命值！`;
                }
                break;

            case 'attackSpeed':
            case 'defense':
            case 'weaponPower':
                this.addBuff(skill.id, effect);
                result.message += ` 获得了 ${skill.name} 效果！`;
                break;

            default:
                result.message += ' 产生了神秘的效果！';
        }

        return result;
    }

    // 添加增益效果
    addBuff(buffId, effect) {
        this.buffs.push({
            id: buffId,
            effect: effect,
            remainingTurns: effect.duration || 1,
            appliedAt: Date.now()
        });
    }

    // 更新增益效果
    updateBuffs() {
        this.buffs = this.buffs.filter(buff => {
            buff.remainingTurns--;
            return buff.remainingTurns > 0;
        });
    }

    // 受到伤害
    takeDamage(damage, element = 'none') {
        // 五行相克计算
        const modifier = this.getElementModifier(element);
        const actualDamage = Math.max(1, Math.floor((damage - this.defense) * modifier));
        
        this.currentHp = Math.max(0, this.currentHp - actualDamage);
        
        return {
            damage: actualDamage,
            isDead: this.currentHp <= 0,
            message: `${this.name} 受到了 ${actualDamage} 点伤害！`
        };
    }

    // 获取五行相克修正
    getElementModifier(attackElement) {
        if (attackElement === 'none' || this.element === 'none') {
            return 1.0;
        }

        const relations = ELEMENT_RELATIONS[attackElement];
        if (!relations) return 1.0;

        if (relations.strong.includes(this.element)) {
            return 1.3; // 相克，增加伤害
        } else if (relations.weak.includes(this.element)) {
            return 0.7; // 相生，减少伤害
        }

        return 1.0; // 无关系
    }

    // 恢复生命值
    heal(amount) {
        const actualHeal = Math.min(amount, this.maxHp - this.currentHp);
        this.currentHp += actualHeal;
        
        return {
            heal: actualHeal,
            message: `${this.name} 恢复了 ${actualHeal} 点生命值！`
        };
    }

    // 恢复内力值
    restoreMp(amount) {
        const actualRestore = Math.min(amount, this.maxMp - this.currentMp);
        this.currentMp += actualRestore;
        
        return {
            restore: actualRestore,
            message: `${this.name} 恢复了 ${actualRestore} 点内力！`
        };
    }

    // 获取经验值
    gainExp(amount) {
        this.exp += amount;
        const expNeeded = this.getExpNeeded();
        
        if (this.exp >= expNeeded) {
            return this.levelUp();
        }
        
        return {
            message: `${this.name} 获得了 ${amount} 点经验值！`,
            currentExp: this.exp,
            expNeeded: expNeeded
        };
    }

    // 获取升级所需经验
    getExpNeeded() {
        return Math.floor(GAME_CONFIG.baseExp * Math.pow(GAME_CONFIG.expMultiplier, this.level - 1));
    }

    // 获取角色信息
    getInfo() {
        return {
            name: this.name,
            level: this.level,
            type: this.type,
            element: this.element,
            hp: `${this.currentHp}/${this.maxHp}`,
            mp: `${this.currentMp}/${this.maxMp}`,
            attack: this.attack,
            defense: this.defense,
            speed: this.speed,
            exp: `${this.exp}/${this.getExpNeeded()}`,
            skills: this.skills,
            auxiliarySkills: this.auxiliarySkills
        };
    }

    // 检查是否死亡
    isDead() {
        return this.currentHp <= 0;
    }

    // 复活
    revive(hpPercent = 0.5) {
        if (this.isDead()) {
            this.currentHp = Math.floor(this.maxHp * hpPercent);
            return {
                success: true,
                message: `${this.name} 复活了！`
            };
        }
        
        return {
            success: false,
            message: `${this.name} 还活着！`
        };
    }
}