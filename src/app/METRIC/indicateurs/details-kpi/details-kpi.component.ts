import { Component, OnInit } from "@angular/core";

import { NotificationService } from "src/app/shared/services/notifications";
import { BaseService } from "src/app/shared/base.service";
import { metricService } from "src/app/shared/metricService";

import { Subject } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { FormBuilder, Validators } from "@angular/forms";

import { AuthService } from "src/app/pages/auth/auth.service";

@Component({
  selector: "app-details-kpi",
  templateUrl: "./details-kpi.component.html",
  styleUrls: ["./details-kpi.component.css"],
})
export class DetailsKpiComponent implements OnInit {
  userConnected: any;
  rightToEdit: boolean;
  jambarUsers = [];
  tendances: any[];
  unites: any[];
  operations: any[];
  periodicites: any[];
  origines: any[];
  typeIndicateurs: any[];
  objectifs: any[];
  sousObjectifs: any[];

  // Pour le modal de renseignement de suivi :
  suiviForm: any;

  dtOptions = {};
  dtTrigger: Subject<any> = new Subject<any>();

  indicateurDetail: any = {};
  idObjectif: string;
  objectifIndicateur: string;
  origineIndicateur: string;
  periodiciteIndicateur: string;
  typeIndicateur: string;
  sousObjectifIndicateur: string;
  uniteIndicateur: string;
  tendanceIndicateurToUpdate: string;
  operationIndicateurToUpdate: string;
  anneeActuel = new Date().getFullYear();
  numeroMoisActuel = new Date().getMonth();

  saisies: any = [];
  erqToMange: any;
  proprietaires = [];
  suppleants = [];
  analystes = [];
  year = new Date().getFullYear().toString();
  saisieToUpdate: any;
  typeEdit: any;
  analysePaToUpdate: any = { analyse: undefined };
  porteurs: any = [];
  porteurdropdownSettings: any;
  anneedropdownSettings: any;
  porteurAnalyse: any = [{}];
  anneeCreationIndicateur: any;
  anneesToSelect: any = [];
  selectedAnnee: any = [];

  mensualisationForm: any;

  TAO: any;

  indicateurId: any;

  views = [
    { id: "METRIC_ADMIN_VIEW", bool: true },
    { id: "METRIC_ANIMATEUR_VIEW", bool: true },
    { id: "METRIC_MANAGER_VIEW", bool: true },
  ];
  event: any = null;
  errors = [];
  fileExt: string = "XLSX, XLS, PNG, JPEG, JPG, MSG, PPTX, PDF, DOCX";
  maxFiles: number = 10;
  maxSize: number = 10; // 5MB

  formDataFiles: FormData = new FormData();

  superUsers: any[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private jambarsService: BaseService,
    private notification: NotificationService,
    private metricService: metricService,

    private authService: AuthService
  ) {
    this.userConnected = this.authService.getCurrentAccount();
    this.views.forEach((view) => {
      view.bool = this.authService.getRoleSectionView(view.id);
      // console.log(view.bool);
    });
    this.suiviForm = this.fb.group({
      valeur: ["", Validators.required],
      objectifPeriodique: ["", Validators.required],
    });

    this.mensualisationForm = this.fb.group({
      janvier: ["", Validators.required],
      fevrier: ["", Validators.required],
      mars: ["", Validators.required],
      avril: ["", Validators.required],
      mai: ["", Validators.required],
      juin: ["", Validators.required],
      juillet: ["", Validators.required],
      aout: ["", Validators.required],
      septembre: ["", Validators.required],
      octobre: ["", Validators.required],
      novembre: ["", Validators.required],
      decembre: ["", Validators.required],
    });
  }

  ngOnInit() {
    this.userConnected.roles = this.authService.getAccountRoles();

    let roles = [];
    roles = this.userConnected.roles;
    this.indicateurDetail.proprietaires = [];
    this.indicateurDetail.supplants = [];
    this.indicateurDetail.users = [];

    const indicateurId = this.activatedRoute.snapshot.paramMap.get("id");
    this.indicateurId = indicateurId;
    let role = "basic";
    if (roles.includes("ROLE_METRIC_ADMIN") || roles.includes("ROLE_ADMIN")) {
      role = "admin";
    } else if (roles.includes("ROLE_METRIC_ANIMATEUR")) {
      role = "animateur";
    }
    this.metricService
      .get(`saisies/has-right/${indicateurId}/${this.userConnected.id}/${role}`)
      .subscribe(
        (res) => {
          this.rightToEdit = res.right;
        },
        (err) => console.log("err", err)
      );

    this.metricService
      .get(
        `indicateurs?filter[include][]=parametres&filter[include][]=proprietaires&filter[include][]=suppleants&filter[include][]=users&filter[where][id]=${indicateurId}`
      )
      .subscribe((res) => {
        this.indicateurDetail = res[0];

        this.jambarsService.get("Accounts", true).subscribe(
          (res: any) => {
            res.forEach((element: any) => {
              element.nomComplet =
                element.prenom + " " + element.nom + " (" + element.email + ")";

              this.jambarUsers.push(element);
            });
            // this.porteurs = this.jambarUsers;
            this.indicateurDetail.proprietaires.forEach((element) => {
              this.proprietaires.push(
                this.jambarUsers.filter((user) => user.id == element.id)[0]
              );
            });
            this.indicateurDetail.suppleants.forEach((element) => {
              this.suppleants.push(
                this.jambarUsers.filter((user) => user.id == element.id)[0]
              );
            });
            this.indicateurDetail.users.forEach((element) => {
              this.analystes.push(
                this.jambarUsers.filter((user) => user.id == element.id)[0]
              );
            });
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

        this.getSuperUser();

        this.getSaisieIndicateurForAYear(this.year, this.indicateurDetail.id);
        this.getAnneesSuivis(this.indicateurDetail.id);

        for (let i = 0; i < this.indicateurDetail.parametres.length; i++) {
          if (this.indicateurDetail.parametres[i].type == "tendance") {
            this.tendanceIndicateurToUpdate =
              this.indicateurDetail.parametres[i].name;
            break;
          }
        }

        for (let i = 0; i < this.indicateurDetail.parametres.length; i++) {
          if (this.indicateurDetail.parametres[i].type == "operation") {
            this.operationIndicateurToUpdate =
              this.indicateurDetail.parametres[i].name;
            break;
          }
        }

        for (let i = 0; i < this.indicateurDetail.parametres.length; i++) {
          if (this.indicateurDetail.parametres[i].type == "unite") {
            this.uniteIndicateur = this.indicateurDetail.parametres[i].name;
            break;
          }
        }

        for (let i = 0; i < this.indicateurDetail.parametres.length; i++) {
          if (this.indicateurDetail.parametres[i].type == "origine") {
            this.origineIndicateur = this.indicateurDetail.parametres[i].name;
            break;
          }
        }

        for (let i = 0; i < this.indicateurDetail.parametres.length; i++) {
          if (this.indicateurDetail.parametres[i].type == "periodicite") {
            this.periodiciteIndicateur =
              this.indicateurDetail.parametres[i].name;
            break;
          }
        }

        for (let i = 0; i < this.indicateurDetail.parametres.length; i++) {
          if (this.indicateurDetail.parametres[i].type == "type-indicateur") {
            this.typeIndicateur = this.indicateurDetail.parametres[i].name;
            break;
          }
        }

        for (let i = 0; i < this.indicateurDetail.parametres.length; i++) {
          if (this.indicateurDetail.parametres[i].type == "sous-objectif") {
            this.sousObjectifIndicateur =
              this.indicateurDetail.parametres[i].name;
            break;
          }
        }

        // Récupération de l'objectif de l'indicateur
        for (let i = 0; i < this.indicateurDetail.parametres.length; i++) {
          if (this.indicateurDetail.parametres[i].type == "sous-objectif") {
            // l'id de l'objectif est isolé pour pouvoir récupérer son nom
            this.idObjectif = this.indicateurDetail.parametres[i].objectifId;
            this.metricService
              .get(`parametres?filter[where][id]=${this.idObjectif}`)
              .subscribe((res: any) => {
                this.objectifIndicateur = res[0].name;
              });
            break;
          }
        }
      });

    this.porteurdropdownSettings = {
      singleSelection: true,
      idField: "id",
      textField: "libelle",
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };

    this.anneedropdownSettings = {
      singleSelection: true,
      idField: "id",
      textField: "annee",
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
  }

  updateSaisie(saisieId, suiviMensuel: any) {
    suiviMensuel.jambarUsers = this.jambarUsers;
    suiviMensuel.initiateurPA = this.userConnected;

    if (suiviMensuel.valeur == "NA" || suiviMensuel.valeur == "ND") {
      this.metricService
        .patch("saisies-custom-update", saisieId, suiviMensuel)
        .subscribe(
          (res) => {
            this.notification.showNotification(
              "top",
              "right",
              "success",
              "METRIC",
              "Opération réussie"
            );

            this.getSaisieIndicateurForAYear(
              this.year,
              this.saisieToUpdate.indicateurId
            );
          },
          (err) => {
            console.log(err);
            this.notification.showNotification(
              "top",
              "right",
              "danger",
              "METRIC",
              "Echec"
            );
          }
        );
    } else {
      suiviMensuel.oldAnalyse = this.analysePaToUpdate.analyse;

      suiviMensuel.oldAnalysePaId = this.analysePaToUpdate.id;
      suiviMensuel.TAO = this.TAO;
      suiviMensuel.auteur = this.userConnected.id;
      this.formDataFiles.append("suiviMensuel", JSON.stringify(suiviMensuel));

      this.metricService
        .patch("saisies/with-relation", saisieId, this.formDataFiles)
        .subscribe(
          (res: any) => {
            if (res.success) {
              this.notification.showNotification(
                "top",
                "right",
                "success",
                "METRIC",
                res.message
              );

              this.metricService.reloadRoute();
              if (this.event != null) {
                this.event.target.value = null;
                this.event = null;
                this.formDataFiles = new FormData();
              }
              this.getSaisieIndicateurForAYear(
                this.year,
                this.saisieToUpdate.indicateurId
              );
            } else {
              this.notification.showNotification(
                "top",
                "right",
                "danger",
                "METRIC",
                res.message
              );
              this.metricService.reloadRoute();
            }
          },
          (err) => {
            console.log(err);
            const msg = `Erreur lors de l'enregistrement à jour du suivi`;
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
  }

  getSaisieIndicateurForAYear(year, id) {
    const endpoint = `indicateurs/${id}/saisies?filter[where][anneeId]=${year}&filter[include][]=erqs`;
    this.metricService.get(endpoint).subscribe(
      (saisies) => {
        this.saisies = saisies;

        //initialiser le formulaire de mensualisation des objectif du KPI
        this.saisies.forEach((element: any) => {
          switch (element.moisId) {
            case "janvier":
              this.mensualisationForm.controls["janvier"].setValue(
                element.objectifPeriodique
              );
              break;
            case "février":
              this.mensualisationForm.controls["fevrier"].setValue(
                element.objectifPeriodique
              );

              break;
            case "mars":
              this.mensualisationForm.controls["mars"].setValue(
                element.objectifPeriodique
              );

              break;
            case "avril":
              this.mensualisationForm.controls["avril"].setValue(
                element.objectifPeriodique
              );

              break;
            case "mai":
              this.mensualisationForm.controls["mai"].setValue(
                element.objectifPeriodique
              );

              break;
            case "juin":
              this.mensualisationForm.controls["juin"].setValue(
                element.objectifPeriodique
              );

              break;
            case "juillet":
              this.mensualisationForm.controls["juillet"].setValue(
                element.objectifPeriodique
              );

              break;
            case "août":
              this.mensualisationForm.controls["aout"].setValue(
                element.objectifPeriodique
              );

              break;
            case "septembre":
              this.mensualisationForm.controls["septembre"].setValue(
                element.objectifPeriodique
              );

              break;
            case "octobre":
              this.mensualisationForm.controls["octobre"].setValue(
                element.objectifPeriodique
              );

              break;
            case "novembre":
              this.mensualisationForm.controls["novembre"].setValue(
                element.objectifPeriodique
              );

              break;
            case "décembre":
              this.mensualisationForm.controls["decembre"].setValue(
                element.objectifPeriodique
              );

              break;
          }
        });

        if (this.saisieToUpdate != undefined) {
          this.saisieToUpdate = this.saisies.find(
            (saisie: any) => saisie.id == this.saisieToUpdate.id
          );
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getAnneesSuivis(indicateurId) {
    const endpoint = `indicateurs/${indicateurId}/saisies`;

    this.metricService.get(endpoint).subscribe(
      (res: any) => {
        let annees = [];
        this.anneesToSelect = [];

        res.forEach((element) => {
          if (!annees.includes(element.anneeId)) {
            annees.push(element.anneeId);
            this.anneesToSelect.push({
              id: element.anneeId,
              annee: element.anneeId,
            });
          }
        });

        this.selectedAnnee = [
          { id: Math.max(...annees), annee: Math.max(...annees) },
        ];
      },
      (err) => {
        console.log(err);
      }
    );
  }

  updateSaisieForm(saisies, saisie, nomOperation, nomTendance) {
    let objectifPeriodiqueSaisieActuel: any;
    let oldSaisieValeur: any;
    for (let j = 0; j < saisies.length; j++) {
      if (saisies[j].moisId == saisie.moisId) {
        oldSaisieValeur = saisies[j].valeur;
        saisies[j].valeur = this.suiviForm.value.valeur;
        objectifPeriodiqueSaisieActuel = saisies[j].objectifPeriodique;
      }
    }
    const moyenne = this.getValeurMoyenne(saisies, nomOperation, saisie.moisId);
    this.TAO = this.getTAO(
      moyenne,
      objectifPeriodiqueSaisieActuel,
      nomTendance
    );
    for (let j = 0; j < saisies.length; j++) {
      if (saisies[j].moisId == saisie.moisId) {
        saisies[j].valeur = oldSaisieValeur;
        objectifPeriodiqueSaisieActuel = saisies[j].objectifPeriodique;
      }
    }

    if (this.TAO != "NA" && this.TAO != "ND") {
      if (parseFloat(this.TAO) < 100) {
        this.suiviForm = this.fb.group({
          valeur: [
            this.suiviForm.value.valeur == "NA" ||
            this.suiviForm.value.valeur == "ND"
              ? ""
              : this.suiviForm.value.valeur,
            Validators.required,
          ],
          objectifPeriodique: [
            this.suiviForm.value.objectifPeriodique,
            Validators.required,
          ],
          analyse: [
            this.analysePaToUpdate.analyse
              ? this.analysePaToUpdate.analyse
              : "",
          ],
          planAction: [
            this.analysePaToUpdate.analyse
              ? this.analysePaToUpdate.planAction
              : "",
          ],
          dateDebut: [
            this.analysePaToUpdate.analyse
              ? this.analysePaToUpdate.dateDebut
              : "",
          ],
          dateFin: [
            this.analysePaToUpdate.analyse
              ? this.analysePaToUpdate.dateFin
              : "",
          ],
          porteur: [
            this.porteurAnalyse.length != 0 && this.porteurAnalyse[0].id
              ? this.porteurAnalyse
              : "",
          ],
        });
      } else if (parseFloat(this.TAO) >= 100) {
        this.suiviForm = this.fb.group({
          valeur: [
            this.suiviForm.value.valeur == "NA" ||
            this.suiviForm.value.valeur == "ND"
              ? ""
              : this.suiviForm.value.valeur,
            Validators.required,
          ],
          objectifPeriodique: [
            this.suiviForm.value.objectifPeriodique,
            Validators.required,
          ],
          analyse: [
            this.analysePaToUpdate.analyse
              ? this.analysePaToUpdate.analyse
              : "",
          ],
        });
      }
    } else if (
      (this.TAO == "NA" || this.TAO == "ND") &&
      nomTendance.toLowerCase() === "aucune"
    ) {
      this.suiviForm = this.fb.group({
        valeur: [
          this.suiviForm.value.valeur == "NA" ||
          this.suiviForm.value.valeur == "ND"
            ? ""
            : this.suiviForm.value.valeur,
          Validators.required,
        ],
        objectifPeriodique: [
          this.suiviForm.value.objectifPeriodique,
          Validators.required,
        ],
        analyse: [
          this.analysePaToUpdate.analyse ? this.analysePaToUpdate.analyse : "",
        ],
      });
    } else if (
      (this.TAO == "NA" || this.TAO == "ND") &&
      nomTendance.toLowerCase() != "aucune"
    ) {
      this.suiviForm = this.fb.group({
        valeur: [
          this.suiviForm.value.valeur == "NA" ||
          this.suiviForm.value.valeur == "ND"
            ? ""
            : this.suiviForm.value.valeur,
          Validators.required,
        ],
        objectifPeriodique: [
          this.suiviForm.value.objectifPeriodique,
          Validators.required,
        ],
      });
    }
  }
  setSaisieToUpdate(saisie, typeEdit) {
    if (this.event != null) {
      this.event.target.value = null;
      this.event = null;
      this.formDataFiles = new FormData();
    }
    // On réinitialise le porteur de l'analyse et le TAO
    this.porteurAnalyse = [{}];
    this.TAO = "100";

    this.analysePaToUpdate = { analyse: undefined };
    // this.analysePaToUpdate: any
    this.saisieToUpdate = saisie;

    this.suiviForm = this.fb.group({
      valeur: [
        this.saisieToUpdate.valeur != "NA" || this.saisieToUpdate.valeur != "ND"
          ? this.saisieToUpdate.valeur
          : "",
        Validators.required,
      ],
      objectifPeriodique: [
        this.saisieToUpdate.objectifPeriodique,
        Validators.required,
      ],
      analyse: [
        this.analysePaToUpdate.analyse ? this.analysePaToUpdate.analyse : "",
        Validators.required,
      ],
      planAction: [
        this.analysePaToUpdate.analyse ? this.analysePaToUpdate.planAction : "",
        Validators.required,
      ],
      dateDebut: [
        this.analysePaToUpdate.analyse ? this.analysePaToUpdate.dateDebut : "",
        Validators.required,
      ],
      dateFin: [
        this.analysePaToUpdate.analyse ? this.analysePaToUpdate.dateFin : "",
        Validators.required,
      ],
      porteur: [
        this.porteurAnalyse[0].id ? this.porteurAnalyse : "",
        Validators.required,
      ],
    });
    this.typeEdit = typeEdit;

    this.metricService
      .get(
        `analyses-plans-action?filter[where][saisieId]=${this.saisieToUpdate.id}`
      )
      .subscribe(
        (res: any) => {
          // On vérifie que si le suivi a été une fois analysé
          if (res.length > 0) {
            // On récupére l'analyse et le PA

            this.analysePaToUpdate = res[0];

            // On récupére le porteur de l'analyse

            this.porteurAnalyse = this.superUsers.filter(
              (user) => this.analysePaToUpdate.porteurId == user.id
            );
          }
          this.updateSaisieForm(
            this.saisies,
            this.saisieToUpdate,
            this.operationIndicateurToUpdate,
            this.tendanceIndicateurToUpdate
          );
        },
        (err) => {
          console.log(err);
        }
      );
  }

  onAnneeSelect(anneeSelected) {
    this.year = anneeSelected.annee.toString();

    this.getSaisieIndicateurForAYear(this.year, this.indicateurDetail.id);
  }

  getValeurMoyenne(saisies: any, operation: any, moisActuel: any): number {
    const numeroMoisActuel = this.getNumeroMois(moisActuel);

    const saisiesPeriodiques = saisies.filter((saisie: any) => {
      return numeroMoisActuel >= this.getNumeroMois(saisie.moisId);
    });

    let indexMoyenne = 0;
    let valeurMoyenne: any = undefined;
    if (
      operation.toLowerCase() == "moyenne" ||
      operation.toLowerCase() == "somme"
    ) {
      let valeurs: any = [];
      saisiesPeriodiques.forEach((saisie: any) => {
        if (saisie.valeur != "ND" && saisie.valeur != "NA") {
          if (valeurMoyenne == undefined) {
            valeurMoyenne = 0;
          }
          valeurMoyenne = parseFloat(valeurMoyenne) + parseFloat(saisie.valeur);
          indexMoyenne++;
        }
        {
          valeurs.push(saisie.valeur);
        }
      });
      if (indexMoyenne != 0) {
        if (operation.toLowerCase() == "moyenne") {
          valeurMoyenne = parseFloat(valeurMoyenne) / indexMoyenne;
        }
      } else {
        if (valeurs.includes("ND")) {
          valeurMoyenne = "ND";
        } else {
          valeurMoyenne = "NA";
        }
      }
    } else {
      let valeurs: any = [];

      for (let index = saisiesPeriodiques.length - 1; index >= 0; index--) {
        valeurs.push(saisiesPeriodiques[index].valeur.toString());
        if (
          saisiesPeriodiques[index].valeur.toString() != "NA" &&
          saisiesPeriodiques[index].valeur.toString() != "ND"
        ) {
          valeurMoyenne = parseFloat(saisiesPeriodiques[index].valeur);

          break;
        }
      }
      if (valeurMoyenne == undefined) {
        if (valeurs.includes("ND")) {
          valeurMoyenne = "ND";
        } else {
          valeurMoyenne = "NA";
        }
      }
    }

    return valeurMoyenne;
  }

  getTAO(
    valeurPeriodique: any,
    objectifPeriodique: any,
    nomTendance: any
  ): any {
    let TAO: string;
    if (nomTendance.toLowerCase() === "aucune") {
      return "NA";
    }

    if (valeurPeriodique != "NA" && valeurPeriodique != "ND") {
      if (nomTendance.toLowerCase() == "≤") {
        if (valeurPeriodique.toString() == "0") {
          TAO = "100";
        } else {
          TAO = (
            (parseFloat(objectifPeriodique) / valeurPeriodique) *
            100
          ).toFixed(2);
        }
      } else {
        if (objectifPeriodique.toString() == "0") {
          TAO = "100";
        } else {
          TAO = (
            (valeurPeriodique / parseFloat(objectifPeriodique)) *
            100
          ).toFixed(2);
        }
      }
    } else {
      TAO = valeurPeriodique;
    }

    return TAO;
  }
  mensualiserObjectif(saisieObjectifs: any) {
    const inpputsSaisie = Array.from(
      document.getElementsByClassName("saisies")
    );
    let data = [];

    for (let inpputSaisie of inpputsSaisie) {
      let id = inpputSaisie.id;
      let moisId = inpputSaisie.getAttribute("name");

      switch (moisId) {
        case "janvier":
          data.push({
            id: id,
            objectifPeriodique: saisieObjectifs["janvier"],
          });

          break;
        case "fevrier":
          data.push({
            id: id,
            objectifPeriodique: saisieObjectifs["fevrier"],
          });
          break;
        case "mars":
          data.push({
            id: id,
            objectifPeriodique: saisieObjectifs["mars"],
          });
          break;
        case "avril":
          data.push({
            id: id,
            objectifPeriodique: saisieObjectifs["avril"],
          });
          break;
        case "mai":
          data.push({
            id: id,
            objectifPeriodique: saisieObjectifs["mai"],
          });
          break;
        case "juin":
          data.push({
            id: id,
            objectifPeriodique: saisieObjectifs["juin"],
          });
          break;
        case "juillet":
          data.push({
            id: id,
            objectifPeriodique: saisieObjectifs["juillet"],
          });
          break;
        case "aout":
          data.push({
            id: id,
            objectifPeriodique: saisieObjectifs["aout"],
          });
          break;
        case "septembre":
          data.push({
            id: id,
            objectifPeriodique: saisieObjectifs["septembre"],
          });
          break;
        case "octobre":
          data.push({
            id: id,
            objectifPeriodique: saisieObjectifs["octobre"],
          });
          break;
        case "novembre":
          data.push({
            id: id,
            objectifPeriodique: saisieObjectifs["novembre"],
          });
          break;
        case "decembre":
          data.push({
            id: id,
            objectifPeriodique: saisieObjectifs["decembre"],
          });
          break;
      }
    }

    this.metricService
      .post("saisies/mensualiser-objectifs", { data: data })
      .subscribe(
        (res: any) => {
          if (res.success) {
            this.notification.showNotification(
              "top",
              "right",
              "success",
              "METRIC",
              res.message
            );
            this.getSaisieIndicateurForAYear(this.year, this.indicateurId);
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
          this.notification.showNotification(
            "top",
            "right",
            "danger",
            "METRIC",
            "Erreur lors de la mensualisation des objectifs"
          );
        }
      );
  }

  showSaisie(saisie) {
    if (this.anneeActuel > Number(saisie.anneeId)) {
      return true;
    } else if (
      this.anneeActuel.toString() == saisie.anneeId &&
      this.getNumeroMois(saisie.moisId) - 1 < this.numeroMoisActuel
    ) {
      return true;
    } else {
      return false;
    }
  }

  getNumeroMois(mois: any): number {
    switch (mois) {
      case "janvier":
        return 1;
      case "février":
        return 2;
      case "mars":
        return 3;
      case "avril":
        return 4;
      case "mai":
        return 5;
      case "juin":
        return 6;
      case "juillet":
        return 7;
      case "août":
        return 8;
      case "septembre":
        return 9;
      case "octobre":
        return 10;
      case "novembre":
        return 11;
      case "décembre":
        return 12;
      default:
        return -1;
    }
  }

  getIndicateurNameParametre(parametresIndicateur, typeParametre) {
    for (let index = 0; index < parametresIndicateur.length; index++) {
      if (parametresIndicateur[index].type == typeParametre) {
        return parametresIndicateur[index].name;
      }
    }
  }

  onFileChange(event) {
    let files = event.target.files;
    this.event = event;
    this.constructFileFormData(files);
  }

  constructFileFormData(files) {
    this.errors = [];

    if (files.length > 0 && !this.isValidFiles(files)) {
      return;
    }
    if (files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        this.formDataFiles.append("files", files[i], files[i].name);
      }
    }
  }

  private isValidFiles(files) {
    // Check Number of files
    if (files.length > this.maxFiles) {
      this.errors.push(
        "Erreur: Vous pouvez seulement uploader " +
          this.maxFiles +
          " fichier(s)"
      );
      return;
    }
    this.isValidFileExtension(files);
    return this.errors.length === 0;
  }

  private isValidFileExtension(files) {
    // Make array of file extensions
    var extensions = this.fileExt.split(",").map(function (x) {
      return x.toLocaleUpperCase().trim();
    });
    for (var i = 0; i < files.length; i++) {
      // Get file extension
      var ext = files[i].name.toUpperCase().split(".").pop() || files[i].name;
      // Check the extension exists
      var exists = extensions.includes(ext);
      if (!exists) {
        this.errors.push(
          "Le fichier envoyé n'est pas au bon format: " + files[i].name
        );
      }
      // Check file size
      this.isValidFileSize(files[i]);
    }

    //this.isValidFileSize(files[0]);
  }

  private isValidFileSize(file: any) {
    var fileSizeinMB = file.size / (1024 * 1000);
    var size = Math.round(fileSizeinMB * 100) / 100; // convert upto 2 decimal place
    if (size > this.maxSize)
      this.errors.push(
        "Erreur (Taille fichier): " +
          file.name +
          ": dépasse la limite de " +
          this.maxSize +
          "MB ( " +
          size +
          "MB )"
      );
  }

  deleteErq() {
    this.metricService.deleteFile(this.erqToMange.id).subscribe(
      (res: any) => {
        this.notification.showNotification(
          "top",
          "right",
          "success",
          "METRIC",
          "Opération Réussie"
        );
        this.metricService.reloadRoute();
        // this.getSaisieIndicateurForAYear(this.year, this.indicateurId);
      },
      (err) => {
        this.notification.showNotification(
          "top",
          "right",
          "success",
          "METRIC",
          "Opération Echouée"
        );
        console.log(err);
        this.metricService.reloadRoute();
      }
    );
  }
  setErqToManage(erq: any) {
    this.erqToMange = erq;
  }

  downloadErq(erq: any) {
    this.metricService.downloadById(erq.id);
  }

  getSuperUser() {
    this.metricService
      .post("list_user", new FormData().append("instance", "1079"))
      .subscribe({
        next: (res) => {
          this.superUsers = res.filter((user: any) => user.id != null);
          this.porteurs = this.superUsers;
        },
        err: (err) => {
          console.log(err);
        },
      });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  l;
}
