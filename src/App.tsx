// App.tsx
import React from 'react';
import { create, Workbench } from '@dtinsight/molecule';
import '@dtinsight/molecule/esm/style/mo.css';
import { ExplorerExtension } from './extensions/ExplorerExtension';
import { EditorEventsExtension } from './extensions/EditorEventsExtension';

const moInstance = create({
    extensions: [
        new ExplorerExtension(),
        new EditorEventsExtension(),
    ],
});

const App: React.FC = () => {
    return moInstance.render(<Workbench />);
};

export default App;