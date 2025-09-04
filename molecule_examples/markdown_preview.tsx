import React from 'react';
import { create, Workbench } from '@dtinsight/molecule';
import molecule from '@dtinsight/molecule';
import MDPreview from './components/MDPreview';
import '@dtinsight/molecule/esm/style/mo.css';

const LEFT_PANEL_ID = 1;
const RIGHT_PANEL_ID = 2;

const mdEditor = {
    id: 'md-editor',
    name: 'Markdown.md',
    closable: true,
    data: {
        language: 'markdown',
        value: `# Bienvenue dans Molecule Markdown Preview

- Éditez ce fichier
- La preview se mettra à jour automatiquement
`,
    },
};

const previewTab = {
    id: 'md-preview',
    name: 'Preview',
    closable: false,
    renderPane: () => <MDPreview />,
};

const moInstance = create({
    extensions: [],
});

const App: React.FC = () => {
    React.useEffect(() => {
        molecule.editor.open(mdEditor, LEFT_PANEL_ID);
        molecule.editor.open(previewTab, RIGHT_PANEL_ID);

        molecule.layout.toggleMenuBarVisibility();
        molecule.layout.togglePanelVisibility();
        molecule.layout.toggleSidebarVisibility();
        molecule.layout.toggleActivityBarVisibility();
    }, []);

    return moInstance.render(<Workbench />);
};

export default App;
