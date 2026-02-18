/**
 * ux-mobile.js - Améliorations UX Mobile
 * Priorité 2 : Modales, progression PDF, feedback visuel
 * Priorité 3 : Autosave formulaires
 */

console.log("ux-mobile.js chargé");

/* =========================
   SYSTÈME DE MODALES
========================= */

window.UX = {

  alert: function(message, titre, type) {
    titre = titre || "Information";
    type = type || "info";
    return new Promise(function(resolve) {
      var overlay = document.createElement("div");
      overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;";
      var icons = { info:"ℹ️", success:"✅", error:"❌", warning:"⚠️" };
      var btnColors = { info:"#1424DB", success:"#5BC500", error:"#d32f2f", warning:"#f57c00" };
      var borderColors = { info:"#1424DB", success:"#5BC500", error:"#d32f2f", warning:"#f57c00" };
      var icon = icons[type] || "ℹ️";
      var btnColor = btnColors[type] || "#1424DB";
      var borderColor = borderColors[type] || "#1424DB";
      overlay.innerHTML = '<div style="background:white;border-radius:12px;padding:28px 24px;max-width:380px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,0.18);border-top:4px solid '+borderColor+';">'
        + '<div style="font-size:2rem;text-align:center;margin-bottom:10px;">'+icon+'</div>'
        + (titre ? '<h3 style="margin:0 0 12px;font-size:1.1rem;color:#1a1a2e;text-align:center;">'+titre+'</h3>' : '')
        + '<p style="margin:0 0 22px;font-size:0.95rem;color:#444;line-height:1.5;text-align:center;">'+message.replace(/\n/g,"<br>")+'</p>'
        + '<button style="width:100%;padding:13px;background:'+btnColor+';color:white;border:none;border-radius:8px;font-size:1rem;font-weight:bold;cursor:pointer;">OK</button>'
        + '</div>';
      overlay.querySelector("button").addEventListener("click", function() {
        document.body.removeChild(overlay);
        resolve();
      });
      document.body.appendChild(overlay);
    });
  },

  confirm: function(message, titre, labelOk, labelCancel) {
    titre = titre || "Confirmation";
    labelOk = labelOk || "Confirmer";
    labelCancel = labelCancel || "Annuler";
    return new Promise(function(resolve) {
      var overlay = document.createElement("div");
      overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;";
      overlay.innerHTML = '<div style="background:white;border-radius:12px;padding:28px 24px;max-width:380px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,0.18);border-top:4px solid #1424DB;">'
        + '<h3 style="margin:0 0 12px;font-size:1.1rem;color:#1a1a2e;text-align:center;">❓ '+titre+'</h3>'
        + '<p style="margin:0 0 24px;font-size:0.95rem;color:#444;line-height:1.5;text-align:center;">'+message.replace(/\n/g,"<br>")+'</p>'
        + '<div style="display:flex;gap:10px;">'
        + '<button id="ux-cancel" style="flex:1;padding:13px;background:#f5f5f5;color:#444;border:1px solid #ddd;border-radius:8px;font-size:0.95rem;cursor:pointer;">'+labelCancel+'</button>'
        + '<button id="ux-ok" style="flex:1;padding:13px;background:#1424DB;color:white;border:none;border-radius:8px;font-size:0.95rem;font-weight:bold;cursor:pointer;">'+labelOk+'</button>'
        + '</div></div>';
      overlay.querySelector("#ux-ok").addEventListener("click", function() {
        document.body.removeChild(overlay);
        resolve(true);
      });
      overlay.querySelector("#ux-cancel").addEventListener("click", function() {
        document.body.removeChild(overlay);
        resolve(false);
      });
      document.body.appendChild(overlay);
    });
  },

  showProgress: function(message) {
    message = message || "Génération en cours...";
    var existing = document.getElementById("ux-progress-overlay");
    if (existing) existing.remove();
    var overlay = document.createElement("div");
    overlay.id = "ux-progress-overlay";
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9998;padding:20px;";
    overlay.innerHTML = '<style>@keyframes ux-prog{0%{width:10%}50%{width:85%}100%{width:10%}}</style>'
      + '<div style="background:white;border-radius:12px;padding:32px 28px;max-width:320px;width:100%;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.2);">'
      + '<div style="font-size:2.5rem;margin-bottom:14px;">📄</div>'
      + '<p style="margin:0 0 18px;font-size:1rem;font-weight:bold;color:#1424DB;">'+message+'</p>'
      + '<div style="background:#e3f2fd;border-radius:8px;height:8px;overflow:hidden;">'
      + '<div id="ux-progress-bar" style="background:linear-gradient(90deg,#1424DB,#5BC500);height:100%;border-radius:8px;animation:ux-prog 2s ease-in-out infinite;"></div>'
      + '</div>'
      + '<p id="ux-progress-step" style="margin:10px 0 0;font-size:0.85rem;color:#666;">Initialisation...</p>'
      + '</div>';
    document.body.appendChild(overlay);
    return overlay;
  },

  updateProgress: function(step) {
    var el = document.getElementById("ux-progress-step");
    if (el) el.textContent = step;
  },

  hideProgress: function() {
    var overlay = document.getElementById("ux-progress-overlay");
    if (overlay) {
      overlay.style.opacity = "0";
      overlay.style.transition = "opacity 0.3s";
      setTimeout(function() { if(overlay.parentNode) overlay.remove(); }, 300);
    }
  },

  toast: function(message, type, duree) {
    type = type || "success";
    duree = duree || 3000;
    var existing = document.getElementById("ux-toast");
    if (existing) existing.remove();
    var colors = { success:{bg:"#5BC500",icon:"✅"}, error:{bg:"#d32f2f",icon:"❌"}, info:{bg:"#1424DB",icon:"ℹ️"}, warning:{bg:"#f57c00",icon:"⚠️"} };
    var c = colors[type] || colors.success;
    var toast = document.createElement("div");
    toast.id = "ux-toast";
    toast.style.cssText = "position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:"+c.bg+";color:white;padding:14px 22px;border-radius:50px;font-size:0.95rem;font-weight:bold;box-shadow:0 4px 18px rgba(0,0,0,0.2);z-index:9997;display:flex;align-items:center;gap:8px;max-width:90%;";
    toast.innerHTML = '<style>@keyframes ux-tin{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}</style>'
      + c.icon + " " + message;
    toast.style.animation = "ux-tin 0.3s ease";
    document.body.appendChild(toast);
    setTimeout(function() {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s";
      setTimeout(function() { if(toast.parentNode) toast.remove(); }, 300);
    }, duree);
  }
};

/* =========================
   AUTOSAVE FORMULAIRES (Priorité 3)
========================= */

window.FormAutosave = {
  timerId: null,
  pageKey: null,

  init: function(pageKey) {
    this.pageKey = "autosave_" + pageKey;
    this.restore();
    var self = this;
    this.timerId = setInterval(function() { self.save(); }, 30000);
    window.addEventListener("beforeunload", function() { self.save(); });
    document.querySelectorAll("input, select, textarea").forEach(function(input) {
      input.addEventListener("change", function() { self.save(); });
    });
    console.log("FormAutosave initialisé pour:", pageKey);
  },

  save: function() {
    var fields = {};
    document.querySelectorAll("input[id], select[id], textarea[id]").forEach(function(el) {
      fields[el.id] = el.type === "checkbox" ? el.checked : el.value;
    });
    try {
      localStorage.setItem(this.pageKey, JSON.stringify({ fields: fields, savedAt: new Date().toISOString() }));
      this.updateIndicator();
    } catch(e) { console.warn("Autosave échoué:", e); }
  },

  restore: function() {
    try {
      var saved = localStorage.getItem(this.pageKey);
      if (!saved) return;
      var data = JSON.parse(saved);
      if (!data.fields) return;
      var age = Date.now() - new Date(data.savedAt).getTime();
      if (age > 2 * 60 * 60 * 1000) { localStorage.removeItem(this.pageKey); return; }
      var count = 0;
      Object.entries(data.fields).forEach(function(entry) {
        var el = document.getElementById(entry[0]);
        if (el && entry[1] !== null && entry[1] !== undefined) {
          if (el.type === "checkbox") { el.checked = entry[1]; }
          else { el.value = entry[1]; }
          count++;
        }
      });
      if (count > 0) {
        var time = new Date(data.savedAt).toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" });
        setTimeout(function() { window.UX && UX.toast("Formulaire restauré (sauvegarde " + time + ")", "info", 4000); }, 500);
      }
    } catch(e) { console.warn("Restauration échouée:", e); }
  },

  clear: function() {
    if (this.pageKey) localStorage.removeItem(this.pageKey);
    if (this.timerId) clearInterval(this.timerId);
  },

  updateIndicator: function() {
    var indicator = document.getElementById("autosave-indicator");
    if (!indicator) {
      indicator = document.createElement("div");
      indicator.id = "autosave-indicator";
      indicator.style.cssText = "position:fixed;bottom:10px;right:10px;background:rgba(91,197,0,0.9);color:white;padding:5px 12px;border-radius:20px;font-size:0.75rem;z-index:100;opacity:0;transition:opacity 0.3s;";
      document.body.appendChild(indicator);
    }
    var time = new Date().toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" });
    indicator.textContent = "✓ Sauvegardé à " + time;
    indicator.style.opacity = "1";
    setTimeout(function() { indicator.style.opacity = "0"; }, 2500);
  }
};

/* =========================
   INITIALISATION AUTOMATIQUE
========================= */

// DÉSACTIVÉ : FormAutosave causait des problèmes de restauration intempestive
// Garder seulement les modales UX qui sont utiles

/*
document.addEventListener("DOMContentLoaded", function() {
  var page = window.location.pathname.split("/").pop().replace(".html","");
  var pagesFormulaire = ["admin","essais","tests","recap","synthese"];
  if (pagesFormulaire.includes(page)) {
    window.FormAutosave.init(page);
  }
});
*/
