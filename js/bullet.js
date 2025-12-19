// 子弹类
class Bullet {
    constructor(x, y, angle, speed, damage, owner, color = null) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.damage = damage;
        this.owner = owner; // 'player' 或 'enemy'
        this.radius = Settings.BULLET_RADIUS;
        this.color = color || (owner === 'player' ? Settings.BULLET_COLOR : Settings.ENEMY_BULLET_COLOR);
        this.active = true;
    }
    
    update(dt) {
        if (!this.active) return;
        
        // 移动（dt是秒，乘以60转换为帧率）
        const frameRate = 60;
        this.x += Math.cos(this.angle) * this.speed * dt * frameRate;
        this.y += Math.sin(this.angle) * this.speed * dt * frameRate;
        
        // 检查是否超出竞技场
        const arena = Settings;
        if (this.x < arena.ARENA_OFFSET_X || this.x > arena.ARENA_OFFSET_X + arena.ARENA_WIDTH ||
            this.y < arena.ARENA_OFFSET_Y || this.y > arena.ARENA_OFFSET_Y + arena.ARENA_HEIGHT) {
            this.active = false;
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        // 绘制子弹（带发光效果）
        ctx.save();
        
        // 发光效果
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2);
        glow.addColorStop(0, Utils.rgbaToString(this.color, 1));
        glow.addColorStop(0.5, Utils.rgbaToString(this.color, 0.5));
        glow.addColorStop(1, Utils.rgbaToString(this.color, 0));
        
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 子弹主体
        ctx.fillStyle = Utils.rgbToString(this.color);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// 子弹管理器
class BulletManager {
    constructor() {
        this.bullets = [];
    }
    
    add(x, y, angle, speed, damage, owner, color = null) {
        this.bullets.push(new Bullet(x, y, angle, speed, damage, owner, color));
    }
    
    update(dt) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update(dt);
            if (!this.bullets[i].active) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    render(ctx) {
        for (const bullet of this.bullets) {
            bullet.render(ctx);
        }
    }
    
    getBullets() {
        return this.bullets.filter(b => b.active);
    }
}

