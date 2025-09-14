// App.tsx (molécule)
import React from 'react';
import { create, Workbench } from '@dtinsight/molecule';
import '@dtinsight/molecule/esm/style/mo.css';
import { ExplorerExtension } from './extensions/ExplorerExtension';
import { EditorEventsExtension } from './extensions/EditorEventsExtension';
import { MenuBarExtension } from './extensions/MenuBarExtension';
import { GithubActivityBarExtension } from './extensions/GithubActivityBarExtension';
import { ExtendLocales } from './extensions/i18nExtension';
import { ProblemsExtension } from './extensions/ProblemsExtension';
import { SettingsExtension } from './extensions/SettingsExtension';
import { AuxiliaryBarExtension } from './extensions/AuxiliaryBarExtension';
import { MeshExplorerAppExtension } from './extensions/MeshExplorerAppExtension';

const moInstance = create({
    extensions: [
        new ExplorerExtension(),
        new EditorEventsExtension(),
        new MenuBarExtension(),
        GithubActivityBarExtension,
        ExtendLocales,
        new ProblemsExtension(),
        new SettingsExtension(),
        new AuxiliaryBarExtension(),
        new MeshExplorerAppExtension(),
    ],
});

const App: React.FC = () => {
    return moInstance.render(<Workbench />);
};

export default App;