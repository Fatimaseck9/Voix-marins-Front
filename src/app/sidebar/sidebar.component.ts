import { Component, OnInit } from '@angular/core';
import PerfectScrollbar from 'perfect-scrollbar';
import { Account } from '../models/account';
import { Router } from '@angular/router';
import { BaseService } from '../shared/base.service';
import { AuthService } from '../pages/auth/auth.service';
import { ActionGroup } from '../models/actionGroup';
import { RouteInfos } from '../models/routeInfo';
import { group } from '@angular/animations';

declare const $: any;

// Metadata
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

export let ROUTES = [];

@Component({
    selector: 'app-sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})

export class SidebarComponent implements OnInit {
    public menuItems: any[];
    actionsGroup: ActionGroup[] = [];

    account: Account = new Account();
    userMenuItem : RouteInfos[] = []; 
    constructor(private router: Router, private baseService: BaseService, public authService: AuthService) { 
    }

    ngOnInit() {
        this.account = this.authService.getCurrentAccount();
        if (this.authService.isLoggedIn()) {
            this.actionsGroup.unshift({
                titre: 'DALAL AK JAAM JAMBAR',
                path: '/mfe/home',
                type: 'link',
                icon: 'dashboard',
                //visible: true
            });
            // console.log(this.actionsGroup);
            this.getActionsGroup( res => {
                this.getSideBarItem(res => {
                    // order menuItem
                    this.userMenuItem.sort((a,b) => (a.index < b.index) ? 1 : ((b.index < a.index) ? -1 : 0));
                    this.menuItems = this.userMenuItem.filter(menuItem => menuItem);
                });
            });
        }
    }
    getSideBarItem(cb) {
       this.actionsGroup.forEach(actionGroup => {
           actionGroup.actions.forEach(action => {
               if (this.isPresent(action.roles)) {
                   this.addMenuItem(actionGroup, action)
               } 
           });
           return cb(1);
       });
    }

    addMenuItem(groupe, action) {
        let currentGroup = this.userMenuItem.find(uMI => uMI.title === groupe.titre);
        if (currentGroup) {
            let currentChild = currentGroup.children.find(cC => cC.path === action.path)
            if (!currentChild)
                currentGroup.children.push({path: action.path, title: action.titre, ab: action.ab})
        }else {
            this.userMenuItem.push({
                path: groupe.path,
                title: groupe.titre,
                type: groupe.type,
                icontype: groupe.icon,
                collapse: groupe.collapse,
                children: [
                    {path: action.path, title: action.titre, ab: action.ab}
                ]
            })
        }
    }
    isPresent(roles) {
        let userRoles = this.authService.getAccountRoles();
        let present = false;
        let i = 0;
        while ( !present && i < userRoles.length) {
            present = roles.find(r => r && r.name === userRoles[i]);
            i++;
        }
        return present;
    }

    getActionsGroup(cb){
    this.baseService.get('/ActionGroups?filter={"include":["actions"]}',true)
      .subscribe(
        res => {
          this.actionsGroup = res;
          // console.log('Action Groups:', res);
          this.actionsGroup.unshift({
            titre: 'DALAL AK JAAM JAMBAR',
            path: '/home',
            type: 'link',
            icon: 'dashboard'
          });
          this.actionsGroup.forEach(actionGroup => {
            actionGroup.actions.forEach(action => {
                action.roles = [];
                this.baseService.get('/ActionRoles?filter={"where":{"actionId":"'+action.id+'"}, "include":"role"}',false)
                .subscribe(
                  res => {
                      res.forEach(actionRole => {
                        action.roles.push(actionRole.role);
                      });
                    return cb(1);
                  },
                  err => {
                    console.log (err);
                  }
                )
            });
          });
          console.log(this.actionsGroup)
        },
        err => {
          console.log(err);
        }
      )
    }
    isUserLoggedIn(): boolean {
        // Insérez ici la logique pour vérifier si l'utilisateur est connecté
        return this.authService.isLoggedIn(); // Par exemple, si vous utilisez un service d'authentification
    }

    logout(){
        this.baseService.post("Accounts/logout", true,{accessTokenID: this.authService.getToken()})
        .subscribe(
          res => {
            // redirect to login
            this.router.navigate(['/pages/login']);
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

    updatePS(): void  {
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
