import React from 'react';
import molecule from '@dtinsight/molecule';

import type { IEditorTab } from '@dtinsight/molecule/esm/model';
import { meshExplorerAuxiliaryBar } from './meshExplorerAppAuxiliaryBar';
import styled from 'styled-components';


export const MESH_EXPLORER_APP_ID = 'meshExplorerPane';

export const meshExplorerAppEditorTab: IEditorTab = { //todo déplacer dans fichier externe
    id: MESH_EXPLORER_APP_ID,
    name: 'Create Data Source',
    renderPane: () => <MeshExplorerAppEditorTabView /> //todo :import fichier externe : fenêtre graphique principale
};

export function exitMeshExplorerAppEditorTabView() {
    console.log("[exitCreateDataSourceView] Closing tab if open");
    const group = molecule.editor.getState().current;
    if (group) {
        molecule.editor.closeTab(meshExplorerAppEditorTab.id!, group.id!);
    }
}

const Button = molecule.component.Button;
//const CreateDataSource = styled.div` width: 50%; margin: auto; `;
const CreateDataBtn= styled(Button)` width: 120px; display: inline-block; `;

class MeshExplorerAppEditorTabView extends React.Component {
    formRef: React.RefObject<HTMLFormElement> = React.createRef();

    submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = new FormData(this.formRef.current!);
        const dataSource = {
            name: form.get('name')?.toString() || '',
            type: form.get('type')?.toString() || '',
            jdbcUrl: form.get('jdbcUrl')?.toString()  || '',
            updateTime: new Date().getTime().toString()
        };

        console.log("[submit] creating dataSource", dataSource);
        //const res = await API.createDataSource(dataSource);
        console.log("[submit] API response", "res");

/*         if (res.code === 200) {
            molecule.notification.add([{
                id: 2,
                value: dataSource,
                render: item => <p>Create the Database <b>{item.value.name}</b> is success!</p>
            }]);
            container.resolve(NotificationController).toggleNotifications();
        } */
    };

    close = () => {
        console.log("[close] closing MeshExplorerAppEditorTab");
        exitMeshExplorerAppEditorTabView();
    };

    openAuxiliaryBar = () => {
        console.log("[openAuxiliaryBar] opening MeshExplorerAppAuxiliaryBar");
        meshExplorerAuxiliaryBar();
    };

    render() {
        console.log("[CreateDataSourceView] render");
        return (
                    <div>
                        <CreateDataBtn type="submit">Create</CreateDataBtn>
                        <CreateDataBtn type="button" onClick={this.openAuxiliaryBar}>Auxiliary Bar</CreateDataBtn>
                        <CreateDataBtn type="button" onClick={this.close}>Close</CreateDataBtn>
                    </div>

        );
    }
}