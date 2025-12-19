// 存档系统（使用localStorage）
class SaveSystem {
    constructor() {
        this.saveKey = 'codeRed_save';
    }
    
    saveGame(gameData) {
        try {
            localStorage.setItem(this.saveKey, JSON.stringify(gameData));
            return true;
        } catch (e) {
            console.error('保存游戏失败:', e);
            return false;
        }
    }
    
    loadGame() {
        try {
            const data = localStorage.getItem(this.saveKey);
            if (data) {
                return JSON.parse(data);
            }
            return null;
        } catch (e) {
            console.error('加载游戏失败:', e);
            return null;
        }
    }
    
    clearSave() {
        try {
            localStorage.removeItem(this.saveKey);
            return true;
        } catch (e) {
            console.error('清除存档失败:', e);
            return false;
        }
    }
    
    hasSave() {
        return localStorage.getItem(this.saveKey) !== null;
    }
}

