// 背包系统类
class Inventory {
    constructor(maxSlots = GAME_CONFIG.maxInventorySlots) {
        this.items = [];
        this.maxSlots = maxSlots;
        this.gold = 0;
    }

    // 添加物品
    addItem(item, quantity = 1) {
        // 检查是否为可叠加物品
        if (item.stackable !== false) {
            const existingItem = this.items.find(invItem => 
                invItem.name === item.name && invItem.type === item.type
            );
            
            if (existingItem) {
                existingItem.quantity = (existingItem.quantity || 1) + quantity;
                return {
                    success: true,
                    message: `获得了 ${item.name} x${quantity}`
                };
            }
        }

        // 检查背包空间
        if (this.items.length >= this.maxSlots) {
            return {
                success: false,
                message: '背包已满！'
            };
        }

        // 添加新物品
        const newItem = {
            ...item,
            quantity: quantity,
            addedAt: Date.now()
        };
        
        this.items.push(newItem);
        
        return {
            success: true,
            message: `获得了 ${item.name}${quantity > 1 ? ` x${quantity}` : ''}`
        };
    }

    // 移除物品
    removeItem(itemIndex, quantity = 1) {
        if (itemIndex < 0 || itemIndex >= this.items.length) {
            return {
                success: false,
                message: '无效的物品索引'
            };
        }

        const item = this.items[itemIndex];
        const currentQuantity = item.quantity || 1;

        if (quantity >= currentQuantity) {
            // 移除整个物品
            const removedItem = this.items.splice(itemIndex, 1)[0];
            return {
                success: true,
                item: removedItem,
                message: `移除了 ${removedItem.name}`
            };
        } else {
            // 减少数量
            item.quantity = currentQuantity - quantity;
            return {
                success: true,
                item: { ...item, quantity: quantity },
                message: `移除了 ${item.name} x${quantity}`
            };
        }
    }

    // 使用物品
    useItem(itemIndex, character, target = null) {
        if (itemIndex < 0 || itemIndex >= this.items.length) {
            return {
                success: false,
                message: '无效的物品索引'
            };
        }

        const item = this.items[itemIndex];
        
        // 检查物品类型
        if (item.type === 'consumables' || item.effect) {
            return this.useConsumable(itemIndex, character, target);
        } else if (item.type === 'weapon' || item.type === 'armor') {
            return this.equipItem(itemIndex, character);
        } else {
            return {
                success: false,
                message: '该物品不能使用'
            };
        }
    }

    // 使用消耗品
    useConsumable(itemIndex, character, target = null) {
        const item = this.items[itemIndex];
        if (!item.effect) {
            return {
                success: false,
                message: '该物品没有效果'
            };
        }

        const actualTarget = target || character;
        let result = { success: true, message: `使用了 ${item.name}！` };

        // 应用效果
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

            case 'buff':
                actualTarget.addBuff(item.id || 'temp_buff', item.effect);
                result.message += ` 获得了临时强化效果！`;
                break;

            default:
                result.message += ' 产生了神秘的效果！';
        }

        // 移除使用的物品
        this.removeItem(itemIndex, 1);

        return result;
    }

    // 装备物品
    equipItem(itemIndex, character) {
        const item = this.items[itemIndex];
        
        if (item.type !== 'weapon' && item.type !== 'armor') {
            return {
                success: false,
                message: '该物品不能装备'
            };
        }

        // 检查等级要求
        if (item.level && character.level < item.level) {
            return {
                success: false,
                message: `需要等级 ${item.level} 才能装备该物品`
            };
        }

        // 装备物品
        const equipResult = character.equipItem(item);
        if (!equipResult.success) {
            return equipResult;
        }

        // 从背包中移除物品
        this.removeItem(itemIndex, 1);

        return {
            success: true,
            message: equipResult.message
        };
    }

    // 卸下装备
    unequipItem(character, slot) {
        const unequipResult = character.unequipItem(slot);
        if (!unequipResult.success) {
            return unequipResult;
        }

        // 将装备放回背包
        const addResult = this.addItem(unequipResult.item);
        if (!addResult.success) {
            // 背包满了，重新装备
            character.equipItem(unequipResult.item);
            return {
                success: false,
                message: '背包已满，无法卸下装备'
            };
        }

        return {
            success: true,
            message: unequipResult.message
        };
    }

    // 出售物品
    sellItem(itemIndex, quantity = 1) {
        if (itemIndex < 0 || itemIndex >= this.items.length) {
            return {
                success: false,
                message: '无效的物品索引'
            };
        }

        const item = this.items[itemIndex];
        const sellPrice = this.getItemSellPrice(item);
        const totalPrice = sellPrice * quantity;

        const removeResult = this.removeItem(itemIndex, quantity);
        if (!removeResult.success) {
            return removeResult;
        }

        this.gold += totalPrice;

        return {
            success: true,
            message: `出售了 ${item.name}${quantity > 1 ? ` x${quantity}` : ''}，获得了 ${totalPrice} 金币`,
            gold: totalPrice
        };
    }

    // 获取物品出售价格
    getItemSellPrice(item) {
        const basePrice = item.price || 1;
        // 出售价格为购买价格的一半
        return Math.floor(basePrice * 0.5);
    }

    // 购买物品
    buyItem(item, quantity = 1) {
        const totalPrice = (item.price || 0) * quantity;
        
        if (this.gold < totalPrice) {
            return {
                success: false,
                message: '金币不足！'
            };
        }

        const addResult = this.addItem(item, quantity);
        if (!addResult.success) {
            return addResult;
        }

        this.gold -= totalPrice;

        return {
            success: true,
            message: `购买了 ${item.name}${quantity > 1 ? ` x${quantity}` : ''}，花费了 ${totalPrice} 金币`
        };
    }

    // 整理背包
    sortInventory() {
        this.items.sort((a, b) => {
            // 按类型排序
            const typeOrder = { 'weapon': 0, 'armor': 1, 'consumables': 2, 'materials': 3 };
            const typeA = typeOrder[a.type] || 999;
            const typeB = typeOrder[b.type] || 999;
            
            if (typeA !== typeB) {
                return typeA - typeB;
            }
            
            // 同类型按名称排序
            return a.name.localeCompare(b.name);
        });

        return {
            success: true,
            message: '背包已整理'
        };
    }

    // 获取指定类型的物品
    getItemsByType(type) {
        return this.items.filter(item => item.type === type);
    }

    // 查找物品
    findItem(predicate) {
        return this.items.find(predicate);
    }

    // 查找物品索引
    findItemIndex(predicate) {
        return this.items.findIndex(predicate);
    }

    // 获取背包信息
    getInventoryInfo() {
        return {
            items: this.items,
            usedSlots: this.items.length,
            maxSlots: this.maxSlots,
            gold: this.gold,
            isEmpty: this.items.length === 0,
            isFull: this.items.length >= this.maxSlots
        };
    }

    // 清空背包
    clear() {
        this.items = [];
        return {
            success: true,
            message: '背包已清空'
        };
    }

    // 扩展背包
    expandInventory(additionalSlots) {
        this.maxSlots += additionalSlots;
        return {
            success: true,
            message: `背包容量增加了 ${additionalSlots} 格，当前容量：${this.maxSlots}`
        };
    }

    // 检查是否有足够的物品
    hasItem(itemName, quantity = 1) {
        const item = this.items.find(item => item.name === itemName);
        return item && (item.quantity || 1) >= quantity;
    }

    // 获取物品数量
    getItemQuantity(itemName) {
        const item = this.items.find(item => item.name === itemName);
        return item ? (item.quantity || 1) : 0;
    }

    // 获取背包价值
    getTotalValue() {
        return this.items.reduce((total, item) => {
            const itemValue = (item.price || 0) * (item.quantity || 1);
            return total + itemValue;
        }, 0) + this.gold;
    }

    // 导出背包数据
    export() {
        return {
            items: this.items,
            maxSlots: this.maxSlots,
            gold: this.gold
        };
    }

    // 导入背包数据
    import(data) {
        this.items = data.items || [];
        this.maxSlots = data.maxSlots || GAME_CONFIG.maxInventorySlots;
        this.gold = data.gold || 0;
        
        return {
            success: true,
            message: '背包数据已导入'
        };
    }
}

// 商店系统类
class Shop {
    constructor(shopData) {
        this.id = shopData.id;
        this.name = shopData.name;
        this.items = shopData.items || [];
        this.refreshRate = shopData.refreshRate || 24 * 60 * 60 * 1000; // 24小时
        this.lastRefresh = shopData.lastRefresh || Date.now();
        this.buybackMultiplier = shopData.buybackMultiplier || 1.5;
    }

    // 获取商店物品列表
    getShopItems() {
        // 检查是否需要刷新
        if (Date.now() - this.lastRefresh > this.refreshRate) {
            this.refreshShop();
        }

        return this.items.map(item => ({
            ...item,
            buyPrice: item.price,
            sellPrice: Math.floor(item.price * 0.5)
        }));
    }

    // 刷新商店
    refreshShop() {
        // 这里可以实现商店物品的随机刷新逻辑
        this.lastRefresh = Date.now();
        
        return {
            success: true,
            message: '商店库存已刷新'
        };
    }

    // 从商店购买物品
    buyFromShop(inventory, itemId, quantity = 1) {
        const shopItem = this.items.find(item => item.id === itemId);
        if (!shopItem) {
            return {
                success: false,
                message: '商店没有该物品'
            };
        }

        return inventory.buyItem(shopItem, quantity);
    }

    // 向商店出售物品
    sellToShop(inventory, itemIndex, quantity = 1) {
        return inventory.sellItem(itemIndex, quantity);
    }
}