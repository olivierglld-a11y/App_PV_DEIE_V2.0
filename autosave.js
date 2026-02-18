// ========================================
// SYSTÈME DE SAUVEGARDE AUTOMATIQUE
// ========================================

class AutoSave {
  constructor() {
    this.intervalId = null;
    this.SAVE_INTERVAL = 30000; // 30 secondes
    this.INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 heure
    this.lastActivityTime = Date.now();
    this.inactivityTimer = null;
  }

  // Initialiser la sauvegarde automatique
  init() {
    console.log("AutoSave initialisé");
    
    // Sauvegarder toutes les 30 secondes
    this.intervalId = setInterval(() => {
      this.save();
    }, this.SAVE_INTERVAL);

    // Détecter l'activité utilisateur
    this.trackActivity();

    // Vérifier l'inactivité
    this.checkInactivity();
  }

  // Sauvegarder l'état actuel
  save() {
    const timestamp = Date.now();
    
    const saveData = {
      timestamp: timestamp,
      lastActivity: this.lastActivityTime
    };

    localStorage.setItem("lastAutoSave", JSON.stringify(saveData));
    console.log("Sauvegarde automatique effectuée à", new Date(timestamp).toLocaleTimeString());
  }

  // Suivre l'activité utilisateur
  trackActivity() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.lastActivityTime = Date.now();
        
        // Réinitialiser le timer d'inactivité
        if (this.inactivityTimer) {
          clearTimeout(this.inactivityTimer);
        }
        this.checkInactivity();
      });
    });
  }

  // Vérifier l'inactivité
  checkInactivity() {
    this.inactivityTimer = setTimeout(() => {
      const inactivityDuration = Date.now() - this.lastActivityTime;
      
      if (inactivityDuration >= this.INACTIVITY_TIMEOUT) {
        this.handleSessionExpired();
      }
    }, this.INACTIVITY_TIMEOUT);
  }

  // Gérer l'expiration de session
  handleSessionExpired() {
    alert("Session expirée en raison d'inactivité (1 heure).\n\nVous allez être redirigé vers l'accueil.");
    
    // Nettoyer les données
    this.cleanup();
    
    // Rediriger vers l'accueil
    window.location.href = "index.html";
  }

  // Sauvegarder et quitter
  saveAndQuit() {
    this.save();
    
    alert("Progression sauvegardée avec succès.\n\nVous pourrez reprendre ultérieurement.");
    
    // Rediriger vers l'accueil
    window.location.href = "index.html";
  }

  // Vérifier s'il y a une session en cours
  static checkForExistingSession() {
    const choixEssais = localStorage.getItem("choixEssais");
    const rapportEssais = localStorage.getItem("rapportEssais");
    const dataTests = localStorage.getItem("dataTests");
    const lastAutoSave = localStorage.getItem("lastAutoSave");

    if (!choixEssais && !rapportEssais && !dataTests) {
      return null;
    }

    // Vérifier si la session n'est pas expirée
    if (lastAutoSave) {
      const saveData = JSON.parse(lastAutoSave);
      const timeSinceLastActivity = Date.now() - saveData.lastActivity;
      
      if (timeSinceLastActivity > 60 * 60 * 1000) {
        // Session expirée
        AutoSave.clearSession();
        return null;
      }
    }

    // Déterminer l'étape en cours
    let etape = "configuration";
    let url = "index.html";

    if (choixEssais) {
      const session = JSON.parse(choixEssais);
      
      if (!rapportEssais) {
        etape = "données administratives";
        url = "admin.html";
      } else if (!dataTests) {
        etape = "sélection des fonctions";
        url = "essais.html";
      } else {
        const tests = JSON.parse(dataTests);
        const rapport = JSON.parse(rapportEssais);
        
        if (!rapport.signatureControleur) {
          etape = "tests en cours";
          url = "tests.html";
        } else if (!rapport.signatureClient) {
          etape = "signature contrôleur";
          url = "signature-controleur.html";
        } else {
          etape = "signature client";
          url = "signature-client.html";
        }
      }
    }

    return {
      etape: etape,
      url: url,
      timestamp: lastAutoSave ? JSON.parse(lastAutoSave).timestamp : Date.now()
    };
  }

  // Nettoyer la session
  static clearSession() {
    localStorage.removeItem("choixEssais");
    localStorage.removeItem("rapportEssais");
    localStorage.removeItem("dataTests");
    localStorage.removeItem("lastAutoSave");
    console.log("Session nettoyée");
  }

  // Arrêter la sauvegarde automatique
  cleanup() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }
}

// Instance globale
window.autoSave = new AutoSave();
