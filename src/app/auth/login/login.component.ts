import { Component } from "@angular/core";
import { NgForm } from "@angular/forms";
import { AuthService } from "../auth.service";

@Component({
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    constructor(private authService: AuthService) {}
    isLoading = false;

    onLogin(loginForm: NgForm) {
        console.log(loginForm.value.email);
        console.log(loginForm.value.password);
        this.authService.loginUser(loginForm.value.email, loginForm.value.password);
    }
}

