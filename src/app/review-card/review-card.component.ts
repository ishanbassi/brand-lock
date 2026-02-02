import { Component, Input } from '@angular/core';
import { Review, TestimonialsList } from '../enums/TestimonialsList';

@Component({
  selector: 'app-review-card',
  imports: [],
  templateUrl: './review-card.component.html',
  styleUrl: './review-card.component.scss'
})
export class ReviewCardComponent {
  @Input() review!: Review;


}
