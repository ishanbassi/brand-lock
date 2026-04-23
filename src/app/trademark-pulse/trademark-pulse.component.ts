import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TrademarkStats } from '../../models/trademark-stats.dto';
import relativeTime from 'dayjs/esm/plugin/relativeTime';
import dayjs, { Dayjs } from 'dayjs/esm';
import { DataService } from '../shared/services/data.service';
import { TrademarkService } from '../shared/services/trademark.service';
import { map } from 'rxjs';
dayjs.extend(relativeTime);


@Component({
  selector: 'app-trademark-pulse',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './trademark-pulse.component.html',
  styleUrls: ['./trademark-pulse.component.scss']
})
export class TrademarkPulseComponent implements OnInit {

  constructor(
    private dataService:DataService,
    private trademarkService:TrademarkService,
  ){}
  ngOnInit(): void {
    this.dataService.getTrademarkDailyStats()
    .pipe(
      map(data => {
        if(data.body?.recentFilings){
          data.body.recentFilings = data.body?.recentFilings.map(tm => this.trademarkService.convertDate(tm))
        }
        if(data.body?.lastUpdated){
          data.body.lastUpdated =  dayjs(data.body.lastUpdated); 
        }
         
        return data;
      })
    )
    .subscribe(data => {
      
      this.stats = data.body;
    })
  }
  

  // ── Replace these with API calls ──────────────────────────────────────
  stats?: TrademarkStats | null;
  
  /** CSS class for status badge */
  statusClass(status?: string|null): string {
    if(!status) return "tag--opposed";
    const map: Record<string, string> = {
      "Accepted": 'tag--accepted',
      Objected: 'tag--objected',
      Opposed:  'tag--opposed',
      Pending:  'tag--pending',
    };
    return map[status] ?? 'tag--accepted';
  }

  /** Formatted hours ago label */
  timeLabel(createdDate?:Dayjs|null): string {
    if(!createdDate) return "";
    return dayjs(createdDate).fromNow();
  }

  /** Pad class number for display e.g. Class 03 */
  classLabel(cls?: number|null): string {
    if(!cls) return "Class not found";
    return `Class ${String(cls).padStart(2, '0')}`;
  }
}
