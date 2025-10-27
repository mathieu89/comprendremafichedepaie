import OpenAI from "openai";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker - utiliser le worker depuis le dossier public
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

/**
 * Convertit un fichier en base64
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Convertit un PDF en image PNG (première page)
 */
export const pdfToImage = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1); // Première page

        // Définir l'échelle pour une bonne qualité
        const scale = 2;
        const viewport = page.getViewport({ scale });

        // Créer un canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Rendre la page sur le canvas
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        // Convertir le canvas en base64
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error("Erreur lors de la conversion PDF en image:", error);
        throw new Error("Impossible de convertir le PDF en image");
    }
};

/**
 * Extrait les données d'une fiche de paie via OpenAI Vision API
 */
export const extractPayslipData = async (file) => {
    try {
        let base64Data;
        
        // Vérifier si c'est un PDF et le convertir en image
        if (file.type === 'application/pdf') {
            base64Data = await pdfToImage(file);
        } else {
            // Si c'est déjà une image, utiliser directement
            base64Data = await fileToBase64(file);
        }

        // Créer le prompt pour extraire les données
        const prompt = `Tu es un expert en analyse de fiches de paie françaises.
Analyse la fiche de paie fournie en extrayant TOUS les montants de manière fiable, 
et génère un JSON exhaustif avec la structure ci-dessous.

⚠️ RÈGLES D’EXTRACTION TRÈS IMPORTANTES :

1. **DISTINCTION ENTRE COLONNES**
   - Ne JAMAIS mélanger les cotisations SALARIALES (colonne "A déduire") et PATRONALES (colonne "Charges patronales").
   - Si une même ligne apparaît des deux côtés :
        → le montant "A déduire" va dans "employeeContributions"
        → le montant "Charges patronales" va dans "employerContributions"
   - Si une ligne n'apparaît que dans une colonne, **ne crée pas l'autre côté par inférence**.

2. **ANCRAGE PAR COLONNE**
   - Seules les lignes présentes dans la colonne "A déduire" peuvent être classées en "employeeContributions"
   - Seules les lignes présentes dans la colonne "Charges patronales" peuvent être classées en "employerContributions"

3. **ANCRAGE PAR SECTION**
   - Chaque bloc commence par un intitulé de section explicite (ex : Santé, Retraite, Famille, Assurance chômage, Cotisations statutaires, Autres contributions…).
   - Une ligne appartient STRICTEMENT à la section en cours jusqu'à l'apparition d'un nouveau titre de section.
   - Ne jamais faire "déborder" une ligne d'une section précédente (ex : les lignes "Autres contributions dues par l'employeur" ne peuvent jamais être classées sous "Santé").

4. **CATÉGORISATION PAR MOTS-CLÉS**
   - Une fois la section identifiée, classe la ligne dans la bonne sous-catégorie du JSON selon les mots-clés suivants :
     - Santé → Maladie, Maternité, Invalidité, Incapacité, Décès, Santé, Mutuelle, Accidents du travail
     - Retraite → Sécurité Sociale plafonnée, déplafonnée, Complémentaire, Tranche 1/2, Agirc-Arrco
     - Famille → Famille, Allocations familiales
     - Chômage → Assurance chômage, APEC
     - CSE → CSE, Comité, fonctionnement, activités sociales
     - Autres → Formation, mobilité, ADESATT, taxes, restauration, Autres contributions dues par l'employeur, etc.

5. **EXCLUSIONS**
   - Les lignes commençant par "Autres contributions dues par l'employeur" vont TOUJOURS dans "employerContributions.other", jamais dans "health"
   - "Chômage" ne va dans "employeeContributions" que s'il est visiblement présent dans la colonne "A déduire"
   - "Sécurité Sociale - Mal. Mat. Inval. Décès" va dans "employerContributions.health" uniquement si elle figure dans la colonne "Charges patronales"

6. **LIGNES UNIQUES**
   - Si un intitulé apparaît deux fois (bases différentes), conserve chaque occurrence séparément avec son montant.
   - Si une ligne a deux montants (gauche/droite), crée deux lignes distinctes : une par colonne.

7. **TOTAUX**
   - "employerContributions.total" = somme stricte de toutes les lignes patronales
   - "employeeContributions.total" = somme stricte de toutes les lignes salariales
   - Vérifie que :
        → La somme de toutes les cotisations patronales = “Total des cotisations et contributions” côté employeur.
        → La somme de toutes les cotisations salariales = “Total des cotisations et contributions” côté salarié.

8. **CONTRÔLES D’INTÉGRITÉ**
   - Si une ligne est classée dans une mauvaise catégorie (ex : santé alors qu’elle contient “Autres contributions”), rejette-la et reclasse-la selon les règles ci-dessus.
   - Si la somme des lignes d’une catégorie dépasse le total de la colonne correspondante, vérifie qu’aucune ligne n’a été dupliquée ou comptée deux fois.

---

### STRUCTURE À RETOURNER

{
  "employeeName": "Nom et prénom de l'employé",
  "period": "Mois et année (format: janvier 2024)",
  "grossSalary": montant du salaire brut (ligne “Salaire brut”),
  "netSalaryBeforeTax": montant du net avant impôt (ligne “Net à payer avant impôt sur le revenu”),
  "netSalaryAfterTax": montant du net payé (ligne “Net payé”),

  "employerContributions": {
    "total": SOMME de toutes les cotisations ou charges patronales,
    "health": {
      "total": SOMME des lignes santé employeur,
      "lines": [
        {"name": "nom exact de la ligne", "amount": montant}
      ]
    },
    "retirement": {
      "total": SOMME des lignes retraite employeur,
      "lines": [{"name": "nom exact de la ligne", "amount": montant}]
    },
    "family": {
      "total": SOMME de la ligne Famille,
      "lines": [{"name": "nom exact de la ligne", "amount": montant}]
    },
    "unemployment": {
      "total": SOMME des lignes chômage employeur,
      "lines": [{"name": "nom exact de la ligne", "amount": montant}]
    },
    "cse": {
      "total": SOMME des lignes CSE employeur,
      "lines": [{"name": "nom exact", "amount": montant}]
    },
    "other": {
      "total": SOMME des autres lignes employeur (formation, mobilité, ADESATT, taxes, restauration, etc.),
      "lines": [{"name": "nom exact de la ligne", "amount": montant}]
    }
  },

  "employeeContributions": {
    "total": SOMME de toutes les cotisations salariales,
    "health": {
      "total": SOMME santé salarié,
      "lines": [{"name": "nom exact de la ligne", "amount": montant}]
    },
    "retirement": {
      "total": SOMME retraite salarié,
      "lines": [{"name": "nom exact de la ligne", "amount": montant}]
    },
    "unemployment": {
      "total": SOMME chômage salarié (exclure “Chômage” si absent de la colonne “A déduire”),
      "lines": [{"name": "nom exact de la ligne", "amount": montant}]
    },
    "csgCrds": {
      "total": SOMME CSG/CRDS,
      "lines": [{"name": "nom exact", "amount": montant}]
    },
    "other": {
      "total": SOMME autres salarié (Titres restaurant, Cantine, Repas, etc.),
      "lines": [{"name": "nom exact", "amount": montant}]
    }
  },

  "superGross": grossSalary + employerContributions.total,

  "withholdingTax": {
    "amount": montant de l’impôt prélevé à la source,
    "line": "Impôt sur le revenu prélevé à la source - PAS",
    "rate": taux appliqué en pourcentage
  }
}

---

⚠️ Retourne UNIQUEMENT le JSON valide, sans texte avant ni après.  
Aucune phrase, aucun commentaire.
`;

        // Appeler l'API OpenAI Vision avec GPT-5
        const response = await openai.chat.completions.create({
            model: "gpt-5",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: base64Data,
                            },
                        },
                    ],
                },
            ],
            max_completion_tokens: 4000,
        });

        // Extraire et parser la réponse JSON
        const content = response.choices[0].message.content;
        console.log("🤖 Réponse brute de GPT-5:", content.substring(0, 200) + "...");
        
        // GPT-5 peut retourner du texte avant/après le JSON - extraction robuste
        let jsonContent = content.trim();
        
        // Étape 1: Retirer les markdown code blocks si présents
        if (jsonContent.includes('```json')) {
            const regex = /```json\s*([\s\S]*?)\s*```/;
            const match = regex.exec(jsonContent);
            if (match) {
                jsonContent = match[1].trim();
                console.log("📦 JSON extrait d'un code block markdown");
            }
        } else if (jsonContent.includes('```')) {
            const regex = /```\s*([\s\S]*?)\s*```/;
            const match = regex.exec(jsonContent);
            if (match) {
                jsonContent = match[1].trim();
                console.log("📦 JSON extrait d'un code block");
            }
        }
        
        // Étape 2: Extraire le JSON en trouvant le premier { et le dernier } correspondant
        const firstBrace = jsonContent.indexOf('{');
        const lastBrace = jsonContent.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            jsonContent = jsonContent.substring(firstBrace, lastBrace + 1);
            console.log("🎯 JSON extrait entre accolades (longueur:", jsonContent.length, "caractères)");
        }
        
        // Étape 3: Nettoyer les trailing commas (virgules en trop avant } ou ])
        // Cela corrige les erreurs JSON comme: {"key": "value",} ou ["item",]
        jsonContent = jsonContent
            // Retirer virgules avant }
            .replaceAll(/,(\s*})/g, '$1')
            // Retirer virgules avant ]
            .replaceAll(/,(\s*])/g, '$1')
            // Retirer virgules multiples
            .replaceAll(/,+/g, ',');
        
        console.log("✨ JSON nettoyé prêt pour le parsing");
        console.log("📄 Aperçu:", jsonContent.substring(0, 300) + "...");
        
        const data = JSON.parse(jsonContent);
        console.log("✅ JSON parsé avec succès!");
        
        return {
            success: true,
            data: data,
        };
    } catch (error) {
        console.error("Erreur lors de l'extraction des données:", error);
        return {
            success: false,
            error: error.message || "Une erreur est survenue lors de l'analyse de la fiche de paie",
        };
    }
};

