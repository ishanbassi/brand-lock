import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-default-top-section',
  imports: [],
  templateUrl: './default-top-section.component.html',
  styleUrl: './default-top-section.component.scss'
})
export class DefaultTopSectionComponent {

  @Input()
  heading = '';
  @Input()
  subHeading = '';
  

}
