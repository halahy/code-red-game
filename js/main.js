// 游戏入口
let game = null;
let lastTime = 0;
let animationFrameId = null;
let touchControls = null;

// 初始化游戏
function init() {
    const canvas = document.getElementById('game-canvas');
    game = new Game(canvas);
    
    // 输入事件
    setupInput();
    
    // 移动端触摸控制
    touchControls = new TouchControls(game);
    
    // 游戏循环
    gameLoop();
    
    // 重新开始按钮
    document.getElementById('restart-btn').addEventListener('click', () => {
        game.saveSystem.clearSave();
        location.reload();
    });
    
    // 防止移动端页面滚动和缩放
    preventMobileDefault();
}

// 设置输入
function setupInput() {
    // 键盘事件
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'w' || key === 'arrowup') game.keys.w = true;
        if (key === 's' || key === 'arrowdown') game.keys.s = true;
        if (key === 'a' || key === 'arrowleft') game.keys.a = true;
        if (key === 'd' || key === 'arrowright') game.keys.d = true;
        if (key === 'shift') game.keys.shift = true;
        if (key === ' ') {
            e.preventDefault();
            game.keys.space = true;
            if (!game.player.dodging && game.player.dodge_cooldown <= 0) {
                const dx = game.mouseX - game.player.x;
                const dy = game.mouseY - game.player.y;
                game.player.dodge(dx, dy);
            }
        }
        if (key === 'r') game.keys.r = true;
        if (key === 'q') game.keys.q = true;
        if (key === '1') game.keys['1'] = true;
        if (key === '2') game.keys['2'] = true;
        if (key === 'escape') {
            e.preventDefault();
            game.keys.escape = true;
            game.paused = !game.paused;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'w' || key === 'arrowup') game.keys.w = false;
        if (key === 's' || key === 'arrowdown') game.keys.s = false;
        if (key === 'a' || key === 'arrowleft') game.keys.a = false;
        if (key === 'd' || key === 'arrowright') game.keys.d = false;
        if (key === 'shift') game.keys.shift = false;
        if (key === ' ') game.keys.space = false;
        if (key === 'r') {
            game.keys.r = false;
            game.player.reload();
        }
        if (key === 'q') {
            game.keys.q = false;
            game.player.switchWeapon();
        }
        if (key === '1') {
            game.keys['1'] = false;
            game.player.selectWeapon(0);
        }
        if (key === '2') {
            game.keys['2'] = false;
            game.player.selectWeapon(1);
        }
        if (key === 'escape') game.keys.escape = false;
    });
    
    // 鼠标事件
    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        game.mouseX = e.clientX - rect.left;
        game.mouseY = e.clientY - rect.top;
    });
    
    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // 左键
            game.mouseDown = true;
        }
    });
    
    canvas.addEventListener('mouseup', (e) => {
        if (e.button === 0) {
            game.mouseDown = false;
        }
    });
    
    // 防止右键菜单
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // 窗口失去焦点时暂停
    window.addEventListener('blur', () => {
        if (game) game.paused = true;
    });
}

// 游戏循环
function gameLoop(currentTime) {
    if (!game) return;
    
    // 计算deltaTime
    const deltaTime = currentTime ? (currentTime - lastTime) / 1000 : 0.016;
    lastTime = currentTime || performance.now();
    
    // 限制deltaTime，防止卡顿导致的大跳跃
    const dt = Math.min(deltaTime, 0.1);
    
    // 更新游戏
    game.update(dt);
    
    // 渲染
    game.render();
    
    // 继续循环
    animationFrameId = requestAnimationFrame(gameLoop);
}

// 页面加载完成后初始化
window.addEventListener('load', init);

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    if (game) {
        game.saveGameData();
    }
});

// 防止移动端默认行为
function preventMobileDefault() {
    // 防止双击缩放
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
    
    // 防止页面滚动
    document.addEventListener('touchmove', (e) => {
        // 允许在游戏画布和按钮上滚动
        const target = e.target;
        if (target.id !== 'game-canvas' && 
            !target.closest('#mobile-controls') &&
            !target.closest('#game-over-screen') &&
            !target.closest('#pause-screen')) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // 防止下拉刷新
    document.body.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
}

