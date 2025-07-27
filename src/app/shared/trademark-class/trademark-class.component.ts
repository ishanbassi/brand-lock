import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { catchError, debounceTime, distinctUntilChanged, map, Observable, of, OperatorFunction, Subject, switchMap, tap } from 'rxjs';
import { ITrademarkClass } from './trademark-class.model';
import { HttpResponse } from '@angular/common/http';
import { DataService } from '../data.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trademark-class',
  imports: [FormsModule],
  templateUrl: './trademark-class.component.html',
  styleUrl: './trademark-class.component.scss'
})
export class TrademarkClassComponent {
  @Input() filterChanges?: Subject<boolean>;
  @Output("onChange") onChange: EventEmitter<ITrademarkClass> = new EventEmitter();
  @ViewChild('searchElement') searchElement?: ElementRef;
  searching: boolean = false;
  searchText: any;
  searchFailed: boolean = false;
  selectedFieldId: number = 0;
  selectedHouseholdId?: number;
  constructor(
    protected readonly dataService: DataService
  ) { }

  ngOnInit() {
    if (this.filterChanges) {
      this.filterChanges.subscribe((v: any) => {
        if (v.state === "CLEAR_PROVIDER_FILTER") {
          this.searchText = undefined;
        } else if (v.state === "PRE_SET_PROVIDER_VALUE") {
          this.selectedFieldId = (v.values && v.values.length > 0) ? v.values[0] : 0;
          this.fetchDetail();
        } else if (v.state === "CLEAR_HOUSEHOLD_FILTER") {
          this.selectedHouseholdId = undefined;
        } else if (v.state === "PRE_SET_HOUSEHOLD_VALUE") {
          this.selectedHouseholdId = (v.values && v.values.length > 0) ? v.values[0] : 0;
        }
      });
    }
  }

  fetchDetail() {
    this.dataService
      .find(this.selectedFieldId).subscribe((res: HttpResponse<ITrademarkClass>) => {
        if (!res.body) {
          return;
        }
        this.searchText = res.body;
      })
  }

  search: OperatorFunction<string, readonly ITrademarkClass[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching = true),
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
    input["searchText.contains"] = term;
    if (this.selectedHouseholdId) {
      input["householdId"] = this.selectedHouseholdId;
    }
    return this.dataService
      .queryExtended(input)
      .pipe(
        map((res: HttpResponse<ITrademarkClass[]>) => {
          return res.body ? res.body.slice(0, 10) : [] ?? [];
        }),
      )
  }

  formatter(value: any) {
    return `${value.description}`;
  }

  onProviderSelection($event: any) {
    this.onChange.emit($event.item);
  }

  clearFilter() {
    this.onChange.emit(undefined);
  }
}
