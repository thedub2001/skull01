// App.tsx
import React from 'react';
import { create, Workbench } from '@dtinsight/molecule';
import molecule from '@dtinsight/molecule';
import type { IExtension, IFolderTreeNodeProps } from '@dtinsight/molecule/esm/model';
import type { IExtensionService } from '@dtinsight/molecule/esm/services';
import MDPreview from './components/MDPreview';   // <== ton composant existant
import '@dtinsight/molecule/esm/style/mo.css';

const LEFT_PANEL_ID = 1;
const RIGHT_PANEL_ID = 2;

class EditorManagementExtension implements IExtension {
    id = 'EditorManagementExtension';
    name = 'Gestion Éditeur Monaco avec FolderTree + Markdown Preview';

    activate(extensionCtx: IExtensionService) {
        console.log('📝 Extension activée');
        this.initFolderTreeWithSampleFiles();
        this.setupFolderTreeEvents();
        this.setupEditorEvents();
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
                // ouverture normale à gauche
                molecule.editor.open({
                    id: file.id,
                    name: file.name,
                    data: file.data,
                    icon: this.getFileIcon(file.name),
                }, LEFT_PANEL_ID);

                // si c'est un .md → ouvrir preview à droite
                if (file.name.endsWith('.md')) {
                    const previewTab = {
                        id: `preview-${file.id}`,
                        name: 'Preview',
                        closable: true,
                        renderPane: () => (
                            <MDPreview fileId={file.id} />
                        ),
                    };
                    molecule.editor.open(previewTab, RIGHT_PANEL_ID);
                }
            }
        });
    }

    private setupEditorEvents() {
        // écouter les updates pour mettre à jour la preview
        molecule.editor.onUpdateTab((tab) => {
            if (tab && tab.data?.language === 'markdown') {
                console.log('[preview][update]', tab);

                // on force un refresh du composant Preview en recréant l’onglet
                const previewId = `preview-${tab.id}`;
                const existing = molecule.editor.getTabById(previewId, RIGHT_PANEL_ID);
                if (existing) {
                    molecule.editor.updateTab(
                        { ...existing, renderPane: () => <MDPreview fileId={tab.id} /> },
                        RIGHT_PANEL_ID
                    );
                }
            }
        });
    }

    private getFileIcon(fileName: string): string {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'md': return 'markdown';
            case 'ts': return 'symbol-class';
            case 'css': return 'symbol-color';
            case 'json': return 'symbol-property';
            case 'html': return 'symbol-misc';
            case 'js': return 'symbol-method';
            default: return 'file';
        }
    }

    dispose() {
        console.log('🧹 Extension nettoyée');
    }
}

const moInstance = create({
    extensions: [new EditorManagementExtension()],
});

const App: React.FC = () => {
    return moInstance.render(<Workbench />);
};

export default App;