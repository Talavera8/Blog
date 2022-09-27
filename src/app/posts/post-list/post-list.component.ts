import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';


@Component({
    selector: 'app-post-list',
    templateUrl: './post-list.component.html',
    styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
    
    // @Input() posts: Post[] = [];
    posts: Post[] = [];
    postsSubscription?: Subscription;
    authStatusSubscription?: Subscription;
    userIsAuthenticated = false;
    userId: string | null = "";
    isLoading = false;
    totalPosts = 0;
    postsPerPage = 2;
    pageSizeOptions = [1,2,3,5];
    currentPage = 1;
    

    constructor(private postsService: PostsService, private authService: AuthService) {}

    ngOnInit() {
        this.isLoading = true;
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
        this.userId = this.authService.getUserId();
        this.postsSubscription = this.postsService.getPostsUpdatedListener()
        .subscribe((postsDataObj: {posts: Post[], postCount: number}) => { // id is null bc _id will be ignored, but we don't need it here
            this.posts = postsDataObj.posts;
            this.totalPosts = postsDataObj.postCount;
            this.isLoading = false;
        }); 
        this.userIsAuthenticated = this.authService.getIsAuthenticated();  
        this.authStatusSubscription = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
            this.userIsAuthenticated = isAuthenticated;
        });  
    }
    
    onDelete(postId: string) {
        this.postsService.deletePost(postId).subscribe(() => {
            this.postsService.getPosts(this.postsPerPage, this.currentPage);
        });
    }

    onPageChanged(pageData: PageEvent) {
        this.postsPerPage = pageData.pageSize;
        this.currentPage = pageData.pageIndex + 1;
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
    }

    ngOnDestroy() {
        this.postsSubscription?.unsubscribe();
    }
}
