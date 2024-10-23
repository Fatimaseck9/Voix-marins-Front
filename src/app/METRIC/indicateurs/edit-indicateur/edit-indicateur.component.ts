import { Component, OnInit } from '@angular/core';
import { NotificationService } from "src/app/shared/services/notifications";
import { metricService } from "src/app/shared/metricService";
import { FormBuilder, Validators } from '@angular/forms';
import { BaseService } from "src/app/shared/base.service";

import { ActivatedRoute, Router } from '@angular/router';
import { Indicateur } from '../../models/indicateurs';


@Component({
  selector: 'app-edit-indicateur',
  templateUrl: './edit-indicateur.component.html',
  styleUrls: ['./edit-indicateur.component.css']
})
export class EditIndicateurComponent implements OnInit {
  structures: any = [];

  title: string = 'Nouvel indicateur';

  indicateurForm = this.fb.group({
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

  
  oldStructures: any = [];
  oldStructuresAnalystes: any = [];

  
  oldProprietaires: any;
  oldSuppleants: any;
  oldAnalystes: any;

  collaborateurDisabled: boolean = true;
  proprietaires: any = [];
  suppleants: any = [];
  analystes: any = [];
  jambarUsers = [];
  tendances: any[];
  unites: any[];
  operations: any[];
  periodicites: any[];
  origines: any[];
  typeIndicateurs: any[];
  objectifs: any[];
  sousObjectifs: any[];

  structuredropdownSettings: any;
  suppleantdropdownSettings: any;
  porteurdropdownSettings: any;
  sousObjectisdropdownSettings: any;
  proprietairedropdownSettings: any

  analystesChoiceDisabled: boolean = true;

  isUpdate = false

  constructor(private notification: NotificationService, private router: Router,  private jambarsService: BaseService, private metricService: metricService,  private fb: FormBuilder,  private activatedRoute: ActivatedRoute,) { }

  ngOnInit() {
  

    this.jambarsService.get("Accounts", true).subscribe(
      (res: any) => {
       
        res = res.forEach((element: any) => {
          element.nomComplet =
            element.prenom + " " + element.nom + " (" + element.email + ")";
          this.jambarUsers.push(element);
        });
        this.proprietaires = this.jambarUsers;
        this.suppleants = this.jambarUsers;
        this.analystes = this.jambarUsers;

      

        this.getParametres();

        this.getStructures();
        const idIndicateur: string = this.activatedRoute.snapshot.params['id'];
 

        if (idIndicateur) {
          this.isUpdate = true;
          this.title = 'Modifier un indicateur';
          const endpoint = `indicateurs/${idIndicateur}?filter[include][]=parametres&filter[include][]=proprietaires&filter[include][]=suppleants&filter[include][]=users&filter[include][]=saisies`;
          this.metricService.get(endpoint).subscribe(
            (indicateur: any) => {
              console.log("indicateur")
              console.log(indicateur)
            
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
    
                  this.updateIndicateurForm(indicateur)
       
            },
            (err) => {
             
              let msg = "Erreur lors de l'indicateur ";
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
          // this.siteService.getOne(idSite).subscribe({
          //   next: (apiResponse: any) => {
          //     const site = apiResponse.data;
          //     this.updateSiteForm(site);
          //   },
          //   error: (err) => {
          //     console.log(err);
          //   },
          // });
        }
      },
      (err) => {
        console.log(err);
        let msg = "Vérifier votre connexion internet";
        this.notification.showNotification("top", "right", "danger", "", msg);
      }
    );
    this.setDropDrownstings()
  }

  async addIndicateur(newIindicateur: any, enMasse = false) {
   
    newIindicateur.enMasse = enMasse;
    let parametres: any;
    if (enMasse == true) {
      parametres = newIindicateur.parametres;
    } else {
      if (this.validerChamps(newIindicateur) == false) {
       
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
          this.router.navigate(['metric/indicateurs'])
          this.getStructures(false);
        },
        (err) => {
          console.log(err);
       

          let msg = `Erreur, assurez-vous que le KPI n'est pas dupliqué et que toutes ses composantes sont renseignées`;
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

    this.indicateurForm = this.fb.group({
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

  getStructures(init = true) {
    this.metricService
      .get("structures-sigle-complet?filter[include][]=collaborateurs")
      .subscribe(
        (structures: any[]) => {
          this.structures = structures;
          
        },

        (error: any) => {
          console.log(error);
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
      this.indicateurForm.value.selectedProprietaires 
      // this.indicateurUpdateForm.value.selectedProprietaires;

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
      this.indicateurForm.value.selectedSuppleants 
      // this.indicateurUpdateForm.value.selectedSuppleants;

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
      this.indicateurForm.value.selectedSuppleants 
      // this.indicateurUpdateForm.value.selectedSuppleants;

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
      this.indicateurForm.value.selectedProprietaires 
      // this.indicateurUpdateForm.value.selectedProprietaires;
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

  setDropDrownstings(){
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
    this.sousObjectisdropdownSettings = {
      singleSelection: true,
      idField: "id",
      textField: "name",
      allowSearchFilter: true,
    };
  }

}
