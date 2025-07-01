// 战斗系统类
class Battle {
    constructor(player, enemy) {
        this.player = player;
        this.enemy = enemy;
        this.turn = 0;
        this.isPlayerTurn = this.player.speed >= this.enemy.speed;
        this.isOver = false;
        this.winner = null;
        this.battleLog = [];
        this.playerSummons = [];
        this.enemySummons = [];
    }

    // 玩家攻击
    playerAttack(type = 'normal', skillId = null) {
        if (this.isOver || !this.isPlayerTurn) {
            return {
                success: false,
                message: '不是你的回合！'
            };
        }

        let result = { success: true, message: '', damage: 0 };

        if (type === 'skill' && skillId) {
            result = this.useSkillInBattle(this.player, this.enemy, skillId);
        } else {
            result = this.normalAttack(this.player, this.enemy);
        }

        // 检查战斗是否结束
        this.checkBattleEnd();
        
        // 切换回合
        this.isPlayerTurn = false;
        this.turn++;

        return result;
    }

    // 敌人攻击
    enemyAttack() {
        if (this.isOver || this.isPlayerTurn) {
            return {
                success: false,
                message: '不是敌人的回合！'
            };
        }

        // 简单的AI：随机选择攻击方式
        const actions = ['normal', 'skill'];
        const action = actions[Math.floor(Math.random() * actions.length)];
        
        let result = { success: true, message: '', damage: 0 };

        if (action === 'skill' && this.enemy.skills.length > 0) {
            const randomSkill = this.enemy.skills[Math.floor(Math.random() * this.enemy.skills.length)];
            if (this.enemy.currentMp >= SKILLS[randomSkill].cost) {
                result = this.useSkillInBattle(this.enemy, this.player, randomSkill);
            } else {
                result = this.normalAttack(this.enemy, this.player);
            }
        } else {
            result = this.normalAttack(this.enemy, this.player);
        }

        // 检查战斗是否结束
        this.checkBattleEnd();
        
        // 切换回合
        this.isPlayerTurn = true;

        return result;
    }

    // 普通攻击
    normalAttack(attacker, target) {
        // 计算基础伤害
        let damage = attacker.attack;
        
        // 随机因素 (80%-120%)
        damage = Math.floor(damage * (0.8 + Math.random() * 0.4));
        
        // 应用增益效果
        const attackBuff = attacker.buffs.find(buff => buff.effect.type === 'attackSpeed' || buff.effect.type === 'weaponPower');
        if (attackBuff) {
            damage = Math.floor(damage * attackBuff.effect.value);
        }

        // 应用防御
        const damageResult = target.takeDamage(damage, attacker.element);
        
        // 更新增益效果
        attacker.updateBuffs();
        target.updateBuffs();

        return {
            success: true,
            message: `${attacker.name} 对 ${target.name} 造成了 ${damageResult.damage} 点伤害！`,
            damage: damageResult.damage,
            targetDead: damageResult.isDead
        };
    }

    // 在战斗中使用技能
    useSkillInBattle(attacker, target, skillId) {
        const skillResult = attacker.useSkill(skillId, target);
        
        if (!skillResult.success) {
            return skillResult;
        }

        let totalMessage = skillResult.message;
        let totalDamage = skillResult.damage || 0;

        // 如果技能造成伤害
        if (skillResult.damage > 0) {
            const damageResult = target.takeDamage(skillResult.damage, attacker.element);
            totalDamage = damageResult.damage;
            totalMessage += ` 造成了 ${damageResult.damage} 点伤害！`;
        }

        return {
            success: true,
            message: totalMessage,
            damage: totalDamage,
            heal: skillResult.heal || 0,
            targetDead: target.isDead()
        };
    }

    // 检查战斗是否结束
    checkBattleEnd() {
        if (this.player.isDead()) {
            this.isOver = true;
            this.winner = 'enemy';
        } else if (this.enemy.isDead()) {
            this.isOver = true;
            this.winner = 'player';
        }
    }

    // 逃跑
    attemptFlee() {
        // 逃跑成功率基于敏捷差异
        const fleeChance = Math.min(0.9, Math.max(0.1, (this.player.agility - this.enemy.agility + 50) / 100));
        
        if (Math.random() < fleeChance) {
            this.isOver = true;
            this.winner = 'fled';
            return {
                success: true,
                message: '成功逃脱了！'
            };
        } else {
            // 逃跑失败，敌人获得一次攻击机会
            this.isPlayerTurn = false;
            return {
                success: false,
                message: '逃跑失败！敌人趁机发动了攻击！'
            };
        }
    }

    // 使用物品
    useItem(item, target = null) {
        if (!item || !item.effect) {
            return {
                success: false,
                message: '无效的物品！'
            };
        }

        const actualTarget = target || this.player;
        let result = { success: true, message: `使用了 ${item.name}！` };

        switch (item.effect.type) {
            case 'heal':
                const healResult = actualTarget.heal(item.effect.value);
                result.message += healResult.message;
                result.heal = healResult.heal;
                break;

            case 'mana':
                const manaResult = actualTarget.restoreMp(item.effect.value);
                result.message += manaResult.message;
                result.manaRestore = manaResult.restore;
                break;

            default:
                result.message += ' 产生了神秘的效果！';
        }

        // 使用物品不消耗回合（玩家回合内使用）
        return result;
    }

    // 获取战斗状态
    getBattleStatus() {
        return {
            player: {
                name: this.player.name,
                level: this.player.level,
                hp: this.player.currentHp,
                maxHp: this.player.maxHp,
                mp: this.player.currentMp,
                maxMp: this.player.maxMp,
                buffs: this.player.buffs
            },
            enemy: {
                name: this.enemy.name,
                level: this.enemy.level,
                hp: this.enemy.currentHp,
                maxHp: this.enemy.maxHp,
                buffs: this.enemy.buffs
            },
            turn: this.turn,
            isPlayerTurn: this.isPlayerTurn,
            isOver: this.isOver,
            winner: this.winner
        };
    }

    // 获取战斗奖励
    getBattleRewards() {
        if (this.winner !== 'player') {
            return {
                exp: 0,
                gold: 0,
                items: []
            };
        }

        const baseExp = this.enemy.exp || 10;
        const baseGold = this.enemy.gold || 5;
        
        // 等级差异加成
        const levelDiff = Math.max(0, this.enemy.level - this.player.level);
        const levelBonus = 1 + (levelDiff * 0.1);
        
        const finalExp = Math.floor(baseExp * levelBonus);
        const finalGold = Math.floor(baseGold * levelBonus);
        
        // 掉落物品
        const drops = [];
        if (this.enemy.drops) {
            this.enemy.drops.forEach(dropName => {
                if (Math.random() < 0.3) { // 30% 掉落率
                    drops.push(dropName);
                }
            });
        }

        return {
            exp: finalExp,
            gold: finalGold,
            items: drops
        };
    }

    // 计算伤害预览
    calculateDamagePreview(attacker, target, skillId = null) {
        let baseDamage = attacker.attack;
        
        if (skillId) {
            const skill = SKILLS[skillId];
            if (skill && skill.effect.type === 'lifeDrain') {
                baseDamage = Math.floor(baseDamage * 1.2);
            }
        }
        
        // 应用增益效果
        const attackBuff = attacker.buffs.find(buff => 
            buff.effect.type === 'attackSpeed' || buff.effect.type === 'weaponPower'
        );
        if (attackBuff) {
            baseDamage = Math.floor(baseDamage * attackBuff.effect.value);
        }
        
        // 五行相克
        const modifier = target.getElementModifier(attacker.element);
        const finalDamage = Math.max(1, Math.floor((baseDamage - target.defense) * modifier));
        
        return {
            minDamage: Math.floor(finalDamage * 0.8),
            maxDamage: Math.floor(finalDamage * 1.2),
            averageDamage: finalDamage
        };
    }

    // 获取可用技能列表
    getAvailableSkills(character) {
        return character.skills.filter(skillId => {
            const skill = SKILLS[skillId];
            return skill && character.currentMp >= skill.cost;
        }).map(skillId => ({
            id: skillId,
            ...SKILLS[skillId]
        }));
    }

    // 自动战斗（挂机用）
    autoBattle() {
        const actions = [];
        
        while (!this.isOver) {
            if (this.isPlayerTurn) {
                // 玩家回合 - 简单AI
                if (this.player.currentHp < this.player.maxHp * 0.3) {
                    // 生命值低，尝试使用回复技能
                    const healSkills = this.player.skills.filter(skillId => 
                        SKILLS[skillId] && SKILLS[skillId].effect.type === 'heal'
                    );
                    if (healSkills.length > 0 && this.player.currentMp >= SKILLS[healSkills[0]].cost) {
                        actions.push(this.playerAttack('skill', healSkills[0]));
                        continue;
                    }
                }
                
                // 随机选择攻击方式
                if (this.player.skills.length > 0 && Math.random() < 0.3) {
                    const availableSkills = this.getAvailableSkills(this.player);
                    if (availableSkills.length > 0) {
                        const randomSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
                        actions.push(this.playerAttack('skill', randomSkill.id));
                    } else {
                        actions.push(this.playerAttack('normal'));
                    }
                } else {
                    actions.push(this.playerAttack('normal'));
                }
            } else {
                // 敌人回合
                actions.push(this.enemyAttack());
            }
        }
        
        return actions;
    }
}