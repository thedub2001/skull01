// extensions/EditorEventsExtension.ts
import molecule from '@dtinsight/molecule';
import type { IExtension } from '@dtinsight/molecule/esm/model';
import type { IExtensionService } from '@dtinsight/molecule/esm/services';
import { updateMarkdownPreview } from './MarkdownPreviewManager';

export class EditorEventsExtension implements IExtension {
    id = 'EditorEventsExtension';
    name = 'Gestion événements éditeur (open, close, update...)';

    activate(extensionCtx: IExtensionService) {
        console.log('[editor][activate]');

        molecule.editor.onOpenTab((tab) => {
            console.log('[editor][open]', tab);
        });

        molecule.editor.onCloseTab((tabId, groupId) => {
            console.log('[editor][close]', { tabId, groupId });
        });

        molecule.editor.onSelectTab((tabId, groupId) => {
            console.log('[editor][select]', { tabId, groupId });
        });

        molecule.editor.onUpdateTab((tab) => {
            console.log('[editor][update]', tab);
            
            if (tab.data?.language === 'markdown') {
                updateMarkdownPreview(tab);
            }
        });

        molecule.editor.onUpdateState((prev, next) => {
            console.debug('[editor][state]', {
                groupsCount: next.groups.length,
                currentGroup: next.current?.group?.id,
                currentTab: next.current?.tab?.id,
            });
        });
    }

    dispose() {
        console.log('[editor][dispose]');
    }
}
