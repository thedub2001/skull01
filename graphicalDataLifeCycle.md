```mermaid
    flowchart TD
        %% --- Mode DB ---
        DBMode[Mode DB: local / remote / sync]

        %% --- Branches locales et distantes ---
        DBMode -->|local| LocalDB[IndexedDB (localDB)]
        DBMode -->|remote| RemoteDB[Supabase (remoteDB)]
        DBMode -->|sync| SyncDB[Sync complet local ↔ remote]

        %% --- LocalDB ---
        LocalDB -->|export/import| LocalState[React State: nodes[], links[], visualLinks[]]

        %% --- RemoteDB ---
        RemoteDB -->|fetchNodes/fetchLinks/fetchVisualLinks| RemoteState[React State: nodes[], links[], visualLinks[]]

        %% --- SyncDB ---
        SyncDB -->|pushLocalToRemote| LocalDB
        SyncDB -->|pushLocalToRemote| RemoteDB
        SyncDB -->|pullRemoteToLocal| RemoteDB
        SyncDB -->|pullRemoteToLocal| LocalDB

        %% --- Initial Fetch Hook ---
        LocalState -->|useGraphInitialFetch| GraphFetch[fetchGraphData(), fetchLinks(), fetchVisualLinks()]

        RemoteState -->|useGraphInitialFetch| GraphFetch

        GraphFetch --> LocalState
        GraphFetch --> RemoteState

        %% --- Graph State Sync ---
        LocalState --> GraphSync[useGraphDataSync(nodes, links)]
        RemoteState --> GraphSync

        GraphSync --> ForceGraph[ForceGraph3D (fgRef)]

        %% --- Camera Tracking ---
        ForceGraph --> CameraTracker[useCameraTracker(fgRef)]
        CameraTracker --> LabelSprite[useLabelSprite(cameraPos, generateTextLabel)]

        %% --- Node Labels ---
        LabelSprite --> ThreeSprite[THREE.Sprite material + scale]
        ThreeSprite --> Scene[scene.add(sprite)]

        %% --- Visual Links ---
        ForceGraph -->|graphData + visualLinks| VisualLinks[addDynamicVisualLinks / updateVisualLinks]
        VisualLinks --> ThreeLine[THREE.Line geometry + material]
        ThreeLine --> Scene

        %% --- User Actions via Settings Panel ---
        DBMode -.->|change mode| DBMode
        LocalDB -.->|Push Local → Remote| SyncDB
        RemoteDB -.->|Pull Remote → Local| SyncDB

        %% --- Info Panel & Selection ---
        ForceGraph --> InfoPanel[InfoPanel(selectedNodes, selectedLinks)]
        InfoPanel -->|node deletion/creation| LocalState
        InfoPanel -->|node deletion/creation| RemoteState

        %% --- Node Label Generator ---
        LabelSprite --> NodeLabelGen[useNodeLabelGenerator]
        NodeLabelGen --> generateTextLabel[HTMLCanvasElement]

        %% --- Notes ---
        classDef db fill:#f9f,stroke:#333,stroke-width:1px;
        classDef react fill:#9f9,stroke:#333,stroke-width:1px;
        classDef three fill:#ff9,stroke:#333,stroke-width:1px;
        classDef ui fill:#9ff,stroke:#333,stroke-width:1px;

        class LocalDB,RemoteDB,SyncDB db;
        class LocalState,RemoteState,GraphFetch,GraphSync,CameraTracker,NodeLabelGen react;
        class ForceGraph,VisualLinks,ThreeLine,Scene,LabelSprite,ThreeSprite three;
        class InfoPanel,DBMode ui;
```