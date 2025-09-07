// App.tsx
import React from 'react';
import { create, Workbench } from '@dtinsight/molecule';
import '@dtinsight/molecule/esm/style/mo.css';
import { ExplorerExtension } from './extensions/ExplorerExtension';
import { EditorEventsExtension } from './extensions/EditorEventsExtension';
import { MenuBarExtension } from './extensions/MenuBarExtension';
import { GithubActivityBarExtension } from './extensions/GithubActivityBarExtension';

const moInstance = create({
    extensions: [
        new ExplorerExtension(),
        new EditorEventsExtension(),
        new MenuBarExtension(),
        new GithubActivityBarExtension(),
    ],
});

const App: React.FC = () => {
    return moInstance.render(<Workbench />);
};

export default App;