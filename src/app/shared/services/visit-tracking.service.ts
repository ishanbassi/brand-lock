// visit-tracker.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VisitTrackerService {

  private storageKey = 'visitCounts';

  private getVisitCounts(): Record<string, number> {
    const stored = sessionStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : {};
  }

  private saveVisitCounts(counts: Record<string, number>): void {
    sessionStorage.setItem(this.storageKey, JSON.stringify(counts));
  }

  recordVisit(route: string): number {
    const counts = this.getVisitCounts();
    counts[route] = (counts[route] || 0) + 1;
    this.saveVisitCounts(counts);
    return counts[route];
  }

  getVisitCount(route: string): number {
    const counts = this.getVisitCounts();
    return counts[route] || 0;
  }
  isSecondTimeVisit() {
    const counts = this.getVisitCounts();
    const countsList = Object.values(counts);
    return countsList.some(count => count > 1)
  }
}
