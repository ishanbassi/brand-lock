import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";


@Injectable({ providedIn: 'root' })
export class BlogService {
  constructor(
    private readonly http:HttpClient
  ){}

  getBlogs() {
    return this.http.get<any>(`${environment.BaseBlogUrl}/api/blogs?populate=*`);
  }

  getBlogBySlug(slug: string) {
    return this.http.get<any>(
      `${environment.BaseBlogUrl}/api/blogs?filters[slug][$eq]=${slug}&populate=*`
    );
  }

  getBlogsByPage(page=1, pageSize=5){
    return this.http.get<any>(`${environment.BaseBlogUrl}/api/blogs?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}`);
  }

  getLatestBlogs(limit=3) {
    return this.http.get<any>(`${environment.BaseBlogUrl}/api/blogs?sort=createdAt:desc&pagination[limit]=${limit}&populate=*`);
  }
  


}
