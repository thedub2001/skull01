# Projet : Réseau 3D d'idées et de relations

## 🎯 Objectif
Créer une application interactive en 3D pour modéliser des réseaux d'idées, avec :
- une hiérarchie illimitée (type arbre/catégories),
- des relations multiples (amicales, professionnelles, etc.),
- des fichiers attachables aux nœuds,
- une base de données évolutive,
- une visualisation en 3D fluide et expressive.

---

## 🛠️ Tâches à réaliser (ordre logique)

### 1. ✅ Affichage du bouton
- Remplacer le texte "Ajouter sous 'id'" par "Ajouter sous 'label'" pour une meilleure lisibilité.

### 2. 🔁 Interaction sur les boules et les liens
- Rendre les **nœuds (boules)** et **liens** cliquables **plusieurs fois** (éviter les bugs liés aux événements).
- Afficher une **mise en surbrillance** (effet visuel clair) lors d’un clic ou d’une sélection.

### 3. 🔗 Relations non hiérarchiques
- Ajouter la possibilité de définir des **relations autres que parent-enfant**, par exemple :
  - amicales,
  - professionnelles,
  - philosophiques,
  - personnalisées par l’utilisateur.
- Chaque relation doit avoir un **type**, une **couleur** spécifique et des métadonnées optionnelles.

### 4. 🗂️ Gestion de fichiers et export
- Pouvoir attacher **un ou plusieurs fichiers** (PDF, image, audio, texte, etc.) à un nœud.
- Stocker les fichiers dans une base de données (ou système de fichiers structuré).
- Pouvoir générer **un dossier local** (export) d’une **branche sélectionnée**, contenant :
  - tous les fichiers des nœuds enfants,
  - un fichier JSON ou Markdown récapitulatif.

### 5. 🔎 Moteur de recherche
- Permettre des **requêtes intelligentes** sur le réseau, du type :
  - « Montre les relations amicales des enfants de "Jackie" »
  - « Trouve les nœuds liés par une relation professionnelle depuis "nœud X" »
- Résultat : mise en surbrillance dynamique sur le graphe.

### 6. 🔍 Recherche inversée (inférence)
- Sélectionner plusieurs nœuds et liens, et demander :
  - « Quelles sont les **relations communes** ou évidentes ? »
  - « Quels sont les **chemins relationnels probables** entre ces éléments ? »

### 7. 🧬 Conception de la base de données évolutive
- Concevoir une **base de données extensible** tout en continuant le développement.
- Gérer les **évolutions de structure JSON** (versionnage, migration).
- Stratégie :
  - Ajout d’un champ `version` dans chaque nœud.
  - Migration automatique via scripts lors du chargement.
  - Sauvegarde dans `localStorage` puis dans une BDD (ex: SQLite, IndexedDB, Supabase, etc.)

---

## 💡 Suggestions & pistes futures

- Ajout d’un **mode édition rapide** (drag & drop, renommage, suppression sur clic).
- **Historique des modifications** / annuler / refaire.
- **Affichage chronologique** ou topologique alternatif.
- Mode collaboratif (plusieurs utilisateurs).
- Plugin d’analyse automatique du graphe (clustering, centralité, etc.).
- Génération automatique de **mindmaps** exportables en PDF ou Markdown.

---

## 🧠 Format JSON cible (exemple)

```json
{
  "version": 2,
  "nodes": [
    {
      "id": "n1",
      "label": "Jackie",
      "level": 0,
      "files": ["intro.pdf"],
      "metadata": { "type": "person", "tags": ["important"] }
    }
  ],
  "links": [
    {
      "source": "n1",
      "target": "n2",
      "type": "amical",
      "label": "connaît depuis 2008"
    }
  ]
}
````

---

## ✅ État actuel

* [x] Affichage du réseau 3D interactif avec ajout dynamique de nœuds.
* [x] Sauvegarde dans le localStorage.
* [x] Rendu visuel lié au niveau hiérarchique.
* [x] Système de couleur algorithmique (`f(niveau) → couleur` via HSL).
* [ ] Début du versionnage / refactor JSON / DB à venir.

---

## 📌 Pour ChatGPT (contexte minimal à charger pour continuer le projet)

* Stack : React + Vite + TypeScript + 3d-force-graph
* Code principal : `Graph3DApp.tsx`
* Objectif : réseau d’idées visualisé en 3D, extensible, riche sémantiquement, avec interactions complexes.
* Ce fichier `README.md` sert de roadmap technique ET de contexte minimal à réinjecter dans une future session.

---

## 🧭 Conseils stratégiques de ChatGPT pour ce projet de **réseau 3D interactif**

### 1. **Affirme l’idée de navigation spatiale comme interface principale**

> 💡 Le réseau **n’est pas un reflet** de la base de données : il **est** l’interface.

* Organise les interactions autour du **parcours** : zoom, filtrage contextuel, sélection multi-nœuds, surbrillance dynamique.
* Adopte un modèle d’**exploration / capture / association** des idées.
* N’hésite pas à donner au graphe une "inertie poétique" (ex. : le réseau se réorganise doucement selon l’axe du temps ou des niveaux hiérarchiques).

---

### 2. **Penser le graphe comme un outil de dialogue avec les données**

> Ce n’est pas juste une visualisation, c’est un **outil de questionnement**.

* Intègre une **recherche sémantique** : "montre-moi les relations amicales entre les concepts de niveau 2".
* Permets à l’utilisateur de **formuler des requêtes naturelles** → ex. "quelles sont les entités isolées ?" ou "que manque-t-il autour de ce nœud ?".
* Rends possible une **recherche inversée** : sélection de nœuds → suggestion de liens probables (avec pondération).

---

### 3. **Modularité des types de liens**

> Ne te limite pas aux relations hiérarchiques. Le monde réel est **réseau non-orienté partiellement typé**.

* Implémente rapidement une **typologie des liens** : hiérarchique, amical, juridique, logique, critique, etc.
* Affiche-les visuellement (couleur, style, épaisseur).
* Permets de filtrer/afficher selon type de lien.

---

### 4. **Système de fichiers augmentés**

> Un nœud doit pouvoir **contenir** des ressources (PDF, notes, images, etc.) et aussi **être** un raccourci vers un espace physique (dossier, URL).

* Intégration d’un mini-système de fichiers ou de métadonnées attachées à un nœud.
* Option de **générer un dossier complet** à partir d’une branche sélectionnée (pratique pour du partage ou de la compilation).
* Génération de **résumés textuels** ou de **cartes de concepts** depuis une branche.

---

### 5. **Sauvegarde et persistance évolutives**

> Ton graphe est une matière vivante. Il doit muter avec toi, sans casser.

* Anticipe un système de **migration du schéma JSON** (ex. : versionner les structures).
* Permets un **dump complet de l’état du graphe** dans un fichier exportable.
* Penche-toi tôt sur une **sauvegarde persistante** (base de données embarquée type SQLite ou stockage cloud).

---

### 6. **Minimap 3D affichant la position et l’orientation de la caméra principale**

* Afficher une vue simplifiée du graphe (noeuds + liens)
* Marquer la position de la caméra principale par un curseur ou un icône
* Mettre à jour en temps réel lors des déplacements de caméra
* Permettre éventuellement un contrôle rapide de la caméra via la minimap (optionnel)

---

### 07. **une même BDD pour des utilisateurs multiples**

* Policies basées sur auth.uid().
* multitenant (gestion centralisée, billing groupé, scalabilité)
* requêter des données croisées
* faire de l'admin

---

## 🛰 Quelques projets et idées voisines pour s’inspirer

| Projet / Outil                 | Idée à piller                                         |
| ------------------------------ | ----------------------------------------------------- |
| **Obsidian** (avec graph view) | Connexion libre entre notes, mais limité visuellement |
| **Roam Research**              | Navigation dans les pensées par backlinks             |
| **Kumu.io**                    | Visualisation relationnelle d’écosystèmes             |
| **Gephi**                      | Manipulation de grands graphes orientés               |
| **Neo4j Browser**              | Visualisation + requêtage sur graphe                  |
| **TheBrain**                   | Organisation de la pensée par graphe navigable        |