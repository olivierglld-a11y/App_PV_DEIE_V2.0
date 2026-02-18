console.log("tests.js chargé");

/* =========================
   SÉCURITÉ / DONNÉES SESSION
========================= */

const session = JSON.parse(localStorage.getItem("choixEssais"));
const dataTests = JSON.parse(localStorage.getItem("dataTests"));

if (!session || !dataTests) {
  alert("Session invalide. Retour à l'accueil.");
  window.location.href = "index.html";
}

const coffret = session.coffret; // DEIE ou eDEIE

/* =========================
   STRUCTURE COMPLÈTE DES FONCTIONS
========================= */

const FONCTIONS_STRUCTURE = {
  TSS1: {
    libelle: "TSS1 - Centrale indisponible",
    cablage: [
      { id: "cab_tss1_f", libelle: "TSS1 centrale indisponible (F)" }
    ],
    actions: [
      {
        id: "action1",
        description: "Activation Watchdog depuis l'installation",
        resultats: [
          { id: "sitr1", libelle: "Résultat attendu SITR : réception TS Centrale indisponible" },
          { id: "auto1", libelle: "Résultat attendu Automate client : centrale indisponible Début" }
        ]
      },
      {
        id: "action2",
        description: "Désactivation Watchdog depuis l'installation",
        resultats: [
          { id: "sitr2", libelle: "Résultat attendu SITR : disparition TS Centrale indisponible" },
          { id: "auto2", libelle: "Résultat attendu Automate client : centrale indisponible Fin" }
        ]
      }
    ]
  },

  TSS2: {
    libelle: "TSS2 - Centrale couplée",
    cablage: [
      { id: "cab_tss2_f", libelle: "TSS2 centrale couplée (F)" }
    ],
    actions: [
      {
        id: "action1",
        description: "Découplage de l'ensemble des générateurs",
        resultats: [
          { id: "sitr1", libelle: "Résultat attendu SITR : disparition TS Centrale couplée" },
          { id: "auto1", libelle: "Résultat attendu Automate client : centrale couplée Début" }
        ]
      },
      {
        id: "action2",
        description: "Couplage d'au moins un générateur",
        resultats: [
          { id: "sitr2", libelle: "Résultat attendu SITR : Réception TS Centrale Couplée" },
          { id: "auto2", libelle: "Résultat attendu Automate client : centrale couplée Fin" }
        ]
      }
    ]
  },

  TELEINFO: {
    libelle: "TELEINFO - Compteur TIC",
    cablage: [
      { id: "cab_tic1", libelle: "TIC1 Téléinfo" }
    ],
    actions: [
      {
        id: "action1",
        description: "Lecture TM en local (DEIE/Compteur/Automate producteur) et à distance (SITR)",
        resultats: [
          { id: "sitr1", libelle: "Résultat attendu SITR : réception TM conforme" },
          { id: "auto1", libelle: "Résultat attendu installation : réception TM conforme" }
        ]
      },
      {
        id: "action2",
        description: "Déconnexion Téléinformation (T>10mn)",
        resultats: [
          { id: "sitr2", libelle: "Résultat attendu SITR : Apparition TS Système \"Défaut Téléinformation\"" },
          { id: "auto2", libelle: "Résultat attendu installation : Apparition \"Défaut Téléinformation\"" }
        ]
      },
      {
        id: "action3",
        description: "Reconnexion Téléinformation (T>10mn)",
        resultats: [
          { id: "sitr3", libelle: "Résultat attendu SITR : Disparition TS Système \"Défaut Téléinformation\"" },
          { id: "auto3", libelle: "Résultat attendu installation : réception TM conforme" }
        ]
      }
    ]
  },

  TCD1: {
    libelle: "TCD/TSD1 - Mise EN/HORS Service RSE",
    cablage: [
      { id: "cab_tc_f", libelle: "TC (F) Mise EN RSE" },
      { id: "cab_tc_o", libelle: "TC (O) Mise HORS RSE" },
      { id: "cab_ts_f", libelle: "TS (F) RSE EN Service" },
      { id: "cab_ts_o", libelle: "TS (O) RSE HORS Service" }
    ],
    actions: [
      {
        id: "action1",
        description: "Envoi télécommande \"Mise En Service RSE\"",
        resultats: [
          { id: "sitr1", libelle: "Résultat attendu SITR : Réception TS \"RSE En Service\"" },
          { id: "auto1", libelle: "Résultat attendu installation client : Passage de protection de découplage EN RSE" }
        ]
      },
      {
        id: "action2",
        description: "Envoi télécommande \"Mise Hors Service RSE\"",
        resultats: [
          { id: "sitr2", libelle: "Résultat attendu SITR : Réception TS \"RSE Hors Service\"" },
          { id: "auto2", libelle: "Résultat attendu installation client : Passage de protection de découplage HORS RSE" }
        ]
      },
      {
        id: "action3",
        description: "Passage clé RSE en local en position \"Mise En Service RSE\"",
        resultats: [
          { id: "sitr3", libelle: "Résultat attendu SITR : Réception TS \"RSE En Service\"" },
          { id: "auto3", libelle: "Résultat attendu installation client : Passage de protection de découplage EN ou HORS RSE" }
        ]
      }
    ]
  },

  TCD2: {
    libelle: "TCD/TSD2 - Mise EN/HORS Service TAC (TéléAction)",
    cablage: [
      { id: "cab_tc_f", libelle: "TC (F) Mise EN TAC" },
      { id: "cab_tc_o", libelle: "TC (O) Mise HORS TAC" },
      { id: "cab_ts_f", libelle: "TS (F) TAC EN service" },
      { id: "cab_ts_o", libelle: "TS (O) TAC HORS service" }
    ],
    actions: [
      {
        id: "action1",
        description: "Envoi télécommande \"Mise En Service TAC\"",
        resultats: [
          { id: "sitr1", libelle: "Résultat attendu SITR : Réception TS \"TAC En Service\"" },
          { id: "auto1", libelle: "Résultat attendu installation client : Passage de protection de découplage TAC en Service" }
        ]
      },
      {
        id: "action2",
        description: "Envoi télécommande \"Mise Hors Service TAC\"",
        resultats: [
          { id: "sitr2", libelle: "Résultat attendu SITR : Réception TS \"TAC Hors Service\"" },
          { id: "auto2", libelle: "Résultat attendu installation client : Passage de protection de découplage TAC HORS Service" }
        ]
      },
      {
        id: "action3",
        description: "Déconnexion LS Téléaction",
        resultats: [
          { id: "sitr3", libelle: "Résultat attendu SITR : Réception TS \"TAC HORS Service\"" },
          { id: "auto3", libelle: "Résultat attendu installation client : Passage de protection de découplage TAC HORS Service" }
        ]
      }
    ]
  },

  TCD3: {
    libelle: "TCD/TSD3 - Demande d'effacement d'urgence",
    cablage: [
      { id: "cab_tc_f", libelle: "TC (F) TC FIN de demande d'effacement d'urgence" },
      { id: "cab_tc_o", libelle: "TC (O) TC de demande d'effacement d'urgence" },
      { id: "cab_ts_f", libelle: "TS (F) FIN de demande d'effacement d'urgence Reçu" },
      { id: "cab_ts_o", libelle: "TS (O) Demande d'effacement d'urgence Reçu" }
    ],
    actions: [
      {
        id: "action1",
        description: "Envoi Télécommande \"Demande d'Effacement\" depuis SITR (la Centrale étant couplée)",
        resultats: [
          { id: "sitr1", libelle: "Résultat attendu SITR : Réception TS \"Demande d'Effacement d'urgence reçue\"" },
          { id: "auto1", libelle: "Résultat attendu installation client : Réception Demande d'Effacement d'urgence" }
        ]
      },
      {
        id: "action2",
        description: "Effacement d'Urgence de la Centrale",
        resultats: [
          { id: "sitr2", libelle: "Résultat attendu SITR : Réception TS \"Centrale Découplée\"" },
          { id: "auto2", libelle: "Résultat attendu installation client : Découplage de la Centrale dans un délai inférieur à 20s" }
        ]
      },
      {
        id: "action3",
        description: "Absence de couplage de la Centrale par automate",
        resultats: [
          { id: "auto3", libelle: "Résultat attendu installation client : Vérification du Non couplage" }
        ]
      },
      {
        id: "action4",
        description: "Envoi Télécommande \"Fin de Demande de Découplage d'urgence\"",
        resultats: [
          { id: "sitr4", libelle: "Résultat attendu SITR : Réception TS \"Fin de Demande d'Effacement d'urgence reçue\"" },
          { id: "auto4", libelle: "Résultat attendu installation client : Fin de Demande d'Effacement d'urgence reçue" }
        ]
      },
      {
        id: "action5",
        description: "Couplage de la centrale par automate",
        resultats: [
          { id: "sitr5", libelle: "Résultat attendu SITR : Réception TS \"Centrale couplée\"" },
          { id: "auto5", libelle: "Résultat attendu installation client : Couplage de la centrale par automate" }
        ]
      }
    ]
  },

  TCD5: {
    libelle: "TCD/TSD5 - Autorisation de couplage",
    cablage: [
      { id: "cab_tc_o", libelle: "TC (O) TC Autorisation de couplage" },
      { id: "cab_ts_f", libelle: "TS (F) Attente Autorisation de couplage" },
      { id: "cab_ts_o", libelle: "TS (O) Autorisation de couplage reçue" }
    ],
    actions: [
      {
        id: "action1",
        description: "Simulation d'un manque tension HTA depuis l'installation (protection Découplage) pendant un délai < T2(50s)",
        resultats: [
          { id: "sitr1", libelle: "Résultat attendu SITR : Réception TS \"Centrale Découplée\"" },
          { id: "auto1", libelle: "Résultat attendu installation client : Découplage de la centrale" }
        ]
      },
      {
        id: "action2",
        description: "Couplage de la Centrale par automate",
        resultats: [
          { id: "sitr2", libelle: "Résultat attendu SITR : Réception TS \"Centrale Couplée\"" },
          { id: "auto2", libelle: "Résultat attendu installation client : Vérification du bon fonctionnement de l'automate" }
        ]
      },
      {
        id: "action3",
        description: "Simulation d'un manque tension HTA depuis l'installation (protection Découplage) pendant un délai > T2(50s)",
        resultats: [
          { id: "sitr3_1", libelle: "Résultat attendu SITR 1: Réception TS \"Centrale Découplée\"" },
          { id: "auto3_1", libelle: "Résultat attendu installation client 1: Découplage de la centrale" },
          { id: "sitr3_2", libelle: "Résultat attendu SITR 2: Réception TS \"Attente Autorisation de couplage\" à T2 (contrôler la temporisation)" },
          { id: "auto3_2", libelle: "Résultat attendu installation client 2: Contrôler le Non couplage de la centrale à l'échéance du temps de reconfiguration (50s)" }
        ]
      },
      {
        id: "action4",
        description: "Envoi Télécommande \"Autorisation de couplage\"",
        resultats: [
          { id: "sitr4", libelle: "Résultat attendu SITR : Réception TS \"Couplage autorisé\"" },
          { id: "auto4", libelle: "Résultat attendu installation client : Réception \"couplage autorisé\" automate" }
        ]
      },
      {
        id: "action5",
        description: "Couplage de la centrale par automate",
        resultats: [
          { id: "sitr5", libelle: "Résultat attendu SITR : Réception TS \"Centrale couplée\"" },
          { id: "auto5", libelle: "Résultat attendu installation client : Couplage de la centrale par automate" }
        ]
      }
    ]
  },

  TCD6: {
    libelle: "TCD/TSD6 - Demande de découplage",
    cablage: [
      { id: "cab_tc_f", libelle: "TC (F) TC Fin de demande de découplage" },
      { id: "cab_tc_o", libelle: "TC (O) TC Demande de découplage" },
      { id: "cab_ts_f", libelle: "TS (F) Fin de demande de découplage" },
      { id: "cab_ts_o", libelle: "TS (O) Demande de découplage reçue" }
    ],
    actions: [
      {
        id: "action1",
        description: "Envoi Télécommande \"Demande de Découplage\" depuis SITR (la Centrale étant couplée)",
        resultats: [
          { id: "sitr1", libelle: "Résultat attendu SITR : Réception TS \"Demande de Découplage reçue\"" },
          { id: "auto1", libelle: "Résultat attendu installation client : Réception Demande de Découplage" }
        ]
      },
      {
        id: "action2",
        description: "Découplage de la Centrale",
        resultats: [
          { id: "sitr2", libelle: "Résultat attendu SITR : Réception TS \"Centrale Découplée\"" },
          { id: "auto2", libelle: "Résultat attendu installation client : Découplage de la Centrale dans un délai inférieur à T1" }
        ]
      },
      {
        id: "action3",
        description: "Absence de couplage de la Centrale par automate",
        resultats: [
          { id: "auto3", libelle: "Résultat attendu installation client : Vérification du Non couplage" }
        ]
      },
      {
        id: "action4",
        description: "Envoi Télécommande \"Fin de Demande de Découplage\"",
        resultats: [
          { id: "sitr4", libelle: "Résultat attendu SITR : Réception TS \"Fin de Demande de Découplage reçue\"" },
          { id: "auto4", libelle: "Résultat attendu installation client : Fin de Demande de Découplage reçue" }
        ]
      },
      {
        id: "action5",
        description: "Couplage de la centrale par automate",
        resultats: [
          { id: "sitr5", libelle: "Résultat attendu SITR : Réception TS \"Centrale couplée\"" },
          { id: "auto5", libelle: "Résultat attendu installation client : Couplage de la centrale par automate" }
        ]
      }
    ]
  },

  TCD7: {
    libelle: "TCD/TSD7 - TéléValeur de Consigne P0 (Limitation de puissance)",
    cablage: [
      { id: "cab_tc_f", libelle: "TC (F) TC Fin de passage à P0" },
      { id: "cab_tc_o", libelle: "TC (O) TC Passage à P0" },
      { id: "cab_ts_f", libelle: "TS (F) Fin de passage à P0 début" },
      { id: "cab_ts_o", libelle: "TS (O) Passage à P0 reçue" },
      { id: "cab_tvc", libelle: "TVCP0 Consigne TVC P0" }
    ],
    actions: [
      {
        id: "action1",
        description: "Envoi TéléValeur de Consigne P0 Inférieure à la puissance Active en cours",
        resultats: [
          { id: "sitr1", libelle: "Résultat attendu SITR : Prise en compte de la TVC" },
          { id: "auto1", libelle: "Résultat attendu installation client : Réception de la valeur de TVC" }
        ]
      },
      {
        id: "action2",
        description: "Télécommande \"Passage à P0\" (activation de la TVC P0)",
        resultats: [
          { id: "sitr2_1", libelle: "Résultat attendu SITR 1 : Réception TS \"Demande Passage P0 début\"" },
          { id: "auto2_1", libelle: "Résultat attendu installation client 1: Réception Demande de passage P0" },
          { id: "sitr2_2", libelle: "Résultat attendu SITR 2 : Lectures TM correspondante" },
          { id: "auto2_2", libelle: "Résultat attendu installation client 2 : Passage de la Centrale à une puissance de production inférieure ou égale à la TVC" }
        ]
      },
      {
        id: "action3",
        description: "Changement TVC P0 (inférieure ou supérieure à la précédente)",
        resultats: [
          { id: "sitr3", libelle: "Résultat attendu SITR : Lectures TM correspondante" },
          { id: "auto3", libelle: "Résultat attendu installation client : Passage de la Centrale à une puissance de production inférieure ou égale à la TVC" }
        ]
      },
      {
        id: "action4",
        description: "Déconnexion de la liaison TVC (bornier)",
        resultats: [
          { id: "sitr4", libelle: "Résultat attendu SITR : Passage TM à P0 repli" },
          { id: "auto4", libelle: "Résultat attendu installation client : Passage de la Centrale à une puissance de production inférieure ou égale à la TM P0 repli" }
        ]
      },
      {
        id: "action5",
        description: "Reconnexion de la liaison TVC (bornier)",
        resultats: [
          { id: "sitr5", libelle: "Résultat attendu SITR : Lectures TM correspondante" },
          { id: "auto5", libelle: "Résultat attendu installation client : Passage de la Centrale à une puissance de production inférieure ou égale à la TVC" }
        ]
      },
      {
        id: "action6",
        description: "Télécommande \"Fin de passage à P0\"",
        resultats: [
          { id: "sitr6_1", libelle: "Résultat attendu SITR 1 : Réception TS \"Fin de Demande Passage P0 reçu\"" },
          { id: "auto6_1", libelle: "Résultat attendu installation client 1: Réception Demande de Fin de passage P0" },
          { id: "sitr6_2", libelle: "Résultat attendu SITR 2 : Lectures TM correspondante" },
          { id: "auto6_2", libelle: "Résultat attendu installation client 2 : Vérification du retour à la puissance initiale" }
        ]
      }
    ]
  },

  TCD8: {
    libelle: "TCD/TSD8 - TéléValeur de Consigne Q0 (Limitation de puissance réactive)",
    cablage: [
      { id: "cab_tc_f", libelle: "TC (F) TC Fin de passage à Q0" },
      { id: "cab_tc_o", libelle: "TC (O) TC Passage à Q0" },
      { id: "cab_ts_f", libelle: "TS (F) Fin de passage à Q0 début" },
      { id: "cab_ts_o", libelle: "TS (O) Passage à Q0 reçue" },
      { id: "cab_tvc", libelle: "TVCQ0 Consigne TVC Q0" }
    ],
    actions: [
      {
        id: "action1",
        description: "Envoi TéléValeur de Consigne Q0 Inférieure à la puissance Réactive en cours",
        resultats: [
          { id: "sitr1", libelle: "Résultat attendu SITR : Prise en compte de la TVC" },
          { id: "auto1", libelle: "Résultat attendu installation client : Réception de la valeur de TVC" }
        ]
      },
      {
        id: "action2",
        description: "Télécommande \"Passage à Q0\" (activation de la TVC Q0)",
        resultats: [
          { id: "sitr2_1", libelle: "Résultat attendu SITR 1 : Réception TS \"Demande Passage Q0 début\"" },
          { id: "auto2_1", libelle: "Résultat attendu installation client 1: Réception Demande de passage Q0" },
          { id: "sitr2_2", libelle: "Résultat attendu SITR 2 : Lectures TM correspondante" },
          { id: "auto2_2", libelle: "Résultat attendu installation client 2 : Passage de la Centrale à une puissance de production inférieure ou égale à la TVC" }
        ]
      },
      {
        id: "action3",
        description: "Changement TVC Q0 (inférieure ou supérieure à la précédente)",
        resultats: [
          { id: "sitr3", libelle: "Résultat attendu SITR : Lectures TM correspondante" },
          { id: "auto3", libelle: "Résultat attendu installation client : Passage de la Centrale à une puissance de production inférieure ou égale à la TVC" }
        ]
      },
      {
        id: "action4",
        description: "Déconnexion de la liaison TVC (bornier)",
        resultats: [
          { id: "sitr4", libelle: "Résultat attendu SITR : Passage TM à Q0 repli" },
          { id: "auto4", libelle: "Résultat attendu installation client : Passage de la Centrale à une puissance de production inférieure ou égale à la TM Q0 repli" }
        ]
      },
      {
        id: "action5",
        description: "Reconnexion de la liaison TVC (bornier)",
        resultats: [
          { id: "sitr5", libelle: "Résultat attendu SITR : Lectures TM correspondante" },
          { id: "auto5", libelle: "Résultat attendu installation client : Passage de la Centrale à une puissance de production inférieure ou égale à la TVC" }
        ]
      },
      {
        id: "action6",
        description: "Télécommande \"Fin de passage à Q0\"",
        resultats: [
          { id: "sitr6_1", libelle: "Résultat attendu SITR 1 : Réception TS \"Fin de Demande Passage Q0 reçu\"" },
          { id: "auto6_1", libelle: "Résultat attendu installation client 1: Réception Demande de Fin de passage Q0" },
          { id: "sitr6_2", libelle: "Résultat attendu SITR 2 : Lectures TM correspondante" },
          { id: "auto6_2", libelle: "Résultat attendu installation client 2 : Vérification du retour à la puissance initiale" }
        ]
      }
    ]
  }
};

/* =========================
   GESTION DE L'AFFICHAGE
========================= */

let indexCourant = dataTests.indexCourant;
const fonctionsATester = dataTests.fonctionsATester;
const resultats = dataTests.resultats || {};

afficherFonction(indexCourant);

function afficherFonction(index) {
  const fonctionId = fonctionsATester[index];
  const fonctionData = FONCTIONS_STRUCTURE[fonctionId];

  if (!fonctionData) {
    console.error("Fonction introuvable:", fonctionId);
    return;
  }

  // Mise à jour progression
  document.getElementById("numFonction").textContent = index + 1;
  document.getElementById("totalFonctions").textContent = fonctionsATester.length;
  const pourcentage = ((index + 1) / fonctionsATester.length) * 100;
  document.getElementById("progressFill").style.width = pourcentage + "%";

  // Titre
  document.getElementById("titreFonction").textContent = fonctionData.libelle;

  // Câblage (uniquement si DEIE)
  const blocCablage = document.getElementById("blocCablage");
  const listeCablage = document.getElementById("listeCablage");

  if (coffret === "DEIE" && fonctionData.cablage && fonctionData.cablage.length > 0) {
    blocCablage.style.display = "block";
    listeCablage.innerHTML = "";

    fonctionData.cablage.forEach(cab => {
      const div = creerBoutonOkNok(
        fonctionId + "_cab_" + cab.id,
        cab.libelle,
        "cablage"
      );
      listeCablage.appendChild(div);
    });
  } else {
    blocCablage.style.display = "none";
  }

  // Tests
  const listeTests = document.getElementById("listeTests");
  listeTests.innerHTML = "";

  fonctionData.actions.forEach((action, actionIndex) => {
    const divAction = document.createElement("div");
    divAction.className = "test-action";
    divAction.style.marginBottom = "24px";
    divAction.style.padding = "12px";
    divAction.style.borderRadius = "8px";

    const titre = document.createElement("p");
    titre.style.fontWeight = "bold";
    titre.style.marginBottom = "12px";
    titre.textContent = action.description;
    divAction.appendChild(titre);

    action.resultats.forEach(res => {
      const divRes = creerBoutonOkNok(
        fonctionId + "_" + action.id + "_" + res.id,
        res.libelle,
        "test"
      );
      divAction.appendChild(divRes);
    });

    // CHAMP COMMENTAIRE PAR ACTION
    const divCommentaire = document.createElement("div");
    divCommentaire.className = "field";
    divCommentaire.style.marginTop = "15px";

    const labelCommentaire = document.createElement("label");
    labelCommentaire.textContent = "Commentaire / Remarque (optionnel)";
    labelCommentaire.style.fontSize = "0.9rem";
    labelCommentaire.style.color = "#666";
    labelCommentaire.style.display = "block";
    labelCommentaire.style.marginBottom = "6px";

    const textareaCommentaire = document.createElement("textarea");
    textareaCommentaire.className = "commentaire-action";
    textareaCommentaire.rows = 2;
    textareaCommentaire.style.width = "100%";
    textareaCommentaire.style.padding = "8px";
    textareaCommentaire.style.borderRadius = "6px";
    textareaCommentaire.style.border = "1px solid #ccc";
    textareaCommentaire.style.fontSize = "0.9rem";
    textareaCommentaire.style.fontFamily = "Arial, sans-serif";
    textareaCommentaire.style.resize = "vertical";
    textareaCommentaire.placeholder = "Ajoutez une remarque pour cette action...";

    // Clé unique pour le commentaire de cette action
    const commentaireKey = `commentaire_${fonctionId}_${action.id}`;

    // Restaurer le commentaire si existant
    if (resultats[commentaireKey]) {
      textareaCommentaire.value = resultats[commentaireKey];
    }

    // Sauvegarder le commentaire à chaque modification
    textareaCommentaire.addEventListener("input", () => {
      resultats[commentaireKey] = textareaCommentaire.value;
      sauvegarderResultats();
    });

    divCommentaire.appendChild(labelCommentaire);
    divCommentaire.appendChild(textareaCommentaire);
    divAction.appendChild(divCommentaire);

    listeTests.appendChild(divAction);
  });

  // Synthèse masquée au départ
  document.getElementById("blocSynthese").style.display = "none";

  // Bouton Précédent
  const btnPrecedent = document.getElementById("btnPrecedent");
  if (index > 0) {
    btnPrecedent.style.display = "inline-block";
  } else {
    btnPrecedent.style.display = "none";
  }

  // Bouton Suivant
  const btnSuivant = document.getElementById("btnSuivant");
  btnSuivant.disabled = true;
  btnSuivant.textContent = (index < fonctionsATester.length - 1) ? "Suivant →" : "Terminer les tests";

  // Vérifier si tous les choix sont faits
  verifierCompletude(fonctionId);
}

/* =========================
   CRÉER BOUTONS OK / NOK
========================= */

function creerBoutonOkNok(id, libelle, type) {
  const div = document.createElement("div");
  div.className = "field-oknok";
  div.style.marginBottom = "12px";

  const label = document.createElement("label");
  label.textContent = libelle;
  label.style.display = "block";
  label.style.marginBottom = "6px";
  label.style.fontSize = "0.95rem";

  const btnContainer = document.createElement("div");
  btnContainer.style.display = "flex";
  btnContainer.style.gap = "8px";

  const btnOk = document.createElement("button");
  btnOk.textContent = "OK";
  btnOk.className = "btn-oknok";
  btnOk.dataset.choix = "OK";
  btnOk.dataset.id = id;
  btnOk.dataset.type = type;

  const btnNok = document.createElement("button");
  btnNok.textContent = "NOK";
  btnNok.className = "btn-oknok";
  btnNok.dataset.choix = "NOK";
  btnNok.dataset.id = id;
  btnNok.dataset.type = type;

  // Restaurer choix si existant
  if (resultats[id]) {
    if (resultats[id] === "OK") {
      btnOk.classList.add("active-ok");
    } else {
      btnNok.classList.add("active-nok");
    }
  }

  btnOk.addEventListener("click", () => {
    btnOk.classList.add("active-ok");
    btnNok.classList.remove("active-nok");
    resultats[id] = "OK";
    sauvegarderResultats();
    verifierCompletude(fonctionsATester[indexCourant]);
  });

  btnNok.addEventListener("click", () => {
    btnNok.classList.add("active-nok");
    btnOk.classList.remove("active-ok");
    resultats[id] = "NOK";
    sauvegarderResultats();
    verifierCompletude(fonctionsATester[indexCourant]);
  });

  btnContainer.appendChild(btnOk);
  btnContainer.appendChild(btnNok);

  div.appendChild(label);
  div.appendChild(btnContainer);

  return div;
}

/* =========================
   VÉRIFIER COMPLÉTUDE
========================= */

function verifierCompletude(fonctionId) {
  const fonctionData = FONCTIONS_STRUCTURE[fonctionId];
  let tousRemplis = true;

  // Vérifier câblage si DEIE
  if (coffret === "DEIE" && fonctionData.cablage) {
    for (let cab of fonctionData.cablage) {
      const key = fonctionId + "_cab_" + cab.id;
      if (!resultats[key]) {
        tousRemplis = false;
        break;
      }
    }
  }

  // Vérifier tests
  if (tousRemplis) {
    for (let action of fonctionData.actions) {
      for (let res of action.resultats) {
        const key = fonctionId + "_" + action.id + "_" + res.id;
        if (!resultats[key]) {
          tousRemplis = false;
          break;
        }
      }
      if (!tousRemplis) break;
    }
  }

  if (tousRemplis) {
    calculerSynthese(fonctionId);
    document.getElementById("btnSuivant").disabled = false;
  } else {
    document.getElementById("blocSynthese").style.display = "none";
    document.getElementById("btnSuivant").disabled = true;
  }
}

/* =========================
   CALCULER SYNTHÈSE
========================= */

function calculerSynthese(fonctionId) {
  const fonctionData = FONCTIONS_STRUCTURE[fonctionId];
  let toutOk = true;

  // Vérifier câblage
  if (coffret === "DEIE" && fonctionData.cablage) {
    for (let cab of fonctionData.cablage) {
      const key = fonctionId + "_cab_" + cab.id;
      if (resultats[key] === "NOK") {
        toutOk = false;
        break;
      }
    }
  }

  // Vérifier tests
  if (toutOk) {
    for (let action of fonctionData.actions) {
      for (let res of action.resultats) {
        const key = fonctionId + "_" + action.id + "_" + res.id;
        if (resultats[key] === "NOK") {
          toutOk = false;
          break;
        }
      }
      if (!toutOk) break;
    }
  }

  const texteSynthese = document.getElementById("texteSynthese");
  const blocSynthese = document.getElementById("blocSynthese");

  if (toutOk) {
    texteSynthese.textContent = "✓ Fonction CONFORME";
    texteSynthese.style.color = "#5bc500";
  } else {
    texteSynthese.textContent = "✗ Fonction NON CONFORME";
    texteSynthese.style.color = "#d32f2f";
  }

  blocSynthese.style.display = "block";

  // Sauvegarder le statut
  if (!resultats.syntheses) resultats.syntheses = {};
  resultats.syntheses[fonctionId] = toutOk ? "CONFORME" : "NON CONFORME";
  sauvegarderResultats();
}

/* =========================
   SAUVEGARDE
========================= */

function sauvegarderResultats() {
  dataTests.resultats = resultats;
  localStorage.setItem("dataTests", JSON.stringify(dataTests));
}

/* =========================
   NAVIGATION
========================= */

document.getElementById("btnPrecedent").addEventListener("click", () => {
  if (indexCourant > 0) {
    indexCourant--;
    dataTests.indexCourant = indexCourant;
    localStorage.setItem("dataTests", JSON.stringify(dataTests));
    afficherFonction(indexCourant);
    window.scrollTo(0, 0);
  }
});

document.getElementById("btnSuivant").addEventListener("click", () => {
  if (indexCourant < fonctionsATester.length - 1) {
    indexCourant++;
    dataTests.indexCourant = indexCourant;
    localStorage.setItem("dataTests", JSON.stringify(dataTests));
    afficherFonction(indexCourant);
    window.scrollTo(0, 0);
  } else {
    // Fin des tests → récap
    window.location.href = "recap.html";
  }
});
