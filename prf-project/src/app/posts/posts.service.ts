import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Post } from "./post.model";
import { Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";
import { environment } from "src/environment/environment";
import { AuthService } from "../auth/auth.service";
import { HttpHeaders } from "@angular/common/http";

const BACKEND_URL = environment.apiUrl + "/posts/";

@Injectable({providedIn: "root"})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], postCount: number}>();

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;
    this.http
    .get<{message: string, posts: any, maxPosts: number}>(BACKEND_URL + queryParams)
    .pipe(
      map(postData => {
        return {
          posts: postData.posts.map((post: { title: string; content: string; _id: string; imagePath: string; creator: string; }) => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator
            };
          }),
          maxPosts: postData.maxPosts
        };
      })
    )
    .subscribe((transformedPostData) => {
      this.posts = transformedPostData.posts;
      this.postsUpdated.next({
        posts: [...this.posts], postCount: transformedPostData.maxPosts
      });
    });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{
      _id: string,
      title: string,
      content: string,
      imagePath: string,
      creator: string
    }>(BACKEND_URL + id);
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);

    const httpHeaders = {
      headers: new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`)
    };

    return this.http.post<{ message: string; post: Post }>(
      BACKEND_URL,
      postData,
      httpHeaders
    );
  }

  updatePost(id: string, title: string, content: string, image: string | File) {
    let postData: Post | FormData;
    if (typeof image === "object") {
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image as string,
        creator: null
      };
    }

    const token = this.authService.getToken();
    console.log('Token:', token);
    const httpHeaders = {
      headers: new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`)
    };

    return this.http.put(BACKEND_URL + id, postData, httpHeaders);
  }

  deletePost(postId: string) {
    const httpHeaders = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    return this.http.delete(BACKEND_URL + postId, { headers: httpHeaders });
  }

}
