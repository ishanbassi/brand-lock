import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { SharedModule } from '../shared/shared.module';
import { MatDialog } from '@angular/material/dialog';
import { TmGovtFeesPopupComponent } from '../tm-govt-fees-popup/tm-govt-fees-popup.component';

@Component({
  selector: 'app-trademark-plan-cards',
  imports: [MatButtonModule,MatIcon,SharedModule],
  templateUrl: './trademark-plan-cards.component.html',
  styleUrl: './trademark-plan-cards.component.scss'
})
export class TrademarkPlanCardsComponent {


  @Input() anonymousUser = true;
  @Output()
  onPlanSelect:EventEmitter<number> = new EventEmitter()

  @Input() showPayLater = true;

  constructor(
    private readonly dialog:MatDialog,

  ){}

  openGovtFeesPopup(fees:number) {
      this.dialog.open(TmGovtFeesPopupComponent, {data: {fees: fees}});  
  }

  navigate(planPrice: number) {
    this.onPlanSelect.emit(planPrice);
  }


}
