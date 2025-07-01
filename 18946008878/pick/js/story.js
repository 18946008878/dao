// 故事系统类
class StorySystem {
    constructor() {
        this.currentStory = null;
        this.completedStories = new Set();
        this.storyProgress = {};
        this.questLog = [];
        this.activeQuests = new Map();
    }

    // 开始故事
    startStory(storyId) {
        if (!STORY_DATA[storyId]) {
            return {
                success: false,
                message: '未知的故事'
            };
        }

        this.currentStory = storyId;
        return {
            success: true,
            story: STORY_DATA[storyId],
            message: '故事开始了'
        };
    }

    // 完成故事
    completeStory(storyId) {
        this.completedStories.add(storyId);
        this.currentStory = null;
        
        return {
            success: true,
            message: '故事完成了'
        };
    }

    // 检查故事是否完成
    isStoryCompleted(storyId) {
        return this.completedStories.has(storyId);
    }

    // 创建任务
    createQuest(questData) {
        const quest = new Quest(questData);
        this.questLog.push(quest);
        this.activeQuests.set(quest.id, quest);
        
        return {
            success: true,
            message: `接受了任务：${quest.title}`,
            quest: quest
        };
    }

    // 更新任务进度
    updateQuestProgress(questId, progressType, value = 1) {
        const quest = this.activeQuests.get(questId);
        if (!quest) {
            return {
                success: false,
                message: '任务不存在'
            };
        }

        return quest.updateProgress(progressType, value);
    }

    // 完成任务
    completeQuest(questId) {
        const quest = this.activeQuests.get(questId);
        if (!quest) {
            return {
                success: false,
                message: '任务不存在'
            };
        }

        if (!quest.isCompleted()) {
            return {
                success: false,
                message: '任务条件尚未满足'
            };
        }

        quest.complete();
        this.activeQuests.delete(questId);
        
        return {
            success: true,
            message: `完成了任务：${quest.title}`,
            rewards: quest.rewards
        };
    }

    // 获取活跃任务
    getActiveQuests() {
        return Array.from(this.activeQuests.values());
    }

    // 获取任务日志
    getQuestLog() {
        return this.questLog;
    }

    // 生成随机对话
    generateRandomDialogue(npcType = 'generic') {
        const dialogues = {
            merchant: [
                "欢迎光临！我这里有最好的装备和道具！",
                "你看起来像是个有经验的冒险者，需要什么装备吗？",
                "听说最近有很多强盗出没，小心点啊！",
                "破天圣物？那可是传说中的宝物，价值连城啊！"
            ],
            guard: [
                "这里是安全区域，怪物不敢靠近。",
                "最近外面不太平，出去的时候小心点。",
                "你有听说过破天一剑的传说吗？",
                "作为守卫，保护城镇安全是我的职责。"
            ],
            villager: [
                "你好！欢迎来到我们的村庄。",
                "最近天空变得越来越暗，真让人担心。",
                "听老人们说，只有破天圣物才能拯救我们的世界。",
                "你看起来很强，一定能完成伟大的使命！"
            ],
            elder: [
                "年轻人，时间不多了，黑暗正在蔓延。",
                "破天剑、破天牌、破天秘笈，这三件圣物是我们唯一的希望。",
                "紫微星的光芒正在消失，我们必须找到那些圣物。",
                "记住，真正的力量来自内心的信念。"
            ]
        };

        const typeDialogues = dialogues[npcType] || dialogues.villager;
        return typeDialogues[Math.floor(Math.random() * typeDialogues.length)];
    }

    // 处理对话选择
    handleDialogueChoice(choiceId, context = {}) {
        // 根据选择执行不同的动作
        switch (choiceId) {
            case 'accept_quest':
                return this.acceptQuestFromDialogue(context.questId);
            case 'buy_item':
                return { action: 'shop', message: '商人打开了他的商店。' };
            case 'get_info':
                return { action: 'info', message: this.getRandomInfo() };
            case 'challenge':
                return { action: 'battle', message: '对方准备与你切磋！' };
            default:
                return { action: 'continue', message: '对话继续...' };
        }
    }

    // 从对话中接受任务
    acceptQuestFromDialogue(questId) {
        // 这里可以根据questId创建具体的任务
        const questTemplates = {
            'collect_materials': {
                id: 'collect_materials',
                title: '收集材料',
                description: '收集10个破天铜牌',
                type: 'collect',
                target: { item: '破天铜牌', quantity: 10 },
                rewards: { exp: 100, gold: 50 }
            },
            'defeat_monsters': {
                id: 'defeat_monsters',
                title: '清理怪物',
                description: '击败5只史莱姆',
                type: 'kill',
                target: { monster: 'slime', quantity: 5 },
                rewards: { exp: 150, gold: 30 }
            }
        };

        const questTemplate = questTemplates[questId];
        if (questTemplate) {
            return this.createQuest(questTemplate);
        }

        return {
            success: false,
            message: '无效的任务'
        };
    }

    // 获取随机信息
    getRandomInfo() {
        const infos = [
            "传说破天剑被封印在遥远的星球深处。",
            "破天牌据说拥有控制时空的力量。",
            "破天秘笈记录着最强的武功心法。",
            "紫微星的光芒是维持宇宙平衡的关键。",
            "逆天之神正在积蓄力量，准备吞噬一切。",
            "只有集齐三件圣物，才能打开通往神界的门。"
        ];

        return infos[Math.floor(Math.random() * infos.length)];
    }

    // 导出故事数据
    export() {
        return {
            currentStory: this.currentStory,
            completedStories: Array.from(this.completedStories),
            storyProgress: this.storyProgress,
            questLog: this.questLog.map(quest => quest.export()),
            activeQuests: Array.from(this.activeQuests.entries()).map(([id, quest]) => [id, quest.export()])
        };
    }

    // 导入故事数据
    import(data) {
        this.currentStory = data.currentStory || null;
        this.completedStories = new Set(data.completedStories || []);
        this.storyProgress = data.storyProgress || {};
        
        // 重建任务
        this.questLog = (data.questLog || []).map(questData => Quest.fromExport(questData));
        this.activeQuests = new Map();
        
        if (data.activeQuests) {
            data.activeQuests.forEach(([id, questData]) => {
                this.activeQuests.set(id, Quest.fromExport(questData));
            });
        }
    }
}

// 任务类
class Quest {
    constructor(data) {
        this.id = data.id || Date.now().toString();
        this.title = data.title || '无标题任务';
        this.description = data.description || '';
        this.type = data.type || 'generic'; // collect, kill, talk, reach
        this.target = data.target || {};
        this.progress = {};
        this.rewards = data.rewards || {};
        this.status = 'active'; // active, completed, failed
        this.createdAt = Date.now();
        this.completedAt = null;
    }

    // 更新进度
    updateProgress(progressType, value = 1) {
        if (this.status !== 'active') {
            return {
                success: false,
                message: '任务已完成或失败'
            };
        }

        this.progress[progressType] = (this.progress[progressType] || 0) + value;
        
        // 检查是否完成
        if (this.checkCompletion()) {
            return {
                success: true,
                message: `任务进度更新！任务已完成：${this.title}`,
                completed: true
            };
        }

        return {
            success: true,
            message: `任务进度更新！`,
            completed: false
        };
    }

    // 检查完成条件
    checkCompletion() {
        switch (this.type) {
            case 'collect':
                return (this.progress.collected || 0) >= this.target.quantity;
            case 'kill':
                return (this.progress.killed || 0) >= this.target.quantity;
            case 'talk':
                return this.progress.talked === true;
            case 'reach':
                return this.progress.reached === true;
            default:
                return false;
        }
    }

    // 检查是否完成
    isCompleted() {
        return this.status === 'completed' || this.checkCompletion();
    }

    // 完成任务
    complete() {
        this.status = 'completed';
        this.completedAt = Date.now();
    }

    // 失败任务
    fail() {
        this.status = 'failed';
    }

    // 获取进度描述
    getProgressDescription() {
        switch (this.type) {
            case 'collect':
                const collected = this.progress.collected || 0;
                return `${collected}/${this.target.quantity} ${this.target.item}`;
            case 'kill':
                const killed = this.progress.killed || 0;
                return `${killed}/${this.target.quantity} ${this.target.monster}`;
            case 'talk':
                return this.progress.talked ? '已完成' : '进行中';
            case 'reach':
                return this.progress.reached ? '已到达' : '前往中';
            default:
                return '进行中';
        }
    }

    // 导出任务数据
    export() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            type: this.type,
            target: this.target,
            progress: this.progress,
            rewards: this.rewards,
            status: this.status,
            createdAt: this.createdAt,
            completedAt: this.completedAt
        };
    }

    // 从导出数据创建任务
    static fromExport(data) {
        const quest = new Quest(data);
        quest.progress = data.progress || {};
        quest.status = data.status || 'active';
        quest.createdAt = data.createdAt || Date.now();
        quest.completedAt = data.completedAt || null;
        return quest;
    }
}

// 对话系统类
class DialogueSystem {
    constructor() {
        this.currentDialogue = null;
        this.dialogueHistory = [];
    }

    // 开始对话
    startDialogue(npcData) {
        this.currentDialogue = {
            npc: npcData,
            startTime: Date.now(),
            messages: []
        };

        return {
            success: true,
            message: this.generateGreeting(npcData)
        };
    }

    // 生成问候语
    generateGreeting(npcData) {
        const greetings = [
            "你好，陌生人！",
            "欢迎来到这里！",
            "有什么需要帮助的吗？",
            "你看起来像个冒险者。"
        ];

        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // 添加对话消息
    addMessage(speaker, message) {
        if (this.currentDialogue) {
            this.currentDialogue.messages.push({
                speaker,
                message,
                timestamp: Date.now()
            });
        }
    }

    // 结束对话
    endDialogue() {
        if (this.currentDialogue) {
            this.currentDialogue.endTime = Date.now();
            this.dialogueHistory.push(this.currentDialogue);
            this.currentDialogue = null;
        }
    }

    // 获取当前对话
    getCurrentDialogue() {
        return this.currentDialogue;
    }

    // 获取对话历史
    getDialogueHistory() {
        return this.dialogueHistory;
    }
}