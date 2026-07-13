// Initialize PeerJS
const peer = new Peer();

// DOM Elements
const qrcodeContainer = document.getElementById('qrcode-container');
const connScreen = document.getElementById('connection-screen');
const gameScreen = document.getElementById('game-screen');
const pointer = document.getElementById('virtual-pointer');
const urlHint = document.querySelector('.url-hint');
const gameArea = document.getElementById('game-area');
const roundDisplay = document.getElementById('round-display');

let roomId = null;

peer.on('open', (id) => {
    roomId = id;
    console.log('My peer ID is: ' + id);

    const serverUrl = window.location.origin;
    const pathname = window.location.pathname.replace('/index.html', '').replace(/\/$/, '');
    const controllerUrl = `${serverUrl}${pathname}/controller.html?room=${roomId}`;

    // Initialize QR Code
    new QRCode(qrcodeContainer, {
        text: controllerUrl,
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    urlHint.textContent = `Ou acesse: ${controllerUrl}`;
});

// Listen for incoming connection from mobile controller
peer.on('connection', (conn) => {
    console.log('Controller connected!');
    showToast('Controle conectado com sucesso!');
    
    // Switch screens
    connScreen.classList.remove('active');
    setTimeout(() => {
        gameScreen.classList.add('active');
        startRound(1); // Start Game
    }, 100);

    // Listen for data from controller
    conn.on('data', (data) => {
        if (data.type === 'gyro') {
            handleGyroMove(data.beta, data.gamma);
        } else if (data.type === 'click') {
            performClick();
        }
    });
});

// Game State Variables
let currentRound = 1;
let buttonsTotal = 0;
let buttonsClicked = 0;

function startRound(roundNum) {
    currentRound = roundNum;
    buttonsTotal = currentRound;
    buttonsClicked = 0;
    
    roundDisplay.textContent = `Rodada ${currentRound}`;
    
    // Clear existing buttons
    gameArea.innerHTML = '';
    
    // Spawn new buttons
    for (let i = 0; i < buttonsTotal; i++) {
        const btn = document.createElement('button');
        btn.className = 'target-btn';
        
        // Random position between 10% and 85% to stay safely on screen
        const topPos = 10 + Math.random() * 75;
        const leftPos = 10 + Math.random() * 75;
        
        btn.style.top = `${topPos}%`;
        btn.style.left = `${leftPos}%`;
        
        btn.addEventListener('click', () => {
            // Only react if it's not green yet
            if (!btn.classList.contains('btn-green')) {
                btn.classList.add('btn-green');
                buttonsClicked++;
                
                if (buttonsClicked === buttonsTotal) {
                    showToast('Rodada Concluída! Preparando próxima...');
                    // Fade out all buttons
                    document.querySelectorAll('.target-btn').forEach(b => b.classList.add('fade-out'));
                    
                    setTimeout(() => {
                        startRound(currentRound + 1);
                    }, 1500);
                }
            }
        });
        
        gameArea.appendChild(btn);
    }
}

// Pointer position variables
let pointerX = window.innerWidth / 2;
let pointerY = window.innerHeight / 2;

// Smooth factor for gyro noise
const smoothing = 0.8;

function handleGyroMove(beta, gamma) {
    // We treat beta=0 and gamma=0 as the center (perfectly flat on a table)
    const diffBeta = beta;
    const diffGamma = gamma;

    // Sensitivity multipliers
    const sensX = 25; 
    const sensY = 25;

    // Update target coordinates (Invert diffBeta)
    let targetX = (window.innerWidth / 2) + (diffGamma * sensX);
    let targetY = (window.innerHeight / 2) - (diffBeta * sensY);

    // Clamp target to screen bounds
    targetX = Math.max(0, Math.min(window.innerWidth, targetX));
    targetY = Math.max(0, Math.min(window.innerHeight, targetY));

    // Magnetic Snapping Logic
    let closestBtn = null;
    let minDist = 150; // Threshold distance for snapping (pixels)

    document.querySelectorAll('.target-btn').forEach(btn => {
        // We only snap to buttons that aren't green yet
        if(btn.classList.contains('btn-green') || btn.classList.contains('fade-out')) {
            btn.classList.remove('magnetic-hover');
            return;
        }

        const rect = btn.getBoundingClientRect();
        const btnX = rect.left + rect.width / 2;
        const btnY = rect.top + rect.height / 2;
        
        // Calculate distance from gyro target to button center
        const dist = Math.hypot(targetX - btnX, targetY - btnY);
        
        // Remove hover state initially
        btn.classList.remove('magnetic-hover');
        
        if (dist < minDist) {
            minDist = dist;
            closestBtn = { element: btn, x: btnX, y: btnY };
        }
    });

    let finalTargetX = targetX;
    let finalTargetY = targetY;

    // If close to a valid red button, snap to its center and apply visual hover
    if (closestBtn) {
        finalTargetX = closestBtn.x;
        finalTargetY = closestBtn.y;
        closestBtn.element.classList.add('magnetic-hover');
    }

    // Apply smoothing to the final position
    pointerX = pointerX * smoothing + finalTargetX * (1 - smoothing);
    pointerY = pointerY * smoothing + finalTargetY * (1 - smoothing);

    // Update DOM
    pointer.style.left = `${pointerX}px`;
    pointer.style.top = `${pointerY}px`;
}

function performClick() {
    // Visual feedback
    pointer.classList.add('pointer-clicking');
    setTimeout(() => pointer.classList.remove('pointer-clicking'), 150);

    // Temporarily hide pointer to find element underneath it
    pointer.style.display = 'none';
    const el = document.elementFromPoint(pointerX, pointerY);
    pointer.style.display = 'block';

    if (el) {
        if (el.tagName === 'BUTTON') {
            el.click(); // Trigger native click event
            
            const oldT = el.style.transform;
            el.style.transform = 'scale(0.9)';
            setTimeout(() => el.style.transform = oldT, 150);
        }
    }
}

function showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = 0;
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 2000);
}
