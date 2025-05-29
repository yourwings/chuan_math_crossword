/**
 * 生日快乐歌音频合成备用方案
 * 当外部音频文件无法加载时使用Web Audio API在浏览器中生成生日快乐歌
 */

document.addEventListener('DOMContentLoaded', () => {
    const birthdaySong = document.getElementById('birthday-song');
    const playMusicBtn = document.getElementById('play-music');
    
    // 创建音频上下文
    let audioContext;
    let isPlaying = false;
    let currentNote = 0;
    let nextNoteTime = 0;
    let timerID;
    let oscillator;
    let usingWebAudio = false; // 标记是否使用Web Audio API
    
    // 生日快乐歌音符和时值
    const happyBirthdaySong = [
        { note: 'C4', duration: 0.5 },
        { note: 'C4', duration: 0.5 },
        { note: 'D4', duration: 1 },
        { note: 'C4', duration: 1 },
        { note: 'F4', duration: 1 },
        { note: 'E4', duration: 2 },
        
        { note: 'C4', duration: 0.5 },
        { note: 'C4', duration: 0.5 },
        { note: 'D4', duration: 1 },
        { note: 'C4', duration: 1 },
        { note: 'G4', duration: 1 },
        { note: 'F4', duration: 2 },
        
        { note: 'C4', duration: 0.5 },
        { note: 'C4', duration: 0.5 },
        { note: 'C5', duration: 1 },
        { note: 'A4', duration: 1 },
        { note: 'F4', duration: 1 },
        { note: 'E4', duration: 1 },
        { note: 'D4', duration: 1 },
        
        { note: 'A#4', duration: 0.5 },
        { note: 'A#4', duration: 0.5 },
        { note: 'A4', duration: 1 },
        { note: 'F4', duration: 1 },
        { note: 'G4', duration: 1 },
        { note: 'F4', duration: 2 },
    ];
    
    // 音符频率映射
    const noteFrequency = {
        'C4': 261.63,
        'D4': 293.66,
        'E4': 329.63,
        'F4': 349.23,
        'G4': 392.00,
        'A4': 440.00,
        'A#4': 466.16,
        'C5': 523.25
    };
    
    // 初始化音频上下文
    function initAudio() {
        if (audioContext) return;
        
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        nextNoteTime = audioContext.currentTime;
    }
    
    // 播放单个音符
    function playNote(time, note, duration) {
        oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = noteFrequency[note];
        
        // 音量淡入淡出
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.5, time + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, time + duration - 0.05);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(time);
        oscillator.stop(time + duration);
    }
    
    // 调度下一个音符
    function scheduleNote() {
        const note = happyBirthdaySong[currentNote];
        const duration = note.duration * 0.5; // 调整速度
        
        playNote(nextNoteTime, note.note, duration);
        
        nextNoteTime += duration;
        currentNote++;
        
        if (currentNote >= happyBirthdaySong.length) {
            currentNote = 0; // 循环播放
            nextNoteTime += 1; // 循环之间添加间隔
        }
    }
    
    // 开始播放
    function startPlaying() {
        if (isPlaying) return;
        
        isPlaying = true;
        currentNote = 0;
        nextNoteTime = audioContext.currentTime;
        
        scheduleNote();
        timerID = setInterval(() => {
            // 提前调度音符
            while (nextNoteTime < audioContext.currentTime + 0.2) {
                scheduleNote();
            }
        }, 50);
    }
    
    // 停止播放
    function stopPlaying() {
        if (!isPlaying) return;
        
        isPlaying = false;
        clearInterval(timerID);
        
        // 如果有正在播放的音符，停止它
        if (oscillator) {
            try {
                oscillator.stop();
            } catch (e) {
                // 忽略已经停止的错误
            }
        }
    }
    
    // 检查外部音频是否可用，如果不可用则使用Web Audio API
    birthdaySong.addEventListener('error', () => {
        console.log('外部音频加载失败，使用Web Audio API合成');
        usingWebAudio = true;
        
        // 如果播放按钮显示为暂停状态，说明用户想播放音乐
        if (playMusicBtn.textContent === '暂停音乐') {
            initAudio();
            startPlaying();
        }
    });
    
    // 监听外部音频播放结束事件，如果不是循环播放则切换按钮状态
    birthdaySong.addEventListener('ended', () => {
        if (!birthdaySong.loop) {
            playMusicBtn.textContent = '播放生日歌';
        }
    });
    
    // 覆盖原有的播放/暂停按钮点击事件
    // 这个事件处理程序会在fireworks.js中的事件处理程序之后执行
    playMusicBtn.addEventListener('click', () => {
        // 如果外部音频加载失败，使用Web Audio API
        if (usingWebAudio) {
            initAudio();
            
            if (isPlaying) {
                stopPlaying();
                playMusicBtn.textContent = '播放生日歌';
            } else {
                startPlaying();
                playMusicBtn.textContent = '暂停音乐';
            }
            
            // 阻止事件冒泡，防止触发fireworks.js中的事件处理程序
            event.stopPropagation();
        }
    });
});