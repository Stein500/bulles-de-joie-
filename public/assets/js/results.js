// Results Management System
class ResultsSystem {
    constructor() {
        this.resultsData = null;
        this.chart = null;
        this.init();
    }
    
    init() {
        this.loadResultsData();
        this.setupEventListeners();
        this.updateConnectedUsers();
    }
    
    async loadResultsData() {
        // Mock data - In production, this would come from API
        const user = window.auth?.getCurrentUser();
        
        if (!user) {
            console.error('No user logged in');
            return;
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock results based on student ID
        this.resultsData = this.getMockResults(user.id);
        
        // Update UI with results
        this.updateResultsUI();
        
        // Initialize chart
        this.initChart();
    }
    
    getMockResults(studentId) {
        const resultsDatabase = {
            'CE1-001': {
                name: 'Fifamè AGBLO AGONDJIHOSSOU',
                class: 'CE1',
                average: 14.61,
                rank: 3,
                totalStudents: 10,
                mention: 'Satisfaisant',
                comment: 'Félicitations pour ton tableau d\'encouragement++. Continue tes efforts en dictée et en expression écrite.',
                evolution: '+5.2%',
                trimester: 1,
                notes: [
                    { subject: 'Lecture', score: 19, appreciation: 'Excellent' },
                    { subject: 'ES', score: 18.25, appreciation: 'Excellent' },
                    { subject: 'EPS', score: 18, appreciation: 'Excellent' },
                    { subject: 'Mathématiques', score: 16.75, appreciation: 'Très bien' },
                    { subject: 'Ateliers', score: 17, appreciation: 'Très bien' },
                    { subject: 'Poésie', score: 15, appreciation: 'Bien' },
                    { subject: 'EA Dessin', score: 12, appreciation: 'Passable' },
                    { subject: 'Anglais', score: 11, appreciation: 'Passable' },
                    { subject: 'Expression Écrite', score: 11, appreciation: 'Passable' },
                    { subject: 'EST', score: 13.75, appreciation: 'Bien' },
                    { subject: 'Dictée', score: 9, appreciation: 'À améliorer' }
                ]
            },
            'CE1-002': {
                name: 'Emmanuel AKYOH',
                class: 'CE1',
                average: 10.45,
                rank: 10,
                totalStudents: 10,
                mention: 'À améliorer',
                comment: 'Des efforts sont nécessaires, particulièrement en mathématiques et en dictée. Travail régulier recommandé.',
                evolution: '-2.1%',
                trimester: 1,
                notes: [
                    { subject: 'Ateliers', score: 17, appreciation: 'Très bien' },
                    { subject: 'ES', score: 15.25, appreciation: 'Bien' },
                    { subject: 'EPS', score: 15, appreciation: 'Bien' },
                    { subject: 'Poésie', score: 14, appreciation: 'Bien' },
                    { subject: 'EA Dessin', score: 13, appreciation: 'Passable' },
                    { subject: 'Expression Écrite', score: 10.25, appreciation: 'Passable' },
                    { subject: 'EST', score: 8.25, appreciation: 'À améliorer' },
                    { subject: 'Lecture', score: 7.75, appreciation: 'À améliorer' },
                    { subject: 'Anglais', score: 7.5, appreciation: 'À améliorer' },
                    { subject: 'Mathématiques', score: 5, appreciation: 'Insuffisant' },
                    { subject: 'Dictée', score: 2, appreciation: 'Insuffisant' }
                ]
            },
            // Add more students as needed
        };
        
        return resultsDatabase[studentId] || resultsDatabase['CE1-001'];
    }
    
    updateResultsUI() {
        if (!this.resultsData) return;
        
        const data = this.resultsData;
        
        // Update overview
        this.updateElement('averageScore', `${data.average.toFixed(2)}/20`);
        this.updateElement('studentRank', data.rank);
        this.updateElement('totalStudents', data.totalStudents);
        this.updateElement('studentMention', data.mention);
        this.updateElement('evolution', data.evolution);
        
        // Update comment
        this.updateElement('commentText', data.comment);
        
        // Update notes grid
        this.updateNotesGrid(data.notes);
        
        // Update badges
        this.updateBadges(data);
    }
    
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    updateNotesGrid(notes) {
        const grid = document.getElementById('notesGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note-item';
            noteElement.innerHTML = `
                <div class="note-subject">${note.subject}</div>
                <div class="note-score">${note.score}/20</div>
                <div class="note-badge ${this.getAppreciationClass(note.score)}">
                    ${note.appreciation}
                </div>
            `;
            grid.appendChild(noteElement);
        });
    }
    
    getAppreciationClass(score) {
        if (score >= 16) return 'badge-excellent';
        if (score >= 14) return 'badge-good';
        if (score >= 10) return 'badge-average';
        return 'badge-poor';
    }
    
    updateBadges(data) {
        // Update average badge
        const averageBadge = document.getElementById('averageBadge');
        if (averageBadge) {
            averageBadge.textContent = data.average >= 14 ? '👍 Bon' : 
                                      data.average >= 10 ? '👌 Passable' : '👎 À améliorer';
            averageBadge.className = 'overview-badge ' + this.getAppreciationClass(data.average);
        }
        
        // Update mention color
        const mentionColor = document.getElementById('mentionColor');
        if (mentionColor) {
            mentionColor.textContent = this.getMentionColor(data.mention);
        }
        
        // Update evolution trend
        const evolutionTrend = document.getElementById('evolutionTrend');
        if (evolutionTrend) {
            const isPositive = data.evolution.startsWith('+');
            evolutionTrend.innerHTML = `<i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i> 
                                       ${isPositive ? 'Progression' : 'Régression'}`;
            evolutionTrend.style.color = isPositive ? '#4CAF50' : '#f44336';
        }
    }
    
    getMentionColor(mention) {
        const colors = {
            'Excellent': '#4CAF50',
            'Très bien': '#8BC34A',
            'Bien': '#CDDC39',
            'Satisfaisant': '#FFC107',
            'Passable': '#FF9800',
            'À améliorer': '#FF5722',
            'Insuffisant': '#f44336'
        };
        
        return colors[mention] || '#9E9E9E';
    }
    
    initChart() {
        const ctx = document.getElementById('resultsChart');
        if (!ctx) return;
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        const notes = this.resultsData?.notes || [];
        const categories = this.categorizeNotes(notes);
        
        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Excellent (16-20)', 'Bon (14-15.9)', 'Passable (10-13.9)', 'À améliorer (0-9.9)'],
                datasets: [{
                    data: [
                        categories.excellent,
                        categories.good,
                        categories.average,
                        categories.poor
                    ],
                    backgroundColor: [
                        '#4CAF50',
                        '#8BC34A',
                        '#FFC107',
                        '#FF9800'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.raw} matière(s)`;
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }
    
    categorizeNotes(notes) {
        return {
            excellent: notes.filter(n => n.score >= 16).length,
            good: notes.filter(n => n.score >= 14 && n.score < 16).length,
            average: notes.filter(n => n.score >= 10 && n.score < 14).length,
            poor: notes.filter(n => n.score < 10).length
        };
    }
    
    setupEventListeners() {
        // Trimester filter
        const trimesterFilter = document.getElementById('trimesterFilter');
        if (trimesterFilter) {
            trimesterFilter.addEventListener('change', (e) => {
                this.filterByTrimester(e.target.value);
            });
        }
        
        // Print button
        const printBtn = document.querySelector('[onclick="printResults()"]');
        if (printBtn) {
            printBtn.addEventListener('click', () => this.printResults());
        }
        
        // Export button
        const exportBtn = document.querySelector('[onclick="exportResults()"]');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportResults());
        }
    }
    
    filterByTrimester(trimester) {
        // In production, this would fetch new data from API
        console.log(`Filtering by trimester: ${trimester}`);
        
        // For now, just show a message
        if (trimester !== '1') {
            alert(`Les résultats du trimestre ${trimester} seront disponibles prochainement.`);
        }
    }
    
    printResults() {
        const printContent = document.querySelector('.dashboard').innerHTML;
        const originalContent = document.body.innerHTML;
        
        document.body.innerHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Résultats Scolaires - Les Bulles de Joie</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .print-header { text-align: center; margin-bottom: 30px; }
                    .print-header h1 { color: #FF1493; }
                    .student-info { margin-bottom: 20px; }
                    .notes-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
                    .note-item { border: 1px solid #ddd; padding: 10px; text-align: center; }
                    .signature { margin-top: 50px; text-align: right; }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>Les Bulles de Joie</h1>
                    <h2>Résultats Scolaires - Trimestre 1</h2>
                    <p>Année scolaire 2025-2026</p>
                </div>
                ${printContent}
                <div class="signature">
                    <p>Fait à Parakou, le ${new Date().toLocaleDateString('fr-BJ')}</p>
                    <p>Le Directeur</p>
                    <br><br>
                    <p>_________________________</p>
                </div>
                <button class="no-print" onclick="window.location.reload()">Retour</button>
            </body>
            </html>
        `;
        
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
    }
    
    exportResults() {
        if (!this.resultsData) return;
        
        const data = {
            school: 'Les Bulles de Joie',
            student: this.resultsData.name,
            class: this.resultsData.class,
            trimester: this.resultsData.trimester,
            average: this.resultsData.average,
            mention: this.resultsData.mention,
            notes: this.resultsData.notes,
            exportDate: new Date().toISOString()
        };
        
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `resultats_${this.resultsData.name.replace(/\s+/g, '_')}_T${this.resultsData.trimester}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Résultats exportés avec succès !');
    }
    
    updateConnectedUsers() {
        const connectedElement = document.getElementById('connectedUsers');
        if (!connectedElement) return;
        
        // Simulate random connected users
        const baseUsers = Math.floor(Math.random() * 15) + 10;
        
        // Animate counter
        let current = 0;
        const target = baseUsers;
        const increment = target / 50;
        
        const animate = () => {
            if (current < target) {
                current += increment;
                connectedElement.textContent = Math.floor(current);
                setTimeout(animate, 20);
            } else {
                connectedElement.textContent = target;
            }
        };
        
        animate();
    }
}

// Global functions for inline event handlers
function printResults() {
    if (window.resultsSystem) {
        window.resultsSystem.printResults();
    }
}

function exportResults() {
    if (window.resultsSystem) {
        window.resultsSystem.exportResults();
    }
}

// Initialize results system
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if user is logged in
    const user = window.auth?.getCurrentUser();
    if (user) {
        window.resultsSystem = new ResultsSystem();
    }
});

// Make functions available globally
window.loadResults = function() {
    if (window.resultsSystem) {
        window.resultsSystem.loadResultsData();
    } else {
        window.resultsSystem = new ResultsSystem();
    }
};