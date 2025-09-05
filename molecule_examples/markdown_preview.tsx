// components/MDPreview.tsx
import React, { useState, useEffect } from 'react';
import molecule from '@dtinsight/molecule';

interface MDPreviewProps {
    markdownTabId?: string;
}

const MDPreview: React.FC<MDPreviewProps> = ({ markdownTabId }) => {
    const [markdownContent, setMarkdownContent] = useState<string>('');

    // Fonction pour convertir le Markdown en HTML (basique)
    const parseMarkdown = (markdown: string): string => {
        let html = markdown;

        // Titres
        html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

        // Gras et italique
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Code inline
        html = html.replace(/`(.*?)`/g, '<code>$1</code>');

        // Blocs de code
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

        // Liens
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Listes
        html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

        // Listes numérotées
        html = html.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');
        
        // Paragraphes
        const lines = html.split('\n');
        const paragraphs = [];
        let currentParagraph = '';

        for (const line of lines) {
            if (line.trim() === '') {
                if (currentParagraph.trim()) {
                    // Ne pas encapsuler dans <p> si c'est déjà un élément HTML
                    if (!currentParagraph.trim().match(/^<(h[1-6]|ul|ol|li|pre|code)/)) {
                        paragraphs.push(`<p>${currentParagraph.trim()}</p>`);
                    } else {
                        paragraphs.push(currentParagraph.trim());
                    }
                    currentParagraph = '';
                }
            } else {
                currentParagraph += line + '\n';
            }
        }

        if (currentParagraph.trim()) {
            if (!currentParagraph.trim().match(/^<(h[1-6]|ul|ol|li|pre|code)/)) {
                paragraphs.push(`<p>${currentParagraph.trim()}</p>`);
            } else {
                paragraphs.push(currentParagraph.trim());
            }
        }

        return paragraphs.join('\n');
    };

    // Récupérer le contenu du fichier Markdown spécifique
    const getMarkdownContent = (): string => {
        console.log('📖 getMarkdownContent appelé avec markdownTabId:', markdownTabId);
        
        if (!markdownTabId) {
            console.log('❌ Pas de markdownTabId fourni');
            return '';
        }

        try {
            const state = molecule.editor.getState();
            console.log('📊 État de l\'éditeur:', state);
            
            // Chercher dans tous les groupes pour trouver le bon tab
            for (const group of state.groups) {
                console.log('🔍 Recherche dans le groupe:', group.id, 'tabs:', group.data?.map(t => ({ id: t.id, name: t.name })));
                const tab = group.data?.find(t => t.id === markdownTabId);
                if (tab && tab.data && tab.data.value) {
                    console.log('✅ Contenu trouvé pour', markdownTabId, ':', tab.data.value.substring(0, 100) + '...');
                    return tab.data.value;
                }
            }
            
            console.log('❌ Onglet non trouvé pour markdownTabId:', markdownTabId);
            return 'Fichier Markdown non trouvé';
        } catch (error) {
            console.error('Erreur lors de la récupération du contenu Markdown:', error);
            return 'Erreur lors du chargement du contenu';
        }
    };

    // Mettre à jour le contenu au chargement et quand le tabId change
    useEffect(() => {
        const updateContent = () => {
            const content = getMarkdownContent();
            setMarkdownContent(content);
        };

        updateContent();

        // Écouter les changements dans l'éditeur
        const unsubscribe = molecule.editor.onUpdateTab((tab) => {
            if (tab.id === markdownTabId) {
                updateContent();
            }
        });

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [markdownTabId]);

    // Polling pour s'assurer que le contenu reste à jour
    useEffect(() => {
        const interval = setInterval(() => {
            const newContent = getMarkdownContent();
            if (newContent !== markdownContent) {
                setMarkdownContent(newContent);
            }
        }, 500); // Vérification toutes les 500ms

        return () => clearInterval(interval);
    }, [markdownContent, markdownTabId]);

    const htmlContent = parseMarkdown(markdownContent);

    return (
        <div style={{
            padding: '16px',
            height: '100%',
            overflow: 'auto',
            backgroundColor: '#ffffff',
            fontSize: '14px',
            lineHeight: '1.6'
        }}>
            <style>{`
                .markdown-preview h1 {
                    color: #2c3e50;
                    border-bottom: 2px solid #3498db;
                    padding-bottom: 8px;
                    margin-top: 24px;
                    margin-bottom: 16px;
                }
                .markdown-preview h2 {
                    color: #34495e;
                    border-bottom: 1px solid #bdc3c7;
                    padding-bottom: 4px;
                    margin-top: 20px;
                    margin-bottom: 12px;
                }
                .markdown-preview h3 {
                    color: #34495e;
                    margin-top: 16px;
                    margin-bottom: 8px;
                }
                .markdown-preview p {
                    margin-bottom: 12px;
                    color: #2c3e50;
                }
                .markdown-preview ul {
                    margin-left: 20px;
                    margin-bottom: 12px;
                }
                .markdown-preview li {
                    margin-bottom: 4px;
                    color: #2c3e50;
                }
                .markdown-preview code {
                    background-color: #f8f9fa;
                    border: 1px solid #e9ecef;
                    border-radius: 3px;
                    padding: 2px 6px;
                    font-family: 'Monaco', 'Consolas', monospace;
                    font-size: 13px;
                    color: #e74c3c;
                }
                .markdown-preview pre {
                    background-color: #f8f9fa;
                    border: 1px solid #e9ecef;
                    border-radius: 4px;
                    padding: 12px;
                    overflow-x: auto;
                    margin-bottom: 12px;
                }
                .markdown-preview pre code {
                    background: none;
                    border: none;
                    padding: 0;
                    color: #2c3e50;
                }
                .markdown-preview strong {
                    color: #2c3e50;
                    font-weight: 600;
                }
                .markdown-preview em {
                    color: #34495e;
                }
                .markdown-preview a {
                    color: #3498db;
                    text-decoration: none;
                }
                .markdown-preview a:hover {
                    text-decoration: underline;
                }
            `}</style>
            
            <div className="markdown-preview">
                {activeTabId ? (
                    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                ) : (
                    <div style={{ 
                        textAlign: 'center', 
                        color: '#7f8c8d', 
                        marginTop: '50px',
                        fontStyle: 'italic'
                    }}>
                        <p>📄 Aucun fichier Markdown sélectionné</p>
                        <p>Ouvrez un fichier .md pour voir sa prévisualisation ici</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MDPreview;