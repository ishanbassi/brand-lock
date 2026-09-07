import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TestimonialsList } from '../enums/TestimonialsList';
import { TeamSectionComponent } from '../team-section/team-section.component';

@Component({
  selector: 'app-rating-review',
  templateUrl: './rating-review.component.html',
  styleUrl: './rating-review.component.scss',
  imports:[CommonModule,TeamSectionComponent]
})
export class RatingReviewComponent implements OnInit {

  CONFIG:any = {
    averageRating: 4.9,
    totalReviews: 77,
    distribution: { 5: 70, 4: 6, 3: 1, 2: 0, 1: 0 },
    reviews: TestimonialsList
  };

  AVATAR_COLORS = [
    "#1a73e8","#ea4335","#34a853","#fbbc04",
    "#9c27b0","#e91e63","#00bcd4","#ff5722"
  ];

  starsArray = Array(5).fill(0);
  ratingKeys = [5,4,3,2,1];

  /** Two passes over the same reviews — see the template comment on .marquee-track. */
  marqueeRuns = [0, 1];

  /**
   * Seconds per card rather than a fixed total, so adding a review slows the loop down instead of
   * speeding every card past the reader.
   */
  private readonly SECONDS_PER_CARD = 7;

  constructor() {}

  ngOnInit(): void {}

  getStars(rating: number) {
    return this.starsArray.map((_, i) => i < Math.round(rating));
  }

  get marqueeDuration(): string {
    return `${this.CONFIG.reviews.length * this.SECONDS_PER_CARD}s`;
  }

  getAvatarColor(index: number) {
    return this.AVATAR_COLORS[index % this.AVATAR_COLORS.length];
  }
}