// ========================================
// GESTION DES PROFILS TECHNICIENS
// ========================================

class ProfilTechnicien {
  constructor() {
    this.STORAGE_KEY = "profilTechnicien";
  }

  // Sauvegarder le profil
  saveProfil(profil) {
    const profilData = {
      nomTechnicien: profil.nomTechnicien || "",
      baseEnedis: profil.baseEnedis || "",
      telephoneTechnicien: profil.telephoneTechnicien || "",
      savedAt: Date.now()
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profilData));
    console.log("Profil technicien sauvegardé:", profilData);
    return true;
  }

  // Charger le profil
  loadProfil() {
    const profilJSON = localStorage.getItem(this.STORAGE_KEY);
    if (!profilJSON) {
      return null;
    }

    try {
      const profil = JSON.parse(profilJSON);
      console.log("Profil technicien chargé:", profil);
      return profil;
    } catch (e) {
      console.error("Erreur chargement profil:", e);
      return null;
    }
  }

  // Vérifier si un profil existe
  hasProfil() {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }

  // Supprimer le profil
  clearProfil() {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log("Profil technicien supprimé");
  }

  // Pré-remplir les champs d'un formulaire
  fillForm(formFields) {
    const profil = this.loadProfil();
    if (!profil) {
      return false;
    }

    // Mapping des champs
    const fieldMapping = {
      nomTechnicien: formFields.nomTechnicien,
      baseEnedis: formFields.baseEnedis,
      telephoneTechnicien: formFields.telephoneTechnicien
    };

    Object.keys(fieldMapping).forEach(key => {
      const element = fieldMapping[key];
      if (element && profil[key]) {
        element.value = profil[key];
        console.log(`Champ ${key} pré-rempli avec:`, profil[key]);
      }
    });

    return true;
  }
}

// Instance globale
window.profilTechnicien = new ProfilTechnicien();
