import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ITrademark } from '../../../models/trademark.model';
import { AdminTrademarkService } from '../services/admin-trademark.service';
import {
  TRADEMARK_STATUS_OPTIONS,
  trademarkStatusBadgeClass,
  trademarkStatusLabel,
} from '../shared/trademark-status.util';

@Component({
  selector: 'app-admin-trademark-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-trademark-detail.component.html',
  styleUrl: './admin-trademark-detail.component.scss',
})
export class AdminTrademarkDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly adminTrademarkService = inject(AdminTrademarkService);
  private readonly toast = inject(ToastrService);

  trademark = signal<ITrademark | null>(null);
  loading = signal(true);
  saving = signal(false);
  error = signal('');

  statusModel = '';
  emailModel = '';
  savingEmail = signal(false);
  sendingPitch = signal(false);

  readonly statusOptions = TRADEMARK_STATUS_OPTIONS;
  readonly badgeClass = trademarkStatusBadgeClass;
  readonly statusLabel = trademarkStatusLabel;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.adminTrademarkService.find(id).subscribe({
      next: res => {
        const tm = res.body;
        this.trademark.set(tm);
        this.statusModel = tm?.trademarkStatus ?? '';
        this.emailModel = tm?.email ?? '';
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load this application.');
        this.loading.set(false);
      },
    });
  }

  save(): void {
    const current = this.trademark();
    if (!current || !this.statusModel) return;

    this.saving.set(true);
    this.adminTrademarkService.update({ id: current.id, trademarkStatus: this.statusModel }).subscribe({
      next: res => {
        this.trademark.set(res.body);
        this.saving.set(false);
        this.toast.success('Status updated');
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Failed to update status');
      },
    });
  }

  get statusChanged(): boolean {
    return this.statusModel !== (this.trademark()?.trademarkStatus ?? '');
  }

  saveEmail(): void {
    const current = this.trademark();
    if (!current) return;

    this.savingEmail.set(true);
    this.adminTrademarkService.update({ id: current.id, email: this.emailModel || null }).subscribe({
      next: res => {
        this.trademark.set(res.body);
        this.savingEmail.set(false);
        this.toast.success('Email updated');
      },
      error: () => {
        this.savingEmail.set(false);
        this.toast.error('Failed to update email');
      },
    });
  }

  get emailChanged(): boolean {
    return this.emailModel !== (this.trademark()?.email ?? '');
  }

  sendPitchEmail(): void {
    const current = this.trademark();
    if (!current?.id || !current.email) return;

    this.sendingPitch.set(true);
    this.adminTrademarkService.sendPitchEmail(current.id).subscribe({
      next: () => {
        this.sendingPitch.set(false);
        this.toast.success('Pitch email sent to ' + current.email);
      },
      error: () => {
        this.sendingPitch.set(false);
        this.toast.error('Failed to send pitch email');
      },
    });
  }
}
