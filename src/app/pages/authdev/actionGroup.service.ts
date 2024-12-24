import { Injectable } from '@angular/core';
// import { isNullOrUndefined } from 'util';
import { Router } from '@angular/router';
import { Account } from '../../models/account';
import { BaseService } from 'src/app/shared/base.service';
import { ActionGroup } from 'src/app/models/actionGroup';
import { AuthService } from './auth.service';

@Injectable()
export class ActionGroupService {

  actionsGroup: ActionGroup[] = [];
  
  constructor(private router: Router, private authService: AuthService, private baseService: BaseService) { }

  getGuardItem(groupeTitle,actionPath,cb) {
    let roles = [];
    this.actionsGroup = [];
    this.getActionsGroup(res => {
      let currentActionGroup = this.actionsGroup.find(aG => aG.titre === groupeTitle);
      if (currentActionGroup) {
        let currentAction = currentActionGroup.actions.find(a => a.path === actionPath);
        if (currentAction) {
          currentAction.roles.forEach(role => {
            if (!roles.find(r => r === role.name))
              roles.push(role.name);
          });
        }
      }
      return cb(roles as Array<string>);
    })
  }

  getActionsGroup(cb){
    this.baseService.get('/ActionGroups?filter={"include":["actions"]}',true)
      .subscribe(
        res => {
          this.actionsGroup = res;
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
        },
        err => {
          console.log(err);
        }
      )
  }
}
