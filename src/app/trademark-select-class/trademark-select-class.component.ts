import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { SharedModule } from '../shared/shared.module';

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
export class TrademarkSelectClassComponent {
  classificationChoice: string = 'pick';
  searchTerm: string = '';
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

  filteredItems(): string[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.items;
    return this.items.filter(item => item.toLowerCase().includes(term));
  }
}
