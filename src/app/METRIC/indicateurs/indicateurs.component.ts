import { Component, OnInit, OnDestroy } from "@angular/core";

import { NotificationService } from "src/app/shared/services/notifications";
import { BaseService } from "src/app/shared/base.service";
import { metricService } from "src/app/shared/metric.Service";

import { Subject } from "rxjs";
import { FormBuilder, Validators } from "@angular/forms";

import * as XLSX from "xlsx";
import { AuthService } from "src/app/pages/auth/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-indicateurs",
  templateUrl: "./indicateurs.component.html",
  styleUrls: ["./indicateurs.component.css"],
})
export class IndicateursComponent implements OnInit, OnDestroy {
  jambarUsers = [];
  tendances: any[];
  unites: any[];
  operations: any[];
  periodicites: any[];
  origines: any[];
  typeIndicateurs: any[];
  objectifs: any[];
  sousObjectifs: any[];

  indicateur = {
    name: "",
    description: "",
    loi_composition: "",
    formule_calcul: "",
    valeur_cible: "",
    selectedProprietaires: [],
    selectedSuppleants: [],
    selectedAnalystes: [],
    selectedStructures: [],
    selectedAnalystesStructures: [],
    tendanceId: "",
    uniteId: "",
    operationId: "",
    periodiciteId: "",
    origineId: "",
    typeIndicateurId: "",
    sousObjectifId: "",
    objectifId: "",
    analyseRequise: [true],
  };

  // Pour le modal d'ajout d'un nouvel indicateur :
  indicateurForm: any;

  structures: any = [];

  indicateurToStop: any = undefined;

  userConnected: any;
  userConnectedStructureManaged: any = [{ id: "null" }];

  // Pour le modal de renseignement de suivi :
  suiviForm: any;

  anneesDeReconduction = [
    { id: new Date().getFullYear() - 1, annee: new Date().getFullYear() - 1 },
    { id: new Date().getFullYear(), annee: new Date().getFullYear() },
  ];

  reconductionForm: any;

  desactiverReconduction = true;

  // Pour le modal de modification d'un indicateur
  indicateurUpdateForm: any;

  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();
  showListeIndicateur = false;

  indicateurs: any;

  tendanceIndicateurToUpdate: string;
  operationIndicateurToUpdate: string;
  saisies: any;
  year = new Date().getFullYear();
  saisieToUpdate: any;
  typeEdit: any;
  analysePaToUpdate: any = { analyse: undefined };
  proprietaires: any = [];
  suppleants: any = [];
  analystes: any = [];

  oldStructures: any = [];
  oldStructuresAnalystes: any = [];
  indicateursAReconduire: any = [];
  proprietairedropdownSettings: any;

  structuredropdownSettings: any;
  suppleantdropdownSettings: any;
  porteurdropdownSettings: any;
  sousObjectisdropdownSettings: any;
  anneedropdownSettings: any;
  indicateursAReconduiredropdownSettings: any;
  desactiverUserAdd = true;
  porteurAnalyse: any = [{}];
  anneeCreationIndicateur: any;

  oldProprietaires: any;
  oldSuppleants: any;
  oldAnalystes: any;

  TAO: any;
  collaborateurDisabled: boolean = true;
  analystesChoiceDisabled: boolean = true;
  stopOrDeleteText = "arrêter";

  selectedFile: File | null;
  event: any = null;
  views = [
    { id: "METRIC_ADMIN_VIEW", bool: true },
    { id: "METRIC_ANIMATEUR_VIEW", bool: true },
    { id: "METRIC_MANAGER_VIEW", bool: true },
  ];

  superUsers: any[];
  constructor(
    private fb: FormBuilder,

    private jambarsService: BaseService,
    private notification: NotificationService,
    private metricService: metricService,
    private authService: AuthService,
    private router: Router
  ) {
    this.views.forEach((view) => {
      view.bool = this.authService.getRoleSectionView(view.id);
    });

    this.indicateurForm = this.fb.group({
      name: ["", Validators.required],
      description: [""],
      loi_composition: [""],
      formule_calcul: [""],
      valeur_cible: [""],
      selectedProprietaires: [],
      selectedSuppleants: [],
      selectedAnalystes: [],
      selectedStructures: [],
      selectedAnalystesStructures: [],
      tendanceId: [""],
      uniteId: [""],
      operationId: [""],
      periodiciteId: [""],
      origineId: [""],
      typeIndicateurId: [""],
      sousObjectifId: [],
      analyseRequise: [true],
    });
    this.userConnected = this.authService.getCurrentAccount();

    this.suiviForm = this.fb.group({
      valeur: ["", Validators.required],
      objectifPeriodique: ["", Validators.required],
    });

    this.reconductionForm = this.fb.group({
      annees: ["", Validators.required],
      indicateurs: [],
    });

    this.indicateurUpdateForm = this.fb.group({
      name: [this.indicateur.name, Validators.required],
      description: [this.indicateur.description],
      loi_composition: [this.indicateur.loi_composition],
      formule_calcul: [this.indicateur.formule_calcul],
      valeur_cible: [this.indicateur.valeur_cible],
      selectedProprietaires: [this.indicateur.selectedProprietaires],
      selectedStructures: [this.indicateur.selectedStructures],
      selectedAnalystesStructures: [
        this.indicateur.selectedAnalystesStructures,
      ],
      selectedSuppleants: [this.indicateur.selectedSuppleants],
      selectedAnalystes: [this.indicateur.selectedAnalystes],
      tendanceId: [this.indicateur.tendanceId],
      uniteId: [this.indicateur.uniteId],
      operationId: [this.indicateur.operationId],
      periodiciteId: [this.indicateur.periodiciteId],
      origineId: [this.indicateur.origineId],
      typeIndicateurId: [this.indicateur.typeIndicateurId],
      sousObjectifId: [this.indicateur.sousObjectifId],
      analyseRequise: [this.indicateur.analyseRequise],
    });
  }

  ngOnInit() {
    this.userConnected.roles = this.authService.getAccountRoles();
console.log("USER::::"+this.userConnected.roles)
    if (
      !this.userConnected.roles.includes("ROLE_METRIC_ADMIN") &&
      !this.userConnected.roles.includes("ROLE_ADMIN") &&
      !this.userConnected.roles.includes("ROLE_METRIC_BASE")
    ) {
      this.router.navigate(["/"]);
    } else {
      this.metricService
        .get(`users?filter[where][id]=${this.userConnected.id}`)
        .subscribe(
          (res) => {
            if (res.length > 0) {
              if (
                res[0].structureManagedId &&
                res[0].structureManagedId != "null"
              ) {
                this.metricService
                  .get(
                    `structures?filter[where][id]=${res[0].structureManagedId}`
                  )
                  .subscribe(
                    (structure) =>
                      (this.userConnectedStructureManaged = structure),
                    (err) => {
                      console.log(err);
                    }
                  );
              }
            }
          },
          (err) => {
            console.log(err);
          }
        );

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
          emptyTable: "Il n y a pas encore d'indicateur",
          paginate: {
            first: "Premier",
            previous: "Pr&eacute;c&eacute;dent",
            next: "Suivant",
            last: "Dernier",
          },
          aria: {
            sortAscending:
              ": activer pour trier la colonne par ordre croissant",
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
          // {
          //   extend: 'excel',
          //   text: '<i class="material-icons">save_alt</i> Export des Suivis',
          //   titleAttr: 'Suivi',

          //   filename: function () {
          //     return 'Indicateurs';
          //   },
          // },
          // {
          //   extend: 'excel',
          //   text: '<i class="material-icons">save_alt</i> Export',
          //   titleAttr: 'export',
          // },
        ],
      };

      this.proprietairedropdownSettings = {
        singleSelection: true,
        idField: "id",
        textField: "nomComplet",
        allowSearchFilter: true,
      };

      this.structuredropdownSettings = {
        singleSelection: true,
        idField: "id",
        textField: "sigleComplet",
        allowSearchFilter: true,
      };

      this.suppleantdropdownSettings = {
        singleSelection: false,
        idField: "id",
        textField: "nomComplet",

        allowSearchFilter: true,
      };

      this.indicateursAReconduiredropdownSettings = {
        singleSelection: false,
        idField: "id",
        textField: "name",
        selectAllText: "Selectionner tout",
        unSelectAllText: "Deselectionner tout",

        noDataAvailablePlaceholderText:
          "Aucun indicateur à reconduire poure cette annnée",
        allowSearchFilter: true,
      };

      this.porteurdropdownSettings = {
        singleSelection: true,
        idField: "id",
        textField: "nomComplet",
        allowSearchFilter: true,
      };

      this.sousObjectisdropdownSettings = {
        singleSelection: true,
        idField: "id",
        textField: "name",
        allowSearchFilter: true,
      };

      this.anneedropdownSettings = {
        singleSelection: true,
        idField: "id",
        textField: "annee",
        itemsShowLimit: 1,
        allowSearchFilter: true,
      };

      this.getSuperUser();

          this.jambarsService.get("jambars/utilisateurs", true).subscribe(
            (res: any) => {
              const utilisateurs = res.data || []; // Remplacez "data" par la clé correcte
              if (Array.isArray(utilisateurs)) {
                utilisateurs.forEach((element: any) => {
                  element.nomComplet =
                    element.prenom + " " + element.nom + " (" + element.email + ")";
                  this.jambarUsers.push(element);
                });
          
          
                this.proprietaires = this.jambarUsers;
                this.suppleants = this.jambarUsers;
                this.analystes = this.jambarUsers;
          
                this.getParametres();
                this.getStructures();
              } else {
                console.error("La réponse n'est pas un tableau :", utilisateurs);
              }
            },
            (err) => {
              console.log(err);
              let msg = "Vérifiez votre connexion internet";
              this.notification.showNotification("top", "right", "danger", "", msg);
            }
          );
          
    }
  }

  onAnnneReconductionSelect(anneeReconduction: any) {
    this.getIndicateursAReconduire(anneeReconduction.id);
  }

  onAnnneReconductionDeSelect(anneeReconduction: any) {
    this.desactiverReconduction = true;
  }

  getIndicateursAReconduire(anneeReconduction: string) {
    this.desactiverReconduction = true;
    this.metricService
      .get(`indicateurs/a-reconduire/${anneeReconduction}`)
      .subscribe(
        (indicateurs: any) => {
          if (indicateurs.length == 0) {
            const msg = `Tous les indicateurs ont été reconduits pour l'année ${anneeReconduction}`;
            this.notification.showNotification(
              "top",
              "right",
              "primary",
              "METRIC",
              msg
            );
          }
          this.indicateursAReconduire = indicateurs;
          this.desactiverReconduction = false;
        },
        (err) => {
          console.log(err);
        }
      );
  }

  getAllIndicateurs(init = true) {
    this.showListeIndicateur = false;
    if (init == false) {
      this.dtTrigger = new Subject<any>();
    }

    this.initialiserIndicateurForms();
    let role = "basic";
    if (
      this.userConnected.roles.includes("ROLE_METRIC_ADMIN") |
      this.userConnected.roles.includes("ROLE_ADMIN")
    ) {
      role = "admin";
    } else if (this.userConnected.roles.includes("ROLE_METRIC_ANIMATEUR")) {
      role = "animateur";
    }

    const endpoint = `users/${this.userConnected.id}/${role}/indicateurs?filter[include][]=parametres&filter[include][]=proprietaires&filter[include][]=suppleants&filter[include][]=users&filter[include][]=saisies`;

    this.metricService.get(endpoint).subscribe(
      (indicateurs: any) => {
        if (indicateurs.length > 0) {
          indicateurs.forEach((indicateur, indicateurIndex) => {
            const proprietaires = indicateur.proprietaires;
            indicateur.proprietaires = [];

            proprietaires.forEach((element) => {
              indicateur.proprietaires.push(
                this.jambarUsers.filter((user) => user.id == element.id)[0]
              );
            });

            const suppleants = indicateur.suppleants;
            indicateur.suppleants = [];
            suppleants.forEach((element) => {
              indicateur.suppleants.push(
                this.jambarUsers.filter((user) => user.id == element.id)[0]
              );
            });

            const analystes = indicateur.users;

            indicateur.users = [];
            analystes.forEach((element) => {
              indicateur.users.push(
                this.jambarUsers.filter((user) => user.id == element.id)[0]
              );
            });

            indicateur.selectedStructures = this.structures.filter(
              (st: any) => {
                return st.id == indicateur.structureId;
              }
            );

            indicateur.selectedAnalystesStructures = this.structures.filter(
              (st: any) => {
                return st.id == analystes[0].structureId;
              }
            );

            if (indicateurIndex == indicateurs.length - 1) {
              this.showListeIndicateur = true;
              this.indicateurs = indicateurs;
              // console.log("all indicateurs");
              // console.log(indicateurs);
              // this.dtTrigger.next();
            }
          });
        } else {
          this.showListeIndicateur = true;
          this.indicateurs = indicateurs;

          // this.dtTrigger.next();
        }
      },
      (err) => {
        this.showListeIndicateur = true;
        // this.dtTrigger.next();
        let msg = "Erreur de chargement des indicateurs";
        this.notification.showNotification(
          "top",
          "right",
          "danger",
          "METRIC",
          msg
        );
        console.log(err);
      }
    );
  }

  getParametres() {
    this.metricService
      .get("parametres?filter[include][]=sousObjectifs")
      .subscribe(
        (parametres: any[]) => {
          if (parametres.length > 0) {
            this.unites = parametres.filter(
              (parametre) => parametre.type == "unite"
            );
            this.operations = parametres.filter((parametre) => {
              return parametre.type == "operation";
            });
            this.tendances = parametres.filter((parametre) => {
              return parametre.type == "tendance";
            });
            this.objectifs = parametres.filter((parametre) => {
              return parametre.type == "objectif";
            });
            this.sousObjectifs = parametres.filter((parametre) => {
              return parametre.type == "sous-objectif";
            });
            this.origines = parametres.filter((parametre) => {
              return parametre.type == "origine";
            });
            this.typeIndicateurs = parametres.filter((parametre) => {
              return parametre.type == "type-indicateur";
            });
            this.periodicites = parametres.filter((parametre) => {
              return parametre.type == "periodicite";
            });
          }
        },
        (err) => {
          let msg = "Erreur lors de la récupération des paramètres";
          this.notification.showNotification(
            "top",
            "right",
            "danger",
            "METRIC",
            msg
          );
          console.log(err);
        }
      );
  }

  setIndicateurToStop(indicateur, stop) {
    this.indicateurToStop = indicateur;
    if (stop) {
      this.stopOrDeleteText = "arrêter";
    } else {
      this.stopOrDeleteText = "supprimer";
    }
  }

  confirmArretIndicateur(indicateur) {
    this.indicateurToStop = indicateur;

    if (this.stopOrDeleteText == "arrêter") {
      this.metricService
        .patch("indicateurs", indicateur.id, {
          name: indicateur.name,
          nameWithoutAccent: indicateur.nameWithoutAccent,
          arret: true,
          dateArret: new Date(),
        })
        .subscribe(
          (res) => {
            let msg = "Indicateur arrêté";
            this.notification.showNotification(
              "top",
              "right",
              "success",
              "METRIC",
              msg
            );
            this.indicateurToStop = undefined;
            // this.getAllIndicateurs(false);
          },
          (err) => {
            let msg = "Erreur vous ne pouvez pas stopper ce KPI";
            this.notification.showNotification(
              "top",
              "right",
              "danger",
              "METRIC",
              msg
            );
            console.log(err);
          }
        );
    } else {
      this.metricService
        .delete("indicateurs-with-relation", indicateur.id)
        .subscribe(
          (res) => {
            let msg = "Indicateur supprimé";
            this.notification.showNotification(
              "top",
              "right",
              "success",
              "METRIC",
              msg
            );
            this.indicateurToStop = undefined;
            this.getStructures(false);
          },
          (err) => {
            let msg = "Erreur lors de la suppression du KPI";
            this.notification.showNotification(
              "top",
              "right",
              "danger",
              "METRIC",
              msg
            );
            console.log(err);
          }
        );
    }
  }

  async addIndicateur(newIindicateur: any, enMasse = false) {
    this.showListeIndicateur = false;
    newIindicateur.enMasse = enMasse;
    let parametres: any;
    if (enMasse == true) {
      parametres = newIindicateur.parametres;
    } else {
      if (this.validerChamps(newIindicateur) == false) {
        this.showListeIndicateur = true;
        let msg = `Erreur, vérifier si toutes les informations sont renseignées`;
        this.notification.showNotification(
          "top",
          "right",
          "danger",
          "METRIC",
          msg
        );

        return;
      }
      parametres = [
        { id: newIindicateur.tendanceId, type: "tendance" },
        { id: newIindicateur.uniteId, type: "unite" },
        { id: newIindicateur.operationId, type: "operation" },
        { id: newIindicateur.periodiciteId, type: "periodicite" },
        { id: newIindicateur.origineId, type: "origine" },
        { id: newIindicateur.typeIndicateurId, type: "type-indicateur" },
        {
          id: newIindicateur.sousObjectifId[0].id,
          type: "sous-objectif",
        },
      ];
    }

    // On ajoute la date de création de l'indicateur
    newIindicateur.dateCreation = newIindicateur.dateCreation
      ? newIindicateur.dateCreation
      : new Date();

    let indicateur: any = await this.metricService
      .post("indicateurs/with-relations", newIindicateur)
      .subscribe(
        (res) => {
          let msg = "Opération réussie";
          this.notification.showNotification(
            "top",
            "right",
            "success",
            "METRIC",
            msg
          );
          this.metricService.reloadRoute();
          // this.getAllIndicateurs(false);
          this.getStructures(false);
        },
        (err) => {
          console.log(err);
          this.showListeIndicateur = true;

          let msg = `Erreur, assurez-vous que le KPI n'est pas dupliqué et que toutes ses composantes sont renseignées`;
          this.notification.showNotification(
            "top",
            "right",
            "danger",
            "METRIC",
            msg
          );
          this.metricService.reloadRoute();
        }
      );
  }

  validerChamps(indicateur: any) {
    const champs = [
      "name",
      "valeur_cible",
      "description",
      "loi_composition",
      "formule_calcul",
    ];

    if (
      indicateur.name.toString().trim() == "" ||
      indicateur.valeur_cible.toString().trim() == "" ||
      indicateur.description.toString().trim() == "" ||
      indicateur.loi_composition.toString().trim() == "" ||
      indicateur.formule_calcul.toString().trim() == ""
    ) {
      return false;
    } else {
      return true;
    }
  }
  disableCollaborateur() {
    this.collaborateurDisabled = true;
  }

  getStructures(init = true) {
    this.metricService
      .get("structures-sigle-complet?filter[include][]=collaborateurs")
      .subscribe(
        (structures: any[]) => {
          this.structures = structures;
          this.getAllIndicateurs(init);

        },

        (error: any) => {
          console.log(error);
        }
      );
  }

  async updateIndicateur(indicateur: any) {
    if (this.validerChamps(indicateur) == false) {
      this.showListeIndicateur = true;
      let msg = `Erreur, vérifier si toutes les informations sont renseignées`;
      this.notification.showNotification(
        "top",
        "right",
        "danger",
        "METRIC",
        msg
      );

      return;
    }
    this.showListeIndicateur = false;
    this.collaborateurDisabled = true;
    this.analystesChoiceDisabled = true;
    indicateur.oldAnalystes = this.oldAnalystes;
    indicateur.oldProprietaires = this.oldProprietaires;
    indicateur.oldSuppleants = this.oldSuppleants;

    // console.log("indicateur.oldProprietaires");
    // console.log(indicateur.oldProprietaires);

    // console.log("indicateur.Proprietaires");
    // console.log(indicateur.selectedProprietaires);

    this.metricService
      .patch("indicateurs/with-relation", indicateur.id, indicateur)
      .subscribe(
        (res) => {
          let msg = "Opération réussie";
          this.notification.showNotification(
            "top",
            "right",
            "success",
            "METRIC",
            msg
          );
          // this.getAllIndicateurs(false);
          this.metricService.reloadRoute();
          this.getStructures(false);
        },
        (err) => {
          console.log(err);
          this.showListeIndicateur = true;

          let msg = `Echec ! Assurez-vous que tous les champs sont renseignés et que le KPI n'est pas dupliqué`;
          this.notification.showNotification(
            "top",
            "right",
            "danger",
            "METRIC",
            msg
          );
          this.metricService.reloadRoute();
        }
      );
  }

  reconduireIndicateurs(valeurs: any) {
    this.metricService
      .post("indicateurs/a-reconduire", {
        annee: valeurs.annees[0].annee,
        indicateurs: valeurs.indicateurs,
      })
      .subscribe(
        (response: any) => {
          if (response.success == true) {
            let msg = "Opération réussie";
            this.notification.showNotification(
              "top",
              "right",
              "success",
              "METRIC",
              msg
            );
            this.desactiverReconduction = true;
            this.indicateursAReconduire = [];
            this.reconductionForm = this.fb.group({
              annees: ["", Validators.required],
              indicateurs: [],
            });
          } else {
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

  onStructureSelect(structure: any) {
    this.collaborateurDisabled = false;
    this.setAuthorizedProprietairesAndSuppleants(structure);
  }

  onStructureDeSelect(structure: any) {
    this.indicateurForm.controls["selectedProprietaires"].setValue([]);
    this.indicateurForm.controls["selectedSuppleants"].setValue([]);

    this.collaborateurDisabled = true;

    this.proprietaires = this.jambarUsers;
    this.suppleants = this.jambarUsers;
  }

  onProprietaireSelect(proprietaire: any) {
    const selectedProprietairesIds = [];
    // On récpère les propriétaires selectionnés selon une création ou modification d'un indicateur
    const selectedProprietaires =
      this.indicateurForm.value.selectedProprietaires ||
      this.indicateurUpdateForm.value.selectedProprietaires;

    if (selectedProprietaires) {
      // selectedProprietaires.forEach((item) =>
      //   selectedProprietairesIds.push(item.id)
      // );
      // On retire les propriétaires de la liste de choix des suppléants du Kpi
      // this.suppleants = this.suppleants.filter(
      //   (suppleant) => !selectedProprietairesIds.includes(suppleant.id)
      // );
    }
  }

  onProprietaireDeSelect(proprietaireDeSelected: any) {
    this.suppleants = this.suppleants.concat([proprietaireDeSelected]);
    // On récpère les selectedSuppleants selectionnés selon une création ou modification d'un indicateur
    const selectedSuppleants =
      this.indicateurForm.value.selectedSuppleants ||
      this.indicateurUpdateForm.value.selectedSuppleants;

    // On retire les propriétaires de la liste de choix du propriétaires du Kpi

    // if (selectedSuppleants) {
    //   const selectedSuppleantsds = [];
    //   selectedSuppleants.forEach((item) => {
    //     selectedSuppleantsds.push(item.id);
    //   });
    //   if (selectedSuppleantsds.includes(proprietaireDeSelected.id)) {
    //     this.proprietaires = this.proprietaires.filter(
    //       (proprietaire) => proprietaire.id != proprietaireDeSelected.id
    //     );
    //   }
    // }
  }
  onSuppleantSelect(suppleant: any) {
    // On récupère les selectedSuppleants selectionnés selon une création ou modification d'un indicateur
    const selectedSuppleants =
      this.indicateurForm.value.selectedSuppleants ||
      this.indicateurUpdateForm.value.selectedSuppleants;

    // On retire les suppléants de la liste de choix du proprietaire du Kpi
    // const selectedSuppleantsds = [];
    // if (selectedSuppleants) {
    //   selectedSuppleants.forEach((item) => {
    //     selectedSuppleantsds.push(item.id);
    //   });
    //   this.proprietaires = this.proprietaires.filter(
    //     (suppleant) => !selectedSuppleantsds.includes(suppleant.id)
    //   );
    // }
  }

  onSuppleantDeSelect(suppleantDeSelect: any) {
    this.proprietaires = this.proprietaires.concat([suppleantDeSelect]);
    // On récpère les selectedSuppleants selectionnés selon une création ou modification d'un indicateur
    const selectedProprietaires =
      this.indicateurForm.value.selectedProprietaires ||
      this.indicateurUpdateForm.value.selectedProprietaires;
    // if (selectedProprietaires) {
    //   const selectedProprietairesIds = [];
    //   selectedProprietaires.forEach((item) =>
    //     selectedProprietairesIds.push(item.id)
    //   );
    //   if (selectedProprietairesIds.includes(suppleantDeSelect.id)) {
    //     this.suppleants = this.proprietaires.filter(
    //       (suppleant) => !(suppleantDeSelect.id == suppleant.id)
    //     );
    //   }
    // }
  }

  onStructureAnalysteSelect(structure: any) {
    this.analystesChoiceDisabled = false;
    this.structures.forEach((st: any) => {
      if (st.collaborateurs && st.id != structure.id) {
        st.collaborateurs.forEach((c: any) => {
          this.analystes = this.analystes.filter((a: any) => {
            return (a.id == c.id) == false;
          });
        });
      } else if (st.collaborateurs && st.id == structure.id) {
        st.collaborateurs.forEach((c: any) => {
          if (
            this.analystes.find((element: any) => element.id == c.id) ==
            undefined
          ) {
            this.analystes.push(
              this.jambarUsers.filter((user: any) => user.id == c.id)[0]
            );
          }
        });
      }
    });
  }
  onStructureAnalystesDeSelect(structure: any) {
    this.indicateurForm.controls["selectedAnalystes"].setValue([]);
    this.analystesChoiceDisabled = true;

    this.analystes = this.jambarUsers;
  }

  onUpdateStructureSelect(structure: any) {
    if (structure.id != this.oldStructures[0].id) {
      this.indicateurUpdateForm.controls["selectedProprietaires"].setValue([]);
      this.indicateurUpdateForm.controls["selectedSuppleants"].setValue([]);
    } else {
      this.indicateurUpdateForm.controls["selectedProprietaires"].setValue(
        this.oldProprietaires
      );
      this.indicateurUpdateForm.controls["selectedSuppleants"].setValue(
        this.oldSuppleants
      );
    }
    this.collaborateurDisabled = false;
    this.structures.forEach((st: any) => {
      if (st.collaborateurs && st.id != structure.id) {
        st.collaborateurs.forEach((c: any) => {
          this.proprietaires = this.proprietaires.filter((p: any) => {
            return (p.id == c.id) == false;
          });
          this.suppleants = this.suppleants.filter((s: any) => {
            return (s.id == c.id) == false;
          });
          // Cette ligne permet de retirer les analystes appartenant à d'autre structure de la liste des analystes de la structure selectionnée
          // mais on commente en attendant de voir si on va laisser ou pas

          // this.analystes = this.analystes.filter((a: any) => {
          //   return (a.id == c.id) == false;
          // });
        });
      } else if (st.collaborateurs && st.id == structure.id) {
        st.collaborateurs.forEach((c: any) => {
          if (
            this.proprietaires.find((element: any) => element.id == c.id) ==
            undefined
          ) {
            this.proprietaires.push(
              this.jambarUsers.filter((user: any) => user.id == c.id)[0]
            );
          }
          if (
            this.suppleants.find((element: any) => element.id == c.id) ==
            undefined
          ) {
            this.suppleants.push(
              this.jambarUsers.filter((user: any) => user.id == c.id)[0]
            );
          }

          // Cette ligne permet de retirer les analystes appartenant à d'autre structure de la liste des analystes de la structure selectionnée
          // mais on commente en attendant de voir si on va laisser ou pas
          // if (
          //   this.analystes.find((element: any) => element.id == c.id) ==
          //   undefined
          // ) {
          //   this.analystes.push(
          //     this.jambarUsers.filter((user: any) => user.id == c.id)[0]
          //   );
          // }
        });
      }
    });
  }
  onUpdateStructureDeSelect(structure: any) {
    this.indicateurUpdateForm.controls["selectedProprietaires"].setValue([]);
    this.indicateurUpdateForm.controls["selectedSuppleants"].setValue([]);

    this.collaborateurDisabled = true;

    this.proprietaires = this.jambarUsers;
    this.suppleants = this.jambarUsers;
  }

  onUpdateStructureAnalystesSelect(structure: any) {
    this.analystesChoiceDisabled = false;
    if (structure.id == this.oldStructuresAnalystes[0].id) {
      this.indicateurUpdateForm.controls["selectedAnalystes"].setValue(
        this.oldAnalystes
      );
    } else {
      this.indicateurUpdateForm.controls["selectedAnalystes"].setValue([]);
    }
    this.setAuthorizedAnalystes(structure);

    // console.log(this.analystes.length);
  }

  setAuthorizedProprietairesAndSuppleants(structure: any) {
    this.collaborateurDisabled = false;
    this.structures.forEach((st: any) => {
      if (st.collaborateurs && st.id != structure.id) {
        st.collaborateurs.forEach((c: any) => {
          this.proprietaires = this.proprietaires.filter((p: any) => {
            return (p.id == c.id) == false;
          });
          this.suppleants = this.suppleants.filter((s: any) => {
            return (s.id == c.id) == false;
          });

          // Cette ligne permet de retirer les analystes appartenant à d'autre structure de la liste des analystes de la structure selectionnée
          // mais on commente en attendant de voir si on va laisser ou pas
          // this.analystes = this.analystes.filter((a: any) => {
          //   return (a.id == c.id) == false;
          // });
        });
      } else if (st.collaborateurs && st.id == structure.id) {
        st.collaborateurs.forEach((c: any) => {
          // Cette ligne permet de retirer les analystes appartenant à d'autre structure de la liste des analystes de la structure selectionnée
          // mais on commente en attendant de voir si on va laisser ou pas
          // if (
          //   this.analystes.find((element: any) => element.id == c.id) ==
          //   undefined
          // ) {
          //   this.analystes.push(
          //     this.jambarUsers.filter((user: any) => user.id == c.id)[0]
          //   );
          // }

          if (
            this.proprietaires.find((element: any) => element.id == c.id) ==
            undefined
          ) {
            this.proprietaires.push(
              this.jambarUsers.filter((user: any) => user.id == c.id)[0]
            );
          }

          if (
            this.suppleants.find((element: any) => element.id == c.id) ==
            undefined
          ) {
            this.suppleants.push(
              this.jambarUsers.filter((user: any) => user.id == c.id)[0]
            );
          }
        });
      }
    });
  }

  setAuthorizedAnalystes(structure: any) {
    let selectedStructuresCollaborateurs = [];
    this.analystes = this.jambarUsers;

    this.structures.forEach((st: any) => {
      if (st.collaborateurs) {
        if (st.id != structure.id) {
          st.collaborateurs.forEach((c: any) => {
            this.analystes = this.analystes.filter((a: any) => a.id != c.id);
          });
        } else {
          selectedStructuresCollaborateurs = st.collaborateurs;
        }
      }
    });

    if (selectedStructuresCollaborateurs.length > 0) {
      selectedStructuresCollaborateurs.forEach((c: any) => {
        if (
          this.analystes.find((element: any) => element.id == c.id) == undefined
        ) {
          this.analystes.push(
            this.jambarUsers.find((user: any) => user.id == c.id)
          );
        }
      });
    }
  }

  onUpdateStructureAnalystesDeSelect(structure: any) {
    this.indicateurUpdateForm.controls["selectedAnalystes"].setValue([]);
    this.analystesChoiceDisabled = true;

    this.analystes = this.jambarUsers;
  }

  updateIndicateurForm(indicateurToUpdate) {
    this.collaborateurDisabled = false;
    this.analystesChoiceDisabled = false;
    let oldParametresToUpdates: any = {};
    let sousObjectifName: any;

    indicateurToUpdate.parametres.forEach((parametre) => {
      switch (parametre.type) {
        case "tendance":
          oldParametresToUpdates.tendanceId = parametre.id;
          break;
        case "unite":
          oldParametresToUpdates.uniteId = parametre.id;
          break;
        case "operation":
          oldParametresToUpdates.operationId = parametre.id;
          break;
        case "periodicite":
          oldParametresToUpdates.periodiciteId = parametre.id;
          break;
        case "origine":
          oldParametresToUpdates.origineId = parametre.id;
          break;
        case "type-indicateur":
          oldParametresToUpdates.typeIndicateurId = parametre.id;
          break;
        case "sous-objectif":
          oldParametresToUpdates.sousObjectifId = parametre.id;
          sousObjectifName = parametre.name;
          break;
      }
    });
    let structureId = indicateurToUpdate.structureId;
    indicateurToUpdate.selectedStructures = this.structures.filter(
      (item: any) => item.id == structureId
    );

    this.oldStructures = indicateurToUpdate.selectedStructures;

    let structureAnalyste = indicateurToUpdate.selectedAnalystesStructures;
    indicateurToUpdate.selectedAnalystesStructures = this.structures.filter(
      (item: any) => item.id == structureAnalyste[0].id
    );

    this.oldStructuresAnalystes =
      indicateurToUpdate.selectedAnalystesStructures;

    this.setAuthorizedAnalystes(
      indicateurToUpdate.selectedAnalystesStructures[0]
    );

    this.indicateurUpdateForm = this.fb.group({
      id: [indicateurToUpdate.id, Validators.required],
      name: [indicateurToUpdate.name, Validators.required],
      description: [indicateurToUpdate.description],
      loi_composition: [indicateurToUpdate.loi_composition],
      formule_calcul: [indicateurToUpdate.formule_calcul],
      valeur_cible: [indicateurToUpdate.valeur_cible],
      selectedProprietaires: [indicateurToUpdate.proprietaires],
      selectedSuppleants: [indicateurToUpdate.suppleants],
      selectedAnalystes: [indicateurToUpdate.users],
      selectedStructures: [indicateurToUpdate.selectedStructures],
      selectedAnalystesStructures: [
        indicateurToUpdate.selectedAnalystesStructures,
      ],
      tendanceId: [oldParametresToUpdates.tendanceId],
      uniteId: [oldParametresToUpdates.uniteId],
      origineId: [oldParametresToUpdates.origineId],
      typeIndicateurId: [oldParametresToUpdates.typeIndicateurId],
      sousObjectifId: [
        [
          {
            id: oldParametresToUpdates.sousObjectifId,
            name: sousObjectifName,
          },
        ],
      ],
      operationId: [oldParametresToUpdates.operationId],
      periodiciteId: [oldParametresToUpdates.periodiciteId],
      parametres: [indicateurToUpdate.parametres],
      nameWithoutAccent: [indicateurToUpdate.nameWithoutAccent],
      analyseRequise: [indicateurToUpdate.analyseRequise],
    });

    this.oldProprietaires = indicateurToUpdate.proprietaires;
    this.oldSuppleants = indicateurToUpdate.suppleants;
    this.oldAnalystes = indicateurToUpdate.users;

    this.proprietaires = this.jambarUsers;
    this.suppleants = this.jambarUsers;

    this.setAuthorizedProprietairesAndSuppleants(
      indicateurToUpdate.selectedStructures[0]
    );

    this.oldSuppleants.forEach((oldSuppleant: any) => {
      this.proprietaires = this.proprietaires.filter(
        (proprietaire: any) => proprietaire.id != oldSuppleant.id
      );
    });

    this.oldProprietaires.forEach((oldProprietaire: any) => {
      this.suppleants = this.suppleants.filter(
        (suppleant: any) => suppleant.id != oldProprietaire.id
      );
    });
  }

  initialiserIndicateurForms() {
    this.indicateurForm = this.fb.group({
      name: ["", Validators.required],
      description: [""],
      loi_composition: [""],
      formule_calcul: [""],
      valeur_cible: [""],
      selectedProprietaires: [],
      selectedSuppleants: [],
      selectedAnalystes: [],
      selectedStructures: [],
      selectedAnalystesStructures: [],
      tendanceId: [""],
      uniteId: [""],
      operationId: [""],
      periodiciteId: [""],
      origineId: [""],
      typeIndicateurId: [""],
      sousObjectifId: [],
      analyseRequise: [true],
    });
    this.indicateurUpdateForm = this.fb.group({
      name: ["", Validators.required],
      description: [""],
      loi_composition: [""],
      formule_calcul: [""],
      valeur_cible: [""],
      selectedProprietaires: [],
      selectedSuppleants: [],
      selectedAnalystes: [],
      selectedStructures: [],
      selectedAnalystesStructures: [],
      tendanceId: [""],
      uniteId: [""],
      operationId: [""],
      periodiciteId: [""],
      origineId: [""],
      typeIndicateurId: [""],
      sousObjectifId: [],

      nameWithoutAccent: [""],
      analyseRequise: [true],
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.event = event;
    if (
      this.selectedFile.type !=
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      let msg = "Veuillez choisir un fichier Excel";
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

  uploadFile(type) {
    if (this.selectedFile) {
      this.showListeIndicateur = false;

      let fileReader = new FileReader();
      fileReader.readAsBinaryString(this.selectedFile);
      let data: any;
      fileReader.onload = (e) => {
        let workBook = XLSX.read(fileReader.result, { type: "binary" });
        let sheetsNames = workBook.SheetNames;
        data = XLSX.utils.sheet_to_json(workBook.Sheets[sheetsNames[0]]);
        let dataFromExcel: any = {};
        let url = "";
        switch (type) {
          case "suivis":
            let role = "basic";
            if (
              this.userConnected.roles.includes("ROLE_METRIC_ADMIN") ||
              this.userConnected.roles.includes("ROLE_ADMIN")
            ) {
              role = "admin";
            } else if (
              this.userConnected.roles.includes("ROLE_METRIC_ANIMATEUR")
            ) {
              role = "animateur";
            }
            dataFromExcel = {
              jambarsUsers: this.jambarUsers,
              userConnected: this.userConnected,
              role: role,
              suivisFromExcel: data,
              superUsers: this.superUsers,
            };

            url = "saisies/en-masse";
            break;
          case "indicateurs":
            dataFromExcel = {
              jambarsUsers: this.jambarUsers,
              indicateursFromExcel: data,
            };
            url = "indicateurs/en-masse";
            break;
        }

        this.metricService
          .post(url, dataFromExcel)
          .subscribe((response: any) => {
            if (response.success) {
              this.showListeIndicateur = true;

              if (type == "indicateurs") {
                this.getStructures(false);
              }
              this.notification.showNotification(
                "top",
                "right",
                "success",
                "METRIC",
                response.message
              );
            } else {
              this.notification.showNotification(
                "top",
                "right",
                "danger",
                "METRIC",
                response.message
              );
              this.showListeIndicateur = true;

              if (response.data) {
                this.downloadError("erreurs", response.data);
              }
            }
          }),
          (error: any) => {
            this.showListeIndicateur = true;

            console.log(error);
            let msg = `Erreur lors de l'importation des données`;
            this.notification.showNotification(
              "top",
              "right",
              "danger",
              "METRIC",
              msg
            );
          };
      };

      this.event.target.value = null;
    }
  }

  reinitialiserEventFile() {
    // console.log("reinitialiserEventFile");
    if (this.event != null) {
      this.event.target.value = null;
    }
  }

  downloadError(nomFichier, errors) {
    const worksheet = XLSX.utils.json_to_sheet(errors);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, nomFichier);

    /* save to file */
    XLSX.writeFile(workbook, nomFichier + ".xlsx");
  }

  downloadModel(type) {
    this.metricService.post(`template`, { type: type }).subscribe(
      (res: any) => {
        if (res.success) {
          this.metricService.download(`template${type}`);
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

  getSuperUser() {
    this.metricService
      .post("list_user", new FormData().append("instance", "1079"))
      .subscribe({
        next: (res) => {
          this.superUsers = res.filter((user: any) => user.id != null);
        },
        err: (err) => {
          console.log(err);
        },
      });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
