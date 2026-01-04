// Authentication System
class AuthSystem {
    constructor() {
        this.apiUrl = 'https://bulles-de-joie-backend.onrender.com/api';
        this.tokenKey = 'bdj_token';
        this.userKey = 'bdj_user';
        this.sessionKey = 'bdj_session';
        this.init();
    }
    
    init() {
        this.checkSession();
        this.setupEventListeners();
        this.setupSecurity();
    }
    
    setupSecurity() {
        // Prevent session hijacking
        this.generateSessionId();
        
        // Setup inactivity logout
        this.setupInactivityTimer();
        
        // Detect multiple tabs
        this.detectMultipleTabs();
    }
    
    generateSessionId() {
        if (!localStorage.getItem(this.sessionKey)) {
            const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem(this.sessionKey, sessionId);
        }
    }
    
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
        }
        
        // Password toggle
        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword) {
            togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        }
        
        // Auto logout on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isAuthenticated()) {
                this.logWarning('Tab switched to background');
            }
        });
    }
    
    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const captchaInput = document.getElementById('captchaInput').value.trim();
        const remember = document.getElementById('remember')?.checked || false;
        
        // Basic validation
        if (!username || !password) {
            this.showError('Veuillez remplir tous les champs');
            return;
        }
        
        // Captcha validation
        if (!this.validateCaptcha(captchaInput)) {
            this.showError('Captcha incorrect');
            this.refreshCaptcha();
            return;
        }
        
        // Show loading
        const loginBtn = document.getElementById('loginBtn');
        const loginText = document.getElementById('loginText');
        const loginSpinner = document.getElementById('loginSpinner');
        
        if (loginBtn) {
            loginBtn.disabled = true;
            if (loginText) loginText.textContent = 'Connexion...';
            if (loginSpinner) loginSpinner.style.display = 'inline-block';
        }
        
        try {
            // In production, this would call the backend API
            // For demo, we'll use mock data
            const user = this.mockLogin(username, password);
            
            if (user) {
                this.setAuth(user, remember);
                this.showSuccess('Connexion réussie !');
                
                // Redirect to results page
                setTimeout(() => {
                    this.showResultsPage();
                }, 1000);
            } else {
                throw new Error('Identifiants incorrects');
            }
        } catch (error) {
            this.showError(error.message);
            this.logFailedAttempt(username);
        } finally {
            if (loginBtn) {
                loginBtn.disabled = false;
                if (loginText) loginText.textContent = 'Se connecter';
                if (loginSpinner) loginSpinner.style.display = 'none';
            }
        }
    }
    
    mockLogin(username, password) {
        // Mock user database
        const users = {
            'CE1-001': { password: 'fifame', name: 'Fifamè', class: 'CE1', id: 'CE1-001' },
            'CE1-002': { password: 'emmanuel', name: 'Emmanuel', class: 'CE1', id: 'CE1-002' },
            'CE1-003': { password: 'yinki', name: 'Yinki', class: 'CE1', id: 'CE1-003' },
            'CE1-004': { password: 'rahama', name: 'Rahama', class: 'CE1', id: 'CE1-004' },
            'CE1-005': { password: 'noham', name: 'Noham', class: 'CE1', id: 'CE1-005' },
            'CE1-006': { password: 'queen', name: 'Queen', class: 'CE1', id: 'CE1-006' },
            'CE1-007': { password: 'mekaddishem', name: 'Mékaddishem', class: 'CE1', id: 'CE1-007' },
            'CE1-008': { password: 'faith', name: 'Faith', class: 'CE1', id: 'CE1-008' },
            'CE1-009': { password: 'peniel', name: 'Péniel', class: 'CE1', id: 'CE1-009' },
            'CE1-010': { password: 'naelle', name: 'Naelle', class: 'CE1', id: 'CE1-010' }
        };
        
        const user = users[username];
        if (user && user.password === password.toLowerCase()) {
            return {
                id: user.id,
                username: username,
                name: user.name,
                class: user.class,
                token: this.generateToken(user),
                expiresIn: 3600 // 1 hour
            };
        }
        
        return null;
    }
    
    generateToken(user) {
        // In production, this would be a real JWT from the server
        const payload = {
            userId: user.id,
            username: user.username,
            class: user.class,
            iat: Date.now(),
            exp: Date.now() + 3600000
        };
        
        return btoa(JSON.stringify(payload));
    }
    
    setAuth(userData, remember = false) {
        // Store token
        if (remember) {
            localStorage.setItem(this.tokenKey, userData.token);
            localStorage.setItem(this.userKey, JSON.stringify(userData));
        } else {
            sessionStorage.setItem(this.tokenKey, userData.token);
            sessionStorage.setItem(this.userKey, JSON.stringify(userData));
        }
        
        // Update UI
        this.updateUI();
        
        // Log successful login
        this.logActivity('LOGIN_SUCCESS', userData.username);
    }
    
    updateUI() {
        const user = this.getCurrentUser();
        
        if (user) {
            // Hide login, show results
            const loginSection = document.getElementById('loginSection');
            const resultsSection = document.getElementById('resultsSection');
            const logoutBtn = document.getElementById('logoutBtn');
            
            if (loginSection) loginSection.style.display = 'none';
            if (resultsSection) resultsSection.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'flex';
            
            // Update user info
            this.updateUserInfo(user);
        }
    }
    
    updateUserInfo(user) {
        const studentName = document.getElementById('studentName');
        const studentClass = document.getElementById('studentClass');
        const studentId = document.getElementById('studentId');
        
        if (studentName) studentName.textContent = user.name;
        if (studentClass) studentClass.textContent = `Classe: ${user.class}`;
        if (studentId) studentId.textContent = user.id;
    }
    
    async handleLogout(e) {
        e?.preventDefault();
        
        const user = this.getCurrentUser();
        if (user) {
            this.logActivity('LOGOUT', user.username);
        }
        
        // Clear storage
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        sessionStorage.removeItem(this.tokenKey);
        sessionStorage.removeItem(this.userKey);
        
        // Redirect to login
        window.location.href = 'resultats.html';
    }
    
    checkSession() {
        const token = this.getToken();
        const user = this.getCurrentUser();
        
        if (token && user) {
            // Check token expiration
            if (this.isTokenExpired(token)) {
                this.handleLogout();
                this.showError('Session expirée. Veuillez vous reconnecter.');
            } else {
                this.updateUI();
            }
        }
    }
    
    getToken() {
        return localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
    }
    
    getCurrentUser() {
        const userStr = localStorage.getItem(this.userKey) || sessionStorage.getItem(this.userKey);
        return userStr ? JSON.parse(userStr) : null;
    }
    
    isAuthenticated() {
        return !!this.getToken() && !this.isTokenExpired(this.getToken());
    }
    
    isTokenExpired(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1] || ''));
            return Date.now() > payload.exp;
        } catch {
            return true;
        }
    }
    
    setupInactivityTimer() {
        let timeout;
        const resetTimer = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (this.isAuthenticated()) {
                    this.showWarning('Session sur le point d\'expirer');
                    
                    // Final warning after 1 minute
                    setTimeout(() => {
                        if (this.isAuthenticated()) {
                            this.handleLogout();
                            this.showError('Session expirée pour cause d\'inactivité');
                        }
                    }, 60000);
                }
            }, 840000); // 14 minutes
        };
        
        // Reset on user activity
        ['click', 'mousemove', 'keypress', 'scroll'].forEach(event => {
            document.addEventListener(event, resetTimer);
        });
        
        resetTimer();
    }
    
    detectMultipleTabs() {
        // Warn if multiple tabs are open
        window.addEventListener('storage', (e) => {
            if (e.key === this.tokenKey && e.newValue && this.isAuthenticated()) {
                this.showWarning('Session détectée sur un autre onglet');
            }
        });
    }
    
    validateCaptcha(input) {
        // Simple captcha validation
        const captchaText = document.getElementById('captchaText')?.textContent;
        if (!captchaText) return true;
        
        const [num1, , num2] = captchaText.split(' ');
        const expected = parseInt(num1) + parseInt(num2);
        
        return parseInt(input) === expected;
    }
    
    refreshCaptcha() {
        const captchaText = document.getElementById('captchaText');
        if (captchaText) {
            const num1 = Math.floor(Math.random() * 10) + 1;
            const num2 = Math.floor(Math.random() * 10) + 1;
            captchaText.textContent = `${num1} + ${num2} = ?`;
        }
    }
    
    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleBtn = document.getElementById('togglePassword');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            passwordInput.type = 'password';
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        }
    }
    
    logFailedAttempt(username) {
        const attempts = parseInt(localStorage.getItem('failed_attempts') || '0') + 1;
        localStorage.setItem('failed_attempts', attempts.toString());
        localStorage.setItem('last_failed_attempt', Date.now().toString());
        
        if (attempts >= 5) {
            const lockUntil = Date.now() + 300000; // 5 minutes
            localStorage.setItem('lock_until', lockUntil.toString());
            this.showError('Trop de tentatives. Réessayez dans 5 minutes.');
        }
        
        this.logActivity('LOGIN_FAILED', username);
    }
    
    logActivity(action, username) {
        const log = {
            action,
            username,
            timestamp: new Date().toISOString(),
            ip: 'secure', // In production, get from server
            userAgent: navigator.userAgent
        };
        
        // Store log
        const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
        logs.push(log);
        
        // Keep only last 100 logs
        if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
        }
        
        localStorage.setItem('security_logs', JSON.stringify(logs));
    }
    
    logWarning(message) {
        console.warn(`[SECURITY] ${message}`);
    }
    
    showResultsPage() {
        // Load results data
        if (typeof window.loadResults === 'function') {
            window.loadResults();
        }
        
        // Smooth scroll to results
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    showError(message) {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, 'error');
        } else {
            alert(message);
        }
    }
    
    showSuccess(message) {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, 'success');
        }
    }
    
    showWarning(message) {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, 'warning');
        }
    }
}

// Initialize auth system
document.addEventListener('DOMContentLoaded', () => {
    window.auth = new AuthSystem();
    
    // Initialize captcha
    if (document.getElementById('captchaText')) {
        window.auth.refreshCaptcha();
    }
});