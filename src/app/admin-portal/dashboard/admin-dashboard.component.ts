import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminDashboardService } from '../services/admin-dashboard.service';
import { IAdminDashboardStats } from '../../../models/admin-dashboard.model';
import { AuthService } from '../../../models/auth.services';

interface StatusCount {
  label: string;
  value: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  stats = signal<IAdminDashboardStats | null>(null);
  loading = signal(true);
  error = signal('');

  leadBreakdown = computed<StatusCount[]>(() => this.toBreakdown(this.stats()?.leadsByStatus));
  applicationBreakdown = computed<StatusCount[]>(() => this.toBreakdown(this.stats()?.applicationsByStatus));

  constructor(
    private readonly adminDashboardService: AdminDashboardService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.adminDashboardService.getStats().subscribe({
      next: res => {
        this.stats.set(res.body);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load dashboard stats.');
        this.loading.set(false);
      },
    });
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  get adminFirstName(): string {
    return this.authService.getUser()?.firstName || 'Admin';
  }

  private toBreakdown(map: Record<string, number> | undefined): StatusCount[] {
    if (!map) return [];
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }
}
