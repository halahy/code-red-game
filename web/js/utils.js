// 工具函数
const Utils = {
    // 计算两点之间的距离
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    // 计算两点之间的角度（弧度）
    angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },
    
    // 将角度限制在 0-2π 范围内
    normalizeAngle(angle) {
        while (angle < 0) angle += Math.PI * 2;
        while (angle >= Math.PI * 2) angle -= Math.PI * 2;
        return angle;
    },
    
    // 检查两个圆形是否碰撞
    circleCollision(x1, y1, r1, x2, y2, r2) {
        const dist = this.distance(x1, y1, x2, y2);
        return dist < (r1 + r2);
    },
    
    // 检查点是否在矩形内
    pointInRect(x, y, rectX, rectY, rectW, rectH) {
        return x >= rectX && x <= rectX + rectW && y >= rectY && y <= rectY + rectH;
    },
    
    // 将RGB数组转换为CSS颜色字符串
    rgbToString(rgb) {
        return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    },
    
    // 将RGB数组转换为带透明度的CSS颜色字符串
    rgbaToString(rgb, alpha) {
        return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
    },
    
    // 限制值在范围内
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    
    // 线性插值
    lerp(start, end, t) {
        return start + (end - start) * t;
    },
    
    // 随机数
    random(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    // 随机整数
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
};

