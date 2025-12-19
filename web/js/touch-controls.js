// 移动端触摸控制
class TouchControls {
    constructor(game) {
        this.game = game;
        this.joystickActive = false;
        this.joystickCenter = { x: 0, y: 0 };
        this.joystickPosition = { x: 0, y: 0 };
        this.joystickRadius = 60;
        this.isMobile = this.detectMobile();
        
        if (this.isMobile) {
            this.init();
        }
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768);
    }
    
    init() {
        // 显示移动端控制界面
        const mobileControls = document.getElementById('mobile-controls');
        if (mobileControls) {
            mobileControls.classList.remove('hidden');
        }
        
        // 虚拟摇杆
        this.setupJoystick();
        
        // 按钮
        this.setupButtons();
        
        // 触摸瞄准
        this.setupTouchAim();
    }
    
    setupJoystick() {
        const joystick = document.getElementById('virtual-joystick');
        const stick = document.getElementById('joystick-stick');
        
        if (!joystick || !stick) return;
        
        const joystickRect = joystick.getBoundingClientRect();
        this.joystickCenter = {
            x: joystickRect.left + joystickRect.width / 2,
            y: joystickRect.top + joystickRect.height / 2
        };
        
        // 触摸开始
        joystick.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.joystickActive = true;
            this.updateJoystick(e.touches[0]);
        }, { passive: false });
        
        // 触摸移动
        joystick.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.joystickActive) {
                this.updateJoystick(e.touches[0]);
            }
        }, { passive: false });
        
        // 触摸结束
        joystick.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.joystickActive = false;
            this.joystickPosition = { x: 0, y: 0 };
            this.updateJoystickVisual();
            this.updateGameMovement();
        }, { passive: false });
        
        joystick.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.joystickActive = false;
            this.joystickPosition = { x: 0, y: 0 };
            this.updateJoystickVisual();
            this.updateGameMovement();
        }, { passive: false });
    }
    
    updateJoystick(touch) {
        const dx = touch.clientX - this.joystickCenter.x;
        const dy = touch.clientY - this.joystickCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > this.joystickRadius) {
            const angle = Math.atan2(dy, dx);
            this.joystickPosition = {
                x: Math.cos(angle) * this.joystickRadius,
                y: Math.sin(angle) * this.joystickRadius
            };
        } else {
            this.joystickPosition = { x: dx, y: dy };
        }
        
        this.updateJoystickVisual();
        this.updateGameMovement();
    }
    
    updateJoystickVisual() {
        const stick = document.getElementById('joystick-stick');
        if (stick) {
            const x = this.joystickPosition.x;
            const y = this.joystickPosition.y;
            stick.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        }
    }
    
    updateGameMovement() {
        if (!this.game) return;
        
        // 归一化摇杆输入
        const magnitude = Math.sqrt(
            this.joystickPosition.x * this.joystickPosition.x +
            this.joystickPosition.y * this.joystickPosition.y
        );
        
        if (magnitude > 5) {
            const normalizedX = this.joystickPosition.x / this.joystickRadius;
            const normalizedY = this.joystickPosition.y / this.joystickRadius;
            
            // 更新游戏按键状态
            this.game.keys.w = normalizedY < -0.3;
            this.game.keys.s = normalizedY > 0.3;
            this.game.keys.a = normalizedX < -0.3;
            this.game.keys.d = normalizedX > 0.3;
        } else {
            this.game.keys.w = false;
            this.game.keys.s = false;
            this.game.keys.a = false;
            this.game.keys.d = false;
        }
    }
    
    setupButtons() {
        // 射击按钮
        const btnShoot = document.getElementById('btn-shoot');
        if (btnShoot) {
            btnShoot.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.game.mouseDown = true;
            }, { passive: false });
            
            btnShoot.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.game.mouseDown = false;
            }, { passive: false });
            
            btnShoot.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.game.mouseDown = false;
            }, { passive: false });
        }
        
        // 换弹按钮
        const btnReload = document.getElementById('btn-reload');
        if (btnReload) {
            btnReload.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.game.player.reload();
            }, { passive: false });
        }
        
        // 闪避按钮
        const btnDodge = document.getElementById('btn-dodge');
        if (btnDodge) {
            btnDodge.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (!this.game.player.dodging && this.game.player.dodge_cooldown <= 0) {
                    const dx = this.game.mouseX - this.game.player.x;
                    const dy = this.game.mouseY - this.game.player.y;
                    this.game.player.dodge(dx, dy);
                }
            }, { passive: false });
        }
        
        // 切换武器按钮
        const btnSwitch = document.getElementById('btn-switch');
        if (btnSwitch) {
            btnSwitch.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.game.player.switchWeapon();
            }, { passive: false });
        }
    }
    
    setupTouchAim() {
        const canvas = document.getElementById('game-canvas');
        
        // 触摸瞄准（在画布上滑动）
        let touchAimActive = false;
        
        canvas.addEventListener('touchstart', (e) => {
            // 如果触摸点在画布中央区域（不是按钮区域），则用于瞄准
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            // 检查是否在按钮区域
            const isButtonArea = this.isInButtonArea(touch.clientX, touch.clientY);
            
            if (!isButtonArea) {
                touchAimActive = true;
                this.game.mouseX = x;
                this.game.mouseY = y;
            }
        }, { passive: false });
        
        canvas.addEventListener('touchmove', (e) => {
            if (touchAimActive) {
                const touch = e.touches[0];
                const rect = canvas.getBoundingClientRect();
                this.game.mouseX = touch.clientX - rect.left;
                this.game.mouseY = touch.clientY - rect.top;
            }
        }, { passive: false });
        
        canvas.addEventListener('touchend', (e) => {
            touchAimActive = false;
        }, { passive: false });
    }
    
    isInButtonArea(x, y) {
        const buttons = document.getElementById('mobile-buttons');
        if (!buttons) return false;
        
        const rect = buttons.getBoundingClientRect();
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    }
}

