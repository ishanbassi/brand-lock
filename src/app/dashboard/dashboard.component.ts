import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { DataService } from '../shared/services/data.service';
import { DashboardStats } from '../../models/dashboard-stats.model';
import { MatIcon } from '@angular/material/icon';
import { TrademarkStatusPipe } from '../shared/pipe/trademark-status-translate.pipe';
import { MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion';

@Component({
  selector: 'app-dashboard',
  imports: [SharedModule, MatIcon,TrademarkStatusPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit{
  dashboardStats?:DashboardStats|null;
  activeStatuses = ['DRAFT', 'FILED', 'UNDER_EXAMINATION', 'PUBLISHED'];
  inProcessStatuses = ['OBJECTED', 'EXAMINATION_REPLY_FILED', 'ACCEPTED_AND_ADVERTISED', 'OPPOSED', 'HEARING'];
  failureStatuses = ['ABANDONED', 'WITHDRAWN', 'REJECTED', 'EXPIRED', 'UNKNOWN'];

  constructor(
    private readonly dataService:DataService
  ){

  }
  ngOnInit(): void {
    this.dataService.getDashboardStats().subscribe((response)=>{
      this.dashboardStats = response.body;
    });
  }
  showAllTasks: boolean = false;
  maxVisibleTasks: number = 3;
  // Method to get displayed tasks based on showAllTasks flag
  getDisplayedTasks() {
    if (!this.dashboardStats?.pendingTasks) {
      return [];
    }
    
    if (this.showAllTasks) {
      return this.dashboardStats.pendingTasks;
    }
    
    return this.dashboardStats.pendingTasks.slice(0, this.maxVisibleTasks);
  }

  // Toggle between showing all tasks and limited tasks
  toggleShowAll() {
    this.showAllTasks = !this.showAllTasks;
    
    // Optional: Scroll to top of the section when collapsing
    if (!this.showAllTasks) {
      const section = document.querySelector('.notification-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

   

}
