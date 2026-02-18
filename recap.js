console.log("recap.js chargé");

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

// Affichage
const listeRecap = document.getElementById("listeRecap");
listeRecap.innerHTML = "";

const ul = document.createElement("ul");
ul.style.listStyle = "none";
ul.style.padding = "0";

fonctionsATester.forEach(fid => {
  const li = document.createElement("li");
  li.style.padding = "12px";
  li.style.marginBottom = "8px";
  li.style.borderRadius = "6px";
  li.style.display = "flex";
  li.style.justifyContent = "space-between";
  li.style.alignItems = "center";
  li.classList.add('recap-item'); // Classe pour le mode sombre

  const libelle = document.createElement("span");
  libelle.textContent = LIBELLES[fid] || fid;

  const statut = document.createElement("span");
  statut.style.fontWeight = "bold";
  statut.style.fontSize = "1rem";

  if (syntheses[fid] === "CONFORME") {
    statut.textContent = "✓ CONFORME";
    statut.style.color = "#5bc500";
    li.classList.add('recap-item-ok');
  } else {
    statut.textContent = "✗ NON CONFORME";
    statut.style.color = "#d32f2f";
    li.classList.add('recap-item-nok');
  }

  li.appendChild(libelle);
  li.appendChild(statut);
  ul.appendChild(li);
});

listeRecap.appendChild(ul);

// Bouton synthèse
document.getElementById("btnVoirSynthese").addEventListener("click", () => {
  window.location.href = "synthese.html";
});
