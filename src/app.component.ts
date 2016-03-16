import {Component, ViewChild, ElementRef, AfterViewInit, NgZone,
        ChangeDetectionStrategy, OnInit} from 'angular2/core';
import {COMMON_DIRECTIVES} from 'angular2/common';
import {MATERIAL_DIRECTIVES, SidenavService} from 'ng2-material/all';
import {HTTP_PROVIDERS} from 'angular2/http';
import {BehaviorSubject, Subject, Observable} from "rxjs/Rx";

import {InfoAreaComponent} from './info-area.component';
import {TabComponent} from './tab.component';
import {InfoBarComponent} from './info-bar.component';
import {LayerComponent} from './layer.component';
import {AngularGrid} from './angular-grid';
import {MapComponent} from './openlayers/map.component';
import {PointLayerComponent, RasterLayerComponent} from './openlayers/layer.component';
import {AddDataComponent} from './add-data.component';

import {Layer} from './layer.model';
import {Operator, ResultType} from './operator.model';

import {LayerService} from './services/layer.service';

@Component({
    selector: 'wave-app',
    template: `
    <div class="topContainer md-whiteframe-5dp" layout="row">
        <div class="infoArea">
            <info-area-component (layerListVisible)="layerListVisible$.next($event)">
            </info-area-component>
        </div>
        <div flex="grow">
            <tab-component
                [layerSelected]="hasSelectedLayer$ | async"
                (removeLayer)="layerService.removeLayer(layerService.getSelectedLayerOnce())"
                (zoomIn)="mapComponent.zoomIn()" (zoomOut)="mapComponent.zoomOut()"
                (zoomLayer)="mapComponent.zoomToLayer(getMapIndexOfSelectedLayer())"
                (zoomMap)="mapComponent.zoomToMap()"
                (addData)="sidenavService.show('right')">
            </tab-component>
        </div>
    </div>
    <div class="middleContainer md-whiteframe-5dp"
        [style.height.px]="middleContainerHeight$ | async" layout="row">
        <div class="layers" *ngIf="layerListVisible$ | async">
            <layer-component [layers]="layers">
            </layer-component>
        </div>
        <div flex="grow">
            <ol-map [height]="middleContainerHeight$ | async">
                <div *ngFor="#layer of layersReverse$ | async; #index = index"
                     [ngSwitch]="layer.resultType">
                    <ol-point-layer #olLayer *ngSwitchWhen="LAYER_IS_POINTS"
                                    [params]="layer.params"
                                    [style]="layer.style"></ol-point-layer>
                    <ol-raster-layer #olLayer *ngSwitchWhen="LAYER_IS_RASTER"
                                    [params]="layer.params"
                                    [style]="layer.style"></ol-raster-layer>
                </div>
            </ol-map>
        </div>
    </div>
    <div class="bottomContainer md-whiteframe-5dp"
        [style.height.px]="bottomContainerHeight$ | async">
        <md-toolbar class="infoBar">
            <info-bar-component (tableOpen)="dataTableVisible$.next($event)">
            </info-bar-component>
        </md-toolbar>
        <div class="dataTable" *ngIf="dataTableVisible$ | async">
            <angular-grid [height]="(bottomContainerHeight$ | async) - 40">
            </angular-grid>
        </div>
    </div>
    <md-sidenav-container>
        <md-sidenav name="right" align="right" layout="column"
                style="over">
            <add-data-component style="height:100%"></add-data-component>
        </md-sidenav>
    </md-sidenav-container>
    `,
    styles: [`
    .topContainer {
        position: absolute;
        top: 0px;
        height: 180px;
        left: 0px;
        right: 0px;
    }
    .infoArea {
        width: 200px;
        min-width: 200px;
    }
    .middleContainer {
        position: absolute;
        top: 180px;
        left: 0px;
        right: 0px;
    }
    .middleContainer .layers {
        width: 200px;
    }
    .bottomContainer {
        position: absolute;
        bottom: 0px;
        left: 0px;
        right: 0px;

        overflow: hidden;
    }
    .bottomContainer .infoBar {
        min-height: 40px;
        height: 40px;
    }
    `],
    directives: [COMMON_DIRECTIVES, MATERIAL_DIRECTIVES, InfoAreaComponent, TabComponent,
                 LayerComponent, MapComponent, PointLayerComponent, RasterLayerComponent,
                 InfoBarComponent, AngularGrid, AddDataComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [LayerService, SidenavService, HTTP_PROVIDERS]
})
export class AppComponent implements OnInit, AfterViewInit {
    @ViewChild(MapComponent)
    private mapComponent: MapComponent;

    private layerListVisible$ = new BehaviorSubject(true);
    private dataTableVisible$ = new BehaviorSubject(true);

    private middleContainerHeight$: Observable<number>;
    private bottomContainerHeight$: Observable<number>;

    private layersReverse$: Observable<Array<Layer>>;
    private hasSelectedLayer$: Observable<boolean>;

    // for ng-switch
    private LAYER_IS_POINTS = ResultType.POINTS;
    private LAYER_IS_RASTER = ResultType.RASTER;

    constructor(private zone: NgZone,
                private layerService: LayerService,
                private sidenavService: SidenavService) {
        this.layersReverse$ = layerService.getLayers()
                                         .map(layers => layers.slice(0).reverse());

        this.hasSelectedLayer$ = layerService.getSelectedLayer()
                                             .map(value => value !== undefined);
    }

    ngOnInit() {
        let windowHeight$ = new BehaviorSubject(window.innerHeight);
        Observable.fromEvent(window, 'resize')
                  .map(_ => window.innerHeight)
                  .subscribe(windowHeight$);
        this.layerListVisible$.map(() => window.innerHeight)
                              .subscribe(windowHeight$);
        this.dataTableVisible$.map(() => window.innerHeight)
                              .subscribe(windowHeight$);

        let remainingHeight$ = windowHeight$.map(height => height - 180)
                                            .map(height => Math.max(height, 0));

        this.middleContainerHeight$ = remainingHeight$.map(height => {
            if(this.dataTableVisible$.getValue()) {
                return Math.ceil(3/5 * height);
            } else {
                return Math.max(height - 40, 0);
            }
        });

        this.bottomContainerHeight$ = remainingHeight$.map(height => {
            if(this.dataTableVisible$.getValue()) {
                return Math.floor(2/5 * height);
            } else {
                return 40;
            }
        });
    }

    ngAfterViewInit() {
        this.middleContainerHeight$.subscribe(() => {
            this.mapComponent.resize();
        });

        this.bottomContainerHeight$.subscribe(() => {
            this.mapComponent.resize();
        });
    }

    getMapIndexOfSelectedLayer() {
        let layers = this.layerService.getLayersOnce();
        let selectedLayer = this.layerService.getSelectedLayerOnce();
        let index = layers.indexOf(selectedLayer);
        return layers.length - index - 1;
    }
}
