import molecule from '@dtinsight/molecule';
import type { IExtension } from '@dtinsight/molecule/esm/model';
import type { IExtensionService } from '@dtinsight/molecule/esm/molecule.api';

export const customSettings = {
    demo: {
        id: 'test',
        value:65
    }
}

export class SettingsExtension implements IExtension {

    id: string = 'ExtendSettings';
    name: string = 'Extend Settings';

    appendSettingsItems() {
        molecule.settings.append(customSettings);
    }

    handleSettingsChange() {
        const panel = molecule.panel;
        molecule.settings.onChangeSettings((settings: any) => {
            panel.appendOutput('The settings changed: \n');
            panel.appendOutput(JSON.stringify(settings));
            alert('Settings changed:' + settings.demo?.id)
        })
    }

    activate(extensionCtx: IExtensionService): void {
        this.appendSettingsItems();
        this.handleSettingsChange();
    }

    dispose(extensionCtx: IExtensionService): void {
    }
}