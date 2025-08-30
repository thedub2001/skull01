# Cycle de Vie des Variables – Projet Graph 3D

---

## 1. db/localDB.ts

| Variable       | Type                           | Init                      | Mise à jour / Trigger         | Dépendances | Clean-up | Notes / debug                  |
| -------------- | ------------------------------ | ------------------------- | ----------------------------- | ----------- | -------- | ------------------------------ |
| `db`           | IDBPDatabase<DBSchema> \| null | null                      | `initLocalDB()` crée / assign | openDB      | n/a      | IndexedDB locale, singleton    |
| `DBSchema`     | type                           | nodes/links/visual\_links | n/a                           | n/a         | n/a      | type pour IDB                  |
| fonctions CRUD | n/a                            | n/a                       | addItem / deleteItem / getAll | storeName   | n/a      | log console à chaque opération |

---

## 2. db/remoteDB.ts

| Variable                     | Type | Init | Mise à jour / Trigger | Dépendances       | Clean-up | Notes / debug                       |
| ---------------------------- | ---- | ---- | --------------------- | ----------------- | -------- | ----------------------------------- |
| fetchNodes/Links/VisualLinks | fn   | n/a  | Appels Supabase       | supabase table    | n/a      | log console, retourne \[] si erreur |
| addNode/Link/VisualLink      | fn   | n/a  | insert Supabase       | Supabase          | n/a      | log console                         |
| updateNode/Link/VisualLink   | fn   | n/a  | update Supabase       | node.id / link.id | n/a      | log console                         |
| deleteNode/Link/VisualLink   | fn   | n/a  | delete Supabase       | node.id / link.id | n/a      | log console                         |

---

## 3. db/sync.ts

| Variable          | Type | Init | Trigger           | Dépendances                 | Clean-up | Notes                                |
| ----------------- | ---- | ---- | ----------------- | --------------------------- | -------- | ------------------------------------ |
| pushLocalToRemote | fn   | n/a  | click ou manuelle | local.exportDB, remote CRUD | n/a      | supprime tout remote puis push local |
| pullRemoteToLocal | fn   | n/a  | click ou manuelle | remote fetch, local CRUD    | n/a      | supprime tout local puis pull remote |
| initRealtimeSync  | fn   | n/a  | n/a               | n/a                         | n/a      | TODO, futur realtime                 |

---

## 4. hooks/useGraphDataSync.ts

| Variable    | Type                                       | Init      | Trigger                                  | Dépendances           | Clean-up | Notes             |
| ----------- | ------------------------------------------ | --------- | ---------------------------------------- | --------------------- | -------- | ----------------- |
| `graphData` | { nodes: NodeType\[], links: LinkType\[] } | {\[],\[]} | useEffect si `nodes` ou `links` changent | nodes, links, isEqual | n/a      | pour ForceGraph3D |

---

## 5. hooks/useGraphInitialFetch.ts

| Variable | Type | Init | Trigger  | Dépendances                                  | Clean-up | Notes       |
| -------- | ---- | ---- | -------- | -------------------------------------------- | -------- | ----------- |
| effect   | fn   | n/a  | au mount | fetchGraphData, fetchLinks, fetchVisualLinks | n/a      | log console |

---

## 6. hooks/useCameraTracker.ts

| Variable         | Type         | Init    | Trigger               | Dépendances                  | Clean-up             | Notes                                  |
| ---------------- | ------------ | ------- | --------------------- | ---------------------------- | -------------------- | -------------------------------------- |
| cameraPos        | {x,y,z}      | {0,0,0} | tick() animationFrame | fgRef.current.cameraPosition | cancelAnimationFrame | exposé pour labels / liens             |
| lastPosRef       | ref<{x,y,z}> | {0,0,0} | tick()                | mutable interne              | n/a                  | dernière position pour calcul distance |
| animationFrameId | number       | n/a     | tick()                | tick()                       | cancelAnimationFrame | loop d’animation                       |

---

## 7. hooks/useNodeLabelGenerator.ts

| Variable          | Type | Init | Trigger                | Dépendances | Clean-up | Notes                      |
| ----------------- | ---- | ---- | ---------------------- | ----------- | -------- | -------------------------- |
| generateTextLabel | fn   | n/a  | appel pour chaque node | texte node  | n/a      | retourne HTMLCanvasElement |

---

## 8. hooks/useVisualLinksRenderer.ts

| Variable | Type   | Init | Trigger                                    | Dépendances            | Clean-up             | Notes                              |
| -------- | ------ | ---- | ------------------------------------------ | ---------------------- | -------------------- | ---------------------------------- |
| frameId  | number | n/a  | requestAnimationFrame animate              | animate()              | cancelAnimationFrame | animation continue des visualLinks |
| timer    | number | n/a  | setTimeout 50ms pour addDynamicVisualLinks | visualLinks, graphData | clearTimeout         | delay init                         |

Props critiques :

* `fgRef` → ForceGraph3D ref
* `graphData` → nodes/links
* `visualLinks` → VisualLinkType\[]
* `selectedLinks` → Set<string>
* `setSelectedLinks` → callback pour toggle
* `getLinkId` → fn pour ID lien

---

## 9. components/useLabelSprite.tsx

| Variable      | Type                            | Init           | Trigger                   | Dépendances                   | Clean-up | Notes                                                   |
| ------------- | ------------------------------- | -------------- | ------------------------- | ----------------------------- | -------- | ------------------------------------------------------- |
| labelCache    | Map\<string,{texture,material}> | vide           | callback pour chaque node | generateTextLabel, node.label | n/a      | cache global pour textures                              |
| emptyObject3D | Object3D                        | new Object3D() | n/a                       | n/a                           | n/a      | retour si label invisible                               |
| sprite        | THREE.Sprite                    | n/a            | callback pour node        | labelCache, opacity           | n/a      | réutilise material, scale fixe, opacity distance caméra |
| opacity       | number                          | calculé        | recalculé par callback    | distance caméra               | n/a      | contrôle visibilité label                               |

---

## 10. components/SettingsPanel.tsx

| Variable          | Type      | Init     | Trigger         | Dépendances       | Clean-up | Notes                    |     |         |
| ----------------- | --------- | -------- | --------------- | ----------------- | -------- | ------------------------ | --- | ------- |
| isOpen            | boolean   | true     | togglePanel     | local state       | n/a      | affichage panel          |     |         |
| hueStep           | number    | context  | input range     | setHueStep        | n/a      | couleur liens/noeuds     |     |         |
| showLabels        | boolean   | context  | toggle checkbox | setShowLabels     | n/a      | affichage labels         |     |         |
| linkTypeFilter    | string\[] | context  | checkbox toggle | setLinkTypeFilter | n/a      | filtre par type de liens |     |         |
| dbMode            | "local"   | "remote" | "sync"          | context           | radio    | setDbMode                | n/a | mode DB |
| push/pull buttons | fn        | n/a      | click           | sync.ts           | n/a      | log console              |     |         |

---

## 11. components/InfoPanel.tsx

| Variable      | Type                  | Init   | Trigger       | Dépendances        | Clean-up | Notes              |
| ------------- | --------------------- | ------ | ------------- | ------------------ | -------- | ------------------ |
| selectedNodes | NodeType\[]           | props  | sélection     | nodes              | n/a      | panel nœuds        |
| selectedLinks | LinkType\[]           | props  | sélection     | links              | n/a      | panel liens        |
| source        | NodeType \| undefined | calcul | chaque render | nodes, link.source | n/a      | mapping ID → objet |
| target        | NodeType \| undefined | calcul | chaque render | nodes, link.target | n/a      | mapping ID → objet |

---

## 12. utils/addDynamicVisualLinks.ts

| Variable          | Type              | Init    | Trigger                                   | Dépendances          | Clean-up                                          | Notes                               |
| ----------------- | ----------------- | ------- | ----------------------------------------- | -------------------- | ------------------------------------------------- | ----------------------------------- |
| visualLinkLines   | VisualLinkLine\[] | \[]     | addDynamicVisualLinks / updateVisualLinks | graphData            | remove line from scene, dispose geometry/material | cache temporaire pour liens 3D      |
| normal            | Vector3           | (0,1,0) | n/a                                       | n/a                  | n/a                                               | contrôle direction courbe           |
| createBezierCurve | fn                | n/a     | chaque lien                               | sourcePos, targetPos | n/a                                               | génère points QuadraticBezierCurve3 |

