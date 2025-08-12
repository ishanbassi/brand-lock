import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { catchError, debounceTime, distinctUntilChanged, filter, map, Observable, of, OperatorFunction, Subject, switchMap, tap } from 'rxjs';
import { ITrademarkClass } from '../../../../models/trademark-class.model';
import { HttpResponse } from '@angular/common/http';
import { DataService } from '../../services/data.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TrademarkClassService } from '../../services/trademark-class.service';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';


@Component({
  selector: 'app-trademark-class',
  imports: [SharedModule,ReactiveFormsModule,NgbModule,MatFormFieldModule, MatIconModule,MatListOption,MatInputModule,MatSelectionList],
  templateUrl: './trademark-class.component.html',
  styleUrl: './trademark-class.component.scss'
})
export class TrademarkClassComponent implements OnInit{
  @Input() filterChanges?: Subject<boolean>;
  @Output("onChange") onChange: EventEmitter<ITrademarkClass> = new EventEmitter();
  @ViewChild('searchElement') searchElement?: ElementRef;
  searching: boolean = false;
  searchControl = new FormControl("",{});
  searchFailed: boolean = false;
  selectedFieldId: number = 0;
  selectedClasses = new FormControl('')  ;
  filteredClasses:ITrademarkClass[] = [];
  
  constructor(
    protected readonly trademarkClassService:TrademarkClassService
  ) {
 

  }

  ngOnInit() {
    if (this.filterChanges) {
      this.filterChanges.subscribe((v: any) => {
        if (v.state === "CLEAR_PROVIDER_FILTER") {
          this.searchControl.setValue(null);
        } else if (v.state === "PRE_SET_PROVIDER_VALUE") {
          this.selectedFieldId = (v.values && v.values.length > 0) ? v.values[0] : 0;
        } 
      });
    }
    this.searchControl.valueChanges.pipe(
      filter((text$): text$ is string => text$ != null && text$.length > 2),
      debounceTime(300),
      distinctUntilChanged(),
      tap((text$) =>{
        this.searching = true
      }),
      switchMap(term => {
        return this.loadRelationshipsOptions(term).pipe(
          tap(() => this.searchFailed = false),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          }))
      }),
      tap(() => {
        this.searching = false;
      })
    ).subscribe(val => this.filteredClasses = val)
    ;


  }


  search = (text$: Observable<string|null>) =>
    text$.pipe(
      filter((text$): text$ is string => text$ != null),
      debounceTime(300),
      distinctUntilChanged(),
      tap(() =>{
        this.searching = true
        console.log(text$)
      }),
      switchMap(term => {
        return this.loadRelationshipsOptions(term).pipe(
          tap(() => this.searchFailed = false),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          }))
      }),
      tap(() => {
        this.searching = false;
      })
    );

  protected loadRelationshipsOptions(term: string) {
    const input = {} as any;
    input["keyword.contains"] = term;
   
    return this.trademarkClassService
      .query(input)
      .pipe(
        map((res: HttpResponse<ITrademarkClass[]>) => {
          return res.body ? res.body.slice(0, 10) : [];
        }),
      )
    }
  formatter(value: any) {
    return `${value.keyword}`;
  }

  onTrademarkClassSelection($event: any) {
    this.onChange.emit($event.item);
  }

  clearFilter() {
    this.onChange.emit(undefined);
  }

  
}
