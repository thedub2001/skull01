// app/MeshExplorerAppSideBar.tsx
import React from 'react';
import molecule from '@dtinsight/molecule';
import type { IActivityBarItem, IEditorTab, ISidebarPane, IMenuBarItem } from '@dtinsight/molecule/esm/model';
import type { IActionBarItemProps, ITreeNodeItemProps } from '@dtinsight/molecule/esm/components';
import type { ICollapseItem } from '@dtinsight/molecule/esm/components/collapse';
import { localize } from '@dtinsight/molecule/esm/i18n/localize';
import { Header, Content } from '@dtinsight/molecule/esm/workbench/sidebar';
import { meshExplorerAppEditorTab } from './meshExplorerAppEditorTab';

export const MESH_EXPLORER_APP_ID = 'meshExplorerPane';

export const meshExplorerAppSidebar: ISidebarPane = {
    id: MESH_EXPLORER_APP_ID,
    title: 'Mesh explorer pane',
    render: () => <MeshExplorerAppSidebarView />
};

export const meshExplorerAppActivityBar: IActivityBarItem = { // reste dans ce fichier
    id: MESH_EXPLORER_APP_ID,
    sortIndex: -1,
    name: 'Mesh Explorer',
    title: 'Mesh Explorer App',
    icon: 'type-hierarchy'
};

export const meshExplorerAppMenuItem: IMenuBarItem = {
    id: 'menu.meshExplorerApp',
    name: localize('menu.meshExplorerApp', 'Mesh Explorer Menu'),
    icon: 'type-hierarchy'
};

// à ajouter dans un "activate" ?
molecule.activityBar.add(meshExplorerAppActivityBar);
setTimeout(() => molecule.menuBar.append(meshExplorerAppMenuItem, 'File'));

// =====================
// Sidebar Component
// =====================
const Tree = molecule.component.TreeView;
const Toolbar = molecule.component.Toolbar;
const Collapse = molecule.component.Collapse;

class MeshExplorerAppSidebarView extends React.Component {
    state = { data: [], currentDataSource: undefined };

    componentDidMount() {
        console.log("[MeshExplorerAppSidebarView] Mount → fetchData");
        // this.fetchData();
        // molecule.event.EventBus.subscribe('showMesh', () => this.reload());
    }

/*     async fetchData() {
        console.log("[fetchData] fetching...");
        const res = await API.getDataSource(); //todo : commencer par aller chercher les données en local (voir en mockData)
        console.log("[fetchData] result", res);
        if (res.message === 'success') {
            this.setState({ data: res.data.children || [] });
        }
    }

    fetchDataSource = async (id: string) => {
        console.log("[fetchDataSource] loading id", id);
        const dataSource = await API.getDataSourceById(id);//todo
        console.log("[fetchDataSource] loaded", dataSource);
        this.setState({ currentDataSource: dataSource });
    };
 */
/*     reload = () => {
        console.log("[reload] reloading data");
        this.fetchData();
    }; */

    create = () => {
        console.log("[create] opening MeshExplorerAppEditorTab");
        molecule.editor.open(meshExplorerAppEditorTab);
    };

/*     selectedSource = (node: ITreeNodeItemProps) => {
        console.log("[selectedSource] node", node);
        if (node.isLeaf) this.fetchDataSource(node.id as string);
    }; */

    renderHeaderToolbar(): IActionBarItemProps[] { //todo this.reload remplacé par this.create pour la 1ere ligne
        return [
            { icon: 'refresh', id: 'reload', title: 'Reload', onClick: this.create },
            { icon: 'add', id: 'showMesh', title: 'Show Mesh', onClick: this.create }
        ];
    }

    renderCollapse(): ICollapseItem[] {
        console.log("[renderCollapse] currentDataSource", "dataSource");
        return [
            { id: 'DataSourceList', name: 'Catalogue', renderPanel: () => <Header title="hola" toolbar={undefined}></Header> },
            { id: 'DataSourceDetail', name: 'Detail', renderPanel: () => <Header title="carino" toolbar={undefined}></Header> }
        ];
    }

    render() {
        console.log("[MeshExplorerAppSidebarView] render", this.state);
        return (
            <div className="dataSource" style={{width: '100%', height: '100%' }}>
                <Header title={ localize('demo.dataSourceManagement', "DataSource Management") } toolbar={
                    <Toolbar data={this.renderHeaderToolbar()} />
                }/>
                <Content>
                    <Collapse data={this.renderCollapse()} />
                </Content>
            </div>
        );
    }
}