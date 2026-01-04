# 🏫 Les Bulles de Joie - Portail Sécurisé

Site web ultra sécurisé pour l'école bilingue "Les Bulles de Joie" à Parakou, Bénin.

## ✨ Fonctionnalités

### 🔐 Sécurité Avancée
- Authentification JWT avec refresh tokens
- Rate limiting et protection contre les attaques
- Headers de sécurité HTTP
- Chiffrement des données sensibles
- Protection CSRF et XSS
- Journalisation des activités

### 📱 Frontend Moderne
- Design responsive et mobile-first
- Animations CSS avancées
- Interface utilisateur intuitive
- PWA (Progressive Web App)
- Mode sombre/clair

### 📊 Gestion des Résultats
- Portail parents sécurisé
- Tableau de bord des résultats
- Graphiques et statistiques
- Export PDF/JSON
- Notifications en temps réel

### 🔧 Backend Robuste
- API REST sécurisée
- Base de données SQLite
- Validation des données
- Gestion des sessions
- Monitoring des performances

## 🚀 Déploiement

### Sur Render (Recommandé)
1. Créez un compte sur [render.com](https://render.com)
2. Créez un nouveau "Web Service"
3. Connectez votre repository GitHub
4. La configuration automatique via `render.yaml` sera détectée
5. Définissez les variables d'environnement

### Sur Vercel
1. Créez un compte sur [vercel.com](https://vercel.com)
2. Importez votre repository GitHub
3. La configuration via `vercel.json` sera utilisée automatiquement

### Variables d'Environnement
```env
NODE_ENV=production
JWT_SECRET=votre_secret_tres_long_et_complexe
JWT_REFRESH_SECRET=un_autre_secret_different
PORT=3000
ALLOWED_ORIGINS=https://votre-domaine.com