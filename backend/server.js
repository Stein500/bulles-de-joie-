// Backend Server - Les Bulles de Joie
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// In-memory database (for demo - use real DB in production)
const users = [
    {
        id: 'CE1-001',
        username: 'CE1-001',
        passwordHash: bcrypt.hashSync('fifame', 10),
        fullName: 'AGBLO AGONDJIHOSSOU Fifamè',
        class: 'CE1',
        role: 'student'
    },
    {
        id: 'CE1-002',
        username: 'CE1-002',
        passwordHash: bcrypt.hashSync('emmanuel', 10),
        fullName: 'AKYOH Emmanuel',
        class: 'CE1',
        role: 'student'
    },
    // Add more users as needed
];

const results = [
    {
        studentId: 'CE1-001',
        trimester: 1,
        average: 14.61,
        rank: 3,
        mention: 'Satisfaisant',
        comment: 'Félicitations pour ton tableau d\'encouragement++.',
        notes: [
            { subject: 'Lecture', score: 19 },
            { subject: 'ES', score: 18.25 },
            { subject: 'EPS', score: 18 },
            { subject: 'Mathématiques', score: 16.75 },
            { subject: 'Ateliers', score: 17 },
            { subject: 'Poésie', score: 15 },
            { subject: 'EA Dessin', score: 12 },
            { subject: 'Anglais', score: 11 },
            { subject: 'Expression Écrite', score: 11 },
            { subject: 'EST', score: 13.75 },
            { subject: 'Dictée', score: 9 }
        ]
    }
];

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token d\'authentification manquant' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'default-secret-change-me', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token invalide ou expiré' });
        }
        req.user = user;
        next();
    });
};

// Routes
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Input validation
        if (!username || !password) {
            return res.status(400).json({ error: 'Identifiants manquants' });
        }
        
        // Find user
        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }
        
        // Verify password
        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id,
                username: user.username,
                role: user.role 
            },
            process.env.JWT_SECRET || 'default-secret-change-me',
            { expiresIn: '1h' }
        );
        
        // Generate refresh token
        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-me',
            { expiresIn: '7d' }
        );
        
        // Remove password hash from response
        const { passwordHash, ...userWithoutPassword } = user;
        
        res.json({
            token,
            refreshToken,
            user: userWithoutPassword,
            expiresIn: 3600
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Refresh token endpoint
app.post('/api/refresh', (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token manquant' });
    }
    
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-me', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Refresh token invalide' });
        }
        
        const dbUser = users.find(u => u.id === user.userId);
        if (!dbUser) {
            return res.status(403).json({ error: 'Utilisateur non trouvé' });
        }
        
        const newToken = jwt.sign(
            { 
                userId: dbUser.id,
                username: dbUser.username,
                role: dbUser.role 
            },
            process.env.JWT_SECRET || 'default-secret-change-me',
            { expiresIn: '1h' }
        );
        
        res.json({ token: newToken });
    });
});

// Get results endpoint
app.get('/api/results', authenticateToken, (req, res) => {
    try {
        const studentId = req.user.userId;
        const trimester = parseInt(req.query.trimester) || 1;
        
        const studentResults = results.filter(r => 
            r.studentId === studentId && r.trimester === trimester
        );
        
        if (studentResults.length === 0) {
            return res.status(404).json({ error: 'Aucun résultat trouvé' });
        }
        
        res.json({
            success: true,
            data: studentResults[0]
        });
        
    } catch (error) {
        console.error('Results error:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Get student profile
app.get('/api/profile', authenticateToken, (req, res) => {
    try {
        const user = users.find(u => u.id === req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        const { passwordHash, ...userWithoutPassword } = user;
        res.json({ success: true, data: userWithoutPassword });
        
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Logout endpoint (client-side only - tokens are stateless)
app.post('/api/logout', authenticateToken, (req, res) => {
    res.json({ success: true, message: 'Déconnexion réussie' });
});

// Analytics endpoint (admin only)
app.get('/api/analytics', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    const analytics = {
        totalStudents: users.filter(u => u.role === 'student').length,
        activeSessions: Math.floor(Math.random() * 50) + 10,
        averageScore: 13.5,
        topPerformer: 'CE1-001'
    };
    
    res.json({ success: true, data: analytics });
});

// Catch-all route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'JSON mal formé' });
    }
    
    res.status(500).json({ 
        error: 'Une erreur est survenue',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
    🚀 Serveur démarré avec succès !
    📍 Port: ${PORT}
    🔒 Mode: ${process.env.NODE_ENV || 'development'}
    🌐 URL: http://localhost:${PORT}
    
    ⚠️  IMPORTANT: En production, configurez:
    1. JWT_SECRET dans .env
    2. Base de données réelle
    3. SSL/TLS certificate
    4. Monitoring et logging
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Arrêt du serveur...');
    process.exit(0);
});

module.exports = app;