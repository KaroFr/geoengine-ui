import {StorageProvider} from '../storage-provider.model';

import {LayoutDict} from '../../app/layout.service';
import {Layer, LayerDict} from '../../layers/layer.model';
import {Project} from '../../project/project.model';
import {Plot, PlotDict} from '../../plots/plot.model';
import {Symbology} from '../../symbology/symbology.model';

/**
 * StorageProvider implementation that uses the brower's localStorage
 */
export class BrowserStorageProvider extends StorageProvider {

    loadProject(): Promise<Project> {
        const projectJSON = localStorage.getItem('project');
        if (projectJSON === null) { // tslint:disable-line:no-null-keyword
            return Promise.resolve(undefined);
        } else {
            const project = Project.fromJSON(projectJSON);
            return Promise.resolve(project);
        }
    }

    saveProject(project: Project): Promise<void> {
        localStorage.setItem('project', project.toJSON());
        return Promise.resolve();
    }

    loadLayers(): Promise<Array<Layer<Symbology>>> {
        const layersJSON = localStorage.getItem('layers');
        if (layersJSON === null) { // tslint:disable-line:no-null-keyword
            return Promise.resolve(undefined);
        } else {
            const layers: Array<Layer<Symbology>> = [];
            const layerDicts: Array<LayerDict> = JSON.parse(layersJSON);

            for (const layerDict of layerDicts) {
                layers.push(
                    this.layerService.createLayerFromDict(layerDict)
                );
            }

            return Promise.resolve(layers);
        }
    }

    saveLayers(layers: Array<Layer<Symbology>>): Promise<void> {
        const layerDicts: Array<LayerDict> = [];

        for (const layer of layers) {
            layerDicts.push(layer.toDict());
        }

        localStorage.setItem('layers', JSON.stringify(layerDicts));
        return Promise.resolve();
    }

    loadPlots(): Promise<Array<Plot>> {
        const plotsJSON = localStorage.getItem('plots');
        if (plotsJSON === null) { // tslint:disable-line:no-null-keyword
            return Promise.resolve(undefined);
        } else {
            const plots: Array<Plot> = [];
            const plotDicts: Array<PlotDict> = JSON.parse(plotsJSON);

            for (const plotDict of plotDicts) {
                plots.push(
                    this.plotService.createPlotFromDict(plotDict)
                );
            }

            return Promise.resolve(plots);
        }
    }

    savePlots(plots: Array<Plot>): Promise<void> {
        const plotDicts: Array<PlotDict> = [];

        for (const plot of plots) {
            plotDicts.push(plot.toDict());
        }

        localStorage.setItem('plots', JSON.stringify(plotDicts));
        return Promise.resolve();
    }

    loadLayoutSettings(): Promise<LayoutDict> {
        const layoutSettings = localStorage.getItem('layoutSettings');
        if (layoutSettings === null) { // tslint:disable-line:no-null-keyword
            return Promise.resolve(undefined);
        } else {
            return Promise.resolve(JSON.parse(layoutSettings));
        }
    };

    saveLayoutSettings(dict: LayoutDict): Promise<void> {
        localStorage.setItem('layoutSettings', JSON.stringify(dict));
        return Promise.resolve();
    };

}