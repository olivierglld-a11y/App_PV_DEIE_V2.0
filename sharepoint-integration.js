// ========================================
// INTÉGRATION SHAREPOINT
// ========================================

class SharePointIntegration {
  constructor() {
    // Configuration SharePoint (à personnaliser)
    this.siteUrl = ""; // Ex: "https://enedis.sharepoint.com/sites/EssaisDEIE"
    this.libraryName = "PV d'essais"; // Nom de la bibliothèque
    this.enabled = false;
  }

  // Configurer SharePoint
  configure(siteUrl, libraryName) {
    this.siteUrl = siteUrl;
    this.libraryName = libraryName;
    this.enabled = true;
    
    // Sauvegarder la config
    localStorage.setItem("sharepointConfig", JSON.stringify({
      siteUrl,
      libraryName,
      enabled: true
    }));
    
    console.log("SharePoint configuré:", siteUrl);
  }

  // Charger la configuration
  loadConfig() {
    const config = localStorage.getItem("sharepointConfig");
    if (config) {
      const parsed = JSON.parse(config);
      this.siteUrl = parsed.siteUrl;
      this.libraryName = parsed.libraryName;
      this.enabled = parsed.enabled;
    }
  }

  // Vérifier si SharePoint est configuré
  isConfigured() {
    return this.enabled && this.siteUrl && this.libraryName;
  }

  // Upload du PV sur SharePoint
  async uploadPV(pdfBlob, fileName, metadata) {
    if (!this.isConfigured()) {
      console.warn("SharePoint non configuré");
      return { success: false, error: "SharePoint non configuré" };
    }

    try {
      // Construire l'URL de l'API SharePoint REST
      const uploadUrl = `${this.siteUrl}/_api/web/GetFolderByServerRelativeUrl('${this.libraryName}')/Files/add(url='${fileName}',overwrite=true)`;

      // Obtenir le digest de formulaire (token CSRF)
      const digestResponse = await fetch(`${this.siteUrl}/_api/contextinfo`, {
        method: "POST",
        headers: {
          "Accept": "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose"
        },
        credentials: "include"
      });

      const digestData = await digestResponse.json();
      const formDigestValue = digestData.d.GetContextWebInformation.FormDigestValue;

      // Upload du fichier
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Accept": "application/json;odata=verbose",
          "X-RequestDigest": formDigestValue
        },
        credentials: "include",
        body: pdfBlob
      });

      if (!uploadResponse.ok) {
        throw new Error(`Erreur upload: ${uploadResponse.status}`);
      }

      const uploadData = await uploadResponse.json();
      const fileUrl = uploadData.d.ServerRelativeUrl;

      // Mettre à jour les métadonnées
      await this.updateMetadata(fileUrl, metadata, formDigestValue);

      console.log("PV uploadé avec succès sur SharePoint:", fileName);
      
      return {
        success: true,
        fileUrl: `${this.siteUrl}${fileUrl}`,
        fileName: fileName
      };

    } catch (error) {
      console.error("Erreur upload SharePoint:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Mettre à jour les métadonnées du fichier
  async updateMetadata(fileUrl, metadata, formDigestValue) {
    try {
      const itemUrl = `${this.siteUrl}/_api/web/GetFileByServerRelativeUrl('${fileUrl}')/ListItemAllFields`;

      // Préparer les métadonnées
      const metadataBody = {
        __metadata: { type: "SP.Data.PV_x0020_d_x0027_essaisItem" }, // À adapter selon le nom de la liste
        Title: metadata.nomSite || "PV DEIE",
        CodeGDO: metadata.codeGDO || "",
        NomSite: metadata.nomSite || "",
        DateControle: metadata.dateControle || "",
        Technicien: metadata.technicien || "",
        Conformite: metadata.conformite || "",
        TypeProtection: metadata.protection || "",
        Motif: metadata.motif || "",
        BaseEnedis: metadata.baseEnedis || ""
      };

      const response = await fetch(itemUrl, {
        method: "POST",
        headers: {
          "Accept": "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose",
          "X-RequestDigest": formDigestValue,
          "X-HTTP-Method": "MERGE",
          "IF-MATCH": "*"
        },
        credentials: "include",
        body: JSON.stringify(metadataBody)
      });

      if (!response.ok) {
        console.warn("Métadonnées non mises à jour (peut nécessiter configuration des colonnes)");
      }

    } catch (error) {
      console.warn("Erreur mise à jour métadonnées:", error);
    }
  }

  // Ouvrir le fichier sur SharePoint
  openInSharePoint(fileUrl) {
    window.open(fileUrl, "_blank");
  }

  // Télécharger la liste des PV depuis SharePoint
  async getPVList(filter = null) {
    if (!this.isConfigured()) {
      return { success: false, error: "SharePoint non configuré" };
    }

    try {
      let queryUrl = `${this.siteUrl}/_api/web/lists/getbytitle('${this.libraryName}')/items?$select=*&$orderby=Created desc`;
      
      if (filter) {
        queryUrl += `&$filter=${filter}`;
      }

      const response = await fetch(queryUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json;odata=verbose"
        },
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error(`Erreur récupération: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        items: data.d.results
      };

    } catch (error) {
      console.error("Erreur récupération liste:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Instance globale
window.sharePointIntegration = new SharePointIntegration();
window.sharePointIntegration.loadConfig();
