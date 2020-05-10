import {Feature, prepareSettings, Settings, Shortcut} from '../utils/settings'

import {config as incDec} from './inc-dec-value/index'
import {config as customCss} from './custom-css/index'
import {config as srs} from './srs/index'
import {config as blockManipulation} from './block-manipulation'
import {config as livePreview} from './live-preview'
import {config as estimate} from './estimates/index'
import {config as navigation} from './navigation/index'
import {filterAsync, mapAsync} from '../utils/async'

export const Features = {
    all: prepareSettings([
        incDec, //prettier
        srs,
        blockManipulation,
        estimate,
        customCss,
        navigation,
        livePreview,
    ]),

    isActive: Settings.isActive,

    async getActiveFeatures(): Promise<Feature[]> {
        return filterAsync(this.all, it => this.isActive(it.id))
    },

    getShortcutHandlers: () =>
        getAllShortcuts(Features.all).reduce((acc: any, current) => {
            acc[current.id] = current.onPress
            return acc
        }, {}),

    async getCurrentKeyMap() {
        const features = (await Features.getActiveFeatures()).filter(it => it.settings)
        const allShortcuts = (await mapAsync(features, this.getKeyMapFor)).flat().filter(it => it[1])
        return allShortcuts.reduce((acc: any, current) => {
            acc[current[0]] = current[1]
            return acc
        }, {})
    },

    async getKeyMapFor(feature: Feature) {
        return mapAsync(feature.settings!, async it => [it.id, await Settings.get(feature.id, it.id)])
    },
}

export const getAllShortcuts = (features: Feature[]): Shortcut[] =>
    features
        .filter(it => it.settings)
        .flatMap(it => it.settings)
        .filter(it => it!.type === 'shortcut')
        .map(it => it as Shortcut)
