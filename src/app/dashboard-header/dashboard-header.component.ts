import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import {MatMenuModule} from '@angular/material/menu';
import { SharedModule } from '../shared/shared.module';


@Component({
  selector: 'app-dashboard-header',
    imports: [MatToolbarModule, MatButtonModule, MatIconModule,RouterModule,MatExpansionModule, MatMenuModule,SharedModule],
  templateUrl: './dashboard-header.component.html',
  styleUrl: './dashboard-header.component.scss'
})
export class DashboardHeaderComponent {
logout() {
throw new Error('Method not implemented.');
}

  panelOpenState = false;

  toggle() {
    this.panelOpenState = !this.panelOpenState;
  }

}
