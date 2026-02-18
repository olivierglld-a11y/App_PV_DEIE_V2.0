/**
 * ============================================================================
 * Mode Sombre - Essais DEIE v1.1
 * Copyright © 2026 Olivier Guillemard - Tous droits réservés
 * ============================================================================
 */

console.log("dark-mode.js chargé");

// Classe pour gérer le mode sombre
class DarkMode {
  constructor() {
    this.STORAGE_KEY = 'darkModeEnabled';
    this.init();
  }

  // Initialiser le mode sombre
  init() {
    // Vérifier la préférence sauvegardée
    const savedPreference = localStorage.getItem(this.STORAGE_KEY);
    
    if (savedPreference !== null) {
      // Appliquer la préférence sauvegardée
      if (savedPreference === 'true') {
        this.enable();
      }
    } else {
      // Sinon, détecter la préférence système
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.enable();
      }
    }

    // Créer le bouton toggle
    this.createToggleButton();

    // Écouter les changements de préférence système
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem(this.STORAGE_KEY) === null) {
          // Seulement si l'utilisateur n'a pas défini de préférence manuelle
          if (e.matches) {
            this.enable();
          } else {
            this.disable();
          }
        }
      });
    }
  }

  // Activer le mode sombre
  enable() {
    document.body.classList.add('dark-mode');
    this.updateToggleButton(true);
  }

  // Désactiver le mode sombre
  disable() {
    document.body.classList.remove('dark-mode');
    this.updateToggleButton(false);
  }

  // Basculer le mode sombre
  toggle() {
    const isEnabled = document.body.classList.contains('dark-mode');
    
    if (isEnabled) {
      this.disable();
      localStorage.setItem(this.STORAGE_KEY, 'false');
    } else {
      this.enable();
      localStorage.setItem(this.STORAGE_KEY, 'true');
    }
  }

  // Créer le bouton de bascule
  createToggleButton() {
    // Vérifier si le bouton existe déjà
    if (document.getElementById('btnDarkMode')) return;

    const button = document.createElement('button');
    button.id = 'btnDarkMode';
    button.setAttribute('aria-label', 'Basculer le mode sombre');
    button.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, #1424DB, #5bc500);
      color: white;
      font-size: 22px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      z-index: 9999;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Icône initiale
    this.updateToggleButton(document.body.classList.contains('dark-mode'), button);

    // Event listener
    button.addEventListener('click', () => this.toggle());

    // Effet hover
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
      button.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
    });

    // Ajouter au body
    document.body.appendChild(button);
  }

  // Mettre à jour l'icône du bouton
  updateToggleButton(isDark, button = null) {
    const btn = button || document.getElementById('btnDarkMode');
    if (!btn) return;

    if (isDark) {
      btn.innerHTML = '☀️'; // Soleil pour désactiver le mode sombre
      btn.title = 'Mode clair';
    } else {
      btn.innerHTML = '🌙'; // Lune pour activer le mode sombre
      btn.title = 'Mode sombre';
    }
  }
}

// Initialiser le mode sombre quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.darkMode = new DarkMode();
  });
} else {
  window.darkMode = new DarkMode();
}
