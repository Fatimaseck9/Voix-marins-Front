import { Component, OnInit } from "@angular/core";

import { FormBuilder, Validators } from "@angular/forms";

import { BaseService } from "src/app/shared/base.service";
import { metricService } from "src/app/shared/metricService";

import { NotificationService } from "src/app/shared/services/notifications";
import { Subject } from "rxjs";

import { Router } from "@angular/router";
import { AuthService } from "src/app/pages/auth/auth.service";

@Component({
  selector: "app-tableau-de-bord",
  templateUrl: "./tableau-de-bord.component.html",
  styleUrls: ["./tableau-de-bord.component.css"],
})
export class TableauDeBordComponent implements OnInit {
  dtTriggerStructure: Subject<any> = new Subject();

  tbId: any;
  tb: any = {};

  init = true;

  structureFormFielDisabled = true;
  anneeFormFielDisabled = true;
  structureSelectionnee = "DRPS";

  anneesReporting = ["2023"];
  moisReporting: any;
  anneeReporting: string;

  moisToSelect: any = [];
  mois = [
    { numero: 0, valeur: "janvier" },
    { numero: 1, valeur: "février" },
    { numero: 2, valeur: "mars" },
    { numero: 3, valeur: "avril" },
    { numero: 4, valeur: "mai" },
    { numero: 5, valeur: "juin" },
    { numero: 6, valeur: "juillet" },
    { numero: 7, valeur: "août" },
    { numero: 8, valeur: "septembre" },
    { numero: 9, valeur: "octobre" },
    { numero: 10, valeur: "novembre" },
    { numero: 11, valeur: "décembre" },
  ];
  structuresIndicateurs: any = [];
  indicateursTb: any = [];
  jambarsUsers: any = [];
  structuresdropdownSettings: any;
  originesdropdownSettings: any;

  userConnecte: any = this.authService.getCurrentAccount();

  dtOptions: any = {};

  tbs: any = [];
  tbToDelete: any;
  tbToUpdate: any = {};
  dtTriggerTb: Subject<any> = new Subject();

  updateInfoStructureForm = this.fb.group({
    anneeReporting: ["", Validators.required],
    selectedStructure: [],
    selectedOrigines: [],
    moisReporting: ["", Validators.required],
  });
  addTBForm = this.fb.group({
    name: ["", Validators.required],
    description: ["", Validators.required],
  });

  updateTBForm = this.fb.group({
    name: [
      this.tbToUpdate.name ? this.tbToUpdate.name : "",
      Validators.required,
    ],
    description: [
      this.tbToUpdate.description ? this.tbToUpdate.description : "",
      Validators.required,
    ],
  });

  userConnectedStructures: any;
  selectedStructure: any;
  origines: any = [];
  showStructureIndicateurs = false;
  reportingNotReady = true;

  views = [
    { id: "METRIC_ADMIN_VIEW", bool: true },
    { id: "METRIC_ANIMATEUR_VIEW", bool: true },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private jambarsService: BaseService,
    private metricService: metricService,
    private notification: NotificationService,
    private authService: AuthService
  ) {
    this.views.forEach((view) => {
      view.bool = this.authService.getRoleSectionView(view.id);
    });
  }

  ngOnInit() {
    this.userConnecte.roles = this.authService.getAccountRoles();

    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 24,
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
        zeroRecords: "Aucun élment  &agrave; afficher",
        emptyTable: `Pas d'élements disponible`,
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
          extend: "copy",
          text: '<i class="material-icons">file_copy</i> Copier',
          titleAttr: "Copier",
        },
        {
          extend: "excel",
          text: '<i class="material-icons">save_alt</i> Excel',
          titleAttr: "Excel",

          filename: function () {
            return "tbs";
          },
        },
      ],
    };

    this.structuresdropdownSettings = {
      singleSelection: true,
      idField: "id",
      textField: "sigleComplet",
      searchPlaceholderText: "Rechercher une structure",
      noDataAvailablePlaceholderText: "Aucune structure disponible",
      closeDropDownOnSelection: true,

      // itemsShowLimit: 3,
      allowSearchFilter: true,
    };
    this.originesdropdownSettings = {
      singleSelection: false,
      idField: "id",
      textField: "name",
      searchPlaceholderText: "Rechercher une origine",

      unSelectAllText: "Tout déselectionner",
      selectAllText: "Tout sélectionner",
      noDataAvailablePlaceholderText: "Aucune origine disponible",
      allowSearchFilter: true,
    };
    this.anneeReporting = new Date().getFullYear().toString();
    this.moisReporting = this.mois.find(
      (m) => new Date().getMonth() == m.numero
    ).valeur;

    this.moisToSelect = this.mois.filter((item) => {
      return item.numero < new Date().getMonth();
    });

    this.jambarsService.get("/Accounts", true).subscribe(
      (res) => {
        res.forEach((element: any) => {
          element.nomComplet = element.prenom + " " + element.nom;
          this.jambarsUsers.push(element);
        });
        this.getUserConnectedData();
        this.getAllTbs();
      },
      (err) => {
        let msg =
          "Erreur de chargement des utilisateurs de Jambars ! Veuillez vérifier votre connexion";
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

    this.metricService
      .get("parametres?filter[where][type]=origine")
      .subscribe((res: any) => {
        // console.log("origines");
        this.origines = res;
      });
  }

  anneeReportingChange(valeur) {
    this.anneeFormFielDisabled = true;
    this.anneeReporting = valeur;
    if (Number(valeur) == new Date().getFullYear()) {
      this.moisToSelect = this.mois.filter((item) => {
        return item.numero < new Date().getMonth();
      });
    } else {
      this.moisToSelect = this.mois;
    }
    this.anneeFormFielDisabled = false;
  }

  moisReportingChange(valeur) {
    this.moisReporting = valeur;
  }

  generateReporting(valeurs) {
    this.reportingNotReady = true;

    let selectedOrigines = [];
    if (valeurs.selectedOrigines != null) {
      selectedOrigines = valeurs.selectedOrigines.map(
        (origine) => origine.name
      );
    }

    const tbInfos = {
      jambarsUsers: this.jambarsUsers,
      annee: this.anneeReporting,
      moisActuel: this.moisReporting,
      structureId: valeurs.selectedStructure[0].id,
     
      selectedOrigines: selectedOrigines,
      userConnecteId: this.userConnecte.id,
      serverURL: this.metricService.serverURL,

      externeDRPS: false,
    };

    this.metricService.post(`construct-tb`, tbInfos).subscribe(
      (res: any) => {
        if (res.success) {
      
          this.reportingNotReady = false;
        } else {
          let msg = res.message;
          
          this.notification.showNotification(
            "top",
            "right",
            "danger",
            "METRIC",
            msg
          );
          this.reportingNotReady = true;
        }
      },
      (err) => {
        console.log(err);
        this.reportingNotReady = true;
        

        let msg = "Erreur de construction du tableau de bord";
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

  getUserConnectedData() {
    let role = "basic";
    if (this.userConnecte.roles.includes("ROLE_METRIC_ADMIN") | this.userConnecte.roles.includes("ROLE_ADMIN") ) {
      role = "admin";
    } else if (this.userConnecte.roles.includes("ROLE_METRIC_ANIMATEUR")) {
      role ="animateur"
    }
    this.metricService
      .get(`users/${this.userConnecte.id}/${role}/structures`)
      .subscribe(
        (res: any) => {
          this.userConnectedStructures = res.structures;
        

         if(res.user){
          if (res.user.structureAnimeeId && res.user.structureAnimeeId != "null") {
            this.userConnecte.structureAnimeeId = res.user.structureAnimeeId;
          }
          
         }

          
          let structureAnimee: any = [];
          if (this.userConnecte.roles.includes("ROLE_METRIC_ADMIN") || this.userConnecte.roles.includes("ROLE_ADMIN")) {
            structureAnimee = this.userConnectedStructures.find(
              (structure) => structure.sigle == "DRPS"
            );
          } else {
            structureAnimee = this.userConnectedStructures.find(
              (structure) => structure.id == this.userConnecte.structureAnimeeId
            );
          }

          this.structureSelectionnee = structureAnimee.sigleComplet;

          this.updateInfoStructureForm.controls["selectedStructure"].setValue([
            {
              id: structureAnimee.id,
              sigleComplet: structureAnimee.sigleComplet,
            },
          ]);

          this.getStructureInfos(structureAnimee.id);
        },
        (err) => {
          const msg = "Erreur de chargement des structures";
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

  onStructureSelect(structure: any) {
    this.getStructureInfos(structure.id);
  }

  getStructureInfos(structureId) {
    this.reportingNotReady = true;
    this.structureFormFielDisabled = true;
    this.showStructureIndicateurs = false;

    this.structuresIndicateurs = [];
    this.anneesReporting = [];
    this.origines = [];
    if (this.init == false) {
      this.dtTriggerStructure = new Subject();
    }
    this.metricService
      .get(`structures/${structureId}/all-indicateurs`)
      .subscribe(
        (res: any) => {
          if (res.length > 0) {
            this.init = false;
            this.structuresIndicateurs = res[0].indicateurs;

            this.anneesReporting = res[0].annees;
            this.origines = res[0].origines;
            this.structureFormFielDisabled = false;

            this.dtTriggerStructure.next();
            this.showStructureIndicateurs = true;
          } else {
            this.showStructureIndicateurs = true;
            this.structureFormFielDisabled = true;

            this.origines = [];
            this.updateInfoStructureForm.controls["selectedOrigines"].setValue(
              []
            );

            this.structuresIndicateurs = [];
            this.dtTriggerStructure = new Subject();

            this.dtTriggerStructure.next();
            const msg = "Cette structure n'a pas d'indicateurs!";
            this.notification.showNotification(
              "top",
              "right",
              "warning",
              "METRIC",
              msg
            );
          }
        },
        (err) => {
          const msg = "Erreur de chargement des indicateurs de la structures";
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

  onStructureDeSelect(structure: any) {}

  downloadReporting() {
    this.metricService.download(`${this.userConnecte.id}typeReporting.xlsx`);

    this.reportingNotReady = true;
  }

  goTbDetailPage(tbId) {
    this.router.navigate(["metric/tableau-de-bords", tbId]);
  }

  getAllTbs(init = true) {
    if (init == false) {
      this.dtTriggerTb = new Subject<any>();
    }
    this.metricService.get(`tableau-de-bords`).subscribe(
      (res: any) => {
        this.tbs = res;
        this.dtTriggerTb.next();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  addTableauDeBord(tb: any) {
    const nameWithoutAccent = this.accentDelete(tb.name.toLowerCase());
    this.metricService
      .get(
        `tableau-de-bords?filter[where][nameWithoutAccent]=${nameWithoutAccent}`
      )
      .subscribe(
        (tbs: any) => {
          if (tbs.length > 0) {
            let msg = "Ce tableau de bord existe déjà";
            this.notification.showNotification(
              "top",
              "right",
              "danger",
              "METRIC",
              msg
            );
          } else {
            this.metricService
              .post(`tableau-de-bords`, {
                name: tb.name,
                description: tb.description,
                nameWithoutAccent,
              })
              .subscribe(
                (newTB: any) => {
                  this.reInitialiserForms();
                  this.getAllTbs(false);

                  let msg = "Tableau de bord ajouté avec succès";
                  this.notification.showNotification(
                    "top",
                    "right",
                    "success",
                    "METRIC",
                    msg
                  );
                },
                (err) => {
                  let msg = "Erreur d'ajout du tableau de bord!";
                  this.notification.showNotification(
                    "top",
                    "right",
                    "success",
                    "METRIC",
                    msg
                  );
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

  updateTableauDeBord(tb: any) {
    const nameWithoutAccent = this.accentDelete(tb.name.toLowerCase());
    this.metricService
      .get(
        `tableau-de-bords?filter[where][nameWithoutAccent]=${nameWithoutAccent}`
      )
      .subscribe(
        (res: any) => {
          if (
            (res.length > 0 &&
              this.tbToUpdate.nameWithoutAccent == res[0].nameWithoutAccent) ||
            res.length == 0
          ) {
            this.metricService
              .patch("tableau-de-bords", this.tbToUpdate.id, tb)
              .subscribe(
                (res) => {
                  this.reInitialiserForms();
                  let msg = "Tableau de bord modifié avec succès";
                  this.notification.showNotification(
                    "top",
                    "right",
                    "success",
                    "METRIC",
                    msg
                  );
                  this.getAllTbs(false);
                },
                (err) => {
                  console.log(err);
                }
              );
          } else {
            let msg = "Ce tableau de bord existe déjà";
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

  deleteTB() {
    this.metricService.delete("tableau-de-bords", this.tbToDelete.id).subscribe(
      (res: any) => {
        let msg = "Tableau de bord supprimé avec succès";
        this.notification.showNotification(
          "top",
          "right",
          "success",
          "METRIC",
          msg
        );
        this.getAllTbs(false);
      },
      (err) => {
        console.log(err);
        let msg = "Erreur lors de la suppression du tableau de bord";
        this.notification.showNotification(
          "top",
          "right",
          "success",
          "METRIC",
          msg
        );
      }
    );
  }

  setTbTodelete(tb) {
    this.tbToDelete = tb;
  }
  setTbToUpdate(tb) {
    this.tbToUpdate = tb;
    this.updateTBForm = this.fb.group({
      name: [
        this.tbToUpdate.name ? this.tbToUpdate.name : "",
        Validators.required,
      ],
      description: [
        this.tbToUpdate.description ? this.tbToUpdate.description : "",
        Validators.required,
      ],
    });
  }

  reInitialiserForms() {
    this.addTBForm = this.fb.group({
      name: ["", Validators.required],
      description: ["", Validators.required],
    });
    this.updateTBForm = this.fb.group({
      name: [
        this.tbToUpdate.name ? this.tbToUpdate.name : "",
        Validators.required,
      ],
      description: [
        this.tbToUpdate.description ? this.tbToUpdate.description : "",
        Validators.required,
      ],
    });
  }

  accentDelete(inStr: any) {
    return inStr.replace(
      /([àáâãäå])|([çčć])|([èéêë])|([ìíîï])|([ñ])|([òóôõöø])|([ß])|([ùúûü])|([ÿ])|([æ])|\s/g,
      function (
        str: any,
        a: any,
        c: any,
        e: any,
        i: any,
        n: any,
        o: any,
        s: any,
        u: any,
        y: any,
        ae: any,
        space: any
      ) {
        if (a) return "a";
        if (c) return "c";
        if (e) return "e";
        if (i) return "i";
        if (n) return "n";
        if (o) return "o";
        if (s) return "s";
        if (u) return "u";
        if (y) return "y";
        if (ae) return "ae";
        if (space) return "";
      }
    );
  }

  ngOnDestroy(): void {
    this.dtTriggerStructure.unsubscribe();
    this.dtTriggerTb.unsubscribe();
  }
}
