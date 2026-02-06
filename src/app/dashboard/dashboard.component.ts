import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { DataService } from '../shared/services/data.service';
import { DashboardStats, TaskDTO } from '../../models/dashboard-stats.model';
import { MatIcon } from '@angular/material/icon';
import { TrademarkStatusPipe } from '../shared/pipe/trademark-status-translate.pipe';
import { MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { LoadingService } from '../common/loading.service';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { SessionStorageService } from '../shared/services/session-storage.service';

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
    private readonly dataService:DataService,
    private readonly router:Router,
    private readonly loadingService:LoadingService,
    private readonly toastService:ToastrService,
    private readonly sessionStorageService:SessionStorageService,
  ){

  }
  ngOnInit(): void {
    // clear session storage all the onboarding properties after redirected to dashboard
    this.sessionStorageService.remove("trademark")
    this.sessionStorageService.remove("initial-onboarding");
    this.sessionStorageService.remove("payment_id");
    
    this.loadingService.show();
    this.dataService.getDashboardStats()
    .pipe(
      finalize(() => {
        this.loadingService.hide();
      })
    )
    .subscribe({
      next:(response) => {
        this.dashboardStats = response.body;
        this.processPendingTasksLinks(this.dashboardStats);
      },
      error:() => {
        this.toastService.error("Unable to load the details. Please contact the administrator.")
      }
    });
  }
  processPendingTasksLinks(dashboardStats?: DashboardStats | null) {
    if(!dashboardStats?.pendingTasks) return;
    this.dashboardStats!.pendingTasks = this.dashboardStats!.pendingTasks.map(task => {
      switch(task.type){
        case "DOCUMENT_UPLOAD":
          task.link = `portal/upload-documents?application=${task.applicationId}&document=${task.documentType}`;
          break;
        case "PAYMENT_PENDING":
          task.link = `trademark-registration/checkout?order_id=${task.applicationId}`;
          break;
        case "PLAN_PENDING":
        task.link = `trademark-registration/select-plan?application=${task.applicationId}`;
        break;
        default:
          task.link = `portal/trademark/edit/${task.applicationId}`;
      }
      return task;
    })


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
  openPendingTask(link: string) {
    this.router.navigateByUrl(link);
  }

   

}
