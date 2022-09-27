import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthData } from "./auth-data.model";
import { Router } from "@angular/router";
import { Subject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AuthService {

    private token: string = "";
    private isAuthenticated = false;
    private authStatusListener = new Subject<boolean>();
    private tokenTimer: any;
    private userId: string | null = "";

    constructor(private http: HttpClient, private router: Router) { }

    getToken() {
        console.log("from authService, return token from getToken() method: " + this.token);
        return this.token;
    }

    getIsAuthenticated() {
        return this.isAuthenticated;
    }

    getUserId() {
        return this.userId;
    }

    getAuthStatusListener() {
        return this.authStatusListener.asObservable();
    }

    createUser(email: string, password: string) {
        const authData: AuthData = {
            email: email,
            password: password
        };
        console.log("AuthData: " + authData);
        this.http.post("http://localhost:3000/api/user/signup", authData)
            .subscribe(response => {
                console.log(response);
                this.router.navigate(["/"]);
            });
    }

    loginUser(email: string, password: string) {
        const authData: AuthData = {
            email: email,
            password: password
        }
        this.http.post<{ message: string; token: any; expiresIn: number; userId: string }>("http://localhost:3000/api/user/login", authData)
            .subscribe(response => {
                const token = response.token;
                this.token = token;
                if (token) {
                    console.log("from loginUser'r method, token: " + this.token);
                    const expiresInDuration = response.expiresIn;
                    this.setAuthTimer(expiresInDuration);
                    this.isAuthenticated = true;
                    this.userId = response.userId;
                    this.authStatusListener.next(true);
                    const now = new Date();
                    const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
                    this.saveAuthData(token, expirationDate, this.userId);
                    this.router.navigate(["/"]);
                }
            });
    }

    private setAuthTimer(duration: number) {
        this.tokenTimer = setTimeout(() => {
            this.logout();
        }, duration * 1000);

    }

    private saveAuthData(token: string, expirationDate: Date, userId: string) {
        localStorage.setItem("token", token);
        localStorage.setItem("expiration", expirationDate.toISOString());
        localStorage.setItem("userId", userId);
    }

    private clearAuthData() {
        localStorage.removeItem("token");
        localStorage.removeItem("expiration");
        localStorage.removeItem("userId");
    }

    private getAuthData() {
        const token = localStorage.getItem("token");
        const expiration = localStorage.getItem("expiration");
        const userId = localStorage.getItem("userId");
        if (!token || !expiration) {
            return;
        }
        return {
            token: token,
            expirationDate: new Date(expiration),
            userId: userId
        };
    }

    autoAuthUser() {
        const authInformation = this.getAuthData();
        if (!authInformation) {
            return;
        }
        const now = new Date();
        // time is in milliseconds already, so divide expiresIn time by 1000 to convert back
        // into seconds because the timer already converts the time it gets into milliseconds;
        // we don't want to multiply seconds by 1000 twice!
        const expiresIn = authInformation!.expirationDate.getTime() - now.getTime();
        if (expiresIn > 0) {
            this.token = authInformation!.token;
            this.isAuthenticated = true;
            this.userId = authInformation.userId;
            this.authStatusListener.next(true);
            this.setAuthTimer(expiresIn / 1000);
        }
    }

    logout() {
        this.token = "";
        this.isAuthenticated = false;
        this.userId = "";
        this.authStatusListener.next(false);
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.router.navigate(["/"]);
    }
}