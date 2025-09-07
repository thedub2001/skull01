import { IContributeType } from "@dtinsight/molecule/esm/model";
import type { IExtension } from "@dtinsight/molecule/esm/model";

import fr from './locales/fr.json';
const locales = [fr];

export const ExtendLocales: IExtension = {
    id: 'ExtendLocales',
    name: 'Extend locales',
    contributes: {
        [IContributeType.Languages]: locales,
    },
    activate() {},
    dispose() {},
};