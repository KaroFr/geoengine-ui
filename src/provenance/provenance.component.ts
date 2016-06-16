import {Component, Input, ChangeDetectionStrategy, Pipe, PipeTransform} from '@angular/core';
import {CORE_DIRECTIVES} from '@angular/common';

import {Observable} from 'rxjs/Rx';

import {MATERIAL_DIRECTIVES} from 'ng2-material';

import {LayerService} from '../layers/layer.service';
import {Provenance} from './provenance.model';

/**
 * Return either the value or a non-breaking space point if it is empty.
 */
@Pipe({name: 'waveNbsp'})
export class NbspPipe implements PipeTransform {
    transform(value: string): string {
        if (!value || value.length === 0) {
            return '&nbsp;';
        } else {
            return value;
        }
    }
}

@Component({
    selector: 'wave-provenance-list',
    template: `
    <div class='container' [style.height.px]='height'>
        <md-list dense>
            <md-list-item *ngFor="let p of prov$ | async; let last = last">
                <dl>
                    <dt>Citation</dt>
                    <dd [innerHtml]="p.citation | waveNbsp"></dd>
                    <dt>License</dt>
                    <dd [innerHtml]="p.license | waveNbsp"></dd>
                    <dt>URI</dt>
                    <dd><a [href]="p.uri" [innerHtml]="p.uri | waveNbsp"></a></dd>
                </dl>
                <md-divider *ngIf="!last"></md-divider>
            </md-list-item>
        </md-list>
    </div>
    `,
    styles: [`
    :host {
        display: block;
    }
    container{
        overflow-y: auto;
        display: block;
    }

    md-list-item {
        margin: 0;
        font-size: 13px;
    }

    dl {
        margin: 16px 0px;
    }
    dt {
        color: gray;
        width: 60px;
        float: left;
        clear: left;
    }
    dt::after {
        content: ":";
    }
    dd {
        margin-left: 60px;
    }
    `],
    directives: [CORE_DIRECTIVES, MATERIAL_DIRECTIVES],
    pipes: [NbspPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProvenanceListComponent {

    @Input() height: number;

    private prov$: Observable<Iterable<Provenance>>;

    constructor(private layerService: LayerService) {
        this.prov$ = layerService.getSelectedLayerStream().map(l => {
            if (l) {
                return l.provenanceStream;
            } else {
                return Observable.of([]);
            }
        }).switch();
    }

}