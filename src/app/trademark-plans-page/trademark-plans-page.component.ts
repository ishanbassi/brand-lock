import { Component, OnInit } from '@angular/core';
import { PricingSectionComponent } from '../pricing-section/pricing-section.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { TmGovtFeesPopupComponent } from '../tm-govt-fees-popup/tm-govt-fees-popup.component';
import { SessionStorageService } from '../shared/services/session-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-trademark-plans-page',
  imports: [PricingSectionComponent,NavbarComponent,MatButtonModule,MatIcon],
  templateUrl: './trademark-plans-page.component.html',
  styleUrl: './trademark-plans-page.component.scss'
})
export class TrademarkPlansPageComponent implements OnInit {

  anonymousUser = true;

  constructor(
    private readonly dialog:MatDialog,
    private readonly sessionStorageService: SessionStorageService,
    private readonly router: Router
  ){}
  
  
  ngOnInit(): void {
    const lead = this.sessionStorageService.getObject('lead');
    if(lead){
      this.anonymousUser = false;
    }
  }



  
  openGovtFeesPopup(fees:number) {
    this.dialog.open(TmGovtFeesPopupComponent, {data: {fees: fees}});  
  }

  navigate() {
    if(this.anonymousUser){
      this.router.navigate(['/trademark-registration/step-1']);
    }
}

}
