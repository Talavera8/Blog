import { Injectable } from '@angular/core';
import { Post } from './post.model';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'})
export class PostsService {
    private posts: Post[] = [];
    private postsUpdated = new Subject<{posts: Post[], postCount: number}>();

    constructor(private http: HttpClient, private router: Router){}

    getPosts(postsPerPage: number, currentPage: number) {
        const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
        this.http.get<{message: string, posts: [{title: string; content: string; _id: string; imagePath: string; creator: string }], maxPosts: number}>('http://localhost:3000/api/posts' + queryParams)
            .pipe(map(postsData => {
                return {
                    message: postsData.message,
                    posts: postsData.posts.map((post: { title: any; content: any; _id: any; imagePath: any; creator: any }) => {
                        return {
                            title: post.title,
                            content: post.content,
                            id: post._id,
                            imagePath: post.imagePath,
                            creator: post.creator
                        };
                    }),
                    maxPosts: postsData.maxPosts
                }
            }))
            .subscribe((transformedPostsData) => {
                console.log(transformedPostsData.posts);
                this.posts = transformedPostsData.posts;
                this.postsUpdated.next({posts: [...this.posts], postCount: transformedPostsData.maxPosts});
            });  
    }

    getPost(postId: string) {
        return this.http.get<{_id: string, title: string, content: string, imagePath: string, creator: string }>("http://localhost:3000/api/posts/" + postId);
    }

    updatePost(id: string, title: string, content: string, image: string | File) {
        //console.log({id: post.id, title: post.title, content: post.content});
        let postData: Post | FormData;
        if(typeof image === "object") {
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
                imagePath: image,
                creator: null
            };
        }
        this.http.put<{message: string}>("http://localhost:3000/api/posts/" + id, postData)
            .subscribe(resp => {
                console.log(resp.message);
                this.router.navigate(["/"]);
            })
    }

    addPost(post: Post, image: File) {
        const postData = new FormData();
        postData.append("title", post.title);
        postData.append("content", post.content);
        postData.append("image", image, post.title);
        this.http.post<{message: string, post: Post}>("http://localhost:3000/api/posts", postData)
            .subscribe((resp) => {
                this.router.navigate(["/"]);
            });  
    }

    deletePost(postId: string) {
        return this.http.delete<{message: string}>("http://localhost:3000/api/posts/" + postId);        
    }

    getPostsUpdatedListener() {
        return this.postsUpdated.asObservable();
    }
}