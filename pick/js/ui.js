// UI管理系统
class UIManager {
    constructor(game) {
        this.game = game;
        this.currentTab = 'adventure';
        this.modalStack = [];
        this.notifications = [];
        this.setupEventListeners();
    }

    // 设置事件监听器
    setupEventListeners() {
        // 导航按钮事件
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.getAttribute('onclick')?.match(/switchTab\('(.+?)'\)/)?.[1];
                if (tab) {
                    this.switchTab(tab);
                }
            });
        });

        // 模态框关闭事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });

        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
    }

    // 切换标签页
    switchTab(tabName) {
        // 更新导航按钮状态
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        this.currentTab = tabName;

        // 根据标签页显示不同内容
        switch (tabName) {
            case 'adventure':
                this.showAdventureTab();
                break;
            case 'battle':
                this.showBattleTab();
                break;
            case 'inventory':
                this.showInventoryTab();
                break;
            case 'character':
                this.showCharacterTab();
                break;
            case 'more':
                this.showMoreTab();
                break;
        }
    }

    // 显示冒险标签页
    showAdventureTab() {
        const gameText = document.getElementById('game-text');
        const choiceButtons = document.getElementById('choice-buttons');
        
        // 显示当前位置信息
        if (this.game.gameState.currentLocation) {
            this.game.showLocationDescription();
        }
    }

    // 显示战斗标签页
    showBattleTab() {
        if (this.game.gameState.battle) {
            this.game.showBattleScreen();
        } else {
            this.showMessage('当前没有进行中的战斗');
        }
    }

    // 显示背包标签页
    showInventoryTab() {
        this.openInventoryModal();
    }

    // 显示角色标签页
    showCharacterTab() {
        this.openCharacterModal();
    }

    // 显示更多标签页
    showMoreTab() {
        this.openMoreModal();
    }

    // 打开背包模态框
    openInventoryModal() {
        if (!this.game.gameState.player) {
            this.showMessage('请先创建角色');
            return;
        }

        const inventory = this.game.gameState.inventory;
        const player = this.game.gameState.player;

        let content = `
            <div class="inventory-container">
                <div class="inventory-header">
                    <h3>背包 (${inventory.length}/${GAME_CONFIG.maxInventorySlots})</h3>
                    <span class="gold-display">💰 ${player.gold} 金币</span>
                </div>
                <div class="inventory-grid">
        `;

        // 显示物品
        for (let i = 0; i < GAME_CONFIG.maxInventorySlots; i++) {
            const item = inventory[i];
            if (item) {
                content += `
                    <div class="inventory-slot filled" onclick="useInventoryItem(${i})">
                        <div class="item-icon">${this.getItemIcon(item)}</div>
                        <div class="item-name">${item.name}</div>
                        ${item.quantity > 1 ? `<div class="item-count">${item.quantity}</div>` : ''}
                    </div>
                `;
            } else {
                content += '<div class="inventory-slot empty"></div>';
            }
        }

        content += `
                </div>
                <div class="inventory-actions">
                    <button class="btn-secondary" onclick="sortInventory()">整理背包</button>
                </div>
            </div>
        `;

        this.openModal('背包', content);
    }

    // 打开角色模态框
    openCharacterModal() {
        if (!this.game.gameState.player) {
            this.showMessage('请先创建角色');
            return;
        }

        const player = this.game.gameState.player;
        const info = player.getInfo();

        const content = `
            <div class="character-container">
                <div class="character-header">
                    <h3>${info.name}</h3>
                    <span class="character-type">${info.type}</span>
                </div>
                
                <div class="character-stats">
                    <div class="stat-row">
                        <span class="stat-name">等级:</span>
                        <span class="stat-value">${info.level}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-name">经验:</span>
                        <span class="stat-value">${info.exp}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-name">生命值:</span>
                        <span class="stat-value">${info.hp}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-name">内力值:</span>
                        <span class="stat-value">${info.mp}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-name">攻击力:</span>
                        <span class="stat-value">${info.attack}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-name">防御力:</span>
                        <span class="stat-value">${info.defense}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-name">速度:</span>
                        <span class="stat-value">${info.speed}</span>
                    </div>
                </div>

                <div class="character-equipment">
                    <h4>装备</h4>
                    <div class="equipment-grid">
                        <div class="equipment-slot">
                            <span>武器:</span>
                            <span>${player.equipment.weapon?.name || '无'}</span>
                        </div>
                        <div class="equipment-slot">
                            <span>头部:</span>
                            <span>${player.equipment.head?.name || '无'}</span>
                        </div>
                        <div class="equipment-slot">
                            <span>身体:</span>
                            <span>${player.equipment.body?.name || '无'}</span>
                        </div>
                        <div class="equipment-slot">
                            <span>饰品:</span>
                            <span>${player.equipment.accessory?.name || '无'}</span>
                        </div>
                    </div>
                </div>

                <div class="character-skills">
                    <h4>技能</h4>
                    <div class="skill-list">
                        ${info.skills.map(skillId => {
                            const skill = SKILLS[skillId];
                            return skill ? `
                                <div class="skill-item">
                                    <span class="skill-name">${skill.name}</span>
                                    <span class="skill-cost">消耗: ${skill.cost} MP</span>
                                    <div class="skill-desc">${skill.description}</div>
                                </div>
                            ` : '';
                        }).join('')}
                    </div>
                </div>
            </div>
        `;

        this.openModal('角色信息', content);
    }

    // 打开更多功能模态框
    openMoreModal() {
        const content = `
            <div class="more-container">
                <div class="more-section">
                    <h4>游戏功能</h4>
                    <button class="menu-btn" onclick="showSettings()">游戏设置</button>
                    <button class="menu-btn" onclick="saveGame()">保存游戏</button>
                    <button class="menu-btn" onclick="loadGame()">加载游戏</button>
                    <button class="menu-btn" onclick="showHelp()">游戏帮助</button>
                </div>
                
                <div class="more-section">
                    <h4>游戏信息</h4>
                    <button class="menu-btn" onclick="showGameStats()">游戏统计</button>
                    <button class="menu-btn" onclick="showAbout()">关于游戏</button>
                </div>

                <div class="more-section">
                    <h4>快速操作</h4>
                    <button class="menu-btn" onclick="quickRest()">快速休息</button>
                    <button class="menu-btn" onclick="returnToVillage()">返回村庄</button>
                </div>
            </div>
        `;

        this.openModal('更多功能', content);
    }

    // 打开模态框
    openModal(title, content) {
        const modal = document.getElementById('modal-overlay');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');

        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        modal.classList.remove('hidden');

        this.modalStack.push({ title, content });
    }

    // 关闭模态框
    closeModal() {
        const modal = document.getElementById('modal-overlay');
        modal.classList.add('hidden');
        this.modalStack.pop();
    }

    // 显示消息
    showMessage(message, type = 'info', duration = 3000) {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: Date.now()
        };

        this.notifications.push(notification);
        this.displayNotification(notification);

        // 自动移除通知
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, duration);
    }

    // 显示通知
    displayNotification(notification) {
        // 创建通知元素
        const notificationEl = document.createElement('div');
        notificationEl.className = `notification notification-${notification.type}`;
        notificationEl.id = `notification-${notification.id}`;
        notificationEl.innerHTML = `
            <span class="notification-message">${notification.message}</span>
            <button class="notification-close" onclick="removeNotification(${notification.id})">&times;</button>
        `;

        // 添加到页面
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        container.appendChild(notificationEl);

        // 添加动画
        setTimeout(() => {
            notificationEl.classList.add('show');
        }, 10);
    }

    // 移除通知
    removeNotification(notificationId) {
        const notificationEl = document.getElementById(`notification-${notificationId}`);
        if (notificationEl) {
            notificationEl.classList.remove('show');
            setTimeout(() => {
                notificationEl.remove();
            }, 300);
        }

        this.notifications = this.notifications.filter(n => n.id !== notificationId);
    }

    // 获取物品图标
    getItemIcon(item) {
        const iconMap = {
            'weapon': '⚔️',
            'armor': '🛡️',
            'consumables': '🧪',
            'materials': '💎'
        };

        return iconMap[item.type] || '📦';
    }

    // 处理键盘按键
    handleKeyPress(e) {
        // 阻止在输入框中的处理
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (e.key) {
            case 'Escape':
                if (this.modalStack.length > 0) {
                    this.closeModal();
                }
                break;
            case '1':
                this.switchTab('adventure');
                break;
            case '2':
                this.switchTab('battle');
                break;
            case '3':
                this.switchTab('inventory');
                break;
            case '4':
                this.switchTab('character');
                break;
            case '5':
                this.switchTab('more');
                break;
        }
    }

    // 更新游戏文本
    updateGameText(text) {
        const gameText = document.getElementById('game-text');
        if (gameText) {
            gameText.innerHTML = text;
            
            // 自动滚动到底部
            gameText.scrollTop = gameText.scrollHeight;
        }
    }

    // 添加选择按钮
    addChoiceButton(text, callback, className = 'choice-btn') {
        const choiceButtons = document.getElementById('choice-buttons');
        if (choiceButtons) {
            const button = document.createElement('button');
            button.className = className;
            button.textContent = text;
            button.addEventListener('click', callback);
            choiceButtons.appendChild(button);
        }
    }

    // 清空选择按钮
    clearChoiceButtons() {
        const choiceButtons = document.getElementById('choice-buttons');
        if (choiceButtons) {
            choiceButtons.innerHTML = '';
        }
    }

    // 显示加载状态
    showLoading(message = '加载中...') {
        const loadingEl = document.createElement('div');
        loadingEl.className = 'loading-overlay';
        loadingEl.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(loadingEl);
    }

    // 隐藏加载状态
    hideLoading() {
        const loadingEl = document.querySelector('.loading-overlay');
        if (loadingEl) {
            loadingEl.remove();
        }
    }

    // 确认对话框
    showConfirm(message, onConfirm, onCancel) {
        const content = `
            <div class="confirm-dialog">
                <p>${message}</p>
                <div class="confirm-actions">
                    <button class="btn-primary" onclick="confirmAction(true)">确认</button>
                    <button class="btn-secondary" onclick="confirmAction(false)">取消</button>
                </div>
            </div>
        `;

        this.openModal('确认', content);

        // 临时保存回调函数
        window.confirmAction = (confirmed) => {
            this.closeModal();
            if (confirmed && onConfirm) {
                onConfirm();
            } else if (!confirmed && onCancel) {
                onCancel();
            }
            delete window.confirmAction;
        };
    }

    // 输入对话框
    showPrompt(message, defaultValue = '', onConfirm, onCancel) {
        const content = `
            <div class="prompt-dialog">
                <p>${message}</p>
                <input type="text" id="prompt-input" value="${defaultValue}" placeholder="请输入...">
                <div class="prompt-actions">
                    <button class="btn-primary" onclick="promptAction(true)">确认</button>
                    <button class="btn-secondary" onclick="promptAction(false)">取消</button>
                </div>
            </div>
        `;

        this.openModal('输入', content);

        // 聚焦输入框
        setTimeout(() => {
            const input = document.getElementById('prompt-input');
            if (input) {
                input.focus();
                input.select();
            }
        }, 100);

        // 临时保存回调函数
        window.promptAction = (confirmed) => {
            const input = document.getElementById('prompt-input');
            const value = input ? input.value : '';
            
            this.closeModal();
            if (confirmed && onConfirm) {
                onConfirm(value);
            } else if (!confirmed && onCancel) {
                onCancel();
            }
            delete window.promptAction;
        };
    }
}

// 全局UI实例
let uiManager = null;