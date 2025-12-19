// 玩家类
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = Settings.PLAYER_RADIUS;
        this.angle = 0;
        
        // 生命值
        this.hp = Settings.PLAYER_MAX_HP;
        this.max_hp = Settings.PLAYER_MAX_HP;
        
        // 无敌状态
        this.invincible = false;
        this.invincible_timer = 0;
        
        // 闪避系统
        this.dodging = false;
        this.dodge_timer = 0;
        this.dodge_cooldown = 0;
        this.dodge_direction = { x: 0, y: 0 };
        
        // 冲刺
        this.sprinting = false;
        
        // 武器系统
        this.weapons = [
            JSON.parse(JSON.stringify(Settings.WEAPONS.pistol)),
            null
        ];
        this.current_weapon_index = 0;
        this.current_weapon = this.weapons[0];
        
        // 弹药
        this.current_ammo = this.current_weapon.magazine === -1 ? 999 : this.current_weapon.magazine;
        this.reserve_ammo = this.current_weapon.max_ammo === -1 ? 999 : this.current_weapon.max_ammo;
        
        // 射击
        this.shooting = false;
        this.fire_timer = 0;
        this.reloading = false;
        this.reload_timer = 0;
        
        // 受伤闪烁
        this.hurt_flash = 0;
    }
    
    dodge(dx, dy) {
        if (this.dodge_cooldown <= 0 && !this.dodging) {
            const length = Math.sqrt(dx * dx + dy * dy);
            if (length > 0) {
                this.dodge_direction = { x: dx / length, y: dy / length };
            } else {
                this.dodge_direction = { x: Math.cos(this.angle), y: Math.sin(this.angle) };
            }
            
            this.dodging = true;
            this.dodge_timer = Settings.DODGE_DURATION;
            this.dodge_cooldown = Settings.DODGE_COOLDOWN;
            this.invincible = true;
            this.invincible_timer = Settings.DODGE_INVINCIBLE_TIME;
        }
    }
    
    reload() {
        if (this.current_weapon.magazine === -1) return;
        if (this.reloading) return;
        if (this.current_ammo >= this.current_weapon.magazine) return;
        if (this.reserve_ammo <= 0) return;
        
        this.reloading = true;
        this.reload_timer = this.current_weapon.reload_time;
    }
    
    switchWeapon() {
        if (this.weapons[1] !== null) {
            this.current_weapon_index = 1 - this.current_weapon_index;
            this._changeWeapon();
        }
    }
    
    selectWeapon(index) {
        if (index >= 0 && index < this.weapons.length && this.weapons[index] !== null) {
            this.current_weapon_index = index;
            this._changeWeapon();
        }
    }
    
    _changeWeapon() {
        this.current_weapon = this.weapons[this.current_weapon_index];
        this.reloading = false;
        this.reload_timer = 0;
        if (this.current_weapon.magazine !== -1) {
            this.current_ammo = this.current_weapon.magazine;
            this.reserve_ammo = this.current_weapon.max_ammo;
        } else {
            this.current_ammo = 999;
            this.reserve_ammo = 999;
        }
    }
    
    pickupWeapon(weaponType) {
        const newWeapon = Settings.WEAPONS[weaponType];
        if (!newWeapon) return false;
        
        const weaponCopy = JSON.parse(JSON.stringify(newWeapon));
        
        if (this.weapons[1] === null) {
            this.weapons[1] = weaponCopy;
        } else {
            this.weapons[this.current_weapon_index] = weaponCopy;
            this._changeWeapon();
        }
        
        if (weaponCopy.magazine !== -1) {
            this.current_ammo = weaponCopy.magazine;
            this.reserve_ammo = weaponCopy.max_ammo || 0;
        } else {
            this.current_ammo = 999;
            this.reserve_ammo = 999;
        }
        
        return true;
    }
    
    takeDamage(damage) {
        if (this.invincible) return;
        
        this.hp -= damage;
        this.hurt_flash = 0.2;
        this.invincible = true;
        this.invincible_timer = 0.3;
        
        if (this.hp <= 0) {
            this.hp = 0;
        }
    }
    
    update(dt, keys, mouseX, mouseY, bulletManager) {
        // 更新计时器
        if (this.dodge_cooldown > 0) this.dodge_cooldown -= dt;
        if (this.invincible_timer > 0) {
            this.invincible_timer -= dt;
            if (this.invincible_timer <= 0) this.invincible = false;
        }
        if (this.hurt_flash > 0) this.hurt_flash -= dt;
        
        // 计算瞄准角度
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        this.angle = Math.atan2(dy, dx);
        
        // 冲刺状态
        this.sprinting = keys.shift;
        
        // 闪避更新
        if (this.dodging) {
            this.dodge_timer -= dt;
            const speed = Settings.DODGE_DISTANCE / Settings.DODGE_DURATION;
            this.x += this.dodge_direction.x * speed * dt * 60;
            this.y += this.dodge_direction.y * speed * dt * 60;
            
            if (this.dodge_timer <= 0) {
                this.dodging = false;
            }
        } else {
            // 正常移动
            let moveX = 0;
            let moveY = 0;
            
            if (keys.w) moveY = -1;
            if (keys.s) moveY = 1;
            if (keys.a) moveX = -1;
            if (keys.d) moveX = 1;
            
            // 归一化
            if (moveX !== 0 && moveY !== 0) {
                moveX *= 0.707;
                moveY *= 0.707;
            }
            
            let speed = Settings.PLAYER_SPEED;
            if (this.sprinting) speed *= Settings.PLAYER_SPRINT_MULTIPLIER;
            
            this.x += moveX * speed * dt * 60;
            this.y += moveY * speed * dt * 60;
        }
        
        // 边界限制
        const arena = Settings;
        this.x = Utils.clamp(this.x, arena.ARENA_OFFSET_X + this.radius, 
                           arena.ARENA_OFFSET_X + arena.ARENA_WIDTH - this.radius);
        this.y = Utils.clamp(this.y, arena.ARENA_OFFSET_Y + this.radius,
                           arena.ARENA_OFFSET_Y + arena.ARENA_HEIGHT - this.radius);
        
        // 换弹
        if (this.reloading) {
            this.reload_timer -= dt;
            if (this.reload_timer <= 0) {
                const needed = this.current_weapon.magazine - this.current_ammo;
                const reloaded = Math.min(needed, this.reserve_ammo);
                this.current_ammo += reloaded;
                this.reserve_ammo -= reloaded;
                this.reloading = false;
            }
        }
        
        // 射击
        if (this.shooting && !this.reloading) {
            this.fire_timer -= dt;
            if (this.fire_timer <= 0) {
                if (this.current_weapon.magazine === -1 || this.current_ammo > 0) {
                    this.shoot(bulletManager);
                    if (this.current_weapon.magazine !== -1) {
                        this.current_ammo--;
                    }
                    this.fire_timer = this.current_weapon.fire_rate;
                }
            }
        }
    }
    
    shoot(bulletManager) {
        const weapon = this.current_weapon;
        
        if (weapon.pellets) {
            // 霰弹枪
            for (let i = 0; i < weapon.pellets; i++) {
                const spread = (Math.random() - 0.5) * weapon.spread * Math.PI / 180;
                const angle = this.angle + spread;
                bulletManager.add(this.x, this.y, angle, weapon.bullet_speed, weapon.damage, 'player', weapon.color);
            }
        } else {
            // 普通武器
            let angle = this.angle;
            if (weapon.spread > 0) {
                angle += (Math.random() - 0.5) * weapon.spread * Math.PI / 180;
            }
            bulletManager.add(this.x, this.y, angle, weapon.bullet_speed, weapon.damage, 'player', weapon.color);
        }
    }
    
    render(ctx) {
        ctx.save();
        
        // 受伤闪烁
        if (this.hurt_flash > 0) {
            ctx.globalAlpha = 0.5 + Math.sin(this.hurt_flash * 50) * 0.5;
        }
        
        // 绘制火柴人身体（俯视角）
        const color = this.invincible ? [255, 255, 255] : Settings.PLAYER_COLOR;
        
        // 身体（圆形）
        ctx.fillStyle = Utils.rgbToString(color);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 头部（稍小的圆）
        ctx.fillStyle = Utils.rgbToString(color);
        ctx.beginPath();
        ctx.arc(this.x, this.y - 8, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // 战术目镜
        ctx.strokeStyle = Utils.rgbToString(Settings.PLAYER_VISOR_COLOR);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y - 8, this.radius * 0.4, 0, Math.PI * 2);
        ctx.stroke();
        
        // 手臂（指向瞄准方向）
        ctx.strokeStyle = Utils.rgbToString(color);
        ctx.lineWidth = 3;
        ctx.beginPath();
        const armLength = this.radius * 1.2;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + Math.cos(this.angle) * armLength, 
                   this.y + Math.sin(this.angle) * armLength);
        ctx.stroke();
        
        // 绘制武器
        this._drawWeapon(ctx);
        
        ctx.restore();
    }
    
    _drawWeapon(ctx) {
        const weapon = this.current_weapon;
        const weaponX = this.x + Math.cos(this.angle) * (this.radius + 5);
        const weaponY = this.y + Math.sin(this.angle) * (this.radius + 5);
        
        ctx.save();
        ctx.translate(weaponX, weaponY);
        ctx.rotate(this.angle);
        
        // 武器颜色
        const weaponColor = weapon.color || [255, 255, 100];
        
        // 根据武器类型绘制
        if (weapon.name === '手枪') {
            ctx.fillStyle = Utils.rgbToString(weaponColor);
            ctx.fillRect(-3, -2, 8, 4);
        } else if (weapon.name === '冲锋枪') {
            ctx.fillStyle = Utils.rgbToString(weaponColor);
            ctx.fillRect(-5, -3, 12, 6);
            // 弹匣
            ctx.fillRect(-5, 3, 6, 4);
        } else if (weapon.name === '霰弹枪') {
            ctx.fillStyle = Utils.rgbToString(weaponColor);
            ctx.fillRect(-6, -4, 15, 8);
            // 双管
            ctx.fillRect(-6, -2, 8, 4);
        } else if (weapon.name === '狙击枪') {
            ctx.fillStyle = Utils.rgbToString(weaponColor);
            ctx.fillRect(-8, -3, 20, 6);
            // 瞄准镜
            ctx.strokeStyle = Utils.rgbToString(weaponColor);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(5, 0, 4, 0, Math.PI * 2);
            ctx.stroke();
        } else if (weapon.name === '火箭筒') {
            ctx.fillStyle = Utils.rgbToString(weaponColor);
            ctx.fillRect(-8, -5, 18, 10);
            // 炮管
            ctx.fillRect(10, -3, 6, 6);
        }
        
        ctx.restore();
    }
}

