import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-default-top-section',
  imports: [],
  templateUrl: './default-top-section.component.html',
  styleUrl: './default-top-section.component.scss'
})
export class DefaultTopSectionComponent implements OnInit {
  
  @Input()
  heading = '';
  @Input()
  subHeading = '';

  @Input()
  backgroundImg = '';
  
ngOnInit(): void {
  }

}
