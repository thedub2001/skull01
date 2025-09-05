// App.tsx
import React from 'react';
import { create, Workbench } from '@dtinsight/molecule';
import molecule from '@dtinsight/molecule';
import type { IExtension, IFolderTreeNodeProps } from '@dtinsight/molecule/esm/model';
import type { IExtensionService } from '@dtinsight/molecule/esm/services';
import MDPreview from './components/MDPreview';
import '@dtinsight/molecule/esm/style/mo.css';

const LEFT_PANEL_ID = 1;
const RIGHT_PANEL_ID = 2;

// Extension complète pour gérer l'éditeur Monaco avec FolderTree et Preview Markdown
class EditorManagementExtension implements IExtension {
    id = 'EditorManagementExtension';
    name = 'Gestion Éditeur Monaco avec FolderTree et Markdown Preview';
    private currentMarkdownTabId: string | null = null;

    activate(extensionCtx: IExtensionService) {
        console.log('📝 Extension Éditeur avec FolderTree et Markdown Preview activée');

        this.initFolderTreeWithSampleFiles();
        this.setupFolderTreeEvents();
        this.setupEditorEvents();
        this.addExplorerActions();
        this.setupCustomActions();
    }

    private initFolderTreeWithSampleFiles() {
        const mockData: IFolderTreeNodeProps = {
            id: 'root',
            name: 'Mon Workspace',
            fileType: 'RootFolder',
            location: '/workspace',
            isLeaf: false,
            children: [
                {
                    id: 'src',
                    name: 'src',
                    fileType: 'Folder',
                    location: '/workspace/src',
                    isLeaf: false,
                    children: [
                        {
                            id: 'sample-ts',
                            name: 'example.ts',
                            fileType: 'File',
                            location: '/workspace/src/example.ts',
                            isLeaf: true,
                            data: {
                                value: `// Exemple TypeScript
interface User {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
}

class UserService {
    private users: User[] = [];

    addUser(user: Omit<User, 'id'>): User {
        const newUser: User = {
            id: this.users.length + 1,
            ...user
        };
        this.users.push(newUser);
        console.log('Utilisateur ajouté:', newUser);
        return newUser;
    }

    getUserById(id: number): User | undefined {
        return this.users.find(user => user.id === id);
    }

    getActiveUsers(): User[] {
        return this.users.filter(user => user.isActive);
    }
}

// Utilisation
const userService = new UserService();
const newUser = userService.addUser({
    name: 'John Doe',
    email: 'john@example.com',
    isActive: true
});

console.log('Nouvel utilisateur:', newUser);
console.log('Utilisateurs actifs:', userService.getActiveUsers());`,
                                language: 'typescript'
                            }
                        },
                        {
                            id: 'sample-css',
                            name: 'styles.css',
                            fileType: 'File',
                            location: '/workspace/src/styles.css',
                            isLeaf: true,
                            data: {
                                value: `/* Styles pour l'application */
:root {
  --primary-color: #007acc;
  --secondary-color: #f0f0f0;
  --text-color: #333;
  --border-radius: 4px;
}

* {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 0;
  background-color: var(--secondary-color);
  color: var(--text-color);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.button:hover {
  background-color: #005999;
}

.button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 16px;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  .button {
    width: 100%;
  }
}`,
                                language: 'css'
                            }
                        }
                    ]
                },
                {
                    id: 'docs',
                    name: 'docs',
                    fileType: 'Folder',
                    location: '/workspace/docs',
                    isLeaf: false,
                    children: [
                        {
                            id: 'simple-md',
                            name: 'guide.md',
                            fileType: 'File',
                            location: '/workspace/docs/guide.md',
                            isLeaf: true,
                            data: {
                                value: `# Guide d'utilisation Molecule

## Introduction

Ce guide vous aide à comprendre les bases de Molecule.

## Fichiers sans problème

Les fichiers suivants fonctionnent parfaitement :
- **.txt** : Fichiers texte simple
- **.md** : Markdown (comme celui-ci)
- **.js** : JavaScript basique
- **.json** : Configuration JSON

## Conseils

1. Commencez par les fichiers texte
2. Testez les fonctionnalités une par une
3. Utilisez la console pour débugger

## Live Preview

Ce fichier Markdown dispose maintenant d'une **prévisualisation en temps réel** ! 🎉

Bon développement !`,
                                language: 'markdown'
                            }
                        }
                    ]
                },
                {
                    id: 'public',
                    name: 'public',
                    fileType: 'Folder',
                    location: '/workspace/public',
                    isLeaf: false,
                    children: [
                        {
                            id: 'simple-html',
                            name: 'demo.html',
                            fileType: 'File',
                            location: '/workspace/public/demo.html',
                            isLeaf: true,
                            data: {
                                value: `<!DOCTYPE html>
<html>
<head>
    <title>Demo Simple</title>
</head>
<body>
    <h1>Demo Molecule</h1>
    <p>Page HTML simple sans CSS externe</p>
    <button onclick="alert('Ca marche!')">Test</button>
</body>
</html>`,
                                language: 'html'
                            }
                        }
                    ]
                },
                {
                    id: 'sample-json',
                    name: 'package.json',
                    fileType: 'File',
                    location: '/workspace/package.json',
                    isLeaf: true,
                    data: {
                        value: `{
  "name": "molecule-demo",
  "version": "1.0.0",
  "description": "Démonstration des fonctionnalités Molecule",
  "main": "src/App.tsx",
  "dependencies": {
    "@dtinsight/molecule": "^1.5.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^4.9.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "dev": "vite",
    "preview": "vite preview"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.0.0",
    "react-scripts": "5.0.1"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "keywords": [
    "molecule",
    "ide",
    "editor",
    "monaco",
    "react"
  ],
  "author": "Demo Developer",
  "license": "MIT"
}`,
                        language: 'json'
                    }
                },
                {
                    id: 'readme-md',
                    name: 'README.md',
                    fileType: 'File',
                    location: '/workspace/README.md',
                    isLeaf: true,
                    data: {
                        value: `# Molecule Demo avec Markdown Preview

Ceci est un projet de démonstration pour explorer les fonctionnalités de **Molecule** avec prévisualisation Markdown en temps réel.

## Qu'est-ce que Molecule ?

Molecule est un framework UI léger inspiré de VSCode qui permet de créer des IDE web modernes et extensibles.

## ✨ Nouvelles fonctionnalités

### 📋 Live Markdown Preview
- Prévisualisation en temps réel des fichiers Markdown
- Panneau double avec éditeur à gauche et preview à droite
- Synchronisation automatique lors de l'édition

## Fonctionnalités incluses

### 🌳 Explorateur de fichiers
- Navigation dans l'arborescence
- Création/suppression de fichiers
- Renommage de fichiers
- Actions contextuelles

### 📝 Éditeur Monaco
- Coloration syntaxique
- IntelliSense
- Raccourcis clavier
- Gestion multi-onglets

### 🔧 Système d'extensions
- Extensions personnalisées
- Événements et hooks
- Actions personnalisées

## Installation

\`\`\`bash
npm install @dtinsight/molecule
npm install react react-dom typescript
\`\`\`

## Utilisation de base

\`\`\`typescript
import { create, Workbench } from '@dtinsight/molecule';
import '@dtinsight/molecule/esm/style/mo.css';

const moInstance = create({
  extensions: [/* vos extensions */],
});

const App = () => moInstance.render(<Workbench />);
\`\`\`

## 🎯 Comment utiliser la prévisualisation Markdown

1. Ouvrez un fichier \`.md\` depuis l'explorateur
2. L'éditeur s'ouvre automatiquement dans le panneau de gauche
3. La prévisualisation apparaît dans le panneau de droite
4. Tapez du Markdown - la preview se met à jour en temps réel !

## Raccourcis clavier

- **Ctrl/Cmd + S**: Sauvegarder
- **Ctrl/Cmd + Z**: Annuler
- **Ctrl/Cmd + Y**: Refaire
- **Ctrl/Cmd + F**: Rechercher
- **Ctrl/Cmd + H**: Remplacer
- **Alt + Shift + F**: Formater le document
- **Ctrl/Cmd + /**: Commenter/Décommenter

## Structure du projet

\`\`\`
workspace/
├── src/
│   ├── example.ts     # Exemple TypeScript
│   └── styles.css     # Styles CSS
├── docs/
│   └── guide.md       # Guide Markdown avec preview
├── public/
│   └── demo.html      # Page HTML
├── package.json       # Configuration du projet
└── README.md          # Ce fichier
\`\`\`

## Ressources

- [Documentation officielle](https://github.com/DTStack/molecule)
- [Exemples GitHub](https://github.com/DTStack/molecule/tree/main/stories)
- [API Reference](https://dtstack.github.io/molecule/)

Bon développement avec Molecule ! 🚀`,
                        language: 'markdown'
                    }
                }
            ]
        };

        console.log('🌳 Ajout des données à FolderTree:', mockData);
        molecule.folderTree.add(mockData);

        // Activer le tri automatique
        molecule.folderTree.toggleAutoSort();
        console.log('🔄 Tri automatique activé');
    }

    private setupFolderTreeEvents() {
        molecule.folderTree.onSelectFile((file: IFolderTreeNodeProps) => {
            if (file.isLeaf && file.data) {
                // Ouvrir le fichier dans l'éditeur principal (panneau gauche)
                molecule.editor.open({
                    id: file.id,
                    name: file.name,
                    data: file.data,
                    icon: this.getFileIcon(file.name),
                    breadcrumb: [
                        { id: 'root', name: 'Workspace' },
                        { id: file.id, name: file.name },
                    ],
                }, LEFT_PANEL_ID);

                // Si c'est un fichier Markdown, ouvrir aussi la prévisualisation
                if (this.isMarkdownFile(file.name)) {
                    this.openMarkdownPreview(file.id, file.name);
                }
            }
        });

        molecule.folderTree.onRemove((nodeId) => {
            this.handleFileRemove(nodeId);
        });

        molecule.folderTree.onRename((nodeId, name) => {
            this.handleFileRename(nodeId, name);
        });
    }

    private setupEditorEvents() {
        molecule.editor.onOpenTab((tab) => {
            console.log('📂 Onglet ouvert:', tab);
        });

        molecule.editor.onCloseTab((tabId, groupId) => {
            console.log('❌ Onglet fermé:', { tabId, groupId });
            
            // Si on ferme un fichier Markdown, fermer aussi sa prévisualisation
            if (groupId === LEFT_PANEL_ID && tabId === this.currentMarkdownTabId) {
                this.closeMarkdownPreview();
            }
        });

        molecule.editor.onSelectTab((tabId, groupId) => {
            const currentTab = molecule.editor.getTabById(tabId, groupId);
            if (currentTab) {
                console.log('👆 Onglet sélectionné:', currentTab);
                
                // Si on sélectionne un fichier Markdown, s'assurer que la prévisualisation est ouverte
                if (groupId === LEFT_PANEL_ID && this.isMarkdownFile(currentTab.name)) {
                    if (this.currentMarkdownTabId !== tabId) {
                        this.openMarkdownPreview(tabId, currentTab.name);
                    }
                }
                // Si on sélectionne un fichier non-Markdown, fermer la prévisualisation
                else if (groupId === LEFT_PANEL_ID && !this.isMarkdownFile(currentTab.name)) {
                    this.closeMarkdownPreview();
                }
            }
        });

        molecule.editor.onUpdateTab((tab) => {
            console.log('🔄 Onglet mis à jour:', tab);
            
            // Si c'est le fichier Markdown actuel qui est mis à jour, 
            // la prévisualisation se mettra à jour automatiquement via MDPreview
        });
    }

    private addExplorerActions() {
        molecule.explorer.addAction({
            id: 'refresh-action',
            name: 'Rafraîchir',
            icon: 'refresh',
            title: 'Rafraîchir l\'arbre',
        });

        molecule.explorer.onPanelToolbarClick((panel, toolbarId) => {
            if (toolbarId === 'refresh-action') {
                this.refreshFolderTree();
            }
        });
    }

    private setupCustomActions() {
        console.log('⚡ Actions personnalisées activées');
    }

    // --- Méthodes Markdown Preview ---

    private isMarkdownFile(fileName: string): boolean {
        return fileName.toLowerCase().endsWith('.md');
    }

    private openMarkdownPreview(tabId: string, fileName: string) {
        console.log('🔍 Ouverture de la prévisualisation Markdown pour:', fileName);
        
        // Fermer l'ancienne prévisualisation si elle existe
        this.closeMarkdownPreview();
        
        // Ouvrir la nouvelle prévisualisation
        const previewTab = {
            id: `${tabId}-preview`,
            name: `Preview: ${fileName}`,
            closable: true,
            icon: 'eye',
            renderPane: () => <MDPreview />,
        };
        
        molecule.editor.open(previewTab, RIGHT_PANEL_ID);
        this.currentMarkdownTabId = tabId;
    }

    private closeMarkdownPreview() {
        if (this.currentMarkdownTabId) {
            const previewTabId = `${this.currentMarkdownTabId}-preview`;
            molecule.editor.closeTab(previewTabId, RIGHT_PANEL_ID);
            this.currentMarkdownTabId = null;
            console.log('❌ Prévisualisation Markdown fermée');
        }
    }

    // --- Gestion des fichiers ---

    private handleFileRemove(nodeId: string) {
        // Fermer l'onglet de l'éditeur principal
        const groupId = this.getGroupIdByTabId(nodeId);
        if (groupId) {
            molecule.editor.closeTab(nodeId, groupId);
        }

        // Si c'était un fichier Markdown, fermer aussi la prévisualisation
        if (nodeId === this.currentMarkdownTabId) {
            this.closeMarkdownPreview();
        }
    }

    private handleFileRename(nodeId: string, name: string) {
        // Mise à jour dans l'éditeur principal
        const groupId = this.getGroupIdByTabId(nodeId);
        if (groupId) {
            const tab = molecule.editor.getTabById(nodeId, groupId);
            if (tab) {
                molecule.editor.updateTab({ ...tab, name }, groupId);
            }
        }

        // Mise à jour de la prévisualisation si c'est le fichier Markdown actuel
        if (nodeId === this.currentMarkdownTabId) {
            const previewTabId = `${nodeId}-preview`;
            const previewTab = molecule.editor.getTabById(previewTabId, RIGHT_PANEL_ID);
            if (previewTab) {
                molecule.editor.updateTab({
                    ...previewTab,
                    name: `Preview: ${name}`
                }, RIGHT_PANEL_ID);
            }
        }
    }

    // --- Utils ---

    private refreshFolderTree() {
        console.log('🔄 Rafraîchir FolderTree');
    }

    private getFileIcon(fileName: string): string {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'ts':
            case 'tsx':
                return 'symbol-class';
            case 'js':
                return 'symbol-method';
            case 'css':
                return 'symbol-color';
            case 'md':
                return 'markdown';
            case 'json':
                return 'symbol-property';
            case 'html':
                return 'symbol-misc';
            default:
                return 'file';
        }
    }

    /**
     * Récupère le groupId d'un onglet ouvert à partir de son tabId.
     * Si non trouvé, retourne le groupId de l'onglet actif.
     */
    private getGroupIdByTabId(tabId: string): string | undefined {
        const state = molecule.editor.getState();

        // Chercher directement le tabId dans chaque groupe
        for (const group of state.groups) {
            if (group.data?.some((t) => t.id === tabId)) {
                return group.id as string;
            }
        }

        // Sinon, fallback : prendre le groupId actif
        if (state.current?.tab?.id) {
            return state.current.group?.id as string;
        }

        return undefined;
    }

    dispose() {
        console.log('🧹 Extension nettoyée');
    }
}

const moInstance = create({
    extensions: [new EditorManagementExtension()],
});

const App: React.FC = () => {
    React.useEffect(() => {
        console.log('🎬 Application montée avec Markdown Preview');
    }, []);

    return moInstance.render(<Workbench />);
};

export default App;