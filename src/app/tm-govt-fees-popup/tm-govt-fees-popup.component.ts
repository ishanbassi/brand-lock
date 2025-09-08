import { NgClass } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogContent } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-tm-govt-fees-popup',
  imports: [MatIcon, MatDialogClose, MatDialogContent, NgClass],
  templateUrl: './tm-govt-fees-popup.component.html',
  styleUrl: './tm-govt-fees-popup.component.scss'
})
export class TmGovtFeesPopupComponent {

  fees = 999;
  selectedTab = 'individuals';
  govtFees = 0;
  totalFees = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data:{fees:number}

  ){
    this.fees = data.fees;
    this.onBusinessTypeChange(this.selectedTab);
    

  }


  onBusinessTypeChange(type: string) {
    this.selectedTab = type;
    this.govtFees = this.selectedTab == 'individuals'?  4500 : 9000;
    this.totalFees = this.fees + this.govtFees;
}

  

}
