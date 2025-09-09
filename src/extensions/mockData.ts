// src/mockData.ts
import type { IFolderTreeNodeProps } from '@dtinsight/molecule/esm/model';

/**
 * Données de test pour le FolderTree
 * - à remplacer plus tard par une vraie persistence (DB, API, etc.)
 */
export const mockData: IFolderTreeNodeProps = {
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
`,
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
- **.txt** : Fichiers texte simple
- **.md** : Markdown (comme celui-ci)
- **.js** : JavaScript basique
- **.json** : Configuration JSON

## Conseils
1. Commencez par les fichiers texte
2. Testez les fonctionnalités une par une
3. Utilisez la console pour débugger`,
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
            id: 'readme-md',
            name: 'README.md',
            fileType: 'File',
            location: '/workspace/README.md',
            isLeaf: true,
            data: {
                value: `# Molecule Demo

Ceci est un projet de démonstration pour explorer les fonctionnalités de **Molecule**.`,
                language: 'markdown'
            }
        }
    ]
};
