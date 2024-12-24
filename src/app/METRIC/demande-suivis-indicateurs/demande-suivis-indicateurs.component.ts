import { Component, OnInit, Renderer2 } from "@angular/core";

import { NotificationService } from "src/app/shared/services/notifications";
import { BaseService } from "src/app/shared/base.service";
import { metricService } from "src/app/shared/metric.Service";

import { Subject } from "rxjs";
import { FormBuilder, Validators } from "@angular/forms";
import { AuthService } from "src/app/pages/auth/auth.service";
import { ActivatedRoute } from "@angular/router";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-demande-suivis-indicateurs",
  templateUrl: "./demande-suivis-indicateurs.component.html",
  styleUrls: ["./demande-suivis-indicateurs.component.css"],
})
export class DemandeSuivisIndicateursComponent implements OnInit {
  dtOptions: any = {};
  dtTriggerEnvoie: Subject<any> = new Subject<any>();
  dtTriggerRecue: Subject<any> = new Subject<any>();
  dtTriggerAcceptee: Subject<any> = new Subject<any>();
  showListeIndicateur = false;
  demandeToManage: any;

  indicateursASuivre: any;
  demandesEnvoyees: any;
  demandesRecues: any;
  demandesAcceptees: any;
  demandeSuiviIndicateurForm: any;
  indicateursASuivredropdownSettings: any;
  userConnected: any;
  jambarUsers = [];
  metricUsers = [];
  demandeurdropdownSettings: any;
  structureId: string;

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private jambarsService: BaseService,
    private notification: NotificationService,
    private metricService: metricService,
    private authService: AuthService,
    private renderer: Renderer2
  ) {
    this.userConnected = this.authService.getCurrentAccount();
    this.demandeSuiviIndicateurForm = this.fb.group({
      demandeur: [],
      indicateurs: [],
    });
  }

  ngOnInit() {
    // this.metricService.loadStyle(
    //   `${environment.metricPath}/METRIC/demande-suivis-indicateurs/demande-suivis-indicateurs.component.css`,
    //   this.renderer
    // );
    this.structureId = this.activatedRoute.snapshot.paramMap.get("id");

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
        emptyTable: "Pas de de données",
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
          text: '<i class="material-icons">save_alt</i> Export des KPIs',
          titleAttr: "Export",
        },
      ],
    };
    this.indicateursASuivredropdownSettings = {
      singleSelection: false,
      idField: "id",
      textField: "name",
      selectAllText: "Selectionner tout",
      unSelectAllText: "Deselectionner tout",

      noDataAvailablePlaceholderText:
        "Aucun indicateur à suivre poure votre structure",
      allowSearchFilter: true,
    };
    this.demandeurdropdownSettings = {
      singleSelection: true,
      idField: "id",
      textField: "nomComplet",
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.jambarsService.get("jambars/utilisateurs", true).subscribe(
      (res: any) => {
        res.forEach((element: any) => {
          element.nomComplet =
            element.prenom + " " + element.nom + " (" + element.email + ")";
          this.jambarUsers.push(element);
        });

        this.metricService.get("users").subscribe(
          (metricUsers: any) => {
            let users = [];
            metricUsers.forEach((metricUser: any) => {
              const user = this.jambarUsers.find(
                (jambarUser) => jambarUser.id == metricUser.id
              );
              if (user) {
                users.push(user);
              }
            });
            this.metricUsers = users;
          },
          (err) => {
            console.log(err);
            let msg = "Erreur récupération des utilisateurs de metric";
            this.notification.showNotification(
              "top",
              "right",
              "danger",
              "",
              msg
            );
          }
        );
      },
      (err) => {
        console.log(err);
        let msg = "Vérifier votre connexion internet";
        this.notification.showNotification("top", "right", "danger", "", msg);
      }
    );

    this.getIndicateursDemandes(this.structureId, "demande");
    this.getIndicateursDemandes(this.structureId, "demande", false);
    this.getIndicateursDemandes(this.structureId, "suivis", true);
    this.getIndicateursASuivre(this.structureId);
  }

  getIndicateursDemandes(
    structureId: string,
    type: string,
    envoyee = true,
    init = true
  ) {
    this.metricService
      .get(`indicateurs/${structureId}/${type}/${envoyee}/structures`)
      .subscribe(
        (res: any) => {
          if (res.success) {
            if (envoyee == true && type == "demande") {
              if (init == false) {
                this.dtTriggerEnvoie = new Subject<any>();
              }
              this.demandesEnvoyees = res.demandes;

              // this.dtTriggerEnvoie.next();
            } else if (envoyee == true && type == "suivis") {
              if (init == false) {
                this.dtTriggerAcceptee = new Subject<any>();
              }

              this.demandesAcceptees = res.demandes;
              // this.dtTriggerAcceptee.next();
            } else {
              if (init == false) {
                this.dtTriggerRecue = new Subject<any>();
              }
              this.demandesRecues = res.demandes;
              // this.dtTriggerRecue.next();
            }

            if (init == false) {
              this.notification.showNotification(
                "top",
                "right",
                "success",
                "METRIC",
                res.message
              );
            }
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

  confirmerStatut(demandeToManage) {
    let demandeToUpdate = {
      statut: "accepte",
      dateDemande: new Date(),
    };

    if (demandeToManage.statut != "accepte") {
      demandeToUpdate.statut = "rejete";
    }
    this.metricService
      .patch(
        `structure-indicateurs-suivis-validation/${demandeToManage.id}`,
        "",
        demandeToUpdate
      )
      .subscribe(
        (res: any) => {
          this.getIndicateursDemandes(
            this.structureId,
            "demande",
            false,
            false
          );
        },
        (err) => {
          console.log(err);
        }
      );
  }

  getIndicateursASuivre(structureId: any) {
    this.metricService.get(`indicateurs/a-suivre/${structureId}`).subscribe(
      (res: any) => {
        if (res.success) {
          this.indicateursASuivre = res.indicateurs;
        } else {
          this.notification.showNotification(
            "top",
            "right",
            "primary",
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

  suivreIndicateurs(valeurs: any) {
    this.metricService
      .post("indicateurs/a-suivre", {
        indicateurs: valeurs.indicateurs,
        structureDemandeurId: this.structureId,
      })
      .subscribe(
        (response: any) => {
          if (response.success == true) {
            this.indicateursASuivre = [];
            this.demandeSuiviIndicateurForm = this.fb.group({
              indicateurs: [],
              demandeur: [],
            });
            this.getIndicateursDemandes(
              this.structureId,
              "demande",
              true,
              false
            );
          } else {
            this.indicateursASuivre = [];
            this.demandeSuiviIndicateurForm = this.fb.group({
              indicateurs: [],
              demandeur: [],
            });
            let msg = `Echec de l'opération`;
            this.notification.showNotification(
              "top",
              "right",
              "danger",
              "METRIC",
              msg
            );
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  annulerSuiviIndicateur() {
    this.metricService
      .delete("structure-indicateurs-suivis", this.demandeToManage.id)
      .subscribe(
        (res) => {
          this.getIndicateursDemandes(this.structureId, "suivis", true, false);
        },
        (err) => {
          console.log(err);
        }
      );
  }
  setDemandeToManage(demandeToManage, statut = "") {
    this.demandeToManage = demandeToManage;
    this.demandeToManage.statut = statut;
  }

  ngOnDestroy(): void {
    this.dtTriggerEnvoie.unsubscribe();
    this.dtTriggerRecue.unsubscribe();
    this.dtTriggerAcceptee.unsubscribe();
  }
}
