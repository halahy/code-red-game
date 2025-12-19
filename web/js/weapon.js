// 武器掉落物类
class WeaponPickup {
    constructor(x, y, weaponType) {
        this.x = x;
        this.y = y;
        this.weaponType = weaponType;
        this.weaponData = Settings.WEAPONS[weaponType];
        this.radius = 20;
        this.despawn_timer = 30; // 30秒后消失
    }
    
    update(dt, player) {
        this.despawn_timer -= dt;
        
        if (this.despawn_timer <= 0) {
            return false; // 消失
        }
        
        // 检查玩家拾取
        const distance = Utils.distance(this.x, this.y, player.x, player.y);
        if (distance < this.radius + player.radius) {
            if (player.pickupWeapon(this.weaponType)) {
                return true; // 被拾取
            }
        }
        
        return null; // 继续存在
    }
    
    render(ctx) {
        ctx.save();
        
        // 武器图标（简化显示）
        const color = this.weaponData.color;
        ctx.fillStyle = Utils.rgbToString(color);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 边框
        ctx.strokeStyle = Utils.rgbToString([255, 255, 255]);
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 武器名称
        ctx.fillStyle = Utils.rgbToString([255, 255, 255]);
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.weaponData.name, this.x, this.y + this.radius + 15);
        
        ctx.restore();
    }
}

