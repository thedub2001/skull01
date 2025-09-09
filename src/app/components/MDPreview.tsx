// components/MDPreview.tsx
import React, { useEffect, useState } from 'react';
import molecule from '@dtinsight/molecule';
import ReactMarkdown from 'react-markdown';

interface MDPreviewProps {
    fileId: string;
}

/**
 * Composant Preview Markdown
 * - Affiche en temps réel le contenu du fichier markdown ouvert dans Molecule
 * - Se met à jour automatiquement sur les modifications de l'éditeur
 */
const MDPreview: React.FC<MDPreviewProps> = ({ fileId }) => {
    const [content, setContent] = useState<string>("");

    // Récupère la valeur initiale
    useEffect(() => {
        const tab = molecule.editor.getTabById(fileId, 1);
        if (tab?.data?.value) {
            setContent(tab.data.value as string);
        }
    }, [fileId]);

    // Écoute les mises à jour des tabs
useEffect(() => {
    const disposable = molecule.editor.onUpdateTab?.((tab) => {
        if (tab.id === fileId && tab.data?.language === "markdown") {
            console.log(`[preview][update] ${fileId}`, tab.data.value);
            setContent(tab.data.value as string);
        }
    });

    return () => {
        if (disposable?.dispose) {
            console.debug("[preview][cleanup] disposing listener");
            disposable.dispose();
        } else {
            console.debug("[preview][cleanup] nothing to dispose");
        }
    };
}, [fileId]);


    return (
        <div style={{ padding: "1rem", height: "100%", overflow: "auto" }}>
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    );
};

export default MDPreview;
