import React from 'react';
import molecule from '@dtinsight/molecule';
import type { IExtension } from '@dtinsight/molecule/esm/model/extension';
import type { IExtensionService } from '@dtinsight/molecule/esm/services';
import type { IActivityBarItem, IEditorTab, ISidebarPane, IMenuBarItem } from '@dtinsight/molecule/esm/model';
import type { IActionBarItemProps, ITreeNodeItemProps } from '@dtinsight/molecule/esm/components';
import type { ICollapseItem } from '@dtinsight/molecule/esm/components/collapse';
import { localize } from '@dtinsight/molecule/esm/i18n/localize';
import { container } from 'tsyringe';
import styled from 'styled-components';
import { NotificationController } from '@dtinsight/molecule/esm/controller';
import { Header, Content } from '@dtinsight/molecule/esm/workbench/sidebar';

import API from './api';
import { FormItem } from './formItem';
import type { DataSourceType } from "./types";

// =====================
// Constantes & Helpers
// =====================
export const DATA_SOURCE_ID = 'DataSource';

export const dataSourceActivityBar: IActivityBarItem = {
    id: DATA_SOURCE_ID,
    sortIndex: -1,
    name: 'Data Source',
    title: 'Data Source Management',
    icon: 'database'
};

export const dataSourceSidebar: ISidebarPane = {
    id: DATA_SOURCE_ID,
    title: 'DataSourcePane',
    render: () => <DataSourceSidebarView />
};

export const createDataSourceTab: IEditorTab = {
    id: DATA_SOURCE_ID,
    name: 'Create Data Source',
    renderPane: () => <CreateDataSourceView />
};

export const createDataSourceMenuItem: IMenuBarItem = {
    id: 'menu.createDataSource',
    name: localize('menu.createDataSource', 'Create Data Source'),
    icon: ''
};

export function openCreateDataSourceView() {
    console.log("[openCreateDataSourceView] Opening tab");
    molecule.editor.open(createDataSourceTab);
}

export function existCreateDataSourceView() {
    console.log("[existCreateDataSourceView] Closing tab if open");
    const group = molecule.editor.getState().current;
    if (group) {
        molecule.editor.closeTab(createDataSourceTab.id!, group.id!);
    }
}

// =====================
// Sidebar Component
// =====================
const Tree = molecule.component.TreeView;
const Toolbar = molecule.component.Toolbar;
const Collapse = molecule.component.Collapse;

class DataSourceSidebarView extends React.Component {
    state = { data: [], currentDataSource: undefined };

    componentDidMount() {
        console.log("[DataSourceSidebarView] Mount → fetchData");
        this.fetchData();
        molecule.event.EventBus.subscribe('addDataSource', () => this.reload());
    }

    async fetchData() {
        console.log("[fetchData] fetching...");
        const res = await API.getDataSource();
        console.log("[fetchData] result", res);
        if (res.message === 'success') {
            this.setState({ data: res.data.children || [] });
        }
    }

    fetchDataSource = async (id: string) => {
        console.log("[fetchDataSource] loading id", id);
        const dataSource = await API.getDataSourceById(id);
        console.log("[fetchDataSource] loaded", dataSource);
        this.setState({ currentDataSource: dataSource });
    };

    reload = () => {
        console.log("[reload] reloading data");
        this.fetchData();
    };

    create = () => {
        console.log("[create] opening CreateDataSourceView");
        openCreateDataSourceView();
    };

    selectedSource = (node: ITreeNodeItemProps) => {
        console.log("[selectedSource] node", node);
        if (node.isLeaf) this.fetchDataSource(node.id as string);
    };

    renderHeaderToolbar(): IActionBarItemProps[] {
        return [
            { icon: 'refresh', id: 'reload', title: 'Reload', onClick: this.reload },
            { icon: 'add', id: 'addDataSource', title: 'Create Data Source', onClick: this.create }
        ];
    }

    renderCollapse(): ICollapseItem[] {
        const dataSource: DataSourceType | undefined = this.state.currentDataSource;
        console.log("[renderCollapse] currentDataSource", dataSource);
        return [
            { id: 'DataSourceList', name: 'Catalogue', renderPanel: () => <Tree data={this.state.data} onSelect={this.selectedSource}/> },
            { id: 'DataSourceDetail', name: 'Detail', renderPanel: () => <DataSourceDetail dataSource={dataSource}/> }
        ];
    }

    render() {
        console.log("[DataSourceSidebarView] render", this.state);
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

// =====================
// Detail Component
// =====================
function DataSourceDetail({ dataSource = {} }: { dataSource?: Partial<DataSourceType> }) {
    const { name, type, jdbcUrl, updateTime } = dataSource;
    console.log("[DataSourceDetail] render", dataSource);

    return (
        <div className="dataSource__detail">
            <table style={{ margin: 10, display: 'block' }}>
                <tbody>
                    <tr><td>Name：</td><td>{name}</td></tr>
                    <tr><td>Type：</td><td>{type}</td></tr>
                    <tr><td>JdbcUrl：</td><td>{jdbcUrl}</td></tr>
                    <tr><td>Update Time：</td><td>{updateTime}</td></tr>
                </tbody>
            </table>
        </div>
    );
}

// =====================
// Create Component
// =====================
const Button = molecule.component.Button;
const CreateDataSource = styled.div` width: 50%; margin: auto; `;
const CreateDataBtn= styled(Button)` width: 120px; display: inline-block; `;

class CreateDataSourceView extends React.Component {
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
        const res = await API.createDataSource(dataSource);
        console.log("[submit] API response", res);

        if (res.code === 200) {
            molecule.notification.add([{
                id: 2,
                value: dataSource,
                render: item => <p>Create the Database <b>{item.value.name}</b> is success!</p>
            }]);
            container.resolve(NotificationController).toggleNotifications();
        }
    };

    close = () => {
        console.log("[close] closing CreateDataSourceView");
        existCreateDataSourceView();
    };

    render() {
        console.log("[CreateDataSourceView] render");
        return (
            <CreateDataSource className="dataSource__create">
                <form ref={this.formRef} onSubmit={this.submit}>
                    <FormItem label="Name" name="name"/>
                    <FormItem label="Type" name="type"/>
                    <FormItem label="JdbcUrl" name="jdbcUrl"/>
                    <FormItem style={{ textAlign: 'left' }}>
                        <CreateDataBtn type="submit">Create</CreateDataBtn>
                        <CreateDataBtn type="button" onClick={this.close}>Close</CreateDataBtn>
                    </FormItem>
                </form>
            </CreateDataSource>
        );
    }
}

// =====================
// Extension
// =====================
export class DataSourceAppExtension implements IExtension {
    id: string = DATA_SOURCE_ID;
    name: string = 'Data Source';

    activate(extensionCtx: IExtensionService): void {
        console.log("[AppExtension] activate");
        molecule.sidebar.add(dataSourceSidebar);
        molecule.activityBar.add(dataSourceActivityBar);
        setTimeout(() => molecule.menuBar.append(createDataSourceMenuItem, 'File'));
    }

    dispose(extensionCtx: IExtensionService): void {
        console.log("[AppExtension] dispose");
        molecule.sidebar.remove(dataSourceSidebar.id);
        molecule.activityBar.remove(dataSourceActivityBar.id);
    }
}
