import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Blog } from "../../../models/blog.model";
import dayjs from "dayjs/esm";
import { map } from "rxjs";


@Injectable({ providedIn: 'root' })
export class BlogService {
  constructor(
    private readonly http: HttpClient
  ) { }

  getBlogs() {
    return this.http.get<any>(`${environment.BaseBlogUrl}/api/blogs?fields[0]=title&fields[1]=excerpt&fields[2]=slug&fields[3]=createdAt&fields[4]=author&fields[5]=category&populate[featuredImage]=true`);
  }

  getBlogBySlug(slug: string) {
    return this.http.get<any>(
      `${environment.BaseBlogUrl}/api/blogs?filters[slug][$eq]=${slug}&populate=*`
    );
  }

  getBlogsByPage(page = 1, pageSize = 5) {
    return this.http.get<any>(`${environment.BaseBlogUrl}/api/blogs?fields[0]=title&fields[1]=excerpt&fields[2]=slug&fields[3]=createdAt&fields[4]=author&fields[5]=category&populate[featuredImage]=true&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=createdAt:desc`);
  }

  getLatestBlogs(limit = 3) {
    return this.http.get<any>(`${environment.BaseBlogUrl}/api/blogs?sort=createdAt:desc&pagination[limit]=${limit}&fields[0]=title&fields[1]=excerpt&fields[2]=slug&fields[3]=createdAt&fields[4]=author&fields[5]=category&populate[featuredImage]=true`);
  }

  getLatestBlogsByCategory(limit = 3, category: string) {
    return this.http.get<any>(`${environment.BaseBlogUrl}/api/blogs?filters[category][$eq]=${category}&sort=createdAt:desc&pagination[limit]=${limit}&fields[0]=title&fields[1]=excerpt&fields[2]=slug&populate[featuredImage]=true`)
    .pipe(map(res => this.convertDateFromServer(res)));
    
    
  }
  convertDateFromServer(blog: Blog): Blog {
    blog.data = blog.data.map(d => {
      return {
        ...d,
        createdAt: d.createdAt ? dayjs(d.createdAt) : undefined,
        updatedAt: d.updatedAt ? dayjs(d.updatedAt) : undefined,
      }
    })
    return blog

  }


}
