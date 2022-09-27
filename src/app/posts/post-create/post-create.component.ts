import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from'@angular/forms'; 
import { ReadVarExpr } from '@angular/compiler';
import { mimeType } from './mime-type.validator';

@Component({
    selector: 'app-post-create',
    templateUrl: './post-create.component.html',
    styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
    //enteredTitle: string = "";
    //enteredPost: string = "";
    //@Output() createdPost = new EventEmitter<Post>();
    postsService: PostsService;
    postId: string = "" 
    mode = "create";
    post: Post = {id: "", title: "", content: "", imagePath: "", creator: ""};
    isLoading = false;
    form!: FormGroup;
    imagePreview?: string | null = "";

    constructor (postService: PostsService, public route: ActivatedRoute) {
        this.postsService = postService;
    }

    ngOnInit() {
        this.form = new FormGroup({
           'title': new FormControl(null, { validators: [Validators.required, Validators.minLength(3)] }),
           'content': new FormControl(null, { validators: [Validators.required] }),
           'image': new FormControl(null, { validators: [], asyncValidators: [mimeType] })
        });
        this.route.paramMap.subscribe(paramMap => {
            console.log("router param: " + paramMap.get('postId'));
            if(paramMap.has('postId')) {
                this.postId =  paramMap.get('postId') || "";
                console.log("this.postId from paramMap: " + this.postId);
                this.mode = "edit";
                this.isLoading = true; // right after we click on 'edit', the spinner shows until after the post is received
                console.log("About to call postsService.getPost()");
                this.postsService.getPost(this.postId).subscribe(postObj => { 
                    this.isLoading = false;
                    console.log("postObj returned from backend: " + postObj);
                    this.post = {id: postObj._id, title: postObj.title, content: postObj.content, imagePath: postObj.imagePath, creator: postObj.creator };
                    // this.post.id = post._id;
                    // this.post.title = post.title;
                    // this.post.content = post.content;
                    console.log("this.post after setting prop values from returned obj: " + this.post);
                    this.form.setValue({ title: this.post.title, content: this.post.content, image: this.post.imagePath });
                    console.log("this form values after setting the values in the form: " + this.form.value);
                });
            } else {
                this.mode = "create";
                this.postId = "";    
            }
        })
    }

    onImagePicked(event: Event) {
       const file = (event.target as HTMLInputElement).files![0];
       this.form.patchValue({image: file});
       this.form.get('image')!.updateValueAndValidity();

       const reader = new FileReader();
       reader.onload = () => {
           this.imagePreview = reader.result as string;
       };
       reader.readAsDataURL(file);  
    }

    onAddPost() {
        console.log(this.form);
        if(this.form.invalid) {
            return;
        }
        this.isLoading = true; // no need to set it to false later in code because we are navigating away from page anyway, and when re-rendering, it's reset to false.
        if(this.mode === "create") {
            const post: Post = { id: "", title: this.form.value.title, content: this.form.value.content, imagePath: this.form.value.imagePath, creator: null};
            this.postsService.addPost(post, this.form.value.image);
        }
        else {
            this.postsService.updatePost(this.post.id, this.form.value.title, this.form.value.content, this.form.value.image);
        } 
        this.form!.reset();
    }
}