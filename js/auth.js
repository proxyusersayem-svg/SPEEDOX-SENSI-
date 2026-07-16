// Auth Module - Simulated verification & route guarding
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginAlert = document.getElementById('loginAlert');
    const loginBtn = document.getElementById('loginBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            loginBtn.disabled = true;
            loginBtn.textContent = 'Decrypting Secure Signatures...';

            setTimeout(() => {
                // Instantiates terminal simulation access checks
                if (username === 'steven' && password === '1122') {
                    localStorage.setItem('quantum_token', 'session_auth_01A39B');
                    window.location.replace('dashboard.html');
                } else {
                    loginAlert.classList.remove('hidden');
                    loginBtn.disabled = false;
                    loginBtn.textContent = 'Authenticate Key';
                }
            }, 1000);
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('quantum_token');
            window.location.replace('login.html');
        });
    }
});

export function requireAuth() {
    const token = localStorage.getItem('quantum_token');
    if (!token) {
        window.location.replace('login.html');
    }
}
