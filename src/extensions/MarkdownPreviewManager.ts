// extensions/MarkdownPreviewManager.ts
import molecule from '@dtinsight/molecule';
import MDPreview from '../app/components/MDPreview';
import React from 'react';


const RIGHT_PANEL_ID = 2;

/**
 * Ouvre un onglet Preview pour un fichier markdown donné
 */
export function openMarkdownPreview(fileId: string) {
    console.log('[preview][open]', fileId);

    const previewTab = {
        id: `preview-${fileId}`,
        name: 'Preview',
        closable: true,
        renderPane: () => React.createElement(MDPreview, { fileId }),
    };

    molecule.editor.open(previewTab, RIGHT_PANEL_ID);
}

/**
 * Met à jour un onglet Preview existant pour refléter le contenu courant
 */
export function updateMarkdownPreview(tab: any) {
    const previewId = `preview-${tab.id}`;
    const existing = molecule.editor.getTabById(previewId, RIGHT_PANEL_ID);

    if (existing) {
        console.log('[preview][update]', previewId);
        molecule.editor.updateTab(
            {
                ...existing,
                renderPane: () => React.createElement(MDPreview, { fileId: tab.id }),
            },
            RIGHT_PANEL_ID,
        );
    }
}
