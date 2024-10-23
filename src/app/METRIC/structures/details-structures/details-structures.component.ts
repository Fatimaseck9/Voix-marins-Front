import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { NotificationService } from "src/app/shared/services/notifications";
import { BaseService } from "src/app/shared/base.service";
import { metricService } from "src/app/shared/metricService";

import { Subject } from "rxjs";
import { Router } from "@angular/router";
import { FormBuilder, Validators } from "@angular/forms";
import * as XLSX from "xlsx";

@Component({
  selector: "app-details-structures",
  templateUrl: "./details-structures.component.html",
  styleUrls: ["./details-structures.component.css"],
})
export class DetailsStructuresComponent implements OnInit {
  // pour l'arbre de la structure

  dtTriggerCollaborateurs: Subject<any> = new Subject();
  dtTriggerIndicateurs: Subject<any> = new Subject();
  dtOptions: any = {};
  userToManage: any;

  structure: any;

  nodeDetails: any = [];
  addIndicateurForm = this.fb.group({
    usersToAdd: [],
  });

  userErrorrs: any = [];

  selectedRoles: any = [];
  userEmail: string;
  roles = ["animateur", "manager", "Support Metric", "none"];

  // pour la liste des collaborateurs

  jambarUsers = [];

  collaborateurs: any = [];
  indicateurs: any = [];
  proprietaires: any = [];
  suppleants: any = [];
  analystes: any = [];
  porteurs: any = [];
  showListeIndicateur = false;
  showCollaborateur = false;
  usersdropdownSettings: any;

  usersForms: any;
  desactiverUserAdd = true;

  constructor(
    private jambarsService: BaseService,
    private notification: NotificationService,
    private metricService: metricService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
  }

  ngOnInit() {
    this.usersdropdownSettings = {
      singleSelection: false,
      idField: "id",
      textField: "nomComplet",
      selectAllText: "Selectionner tout",
      unSelectAllText: "Deselectionner tout",

      noDataAvailablePlaceholderText: "Aucun utlisateurs àajouter",
      allowSearchFilter: true,
    };
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 10,
      language: {
        processing: "Traitement en cours...",
        search: "Rechercher&nbsp;:",
        lengthMenu: "Afficher _MENU_ &eacute;l&eacute;ments",
        info: "Affichage des &eacute;lements _START_ &agrave; _END_ sur _TOTAL_ &eacute;l&eacute;ments",
        infoEmpty:
          "Affichage des &eacute;lements 0 &agrave; 0 sur 0 &eacute;l&eacute;ments",
        infoFiltered:
          "(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)",
        infoPostFix: "",
        loadingRecords: "Chargement en cours...",
        zeroRecords: "Aucun indicateur &agrave; afficher",
        emptyTable: "Il n y a pas encore de données",
        paginate: {
          first: "Premier",
          previous: "Pr&eacute;c&eacute;dent",
          next: "Suivant",
          last: "Dernier",
        },
        aria: {
          sortAscending: ": activer pour trier la colonne par ordre croissant",
          sortDescending:
            ": activer pour trier la colonne par ordre décroissant",
        },
      },
      dom: "Bfrtip",
      // Configure the buttons
      buttons: [
        {
          extend: "excel",
          text: '<i class="material-icons">save_alt</i> Modèle KPI',
          titleAttr: "Copier",
        },
        {
          extend: "excel",
          text: '<i class="material-icons">save_alt</i> Modèle Suivis',
          titleAttr: "Suivi",

          filename: function () {
            return "Indicateurs";
          },
        },
        {
          extend: "excel",
          text: '<i class="material-icons">save_alt</i> Export',
          titleAttr: "export",
        },
      ],
    };
    const structureId = this.activatedRoute.snapshot.paramMap.get("id");
    this.jambarsService.get("Accounts", true).subscribe(
      (res: any) => {
        // console.log('jambars users');
        // console.log(res);
        res.forEach((element: any) => {
          element.nomComplet =
            element.prenom + " " + element.nom + " (" + element.email + ")";
          this.jambarUsers.push(element);
        });

        this.getStructure(structureId);
      },
      (err) => {
        console.log(err);
        let msg =
          "Erreur lors de la récupération des utilisateurs de Jambars. Vérifier la connexion";
        this.notification.showNotification(
          "top",
          "right",
          "danger",
          "METRIC",
          msg
        );
      }
    );
  }

  getStructure(structureId: string, init = true) {
    this.showListeIndicateur = false;
    this.showCollaborateur = false;
    if (init == false) {
      this.dtTriggerCollaborateurs = new Subject<any>();
      this.dtTriggerIndicateurs = new Subject<any>();
      this.desactiverUserAdd = true;
    } else {
      this.desactiverUserAdd = false;
    }

    this.metricService
      .get(
        `structures?filter[include][]=structuresEnfants&filter[include][]=collaborateurs&filter[include][]=indicateurs&filter[where][id]=${structureId}`
      )
      .subscribe(
        (structures: any) => {
          this.structure = structures[0];
          this.collaborateurs = [];

          if (this.structure.indicateurs) {
            this.indicateurs = this.structure.indicateurs;
          }

          if (this.structure.collaborateurs) {
            const collaborateursFromMetric = this.structure.collaborateurs;

            let collaborateurFromMetricIds = [];
            for (let i = 0; i < collaborateursFromMetric.length; i++) {
              const collaborateurFromMetric = collaborateursFromMetric[i];
              collaborateurFromMetricIds.push(collaborateurFromMetric.id);

              let user: any = this.jambarUsers.find(
                (user) => user.id == collaborateurFromMetric.id
              );
              if (
                collaborateurFromMetric.structureAnimeeId == this.structure.id
              ) {
                user.animateur = true;
              }

              if (
                collaborateurFromMetric.structureManagedId == this.structure.id
              ) {
                user.manager = true;
              }

              if (collaborateurFromMetric.supportMetric == true) {
                user.supportMetric = true;
              }

              this.collaborateurs.push(user);
            }

            this.usersForms = this.jambarUsers.filter(
              (user) => !collaborateurFromMetricIds.includes(user.id)
            );
            this.desactiverUserAdd = false;
          } else {
            this.usersForms = this.jambarUsers;
          }

          this.nodeDetails = [];
          let nodeParent = {
            name: this.structure.sigle,
            cssClass: "ngx-org-ceo",
            image: "",
            title: this.structure.name,
            childs: [],
            id: this.structure.id,
          };

          if (this.structure.structuresEnfants) {
            this.structure.structuresEnfants.forEach((enfant) => {
              nodeParent.childs.push({
                name: enfant.sigle,
                cssClass: "ngx-org-ceo",
                image: "",
                title: enfant.name,
                childs: [],
                id: enfant.id,
              });
            });
          }

          this.nodeDetails.push(nodeParent);
          // console.log(this.nodeDetails);
          this.dtTriggerCollaborateurs.next();
          this.dtTriggerIndicateurs.next();
          this.showListeIndicateur = true;
          this.showCollaborateur = true;
        },
        (error) => {
          console.log(error);
          this.dtTriggerCollaborateurs.next();
          this.dtTriggerIndicateurs.next();
        }
      );
  }

  goToDetails(event) {
    this.router.navigate(["metric/structures", event.id]);
  }

  goToDemande() {
    this.router.navigate([
      "metric/structures/indicateurs-suivis",
      this.structure.id,
    ]);
  }

  goToParent() {
    if (this.structure.parentId != "null") {
      this.router.navigate(["metric/structures", this.structure.parentId]);
    } else {
      this.router.navigate(["metric/structures"]);
    }
  }

  setUserManage(user) {
    this.userToManage = user;
    this.userEmail = user.email;
  }

  addUsers(formValue: any) {
    this.userErrorrs = [];
    const data = {
      structureId: this.structure.id,
      usersToAdd: formValue.usersToAdd,
    };

    this.metricService.post("structures-add-user", data).subscribe(
      (res: any) => {
        if (res.success == true) {
          this.notification.showNotification(
            "top",
            "right",
            "success",
            "METRIC",
            res.message
          );
          this.addIndicateurForm = this.fb.group({
            usersToAdd: [],
          });
          this.getStructure(this.structure.id, false);
        } else {
          this.notification.showNotification(
            "top",
            "right",
            "danger",
            "METRIC",
            res.message
          );

          for (let i = 0; i < res.userIdsErrors.length; i++) {
            const id = res.userIdsErrors[i];
            let user = this.jambarUsers.find((u) => u.id == id);

            this.userErrorrs.push({
              prenom: user.prenom,
              nom: user.nom,
            });
          }
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  downloadError(nomFichier, errors) {
    const worksheet = XLSX.utils.json_to_sheet(errors);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, nomFichier);

    /* save to file */
    XLSX.writeFile(workbook, nomFichier + ".xlsx");
  }

  retirerUser() {
    const data = {
      userId: this.userToManage.id,
    };

    // console.log(data);

    this.metricService.post("structures-delete-user", data).subscribe(
      (res: any) => {
        if (res.success == true) {
          this.notification.showNotification(
            "top",
            "right",
            "success",
            "METRIC",
            res.message
          );

          this.getStructure(this.structure.id, false);
        } else {
          this.notification.showNotification(
            "top",
            "right",
            "danger",
            "METRIC",
            res.message
          );
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  showDataTable(init: any) {
    if (init == false) {
      this.dtTriggerCollaborateurs = new Subject<any>();
      this.dtTriggerIndicateurs = new Subject<any>();
    }
    this.dtTriggerCollaborateurs.next();
    this.dtTriggerIndicateurs.next();
  }

  submitUserForm() {
    if (!this.selectedRoles || !this.userEmail) {
      const msg = "Formulaire invalide";
      this.notification.showNotification(
        "top",
        "right",
        "danger",
        "METRIC",
        msg
      );
      return;
    }

    for (let i = 0; i < this.selectedRoles.length; i++) {
      const role = this.selectedRoles[i];
      if (!this.roles.includes(role)) {
        const msg = "Formulaire invalide";
        this.notification.showNotification(
          "top",
          "right",
          "danger",
          "METRIC",
          msg
        );
        return;
      }
    }

    this.metricService
      .post("structures/manager-animateur", {
        userId: this.userToManage.id,
        roles: this.selectedRoles,
        structureId: this.structure.id,
        email: this.userEmail,
      })
      .subscribe((res: any) => {
        if (res.success) {
          this.notification.showNotification(
            "top",
            "right",
            "success",
            "METRIC",
            res.message
          );
        }
        this.selectedRoles = [];
        this.showDataTable(false);
        this.getStructure(this.structure.id, false);
      });
  }

  ngOnDestroy(): void {
    this.dtTriggerCollaborateurs.unsubscribe();
    this.dtTriggerIndicateurs.unsubscribe();
  }
}
