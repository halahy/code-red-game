// 敌人类
class Enemy {
    constructor(x, y, enemyType = 'grunt') {
        this.x = x;
        this.y = y;
        this.enemyType = enemyType;
        
        // 从配置加载属性
        const config = Settings.ENEMIES[enemyType] || Settings.ENEMIES.grunt;
        
        this.color = config.color;
        this.radius = config.radius;
        this.hp = config.hp;
        this.max_hp = config.hp;
        this.speed = config.speed;
        this.damage = config.damage;
        this.fire_rate = config.fire_rate;
        this.attack_range = config.attack_range;
        this.score = config.score;
        this.coin = config.coin;
        this.has_shield = config.has_shield || false;
        
        // 朝向角度
        this.angle = 0;
        
        // AI状态
        this.state = 'chase';
        this.target = null;
        this.fire_timer = Math.random() * this.fire_rate;
        
        // 移动相关
        this.wander_angle = Math.random() * Math.PI * 2;
        this.wander_timer = 0;
        
        // 受伤闪烁
        this.hurt_flash = 0;
        
        // 盾牌方向
        this.shield_angle = 0;
    }
    
    takeDamage(damage, fromAngle = null) {
        // 重装兵盾牌检测
        if (this.has_shield && fromAngle !== null) {
            let angleDiff = Math.abs(fromAngle - this.shield_angle);
            if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
            
            if (angleDiff < Math.PI / 3) {
                damage = damage * 0.2;
            }
        }
        
        this.hp -= damage;
        this.hurt_flash = 0.15;
        
        if (this.hp <= 0) {
            this.hp = 0;
        }
    }
    
    update(dt, player, bulletManager) {
        this.target = player;
        
        // 更新计时器
        if (this.hurt_flash > 0) this.hurt_flash -= dt;
        if (this.fire_timer > 0) this.fire_timer -= dt;
        
        // 计算与玩家的角度
        if (player) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            this.angle = Math.atan2(dy, dx);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 移动向玩家
            if (distance > this.radius + player.radius) {
                this.x += Math.cos(this.angle) * this.speed * dt * 60;
                this.y += Math.sin(this.angle) * this.speed * dt * 60;
            }
            
            // 射击
            if (distance <= this.attack_range && this.fire_timer <= 0) {
                this.shoot(bulletManager, player);
                this.fire_timer = this.fire_rate;
            }
            
            // 更新盾牌方向（重装兵）
            if (this.has_shield) {
                this.shield_angle = this.angle;
            }
        }
        
        // 边界限制
        const arena = Settings;
        this.x = Utils.clamp(this.x, arena.ARENA_OFFSET_X + this.radius,
                           arena.ARENA_OFFSET_X + arena.ARENA_WIDTH - this.radius);
        this.y = Utils.clamp(this.y, arena.ARENA_OFFSET_Y + this.radius,
                           arena.ARENA_OFFSET_Y + arena.ARENA_HEIGHT - this.radius);
    }
    
    shoot(bulletManager, player) {
        const angle = this.angle;
        bulletManager.add(this.x, this.y, angle, 12, this.damage, 'enemy');
    }
    
    render(ctx) {
        ctx.save();
        
        // 受伤闪烁
        if (this.hurt_flash > 0) {
            ctx.globalAlpha = 0.5 + Math.sin(this.hurt_flash * 50) * 0.5;
        }
        
        // 绘制火柴人身体
        const color = this.color;
        
        // 身体
        ctx.fillStyle = Utils.rgbToString(color);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 头部
        ctx.beginPath();
        ctx.arc(this.x, this.y - 6, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // 根据类型添加特征
        if (this.enemyType === 'assault' || this.enemyType === 'heavy') {
            // 头盔
            ctx.strokeStyle = Utils.rgbToString([color[0] * 0.7, color[1] * 0.7, color[2] * 0.7]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y - 6, this.radius * 0.5, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        if (this.has_shield) {
            // 盾牌
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.shield_angle);
            ctx.fillStyle = Utils.rgbaToString([200, 200, 200], 0.7);
            ctx.fillRect(0, -this.radius * 1.5, this.radius * 2, this.radius * 3);
            ctx.restore();
        }
        
        if (this.enemyType === 'elite') {
            // 精英光环
            ctx.strokeStyle = Utils.rgbaToString(color, 0.5);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // 手臂
        ctx.strokeStyle = Utils.rgbToString(color);
        ctx.lineWidth = 3;
        ctx.beginPath();
        const armLength = this.radius * 1.2;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + Math.cos(this.angle) * armLength,
                   this.y + Math.sin(this.angle) * armLength);
        ctx.stroke();
        
        ctx.restore();
    }
}

