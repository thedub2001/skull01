// src/app/MeshExplorerAppAuxiliaryBar.tsx

import React from 'react';
import molecule from '@dtinsight/molecule';
import type { IAuxiliaryData } from '@dtinsight/molecule/esm/model';
import { AuxiliaryBarService } from '@dtinsight/molecule/esm/services';

const auxiliaryBarService = molecule.auxiliaryBar as AuxiliaryBarService;

function MeshExplorerAuxiliaryBarView() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <header className="mo-sidebar__header">
        <div className="mo-sidebar__title"><h2>Mesh Explorer Tools</h2></div>
      </header>
      <div className="mo-sidebar__content">
        <p style={{ textAlign: 'center' }}>Mesh Explorer auxiliary content</p>
      </div>
    </div>
  );
}

export function meshExplorerAuxiliaryBar() {
  const key = 'MeshExplorerAuxiliaryBar';
  const tabData: IAuxiliaryData = { key, title: 'MeshExplorer Tools' };

  // 1) ajouter le tab s'il n'existe pas déjà
  const state = auxiliaryBarService.getState ? auxiliaryBarService.getState() : undefined;
  const exists = !!state?.data?.some((d: any) => d.key === key);

  if (!exists) {
    auxiliaryBarService.addAuxiliaryBar(tabData);
  }

  // 2) set children (le contenu React)
  auxiliaryBarService.setChildren(<MeshExplorerAuxiliaryBarView />);

  // 3) rendre le tab actif
  auxiliaryBarService.setActive(key);

  // 4) forcer l'affichage de la zone auxiliary (setAuxiliaryBar prend `hidden: boolean`)
  //    -> false = visible, true = hidden
  molecule.layout.setAuxiliaryBar(false);

  // Vertical tabs on the right of the auxiliary bar default  = molecule.auxiliaryBar.setMode('default')
  // molecule.auxiliaryBar.setMode('tabs')

  // 5) demander un render pour être sûr
  auxiliaryBarService.render();

  console.log('[auxiliary] opened', auxiliaryBarService.getState());
}

export function closeMeshExplorerAuxiliaryBar() {

    
  const key = "MeshExplorerAuxiliaryBar";
  const state = auxiliaryBarService.getState();

  console.log("[auxiliary] before close", auxiliaryBarService.getState());
  const newData = state.data?.filter((d) => d.key !== key) ?? [];

  auxiliaryBarService.setState({
    ...state,
    data: newData,
    current: newData.length ? newData[0].key : undefined,
  });
    auxiliaryBarService.setChildren(null); // empty auxiliary bar
    molecule.layout.setAuxiliaryBar(true); // hide auxiliary bar
  
  console.log("[auxiliary] closed", auxiliaryBarService.getState());
}
