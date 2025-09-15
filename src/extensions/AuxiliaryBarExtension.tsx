// AuxiliaryBarExtension.tsx
import React from 'react';
import molecule from '@dtinsight/molecule';
import type { IExtension } from '@dtinsight/molecule/esm/model/extension';
import type { IExtensionService } from '@dtinsight/molecule/esm/services';
import type { IAuxiliaryData } from '@dtinsight/molecule/esm/model';
import { AuxiliaryBarService } from '@dtinsight/molecule/esm/services';

const auxiliaryBarService = molecule.auxiliaryBar as AuxiliaryBarService;

// =====================
// Composant React du panneau
// =====================
class AuxiliaryBarView extends React.Component {
    renderHeaderToolbar() {
        console.log('[AuxiliaryBarView] renderHeaderToolbar called');
        return [
            { icon: 'arrow-both', id: 'tools', title: 'Layout the auxiliary bar' },
        ];
    }

    render() {
        console.log('[AuxiliaryBarView] render called');
        return (
            <div className="AuxiliaryBar" style={{ width: '100%', height: '100%' }}>
                <header className="mo-sidebar__header">
                    <div className="mo-sidebar__title">
                        <h2>Auxiliary bar</h2>
                    </div>
                </header>
                <div className="mo-sidebar__content">
                    <p style={{ textAlign: 'center' }}>Auxiliary bar content</p>
                </div>
            </div>
        );
    }
}

// =====================
// Extension
// =====================
export class AuxiliaryBarExtension implements IExtension {
    id = 'AuxiliaryBarExtension';
    name = 'AuxiliaryBarExtension';

    activate(extensionCtx: IExtensionService) {
        console.log('[AuxiliaryBarExtension] activate called');

        const tabData: IAuxiliaryData = {
            key: 'AuxiliaryBar',
            title: 'Tools',
        };

        console.log('[AuxiliaryBarExtension] adding auxiliary tab', tabData.key);
        auxiliaryBarService.addAuxiliaryBar(tabData);

        console.log('[AuxiliaryBarExtension] setting active tab', tabData.key);
        auxiliaryBarService.setActive(tabData.key);

        console.log('[AuxiliaryBarExtension] setting children React component');
        auxiliaryBarService.setChildren(<AuxiliaryBarView />);

        console.log('[AuxiliaryBarExtension] forcing render');
        auxiliaryBarService.render();

        console.log('[AuxiliaryBarExtension] current auxiliary state', auxiliaryBarService.getState());
    }

    dispose(extensionCtx: IExtensionService) {
        console.log('[AuxiliaryBarExtension] dispose called');

        // Cache le panneau
        auxiliaryBarService.setState({ current: undefined });
        auxiliaryBarService.render();

        console.log('[AuxiliaryBarExtension] auxiliary state after dispose', auxiliaryBarService.getState());
    }
}
