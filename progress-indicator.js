/**
 * progress-indicator.js
 * Indicateur de progression entre les étapes
 */

console.log("progress-indicator.js chargé");

class ProgressIndicator {
  constructor() {
    this.steps = [
      { id: 'admin', label: 'Admin', page: 'admin.html' },
      { id: 'essais', label: 'Essais', page: 'essais.html' },
      { id: 'tests', label: 'Tests', page: 'tests.html' },
      { id: 'recap', label: 'Recap', page: 'recap.html' },
      { id: 'synthese', label: 'Synthèse', page: 'synthese.html' },
      { id: 'signatures', label: 'Signatures', page: 'signature-controleur.html' },
      { id: 'final', label: 'PDF', page: 'final.html' }
    ];
    
    this.init();
  }

  init() {
    // Créer l'indicateur de progression
    this.createProgressBar();
    
    // Mettre à jour selon la page actuelle
    this.updateProgress();
  }

  getCurrentStep() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Mapper les pages vers les étapes
    const pageToStep = {
      'admin.html': 0,
      'essais.html': 1,
      'tests.html': 2,
      'recap.html': 3,
      'synthese.html': 4,
      'signature-controleur.html': 5,
      'signature-client.html': 5, // Même étape que signatures
      'final.html': 6
    };
    
    return pageToStep[currentPage] !== undefined ? pageToStep[currentPage] : -1;
  }

  createProgressBar() {
    // Vérifier si on est sur une page qui nécessite la progression
    const currentStep = this.getCurrentStep();
    if (currentStep === -1) return;

    // Créer le conteneur
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-indicator';
    progressContainer.id = 'progressIndicator';
    
    // Créer la barre de progression
    const progressTrack = document.createElement('div');
    progressTrack.className = 'progress-track';
    
    // Créer les étapes
    this.steps.forEach((step, index) => {
      const stepElement = document.createElement('div');
      stepElement.className = 'progress-step';
      stepElement.dataset.step = index;
      
      // Numéro de l'étape
      const stepNumber = document.createElement('div');
      stepNumber.className = 'step-number';
      stepNumber.textContent = index + 1;
      
      // Label de l'étape
      const stepLabel = document.createElement('div');
      stepLabel.className = 'step-label';
      stepLabel.textContent = step.label;
      
      stepElement.appendChild(stepNumber);
      stepElement.appendChild(stepLabel);
      progressTrack.appendChild(stepElement);
      
      // Ajouter connecteur sauf pour le dernier
      if (index < this.steps.length - 1) {
        const connector = document.createElement('div');
        connector.className = 'step-connector';
        connector.dataset.connector = index;
        progressTrack.appendChild(connector);
      }
    });
    
    progressContainer.appendChild(progressTrack);
    
    // Insérer après le header
    const header = document.querySelector('.header');
    if (header && header.parentNode) {
      header.parentNode.insertBefore(progressContainer, header.nextSibling);
    }
  }

  updateProgress() {
    const currentStep = this.getCurrentStep();
    if (currentStep === -1) return;

    // Mettre à jour les étapes
    const steps = document.querySelectorAll('.progress-step');
    steps.forEach((step, index) => {
      if (index < currentStep) {
        step.classList.add('completed');
        step.classList.remove('active');
      } else if (index === currentStep) {
        step.classList.add('active');
        step.classList.remove('completed');
      } else {
        step.classList.remove('completed', 'active');
      }
    });

    // Mettre à jour les connecteurs
    const connectors = document.querySelectorAll('.step-connector');
    connectors.forEach((connector, index) => {
      if (index < currentStep) {
        connector.classList.add('completed');
      } else {
        connector.classList.remove('completed');
      }
    });
  }
}

// Initialiser l'indicateur de progression
window.addEventListener('DOMContentLoaded', () => {
  window.progressIndicator = new ProgressIndicator();
});
