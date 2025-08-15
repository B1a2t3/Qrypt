// DOM Elements
const hamburgerMenu = document.querySelector('.hamburger-menu');
const sideMenu = document.querySelector('.side-menu');
const closeMenu = document.querySelector('.close-menu');
const themeToggle = document.querySelector('.switch input');
const pageLoader = document.querySelector('.page-loader');
const installPrompt = document.querySelector('.install-prompt');
const installBtn = document.querySelector('.install-btn');
const cancelInstall = document.querySelector('.cancel-install');

// Page Loader
window.addEventListener('load', () => {
    setTimeout(() => {
        pageLoader.style.display = 'none';
    }, 2000);
});

// Hamburger Menu
hamburgerMenu.addEventListener('click', () => {
    sideMenu.classList.add('active');
});

closeMenu.addEventListener('click', () => {
    sideMenu.classList.remove('active');
});

// Theme Toggle
themeToggle.addEventListener('change', () => {
    document.body.setAttribute('data-theme', themeToggle.checked ? 'dark' : 'light');
    localStorage.setItem('theme', themeToggle.checked ? 'dark' : 'light');
});

// Check for saved theme preference
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    document.body.setAttribute('data-theme', currentTheme);
    themeToggle.checked = currentTheme === 'dark';
}

// QR Code Generator Functionality
function generateQRCode(text) {
    const qrResult = document.getElementById('qr-result');
    qrResult.innerHTML = `
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}" alt="QR Code">
    `;
    
    // Enable download button
    const downloadBtn = document.getElementById('download-btn');
    downloadBtn.onclick = () => {
        const link = document.createElement('a');
        link.href = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(text)}`;
        link.download = 'qrypt-qrcode.png';
        link.click();
    };
    
    // Enable share button
    const shareBtn = document.getElementById('share-btn');
    if (navigator.share) {
        shareBtn.onclick = () => {
            navigator.share({
                title: 'QR Code Generated with Qrypt',
                text: 'Check out this QR code I generated',
                url: window.location.href
            });
        };
    } else {
        shareBtn.style.display = 'none';
    }
}

// QR Code Scanner Functionality
function initQRScanner() {
    const video = document.getElementById('camera-feed');
    const scanResult = document.getElementById('scan-result');
    const copyBtn = document.getElementById('copy-btn');
    const openBtn = document.getElementById('open-btn');
    const shareBtn = document.getElementById('share-btn');
    const flashToggle = document.getElementById('flash-toggle');
    
    let stream = null;
    let scanning = false;
    
    // Camera access
    document.getElementById('scan-btn').addEventListener('click', async () => {
        if (scanning) return;
        
        showAdPopup(async () => {
            try {
                scanning = true;
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        facingMode: 'environment',
                        torch: flashToggle.checked
                    } 
                });
                video.srcObject = stream;
                video.style.display = 'block';
                document.querySelector('.scanner-overlay').style.display = 'block';
                video.play();
                
                // Start scanning loop
                scanQRCode();
            } catch (err) {
                console.error('Error accessing camera:', err);
                alert('Could not access camera. Please check permissions.');
                scanning = false;
            }
        });
    });
    
    // Flash toggle
    flashToggle.addEventListener('change', () => {
        if (stream) {
            const track = stream.getVideoTracks()[0];
            if ('torch' in track) {
                track.applyConstraints({
                    advanced: [{ torch: flashToggle.checked }]
                });
            }
        }
    });
    
    // Image upload
    document.getElementById('upload-btn').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            showAdPopup(() => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        try {
                            const canvas = document.createElement('canvas');
                            canvas.width = img.width;
                            canvas.height = img.height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0);
                            
                            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                            const code = jsQR(imageData.data, imageData.width, imageData.height);
                            
                            if (code) {
                                displayScanResult(code.data);
                            } else {
                                alert('Could not decode QR code. Please try another image.');
                            }
                        } catch (err) {
                            console.error('Error decoding QR:', err);
                            alert('Could not decode QR code. Please try another image.');
                        }
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            });
        }
    });
    
    // Scan loop
    function scanQRCode() {
        if (!video.videoWidth || !video.videoHeight) {
            requestAnimationFrame(scanQRCode);
            return;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (code) {
                displayScanResult(code.data);
                stopScanner();
            } else {
                requestAnimationFrame(scanQRCode);
            }
        } catch (err) {
            console.error('Error scanning:', err);
            requestAnimationFrame(scanQRCode);
        }
    }
    
    function displayScanResult(result) {
        scanResult.textContent = result;
        scanResult.style.display = 'block';
        copyBtn.style.display = 'inline-block';
        openBtn.style.display = 'inline-block';
        shareBtn.style.display = 'inline-block';
        
        // Set up button actions
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(result);
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy Text';
            }, 2000);
        };
        
        if (result.startsWith('http')) {
            openBtn.onclick = () => {
                window.open(result, '_blank');
            };
        } else {
            openBtn.style.display = 'none';
        }
        
        if (navigator.share) {
            shareBtn.onclick = () => {
                navigator.share({
                    title: 'QR Code Scanned with Qrypt',
                    text: 'I scanned this QR code:',
                    url: result
                });
            };
        } else {
            shareBtn.style.display = 'none';
        }
        
        // Save to history
        const history = JSON.parse(localStorage.getItem('qrHistory') || '[]');
        history.push({
            type: 'scanned',
            data: result,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('qrHistory', JSON.stringify(history));
    }
    
    function stopScanner() {
        scanning = false;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
    }
    
    // Clean up when leaving page
    window.addEventListener('beforeunload', stopScanner);
}

// Ad Popup Functionality
function showAdPopup(callback) {
    const adPopup = document.createElement('div');
    adPopup.className = 'ad-popup';
    adPopup.innerHTML = `
        <div class="ad-content">
            <h3>Advertisement</h3>
            <p>Please wait while we load your content...</p>
            <div class="countdown">5</div>
            <button class="skip-ad">Skip Ad</button>
        </div>
    `;
    document.body.appendChild(adPopup);
    
    let count = 5;
    const countdown = adPopup.querySelector('.countdown');
    const timer = setInterval(() => {
        count--;
        countdown.textContent = count;
        if (count <= 0) {
            clearInterval(timer);
            adPopup.remove();
            if (callback) callback();
        }
    }, 1000);
    
    adPopup.querySelector('.skip-ad').addEventListener('click', () => {
        clearInterval(timer);
        adPopup.remove();
        if (callback) callback();
    });
}

// Initialize appropriate functionality for each page
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        document.querySelector('.switch input').checked = true;
    }
    
    // Initialize hamburger menu
    document.querySelector('.hamburger-menu').addEventListener('click', () => {
        document.querySelector('.side-menu').classList.add('active');
    });
    
    document.querySelector('.close-menu').addEventListener('click', () => {
        document.querySelector('.side-menu').classList.remove('active');
    });
    
    // Initialize theme toggle
    document.querySelector('.switch input').addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });
    
    // Initialize PWA install prompt
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        document.querySelector('.install-prompt').style.display = 'flex';
    });
    
    document.querySelector('.install-btn').addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                document.querySelector('.install-prompt').style.display = 'none';
            }
            deferredPrompt = null;
        }
    });
    
    document.querySelector('.cancel-install').addEventListener('click', () => {
        document.querySelector('.install-prompt').style.display = 'none';
    });
    
    // Page-specific initializations
    if (window.location.pathname.includes('generator.html')) {
        document.getElementById('generate-btn').addEventListener('click', () => {
            const text = document.getElementById('qr-input').value.trim();
            if (text) {
                showAdPopup(() => generateQRCode(text));
            } else {
                alert('Please enter some text or a URL first');
            }
        });
    }
    
    if (window.location.pathname.includes('scanner.html')) {
        initQRScanner();
    }
    
    // Initialize FAQ toggles
    if (window.location.pathname.includes('faqs.html')) {
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
                const isOpen = answer.style.maxHeight;
                
                // Close all answers first
                document.querySelectorAll('.faq-answer').forEach(ans => {
                    ans.style.maxHeight = null;
                    ans.style.padding = '0 1rem';
                });
                
                // Toggle the clicked one
                if (!isOpen) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    answer.style.padding = '0 1rem 1rem';
                }
            });
        });
    }
    
    // Initialize history page
    if (window.location.pathname.includes('history.html')) {
        const historyList = document.querySelector('.history-list');
        const clearBtn = document.getElementById('clear-history');
        const filters = document.querySelectorAll('input[name="filter"]');
        
        function loadHistory(filter = 'all') {
            const history = JSON.parse(localStorage.getItem('qrHistory') || '[]');
            historyList.innerHTML = '';
            
            if (history.length === 0) {
                historyList.innerHTML = '<div class="empty-state"><p>Your history is empty. Generate or scan QR codes to see them appear here.</p></div>';
                return;
            }
            
            const filteredHistory = filter === 'all' 
                ? history 
                : history.filter(item => item.type === filter + 'd');
            
            filteredHistory.forEach((item, index) => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.innerHTML = `
                    <div class="item-type ${item.type}">
                        ${item.type === 'generated' ? 'Generated' : 'Scanned'}
                    </div>
                    <div class="item-content">
                        ${item.data.length > 50 ? item.data.substring(0, 50) + '...' : item.data}
                    </div>
                    <div class="item-time">
                        ${new Date(item.timestamp).toLocaleString()}
                    </div>
                    <button class="item-action" data-index="${index}">
                        ${item.type === 'generated' ? 'Regenerate' : 'Rescan'}
                    </button>
                    <button class="item-delete" data-index="${index}">×</button>
                `;
                historyList.appendChild(historyItem);
            });
            
            // Add event listeners to action buttons
            document.querySelectorAll('.item-action').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = e.target.getAttribute('data-index');
                    const history = JSON.parse(localStorage.getItem('qrHistory') || '[]');
                    const item = history[index];
                    
                    if (item.type === 'generated') {
                        window.location.href = `generator.html?text=${encodeURIComponent(item.data)}`;
                    } else {
                        window.location.href = `scanner.html?rescan=${encodeURIComponent(item.data)}`;
                    }
                });
            });
            
            // Add event listeners to delete buttons
            document.querySelectorAll('.item-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = e.target.getAttribute('data-index');
                    const history = JSON.parse(localStorage.getItem('qrHistory') || '[]');
                    history.splice(index, 1);
                    localStorage.setItem('qrHistory', JSON.stringify(history));
                    loadHistory(document.querySelector('input[name="filter"]:checked').value);
                });
            });
        }
        
        // Clear history
        clearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all history?')) {
                localStorage.removeItem('qrHistory');
                loadHistory();
            }
        });
        
        // Filter history
        filters.forEach(filter => {
            filter.addEventListener('change', () => {
                loadHistory(filter.value);
            });
        });
        
        // Initial load
        loadHistory();
    }
});
