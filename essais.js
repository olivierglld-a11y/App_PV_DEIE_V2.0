console.log("essais.js chargé");

/* =========================
   1. SÉCURITÉ / RÉCUPÉRATION SESSION
========================= */

const session = JSON.parse(localStorage.getItem("choixEssais"));
const rapportComplet = JSON.parse(localStorage.getItem("rapportEssais")) || {};

const DUREE_MAX_SESSION = 2 * 60 * 60 * 1000; // 2 heures

if (!session) {
  alert("Aucune session active. Merci de commencer l'essai depuis l'accueil.");
  window.location.href = "index.html";
} else {
  const ageSession = Date.now() - session.createdAt;

  if (ageSession > DUREE_MAX_SESSION) {
    alert("Session expirée. Merci de recommencer l'essai.");
    localStorage.removeItem("choixEssais");
    localStorage.removeItem("rapportEssais");
    window.location.href = "index.html";
  }
}

/* =========================
   2. AFFICHAGE RÉCAP
========================= */

document.getElementById("recapMotif").textContent = session.motif;
document.getElementById("recapProtection").textContent = session.protection;
document.getElementById("recapCoffret").textContent = session.coffret;

/* =========================
   3. DÉFINITION DES FONCTIONS DISPONIBLES
========================= */

// Toutes les fonctions possibles
const TOUTES_FONCTIONS = [
  { id: "TSS1", libelle: "TSS1 - Centrale indisponible" },
  { id: "TSS2", libelle: "TSS2 - Centrale couplée" },
  { id: "TELEINFO", libelle: "TELEINFO - Compteur TIC" },
  { id: "TCD1", libelle: "TCD/TSD1 - Mise EN/HORS Service RSE" },
  { id: "TCD2", libelle: "TCD/TSD2 - Mise EN/HORS Service TAC" },
  { id: "TCD3", libelle: "TCD/TSD3 - Demande d'effacement d'urgence" },
  { id: "TCD5", libelle: "TCD/TSD5 - Autorisation de couplage" },
  { id: "TCD6", libelle: "TCD/TSD6 - Demande de découplage" },
  { id: "TCD7", libelle: "TCD/TSD7 - TéléValeur Consigne P0" },
  { id: "TCD8", libelle: "TCD/TSD8 - TéléValeur Consigne Q0" }
];

/* =========================
   4. LOGIQUE DE SÉLECTION SELON LES RÈGLES
========================= */

let fonctionsATester = [];

// Règle : Si motif = MES ou MODIF → toutes les fonctions
if (session.motif === "MES" || session.motif === "MODIF") {
  fonctionsATester = [...TOUTES_FONCTIONS];

  // Appliquer le filtre TCD1/TCD2 selon protection
  fonctionsATester = filtrerSelonProtection(fonctionsATester, session.protection);

  // Afficher directement le sommaire
  afficherSommaire(fonctionsATester);
  document.getElementById("screenSommaire").style.display = "block";
  document.getElementById("zoneActionSommaire").style.display = "block";
}
// Règle : Si motif = DEP → écran de sélection
else if (session.motif === "DEP") {
  // Filtrer les checkboxes disponibles selon la protection
  preparerSelectionDepannage(session.protection);

  document.getElementById("screenSelection").style.display = "block";
}

/* =========================
   5. FONCTION : FILTRER TCD1/TCD2 SELON PROTECTION
========================= */

function filtrerSelonProtection(fonctions, protection) {
  // H1, H2, H3.1, H5 → TCD1 uniquement (exclure TCD2)
  if (protection === "H1" || protection === "H2" || protection === "H3.1" || protection === "H5") {
    return fonctions.filter(f => f.id !== "TCD2");
  }
  // H4 → TCD2 uniquement (exclure TCD1)
  else if (protection === "H4") {
    return fonctions.filter(f => f.id !== "TCD1");
  }

  return fonctions;
}

/* =========================
   6. PRÉPARATION SÉLECTION DÉPANNAGE
========================= */

function preparerSelectionDepannage(protection) {
  const checkboxes = document.querySelectorAll("#screenSelection .checkbox-item");

  checkboxes.forEach(item => {
    const fonction = item.dataset.fonction;

    // Masquer TCD2 si protection H1, H2, H3.1, H5
    if ((protection === "H1" || protection === "H2" || protection === "H3.1" || protection === "H5") && fonction === "TCD2") {
      item.style.display = "none";
    }
    // Masquer TCD1 si protection H4
    else if (protection === "H4" && fonction === "TCD1") {
      item.style.display = "none";
    }
  });

  // Gérer la validation de la sélection
  const checkboxInputs = document.querySelectorAll("#screenSelection input[type='checkbox']");
  checkboxInputs.forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      const selectionnes = Array.from(checkboxInputs).filter(c => c.checked);

      if (selectionnes.length > 0) {
        // Afficher le sommaire
        const fonctionsSelectionnees = selectionnes.map(c => {
          return TOUTES_FONCTIONS.find(f => f.id === c.value);
        });

        fonctionsATester = fonctionsSelectionnees;
        afficherSommaire(fonctionsSelectionnees);

        document.getElementById("screenSommaire").style.display = "block";
        document.getElementById("zoneActionSommaire").style.display = "block";
      } else {
        document.getElementById("screenSommaire").style.display = "none";
        document.getElementById("zoneActionSommaire").style.display = "none";
      }
    });
  });
}

/* =========================
   7. AFFICHAGE SOMMAIRE
========================= */

function afficherSommaire(fonctions) {
  const liste = document.getElementById("listeFonctions");
  liste.innerHTML = "";

  if (fonctions.length === 0) {
    liste.innerHTML = "<p style='color:#999;'>Aucune fonction sélectionnée</p>";
    return;
  }

  const ul = document.createElement("ul");
  ul.style.listStyle = "none";
  ul.style.padding = "0";

  fonctions.forEach(f => {
    const li = document.createElement("li");
    li.style.padding = "8px 0";
    li.style.borderBottom = "1px solid #eee";
    li.textContent = f.libelle;
    ul.appendChild(li);
  });

  liste.appendChild(ul);
}

/* =========================
   8. BOUTON LANCER LES TESTS
========================= */

document.getElementById("btnLancerTests").addEventListener("click", () => {
  if (fonctionsATester.length === 0) {
    alert("Veuillez sélectionner au moins une fonction à tester.");
    return;
  }

  // Sauvegarder la liste des fonctions à tester
  const dataTests = {
    fonctionsATester: fonctionsATester.map(f => f.id),
    indexCourant: 0,
    resultats: {}
  };

  localStorage.setItem("dataTests", JSON.stringify(dataTests));

  console.log("Fonctions à tester :", fonctionsATester);
  console.log("Navigation vers tests.html");

  // Navigation vers la page de tests
  window.location.href = "tests.html";
});
