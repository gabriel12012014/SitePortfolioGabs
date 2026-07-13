// Parse host peer ID from URL query parameters
const urlParams = new URLSearchParams(window.location.search);
const hostPeerId = urlParams.get('room');

// Elements
const permScreen = document.getElementById('permission-screen');
const ctrlScreen = document.getElementById('control-screen');
const startBtn = document.getElementById('start-btn');
const actionBtn = document.getElementById('action-btn');
const errorMsg = document.getElementById('error-msg');
const debugInfo = document.getElementById('debug-info');

let peer = null;
let conn = null;

if (!hostPeerId) {
    errorMsg.textContent = "Erro: ID da sala não encontrado na URL. Escaneie o QR Code novamente.";
    startBtn.style.display = 'none';
} else {
    // Initialize PeerJS
    peer = new Peer();
    
    peer.on('open', (id) => {
        console.log('Mobile peer ID is: ' + id);
        // Connect to host
        conn = peer.connect(hostPeerId);
        
        conn.on('open', () => {
            console.log('Connected to host!');
            startBtn.disabled = false;
            startBtn.textContent = 'Iniciar Controle';
        });

        conn.on('error', (err) => {
            console.error(err);
            errorMsg.textContent = "Erro de conexão P2P.";
        });
    });

    peer.on('error', (err) => {
        console.error(err);
        errorMsg.textContent = "Falha ao iniciar PeerJS.";
    });
}

// Request permissions and start tracking
startBtn.addEventListener('click', () => {
    if (!conn || !conn.open) {
        errorMsg.textContent = "Aguarde a conexão com o PC...";
        return;
    }

    // Feature detection for iOS 13+ device orientation permission
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    startTracking();
                } else {
                    errorMsg.textContent = "Permissão ao giroscópio negada.";
                }
            })
            .catch(console.error);
    } else {
        // Non iOS 13+ devices
        startTracking();
    }
});

function startTracking() {
    // Switch screens
    permScreen.classList.remove('active');
    ctrlScreen.classList.add('active');

    // Add device orientation listener
    window.addEventListener('deviceorientation', handleOrientation, true);
}

// Throttle network requests to avoid overwhelming the connection
let lastSend = 0;
const sendInterval = 30; // ~33fps

function handleOrientation(event) {
    const now = Date.now();
    if (now - lastSend < sendInterval) return;
    lastSend = now;

    let { beta, gamma } = event;
    
    if (beta === null || gamma === null) {
        debugInfo.textContent = "Sensores não suportados ou bloqueados.";
        return; 
    }

    debugInfo.textContent = `B: ${Math.round(beta)} | G: ${Math.round(gamma)}`;

    if (conn && conn.open) {
        conn.send({
            type: 'gyro',
            beta: beta,
            gamma: gamma
        });
    }
}

// Handle the big red button click
actionBtn.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent double firing with click
    triggerClick();
});

actionBtn.addEventListener('click', (e) => {
    triggerClick();
});

function triggerClick() {
    if (conn && conn.open) {
        conn.send({ type: 'click' });
    }
    
    // Provide some haptic feedback if available
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}
