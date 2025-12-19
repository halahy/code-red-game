// 游戏主类
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.running = true;
        this.paused = false;
        this.state = 'playing';
        
        // 设置画布大小
        canvas.width = Settings.WINDOW_WIDTH;
        canvas.height = Settings.WINDOW_HEIGHT;
        
        // 创建玩家
        const playerX = Settings.ARENA_OFFSET_X + Settings.ARENA_WIDTH / 2;
        const playerY = Settings.ARENA_OFFSET_Y + Settings.ARENA_HEIGHT / 2;
        this.player = new Player(playerX, playerY);
        
        // 子弹管理器
        this.bulletManager = new BulletManager();
        
        // 敌人列表
        this.enemies = [];
        
        // 武器掉落物
        this.weaponPickups = [];
        
        // 存档系统
        this.saveSystem = new SaveSystem();
        
        // 关卡系统
        this.currentLevel = 1;
        this.currentWave = 1;
        this.waveTimer = 0;
        this.waveActive = true;
        this.waveDisplayTimer = 0;
        
        // 游戏数据
        this.score = 0;
        this.coins = 0;
        this.kills = 0;
        this.totalPlaytime = 0;
        
        // 武器通知
        this.weaponNotification = null;
        this.weaponNotificationTimer = 0;
        
        // 存档加载提示
        this.saveLoadedNotification = false;
        this.saveLoadedTimer = 3.0;
        
        // 输入状态
        this.keys = {
            w: false, s: false, a: false, d: false,
            shift: false, space: false, r: false, q: false,
            '1': false, '2': false, escape: false
        };
        
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseDown = false;
        
        // 加载存档
        this.loadSaveData();
        
        // 计算初始关卡
        this.currentLevel = Math.floor((this.currentWave - 1) / Settings.WAVES_PER_LEVEL) + 1;
    }
    
    loadSaveData() {
        const saveData = this.saveSystem.loadGame();
        if (saveData) {
            this.currentLevel = saveData.current_level || 1;
            this.currentWave = saveData.current_wave || 1;
            this.score = saveData.score || 0;
            this.coins = saveData.coins || 0;
            this.kills = saveData.kills || 0;
            this.totalPlaytime = saveData.total_playtime || 0;
            
            this.player.hp = Math.min(saveData.player_hp || Settings.PLAYER_MAX_HP, Settings.PLAYER_MAX_HP);
            
            // 恢复武器
            if (saveData.weapons && saveData.weapons.length > 0) {
                this.player.weapons = [null, null];
                saveData.weapons.forEach((weaponType, i) => {
                    if (weaponType && Settings.WEAPONS[weaponType]) {
                        this.player.weapons[i] = JSON.parse(JSON.stringify(Settings.WEAPONS[weaponType]));
                    }
                });
                
                const currentIndex = saveData.current_weapon_index || 0;
                if (this.player.weapons[currentIndex]) {
                    this.player.current_weapon_index = currentIndex;
                    this.player._changeWeapon();
                    this.player.current_ammo = saveData.current_ammo || this.player.current_ammo;
                    this.player.reserve_ammo = saveData.reserve_ammo || this.player.reserve_ammo;
                }
            }
            
            this.spawnWave();
            this.saveLoadedNotification = true;
            this.saveLoadedTimer = 3.0;
            return true;
        }
        return false;
    }
    
    saveGameData() {
        const weapons = [];
        this.player.weapons.forEach(weapon => {
            if (weapon) {
                for (const [type, data] of Object.entries(Settings.WEAPONS)) {
                    if (data.name === weapon.name) {
                        weapons.push(type);
                        break;
                    }
                }
            }
        });
        
        const gameData = {
            current_level: this.currentLevel,
            current_wave: this.currentWave,
            score: this.score,
            coins: this.coins,
            kills: this.kills,
            total_playtime: this.totalPlaytime,
            player_hp: this.player.hp,
            weapons: weapons,
            current_weapon_index: this.player.current_weapon_index,
            current_ammo: this.player.current_ammo,
            reserve_ammo: this.player.reserve_ammo,
        };
        
        this.saveSystem.saveGame(gameData);
    }
    
    spawnWave() {
        this.enemies = [];
        this.waveActive = true;
        this.waveDisplayTimer = 2.0;
        
        // 根据波次生成敌人
        const baseEnemies = 5 + this.currentWave * 2;
        const enemyTypes = ['grunt', 'assault', 'heavy', 'elite'];
        
        for (let i = 0; i < baseEnemies; i++) {
            let enemyType = 'grunt';
            const rand = Math.random();
            
            if (this.currentWave >= 3 && rand < 0.1) {
                enemyType = 'elite';
            } else if (this.currentWave >= 2 && rand < 0.2) {
                enemyType = 'heavy';
            } else if (this.currentWave >= 1 && rand < 0.4) {
                enemyType = 'assault';
            }
            
            // 在竞技场边缘随机生成
            const side = Math.floor(Math.random() * 4);
            let x, y;
            const arena = Settings;
            
            if (side === 0) { // 上
                x = arena.ARENA_OFFSET_X + Math.random() * arena.ARENA_WIDTH;
                y = arena.ARENA_OFFSET_Y;
            } else if (side === 1) { // 右
                x = arena.ARENA_OFFSET_X + arena.ARENA_WIDTH;
                y = arena.ARENA_OFFSET_Y + Math.random() * arena.ARENA_HEIGHT;
            } else if (side === 2) { // 下
                x = arena.ARENA_OFFSET_X + Math.random() * arena.ARENA_WIDTH;
                y = arena.ARENA_OFFSET_Y + arena.ARENA_HEIGHT;
            } else { // 左
                x = arena.ARENA_OFFSET_X;
                y = arena.ARENA_OFFSET_Y + Math.random() * arena.ARENA_HEIGHT;
            }
            
            this.enemies.push(new Enemy(x, y, enemyType));
        }
        
        // 第一波必定掉落SMG
        if (this.currentWave === 1) {
            const centerX = Settings.ARENA_OFFSET_X + Settings.ARENA_WIDTH / 2;
            const centerY = Settings.ARENA_OFFSET_Y + Settings.ARENA_HEIGHT / 2;
            this.weaponPickups.push(new WeaponPickup(centerX + 50, centerY, 'smg'));
        }
    }
    
    dropWeaponChance(x, y, enemyType) {
        if (this.currentWave === 1) return; // 第一波已经掉落
        
        const chance = 0.15; // 15%概率
        if (Math.random() < chance) {
            const weapons = ['smg', 'shotgun', 'sniper', 'rocket'];
            const weaponType = weapons[Math.floor(Math.random() * weapons.length)];
            this.weaponPickups.push(new WeaponPickup(x, y, weaponType));
        }
    }
    
    showWeaponNotification(weaponData) {
        this.weaponNotification = weaponData;
        this.weaponNotificationTimer = 3.0;
    }
    
    update(dt) {
        if (this.paused || this.state === 'game_over') return;
        
        // 更新玩家
        this.player.shooting = this.mouseDown;
        this.player.update(dt, this.keys, this.mouseX, this.mouseY, this.bulletManager);
        
        // 更新敌人
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            this.enemies[i].update(dt, this.player, this.bulletManager);
            
            if (this.enemies[i].hp <= 0) {
                this.dropWeaponChance(this.enemies[i].x, this.enemies[i].y, this.enemies[i].enemyType);
                this.score += this.enemies[i].score;
                this.coins += this.enemies[i].coin;
                this.kills++;
                this.enemies.splice(i, 1);
            }
        }
        
        // 更新武器掉落物
        for (let i = this.weaponPickups.length - 1; i >= 0; i--) {
            const result = this.weaponPickups[i].update(dt, this.player);
            if (result === true) {
                this.showWeaponNotification(this.weaponPickups[i].weaponData);
                this.weaponPickups.splice(i, 1);
            } else if (result === false) {
                this.weaponPickups.splice(i, 1);
            }
        }
        
        // 更新子弹
        this.bulletManager.update(dt);
        
        // 碰撞检测
        this.checkCollisions();
        
        // 检查波次完成
        if (this.enemies.length === 0 && this.waveActive) {
            this.waveActive = false;
            this.waveTimer = Settings.WAVE_REST_TIME;
        }
        
        // 波次休整倒计时
        if (!this.waveActive) {
            this.waveTimer -= dt;
            if (this.waveTimer <= 0) {
                this.currentWave++;
                this.currentLevel = Math.floor((this.currentWave - 1) / Settings.WAVES_PER_LEVEL) + 1;
                
                if ((this.currentWave - 1) % Settings.WAVES_PER_LEVEL === 0) {
                    this.saveGameData();
                }
                
                this.spawnWave();
            }
        }
        
        // 更新计时器
        if (this.weaponNotificationTimer > 0) this.weaponNotificationTimer -= dt;
        if (this.saveLoadedNotification && this.saveLoadedTimer > 0) {
            this.saveLoadedTimer -= dt;
            if (this.saveLoadedTimer <= 0) this.saveLoadedNotification = false;
        }
        if (this.waveDisplayTimer > 0) this.waveDisplayTimer -= dt;
        
        this.totalPlaytime += dt;
        
        // 检查游戏结束
        if (this.player.hp <= 0) {
            this.state = 'game_over';
            this.saveGameData();
        }
    }
    
    checkCollisions() {
        const bullets = this.bulletManager.getBullets();
        
        // 玩家子弹 vs 敌人
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            if (bullet.owner !== 'player') continue;
            
            for (const enemy of this.enemies) {
                if (Utils.circleCollision(bullet.x, bullet.y, bullet.radius,
                                         enemy.x, enemy.y, enemy.radius)) {
                    const fromAngle = Utils.angle(enemy.x, enemy.y, bullet.x, bullet.y);
                    enemy.takeDamage(bullet.damage, fromAngle);
                    bullet.active = false;
                    break;
                }
            }
        }
        
        // 敌人子弹 vs 玩家
        if (!this.player.invincible) {
            for (let i = bullets.length - 1; i >= 0; i--) {
                const bullet = bullets[i];
                if (bullet.owner !== 'enemy') continue;
                
                if (Utils.circleCollision(bullet.x, bullet.y, bullet.radius,
                                         this.player.x, this.player.y, this.player.radius)) {
                    this.player.takeDamage(bullet.damage);
                    bullet.active = false;
                }
            }
        }
    }
    
    render() {
        // 清屏
        this.drawBackground();
        
        // 绘制竞技场
        this.drawArena();
        
        // 绘制子弹
        this.bulletManager.render(this.ctx);
        
        // 绘制敌人
        for (const enemy of this.enemies) {
            enemy.render(this.ctx);
        }
        
        // 绘制武器掉落物
        for (const pickup of this.weaponPickups) {
            pickup.render(this.ctx);
        }
        
        // 绘制玩家
        this.player.render(this.ctx);
        
        // 更新HUD
        this.updateHUD();
    }
    
    drawBackground() {
        // 渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, Settings.WINDOW_HEIGHT);
        gradient.addColorStop(0, 'rgb(20, 25, 35)');
        gradient.addColorStop(1, 'rgb(35, 45, 60)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, Settings.WINDOW_WIDTH, Settings.WINDOW_HEIGHT);
        
        // 装饰光点
        this.ctx.fillStyle = 'rgba(100, 150, 200, 0.3)';
        for (let i = 0; i < 30; i++) {
            const x = (i * 137.5) % Settings.WINDOW_WIDTH;
            const y = (i * 97.3) % Settings.WINDOW_HEIGHT;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawArena() {
        const arena = Settings;
        
        // 竞技场背景
        this.ctx.fillStyle = 'rgba(30, 38, 50, 0.8)';
        this.ctx.fillRect(arena.ARENA_OFFSET_X, arena.ARENA_OFFSET_Y,
                         arena.ARENA_WIDTH, arena.ARENA_HEIGHT);
        
        // 网格
        const gridSize = 50;
        this.ctx.strokeStyle = 'rgba(50, 65, 85, 0.5)';
        this.ctx.lineWidth = 1;
        
        for (let x = arena.ARENA_OFFSET_X; x <= arena.ARENA_OFFSET_X + arena.ARENA_WIDTH; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, arena.ARENA_OFFSET_Y);
            this.ctx.lineTo(x, arena.ARENA_OFFSET_Y + arena.ARENA_HEIGHT);
            this.ctx.stroke();
        }
        
        for (let y = arena.ARENA_OFFSET_Y; y <= arena.ARENA_OFFSET_Y + arena.ARENA_HEIGHT; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(arena.ARENA_OFFSET_X, y);
            this.ctx.lineTo(arena.ARENA_OFFSET_X + arena.ARENA_WIDTH, y);
            this.ctx.stroke();
        }
        
        // 边框
        this.ctx.strokeStyle = 'rgba(100, 150, 200, 0.8)';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(arena.ARENA_OFFSET_X, arena.ARENA_OFFSET_Y,
                          arena.ARENA_WIDTH, arena.ARENA_HEIGHT);
    }
    
    updateHUD() {
        // HP条
        const hpPercent = this.player.hp / Settings.PLAYER_MAX_HP;
        const hpBar = document.getElementById('hp-bar');
        hpBar.style.width = (hpPercent * 180) + 'px';
        hpBar.style.backgroundColor = hpPercent > 0.6 ? '#64ff64' : 
                                     hpPercent > 0.3 ? '#ffc832' : '#ff4444';
        
        document.getElementById('hp-text').textContent = 
            `HP: ${Math.floor(this.player.hp)}/${Settings.PLAYER_MAX_HP}`;
        
        // 武器信息
        const weapon = this.player.current_weapon;
        const damageText = weapon.pellets ? 
            `${weapon.damage}×${weapon.pellets}` : weapon.damage;
        document.getElementById('weapon-name').textContent = 
            `${weapon.name} | 攻击: ${damageText}`;
        
        const ammoText = weapon.magazine === -1 ? '∞' : 
            `${this.player.current_ammo}/${this.player.reserve_ammo}`;
        document.getElementById('ammo-info').textContent = 
            `弹药: ${ammoText}${this.player.reloading ? ' [换弹中]' : ''}`;
        
        // 闪避冷却
        const dodgeText = this.player.dodge_cooldown > 0 ? 
            `闪避: ${this.player.dodge_cooldown.toFixed(1)}s` : '闪避: 就绪';
        document.getElementById('dodge-info').textContent = dodgeText;
        document.getElementById('dodge-info').style.color = 
            this.player.dodge_cooldown > 0 ? '#888' : '#64ff64';
        
        // 关卡和波次
        document.getElementById('level-info').textContent = `关卡: ${this.currentLevel}`;
        document.getElementById('wave-info').textContent = `波次: ${this.currentWave}`;
        document.getElementById('enemy-count').textContent = `敌人: ${this.enemies.length}`;
        
        // 分数
        document.getElementById('score').textContent = `分数: ${this.score}`;
        document.getElementById('coins').textContent = `金币: ${this.coins}`;
        document.getElementById('kills').textContent = `击杀: ${this.kills}`;
        
        // 武器通知
        if (this.weaponNotificationTimer > 0 && this.weaponNotification) {
            this.showWeaponNotificationUI();
        } else {
            this.hideWeaponNotificationUI();
        }
        
        // 存档加载提示
        if (this.saveLoadedNotification) {
            this.showSaveLoadedNotification();
        } else {
            this.hideSaveLoadedNotification();
        }
        
        // 游戏结束画面
        if (this.state === 'game_over') {
            document.getElementById('game-over-screen').classList.remove('hidden');
            document.getElementById('final-score').textContent = this.score;
            document.getElementById('final-kills').textContent = this.kills;
            document.getElementById('final-wave').textContent = this.currentWave;
        } else {
            document.getElementById('game-over-screen').classList.add('hidden');
        }
        
        // 暂停画面
        if (this.paused) {
            document.getElementById('pause-screen').classList.remove('hidden');
        } else {
            document.getElementById('pause-screen').classList.add('hidden');
        }
    }
    
    showWeaponNotificationUI() {
        // 这个功能可以通过动态创建DOM元素实现
        // 为了简化，我们暂时跳过
    }
    
    hideWeaponNotificationUI() {
        // 同上
    }
    
    showSaveLoadedNotification() {
        // 同上
    }
    
    hideSaveLoadedNotification() {
        // 同上
    }
}

