import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
    token: any;
    userIsAuthenticated: boolean = false;
    authListenerSubscription!: Subscription;


    constructor(private authService: AuthService) { }
    ngOnInit() {
        this.userIsAuthenticated = this.authService.getIsAuthenticated();
        this.authListenerSubscription = this.authService.getAuthStatusListener()
            .subscribe((isAuthenticated: boolean) => {
                this.userIsAuthenticated = isAuthenticated;
            });
    }
    onLogout() {
        this.authService.logout();
    }
    ngOnDestroy() {
        this.authListenerSubscription.unsubscribe();
    }
}
