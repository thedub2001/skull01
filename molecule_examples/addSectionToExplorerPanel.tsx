// app.tsx
import React from 'react';
import { create, Workbench } from '@dtinsight/molecule';
import '@dtinsight/molecule/esm/style/mo.css';
import molecule from '@dtinsight/molecule';

const ExplorerActionExtension = {
    id: 'ExplorerActionExtension',
    name: 'Extension Explorer Action',

    activate() {
        console.log('🚀 Extension ExplorerAction activée');

        // Panel custom avec une action "coeur"
        const myPanel = {
            id: 'my-explorer-panel',
            name: 'Mon Panel',
            sortIndex: 20,
            toolbar: [
                {
                    id: 'say-hello-action',
                    title: 'Dire Hello', // tooltip au survol
                    icon: 'heart',       // icône affichée
                },
            ],
        };

        // Ajout du panel à l'explorer
        molecule.explorer.addPanel(myPanel);
        console.log('➕ Panel avec bouton coeur ajouté');

        // Listener global pour tous les toolbars de panel
        molecule.explorer.onPanelToolbarClick((panelId, action) => {
            console.log('[click] Panel:', panelId, 'Action:', action);

            if (action.id === 'say-hello-action') {
                alert('❤️ Hello depuis Explorer Panel !');
            }
        });
    },

    dispose() {
        console.log('🧹 Nettoyage ExplorerActionExtension');
        molecule.explorer.removePanel('my-explorer-panel');
    },
};

// Création instance Molecule
const moInstance = create({
    extensions: [ExplorerActionExtension],
});

const App: React.FC = () => {
    React.useEffect(() => {
        console.log('🔥 App React montée');
    }, []);

    return moInstance.render(<Workbench />);
};

export default App;
