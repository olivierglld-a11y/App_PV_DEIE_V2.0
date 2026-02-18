console.log("signature-controleur.js chargé");

// Date automatique
const dateNow = new Date().toLocaleDateString("fr-FR");
document.getElementById("dateSignatureControleur").value = dateNow;

// Canvas
const canvas = document.getElementById("canvasSignatureControleur");
const ctx = canvas.getContext("2d");

// Ajuster la taille du canvas
canvas.width = canvas.offsetWidth;
canvas.height = 200;

let isDrawing = false;
let hasDrawn = false;

// Style du trait
ctx.strokeStyle = "#000";
ctx.lineWidth = 2;
ctx.lineCap = "round";

// Fonction pour obtenir les coordonnées
function getCoordinates(e) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX || e.touches[0].clientX) - rect.left;
  const y = (e.clientY || e.touches[0].clientY) - rect.top;
  return { x, y };
}

// Événements souris
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  const { x, y } = getCoordinates(e);
  ctx.beginPath();
  ctx.moveTo(x, y);
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;
  const { x, y } = getCoordinates(e);
  ctx.lineTo(x, y);
  ctx.stroke();
  hasDrawn = true;
  verifierSignature();
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
});

canvas.addEventListener("mouseleave", () => {
  isDrawing = false;
});

// Événements tactiles
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  isDrawing = true;
  const { x, y } = getCoordinates(e);
  ctx.beginPath();
  ctx.moveTo(x, y);
});

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (!isDrawing) return;
  const { x, y } = getCoordinates(e);
  ctx.lineTo(x, y);
  ctx.stroke();
  hasDrawn = true;
  verifierSignature();
});

canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  isDrawing = false;
});

// Bouton effacer
document.getElementById("btnEffacerControleur").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hasDrawn = false;
  verifierSignature();
});

// Vérifier si signature présente ET consentement RGPD coché
function verifierSignature() {
  const btnValider = document.getElementById("btnValiderControleur");
  const consentement = document.getElementById("consentementRGPD");
  
  // Activer le bouton seulement si signature présente ET consentement coché
  btnValider.disabled = !(hasDrawn && consentement && consentement.checked);
}

// Écouter le changement de la case consentement
document.getElementById("consentementRGPD")?.addEventListener("change", () => {
  verifierSignature();
});

// Bouton valider
document.getElementById("btnValiderControleur").addEventListener("click", () => {
  if (!hasDrawn) {
    alert("⚠️ Merci de signer avant de valider.");
    return;
  }

  // Vérifier le consentement RGPD
  const consentement = document.getElementById("consentementRGPD");
  if (!consentement || !consentement.checked) {
    alert("⚠️ Vous devez accepter la politique de confidentialité pour pouvoir signer.\n\nVotre signature est considérée comme une donnée biométrique et nécessite votre consentement explicite conformément au RGPD.");
    return;
  }

  // Sauvegarder la signature + consentement
  const signatureData = canvas.toDataURL("image/png");

  const rapportComplet = JSON.parse(localStorage.getItem("rapportEssais")) || {};
  rapportComplet.signatureControleur = {
    date: dateNow,
    signature: signatureData,
    consentementRGPD: true,
    consentementDate: new Date().toISOString()
  };

  localStorage.setItem("rapportEssais", JSON.stringify(rapportComplet));

  console.log("Signature contrôleur + consentement RGPD sauvegardés");

  // Navigation vers signature client
  window.location.href = "signature-client.html";
});
