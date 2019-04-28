import {async, inject, ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild} from "@angular/core";
import {CsvPropertiesService} from "../../csv-dialog/csv.properties.service";
import {CsvTableComponent} from "./csv-table.component";
import {FormsModule} from "@angular/forms";
import {MaterialModule} from "../../../../../material.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {By} from "@angular/platform-browser";

describe('CsvTableComponent', () => {
    let component: TestHostComponent;
    let fixture: ComponentFixture<TestHostComponent>;
    let service: CsvPropertiesService;
    let cd: ChangeDetectorRef;
    let el: any;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                CsvTableComponent,
                TestHostComponent
            ],
            imports: [
                MaterialModule,
                FormsModule,
                BrowserAnimationsModule
            ],
            providers: [
                CsvPropertiesService,
                ChangeDetectorRef
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        el = fixture.debugElement.nativeElement;
        cd = fixture.componentRef.injector.get(ChangeDetectorRef);
        service = fixture.componentRef.injector.get(CsvPropertiesService);
    });

    it('should parse and update correctly', () => {
        service.changeDataProperties({
            delimiter: ',',
            decimalSeparator: '.',
            isTextQualifier: false,
            textQualifier: '"',
            isHeaderRow: true,
            headerRow: 0,
        });
        cd.detectChanges();
        // fixture.componentInstance.csvTable._changeDetectorRef.markForCheck();
        // fixture.detectChanges();
        expect(component.csvTable.header.length).toBe(4);
        let table_rows = el.getElementsByTagName('tr');
        expect(table_rows[table_rows.length - 1].getElementsByTagName('td').length).toBe(7);
        service.changeDataProperties({
            delimiter: ',',
            decimalSeparator: '.',
            isTextQualifier: true,
            textQualifier: '"',
            isHeaderRow: true,
            headerRow: 0,
        });
        cd.detectChanges();
        expect(component.csvTable.header.length).toBe(3);
        table_rows = el.getElementsByTagName('tr');
        expect(table_rows[table_rows.length - 1].getElementsByTagName('td').length).toBe(5);
    });

    it('resizes', () => {
        component.csvTable.data.content = '"a,b",c,dddddddddddddd\n"1,2",3,4';
        service.changeDataProperties({
            delimiter: ',',
            decimalSeparator: '.',
            isTextQualifier: false,
            textQualifier: '"',
            isHeaderRow: false,
            headerRow: 0,
        });
        cd.detectChanges();
        let tables = el.getElementsByTagName('table');
        let header_table = null;
        let body_table = null;
        for (let i = 0; i < tables.length; i++) {
            if (tables[i].id === 'headertable') {
                header_table = tables[i];
            } else if (tables[i].id === 'bodytable') {
                body_table = tables[i];
            }
        }
        expect(header_table).toBeTruthy();
        expect(body_table).toBeTruthy();
        let header_row = header_table.getElementsByTagName('tr')[0].getElementsByTagName('td');
        let body_row = body_table.getElementsByTagName('tr')[0].getElementsByTagName('td');
        expect(header_row.length).toBe(body_row.length);
        for (let i = 0; i < header_row.length; i++) {
            expect(header_row[i].getBoundingClientRect().width).toBe(component.csvTable.cellSizes[i]);
            expect(header_row[i].getBoundingClientRect().width).toBe(body_row[i].getBoundingClientRect().width);
        }
    });

    @Component({
        selector: 'wave-table-test-host',
        template: `<wave-csv-table
            #csvTable
            [data]="data"
            [cellSpacing]="10"
            [linesToParse]="15"
        ></wave-csv-table>`,
        providers: [CsvPropertiesService]
    })
    class TestHostComponent {
        @ViewChild('csvTable') csvTable: CsvTableComponent;
        modifiedDate = new Date();
        data = {
            file: new File(['"a,b",c,d\n"1,2",3,4'], 'test-file.csv', {lastModified : this.modifiedDate.getDate(), type: 'csv'}),
            content: '"a,b",c,d\n"1,2",3,4',
            progress: 100,
            isNull: false
        };
    }
});
