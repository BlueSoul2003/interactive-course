
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        function playTone(freq, type, delay, duration) {
            const t = audioCtx.currentTime + delay;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(t);
            osc.stop(t + duration);
        }

        function playSound(type) {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const t = audioCtx.currentTime;

            if (type === 'win') {
                const rand = Math.floor(Math.random() * 6);
                if (rand === 0) {
                    playTone(880, 'sine', 0, 0.15);
                    playTone(1108, 'sine', 0.1, 0.3);
                } else if (rand === 1) {
                    playTone(523, 'square', 0, 0.1);
                    playTone(659, 'square', 0.1, 0.1);
                    playTone(783, 'square', 0.2, 0.1);
                    playTone(1046, 'square', 0.3, 0.4);
                } else if (rand === 2) {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(800, t);
                    osc.frequency.exponentialRampToValueAtTime(200, t + 0.15);
                    gain.gain.setValueAtTime(0.2, t);
                    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
                    osc.connect(gain); gain.connect(audioCtx.destination);
                    osc.start(t); osc.stop(t + 0.15);
                } else if (rand === 3) {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(2500, t);
                    osc.frequency.exponentialRampToValueAtTime(800, t + 0.3);
                    gain.gain.setValueAtTime(0.2, t);
                    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
                    osc.connect(gain); gain.connect(audioCtx.destination);
                    osc.start(t); osc.stop(t + 0.3);
                } else if (rand === 4) {
                    playTone(523, 'sine', 0, 0.4);
                    playTone(659, 'sine', 0, 0.4);
                    playTone(783, 'sine', 0, 0.4);
                } else if (rand === 5) {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(400, t);
                    osc.frequency.setValueAtTime(600, t + 0.1);
                    osc.frequency.setValueAtTime(800, t + 0.2);
                    gain.gain.setValueAtTime(0.1, t);
                    gain.gain.linearRampToValueAtTime(0, t + 0.3);
                    osc.connect(gain); gain.connect(audioCtx.destination);
                    osc.start(t); osc.stop(t + 0.3);
                }
            } else if (type === 'lose') {
                playTone(150, 'sawtooth', 0, 0.3);
            } else if (type === 'click') {
                const baseFreq = 600 + (Math.random() * 100 - 50);
                playTone(baseFreq, 'square', 0, 0.05);
            }
        }
    