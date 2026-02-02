import { Component } from '@angular/core';
import { TestimonialsList } from '../enums/TestimonialsList';
import { ReviewCardComponent } from '../review-card/review-card.component';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-rating-review',
  imports: [ReviewCardComponent,SharedModule],
  templateUrl: './rating-review.component.html',
  styleUrl: './rating-review.component.scss'
})
export class RatingReviewComponent {
  reviews = TestimonialsList;
   loopedReviews = [...this.reviews, ...this.reviews];

  trackByIndex(index: number): number {
    return index;
  }

}
