console.log("synthese.js chargé");

const dataTests = JSON.parse(localStorage.getItem("dataTests"));

if (!dataTests || !dataTests.resultats || !dataTests.resultats.syntheses) {
  alert("Aucun résultat de test disponible.");
  window.location.href = "index.html";
}

const syntheses = dataTests.resultats.syntheses;
const fonctionsATester = dataTests.fonctionsATester;

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
  TCD7: "TCD/TSD7 - TéléValeur Consigne P0",
  TCD8: "TCD/TSD8 - TéléValeur Consigne Q0"
};

// Analyse des résultats
let toutConforme = true;
const fonctionsNOK = [];

fonctionsATester.forEach(fid => {
  if (syntheses[fid] !== "CONFORME") {
    toutConforme = false;
    fonctionsNOK.push(LIBELLES[fid] || fid);
  }
});

// Affichage
const syntheseGlobale = document.getElementById("syntheseGlobale");
const texteSyntheseGlobale = document.getElementById("texteSyntheseGlobale");

if (toutConforme) {
  texteSyntheseGlobale.textContent = "✓ L'ensemble des fonctions testées sont CONFORMES";
  texteSyntheseGlobale.style.color = "#5bc500";
  syntheseGlobale.classList.add('synthese-ok');
} else {
  texteSyntheseGlobale.textContent = "✗ Installation NON CONFORME";
  texteSyntheseGlobale.style.color = "#d32f2f";
  syntheseGlobale.classList.add('synthese-nok');

  // Afficher la liste des NOK
  const listeFonctionsNOK = document.getElementById("listeFonctionsNOK");
  listeFonctionsNOK.style.display = "block";

  const ul = document.getElementById("detailNOK");
  ul.innerHTML = "";

  fonctionsNOK.forEach(nom => {
    const li = document.createElement("li");
    li.textContent = nom;
    li.style.marginBottom = "8px";
    ul.appendChild(li);
  });
}

// Sauvegarder la synthèse globale
const rapportComplet = JSON.parse(localStorage.getItem("rapportEssais")) || {};
rapportComplet.syntheseGlobale = toutConforme ? "CONFORME" : "NON CONFORME";
rapportComplet.fonctionsNOK = fonctionsNOK;
rapportComplet.resultatsTests = dataTests.resultats;
localStorage.setItem("rapportEssais", JSON.stringify(rapportComplet));

// Bouton signatures
document.getElementById("btnSignatures").addEventListener("click", () => {
  window.location.href = "signature-controleur.html";
});
