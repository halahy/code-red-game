// 游戏配置文件
const Settings = {
    // 窗口设置
    WINDOW_WIDTH: 1280,
    WINDOW_HEIGHT: 720,
    FPS: 60,
    TITLE: "赤焰行动 - Code Red",
    
    // 颜色定义
    BLACK: [0, 0, 0],
    WHITE: [255, 255, 255],
    GRAY: [128, 128, 128],
    DARK_GRAY: [64, 64, 64],
    LIGHT_GRAY: [200, 200, 200],
    
    // 场景颜色
    FLOOR_COLOR: [40, 45, 50],
    WALL_COLOR: [80, 85, 90],
    GRID_COLOR: [50, 55, 60],
    
    // 角色颜色
    PLAYER_COLOR: [255, 51, 51],
    PLAYER_VISOR_COLOR: [100, 200, 255],
    ENEMY_GRUNT_COLOR: [51, 170, 51],
    ENEMY_ASSAULT_COLOR: [51, 102, 255],
    ENEMY_HEAVY_COLOR: [255, 170, 0],
    ENEMY_ELITE_COLOR: [153, 51, 255],
    ENEMY_BOSS_COLOR: [34, 34, 34],
    
    // UI颜色
    HP_COLOR: [255, 68, 68],
    ARMOR_COLOR: [68, 136, 255],
    AMMO_COLOR: [255, 204, 0],
    
    // 场景设置
    ARENA_WIDTH: 1200,
    ARENA_HEIGHT: 650,
    ARENA_OFFSET_X: 40,
    ARENA_OFFSET_Y: 35,
    
    // 玩家属性
    PLAYER_RADIUS: 15,
    PLAYER_SPEED: 5,
    PLAYER_SPRINT_MULTIPLIER: 1.5,
    PLAYER_MAX_HP: 100,
    
    // 闪避系统
    DODGE_DISTANCE: 100,
    DODGE_DURATION: 0.2,
    DODGE_COOLDOWN: 1.0,
    DODGE_INVINCIBLE_TIME: 0.2,
    
    // 武器属性
    WEAPONS: {
        pistol: {
            name: '手枪',
            damage: 10,
            fire_rate: 0.25,
            magazine: -1,
            max_ammo: -1,
            reload_time: 0.8,
            bullet_speed: 15,
            spread: 0,
            color: [255, 255, 100],
            rarity: 'common',
        },
        smg: {
            name: '冲锋枪',
            damage: 12,
            fire_rate: 0.06,
            magazine: 30,
            max_ammo: 120,
            reload_time: 1.2,
            bullet_speed: 16,
            spread: 4,
            color: [100, 200, 255],
            rarity: 'uncommon',
        },
        shotgun: {
            name: '霰弹枪',
            damage: 15,
            pellets: 10,
            fire_rate: 0.8,
            magazine: 6,
            max_ammo: 24,
            reload_time: 2.0,
            bullet_speed: 12,
            spread: 25,
            color: [255, 100, 50],
            rarity: 'rare',
        },
        sniper: {
            name: '狙击枪',
            damage: 120,
            fire_rate: 1.5,
            magazine: 5,
            max_ammo: 20,
            reload_time: 2.5,
            bullet_speed: 30,
            spread: 0,
            color: [50, 255, 100],
            rarity: 'epic',
        },
        rocket: {
            name: '火箭筒',
            damage: 200,
            fire_rate: 2.0,
            magazine: 1,
            max_ammo: 4,
            reload_time: 3.0,
            bullet_speed: 10,
            spread: 0,
            explosive: true,
            explosion_radius: 100,
            color: [255, 50, 50],
            rarity: 'legendary',
        },
    },
    
    // 敌人属性
    ENEMIES: {
        grunt: {
            name: '基础杂兵',
            color: [51, 170, 51],
            radius: 12,
            hp: 25,
            speed: 2,
            damage: 10,
            fire_rate: 1.2,
            attack_range: 300,
            score: 10,
            coin: 10,
        },
        assault: {
            name: '突击兵',
            color: [51, 102, 255],
            radius: 12,
            hp: 40,
            speed: 3.5,
            damage: 8,
            fire_rate: 0.2,
            attack_range: 350,
            score: 25,
            coin: 25,
        },
        heavy: {
            name: '重装兵',
            color: [255, 170, 0],
            radius: 18,
            hp: 100,
            speed: 1.5,
            damage: 20,
            fire_rate: 0.8,
            attack_range: 250,
            has_shield: true,
            score: 50,
            coin: 50,
        },
        elite: {
            name: '精英',
            color: [153, 51, 255],
            radius: 14,
            hp: 150,
            speed: 3,
            damage: 15,
            fire_rate: 0.4,
            attack_range: 400,
            score: 100,
            coin: 100,
        },
    },
    
    // 波次设置
    WAVE_REST_TIME: 8,
    WAVES_PER_LEVEL: 5,
    
    // 子弹设置
    BULLET_RADIUS: 4,
    BULLET_COLOR: [255, 255, 100],
    ENEMY_BULLET_COLOR: [255, 100, 100],
};

