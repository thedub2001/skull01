// extensions/ExplorerExtension.ts
import molecule from '@dtinsight/molecule';
import type { IExtension, IFolderTreeNodeProps } from '@dtinsight/molecule/esm/model';
import type { IExtensionService } from '@dtinsight/molecule/esm/services';
import { openMarkdownPreview } from './MarkdownPreviewManager';
import { mockData } from '../mockData';


const LEFT_PANEL_ID = 1;

export class ExplorerExtension implements IExtension {
    id = 'ExplorerExtension';
    name = 'Gestion FolderTree + ouverture de fichiers';

    activate(extensionCtx: IExtensionService) {
        console.log('[explorer][activate]');
        this.initFolderTree();
        this.setupFolderTreeEvents();
    }

    private initFolderTree() {
        console.log('[explorer][init] Ajout du mockData');
        molecule.folderTree.add(mockData);
        molecule.folderTree.toggleAutoSort();
    }

    private setupFolderTreeEvents() {
        molecule.folderTree.onSelectFile((file: IFolderTreeNodeProps) => {
            if (file.isLeaf && file.data) {
                console.log('[explorer][select]', file);

                // ouverture standard
                molecule.editor.open(
                    {
                        id: file.id,
                        name: file.name,
                        data: file.data,
                        icon: this.getFileIcon(file.name),
                    },
                    LEFT_PANEL_ID,
                );

                // preview markdown
                if (file.name.endsWith('.md')) {
                    openMarkdownPreview(file.id);

                console.debug('[fix][setActive] group=', LEFT_PANEL_ID, 'tab=', file.id);
                molecule.editor.setActive(LEFT_PANEL_ID, file.id); // otherwise the content won't show up

                }
            }
        });
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

    dispose() {
        console.log('[explorer][dispose]');
    }
}
