import { Component, EventEmitter, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pricing-section',
  imports: [MatIconModule],
  templateUrl: './pricing-section.component.html',
  styleUrl: './pricing-section.component.scss'
})
export class PricingSectionComponent {

  @Output()
  private planTypeEmitter:EventEmitter<string> = new EventEmitter();



  setSelectedPlan(planType:string) {
    this.planTypeEmitter.emit(planType);
    this.scrollToForm();
    }

    scrollToForm() {
      const el = document.getElementById('ctaForm');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
}
