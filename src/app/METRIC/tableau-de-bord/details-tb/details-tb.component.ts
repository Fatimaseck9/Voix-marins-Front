import { Component, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { ActivatedRoute } from "@angular/router";

import { FormBuilder, Validators } from "@angular/forms";

import { BaseService } from "src/app/shared/base.service";
import { metricService } from "src/app/shared/metricService";

import { Router } from "@angular/router";
import { NotificationService } from "src/app/shared/services/notifications";
import { AuthService } from "src/app/pages/auth/auth.service";

@Component({
  selector: "app-instance-tb",
  templateUrl: "./details-tb.component.html",
  styleUrls: ["./details-tb.component.css"],
})
export class DetailsTBComponent implements OnInit {
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {};

  indicateursToAdd: any = [];

  tbId: any;
  tb: any = {};

  anneesReporting = [];
  moisReporting: any;
  anneeReporting: string;

  isAnneeNotSelected = true;
  isMoisNotSelected = true;

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
  indicateursTb: any = [];
  indicateurIdToDelete: any;
  addIndicateurTBRelationForm = this.fb.group({
    selectedIndicateurs: ["", Validators.required],
  });
  indicateursdropdownSettings: any;
  jambarsUsers: any = [];
  userConnecte: any = this.authService.getCurrentAccount();

  reportingNotReady = true;

  constructor(
    private activatedroute: ActivatedRoute,
    private router: Router,

    private notification: NotificationService,
    private jambarsService: BaseService,

    private metricService: metricService,
    private authService: AuthService,

    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.userConnecte.roles = this.authService.getAccountRoles();

    this.anneeReporting = new Date().getFullYear().toString();
    this.moisReporting = this.mois.find(
      (m) => new Date().getMonth() == m.numero
    ).valeur;

    const tbId = this.activatedroute.snapshot.paramMap.get("tbId");

    this.jambarsService.get("/Accounts", true).subscribe(
      (res) => {
        // console.log("jambars");
        // console.log(res);

        res.forEach((element: any) => {
          element.nomComplet = element.prenom + " " + element.nom;
          this.jambarsUsers.push(element);
        });
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
    this.metricService.get("indicateurs").subscribe(
      (res: any) => {
        this.indicateursToAdd = res;
      },
      (err) => console.log(err)
    );
    this.indicateursdropdownSettings = {
      singleSelection: false,
      idField: "id",
      textField: "name",
      selectAllText: "Sélectionner tous",
      unSelectAllText: "Désélectionner tous",
      searchPlaceholderText: "Rechercher un indicateur",
      noDataAvailablePlaceholderText: "Aucun indicateur disponible",
      allowSearchFilter: true,
    };
    this.moisToSelect = this.mois.filter((item) => {
      return item.numero <= new Date().getMonth();
    });

    this.metricService.get(`tableau-de-bords/${tbId}`).subscribe(
      (res: any) => {
        if (!res.id) {
          let msg = "Tableau de bord non trouvé";
          this.notification.showNotification(
            "top",
            "right",
            "danger",
            "METRIC",
            msg
          );
        } else {
          this.tb = res;

          this.indicateursTb = [];
          this.getIndicateursTB(this.tb.id);
        }
      },
      (err) => {
        console.log(err);
        let msg = "Tableau de bord non trouvé";
        this.notification.showNotification(
          "top",
          "right",
          "danger",
          "METRIC",
          msg
        );
        // this.dtTrigger.next()
      }
    );
  }

  anneeReportingChange(valeur) {
    this.isAnneeNotSelected = true;
    this.isMoisNotSelected = true;
    this.anneeReporting = valeur;
    if (Number(valeur) == new Date().getFullYear()) {
      this.moisToSelect = this.mois.filter((item) => {
        return item.numero <= new Date().getMonth();
      });
    } else {
      this.moisToSelect = this.mois;
    }
    this.isAnneeNotSelected = false;
  }

  moisReportingChange(valeur) {
    this.isMoisNotSelected = true;
    this.moisReporting = valeur;
    this.isMoisNotSelected = false;
  }

  downloadReporting() {
    this.metricService.download(`${this.userConnecte.id}typeReporting.xlsx`);

    this.reportingNotReady = true;
  }

  setIndicateurToDeleteFromTB(indicateurId) {
    this.indicateurIdToDelete = indicateurId;
  }
  deleteIndicateurTb() {
    this.metricService
      .get(
        `tb-indicateurs?filter[where][indicateurId]=${this.indicateurIdToDelete}`
      )
      .subscribe(
        (res: any) => {
          if (res.length > 0) {
            this.metricService.delete("tb-indicateurs", res[0].id).subscribe(
              (res: any) => {
                this.addIndicateurTBRelationForm = this.fb.group({
                  selectedIndicateurs: ["", Validators.required],
                });
                this.indicateursTb = [];
                this.getIndicateursTB(this.tb.id, false);
                let msg = "Indicateur supprimé avec succès";
                this.notification.showNotification(
                  "top",
                  "right",
                  "success",
                  "METRIC",
                  msg
                );
              },
              (err) => {
                let msg = "Erreur lors de la suppression";
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
            let msg = "Cet indicateur ne figure pas dans le tableau de bord";
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
          let msg = "Erreur lors de la suppression";
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

  getIndicateursTB(tbId, init = true) {
    if (init == false) {
      this.dtTrigger = new Subject<any>();
    }
    this.metricService
      .get(`tb-indicateurs?filter[where][tableauDeBordId]=${tbId}`)
      .subscribe(
        (relations: any) => {
          // console.log("relatuin");
          // console.log(relations);
          if (relations.length == 0) {
            this.dtTrigger.next();
          }
          relations.forEach((relation, indexRelation) => {
            this.indicateursToAdd = this.indicateursToAdd.filter(
              (indicateurToAdd) => indicateurToAdd.id != relation.indicateurId
            );
            this.metricService
              .get(`indicateurs?filter[where][id]=${relation.indicateurId}`)
              .subscribe((indicateurs: any) => {
                this.indicateursTb.push(indicateurs[0]);
                if (indexRelation == relations.length - 1) {
                  this.getAnneesReporting();
                  this.dtTrigger.next();
                }
              });
          });
        },
        (err) => {
          let msg = "Cet indicateur n'existe pas dans le tableau de bord!";
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

  getAnneesReporting() {
    this.indicateursTb.forEach((indicateur: any) => {
      this.metricService
        .get(`saisies?fileter[where][indicateurId]=${indicateur.id}`)
        .subscribe(
          (saisies: any) => {
            let saisies2022 = saisies.filter((s) => s.anneeId == "2022");
            // console.log("saisies2022");
            // console.log(saisies2022);
            saisies.forEach((element) => {
              if (!this.anneesReporting.includes(element.anneeId)) {
                this.anneesReporting.push(element.anneeId);
              }
            });
          },
          (err) => console.log(err)
        );
    });
  }
  generateReporting() {
    this.reportingNotReady = true;
    
    const tbInfos = {
      jambarsUsers: this.jambarsUsers,
      annee: this.anneeReporting,
      moisActuel: this.moisReporting,
      tbId: this.tb.id,
      userConnecteId: this.userConnecte.id,
      externeDRPS: true,
      serveurUrl: this.metricService.serverURL,
    };
    this.metricService.post(`/construct-tb`, tbInfos).subscribe(
      (res: any) => {
        // console.log("TB DATA fghjklmù");
        // console.log("res");
        // console.log(res);

        if (res.success) {
          // console.log(res);
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

        let msg = "erreur de construction du tableau de bord";
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

  addIndicateurToTB(selectedIndicateurs) {
    // console.log("selectedIndicateurs");
    // console.log(selectedIndicateurs);

    selectedIndicateurs.forEach((selectedIndicateur, index) => {
      this.metricService
        .post(`tb-indicateurs`, {
          tableauDeBordId: this.tb.id,
          indicateurId: selectedIndicateur.id,
        })
        .subscribe(
          (res) => {
            if (index == selectedIndicateurs.length - 1) {
              this.addIndicateurTBRelationForm = this.fb.group({
                selectedIndicateurs: ["", Validators.required],
              });
              this.indicateursTb = [];
              this.getIndicateursTB(this.tb.id, false);
              let msg = "Indicateur ajouté avec succès";
              this.notification.showNotification(
                "top",
                "right",
                "success",
                "METRIC",
                msg
              );
            }
          },
          (err) => {
            console.log(err);
            let msg = `Erreur lors de l'ajout!`;
            this.notification.showNotification(
              "top",
              "right",
              "danger",
              "METRIC",
              msg
            );
          }
        );
    });
  }

  getNumeroMois(mois) {
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
    }
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
