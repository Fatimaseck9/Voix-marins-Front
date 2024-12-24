import { Component, OnInit } from "@angular/core";

import { FormBuilder, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { NotificationService } from "src/app/shared/services/notifications";

import { metricService } from "src/app/shared/metric.Service";

@Component({
  selector: "app-parametre",
  templateUrl: "./parametre.component.html",
  styleUrls: ["./parametre.component.css"],
})
export class ParametreComponent implements OnInit {
  tendances: any[];
  unites: any[];
  operations: any[];
  periodicites: any[];
  origines: any[];
  typeIndicateurs: any[];
  objectifs: any[];
  sousObjectifs: any[];

  parametres: any;

  objectifdropdownSettings: any;

  update: boolean = false;
  parametreToUpdate: any;
  exist = false;
  // Formulaire pour ajouter une valeur à un type de paramètre donné
  parametreForm: any;

  sousObjectifForm: any;

  dtOptions: any = {};
  dtTriggerTendance: Subject<any> = new Subject<any>();
  dtTriggerUnite: Subject<any> = new Subject<any>();
  dtTriggerObjectif: Subject<any> = new Subject<any>();
  dtTriggerSousObjectif: Subject<any> = new Subject<any>();
  dtTriggerPeriodicite: Subject<any> = new Subject<any>();
  dtTriggerOrigine: Subject<any> = new Subject<any>();
  dtTriggerTypeIndicateur: Subject<any> = new Subject<any>();
  dtTriggerOperation: Subject<any> = new Subject<any>();

  constructor(
    private fb: FormBuilder,
    private notification: NotificationService,
    private metricService: metricService
  ) {
    this.parametreForm = this.fb.group({
      parametreName: ["", Validators.required],
    });
    this.sousObjectifForm = this.fb.group({
      parametreName: ["", Validators.required],
      objectif: [],
    });
  }

  ngOnInit() {
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
        emptyTable: "Il n y a pas encore de paramètres",
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
          text: '<i class="material-icons">save_alt</i>',
          titleAttr: "Télécharger la liste des parametres de ce type",
        },
      ],
    };
    this.metricService.get("parametres?filter[where][type]=unite").subscribe(
      (unites: any[]) => {
        this.unites = unites;
        // this.dtTriggerUnite.next();
      },
      (err) => {
        console.log(err);
      }
    );
    this.metricService
      .get("parametres?filter[where][type]=operation")
      .subscribe(
        (operations: any[]) => {
          this.operations = operations;
          // this.dtTriggerOperation.next();
        },
        (err) => {
          console.log(err);
        }
      );
    this.metricService.get("parametres?filter[where][type]=tendance").subscribe(
      (tendances: any[]) => {
        this.tendances = tendances;
        // this.dtTriggerTendance.next();
      },
      (err) => {
        console.log(err);
      }
    );
    this.metricService
      .get(
        "parametres?filter[include][]=sousObjectifs&filter[where][type]=objectif"
      )
      .subscribe(
        (objectifs: any[]) => {
          this.objectifs = objectifs;
          // this.dtTriggerObjectif.next();
        },
        (err) => {
          console.log(err);
        }
      );
    this.metricService
      .get("parametres?filter[where][type]=sous-objectif")
      .subscribe(
        (sousObjectifs: any[]) => {
          this.sousObjectifs = sousObjectifs;
          // this.dtTriggerSousObjectif.next();
        },
        (err) => {
          console.log(err);
        }
      );
    this.metricService.get("parametres?filter[where][type]=origine").subscribe(
      (origines: any[]) => {
        this.origines = origines;
        // this.dtTriggerOrigine.next();
      },
      (err) => {
        console.log(err);
      }
    );
    this.metricService
      .get("parametres?filter[where][type]=type-indicateur")
      .subscribe(
        (typeIndicateurs: any[]) => {
          this.typeIndicateurs = typeIndicateurs;
          // this.dtTriggerTypeIndicateur.next();
        },
        (err) => {
          console.log(err);
        }
      );
    this.metricService
      .get("parametres?filter[where][type]=periodicite")
      .subscribe(
        (periodicites: any[]) => {
          this.periodicites = periodicites;
          // this.dtTriggerPeriodicite.next();
        },
        (err) => {
          console.log(err);
        }
      );
    this.objectifdropdownSettings = {
      singleSelection: true,
      idField: "id",
      textField: "name",
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };

    this.getParametres();
  }

  getParametres() {
    const endpoint = `parametres?filter[include][]=sousObjectifs`;
    this.metricService.get(endpoint).subscribe((parametres) => {
      this.parametres = parametres;
    });
  }

  addParametre(parametreToAdd, typeParametre) {
    let newParamtreName: any;

    const name = parametreToAdd.parametreName;
    // console.log(' this parr');
    // console.log(this.parametres);

    // return;

    this.exist = this.isParametreExist(this.parametres, name, "");

    if (this.exist) {
      let msg = "Ce paramètre existe déjà";
      this.notification.showNotification(
        "top",
        "right",
        "danger",
        "METRIC",
        msg
      );
      return;
    }
    newParamtreName = {
      type: typeParametre,
      name,
    };
    if (parametreToAdd.objectif) {
      newParamtreName.objectifId = parametreToAdd.objectif[0].id;
    }

    const endpoint = "parametres";
    this.metricService.post(endpoint, newParamtreName).subscribe(
      (res) => {
        this.getParametres();
        this.getNewParametresState(typeParametre);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getNewParametresState(typeParametre) {
    switch (typeParametre) {
      case "tendance":
        this.dtTriggerTendance = new Subject<any>();

        this.metricService
          .get("parametres?filter[where][type]=tendance")
          .subscribe(
            (tendances: any[]) => {
              this.tendances = tendances;
              // this.dtTriggerTendance.next();
              let msg = "Opération réussie";
              this.notification.showNotification(
                "top",
                "right",
                "success",
                "METRIC",
                msg
              );
            },
            (err) => {
              console.log(err);
            }
          );
        break;
      case "unite":
        this.dtTriggerUnite = new Subject<any>();

        this.metricService
          .get("parametres?filter[where][type]=unite")
          .subscribe(
            (unites: any[]) => {
              this.unites = unites;
              // this.dtTriggerUnite.next();
              let msg = "Opération réussie";
              this.notification.showNotification(
                "top",
                "right",
                "success",
                "METRIC",
                msg
              );
            },
            (err) => {
              console.log(err);
            }
          );
        break;
      case "operation":
        this.dtTriggerOperation = new Subject<any>();
        this.metricService
          .get("parametres?filter[where][type]=operation")
          .subscribe(
            (operations: any[]) => {
              this.operations = operations;
              // this.dtTriggerOperation.next();
              let msg = "Opération réussie";
              this.notification.showNotification(
                "top",
                "right",
                "success",
                "METRIC",
                msg
              );
            },
            (err) => {
              console.log(err);
            }
          );
        break;
      case "objectif":
        this.dtTriggerObjectif = new Subject<any>();

        this.metricService
          .get(
            "parametres?filter[include][]=sousObjectifs&filter[where][type]=objectif"
          )
          .subscribe(
            (objectifs: any[]) => {
              this.objectifs = objectifs;
              // this.dtTriggerObjectif.next();
              let msg = "Opération réussie";
              this.notification.showNotification(
                "top",
                "right",
                "success",
                "METRIC",
                msg
              );
            },
            (err) => {
              console.log(err);
            }
          );
        break;
      case "sous-objectif":
        this.dtTriggerSousObjectif = new Subject<any>();

        this.metricService
          .get("parametres?filter[where][type]=sous-objectif")
          .subscribe(
            (sousObjectifs: any[]) => {
              this.sousObjectifs = sousObjectifs;
              // this.dtTriggerSousObjectif.next();
              let msg = "Opération réussie";
              this.notification.showNotification(
                "top",
                "right",
                "success",
                "METRIC",
                msg
              );
            },
            (err) => {
              console.log(err);
            }
          );
        break;
      case "origine":
        this.dtTriggerOrigine = new Subject<any>();

        this.metricService
          .get("parametres?filter[where][type]=origine")
          .subscribe(
            (origines: any[]) => {
              this.origines = origines;
              // this.dtTriggerOrigine.next();
              let msg = "Opération réussie";
              this.notification.showNotification(
                "top",
                "right",
                "success",
                "METRIC",
                msg
              );
            },
            (err) => {
              console.log(err);
            }
          );
        break;
      case "type-indicateur":
        this.dtTriggerTypeIndicateur = new Subject<any>();

        this.metricService
          .get("parametres?filter[where][type]=type-indicateur")
          .subscribe(
            (typeIndicateurs: any[]) => {
              this.typeIndicateurs = typeIndicateurs;
              // this.dtTriggerTypeIndicateur.next();
              let msg = "Opération réussie";
              this.notification.showNotification(
                "top",
                "right",
                "success",
                "METRIC",
                msg
              );
            },
            (err) => {
              console.log(err);
            }
          );
        break;
      case "periodicite":
        this.dtTriggerPeriodicite = new Subject<any>();

        this.metricService
          .get("parametres?filter[where][type]=periodicite")
          .subscribe(
            (periodicites: any[]) => {
              this.periodicites = periodicites;
              // this.dtTriggerPeriodicite.next();
              let msg = "Opération réussie";
              this.notification.showNotification(
                "top",
                "right",
                "success",
                "METRIC",
                msg
              );
            },
            (err) => {
              console.log(err);
            }
          );
        break;
    }

    this.parametreForm = this.fb.group({
      parametreName: ["", Validators.required],
    });
    this.sousObjectifForm = this.fb.group({
      parametreName: ["", Validators.required],
      objectif: [],
    });
  }

  getParametre(parametre, update) {
    this.parametreToUpdate = parametre;

    if (update == true) {
      // Vérifie si on mode un sous Objectif pour récupérer l'objectif associé
      if (parametre.type == "sous-objectif") {
        this.metricService
          .get(`parametres?filter[where][id]=${parametre.objectifId}`)
          .subscribe(
            (res: any) => {
              this.sousObjectifForm = this.fb.group({
                parametreName: [parametre.name, Validators.required],
                objectif: [res, Validators.required],
              });
            },
            (err) => {
              console.log(err);
            }
          );
      } else {
        this.parametreForm = this.fb.group({
          parametreName: [parametre.name, Validators.required],
        });
      }

      this.update = true;
    }
  }
  updateParametre(parametreToUpdate) {
    const name = parametreToUpdate.parametreName;

    let exist = this.isParametreExist(
      this.parametres,
      name,
      this.parametreToUpdate.name
    );

    if (exist) {
      let msg = "Ce paramètre exite déjà";
      this.notification.showNotification(
        "top",
        "right",
        "danger",
        "METRIC",
        msg
      );

      return;
    }
    if (this.parametreToUpdate.type == "sous-objectif") {
      parametreToUpdate = {
        name,
        objectifId: parametreToUpdate.objectif[0].id,
      };
    } else {
      parametreToUpdate = {
        name,
      };
    }

    this.metricService
      .patch("parametres", this.parametreToUpdate.id, parametreToUpdate)

      .subscribe(
        (res) => {
          this.getParametres();

          this.getNewParametresState(this.parametreToUpdate.type);

          this.update = false;
        },
        (err) => {
          console.log(err);
        }
      );
  }

  deleteParametre() {
    if (this.parametreToUpdate.type == "objectif") {
      const sousObjectifs = this.parametres.filter(
        (param) => param.type == "sous-objectif"
      );
      for (let index = 0; index < sousObjectifs.length; index++) {
        const element = sousObjectifs[index];
        if (element.objectifId == this.parametreToUpdate.id) {
          let msg =
            "Ce objectif ne peut être supprimé. Il est lié à au moins un sous-objectif";
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
    }
    this.metricService
      .get(
        `parametre-indicateurs?filter[where][parametreId]=${this.parametreToUpdate.id}`
      )
      .subscribe(
        (parametresFromDB: any) => {
          // console.log('parametresFromDB');
          // console.log(parametresFromDB);
          if (parametresFromDB.length > 0) {
            let msg =
              "Ce paramètre ne peut être supprimé. Il est lié à au moins un indicateur";
            this.notification.showNotification(
              "top",
              "right",
              "danger",
              "METRIC",
              msg
            );
          } else {
            const endpoint = `parametres/${this.parametreToUpdate.id}`;
            this.metricService
              .delete("parametres", this.parametreToUpdate.id)
              .subscribe(
                (res) => {
                  this.parametres = [];
                  this.getParametres();
                  this.getNewParametresState(this.parametreToUpdate.type);
                },
                (err) => {
                  console.log(err);
                }
              );
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  annuler() {
    this.update = false;

    this.parametreForm = this.fb.group({
      parametreName: ["", Validators.required],
    });

    this.sousObjectifForm = this.fb.group({
      parametreName: ["", Validators.required],
      objectif: [],
    });
  }

  isParametreExist(parametres, name, oldParametreName) {
    if (this.update) {
      if (oldParametreName.trim().toLowerCase() == name.trim().toLowerCase())
        return false;
    }
    let exist = false;

    parametres.forEach((parametre) => {
      // console.log(parametre.name);
      if (parametre.name.trim().toLowerCase() == name.trim().toLowerCase()) {
        exist = true;
        return exist;
      }
    });

    return exist;
  }

  ngOnDestroy(): void {
    this.dtTriggerTendance.unsubscribe();
    this.dtTriggerObjectif.unsubscribe();
    this.dtTriggerOperation.unsubscribe();
    this.dtTriggerSousObjectif.unsubscribe();
    this.dtTriggerUnite.unsubscribe();
    this.dtTriggerPeriodicite.unsubscribe();
    this.dtTriggerOrigine.unsubscribe();
    this.dtTriggerTypeIndicateur.unsubscribe();
  }
}
