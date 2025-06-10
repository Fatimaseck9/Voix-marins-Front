import { Injectable } from "@angular/core";
import { RouteInfos } from "../models/routeInfo";
import { AuthService } from "../pages/auth/auth.service";
import { BaseService } from "../shared/base.service";
import { lastValueFrom } from 'rxjs';
import { environment } from "src/environments/environment.prod";

@Injectable({
    providedIn: "root",
})
export class SideBarService {
    actionGroups: any[];
    public menuItems: any[];
    userMenuItem: RouteInfos[] = [];
    constructor(public authService: AuthService, private baseService: BaseService) { }

    async initialiseSideBar(actionGroups?: any[]): Promise<any[]> {
        if (this.menuItems) {
            return this.menuItems;
        }

        this.userMenuItem = [
            {
                path: '/home',
                title: 'DALAL AK JAAM JAMBAR',
                type: 'link',
                icontype: 'dashboard',
                visible: true,
            },
            // {
    //path: '/register',
    //title: 'register',
    //visible: true,
   // type: 'link',
    //icontype: 'report_problem' // ou tout autre icône Material Icons
 // },
        ];
        if (!actionGroups) {
            actionGroups =  await this.getActionGroups()
        }

        actionGroups = actionGroups.filter(
            (ac) => ac.titre === environment.applicationName
        );

        actionGroups.forEach((actionGroup) => {
            actionGroup.actions.forEach((action) => {
                this.addMenuItem(actionGroup, action);
            });
        });

        this.userMenuItem.sort((a, b) => b.index - a.index);
        this.menuItems = this.userMenuItem.filter((menuItem) => menuItem);

        return this.getNavBar();

    }

    async getActionGroups() {
        const response: any = await lastValueFrom(
            this.baseService.get(
                "jambars/utilisateurs/username/" + this.authService.getCurrentAccount().username,
                false
            )
            
        );
        return response.data.actionGroups;
    }


    getNavBar(): any[] {
        return this.menuItems;
    }

    addMenuItem(groupe, action) {
        let currentGroup = this.userMenuItem.find(uMI => uMI.title === groupe.titre);
        if (currentGroup) {
            let currentChild = currentGroup.children.find(cC => cC.path === action.path)
            if (!currentChild)
                currentGroup.children.push({ path: action.path, title: action.titre, ab: action.ab })
        } else {
            this.userMenuItem.push({
                path: groupe.path,
                title: groupe.titre,
                type: groupe.type,
                icontype: groupe.icon,
                collapse: groupe.collapse,
                children: [
                    { path: action.path, title: action.titre, ab: action.ab }
                ]
            })
        }
    }

}
