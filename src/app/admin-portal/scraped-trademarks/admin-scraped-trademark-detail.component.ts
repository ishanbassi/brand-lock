import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ITrademark } from '../../../models/trademark.model';
import { AdminScrapedTrademarkService } from '../services/admin-scraped-trademark.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-scraped-trademark-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-scraped-trademark-detail.component.html',
  styleUrl: './admin-scraped-trademark-detail.component.scss',
})
export class AdminScrapedTrademarkDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly adminScrapedTrademarkService = inject(AdminScrapedTrademarkService);
  private readonly toast = inject(ToastrService);

  private readonly baseUrl = environment.BaseApiUrl;

  trademark = signal<ITrademark | null>(null);
  loading = signal(true);
  saving = signal(false);
  error = signal('');

  nameModel = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.adminScrapedTrademarkService.find(id).subscribe({
      next: res => {
        const tm = res.body;
        this.trademark.set(tm);
        this.nameModel = tm?.name ?? '';
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load this trademark.');
        this.loading.set(false);
      },
    });
  }

  save(): void {
    const current = this.trademark();
    if (!current || !this.nameChanged) return;

    this.saving.set(true);
    this.adminScrapedTrademarkService.update({ id: current.id, name: this.nameModel.trim() }).subscribe({
      next: res => {
        this.trademark.set(res.body);
        this.saving.set(false);
        this.toast.success('Name updated');
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Failed to update name');
      },
    });
  }

  get nameChanged(): boolean {
    return this.nameModel.trim() !== (this.trademark()?.name ?? '') && this.nameModel.trim().length > 0;
  }

  imgSrc(trademark: ITrademark): string {
    return trademark.imgUrl ? this.baseUrl + 'files/' + trademark.imgUrl : '/assets/images/trademark.png';
  }
}
