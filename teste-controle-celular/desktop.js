// Initialize PeerJS
const peer = new Peer();

// DOM Elements
const qrcodeContainer = document.getElementById('qrcode-container');
const connScreen = document.getElementById('connection-screen');
const gameScreen = document.getElementById('game-screen');
const pointer = document.getElementById('virtual-pointer');
const urlHint = document.querySelector('.url-hint');

let roomId = null;

peer.on('open', (id) => {
    roomId = id;
    console.log('My peer ID is: ' + id);

    // We need the public URL of the server (or local IP) to embed in the QR code.
    const serverUrl = window.location.origin;
    // If the path isn't root, we should append it. But for now we assume it's root or we use pathname
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
    gameScreen.classList.add('active');
    setTimeout(() => {
        gameScreen.classList.add('active');
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

// Pointer position variables
let pointerX = window.innerWidth / 2;
let pointerY = window.innerHeight / 2;

// Smooth factor for gyro noise
const smoothing = 0.8;

// Calibrated center points
let calBeta = 0;
let calGamma = 0;
let isCalibrated = false;

function handleGyroMove(beta, gamma) {
    if(!isCalibrated) {
        calBeta = beta;
        calGamma = gamma;
        isCalibrated = true;
        return;
    }

    // Calculate difference from center
    const diffBeta = beta - calBeta;
    const diffGamma = gamma - calGamma;

    // Sensitivity multipliers
    const sensX = 25; 
    const sensY = 25;

    // Update target coordinates (Invert diffBeta by subtracting instead of adding)
    let targetX = (window.innerWidth / 2) + (diffGamma * sensX);
    let targetY = (window.innerHeight / 2) - (diffBeta * sensY);

    // Clamp target to screen bounds
    targetX = Math.max(0, Math.min(window.innerWidth, targetX));
    targetY = Math.max(0, Math.min(window.innerHeight, targetY));

    // Magnetic Snapping Logic
    let closestBtn = null;
    let minDist = 150; // Threshold distance for snapping (pixels)

    document.querySelectorAll('.target-btn').forEach(btn => {
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

    // If close to a button, snap to its center and apply visual hover
    if (closestBtn) {
        finalTargetX = closestBtn.x;
        finalTargetY = closestBtn.y;
        closestBtn.element.classList.add('magnetic-hover');
    }

    // Apply smoothing to the final position (either free or snapped)
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

    // Temporarily hide pointer to find element underneath it, otherwise it finds itself
    pointer.style.display = 'none';
    const el = document.elementFromPoint(pointerX, pointerY);
    pointer.style.display = 'block';

    if (el) {
        if (el.tagName === 'BUTTON') {
            el.click(); // Trigger native click event
            
            // Add a little pulse effect manually
            const oldT = el.style.transform;
            el.style.transform = 'scale(0.9)';
            setTimeout(() => el.style.transform = oldT, 150);
        }
    }
}

// Setup click handlers for testing buttons
document.querySelectorAll('.target-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        showToast(`Clicou no ${e.target.textContent}!`);
    });
});

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
    }, 3000);
}
