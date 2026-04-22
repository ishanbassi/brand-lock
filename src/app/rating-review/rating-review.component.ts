import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TestimonialsList } from '../enums/TestimonialsList';

@Component({
  selector: 'app-rating-review',
  templateUrl: './rating-review.component.html',
  styleUrl: './rating-review.component.scss',
  imports:[CommonModule]
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

  constructor() {}

  ngOnInit(): void {}

  getStars(rating: number) {
    return this.starsArray.map((_, i) => i < Math.round(rating));
  }

  getAvatarColor(index: number) {
    return this.AVATAR_COLORS[index % this.AVATAR_COLORS.length];
  }
}