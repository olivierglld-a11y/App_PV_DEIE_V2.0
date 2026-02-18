/**
 * ============================================================================
 * Application Essais DEIE v1.1
 * Copyright © 2026 Olivier Guillemard - Tous droits réservés
 * Usage interne ENEDIS uniquement - Reproduction interdite
 * ============================================================================
 */

console.log("app.js chargé");

// ========== AVERTISSEMENT COPYRIGHT ==========
console.log(
  "%c⚠️ AVERTISSEMENT COPYRIGHT ⚠️",
  "color: red; font-size: 20px; font-weight: bold;"
);
console.log(
  "%cCette application est protégée par copyright.\n" +
  "© 2026 Olivier Guillemard - Tous droits réservés\n\n" +
  "Usage autorisé : ENEDIS uniquement\n" +
  "Toute copie, modification ou redistribution non autorisée est INTERDITE\n" +
  "et constitue une violation des droits d'auteur.",
  "font-size: 14px; color: #d32f2f;"
);
console.log(
  "%cApplication Essais DEIE v1.1",
  "font-size: 12px; color: #1424DB; font-weight: bold;"
);
// ==============================================

// ---- Enregistrer le Service Worker pour PWA ----
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then((registration) => {
        console.log('Service Worker enregistré avec succès:', registration.scope);
      })
      .catch((error) => {
        console.log('Erreur enregistrement Service Worker:', error);
      });
  });
}

const screenAccueil = document.getElementById("screenAccueil");
const screenChoix = document.getElementById("screenChoix");

const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");

let choix = {
  motif: "",
  protection: "",
  coffret: ""
};

// ---- Vérifier s'il y a une session en cours ----
window.addEventListener("DOMContentLoaded", () => {
  const existingSession = AutoSave.checkForExistingSession();
  
  if (existingSession) {
    // Afficher le message de reprise
    document.getElementById("sessionEnCours").style.display = "block";
    
    const dateSession = new Date(existingSession.timestamp).toLocaleString("fr-FR");
    document.getElementById("sessionInfo").textContent = 
      `Vous avez une session en cours à l'étape : "${existingSession.etape}"\nDernière sauvegarde : ${dateSession}`;
    
    // Bouton reprendre
    document.getElementById("btnReprendre").addEventListener("click", () => {
      window.location.href = existingSession.url;
    });
    
    // Bouton nouvel essai
    document.getElementById("btnNouveauEssai").addEventListener("click", () => {
      if (confirm("Êtes-vous sûr de vouloir recommencer ?\n\nToutes les données de la session en cours seront perdues.")) {
        AutoSave.clearSession();
        document.getElementById("sessionEnCours").style.display = "none";
      }
    });
  }
});

// ---- Navigation Accueil → Choix
startBtn.addEventListener("click", () => {
  screenAccueil.classList.remove("active");
  screenChoix.classList.add("active");
});

// ---- Gestion des boutons de choix
document.querySelectorAll(".choice-btn").forEach(btn => {
  btn.addEventListener("click", () => {

    const group = btn.closest(".choice-group");

    if(!group){
      console.error("ERREUR : .choice-group introuvable pour ce bouton", btn);
      return;
    }
    const type = group.dataset.type;

    if(!type) {
      console.error("ERREUR : data-type manquant sur", group);
      return;
    }

    // reset visuel du groupe
    group.querySelectorAll(".choice-btn")
      .forEach(b => b.classList.remove("active"));

    // activer le bouton cliqué
    btn.classList.add("active");

    // stocker la valeur
    choix[type] = btn.dataset.value;

    console.log("Choix actuel :", choix);

    // activer / désactiver le bouton Suivant
    nextBtn.disabled = !(choix.motif && choix.protection && choix.coffret);
  });
});

nextBtn.addEventListener("click", () => {

  if (!choix.motif || !choix.protection || !choix.coffret) {
    alert("merci de completer tous les choix avant de continuer.");
    return;
  }

  const choixEssais = {
    motif: choix.motif,
    protection: choix.protection,
    coffret: choix.coffret,
    createdAt: Date.now()
  };
  
  // Sauvegarde dans le navigateur
  localStorage.setItem("choixEssais", JSON.stringify(choixEssais));

  console.log("Session verouillée :", choixEssais);

  // Navigation vers admin.html
  window.location.href = "admin.html";
});

