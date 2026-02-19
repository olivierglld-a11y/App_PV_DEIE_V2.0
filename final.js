/**
 * ============================================================================
 * Application Essais DEIE v1.1
 * Copyright © 2026 Olivier Guillemard - Tous droits réservés
 * Usage interne ENEDIS uniquement - Reproduction interdite
 * ============================================================================
 */

console.log("final.js chargé");

const rapportComplet = JSON.parse(localStorage.getItem("rapportEssais"));
const session = JSON.parse(localStorage.getItem("choixEssais"));
const dataTests = JSON.parse(localStorage.getItem("dataTests"));

if (!rapportComplet || !session || !dataTests) {
  alert("Données manquantes. Retour à l'accueil.");
  window.location.href = "index.html";
}

// Mapping des libellés
const LIBELLES = {
  TSS1: "TSS1 - Centrale indisponible",
  TSS2: "TSS2 - Centrale couplée",
  TELEINFO: "TELEINFO - Compteur TIC",
  TCD1: "TCD/TSD1 - Mise EN/HORS Service RSE",
  TCD2: "TCD/TSD2 - Mise EN/HORS Service TAC",
  TCD3: "TCD/TSD3 - Demande d'effacement d'urgence",
  TCD5: "TCD/TSD5 - Autorisation de couplage",
  TCD6: "TCD/TSD6 - Demande de découplage",
  TCD7: "TCD/TSD7 - TeleValeur Consigne P0",
  TCD8: "TCD/TSD8 - TeleValeur Consigne Q0"
};

// Structure complète des actions et résultats
const STRUCTURE_COMPLETE = {
  TSS1: {
    libelle: "TSS1 - Centrale indisponible",
    cablage: [
      "TSS1 centrale indisponible (F)"
    ],
    actions: [
      {
        description: "Activation Watchdog depuis l'installation",
        resultats: [
          "Reception TS Centrale indisponible (SITR)",
          "Centrale indisponible Debut (Automate client)"
        ]
      },
      {
        description: "Desactivation Watchdog depuis l'installation",
        resultats: [
          "Disparition TS Centrale indisponible (SITR)",
          "Centrale indisponible Fin (Automate client)"
        ]
      }
    ]
  },
  TSS2: {
    libelle: "TSS2 - Centrale couplee",
    cablage: [
      "TSS2 centrale couplee (F)"
    ],
    actions: [
      {
        description: "Decoupage de l'ensemble des generateurs",
        resultats: [
          "Disparition TS Centrale couplee (SITR)",
          "Centrale couplee Debut (Automate client)"
        ]
      },
      {
        description: "Couplage d'au moins un generateur",
        resultats: [
          "Reception TS Centrale Couplee (SITR)",
          "Centrale couplee Fin (Automate client)"
        ]
      }
    ]
  },
  TELEINFO: {
    libelle: "TELEINFO - Compteur TIC",
    cablage: [
      "TIC1 Teleinfo"
    ],
    actions: [
      {
        description: "Lecture TM en local (DEIE/Compteur/Automate producteur) et a distance (SITR)",
        resultats: [
          "Reception TM conforme (SITR)",
          "Reception TM conforme (Installation)"
        ]
      },
      {
        description: "Deconnexion Teleinformation (T>10mn)",
        resultats: [
          "Apparition TS Systeme Defaut Teleinformation (SITR)",
          "Apparition Defaut Teleinformation (Installation)"
        ]
      },
      {
        description: "Reconnexion Teleinformation (T>10mn)",
        resultats: [
          "Disparition TS Systeme Defaut Teleinformation (SITR)",
          "Reception TM conforme (Installation)"
        ]
      }
    ]
  },
  TCD1: {
    libelle: "TCD/TSD1 - Mise EN/HORS Service RSE",
    cablage: [
      "TC (F) Mise EN RSE",
      "TC (O) Mise HORS RSE",
      "TS (F) RSE EN Service",
      "TS (O) RSE HORS Service"
    ],
    actions: [
      {
        description: "Envoi telecommande Mise En Service RSE",
        resultats: [
          "Reception TS RSE En Service (SITR)",
          "Passage de protection de decoupage EN RSE (Installation)"
        ]
      },
      {
        description: "Envoi telecommande Mise Hors Service RSE",
        resultats: [
          "Reception TS RSE Hors Service (SITR)",
          "Passage de protection de decoupage HORS RSE (Installation)"
        ]
      },
      {
        description: "Passage cle RSE en local en position Mise En Service RSE",
        resultats: [
          "Reception TS RSE En Service (SITR)",
          "Passage de protection de decoupage EN ou HORS RSE (Installation)"
        ]
      }
    ]
  },
  TCD2: {
    libelle: "TCD/TSD2 - Mise EN/HORS Service TAC (TeleAction)",
    cablage: [
      "TC (F) Mise EN TAC",
      "TC (O) Mise HORS TAC",
      "TS (F) TAC EN service",
      "TS (O) TAC HORS service"
    ],
    actions: [
      {
        description: "Envoi telecommande Mise En Service TAC",
        resultats: [
          "Reception TS TAC En Service (SITR)",
          "Passage de protection de decoupage TAC en Service (Installation)"
        ]
      },
      {
        description: "Envoi telecommande Mise Hors Service TAC",
        resultats: [
          "Reception TS TAC Hors Service (SITR)",
          "Passage de protection de decoupage TAC HORS Service (Installation)"
        ]
      },
      {
        description: "Deconnexion LS Teleaction",
        resultats: [
          "Reception TS TAC HORS Service (SITR)",
          "Passage de protection de decoupage TAC HORS Service (Installation)"
        ]
      }
    ]
  },
  TCD3: {
    libelle: "TCD/TSD3 - Demande d'effacement d'urgence",
    cablage: [
      "TC (F) TC FIN de demande d'effacement d'urgence",
      "TC (O) TC de demande d'effacement d'urgence",
      "TS (F) FIN de demande d'effacement d'urgence Recu",
      "TS (O) Demande d'effacement d'urgence Recu"
    ],
    actions: [
      {
        description: "Envoi Telecommande Demande d'Effacement depuis SITR (centrale couplee)",
        resultats: [
          "Reception TS Demande d'Effacement d'urgence recue (SITR)",
          "Reception Demande d'Effacement d'urgence (Installation)"
        ]
      },
      {
        description: "Effacement d'Urgence de la Centrale",
        resultats: [
          "Reception TS Centrale Decouplee (SITR)",
          "Decoupage de la Centrale dans un delai < 20s (Installation)"
        ]
      },
      {
        description: "Absence de couplage de la Centrale par automate",
        resultats: [
          "Verification du Non couplage (Installation)"
        ]
      },
      {
        description: "Envoi Telecommande Fin de Demande de Decoupage d'urgence",
        resultats: [
          "Reception TS Fin de Demande d'Effacement d'urgence recue (SITR)",
          "Fin de Demande d'Effacement d'urgence recue (Installation)"
        ]
      },
      {
        description: "Couplage de la centrale par automate",
        resultats: [
          "Reception TS Centrale couplee (SITR)",
          "Couplage de la centrale par automate (Installation)"
        ]
      }
    ]
  },
  TCD5: {
    libelle: "TCD/TSD5 - Autorisation de couplage",
    cablage: [
      "TC (O) TC Autorisation de couplage",
      "TS (F) Attente Autorisation de couplage",
      "TS (O) Autorisation de couplage recue"
    ],
    actions: [
      {
        description: "Simulation manque tension HTA depuis l'installation (protection Decoupage) delai < T2(50s)",
        resultats: [
          "Reception TS Centrale Decouplee (SITR)",
          "Decoupage de la centrale (Installation)"
        ]
      },
      {
        description: "Couplage de la Centrale par automate",
        resultats: [
          "Reception TS Centrale Couplee (SITR)",
          "Verification du bon fonctionnement de l'automate (Installation)"
        ]
      },
      {
        description: "Simulation manque tension HTA depuis l'installation (protection Decoupage) delai > T2(50s)",
        resultats: [
          "Reception TS Centrale Decouplee (SITR)",
          "Decoupage de la centrale (Installation)",
          "Reception TS Attente Autorisation de couplage a T2 - controler temporisation (SITR)",
          "Controler le Non couplage de la centrale a l'echeance du temps de reconfiguration 50s (Installation)"
        ]
      },
      {
        description: "Envoi Telecommande Autorisation de couplage",
        resultats: [
          "Reception TS Couplage autorise (SITR)",
          "Reception couplage autorise automate (Installation)"
        ]
      },
      {
        description: "Couplage de la centrale par automate",
        resultats: [
          "Reception TS Centrale couplee (SITR)",
          "Couplage de la centrale par automate (Installation)"
        ]
      }
    ]
  },
  TCD6: {
    libelle: "TCD/TSD6 - Demande de decoupage",
    cablage: [
      "TC (F) TC Fin de demande de decoupage",
      "TC (O) TC Demande de decoupage",
      "TS (F) Fin de demande de decoupage",
      "TS (O) Demande de decoupage recue"
    ],
    actions: [
      {
        description: "Envoi Telecommande Demande de Decoupage depuis SITR (centrale couplee)",
        resultats: [
          "Reception TS Demande de Decoupage recue (SITR)",
          "Reception Demande de Decoupage (Installation)"
        ]
      },
      {
        description: "Decoupage de la Centrale",
        resultats: [
          "Reception TS Centrale Decouplee (SITR)",
          "Decoupage de la Centrale dans un delai < T1 (Installation)"
        ]
      },
      {
        description: "Absence de couplage de la Centrale par automate",
        resultats: [
          "Verification du Non couplage (Installation)"
        ]
      },
      {
        description: "Envoi Telecommande Fin de Demande de Decoupage",
        resultats: [
          "Reception TS Fin de Demande de Decoupage recue (SITR)",
          "Fin de Demande de Decoupage recue (Installation)"
        ]
      },
      {
        description: "Couplage de la centrale par automate",
        resultats: [
          "Reception TS Centrale couplee (SITR)",
          "Couplage de la centrale par automate (Installation)"
        ]
      }
    ]
  },
  TCD7: {
    libelle: "TCD/TSD7 - TeleValeur de Consigne P0 (Limitation de puissance)",
    cablage: [
      "TC (F) TC Fin de passage a P0",
      "TC (O) TC Passage a P0",
      "TS (F) Fin de passage a P0 debut",
      "TS (O) Passage a P0 recue",
      "TVCP0 Consigne TVC P0"
    ],
    actions: [
      {
        description: "Envoi TeleValeur de Consigne P0 Inferieure a la puissance Active en cours",
        resultats: [
          "Prise en compte de la TVC (SITR)",
          "Reception de la valeur de TVC (Installation)"
        ]
      },
      {
        description: "Telecommande Passage a P0 (activation de la TVC P0)",
        resultats: [
          "Reception TS Demande Passage P0 debut (SITR)",
          "Reception Demande de passage P0 (Installation)",
          "Lectures TM correspondante (SITR)",
          "Passage de la Centrale a une puissance <= TVC (Installation)"
        ]
      },
      {
        description: "Changement TVC P0 (inferieure ou superieure a la precedente)",
        resultats: [
          "Lectures TM correspondante (SITR)",
          "Passage de la Centrale a une puissance <= TVC (Installation)"
        ]
      },
      {
        description: "Deconnexion de la liaison TVC (bornier)",
        resultats: [
          "Passage TM a P0 repli (SITR)",
          "Passage de la Centrale a une puissance <= TM P0 repli (Installation)"
        ]
      },
      {
        description: "Reconnexion de la liaison TVC (bornier)",
        resultats: [
          "Lectures TM correspondante (SITR)",
          "Passage de la Centrale a une puissance <= TVC (Installation)"
        ]
      },
      {
        description: "Telecommande Fin de passage a P0",
        resultats: [
          "Reception TS Fin de Demande Passage P0 recu (SITR)",
          "Reception Demande de Fin de passage P0 (Installation)",
          "Lectures TM correspondante (SITR)",
          "Verification du retour a la puissance initiale (Installation)"
        ]
      }
    ]
  },
  TCD8: {
    libelle: "TCD/TSD8 - TeleValeur de Consigne Q0 (Limitation de puissance reactive)",
    cablage: [
      "TC (F) TC Fin de passage a Q0",
      "TC (O) TC Passage a Q0",
      "TS (F) Fin de passage a Q0 debut",
      "TS (O) Passage a Q0 recue",
      "TVCQ0 Consigne TVC Q0"
    ],
    actions: [
      {
        description: "Envoi TeleValeur de Consigne Q0 Inferieure a la puissance Reactive en cours",
        resultats: [
          "Prise en compte de la TVC (SITR)",
          "Reception de la valeur de TVC (Installation)"
        ]
      },
      {
        description: "Telecommande Passage a Q0 (activation de la TVC Q0)",
        resultats: [
          "Reception TS Demande Passage Q0 debut (SITR)",
          "Reception Demande de passage Q0 (Installation)",
          "Lectures TM correspondante (SITR)",
          "Passage de la Centrale a une puissance <= TVC (Installation)"
        ]
      },
      {
        description: "Changement TVC Q0 (inferieure ou superieure a la precedente)",
        resultats: [
          "Lectures TM correspondante (SITR)",
          "Passage de la Centrale a une puissance <= TVC (Installation)"
        ]
      },
      {
        description: "Deconnexion de la liaison TVC (bornier)",
        resultats: [
          "Passage TM a Q0 repli (SITR)",
          "Passage de la Centrale a une puissance <= TM Q0 repli (Installation)"
        ]
      },
      {
        description: "Reconnexion de la liaison TVC (bornier)",
        resultats: [
          "Lectures TM correspondante (SITR)",
          "Passage de la Centrale a une puissance <= TVC (Installation)"
        ]
      },
      {
        description: "Telecommande Fin de passage a Q0",
        resultats: [
          "Reception TS Fin de Demande Passage Q0 recu (SITR)",
          "Reception Demande de Fin de passage Q0 (Installation)",
          "Lectures TM correspondante (SITR)",
          "Verification du retour a la puissance initiale (Installation)"
        ]
      }
    ]
  }
};

// Bouton Générer PDF
// === HELPERS MODALE PROGRESSION ===
function showProgression(texte, pct) {
  const modal = document.getElementById("modalProgression");
  if (modal) {
    modal.classList.add("actif");
    document.getElementById("progressionTexte").textContent = texte;
    document.getElementById("progressionBarre").style.width = pct + "%";
    document.getElementById("progressionPourcent").textContent = pct + "%";
  }
}
function hideProgression() {
  const modal = document.getElementById("modalProgression");
  if (modal) modal.classList.remove("actif");
}
function showToast(msg) {
  const t = document.getElementById("toastSucces");
  if (t) {
    t.textContent = msg;
    t.classList.add("visible");
    setTimeout(() => t.classList.remove("visible"), 3500);
  }
}
function showErreur(msg) {
  hideProgression();
  const zoneErreur = document.getElementById("zoneErreur");
  const messageErreur = document.getElementById("messageErreur");
  if (zoneErreur) {
    zoneErreur.style.display = "block";
    if (messageErreur) messageErreur.textContent = msg;
  }
  document.getElementById("zoneBoutons").style.display = "none";
}

document.getElementById("btnReessayer")?.addEventListener("click", () => {
  document.getElementById("zoneErreur").style.display = "none";
  document.getElementById("zoneBoutons").style.display = "block";
});

document.getElementById("btnGenererPDF").addEventListener("click", async () => {
  console.log("Génération PDF déclenchée");

  // Vérifier jsPDF
  if (!window.jspdf) {
    showErreur("jsPDF n'est pas chargé. Vérifiez que jspdf.umd.min.js est bien présent dans le repository GitHub.");
    return;
  }

  showProgression("Initialisation...", 5);
  await new Promise(r => setTimeout(r, 80));

  try {
    showProgression("Préparation des données...", 20);
    await new Promise(r => setTimeout(r, 80));

    showProgression("Construction du document...", 45);
    await new Promise(r => setTimeout(r, 80));

    genererPDF();

    showProgression("Finalisation du PDF...", 85);
    await new Promise(r => setTimeout(r, 150));

    showProgression("Téléchargement...", 100);
    await new Promise(r => setTimeout(r, 200));

    hideProgression();
    showToast("✓ PDF téléchargé avec succès !");

  } catch (err) {
    console.error("Erreur génération PDF:", err);
    showErreur("Erreur lors de la génération : " + err.message + "\n\nVérifiez que jspdf.umd.min.js est bien chargé.");
  }
});

function genererPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let yPos = 20;
  const leftMargin = 15;
  const rightMargin = 195;
  const lineHeight = 6;

  // Fonction helper pour gérer les sauts de page
  function checkPageBreak(requiredSpace = 20) {
    if (yPos > 270 - requiredSpace) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  }

  // Fonction pour ajouter un texte avec retour à la ligne automatique
  function addWrappedText(text, x, maxWidth) {
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach(line => {
      checkPageBreak();
      doc.text(line, x, yPos);
      yPos += lineHeight;
    });
  }

  // ========== PAGE DE GARDE ==========
  doc.setFontSize(20);
  doc.setFont(undefined, "bold");
  doc.text("PROCÈS-VERBAL D'ESSAIS", 105, 60, { align: "center" });
  
  doc.setFontSize(16);
  doc.text("DEIE", 105, 70, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont(undefined, "normal");
  doc.text("Dispositif d'Échange d'Information d'Exploitation", 105, 80, { align: "center" });
  
  yPos = 100;
  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("Configuration de l'essai", leftMargin, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text("• Motif des essais : " + session.motif, leftMargin + 5, yPos);
  yPos += 6;
  doc.text("• Type de protection : " + session.protection, leftMargin + 5, yPos);
  yPos += 6;
  doc.text("• Type de coffret : " + session.coffret, leftMargin + 5, yPos);
  yPos += 10;

  doc.text("Date du contrôle : " + (rapportComplet.dateControle || "___________"), leftMargin, yPos);
  
  // Nouvelle page pour les données administratives
  doc.addPage();
  yPos = 20;

  // ========== BLOC CONTRÔLE ==========
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.setTextColor(20, 36, 219); // Bleu Enedis
  doc.text("BLOC CONTRÔLE", leftMargin, yPos);
  doc.setTextColor(0, 0, 0);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  
  const donneesControle = [
    ["Date du contrôle", rapportComplet.dateControle],
    ["Base Enedis", rapportComplet.baseEnedis],
    ["Nom technicien Enedis", rapportComplet.nomTechEnedis],
    ["Présence du client", rapportComplet.presenceClient],
    ["Nom intervenant client", rapportComplet.nomInterClient]
  ];

  donneesControle.forEach(([label, value]) => {
    doc.setFont(undefined, "bold");
    doc.text(label + " :", leftMargin, yPos);
    doc.setFont(undefined, "normal");
    doc.text(value || "N/A", leftMargin + 60, yPos);
    yPos += lineHeight;
  });

  yPos += 8;

  // ========== INSTALLATION ==========
  checkPageBreak(80);
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.setTextColor(20, 36, 219);
  doc.text("INSTALLATION", leftMargin, yPos);
  doc.setTextColor(0, 0, 0);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");

  const donneesInstallation = [
    ["Type de centrale", rapportComplet.typeCentrale],
    ["Nom exploitant", rapportComplet.nomExploitant],
    ["Coordonnées téléphoniques", rapportComplet.coordonneesTel],
    ["Nom du site", rapportComplet.nomSite],
    ["Adresse", rapportComplet.adresse],
    ["Coordonnées GPS", rapportComplet.coordonneesGPS],
    ["Numéro de contrat", rapportComplet.contrat],
    ["Puissance installée (kW)", rapportComplet.puissanceInstallee],
    ["Poste source", rapportComplet.posteSource],
    ["Départ HTA", rapportComplet.departHTA],
    ["Code GDO", rapportComplet.codeGDO],
    ["PRM", rapportComplet.prm]
  ];

  donneesInstallation.forEach(([label, value]) => {
    checkPageBreak();
    doc.setFont(undefined, "bold");
    doc.text(label + " :", leftMargin, yPos);
    doc.setFont(undefined, "normal");
    doc.text(value || "N/A", leftMargin + 70, yPos);
    yPos += lineHeight;
  });

  yPos += 8;

  // ========== TECHNIQUE ==========
  checkPageBreak(40);
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.setTextColor(20, 36, 219);
  doc.text("TECHNIQUE", leftMargin, yPos);
  doc.setTextColor(0, 0, 0);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");

  const donneesTechniques = [
    ["Délai max de découplage (min)", rapportComplet.delaisMaxDecouplage],
    ["Temps de reconfiguration (s)", rapportComplet.tempsReconfiguration],
    ["Valeur repli P0", rapportComplet.valeurRepliP0],
    ["Valeur repli Q0", rapportComplet.valeurRepliQ0]
  ];

  donneesTechniques.forEach(([label, value]) => {
    checkPageBreak();
    doc.setFont(undefined, "bold");
    doc.text(label + " :", leftMargin, yPos);
    doc.setFont(undefined, "normal");
    doc.text(value || "N/A", leftMargin + 70, yPos);
    yPos += lineHeight;
  });

  yPos += 8;

  // ========== INFOS COMPTEUR ==========
  checkPageBreak(40);
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.setTextColor(20, 36, 219);
  doc.text("INFORMATIONS COMPTEUR", leftMargin, yPos);
  doc.setTextColor(0, 0, 0);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");

  const donneesCompteur = [
    ["Type de compteur", rapportComplet.typeCompteur],
    ["Constructeur", rapportComplet.constructeur],
    ["Référence", rapportComplet.reference],
    ["Numéro de série", rapportComplet.numeroSerie],
    ["Type de boîtier", rapportComplet.typeBoitier]
  ];

  donneesCompteur.forEach(([label, value]) => {
    checkPageBreak();
    doc.setFont(undefined, "bold");
    doc.text(label + " :", leftMargin, yPos);
    doc.setFont(undefined, "normal");
    doc.text(value || "N/A", leftMargin + 50, yPos);
    yPos += lineHeight;
  });

  // ========== DÉTAIL DES TESTS ==========
  doc.addPage();
  yPos = 20;

  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.setTextColor(20, 36, 219);
  doc.text("DÉTAIL DES TESTS", 105, yPos, { align: "center" });
  doc.setTextColor(0, 0, 0);
  yPos += 12;

  const syntheses = rapportComplet.resultatsTests?.syntheses || {};
  const resultatsTests = rapportComplet.resultatsTests || {};
  const fonctionsTestees = dataTests.fonctionsATester || [];

  // Import de la structure des fonctions
  const FONCTIONS_STRUCTURE = {
    TSS1: { libelle: "TSS1 - Centrale indisponible", actions: 2 },
    TSS2: { libelle: "TSS2 - Centrale couplée", actions: 2 },
    TELEINFO: { libelle: "TELEINFO - Compteur TIC", actions: 3 },
    TCD1: { libelle: "TCD/TSD1 - Mise EN/HORS Service RSE", actions: 3 },
    TCD2: { libelle: "TCD/TSD2 - Mise EN/HORS Service TAC", actions: 3 },
    TCD3: { libelle: "TCD/TSD3 - Demande d'effacement d'urgence", actions: 5 },
    TCD5: { libelle: "TCD/TSD5 - Autorisation de couplage", actions: 5 },
    TCD6: { libelle: "TCD/TSD6 - Demande de découplage", actions: 5 },
    TCD7: { libelle: "TCD/TSD7 - TéléValeur Consigne P0", actions: 6 },
    TCD8: { libelle: "TCD/TSD8 - TéléValeur Consigne Q0", actions: 6 }
  };

  fonctionsTestees.forEach((fid, index) => {
    checkPageBreak(30);

    const libelle = LIBELLES[fid] || fid;
    const statut = syntheses[fid] || "N/A";

    // Titre de la fonction
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text((index + 1) + ". " + libelle, leftMargin, yPos);
    yPos += 8;

    // Statut
    doc.setFontSize(10);
    if (statut === "CONFORME") {
      doc.setTextColor(0, 150, 0);
      doc.text("✓ CONFORME", leftMargin + 5, yPos);
    } else {
      doc.setTextColor(200, 0, 0);
      doc.text("✗ NON CONFORME", leftMargin + 5, yPos);
    }
    doc.setTextColor(0, 0, 0);
    yPos += 8;

    // Contrôle câblage (si DEIE)
    if (session.coffret === "DEIE") {
      checkPageBreak(15);
      doc.setFont(undefined, "bold");
      doc.text("Contrôle câblage :", leftMargin + 5, yPos);
      yPos += 6;
      doc.setFont(undefined, "normal");

      // Parcourir les résultats de câblage
      Object.keys(resultatsTests).forEach(key => {
        if (key.startsWith(fid + "_cab_")) {
          const valeur = resultatsTests[key];
          const cableLabel = key.replace(fid + "_cab_", "").replace(/_/g, " ");
          
          checkPageBreak();
          doc.text("  • " + cableLabel + " : ", leftMargin + 10, yPos);
          
          if (valeur === "OK") {
            doc.setTextColor(0, 150, 0);
            doc.text("OK", leftMargin + 80, yPos);
          } else {
            doc.setTextColor(200, 0, 0);
            doc.text("NOK", leftMargin + 80, yPos);
          }
          doc.setTextColor(0, 0, 0);
          yPos += 5;
        }
      });
      yPos += 3;
    }

    // Tests fonctionnels
    checkPageBreak(15);
    doc.setFont(undefined, "bold");
    doc.text("Tests fonctionnels :", leftMargin + 5, yPos);
    yPos += 6;

    // Parcourir les actions
    const nbActions = FONCTIONS_STRUCTURE[fid]?.actions || 0;
    for (let actionNum = 1; actionNum <= nbActions; actionNum++) {
      checkPageBreak(12);
      
      doc.setFont(undefined, "italic");
      doc.text("  Action " + actionNum + " :", leftMargin + 10, yPos);
      yPos += 5;
      doc.setFont(undefined, "normal");

      // Parcourir les résultats de cette action
      Object.keys(resultatsTests).forEach(key => {
        if (key.startsWith(fid + "_action" + actionNum + "_")) {
          const valeur = resultatsTests[key];
          const resLabel = key.replace(fid + "_action" + actionNum + "_", "");
          
          checkPageBreak();
          doc.text("    - " + resLabel + " : ", leftMargin + 15, yPos);
          
          if (valeur === "OK") {
            doc.setTextColor(0, 150, 0);
            doc.text("OK", leftMargin + 85, yPos);
          } else {
            doc.setTextColor(200, 0, 0);
            doc.text("NOK", leftMargin + 85, yPos);
          }
          doc.setTextColor(0, 0, 0);
          yPos += 5;
        }
      });
    }

    yPos += 5;
  });

  // ========== SYNTHÈSE GLOBALE ==========
  checkPageBreak(40);
  yPos += 5;
  
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.setTextColor(20, 36, 219);
  doc.text("SYNTHÈSE GLOBALE", leftMargin, yPos);
  doc.setTextColor(0, 0, 0);
  yPos += 10;

  doc.setFontSize(11);
  if (rapportComplet.syntheseGlobale === "CONFORME") {
    doc.setTextColor(0, 150, 0);
    doc.setFont(undefined, "bold");
    doc.text("✓ L'ensemble des fonctions testées sont CONFORMES", leftMargin, yPos);
  } else {
    doc.setTextColor(200, 0, 0);
    doc.setFont(undefined, "bold");
    doc.text("✗ Installation NON CONFORME", leftMargin, yPos);
    yPos += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "normal");
    if (rapportComplet.fonctionsNOK && rapportComplet.fonctionsNOK.length > 0) {
      doc.text("Fonctions non conformes :", leftMargin, yPos);
      yPos += 6;
      rapportComplet.fonctionsNOK.forEach(f => {
        checkPageBreak();
        doc.text("  • " + f, leftMargin + 5, yPos);
        yPos += 6;
      });
    }
  }
  doc.setTextColor(0, 0, 0);

  // ========== SIGNATURES ==========
  doc.addPage();
  yPos = 20;

  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.setTextColor(20, 36, 219);
  doc.text("SIGNATURES", 105, yPos, { align: "center" });
  doc.setTextColor(0, 0, 0);
  yPos += 15;

  // Signature contrôleur
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("Signature du contrôleur (Enedis)", leftMargin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text("Nom : " + (rapportComplet.nomTechEnedis || "___________________________"), leftMargin, yPos);
  yPos += 6;
  doc.text("Date : " + (rapportComplet.signatureControleur?.date || "___________________________"), leftMargin, yPos);
  yPos += 6;

  if (rapportComplet.signatureControleur?.signature) {
    doc.addImage(rapportComplet.signatureControleur.signature, "PNG", leftMargin, yPos, 80, 30);
    yPos += 35;
  } else {
    yPos += 30;
  }

  yPos += 15;

  // Signature client
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("Signature du contrôlé (Client/Exploitant)", leftMargin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text("Nom : " + (rapportComplet.nomInterClient || rapportComplet.nomExploitant || "___________________________"), leftMargin, yPos);
  yPos += 6;
  doc.text("Date : " + (rapportComplet.signatureClient?.date || "___________________________"), leftMargin, yPos);
  yPos += 6;

  if (rapportComplet.signatureClient?.signature) {
    doc.addImage(rapportComplet.signatureClient.signature, "PNG", leftMargin, yPos, 80, 30);
  }

  // Sauvegarder le PDF
  const nomFichier = "PV_Essais_DEIE_" + (rapportComplet.nomSite || "").replace(/\s/g, "_") + "_" + (rapportComplet.dateControle || "").replace(/\//g, "-") + ".pdf";
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);

  // Afficher le bouton de téléchargement
  document.getElementById("zoneBoutons").style.display = "none";
  document.getElementById("zoneTelechargement").style.display = "block";
  const lienTelecharger = document.getElementById("lienTelecharger");
  lienTelecharger.href = pdfUrl;
  lienTelecharger.download = nomFichier;
  
  // Attacher l'événement email (au cas où il n'était pas attaché avant)
  const btnEmail = document.getElementById("btnEnvoyerEmail");
  if (btnEmail) {
    // Supprimer les anciens événements
    btnEmail.replaceWith(btnEmail.cloneNode(true));
    // Réattacher l'événement
    document.getElementById("btnEnvoyerEmail").addEventListener("click", function() {
      envoyerParEmail();
    });
  }

  console.log("PDF généré avec succès");
}

function genererPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let yPos = 20;
  const leftMargin = 15;
  const pageWidth = 210;
  const contentWidth = 180;
  const lineHeight = 6;
  let numeroPage = 1;

  // Couleurs Enedis
  const bleuEnedis = [20, 36, 219]; // #1424DB
  const vertEnedis = [91, 197, 0];  // #5BC500

  // Fonction pour obtenir le libellé complet des codes
  function getMotifComplet(code) {
    const motifs = {
      "MES": "MISE EN SERVICE",
      "MODIF": "MODIFICATION INSTALLATION",
      "DEP": "DÉPANNAGE"
    };
    return motifs[code] || code;
  }

  // Fonction pour ajouter en-tête et pied de page
  function ajouterEntetePiedPage(premierePage = false) {
    if (!premierePage) {
      // Logo en haut à gauche (petit)
      try {
        const logoImg = document.querySelector('img[src="enedis.png"]');
        if (logoImg && logoImg.complete) {
          doc.addImage(logoImg, 'PNG', leftMargin, 10, 30, 10);
        }
      } catch (e) {
        console.log("Logo non disponible pour l'en-tête");
      }

      // Ligne de séparation en-tête
      doc.setDrawColor(...bleuEnedis);
      doc.setLineWidth(0.5);
      doc.line(leftMargin, 22, pageWidth - leftMargin, 22);
    }

    // Pied de page
    const piedY = 280;
    
    // Ligne de séparation pied de page
    doc.setDrawColor(...bleuEnedis);
    doc.setLineWidth(0.3);
    doc.line(leftMargin, piedY, pageWidth - leftMargin, piedY);

    // Logo en pied de page (très petit)
    try {
      const logoImg = document.querySelector('img[src="enedis.png"]');
      if (logoImg && logoImg.complete) {
        doc.addImage(logoImg, 'PNG', leftMargin, piedY + 2, 15, 5);
      }
    } catch (e) {
      console.log("Logo non disponible pour le pied de page");
    }

    // Numéro de page et texte
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, "normal");
    doc.text("ENEDIS - Proces-Verbal d'Essais DEIE", leftMargin + 20, piedY + 5);
    doc.text(`Page ${numeroPage}`, pageWidth - leftMargin - 15, piedY + 5);
    
    // Copyright watermark
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);
    doc.text("© 2026 Olivier Guillemard - Application Essais DEIE v1.1 - Usage interne ENEDIS", 105, piedY + 9, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    
    numeroPage++;
  }

  // Fonction helper pour gérer les sauts de page - réinitialise la police après saut
  function checkPageBreak(requiredSpace = 20) {
    if (yPos > 260 - requiredSpace) {
      doc.addPage();
      ajouterEntetePiedPage();
      yPos = 30;
      // Réinitialiser la police par défaut après saut de page
      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      doc.setTextColor(0, 0, 0);
      return true;
    }
    return false;
  }

  // Fonction pour dessiner un cadre de bloc avec plus d'espace
  function drawBlockBox(x, y, width, height) {
    doc.setDrawColor(...bleuEnedis);
    doc.setLineWidth(0.5);
    doc.rect(x, y, width, height);
  }

  // Fonction pour titre de bloc avec style Enedis
  function drawBlockTitle(title, yPosition) {
    doc.setFillColor(...bleuEnedis);
    doc.rect(leftMargin, yPosition, contentWidth, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(title, leftMargin + 4, yPosition + 6.5);
    doc.setTextColor(0, 0, 0);
  }

  // ========== PAGE DE GARDE ==========
  
  // Logo principal centré
  try {
    const logoImg = document.querySelector('img[src="enedis.png"]');
    if (logoImg && logoImg.complete) {
      doc.addImage(logoImg, 'PNG', 70, 30, 70, 23);
    }
  } catch (e) {
    // Si le logo n'est pas disponible, afficher le texte
    doc.setFontSize(28);
    doc.setFont(undefined, "bold");
    doc.setTextColor(...bleuEnedis);
    doc.text("ENEDIS", 105, 45, { align: "center" });
  }
  doc.setTextColor(0, 0, 0);

  yPos = 70;
  
  // Bandeau bleu pour le titre principal
  doc.setFillColor(...bleuEnedis);
  doc.rect(0, yPos, pageWidth, 25, 'F');
  
  doc.setFontSize(22);
  doc.setFont(undefined, "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("PROCES-VERBAL D'ESSAIS", 105, yPos + 10, { align: "center" });
  
  doc.setFontSize(18);
  doc.text("DEIE", 105, yPos + 18, { align: "center" });
  doc.setTextColor(0, 0, 0);
  
  yPos += 30;
  doc.setFontSize(11);
  doc.setFont(undefined, "italic");
  doc.setTextColor(80, 80, 80);
  doc.text("Dispositif d'Echange d'Information d'Exploitation", 105, yPos, { align: "center" });
  doc.setTextColor(0, 0, 0);

  // Cadre informations essai avec plus d'espace
  yPos = 115;
  drawBlockBox(leftMargin, yPos, contentWidth, 42);
  drawBlockTitle("CARACTERISTIQUES DE L'ESSAI", yPos);
  yPos += 14;

  doc.setFontSize(10);
  const infoEssai = [
    ["Motif des essais", getMotifComplet(session.motif)],
    ["Type de protection", session.protection],
    ["Type de coffret", session.coffret],
    ["Date du controle", rapportComplet.dateControle || "_______________"]
  ];

  infoEssai.forEach(([label, value]) => {
    doc.setFont(undefined, "bold");
    doc.text(label + " :", leftMargin + 5, yPos);
    doc.setFont(undefined, "normal");
    doc.text(value, leftMargin + 60, yPos);
    yPos += 7;
  });

  // Informations site en bas de page de garde - hauteur dynamique
  yPos = 175;
  
  const infoSite = [
    ["Site", rapportComplet.nomSite || "N/A"],
    ["Code GDO", rapportComplet.codeGDO || "N/A"],
    ["Exploitant", rapportComplet.nomExploitant || "N/A"]
  ];

  // Calculer hauteur nécessaire dynamiquement
  const hauteurSite = 9 + (infoSite.length * 8) + 6;
  drawBlockBox(leftMargin, yPos, contentWidth, hauteurSite);
  drawBlockTitle("IDENTIFICATION DU SITE", yPos);
  yPos += 14;

  infoSite.forEach(([label, value]) => {
    doc.setFont(undefined, "bold");
    doc.text(label + " :", leftMargin + 5, yPos);
    doc.setFont(undefined, "normal");
    const displayValue = String(value).length > 55 ? String(value).substring(0, 55) + "..." : String(value);
    doc.text(displayValue, leftMargin + 35, yPos);
    yPos += 8;
  });

  // Texte de confidentialité
  yPos = 250;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont(undefined, "italic");
  doc.text("Document confidentiel - Usage interne ENEDIS", 105, yPos, { align: "center" });
  doc.setTextColor(0, 0, 0);

  // ========== PARTIE 1 : DONNEES ADMINISTRATIVES ==========
  doc.addPage();
  ajouterEntetePiedPage();
  yPos = 30;

  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.setTextColor(...bleuEnedis);
  doc.text("PARTIE 1 - DONNEES ADMINISTRATIVES ET TECHNIQUES", 105, yPos, { align: "center" });
  doc.setTextColor(0, 0, 0);
  yPos += 12;

  // Ligne de séparation
  doc.setDrawColor(...bleuEnedis);
  doc.setLineWidth(0.8);
  doc.line(leftMargin, yPos, pageWidth - leftMargin, yPos);
  yPos += 10;

  // BLOC CONTROLE - hauteur calculée dynamiquement
  const donneesControle = [
    ["Date du controle", rapportComplet.dateControle],
    ["Base Enedis", rapportComplet.baseEnedis],
    ["Technicien controleur", rapportComplet.nomTechEnedis],
    ["Presence du client", rapportComplet.presenceClient],
    ["Representant du client", rapportComplet.nomInterClient]
  ];
  
  const hauteurControle = 14 + (donneesControle.length * 7) + 8;
  drawBlockBox(leftMargin, yPos, contentWidth, hauteurControle);
  drawBlockTitle("INFORMATIONS DE CONTROLE", yPos);
  yPos += 14;

  doc.setFontSize(9);
  donneesControle.forEach(([label, value]) => {
    doc.setFont(undefined, "bold");
    doc.text(label + " :", leftMargin + 4, yPos);
    doc.setFont(undefined, "normal");
    doc.text(value || "N/A", leftMargin + 75, yPos);
    yPos += 7;
  });

  yPos += 15;

  // BLOC INSTALLATION - hauteur calculée dynamiquement
  checkPageBreak(100);
  
  const donneesInstallation = [
    ["Type de centrale", rapportComplet.typeCentrale],
    ["Exploitant", rapportComplet.nomExploitant],
    ["Telephone", rapportComplet.coordonneesTel],
    ["Denomination du site", rapportComplet.nomSite],
    ["Adresse", rapportComplet.adresse],
    ["Code postal", rapportComplet.codePostal],
    ["Commune", rapportComplet.commune],
    ["Coordonnees GPS", rapportComplet.coordonneesGPS],
    ["Numero de contrat", rapportComplet.contrat],
    ["Puissance installee (kW)", rapportComplet.puissanceInstallee],
    ["Poste source", rapportComplet.posteSource],
    ["Depart HTA", rapportComplet.departHTA],
    ["Code GDO", rapportComplet.codeGDO],
    ["Point de Reference et Mesure", rapportComplet.prm]
  ];

  // Calculer la hauteur nécessaire
  let hauteurInstallation = 14;
  donneesInstallation.forEach(([label, value]) => {
    const displayValue = value || "N/A";
    if (displayValue.length > 55) {
      const lines = doc.splitTextToSize(displayValue, 100);
      hauteurInstallation += (lines.length * 5) + 2;
    } else {
      hauteurInstallation += 7;
    }
  });
  hauteurInstallation += 8; // Marge finale
  
  drawBlockBox(leftMargin, yPos, contentWidth, hauteurInstallation);
  drawBlockTitle("CARACTERISTIQUES DE L'INSTALLATION", yPos);
  yPos += 14;

  donneesInstallation.forEach(([label, value]) => {
    checkPageBreak(8);
    doc.setFont(undefined, "bold");
    doc.text(label + " :", leftMargin + 4, yPos);
    doc.setFont(undefined, "normal");
    const displayValue = value || "N/A";
    if (displayValue.length > 55) {
      const lines = doc.splitTextToSize(displayValue, 100);
      doc.text(lines[0], leftMargin + 75, yPos);
      if (lines.length > 1) {
        yPos += 5;
        doc.text(lines.slice(1).join(" "), leftMargin + 75, yPos);
      }
    } else {
      doc.text(displayValue, leftMargin + 75, yPos);
    }
    yPos += 7;
  });

  yPos += 15;

  // BLOC TECHNIQUE - hauteur calculée dynamiquement
  checkPageBreak(45);
  
  const donneesTechniques = [
    ["Delai max de decoupage (min)", rapportComplet.delaisMaxDecouplage],
    ["Temps de reconfiguration (s)", rapportComplet.tempsReconfiguration],
    ["Valeur de repli P0", rapportComplet.valeurRepliP0],
    ["Valeur de repli Q0", rapportComplet.valeurRepliQ0]
  ];
  
  const hauteurTechnique = 14 + (donneesTechniques.length * 7) + 8;
  drawBlockBox(leftMargin, yPos, contentWidth, hauteurTechnique);
  drawBlockTitle("PARAMETRES TECHNIQUES", yPos);
  yPos += 14;

  donneesTechniques.forEach(([label, value]) => {
    doc.setFont(undefined, "bold");
    doc.text(label + " :", leftMargin + 4, yPos);
    doc.setFont(undefined, "normal");
    doc.text(value || "N/A", leftMargin + 75, yPos);
    yPos += 7;
  });

  yPos += 15;

  // BLOC COMPTEUR - hauteur calculée dynamiquement
  checkPageBreak(50);
  
  const donneesCompteur = [
    ["Type de compteur", rapportComplet.typeCompteur],
    ["Fabricant", rapportComplet.constructeur],
    ["Reference modele", rapportComplet.reference],
    ["Numero de serie", rapportComplet.numeroSerie],
    ["Type de boitier", rapportComplet.typeBoitier]
  ];
  
  const hauteurCompteur = 14 + (donneesCompteur.length * 7) + 8;
  drawBlockBox(leftMargin, yPos, contentWidth, hauteurCompteur);
  drawBlockTitle("EQUIPEMENT DE COMPTAGE", yPos);
  yPos += 14;

  donneesCompteur.forEach(([label, value]) => {
    doc.setFont(undefined, "bold");
    doc.text(label + " :", leftMargin + 4, yPos);
    doc.setFont(undefined, "normal");
    doc.text(value || "N/A", leftMargin + 75, yPos);
    yPos += 7;
  });

  // ========== PARTIE 2 : RESULTATS ET CONCLUSIONS ==========
  doc.addPage();
  ajouterEntetePiedPage();
  yPos = 30;

  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.setTextColor(...bleuEnedis);
  doc.text("PARTIE 2 - RESULTATS ET CONCLUSIONS", 105, yPos, { align: "center" });
  doc.setTextColor(0, 0, 0);
  yPos += 12;

  // Ligne de séparation
  doc.setDrawColor(...bleuEnedis);
  doc.setLineWidth(0.8);
  doc.line(leftMargin, yPos, pageWidth - leftMargin, yPos);
  yPos += 10;

  // SYNTHESE GLOBALE avec encadré coloré
  const syntheseGlobale = rapportComplet.syntheseGlobale;
  // Hauteur dynamique calculée précisément :
  // CONFORME  : bandeau(9) + espace(7) + "INSTALLATION CONFORME"(10) + espace(4) + texte description(7) + marge basse(8) = 45
  // NON CONFORME : bandeau(9) + espace(7) + titre(10) + label(12) + lignes NOK + marge(8)
  const hauteurSynthese = syntheseGlobale === "CONFORME"
    ? 45
    : 9 + 7 + 10 + 12 + (rapportComplet.fonctionsNOK?.length || 0) * 8 + 10;
  
  checkPageBreak(hauteurSynthese + 15);
  drawBlockBox(leftMargin, yPos, contentWidth, hauteurSynthese);
  
  if (syntheseGlobale === "CONFORME") {
    doc.setFillColor(...vertEnedis);
  } else {
    doc.setFillColor(211, 47, 47);
  }
  doc.rect(leftMargin, yPos, contentWidth, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("CONCLUSION GENERALE", leftMargin + 4, yPos + 6.5);
  doc.setTextColor(0, 0, 0);
  
  yPos += 16;

  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  if (syntheseGlobale === "CONFORME") {
    doc.setTextColor(...vertEnedis);
    doc.text("INSTALLATION CONFORME", 105, yPos, { align: "center" });
    yPos += 11;
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.setTextColor(0, 0, 0);
    doc.text("L'ensemble des fonctions testees sont conformes aux exigences.", leftMargin + 4, yPos);
    yPos += 7;
  } else {
    doc.setTextColor(211, 47, 47);
    doc.text("INSTALLATION NON CONFORME", 105, yPos, { align: "center" });
    yPos += 12;
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Fonctions non conformes detectees :", leftMargin + 4, yPos);
    yPos += 7;
    doc.setFont(undefined, "normal");
    if (rapportComplet.fonctionsNOK && rapportComplet.fonctionsNOK.length > 0) {
      rapportComplet.fonctionsNOK.forEach(f => {
        doc.setTextColor(211, 47, 47);
        doc.text("• " + f, leftMargin + 6, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 7;
      });
    }
  }
  doc.setTextColor(0, 0, 0);

  yPos += 12;

  // RECAPITULATIF DES FONCTIONS - hauteur calculée dynamiquement
  checkPageBreak(70);
  const fonctionsTestees = dataTests.fonctionsATester || [];
  const hauteurRecap = 14 + (fonctionsTestees.length * 7) + 8;
  
  drawBlockBox(leftMargin, yPos, contentWidth, hauteurRecap);
  drawBlockTitle("RECAPITULATIF DES FONCTIONS TESTEES", yPos);
  yPos += 14;

  doc.setFontSize(9);
  const syntheses = rapportComplet.resultatsTests?.syntheses || {};
  
  fonctionsTestees.forEach(fid => {
    checkPageBreak(8);
    const libelle = LIBELLES[fid] || fid;
    const statut = syntheses[fid];
    
    doc.setFont(undefined, "normal");
    doc.text(libelle, leftMargin + 4, yPos);
    
    doc.setFont(undefined, "bold");
    if (statut === "CONFORME") {
      doc.setTextColor(...vertEnedis);
      doc.text("CONFORME", leftMargin + 130, yPos);
    } else {
      doc.setTextColor(211, 47, 47);
      doc.text("NON CONFORME", leftMargin + 125, yPos);
    }
    doc.setTextColor(0, 0, 0);
    yPos += 7;
  });

  yPos += 15;

  // SIGNATURES avec cadres plus grands
  checkPageBreak(110);
  
  // Signature Controleur
  drawBlockBox(leftMargin, yPos, contentWidth, 52);
  drawBlockTitle("SIGNATURE DU CONTROLEUR ENEDIS", yPos);
  yPos += 14;

  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text("Nom et prenom :", leftMargin + 4, yPos);
  doc.setFont(undefined, "normal");
  doc.text(rapportComplet.nomTechEnedis || "___________________________", leftMargin + 35, yPos);
  yPos += 8;

  doc.setFont(undefined, "bold");
  doc.text("Date :", leftMargin + 4, yPos);
  doc.setFont(undefined, "normal");
  doc.text(rapportComplet.signatureControleur?.date || "___________________________", leftMargin + 35, yPos);
  yPos += 8;

  doc.setFont(undefined, "bold");
  doc.text("Signature :", leftMargin + 4, yPos);
  if (rapportComplet.signatureControleur?.signature) {
    doc.addImage(rapportComplet.signatureControleur.signature, "PNG", leftMargin + 35, yPos - 5, 70, 25);
  }

  yPos += 35;

  // Signature Client
  checkPageBreak(60);
  drawBlockBox(leftMargin, yPos, contentWidth, 52);
  drawBlockTitle("SIGNATURE DU REPRESENTANT DU PRODUCTEUR", yPos);
  yPos += 14;

  doc.setFont(undefined, "bold");
  doc.text("Nom et prenom :", leftMargin + 4, yPos);
  doc.setFont(undefined, "normal");
  doc.text(rapportComplet.nomInterClient || rapportComplet.nomExploitant || "___________________________", leftMargin + 35, yPos);
  yPos += 8;

  doc.setFont(undefined, "bold");
  doc.text("Date :", leftMargin + 4, yPos);
  doc.setFont(undefined, "normal");
  doc.text(rapportComplet.signatureClient?.date || "___________________________", leftMargin + 35, yPos);
  yPos += 8;

  doc.setFont(undefined, "bold");
  doc.text("Signature :", leftMargin + 4, yPos);
  if (rapportComplet.signatureClient?.signature) {
    doc.addImage(rapportComplet.signatureClient.signature, "PNG", leftMargin + 35, yPos - 5, 70, 25);
  }

  // ========== PARTIE 3 : COMPTE-RENDU DETAILLE DES ESSAIS ==========
  doc.addPage();
  ajouterEntetePiedPage();
  yPos = 30;

  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.setTextColor(...bleuEnedis);
  doc.text("PARTIE 3 - COMPTE-RENDU DETAILLE DES ESSAIS", 105, yPos, { align: "center" });
  doc.setTextColor(0, 0, 0);
  yPos += 12;

  // Ligne de séparation
  doc.setDrawColor(...bleuEnedis);
  doc.setLineWidth(0.8);
  doc.line(leftMargin, yPos, pageWidth - leftMargin, yPos);
  yPos += 10;

  const resultatsTests = rapportComplet.resultatsTests || {};

  fonctionsTestees.forEach((fid, index) => {
    checkPageBreak(45);

    const fonctionData = STRUCTURE_COMPLETE[fid];
    if (!fonctionData) return;

    const statut = syntheses[fid];

    // Titre fonction avec numérotation
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.setTextColor(...bleuEnedis);
    doc.text((index + 1) + ". " + fonctionData.libelle, leftMargin, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 9;

    // Statut global avec badge
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("Resultat : ", leftMargin + 6, yPos);
    if (statut === "CONFORME") {
      doc.setFillColor(...vertEnedis);
      doc.rect(leftMargin + 32, yPos - 4, 28, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text("CONFORME", leftMargin + 34, yPos);
      doc.setTextColor(0, 0, 0);
    } else {
      doc.setFillColor(211, 47, 47);
      doc.rect(leftMargin + 32, yPos - 4, 38, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text("NON CONFORME", leftMargin + 34, yPos);
      doc.setTextColor(0, 0, 0);
    }
    yPos += 11;

    // Controle cablage (si DEIE)
    if (session.coffret === "DEIE" && fonctionData.cablage && fonctionData.cablage.length > 0) {
      checkPageBreak(25);
      
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      doc.setFillColor(240, 240, 240);
      doc.rect(leftMargin + 6, yPos - 4.5, contentWidth - 12, 7, 'F');
      doc.text("Controle cablage", leftMargin + 8, yPos);
      yPos += 9;

      doc.setFontSize(9);
      doc.setFont(undefined, "normal");

      fonctionData.cablage.forEach((cableLabel, idx) => {
        checkPageBreak(6);
        
        let resultat = "N/A";
        Object.keys(resultatsTests).forEach(key => {
          if (key.startsWith(fid + "_cab_")) {
            resultat = resultatsTests[key];
          }
        });

        doc.text("  " + cableLabel, leftMargin + 10, yPos);
        
        doc.setFont(undefined, "bold");
        if (resultat === "OK") {
          doc.setTextColor(...vertEnedis);
          doc.text("OK", leftMargin + 145, yPos);
        } else if (resultat === "NOK") {
          doc.setTextColor(211, 47, 47);
          doc.text("NOK", leftMargin + 145, yPos);
        } else {
          doc.setTextColor(100, 100, 100);
          doc.text("N/A", leftMargin + 145, yPos);
        }
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, "normal");
        yPos += 6;
      });
      yPos += 6;
    }

    // Tests fonctionnels
    checkPageBreak(25);
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.setFillColor(240, 240, 240);
    doc.rect(leftMargin + 6, yPos - 4.5, contentWidth - 12, 7, 'F');
    doc.text("Tests fonctionnels", leftMargin + 8, yPos);
    yPos += 9;

    doc.setFontSize(9);
    
    fonctionData.actions.forEach((action, actionIdx) => {
      // Vérifier saut de page ET réinitialiser la police après
      if (checkPageBreak(18)) {
        doc.setFontSize(9);
        doc.setFont(undefined, "normal");
      }
      
      doc.setFontSize(9);
      doc.setFont(undefined, "bold");
      doc.text("Action " + (actionIdx + 1) + " :", leftMargin + 10, yPos);
      yPos += 6;
      
      doc.setFontSize(9);
      doc.setFont(undefined, "italic");
      const descLines = doc.splitTextToSize(action.description, contentWidth - 25);
      descLines.forEach(line => {
        if (checkPageBreak(5)) {
          doc.setFontSize(9);
          doc.setFont(undefined, "italic");
        }
        doc.text(line, leftMargin + 12, yPos);
        yPos += 5;
      });
      yPos += 2;

      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      
      // Les clés dans resultatsTests sont construites comme : fid_actionId_resId
      // Ex: TSS1_action1_sitr1, TSS1_action1_auto1, TSS1_action1_sitr2, etc.
      // L'ordre des résultats dans action.resultats correspond à l'ordre dans resultatsTests
      
      const actionId = "action" + (actionIdx + 1);
      const actionPrefix = fid + "_" + actionId + "_";
      
      // Récupérer tous les résultats de cette action (sans les commentaires)
      const resultatsDeAction = [];
      Object.keys(resultatsTests).forEach(key => {
        if (key.startsWith(actionPrefix) && !key.startsWith("commentaire_")) {
          resultatsDeAction.push({
            key: key,
            value: resultatsTests[key]
          });
        }
      });
      
      action.resultats.forEach((resLibelle, resIdx) => {
        if (checkPageBreak(6)) {
          doc.setFontSize(9);
          doc.setFont(undefined, "normal");
          doc.setTextColor(0, 0, 0);
        }
        
        // Récupérer le résultat correspondant par index
        let resultat = "N/A";
        if (resultatsDeAction[resIdx]) {
          resultat = resultatsDeAction[resIdx].value;
        }

        const resLines = doc.splitTextToSize("- " + resLibelle, contentWidth - 40);
        resLines.forEach((line, lineIdx) => {
          if (checkPageBreak(5)) {
            doc.setFontSize(9);
            doc.setFont(undefined, "normal");
            doc.setTextColor(0, 0, 0);
          }
          doc.setFontSize(9);
          doc.text(lineIdx === 0 ? line : "  " + line, leftMargin + 14, yPos);
          if (lineIdx === 0) {
            doc.setFont(undefined, "bold");
            if (resultat === "OK") {
              doc.setTextColor(...vertEnedis);
              doc.text("OK", leftMargin + 170, yPos);
            } else if (resultat === "NOK") {
              doc.setTextColor(211, 47, 47);
              doc.text("NOK", leftMargin + 170, yPos);
            } else {
              doc.setTextColor(100, 100, 100);
              doc.text("N/A", leftMargin + 170, yPos);
            }
            doc.setTextColor(0, 0, 0);
            doc.setFont(undefined, "normal");
          }
          yPos += 5;
        });
      });
      
      // AFFICHER LE COMMENTAIRE DE L'ACTION (si présent)
      const commentaireKey = `commentaire_${fid}_action${actionIdx + 1}`;
      const commentaire = resultatsTests[commentaireKey];
      
      if (commentaire && commentaire.trim()) {
        checkPageBreak(10);
        yPos += 2;
        
        doc.setFont(undefined, "bold");
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("Remarque :", leftMargin + 14, yPos);
        yPos += 4;
        
        doc.setFont(undefined, "italic");
        doc.setFontSize(8);
        const commentaireLines = doc.splitTextToSize(commentaire, contentWidth - 30);
        commentaireLines.forEach(line => {
          checkPageBreak(4);
          doc.text(line, leftMargin + 16, yPos);
          yPos += 4;
        });
        
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, "normal");
        doc.setFontSize(9);
        yPos += 2;
      }
      
      yPos += 4;
    });

    yPos += 10;
  });

  // Sauvegarder le PDF
  const codeGDO = (rapportComplet.codeGDO || "").replace(/\s+/g, "_").substring(0, 20);
  const nomSite = (rapportComplet.nomSite || "SiteInconnu").replace(/\s+/g, "_").substring(0, 30);
  const dateControle = (rapportComplet.dateControle || "").replace(/\//g, "-");
  
  const nomFichier = `PV_DEIE_${codeGDO}_${nomSite}_${dateControle}.pdf`;
  
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);

  // Afficher la zone téléchargement
  document.getElementById("zoneBoutons").style.display = "none";
  document.getElementById("zoneTelechargement").style.display = "block";
  const lienTelecharger = document.getElementById("lienTelecharger");
  lienTelecharger.href = pdfUrl;
  lienTelecharger.download = nomFichier;

  // Afficher le nom du fichier dans l'interface
  const nomFichierInfo = document.getElementById("nomFichierInfo");
  if (nomFichierInfo) nomFichierInfo.textContent = nomFichier;
  const nomFichierSuggere = document.getElementById("nomFichierSuggere");
  if (nomFichierSuggere) nomFichierSuggere.textContent = nomFichier;

  console.log("PDF genere avec succes:", nomFichier);

  // Stocker le PDF pour l'envoi email et archivage
  window.pdfGeneratedBlob = pdfBlob;
  window.pdfGeneratedFilename = nomFichier;
  window.currentPdfFilename = nomFichier;
  
  // Télécharger automatiquement sur mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    setTimeout(() => {
      lienTelecharger.click();
      console.log("Téléchargement automatique déclenché");
    }, 300);
  }
  
  // Afficher le bouton SharePoint automatique si configuré
  if (window.sharePointIntegration && window.sharePointIntegration.isConfigured()) {
    document.getElementById("btnUploadSharePoint").style.display = "block";
  }
  
  // Afficher le bouton d'archivage manuel
  const sharepointConfig = localStorage.getItem("sharepointConfig");
  let archivageManuelEnabled = true; // Par défaut activé
  
  if (sharepointConfig) {
    try {
      const config = JSON.parse(sharepointConfig);
      // Désactiver seulement si explicitement false
      archivageManuelEnabled = config.archivageManuelEnabled !== false;
    } catch (e) {
      console.error("Erreur parsing config SharePoint:", e);
    }
  }
  
  // Toujours afficher le bouton (sauf si explicitement désactivé)
  if (archivageManuelEnabled) {
    const btnArchivage = document.getElementById("btnArchivageManuel");
    if (btnArchivage) {
      btnArchivage.style.display = "block";
    }
  }
}

// Bouton Upload SharePoint
document.addEventListener("click", function(e) {
  if (e.target && e.target.id === "btnUploadSharePoint") {
    uploadToSharePoint();
  }
});

async function uploadToSharePoint() {
  if (!window.pdfGeneratedBlob || !window.pdfGeneratedFilename) {
    alert("Veuillez d'abord generer le PDF.");
    return;
  }

  if (!window.sharePointIntegration || !window.sharePointIntegration.isConfigured()) {
    alert("SharePoint n'est pas configure.\n\nVeuillez configurer SharePoint dans les parametres.");
    return;
  }

  const btnUpload = document.getElementById("btnUploadSharePoint");
  const statusEl = document.getElementById("sharePointStatus");
  
  // Désactiver le bouton
  btnUpload.disabled = true;
  btnUpload.textContent = "⏳ Upload en cours...";
  statusEl.textContent = "Upload du PV sur SharePoint...";
  statusEl.style.color = "#0078d4";

  // Préparer les métadonnées
  const metadata = {
    codeGDO: rapportComplet.codeGDO || "",
    nomSite: rapportComplet.nomSite || "",
    dateControle: rapportComplet.dateControle || "",
    technicien: rapportComplet.nomTechEnedis || "",
    conformite: rapportComplet.syntheseGlobale || "",
    protection: session.protection || "",
    motif: session.motif || "",
    baseEnedis: rapportComplet.baseEnedis || ""
  };

  // Upload
  const result = await window.sharePointIntegration.uploadPV(
    window.pdfGeneratedBlob,
    window.pdfGeneratedFilename,
    metadata
  );

  if (result.success) {
    statusEl.textContent = "✓ PV archive avec succes sur SharePoint !";
    statusEl.style.color = "#5bc500";
    
    btnUpload.textContent = "✓ Archive";
    btnUpload.style.backgroundColor = "#5bc500";
    
    // Proposer d'ouvrir sur SharePoint
    setTimeout(() => {
      if (confirm("PV archive avec succes !\n\nVoulez-vous ouvrir le fichier sur SharePoint ?")) {
        window.sharePointIntegration.openInSharePoint(result.fileUrl);
      }
    }, 500);
  } else {
    statusEl.textContent = "❌ Erreur : " + (result.error || "Echec upload");
    statusEl.style.color = "#d32f2f";
    
    btnUpload.disabled = false;
    btnUpload.textContent = "📤 Reessayer";
    
    console.error("Erreur upload SharePoint:", result.error);
  }
}

function envoyerParEmail() {
  if (!window.pdfGeneratedBlob || !window.pdfGeneratedFilename) {
    alert("Veuillez d'abord generer le PDF.");
    return;
  }

  // Récupérer les informations pour le message
  const codeGDO = rapportComplet.codeGDO || "[Code GDO]";
  const nomSite = rapportComplet.nomSite || "[Nom du site]";
  const dateControle = rapportComplet.dateControle || "[Date]";
  const nomTechnicien = rapportComplet.nomTechEnedis || "[Technicien]";
  const baseEnedis = rapportComplet.baseEnedis || "[Base]";
  const syntheseGlobale = rapportComplet.syntheseGlobale || "N/A";
  const protection = session.protection || "";
  const motif = session.motif || "";

  // Construction du corps du message
  const corpsMessage = `Bonjour,

Veuillez trouver ci-joint le Proces-Verbal d'essais DEIE realise.

INFORMATIONS :
- Code GDO : ${codeGDO}
- Site : ${nomSite}
- Date du controle : ${dateControle}
- Motif : ${getMotifComplet(motif)}
- Type de protection : ${protection}
- Technicien Enedis : ${nomTechnicien}
- Base : ${baseEnedis}

RESULTAT : ${syntheseGlobale}

Cordialement,
${nomTechnicien}`;

  const sujet = `PV_DEIE_${codeGDO}_${nomSite}_${dateControle}`;

  // SOLUTION MOBILE : Utiliser Web Share API avec fichier
  if (navigator.share) {
    try {
      // Créer un fichier à partir du blob
      const fichier = new File(
        [window.pdfGeneratedBlob], 
        window.pdfGeneratedFilename, 
        { type: 'application/pdf' }
      );
      
      // Préparer les données de partage
      const shareData = {
        title: sujet,
        text: corpsMessage,
        files: [fichier]
      };

      // Vérifier si le partage de fichiers est supporté
      if (navigator.canShare && navigator.canShare(shareData)) {
        console.log("Partage de fichier supporte - utilisation de Web Share API");
        
        navigator.share(shareData)
          .then(() => {
            console.log('Partage reussi');
          })
          .catch((error) => {
            console.log('Erreur ou annulation du partage:', error);
            if (error.name !== 'AbortError') {
              // Si ce n'est pas une simple annulation, proposer l'alternative
              proposerAlternative(sujet, corpsMessage);
            }
          });
      } else {
        // Web Share API existe mais ne supporte pas les fichiers
        console.log("Web Share API sans support fichiers");
        proposerAlternative(sujet, corpsMessage);
      }
    } catch (error) {
      console.log("Erreur Web Share API:", error);
      proposerAlternative(sujet, corpsMessage);
    }
  } else {
    // Pas de Web Share API
    console.log("Pas de Web Share API");
    proposerAlternative(sujet, corpsMessage);
  }
}

function proposerAlternative(sujet, corpsMessage) {
  // Afficher un message explicatif avec options
  const choix = confirm(
    "ENVOI PAR EMAIL\n\n" +
    "Option 1: Telecharger le PDF puis l'ajouter manuellement a votre email\n" +
    "(Cliquez OK pour cette option)\n\n" +
    "Option 2: Copier le message et envoyer vous-meme\n" +
    "(Cliquez Annuler pour cette option)"
  );

  if (choix) {
    // Option 1 : Télécharger + ouvrir email
    telechargerEtOuvrirEmail(sujet, corpsMessage);
  } else {
    // Option 2 : Copier le message dans le presse-papiers
    copierMessageEtInformer(sujet, corpsMessage);
  }
}

function telechargerEtOuvrirEmail(sujet, corpsMessage) {
  // Télécharger automatiquement le PDF
  const lienTelecharger = document.getElementById("lienTelecharger");
  lienTelecharger.click();
  
  const sujetEncode = encodeURIComponent(sujet);
  
  // Instructions dans le message
  const messageAvecInstructions = 
    corpsMessage + 
    "\n\n--- IMPORTANT ---\n" +
    "Le fichier PDF a ete telecharge automatiquement.\n" +
    "Veuillez l'ajouter en piece jointe a cet email depuis le dossier 'Telechargements' de votre appareil.";
  
  const corpsEncode = encodeURIComponent(messageAvecInstructions);
  const mailtoLink = `mailto:?subject=${sujetEncode}&body=${corpsEncode}`;
  
  // Attendre que le téléchargement démarre
  setTimeout(() => {
    window.location.href = mailtoLink;
    
    setTimeout(() => {
      alert(
        "✓ PDF telecharge avec succes\n\n" +
        "L'application email va s'ouvrir.\n\n" +
        "ETAPES SUIVANTES :\n" +
        "1. Ajoutez le destinataire\n" +
        "2. Cliquez sur l'icone de piece jointe\n" +
        "3. Selectionnez le PDF dans 'Telechargements'\n" +
        "4. Envoyez l'email"
      );
    }, 800);
  }, 300);
}

function copierMessageEtInformer(sujet, corpsMessage) {
  // Construire le message complet
  const messageComplet = `Sujet: ${sujet}\n\n${corpsMessage}\n\n[Ajoutez le PDF en piece jointe]`;
  
  // Télécharger le PDF
  const lienTelecharger = document.getElementById("lienTelecharger");
  lienTelecharger.click();
  
  // Essayer de copier dans le presse-papiers
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(messageComplet)
      .then(() => {
        alert(
          "✓ Message copie dans le presse-papiers\n" +
          "✓ PDF telecharge\n\n" +
          "ETAPES SUIVANTES :\n" +
          "1. Ouvrez votre application email\n" +
          "2. Collez le message (Ctrl+V ou maintenir puis Coller)\n" +
          "3. Ajoutez le PDF depuis Telechargements\n" +
          "4. Envoyez l'email"
        );
      })
      .catch(() => {
        afficherMessageManuel(messageComplet);
      });
  } else {
    afficherMessageManuel(messageComplet);
  }
}

function afficherMessageManuel(messageComplet) {
  // Créer une zone de texte temporaire pour permettre la copie manuelle
  const textarea = document.createElement('textarea');
  textarea.value = messageComplet;
  textarea.style.position = 'fixed';
  textarea.style.left = '50%';
  textarea.style.top = '50%';
  textarea.style.transform = 'translate(-50%, -50%)';
  textarea.style.width = '80%';
  textarea.style.height = '300px';
  textarea.style.zIndex = '10000';
  textarea.style.padding = '10px';
  textarea.style.border = '2px solid #1424DB';
  textarea.style.borderRadius = '8px';
  
  document.body.appendChild(textarea);
  textarea.select();
  
  alert(
    "Le message s'affiche a l'ecran.\n\n" +
    "COPIEZ-LE puis fermez cette fenetre.\n\n" +
    "Le PDF a ete telecharge."
  );
  
  // Nettoyer après 30 secondes
  setTimeout(() => {
    if (document.body.contains(textarea)) {
      document.body.removeChild(textarea);
    }
  }, 30000);
}

// Bouton nouvel essai
document.getElementById("btnNouvelEssai").addEventListener("click", () => {
  if (confirm("Voulez-vous vraiment recommencer un nouvel essai ? Les données actuelles seront perdues.")) {
    // Utiliser la méthode AutoSave pour tout nettoyer y compris les autosaves de formulaires
    if (window.autoSave && typeof AutoSave.clearSession === 'function') {
      AutoSave.clearSession();
    } else {
      // Fallback si AutoSave n'est pas disponible
      localStorage.removeItem("choixEssais");
      localStorage.removeItem("rapportEssais");
      localStorage.removeItem("dataTests");
      localStorage.removeItem("lastAutoSave");
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith("autosaveFormData_")) localStorage.removeItem(key);
      });
    }
    window.location.href = "index.html";
  }
});

/* =========================
   ARCHIVAGE MANUEL SHAREPOINT
========================= */

document.getElementById("btnArchivageManuel")?.addEventListener("click", async () => {
  console.log("Archivage manuel SharePoint déclenché");
  
  // Récupérer la configuration SharePoint
  const sharepointConfig = localStorage.getItem("sharepointConfig");
  let folderUrl = "";
  
  if (sharepointConfig) {
    const config = JSON.parse(sharepointConfig);
    folderUrl = config.folderUrl || "";
  }
  
  // Si pas de config, rediriger vers À propos
  if (!folderUrl || folderUrl.trim() === "") {
    const goAbout = await (window.UX
      ? UX.confirm(
          "Configuration SharePoint manquante.\n\nPour configurer :\n1. Ouvrir Safari → dossier SharePoint\n2. Copier l'URL complète\n3. Coller dans À propos → Lien dossier SharePoint\n4. Sauvegarder",
          "SharePoint non configuré",
          "Aller dans À propos",
          "Annuler"
        )
      : confirm("Configuration SharePoint manquante.\nVoulez-vous aller dans À propos pour configurer ?")
    );
    
    if (goAbout) window.location.href = "about.html";
    return;
  }
  
  console.log("URL dossier SharePoint:", folderUrl);
  
  // Afficher les instructions
  const instructionsDiv = document.getElementById("instructionsArchivageManuel");
  if (instructionsDiv) {
    instructionsDiv.style.display = "block";
    const nomFichierElement = document.getElementById("nomFichierSuggere");
    if (nomFichierElement && window.currentPdfFilename) {
      nomFichierElement.textContent = window.currentPdfFilename;
    }
  }
  
  // Message de confirmation
  const confirmer = await (window.UX
    ? UX.confirm(
        "✅ Le PDF a été téléchargé sur votre appareil\n\nÉtapes :\n1. SharePoint s'ouvre dans votre dossier\n2. Cliquez sur ⊕ ou Charger\n3. Sélectionnez le PDF\n4. Validez l'upload",
        "Archivage Manuel SharePoint",
        "Ouvrir SharePoint",
        "Annuler"
      )
    : confirm("Voulez-vous ouvrir SharePoint pour archiver le PDF ?")
  );
  
  if (confirmer) {
    console.log("Ouverture SharePoint:", folderUrl);
    window.open(folderUrl, '_blank');
    
    if (window.UX) {
      UX.toast("SharePoint ouvert — uploadez le PDF", "info", 5000);
    }
    
    const statusDiv = document.getElementById("sharePointStatus");
    if (statusDiv) {
      statusDiv.style.display = "block";
      statusDiv.style.color = "#1565C0";
      statusDiv.innerHTML = "✓ SharePoint ouvert. Uploadez le PDF dans le dossier.";
    }
  }
});
