// App.tsx - Explorer et FolderTree
import React from 'react';
import { create, Workbench } from '@dtinsight/molecule';
import molecule from '@dtinsight/molecule';
import type { IExtension, IFolderTreeNodeProps } from '@dtinsight/molecule/esm/model';
import '@dtinsight/molecule/esm/style/mo.css';

// Extension pour gérer l'explorateur de fichiers
class FolderTreeExtension implements IExtension {
    id: string = 'FolderTreeDemo';
    name: string = 'Folder Tree Demo';

    activate(): void {
        console.log('📁 Activation de l\'extension FolderTree');
        this.initFolderTree();
        this.setupEventListeners();
        this.addExplorerActions();
    }

    dispose(): void {
        console.log('🗑️ Disposal de l\'extension FolderTree');
    }

    // Initialisation de l'arbre de fichiers avec des données de test
    initFolderTree() {
        const mockData: IFolderTreeNodeProps = {
            id: 'root',
            name: 'Mon Projet',
            fileType: 'RootFolder',
            location: '/mon-projet',
            isLeaf: false,
            children: [
                {
                    id: 'src',
                    name: 'src',
                    fileType: 'Folder',
                    location: '/mon-projet/src',
                    isLeaf: false,
                    children: [
                        {
                            id: 'app.tsx',
                            name: 'App.tsx',
                            fileType: 'File',
                            location: '/mon-projet/src/App.tsx',
                            isLeaf: true,
                            data: {
                                value: '// Mon fichier App.tsx\nconsole.log("Hello World");',
                                language: 'typescript'
                            }
                        },
                        {
                            id: 'style.css',
                            name: 'style.css',
                            fileType: 'File',
                            location: '/mon-projet/src/style.css',
                            isLeaf: true,
                            data: {
                                value: '/* Mes styles CSS */\nbody { margin: 0; }',
                                language: 'css'
                            }
                        }
                    ]
                },
                {
                    id: 'public',
                    name: 'public',
                    fileType: 'Folder',
                    location: '/mon-projet/public',
                    isLeaf: false,
                    children: [
                        {
                            id: 'index.html',
                            name: 'index.html',
                            fileType: 'File',
                            location: '/mon-projet/public/index.html',
                            isLeaf: true,
                            data: {
                                value: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Mon App</title>\n</head>\n<body>\n  <div id="root"></div>\n</body>\n</html>',
                                language: 'html'
                            }
                        }
                    ]
                },
                {
                    id: 'readme.md',
                    name: 'README.md',
                    fileType: 'File',
                    location: '/mon-projet/README.md',
                    isLeaf: true,
                    data: {
                        value: '# Mon Projet\n\nCeci est un projet de test pour Molecule.\n\n## Installation\n\n```bash\nnpm install\n```',
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

    // Configuration des écouteurs d'événements
    setupEventListeners() {
        // Écouter la sélection de fichier
        molecule.folderTree.onSelectFile((file: IFolderTreeNodeProps) => {
            console.log('📄 Fichier sélectionné:', file);
            
            if (file.isLeaf && file.data) {
                // Ouvrir le fichier dans l'éditeur
                molecule.editor.open({
                    id: file.id,
                    name: file.name,
                    data: file.data,
                    icon: this.getFileIcon(file.name)
                });
                console.log('📝 Fichier ouvert dans l\'éditeur');
            }
        });

        // Écouter la création de nœud
        molecule.folderTree.onCreate((type, nodeId) => {
            console.log('➕ Création de nœud:', { type, nodeId });
            // Vous pourriez ici ouvrir une boîte de dialogue pour nommer le nouveau fichier/dossier
        });

        // Écouter la suppression de nœud
        molecule.folderTree.onRemove((nodeId) => {
            console.log('🗑️ Suppression de nœud:', nodeId);
        });

        // Écouter le renommage
        molecule.folderTree.onRename((nodeId, name) => {
            console.log('✏️ Renommage:', { nodeId, nouveauNom: name });
        });
    }

    // Ajouter des actions personnalisées à l'Explorer
    addExplorerActions() {
        // Action pour rafraîchir
        molecule.explorer.addAction({
            id: 'refresh-action',
            name: 'Rafraîchir',
            icon: 'refresh',
            title: 'Rafraîchir l\'arbre des fichiers'
        });

        // Action pour ajouter un fichier
        molecule.explorer.addAction({
            id: 'new-file-action', 
            name: 'Nouveau Fichier',
            icon: 'new-file',
            title: 'Créer un nouveau fichier'
        });

        // Écouter les clics sur les actions de la barre d'outils
        molecule.explorer.onPanelToolbarClick((panel, toolbarId) => {
            console.log('🔧 Action toolbar cliquée:', { panel: panel.name, toolbarId });
            
            switch (toolbarId) {
                case 'refresh-action':
                    this.refreshFolderTree();
                    break;
                case 'new-file-action':
                    this.createNewFile();
                    break;
            }
        });
    }

    // Méthodes utilitaires
    refreshFolderTree() {
        console.log('🔄 Rafraîchissement de l\'arbre des fichiers');
        // Ici vous pourriez recharger les données depuis une API
    }

    createNewFile() {
        const newFileId = 'new-file-' + Date.now();
        const newFile: IFolderTreeNodeProps = {
            id: newFileId,
            name: 'nouveau-fichier.txt',
            fileType: 'File',
            location: '/mon-projet/nouveau-fichier.txt',
            isLeaf: true,
            data: {
                value: '// Nouveau fichier créé le ' + new Date().toLocaleString(),
                language: 'text'
            }
        };

        console.log('📄 Création d\'un nouveau fichier:', newFile);
        // Ajouter le fichier à la racine
        molecule.folderTree.add(newFile, 'root');
    }

    getFileIcon(fileName: string): string {
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'tsx':
            case 'ts':
                return 'symbol-class';
            case 'css':
                return 'symbol-color';
            case 'html':
                return 'symbol-misc';
            case 'md':
                return 'markdown';
            default:
                return 'file';
        }
    }
}

// Instance Molecule avec l'extension
const moInstance = create({
    extensions: [new FolderTreeExtension()],
});

const App = () => {
    console.log('🎨 Rendu de l\'App avec FolderTree');
    return moInstance.render(<Workbench />);
};

export default App;