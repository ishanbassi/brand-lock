import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
  ViewChild,
  Input,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  of,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { FilterOptions, IFilterOptions } from '../shared/filter';
import { DataService } from '../shared/services/data.service';
import { TrademarkService } from '../shared/services/trademark.service';
import { ITrademark } from '../../models/trademark.model';
import { SharedModule } from '../shared/shared.module';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';




@Component({
  selector: 'app-live-search',
  standalone: true,
  imports: [ReactiveFormsModule, SharedModule],
  templateUrl: './live-search.component.html',
  styleUrls: ['./live-search.component.scss'],
})
export class LiveSearchComponent implements OnInit, OnDestroy {

  @ViewChild('searchWrapper') searchWrapper!: ElementRef;

  @Input() query?:string;


  searchControl = new FormControl('');
  results: ITrademark[] = [];
  isOpen = false;
  activeIndex = -1;
  isLoading = false;
  filters: IFilterOptions = new FilterOptions();
  baseUrl = environment.BaseApiUrl;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly trademarkService:TrademarkService,
    private readonly router:Router
  ){

  }

  ngOnInit(): void {  
    this.searchControl.setValue(this.query || null);
  this.searchControl.valueChanges
    .pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap((query) => {
        this.query = query ?? '';
        if ((query ?? '').length < 3) {
          this.results = [];
          this.isOpen = false;
          this.isLoading = false;
        }
      }),
      filter((query) => (query ?? '').length >= 3),
      tap(() => (this.isLoading = true)),
      switchMap(query =>
          this.trademarkService.liveSearch(query!.trim())
          .pipe(
            finalize(() => {
              this.isLoading = false;
            })
          )
      ),
      takeUntil(this.destroy$)
    )
    .subscribe(results => {
      this.results = results.body || [];
      this.isOpen = this.results.length > 0;
      this.activeIndex = -1;
    });
  
}


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  search(query: string): void {
    const q = query.trim().toLowerCase();
    if (!q) {
      this.results = [];
      this.isOpen = false;
      this.activeIndex = -1;
      return;
    }

    this.isLoading = true;
    this.trademarkService.liveSearch(q)
    .pipe(
      finalize(() => {
        this.isOpen = this.results.length > 0;
        this.activeIndex = -1;
        this.isLoading = false;
      })
    )
    .subscribe(tm => {
      this.results = tm.body || [];
    })

  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.isOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex = Math.min(this.activeIndex + 1, this.results.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex = Math.max(this.activeIndex - 1, -1);
        break;
      case 'Enter':
        if (this.activeIndex >= 0) {
          this.selectResult(this.results[this.activeIndex]);
        }
        break;
      case 'Escape':
        this.close();
        break;
    }
  }

  selectResult(result: ITrademark): void {
    result.name && this.searchControl.setValue(result.name, { emitEvent: false });
    this.close();
    console.log('Selected:', result); // replace with your navigation / action
  }

  highlight(text?: string|null): string {
    if(!text) return '';
    const query = this.searchControl.value?.trim();
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  close(): void {
    this.isOpen = false;
    this.activeIndex = -1;
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.close();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.searchWrapper?.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  trackById(_: number, item: ITrademark): number {
    return item.id;
  }

  searchFilter($event: any) {
    const value = ($event.target as HTMLInputElement).value;
    if (!value || value.length < 2) {
      this.filters.removeCompleteFilter("searchText.contains");
      return;
    }
    this.filters.removeCompleteFilter("searchText.contains");
    this.filters.addFilter("searchText.contains", value);
  }

  onSearchClick() {
    this.router.navigate(['/search'], {queryParams:{trademark:this.query}})
    this.isOpen  = false;

  }
}
