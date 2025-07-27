import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, switchMap, map, startWith } from 'rxjs/operators';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { SharedModule } from '../shared/shared.module';
import { DataService } from '../shared/data.service';
import { LoadingService } from '../common/loading.service';

@Component({
  selector: 'app-trademark-select-class',
  standalone: true,
  imports: [
    FormsModule,
    MatRadioModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    SharedModule
  ],
  templateUrl: './trademark-select-class.component.html',
  styleUrl: './trademark-select-class.component.scss'
})
export class TrademarkSelectClassComponent implements OnInit {
  inputControl = new FormControl('');
  filteredItems$?: Observable<string[]>;
  selectedItems: string[] = [];

  // Mock data for products/services
  items: string[] = [
    'Shirt',
    'Coffee',
    'Restaurant',
    'Retail Store',
    'Shoes',
    'Electronics',
    'Consulting',
    'Bakery',
    'Fitness Training',
    'Book Publishing',
    'Mobile App',
    'Jewelry',
    'Furniture',
    'Cosmetics',
    'Legal Services'
  ];

  constructor(
    private readonly dataService: DataService,
    private readonly loadingService:LoadingService
  ) {}

  ngOnInit() {
    this.filteredItems$ = this.inputControl.valueChanges.pipe(
      startWith(""),
      debounceTime(300),
      switchMap(value => this.fetchItems(value)),
      map(items => items.filter(item => !this.selectedItems.includes(item)))
    );
  }

  fetchItems(query: string|null): Observable<string[]> {
    if (!query) {
      return of([]);
    }
    return this.trademarkClassService.fetchItems(query); // Should return Observable<string[]>
  }

  addItem(item: string) {
    if (!this.selectedItems.includes(item)) {
      this.selectedItems.push(item);
      this.inputControl.setValue('');
    }
  }

  removeItem(item: string) {
    this.selectedItems = this.selectedItems.filter(i => i !== item);
  }
}
