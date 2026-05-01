import { Component, Input } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-mobile-bottom-navbar',
  imports: [SharedModule],
  templateUrl: './mobile-bottom-navbar.component.html',
  styleUrl: './mobile-bottom-navbar.component.scss'
})
export class MobileBottomNavbarComponent {
  // Replace with your actual contact details
  phoneNumber = '+916239771006';
  whatsappNumber = '+916239771006';

  @Input() showReportButton = false;
  
  onCallClick(): void {
    window.location.href = `tel:${this.phoneNumber}`;
  }

  onWhatsAppClick(): void {
    const message = encodeURIComponent('Hi! I need help with trademark registration.');
    window.open(`https://wa.me/${this.whatsappNumber.replace(/\+/g, '')}?text=${message}`, '_blank');
  }

  onEmailClick(): void {
    window.location.href = 'mailto:support@trademarx.in?subject=Trademark Inquiry';
  }

  onGetReportClick(): void {
  const currentUrl = window.location.href;
  const message = encodeURIComponent(
    `Hi! Can you send a detailed trademark report for ${currentUrl}?`
  );
  
  window.open(
    `https://wa.me/${this.whatsappNumber.replace(/\+/g, '')}?text=${message}`,
    '_blank'
  );
}

}
