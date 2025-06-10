import { Component, OnInit } from '@angular/core';
import PerfectScrollbar from 'perfect-scrollbar';
import { Account } from '../models/account';
import { Router } from '@angular/router';
import { BaseService } from '../shared/base.service';
import { AuthService } from '../pages/auth/auth.service';
import { SideBarService } from './sidebar.service';

declare const $: any;

//Metadata
export interface RouteInfo {
    path: string;
    title: string;
    visible: boolean;
    type: string;
    icontype: string;
    collapse?: string;
    index?: number,
    children?: ChildrenItems[];
}

export interface ChildrenItems {
    path: string;
    visible: boolean;
    title: string;
    ab: string;
    type?: string;
}
export let ROUTES: RouteInfo[] = [
  {
    path: '/admin/tableau-bord',
    title: 'Tableau de bord',
    visible: true,
    type: 'link',
    icontype: 'dashboard'
  },
  {
    path: '/admin/plaintes',
    title: 'Plaintes',
    visible: true,
    type: 'link',
    icontype: 'report_problem'
  },
  //{
   // path: '/admin/register',
    //title: 'Inscription admin',
   // visible: true,
    //type: 'link',
    //icontype: 'person'
  //},

 // {
    //path: '/admin/admin-list',
    //title: 'Liste des administrateurs',
    //visible: true,
    //type: 'link',
    //icontype: 'people' // Choisis une icône Material appropriée
 // }
  
];

@Component({
    selector: 'app-sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})

export class SidebarComponent implements OnInit {
    public menuItems: any;
    account: any = new Account();
    constructor(private router: Router, private sideBarService: SideBarService, private baseService: BaseService, public authService: AuthService) {
    }

    async ngOnInit() {
        this.account = this.authService.getCurrentAccount();
        if (this.authService.isLoggedIn()) {
            //this.menuItems = await this.sideBarService.initialiseSideBar()
            this.menuItems = ROUTES.filter(menuItem => menuItem.visible);

        }
    }

    logout() {
        this.baseService.post("Accounts/logout", true, { accessTokenID: this.authService.getToken() })
            .subscribe(
                res => {
                    // redirect to login
                    this.router.navigate(['/login']);
                },
                err => {
                    console.log(err);
                }
            )
        this.authService.logout();
    }
    isMobileMenu() {
        if ($(window).width() > 991) {
            return false;
        }
        return true;
    };

    updatePS(): void {
        if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
            const elemSidebar = <HTMLElement>document.querySelector('.sidebar .sidebar-wrapper');
            let ps = new PerfectScrollbar(elemSidebar, { wheelSpeed: 2, suppressScrollX: true });
        }
    }
    isMac(): boolean {
        let bool = false;
        if (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0) {
            bool = true;
        }
        return bool;
    }
}
