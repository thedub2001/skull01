// rename this file to "app.tsx"
import React from 'react';
import { create, Workbench } from '@dtinsight/molecule';
import '@dtinsight/molecule/esm/style/mo.css';

// Extension basique pour comprendre le cycle de vie
const BasicExtension = {
    id: 'BasicExtension',
    name: 'Mon Extension de Base',
    
    activate(extensionCtx: any) {
        console.log('🚀 Extension activée!');
        console.log('Context de l\'extension:', extensionCtx);
        
        // Ajout d'un élément dans la status bar
        const statusBarItem = {
            id: 'hello-status',
            name: 'Hello Molecule!',
        };
        
        // Utilisation du service molecule global
        (window as any).molecule?.statusBar?.add(statusBarItem, 'right');
        console.log('📊 Élément ajouté à la status bar');
    },
    
    dispose(extensionCtx: any) {
        console.log('🧹 Extension nettoyée');
        (window as any).molecule?.statusBar?.remove('hello-status', 'right');
    }
};

// Configuration principale
const moInstance = create({
    extensions: [BasicExtension],
});

// Hook avant l'initialisation
moInstance.onBeforeInit(() => {
    console.log('⚡ Avant initialisation de Molecule');
    
    // Désactiver certains modules built-in si nécessaire
    // molecule.builtin.inactiveModule('activityBarData');
});

// Hook avant le chargement des extensions
moInstance.onBeforeLoad(() => {
    console.log('📦 Avant chargement des extensions');
});

const App: React.FC = () => {
    React.useEffect(() => {
        console.log('🔥 App React montée');
        
        // Accès global à molecule après le montage
        setTimeout(() => {
            if ((window as any).molecule) {
                console.log('🌐 Molecule disponible globalement:', (window as any).molecule);
            }
        }, 1000);
    }, []);

    return moInstance.render(<Workbench />);
};

export default App;