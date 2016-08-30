import {Component, ChangeDetectionStrategy} from '@angular/core';
import {CORE_DIRECTIVES} from '@angular/common';

import {Observable} from 'rxjs/Rx';

import {MD_INPUT_DIRECTIVES} from '@angular2-material/input';

import {IBasket, BasketTypeAbcdGrouped, BasketTypePangaea} from './gfbio-basket.model';
import {BasketResultGroupByDatasetPipe} from './gfbio-basket.pipe';
import {UserService} from '../users/user.service';

import {MdToolbar} from '@angular2-material/toolbar';
import {MdIcon} from '@angular2-material/icon';
import {PangaeaBasketResult, GroupedAbcdBasketResult} from "./gfbio-basket-result.component";

@Component({
    selector: 'wave-gfbio-baskets',
    template: `
    <div style="height:100%" layout="column">
        <md-toolbar>
          <label>Basket: </label>
            <select [(ngModel)]='selectedBasket'>
                <option *ngFor='let basket of baskets | async; let first=first' [ngValue]='basket'>{{basket.timestamp}} - {{basket.query}}</option>
            </select> 
          <button md-button class='md-icon-button' aria-label='sync' (click)='relord()'>
            <md-icon>sync</md-icon>
          </button>
        </md-toolbar>
        <md-content flex="grow">
             <template [ngIf]='selectedBasket'>       
                <template ngFor let-result [ngForOf]='selectedBasket.results | waveBasketResultGroupByDatasetPipe' >
                      
                      <template [ngIf]='result.type === abcdGroupedType'>
                        <wave-grouped-abcd-basket-result [result]='result'></wave-grouped-abcd-basket-result>                      
                      </template>
                      <template [ngIf]='result.type !== abcdGroupedType'>
                        <wave-pangaea-basket-result [result]='result'></wave-pangaea-basket-result>
                      </template>
                </template>
             </template>             
        </md-content>
    </div>
    `,
    styles: [`

    
    .searchInput {
        width: 100%;
    }
    md-list-item {
        cursor: pointer;
    }
    md-list >>> md-subheader {
        color: white;
        background-color: #009688;
        font-weight: bold;
    }
    img {
      padding: 5px 5px 5px 0px;
    }
    `],
    pipes: [BasketResultGroupByDatasetPipe],
    directives: [CORE_DIRECTIVES, MD_INPUT_DIRECTIVES, MdIcon, MdToolbar, PangaeaBasketResult, GroupedAbcdBasketResult],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class GfbioBasketsComponent {

    private baskets: Observable<Array<IBasket>>;
    private selectedBasket: IBasket;
    private abcdGroupedType: BasketTypeAbcdGrouped = 'abcd_grouped';

    constructor(
        private userService: UserService
    ) {
        this.baskets = this.userService.getGfbioBasketStream();

    }

    relord() {
        this.baskets = this.userService.getGfbioBasketStream().retry();
    }
}