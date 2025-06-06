/**
 * 小川生日彩蛋页面 - 烟花效果和音乐控制
 */

// 获取画布和上下文
const canvas = document.getElementById('fireworks-canvas');
const ctx = canvas.getContext('2d');
let width, height;

// 调整画布大小
function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// 烟花粒子类
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = {
            x: -2 + Math.random() * 4,
            y: -2 + Math.random() * 4
        };
        this.alpha = 1;
        this.size = 2 + Math.random() * 3;
        this.decay = 0.015 + Math.random() * 0.03;
    }
    
    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.y += 0.05; // 重力
        this.alpha -= this.decay;
        return this.alpha > 0;
    }
    
    draw() {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
}

// 烟花类
class Firework {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * width;
        this.y = height;
        this.targetY = height / 4 + Math.random() * (height / 2);
        this.speed = 2 + Math.random() * 3;
        this.particles = [];
        this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
        this.exploded = false;
    }
    
    update() {
        if (!this.exploded) {
            this.y -= this.speed;
            
            if (this.y <= this.targetY) {
                this.explode();
            }
            return true;
        } else {
            this.particles = this.particles.filter(p => p.update());
            return this.particles.length > 0;
        }
    }
    
    draw() {
        if (!this.exploded) {
            ctx.globalAlpha = 1;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        } else {
            this.particles.forEach(p => p.draw());
        }
    }
    
    explode() {
        this.exploded = true;
        // 创建更多粒子，使烟花更壮观
        for (let i = 0; i < 150; i++) {
            this.particles.push(new Particle(this.x, this.y, this.color));
        }
    }
}

// 管理烟花
const fireworks = [];
const maxFireworks = 8; // 增加最大烟花数量

function addFirework() {
    if (fireworks.length < maxFireworks && Math.random() < 0.05) {
        fireworks.push(new Firework());
    }
}

function animate() {
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    
    addFirework();
    
    for (let i = fireworks.length - 1; i >= 0; i--) {
        if (!fireworks[i].update()) {
            fireworks[i].reset();
        }
        fireworks[i].draw();
    }
    
    requestAnimationFrame(animate);
}

// 启动动画
animate();

// 音乐控制
document.addEventListener('DOMContentLoaded', () => {
    const playMusicBtn = document.getElementById('play-music');
    const birthdaySong = document.getElementById('birthday-song');
    let usingWebAudio = true; // 标记是否使用Web Audio API，直接设置为true
    
    // 初始化音频上下文和播放状态
    let audioContext;
    let isPlaying = false;
    let timerID;
    let oscillator;
    let nextNoteTime;
    let currentNote = 0;
    
    // 初始化音频上下文
    function initAudio() {
        if (audioContext) return;
        
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        nextNoteTime = audioContext.currentTime;
    }
    
    // 尝试自动播放音乐
    setTimeout(() => {
        // 初始化音频上下文
        initAudio();
        // 自动开始播放
        startPlaying();
        playMusicBtn.textContent = '暂停音乐';
    }, 500); // 延迟500毫秒，确保页面完全加载
    
    // 播放按钮点击事件
    playMusicBtn.addEventListener('click', () => {
        initAudio();
        
        if (isPlaying) {
            stopPlaying();
            playMusicBtn.textContent = '播放生日歌';
        } else {
            startPlaying();
            playMusicBtn.textContent = '暂停音乐';
        }
    });
    
    // 返回按钮
    document.getElementById('return-btn').addEventListener('click', () => {
        window.location.href = '../index.html';
    });
    
    // 尝试自动播放音乐（需要用户交互后才能播放）
    const tryAutoPlay = () => {
        birthdaySong.play().then(() => {
            playMusicBtn.textContent = '暂停音乐';
            console.log('音乐自动播放成功');
        }).catch(e => {
            console.log('自动播放失败，需要用户交互:', e);
            // 监听用户交互事件
            const userInteraction = () => {
                birthdaySong.play();
                playMusicBtn.textContent = '暂停音乐';
                // 移除所有事件监听器
                document.removeEventListener('click', userInteraction);
                document.removeEventListener('touchstart', userInteraction);
                document.removeEventListener('keydown', userInteraction);
            };
            
            document.addEventListener('click', userInteraction, { once: true });
            document.addEventListener('touchstart', userInteraction, { once: true });
            document.addEventListener('keydown', userInteraction, { once: true });
        });
    };
    
    // 页面加载后尝试自动播放
    setTimeout(tryAutoPlay, 1000);
});