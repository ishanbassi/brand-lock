import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";


@Injectable({ providedIn: 'root' })
export class BlogService {
  constructor(
    private readonly http:HttpClient
  ){}

  getBlogs() {
    return this.http.get<any>(`${environment.BaseBlogUrl}?populate=*`);
  }

  getBlogBySlug(slug: string) {
    return this.http.get<any>(
      `${environment.BaseBlogUrl}?filters[slug][$eq]=${slug}&populate=*`
    );
  }


}
