console.log(
  "RAW localStorage choixEssais :",
  localStorage.getItem("choixEssais")
);

console.log("admin.js chargé");

/* =========================
   0. FONCTIONS DE VALIDATION
========================= */

// Validation coordonnées GPS
function validerGPS(coords) {
  if (!coords || coords.trim() === "") return true; // Optionnel
  
  // Format attendu: "latitude, longitude" (ex: "48.8566, 2.3522")
  const regex = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
  if (!regex.test(coords)) {
    return false;
  }
  
  const [lat, lon] = coords.split(',').map(s => parseFloat(s.trim()));
  
  // Vérifier les limites de latitude (-90 à 90) et longitude (-180 à 180)
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return false;
  }
  
  return true;
}

// Validation email
function validerEmail(email) {
  if (!email || email.trim() === "") return true; // Optionnel
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validation téléphone (format français)
function validerTelephone(tel) {
  if (!tel || tel.trim() === "") return true; // Optionnel
  
  // Accepte : 0612345678, 06 12 34 56 78, 06.12.34.56.78, +33612345678
  const regex = /^(\+33|0)[1-9](\d{2}){4}$|^(\+33|0)[1-9](\s?\d{2}){4}$|^(\+33|0)[1-9](\.?\d{2}){4}$/;
  return regex.test(tel.replace(/\s/g, ''));
}

// Validation code GDO (format numérique généralement)
function validerCodeGDO(code) {
  if (!code || code.trim() === "") return false; // Obligatoire
  return /^[A-Z0-9\-_]+$/i.test(code);
}

/* =========================
   0.5 Initialiser la sauvegarde automatique
========================= */
if (window.autoSave) {
  window.autoSave.init();
}

// Bouton Sauvegarder et quitter
document.getElementById("btnSauvegarderQuitter").addEventListener("click", () => {
  if (window.autoSave) {
    window.autoSave.saveAndQuit();
  }
});

/* =========================
   1. Sécurité / session
========================= */

const session = JSON.parse(localStorage.getItem("choixEssais"));
const DUREE_MAX_SESSION = 2 * 60 * 60 * 1000; // 2 heures

if (!session) {
  alert("Aucune session active. Merci de commencer l'essai depuis l'accueil.");
  window.location.href = "index.html";
} else {
  const ageSession = Date.now() - session.createdAt;

  if (ageSession > DUREE_MAX_SESSION) {
    alert("Session expirée. Merci de recommencer l'essai.");
    localStorage.removeItem("choixEssais");
    window.location.href = "index.html";
  }
}

/* =========================
   2. Affichage du récap écran 2
========================= */

document.getElementById("recapMotif").textContent = session.motif;
document.getElementById("recapProtection").textContent = session.protection;
document.getElementById("recapCoffret").textContent = session.coffret;

console.log("Choix récupérés :", session);

/* =========================
   2.1. Grisage champ client selon présence
========================= */

function updatePresenceClient() {
  const presenceClient = document.getElementById("presenceClient").value;
  const fieldNomInterClient = document.getElementById("fieldNomInterClient");
  const inputNomInterClient = document.getElementById("NomInterClient");
  
  if (presenceClient === "NON") {
    // Griser le champ
    inputNomInterClient.disabled = true;
    inputNomInterClient.value = "";
    inputNomInterClient.placeholder = "Sans objet (client absent)";
    fieldNomInterClient.style.opacity = "0.4";
    fieldNomInterClient.style.pointerEvents = "none";
  } else {
    // Activer le champ
    inputNomInterClient.disabled = false;
    inputNomInterClient.placeholder = "Nom et prénom du représentant client";
    fieldNomInterClient.style.opacity = "1";
    fieldNomInterClient.style.pointerEvents = "auto";
  }
}

// Appliquer au chargement et au changement
document.getElementById("presenceClient").addEventListener("change", updatePresenceClient);
updatePresenceClient(); // état initial

/* =========================
   2.5. Pré-remplissage du profil technicien
========================= */

// Pré-remplir les champs si un profil existe
if (window.profilTechnicien && window.profilTechnicien.hasProfil()) {
  window.profilTechnicien.fillForm({
    nomTechnicien: document.getElementById("NomTechEnedis"),
    baseEnedis: document.getElementById("baseEnedis")
  });
  
  console.log("Profil technicien pré-rempli");
}

/* =========================
   2.6. Géolocalisation automatique
========================= */

const btnGeolocalisation = document.getElementById("btnGeolocalisation");
const champGPS = document.getElementById("GPS");
const gpsStatus = document.getElementById("gpsStatus");

btnGeolocalisation.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("La géolocalisation n'est pas supportée par votre navigateur.");
    return;
  }

  // Afficher le statut
  gpsStatus.style.display = "block";
  gpsStatus.textContent = "📡 Recherche de votre position...";
  gpsStatus.style.color = "#0063AF";
  
  btnGeolocalisation.disabled = true;
  btnGeolocalisation.textContent = "⏳";

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const latitude = position.coords.latitude.toFixed(6);
      const longitude = position.coords.longitude.toFixed(6);
      
      champGPS.value = `${latitude}, ${longitude}`;
      
      gpsStatus.textContent = `✓ Position obtenue (précision: ${Math.round(position.coords.accuracy)}m)`;
      gpsStatus.style.color = "#5bc500";
      
      console.log("Géolocalisation réussie:", latitude, longitude);
      
      // GÉOCODAGE INVERSÉ : Obtenir l'adresse depuis les coordonnées GPS
      try {
        gpsStatus.textContent = "🔍 Recherche de l'adresse...";
        gpsStatus.style.color = "#0063AF";
        
        // API Adresse du gouvernement français (gratuite, sans clé)
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/reverse/?lon=${longitude}&lat=${latitude}`
        );
        
        if (!response.ok) throw new Error("Erreur API");
        
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const adresse = data.features[0].properties;
          
          // Pré-remplir les champs
          if (adresse.postcode) {
            document.getElementById("CodePostal").value = adresse.postcode;
          }
          if (adresse.city) {
            document.getElementById("Commune").value = adresse.city;
          }
          if (adresse.name) {
            // L'adresse complète (numéro + rue)
            document.getElementById("Adresse").value = adresse.name;
          } else if (adresse.street) {
            // Fallback : juste la rue
            document.getElementById("Adresse").value = adresse.street;
          }
          
          gpsStatus.textContent = `✓ Adresse trouvée : ${adresse.city || ''} ${adresse.postcode || ''}`;
          gpsStatus.style.color = "#5bc500";
          
          console.log("Adresse trouvée:", adresse);
        } else {
          // Pas d'adresse trouvée, mais GPS OK
          gpsStatus.textContent = "✓ Position obtenue (adresse non trouvée, saisissez manuellement)";
          gpsStatus.style.color = "#ff9800";
        }
      } catch (error) {
        console.error("Erreur géocodage inversé:", error);
        // Ne pas bloquer si le géocodage échoue
        gpsStatus.textContent = "✓ Position obtenue (remplissez l'adresse manuellement)";
        gpsStatus.style.color = "#ff9800";
      }
      
      btnGeolocalisation.disabled = false;
      btnGeolocalisation.textContent = "📍 GPS";
      
      setTimeout(() => {
        gpsStatus.style.display = "none";
      }, 8000);
    },
    (error) => {
      let message = "Erreur de géolocalisation";
      
      switch(error.code) {
        case error.PERMISSION_DENIED:
          message = "❌ Permission refusée. Autorisez la géolocalisation dans les paramètres.";
          break;
        case error.POSITION_UNAVAILABLE:
          message = "❌ Position indisponible. Vérifiez votre connexion GPS.";
          break;
        case error.TIMEOUT:
          message = "❌ Délai expiré. Réessayez.";
          break;
      }
      
      gpsStatus.textContent = message;
      gpsStatus.style.color = "#d32f2f";
      
      btnGeolocalisation.disabled = false;
      btnGeolocalisation.textContent = "📍 GPS";
      
      console.error("Erreur géolocalisation:", error);
      
      setTimeout(() => {
        gpsStatus.style.display = "none";
      }, 8000);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
});

/* =========================
   2.7. Gestion du modal profil
========================= */
const modalProfil = document.getElementById("modalProfil");
const btnGererProfil = document.getElementById("btnGererProfil");
const closeModal = document.getElementById("closeModal");

btnGererProfil.addEventListener("click", () => {
  // Charger le profil existant dans le modal
  if (window.profilTechnicien) {
    const profil = window.profilTechnicien.loadProfil();
    if (profil) {
      document.getElementById("profilNomTechnicien").value = profil.nomTechnicien || "";
      document.getElementById("profilBaseEnedis").value = profil.baseEnedis || "";
      document.getElementById("profilTelephoneTechnicien").value = profil.telephoneTechnicien || "";
    }
  }
  
  modalProfil.style.display = "flex";
});

closeModal.addEventListener("click", () => {
  modalProfil.style.display = "none";
});

// Fermer en cliquant en dehors
window.addEventListener("click", (e) => {
  if (e.target === modalProfil) {
    modalProfil.style.display = "none";
  }
});

// Sauvegarder le profil
document.getElementById("btnSauvegarderProfil").addEventListener("click", () => {
  const profil = {
    nomTechnicien: document.getElementById("profilNomTechnicien").value,
    baseEnedis: document.getElementById("profilBaseEnedis").value,
    telephoneTechnicien: document.getElementById("profilTelephoneTechnicien").value
  };

  if (!profil.nomTechnicien || !profil.baseEnedis) {
    alert("Veuillez remplir au minimum le nom et la base Enedis.");
    return;
  }
  
  // Valider le téléphone si rempli
  if (profil.telephoneTechnicien && !validerTelephone(profil.telephoneTechnicien)) {
    alert("❌ Numéro de téléphone invalide.\n\nFormats acceptés :\n• 0612345678\n• 06 12 34 56 78\n• 06.12.34.56.78\n• +33612345678");
    return;
  }

  if (window.profilTechnicien) {
    window.profilTechnicien.saveProfil(profil);
    
    // Pré-remplir les champs du formulaire
    document.getElementById("NomTechEnedis").value = profil.nomTechnicien;
    document.getElementById("baseEnedis").value = profil.baseEnedis;
    
    alert("Profil sauvegardé avec succès !");
    modalProfil.style.display = "none";
  }
});

// Supprimer le profil
document.getElementById("btnSupprimerProfil").addEventListener("click", () => {
  if (confirm("Êtes-vous sûr de vouloir supprimer votre profil ?")) {
    if (window.profilTechnicien) {
      window.profilTechnicien.clearProfil();
      
      // Vider les champs du modal
      document.getElementById("profilNomTechnicien").value = "";
      document.getElementById("profilBaseEnedis").value = "";
      document.getElementById("profilTelephoneTechnicien").value = "";
      
      alert("Profil supprimé.");
      modalProfil.style.display = "none";
    }
  }
});

/* =========================
   3. Bouton Suivant
========================= */

const boutonSuivant = document.getElementById("btnAdminSuivant");

boutonSuivant.addEventListener("click", function () {
  console.log("Bouton suivant cliqué");

  /* ---- VALIDATION DES CHAMPS ---- */
  
  // Récupérer les valeurs pour validation
  const codeGDO = document.getElementById("GDO").value;
  const coordonneesGPS = document.getElementById("GPS").value;
  const coordonneesTel = document.getElementById("CoordonneesTEL").value;
  const nomSite = document.getElementById("NomSite").value;
  
  // Validation Code GDO (obligatoire)
  if (!validerCodeGDO(codeGDO)) {
    alert("❌ Code GDO invalide.\n\nLe code GDO est obligatoire et doit contenir uniquement des lettres, chiffres, tirets ou underscores.");
    document.getElementById("GDO").focus();
    return;
  }
  
  // Validation Nom Site (obligatoire)
  if (!nomSite || nomSite.trim() === "") {
    alert("❌ Le nom du site est obligatoire.");
    document.getElementById("NomSite").focus();
    return;
  }
  
  // Validation GPS (si rempli)
  if (coordonneesGPS && !validerGPS(coordonneesGPS)) {
    alert("❌ Coordonnées GPS invalides.\n\nFormat attendu : latitude, longitude\nExemple : 48.8566, 2.3522");
    document.getElementById("GPS").focus();
    return;
  }
  
  // Validation téléphone (si rempli)
  if (coordonneesTel && !validerTelephone(coordonneesTel)) {
    alert("❌ Numéro de téléphone invalide.\n\nFormats acceptés :\n• 0612345678\n• 06 12 34 56 78\n• 06.12.34.56.78\n• +33612345678");
    document.getElementById("CoordonneesTEL").focus();
    return;
  }

  /* ---- Données administratives ---- */
  const rapportAdmin = {
    // Bloc contrôle
    dateControle: document.getElementById("dateControle").value,
    presenceClient: document.getElementById("presenceClient").value,
    baseEnedis: document.getElementById("baseEnedis").value,
    nomTechEnedis: document.getElementById("NomTechEnedis").value,
    nomInterClient: document.getElementById("NomInterClient").value,

    // Bloc installation
    typeCentrale: document.getElementById("typeCentrale").value,
    nomExploitant: document.getElementById("NomExploitant").value,
    coordonneesTel: document.getElementById("CoordonneesTEL").value,
    nomSite: document.getElementById("NomSite").value,
    codePostal: document.getElementById("CodePostal").value,
    commune: document.getElementById("Commune").value,
    adresse: document.getElementById("Adresse").value,
    adresseComplete: [
      document.getElementById("Adresse").value,
      document.getElementById("CodePostal").value,
      document.getElementById("Commune").value
    ].filter(Boolean).join(", "),
    coordonneesGPS: document.getElementById("GPS").value,
    contrat: document.getElementById("Contrat").value,
    puissanceInstallee: document.getElementById("PuissanceInstall").value,
    posteSource: document.getElementById("PS").value,
    departHTA: document.getElementById("DepHTA").value,
    codeGDO: document.getElementById("GDO").value,
    prm: document.getElementById("PRM").value,

    // Bloc technique
    delaisMaxDecouplage: document.getElementById("delaisDecouplage").value,
    tempsReconfiguration: document.getElementById("tmpReconfiguration").value,
    valeurRepliP0: document.getElementById("valeurP0").value,
    valeurRepliQ0: document.getElementById("valeurQ0").value,

    // Bloc compteur
    typeCompteur: document.getElementById("typeCompteur").value,
    constructeur: document.getElementById("constructeurCompteur").value,
    reference: document.getElementById("referenceCompteur").value,
    numeroSerie: document.getElementById("numSerieCompteur").value,
    typeBoitier: document.getElementById("typeBoitier").value
  };

  console.log("Rapport administratif :", rapportAdmin);

  /* =========================
     4. Fusion avec le rapport existant
  ========================= */

  const rapportExistantJSON = localStorage.getItem("rapportEssais");
  let rapportComplet = {};

  if (rapportExistantJSON) {
    rapportComplet = JSON.parse(rapportExistantJSON);
  }

  // Fusion complete (choix + admin)
  rapportComplet = {
    ...rapportComplet,

    //choix screen 2
    motif: session.motif,
    protection: session.protection,
    coffret: session.coffret,

    // données administratives
    ...rapportAdmin
  };

  localStorage.setItem("rapportEssais", JSON.stringify(rapportComplet));

  console.log("Rapport final sauvegardé :", rapportComplet);

  // window.location.href = "screen_suivant.html";

  window.location.href = "essais.html";
});
