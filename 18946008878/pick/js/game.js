// 破天一剑主游戏逻辑文件

class PoTianYiJian {
    constructor() {
        this.gameState = {
            currentScreen: 'loading',
            player: null,
            currentLocation: null,
            inventory: null, // 将在创建角色时初始化
            gameProgress: {
                artifacts: { // 三件圣物
                    poTianSword: false,
                    poTianPlate: false,
                    poTianManual: false
                },
                completedQuests: [],
                defeatedBosses: []
            },
            battle: null,
            lastSaveTime: Date.now()
        };

        this.selectedCharacter = null;
        this.autoSaveInterval = null;
        
        this.init();
    }

    // 游戏初始化
    init() {
        console.log('破天一剑游戏启动...');
        
        // 模拟加载时间
        setTimeout(() => {
            this.hideLoadingScreen();
            this.showMainMenu();
        }, 3000);

        // 设置角色选择事件监听
        this.setupCharacterSelection();
        
        // 设置自动保存
        this.setupAutoSave();
        
        // 设置键盘事件
        this.setupKeyboardEvents();
    }

    // 隐藏加载画面
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('hidden');
    }

    // 显示主菜单
    showMainMenu() {
        this.gameState.currentScreen = 'main-menu';
        const mainMenu = document.getElementById('main-menu');
        mainMenu.classList.remove('hidden');
    }

    // 设置角色选择事件
    setupCharacterSelection() {
        const characterCards = document.querySelectorAll('.character-card');
        const confirmButton = document.querySelector('#character-creation .btn-primary');
        
        characterCards.forEach(card => {
            card.addEventListener('click', () => {
                // 移除其他选中状态
                characterCards.forEach(c => c.classList.remove('selected'));
                // 添加选中状态
                card.classList.add('selected');
                
                // 保存选择的角色
                this.selectedCharacter = card.dataset.character;
                
                // 启用确认按钮
                confirmButton.disabled = false;
            });
        });
    }

    // 设置自动保存
    setupAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            if (this.gameState.player) {
                this.saveGame();
            }
        }, GAME_CONFIG.autoSaveInterval);
    }

    // 设置键盘事件
    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'Escape':
                    this.handleEscape();
                    break;
                case 'Enter':
                    this.handleEnter();
                    break;
                case 'i':
                case 'I':
                    if (this.gameState.currentScreen === 'game') {
                        this.openInventory();
                    }
                    break;
                case 'c':
                case 'C':
                    if (this.gameState.currentScreen === 'game') {
                        this.openCharacter();
                    }
                    break;
            }
        });
    }

    // 处理ESC键
    handleEscape() {
        if (this.gameState.currentScreen === 'game') {
            this.toggleGameMenu();
        }
    }

    // 处理回车键
    handleEnter() {
        // 根据当前界面执行不同操作
    }

    // 切换界面
    switchScreen(screenId) {
        // 隐藏所有界面
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // 显示目标界面
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            this.gameState.currentScreen = screenId;
        }
    }

    // 创建新角色
    createCharacter() {
        if (!this.selectedCharacter) {
            this.showMessage('请先选择一个角色！');
            return;
        }

        const characterData = CHARACTERS[this.selectedCharacter];
        
        this.gameState.player = new Character({
            id: characterData.id,
            name: characterData.name,
            type: characterData.type,
            element: characterData.element,
            trigram: characterData.trigram,
            constitution: characterData.baseStats.constitution,
            agility: characterData.baseStats.agility,
            wisdom: characterData.baseStats.wisdom,
            level: 1,
            exp: 0,
            skills: [...characterData.skills],
            auxiliarySkills: [...characterData.auxiliarySkills]
        });

        // 给玩家一些初始装备和物品
        this.giveStarterKit();
        
        // 设置初始位置
        this.gameState.currentLocation = { map: 'humanStar', area: 'village' };
        
        // 开始游戏
        this.startGame();
    }

    // 给新玩家初始装备
    giveStarterKit() {
        const characterData = CHARACTERS[this.selectedCharacter];
        
        // 初始化背包系统
        this.gameState.inventory = new Inventory();
        
        // 添加初始武器
        const primaryWeapon = EQUIPMENT.weapons[characterData.primaryWeapon]?.basic;
        if (primaryWeapon) {
            const weapon = {
                ...primaryWeapon,
                type: 'weapon'
            };
            this.gameState.inventory.addItem(weapon);
            // 自动装备
            this.gameState.player.equipItem(weapon);
        }

        // 添加初始防具
        const armor = {
            ...EQUIPMENT.armor.body.basic,
            type: 'armor',
            slot: 'body'
        };
        this.gameState.inventory.addItem(armor);
        this.gameState.player.equipItem(armor);

        // 添加初始物品
        this.gameState.inventory.addItem(ITEMS.consumables.healthPotion, 3);
        this.gameState.inventory.addItem(ITEMS.consumables.manaPotion, 2);
        this.gameState.inventory.addItem(ITEMS.materials.copperPlate, 5);

        // 设置初始金币
        this.gameState.player.gold = 100;
        this.gameState.inventory.gold = 100;
    }

    // 开始游戏
    startGame() {
        this.switchScreen('game-screen');
        this.updateUI();
        this.showStoryPrologue();
    }

    // 显示序章故事
    showStoryPrologue() {
        const storyData = STORY_DATA.prologue;
        this.showStoryDialog(storyData);
    }

    // 显示故事对话框
    showStoryDialog(storyData) {
        const gameText = document.getElementById('game-text');
        const choiceButtons = document.getElementById('choice-buttons');
        
        // 清空之前的内容
        gameText.innerHTML = '';
        choiceButtons.innerHTML = '';
        
        // 显示故事标题和内容
        gameText.innerHTML = `
            <h3 style="color: #ffd700; margin-bottom: 15px;">${storyData.title}</h3>
            <p style="line-height: 1.8;">${storyData.content.trim()}</p>
        `;

        // 显示选择按钮
        if (storyData.choices) {
            storyData.choices.forEach(choice => {
                const button = document.createElement('button');
                button.className = 'choice-btn';
                button.textContent = choice.text;
                button.addEventListener('click', () => {
                    this.handleStoryChoice(choice.action);
                });
                choiceButtons.appendChild(button);
            });
        }
    }

    // 处理故事选择
    handleStoryChoice(action) {
        switch(action) {
            case 'startAdventure':
                this.startAdventure();
                break;
            case 'showMoreInfo':
                this.showGameInfo();
                break;
            default:
                console.log('未知的故事选择:', action);
        }
    }

    // 开始冒险
    startAdventure() {
        this.showLocationDescription();
    }

    // 显示当前位置描述
    showLocationDescription() {
        const { map, area } = this.gameState.currentLocation;
        const mapData = MAPS[map];
        const areaData = mapData.areas[area];
        
        const gameText = document.getElementById('game-text');
        const choiceButtons = document.getElementById('choice-buttons');
        
        gameText.innerHTML = `
            <h3 style="color: #ffd700;">${areaData.name}</h3>
            <p>${areaData.description}</p>
            <p style="margin-top: 15px; color: #aaa;">你现在位于${mapData.name}的${areaData.name}。</p>
        `;

        // 清空选择按钮
        choiceButtons.innerHTML = '';

        // 根据当前位置显示可用选项
        this.showLocationOptions(areaData);
    }

    // 显示位置选项
    showLocationOptions(areaData) {
        const choiceButtons = document.getElementById('choice-buttons');
        
        if (areaData.safe) {
            // 安全区域的选项
            this.addChoiceButton('休息恢复', () => this.rest());
            this.addChoiceButton('查看商店', () => this.openShop());
            this.addChoiceButton('与NPC对话', () => this.talkToNPC());
            this.addChoiceButton('前往其他地区', () => this.showMapSelection());
        } else {
            // 危险区域的选项
            this.addChoiceButton('探索区域', () => this.explore());
            this.addChoiceButton('寻找宝藏', () => this.searchTreasure());
            this.addChoiceButton('返回安全区', () => this.returnToSafeArea());
        }
    }

    // 添加选择按钮
    addChoiceButton(text, callback) {
        const choiceButtons = document.getElementById('choice-buttons');
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = text;
        button.addEventListener('click', callback);
        choiceButtons.appendChild(button);
    }

    // 更新UI
    updateUI() {
        if (!this.gameState.player) return;

        const player = this.gameState.player;
        
        // 更新角色信息
        document.getElementById('character-name').textContent = player.name;
        document.getElementById('character-level').textContent = `Lv.${player.level}`;
        
        // 更新资源
        document.getElementById('hp-text').textContent = `${player.currentHp}/${player.maxHp}`;
        document.getElementById('mp-text').textContent = `${player.currentMp}/${player.maxMp}`;
        document.getElementById('gold-text').textContent = player.gold;
    }

    // 探索
    explore() {
        const { map, area } = this.gameState.currentLocation;
        const areaData = MAPS[map].areas[area];
        
        // 随机遭遇
        const encounterChance = Math.random();
        
        if (encounterChance < 0.6) {
            // 遭遇怪物
            this.encounterMonster(areaData);
        } else if (encounterChance < 0.8) {
            // 发现宝藏
            this.findTreasure();
        } else {
            // 平安无事
            this.showMessage('你在这片区域探索了一会儿，但是什么都没有发现。');
        }
    }

    // 遭遇怪物
    encounterMonster(areaData) {
        if (!areaData.monsters || areaData.monsters.length === 0) {
            this.showMessage('这里很安静，没有发现任何敌人。');
            return;
        }

        // 随机选择一个怪物
        const randomMonster = areaData.monsters[Math.floor(Math.random() * areaData.monsters.length)];
        const monsterData = MONSTERS[randomMonster];
        
        if (monsterData) {
            this.initiateBattle(monsterData);
        }
    }

    // 发起战斗
    initiateBattle(monsterData) {
        // 创建敌人实例
        const enemy = new Character({
            name: monsterData.name,
            level: monsterData.level,
            constitution: Math.floor(monsterData.hp / 10),
            agility: Math.floor(monsterData.attack / 5),
            wisdom: Math.floor(monsterData.defense / 3),
            isEnemy: true
        });

        // 设置敌人属性
        enemy.maxHp = monsterData.hp;
        enemy.currentHp = monsterData.hp;
        enemy.attack = monsterData.attack;
        enemy.defense = monsterData.defense;
        enemy.exp = monsterData.exp;
        enemy.gold = monsterData.gold;
        enemy.drops = monsterData.drops || [];

        // 开始战斗
        this.gameState.battle = new Battle(this.gameState.player, enemy);
        this.showBattleScreen();
    }

    // 显示战斗画面
    showBattleScreen() {
        const gameText = document.getElementById('game-text');
        const choiceButtons = document.getElementById('choice-buttons');
        
        const battle = this.gameState.battle;
        const player = battle.player;
        const enemy = battle.enemy;

        gameText.innerHTML = `
            <div class="battle-stats">
                <div class="character-battle-info">
                    <h4>${player.name} (Lv.${player.level})</h4>
                    <div class="hp-bar">
                        <span>HP: ${player.currentHp}/${player.maxHp}</span>
                        <div class="bar">
                            <div class="fill" style="width: ${(player.currentHp/player.maxHp)*100}%"></div>
                        </div>
                    </div>
                    <div class="mp-bar">
                        <span>MP: ${player.currentMp}/${player.maxMp}</span>
                        <div class="bar">
                            <div class="fill" style="width: ${(player.currentMp/player.maxMp)*100}%"></div>
                        </div>
                    </div>
                </div>
                <div class="enemy-battle-info">
                    <h4>${enemy.name} (Lv.${enemy.level})</h4>
                    <div class="hp-bar">
                        <span>HP: ${enemy.currentHp}/${enemy.maxHp}</span>
                        <div class="bar">
                            <div class="fill" style="width: ${(enemy.currentHp/enemy.maxHp)*100}%"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="battle-log" style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin: 15px 0; max-height: 150px; overflow-y: auto;">
                <p>遭遇了 ${enemy.name}！战斗开始！</p>
            </div>
        `;

        // 显示战斗选项
        choiceButtons.innerHTML = '';
        this.showBattleOptions();
    }

    // 显示战斗选项
    showBattleOptions() {
        const choiceButtons = document.getElementById('choice-buttons');
        choiceButtons.innerHTML = '';

        // 添加战斗按钮
        this.addBattleButton('普通攻击', () => this.playerAttack('normal'));
        this.addBattleButton('使用技能', () => this.showSkillMenu());
        this.addBattleButton('使用物品', () => this.showBattleItemMenu());
        this.addBattleButton('逃跑', () => this.attemptFlee());
    }

    // 添加战斗按钮
    addBattleButton(text, callback) {
        const choiceButtons = document.getElementById('choice-buttons');
        const button = document.createElement('button');
        button.className = 'battle-btn';
        button.textContent = text;
        button.addEventListener('click', callback);
        choiceButtons.appendChild(button);
    }

    // 玩家攻击
    playerAttack(type) {
        const battle = this.gameState.battle;
        const result = battle.playerAttack(type);
        
        this.updateBattleLog(result.message);
        this.updateBattleScreen();
        
        if (!battle.isOver) {
            // 敌人回合
            setTimeout(() => {
                this.enemyTurn();
            }, 1000);
        } else {
            // 战斗结束
            this.endBattle(result);
        }
    }

    // 敌人回合
    enemyTurn() {
        const battle = this.gameState.battle;
        const result = battle.enemyAttack();
        
        this.updateBattleLog(result.message);
        this.updateBattleScreen();
        
        if (battle.isOver) {
            this.endBattle(result);
        } else {
            // 显示战斗选项继续玩家回合
            this.showBattleOptions();
        }
    }

    // 更新战斗日志
    updateBattleLog(message) {
        const battleLog = document.getElementById('battle-log');
        if (battleLog) {
            const p = document.createElement('p');
            p.textContent = message;
            battleLog.appendChild(p);
            battleLog.scrollTop = battleLog.scrollHeight;
        }
    }

    // 更新战斗画面
    updateBattleScreen() {
        // 重新渲染战斗画面以更新HP/MP
        this.showBattleScreen();
    }

    // 结束战斗
    endBattle(result) {
        const battle = this.gameState.battle;
        
        if (result.winner === 'player') {
            // 玩家胜利
            const enemy = battle.enemy;
            this.gameState.player.gainExp(enemy.exp);
            this.gameState.player.gold += enemy.gold;
            
            this.updateBattleLog(`战斗胜利！获得 ${enemy.exp} 经验值和 ${enemy.gold} 金币。`);
            
            // 掉落物品
            if (enemy.drops && enemy.drops.length > 0) {
                const drop = enemy.drops[Math.floor(Math.random() * enemy.drops.length)];
                this.updateBattleLog(`获得物品：${drop}`);
                // TODO: 添加物品到背包
            }
            
            setTimeout(() => {
                this.gameState.battle = null;
                this.showLocationDescription();
                this.updateUI();
            }, 3000);
            
        } else {
            // 玩家失败
            this.updateBattleLog('你被击败了...');
            setTimeout(() => {
                this.gameOver();
            }, 2000);
        }
    }

    // 游戏结束
    gameOver() {
        const gameText = document.getElementById('game-text');
        const choiceButtons = document.getElementById('choice-buttons');
        
        gameText.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h2 style="color: #e74c3c; margin-bottom: 20px;">游戏结束</h2>
                <p style="margin-bottom: 30px;">纵然此次征程未能如愿，但武者之路永无止境。</p>
                <p style="color: #aaa;">重新开始，再次踏上破天一剑的征程吧！</p>
            </div>
        `;
        
        choiceButtons.innerHTML = '';
        this.addChoiceButton('重新开始', () => {
            this.resetGame();
            this.switchScreen('main-menu');
        });
    }

    // 重置游戏
    resetGame() {
        this.gameState = {
            currentScreen: 'main-menu',
            player: null,
            currentLocation: null,
            inventory: null,
            gameProgress: {
                artifacts: {
                    poTianSword: false,
                    poTianPlate: false,
                    poTianManual: false
                },
                completedQuests: [],
                defeatedBosses: []
            },
            battle: null,
            lastSaveTime: Date.now()
        };
        this.selectedCharacter = null;
    }

    // 休息
    rest() {
        if (this.gameState.player) {
            // 恢复HP和MP
            this.gameState.player.currentHp = this.gameState.player.maxHp;
            this.gameState.player.currentMp = this.gameState.player.maxMp;
            this.updateUI();
            this.showMessage('你休息了一会儿，恢复了体力和内力。');
        }
    }

    // 打开商店
    openShop() {
        this.showMessage('商店功能正在开发中...');
    }

    // 与NPC对话
    talkToNPC() {
        this.showMessage('NPC对话功能正在开发中...');
    }

    // 显示地图选择
    showMapSelection() {
        this.showMessage('地图传送功能正在开发中...');
    }

    // 寻找宝藏
    searchTreasure() {
        const treasures = ['破天铜牌', '血瓶', '蓝瓶', '金币'];
        const randomTreasure = treasures[Math.floor(Math.random() * treasures.length)];
        
        if (randomTreasure === '金币') {
            const gold = Math.floor(Math.random() * 50) + 10;
            this.gameState.player.gold += gold;
            this.gameState.inventory.gold += gold;
            this.showMessage(`发现了 ${gold} 金币！`);
        } else {
            this.showMessage(`发现了 ${randomTreasure}！`);
            // TODO: 添加物品到背包
        }
        this.updateUI();
    }

    // 返回安全区
    returnToSafeArea() {
        this.gameState.currentLocation = { map: 'humanStar', area: 'village' };
        this.showMessage('你返回了汉罗山庄。');
        setTimeout(() => {
            this.showLocationDescription();
        }, 2000);
    }

    // 发现宝藏
    findTreasure() {
        this.searchTreasure();
    }

    // 显示技能菜单
    showSkillMenu() {
        this.showMessage('技能菜单正在开发中...');
    }

    // 显示战斗物品菜单
    showBattleItemMenu() {
        this.showMessage('战斗物品菜单正在开发中...');
    }

    // 尝试逃跑
    attemptFlee() {
        const battle = this.gameState.battle;
        const result = battle.attemptFlee();
        
        this.updateBattleLog(result.message);
        
        if (result.success) {
            this.gameState.battle = null;
            setTimeout(() => {
                this.showLocationDescription();
            }, 2000);
        } else {
            // 逃跑失败，敌人攻击
            setTimeout(() => {
                this.enemyTurn();
            }, 1000);
        }
    }

    // 显示消息
    showMessage(message) {
        const gameText = document.getElementById('game-text');
        gameText.innerHTML = `<p style="color: #ffd700; text-align: center; padding: 20px;">${message}</p>`;
        
        // 3秒后返回位置描述
        setTimeout(() => {
            this.showLocationDescription();
        }, 3000);
    }

    // 显示游戏信息
    showGameInfo() {
        this.openModal('游戏信息', `
            <div style="line-height: 1.8;">
                <h4 style="color: #ffd700; margin-bottom: 10px;">游戏特色</h4>
                <ul style="margin-bottom: 20px;">
                    <li>• 8个独特的武侠职业可选择</li>
                    <li>• 基于五行八卦的战斗系统</li>
                    <li>• 丰富的技能和装备系统</li>
                    <li>• 探索星际武侠世界</li>
                    <li>• 寻找三件亘古圣物</li>
                </ul>
                
                <h4 style="color: #ffd700; margin-bottom: 10px;">操作说明</h4>
                <ul>
                    <li>• 点击选择按钮进行操作</li>
                    <li>• 按 I 键打开背包</li>
                    <li>• 按 C 键查看人物</li>
                    <li>• 按 ESC 键打开菜单</li>
                </ul>
            </div>
        `);
    }

    // 保存游戏
    saveGame() {
        try {
            const saveData = {
                gameState: this.gameState,
                selectedCharacter: this.selectedCharacter,
                saveTime: Date.now()
            };
            
            localStorage.setItem('poTianYiJian_save', JSON.stringify(saveData));
            this.gameState.lastSaveTime = Date.now();
            console.log('游戏已保存');
        } catch (error) {
            console.error('保存游戏失败:', error);
        }
    }

    // 加载游戏
    loadGame() {
        try {
            const saveData = localStorage.getItem('poTianYiJian_save');
            if (saveData) {
                const data = JSON.parse(saveData);
                this.gameState = data.gameState;
                this.selectedCharacter = data.selectedCharacter;
                
                // 重新创建角色对象
                if (this.gameState.player) {
                    this.gameState.player = new Character(this.gameState.player);
                }
                
                this.switchScreen('game-screen');
                this.updateUI();
                this.showLocationDescription();
                
                this.showMessage('游戏加载成功！');
            } else {
                this.showMessage('没有找到存档文件。');
            }
        } catch (error) {
            console.error('加载游戏失败:', error);
            this.showMessage('加载游戏失败！');
        }
    }

    // 打开模态框
    openModal(title, content) {
        const modal = document.getElementById('modal-overlay');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        modal.classList.remove('hidden');
    }

    // 关闭模态框
    closeModal() {
        const modal = document.getElementById('modal-overlay');
        modal.classList.add('hidden');
    }
}

// 全局游戏实例
let game;

// 全局函数（供HTML调用）
function startNewGame() {
    game.switchScreen('character-creation');
}

function loadGame() {
    game.loadGame();
}

function showSettings() {
    game.openModal('游戏设置', `
        <div style="padding: 20px;">
            <p style="text-align: center; color: #aaa;">设置功能正在开发中...</p>
        </div>
    `);
}

function showAbout() {
    game.openModal('关于游戏', `
        <div style="line-height: 1.8;">
            <h4 style="color: #ffd700; margin-bottom: 15px;">破天一剑 - 星际武侠传</h4>
            <p style="margin-bottom: 15px;">这是一款基于经典破天一剑世界观的文字冒险RPG游戏。</p>
            <p style="margin-bottom: 15px;">在这个宇宙中，你将扮演人极星的武者，踏上寻找三件亘古圣物的征程，阻止逆天之神的黑暗统治。</p>
            <p style="color: #aaa; font-size: 14px;">版本: 1.0.0<br>开发者: AI Assistant</p>
        </div>
    `);
}

function backToMenu() {
    game.switchScreen('main-menu');
}

function confirmCharacter() {
    game.createCharacter();
}

function closeModal() {
    game.closeModal();
}

function explore() {
    game.explore();
}

function rest() {
    game.rest();
}

function openInventory() {
    if (uiManager) {
        uiManager.openInventoryModal();
    } else {
        game.showMessage('UI系统未初始化');
    }
}

function openCharacter() {
    if (uiManager) {
        uiManager.openCharacterModal();
    } else {
        game.showMessage('UI系统未初始化');
    }
}

function toggleGameMenu() {
    // TODO: 实现游戏菜单
    game.openModal('游戏菜单', `
        <div style="text-align: center;">
            <button class="btn-primary" onclick="game.saveGame(); closeModal();" style="margin: 10px;">保存游戏</button><br>
            <button class="btn-secondary" onclick="game.switchScreen('main-menu'); closeModal();" style="margin: 10px;">返回主菜单</button><br>
            <button class="btn-secondary" onclick="closeModal();" style="margin: 10px;">继续游戏</button>
        </div>
    `);
}

function switchTab(tab) {
    if (uiManager) {
        uiManager.switchTab(tab);
    } else {
        console.log('切换到标签页:', tab);
    }
}

// 页面加载完成后启动游戏
document.addEventListener('DOMContentLoaded', () => {
    game = new PoTianYiJian();
    uiManager = new UIManager(game);
});