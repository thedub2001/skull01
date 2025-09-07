import molecule from '@dtinsight/molecule';
import type { IExtension } from '@dtinsight/molecule/esm/model/extension';
import type { IExtensionService } from '@dtinsight/molecule/esm/services';

const GithubActivityBarExtensionID = 'GithubActivityBarExtension';

export const GithubActivityBarExtension : IExtension = {

    id: GithubActivityBarExtensionID,
    name: 'Go To Github',

    activate(extensionCtx: IExtensionService): void {
        molecule.activityBar.add({
            id: GithubActivityBarExtensionID,
            icon: 'github',
        });

        molecule.activityBar.onClick((id) => {
            if (id === GithubActivityBarExtensionID) {
                window.open('https://github.com/thedub2001/skull01')
            }
        })
    },

    dispose(extensionCtx: IExtensionService): void {
        molecule.activityBar.remove(GithubActivityBarExtensionID);
    }
}