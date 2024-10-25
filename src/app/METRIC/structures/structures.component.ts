import { Component, OnInit, ViewChild } from "@angular/core";

import { Router } from "@angular/router";

import { NotificationService } from "src/app/shared/services/notifications";
import { BaseService } from "src/app/shared/base.service";
import { metricService } from "src/app/shared/metricService";

import { FormBuilder, Validators } from "@angular/forms";

import * as XLSX from "xlsx";

@Component({
  selector: "app-structures",
  templateUrl: "./structures.component.html",
  styleUrls: ["./structures.component.css"],
})
export class StructuresComponent implements OnInit {
  structure = {
    name: "",
    sigle: "",
    fullName: "",
    type: "",
    parentId: "",
  };
  type = "OrgChart";

  // columnNames = ["Name", "Manager", "Tooltip"];
  options = {
    allowHtml: true,
    orientation: "horizontal",
  };
  width = 400;
  height = 400;

  structures: any[] = [];
  structureUsers: any[] = [];

  addAnimateurForm: any;
  desactiverAnimateurs = true;
  animateursdropdownSettings: any;
  structuresdropdownSettings: any;

  departementNodes: any[] = [];
  poleNodes: any[] = [];
  directionNodes: any[] = [];
  sonatelEntrepriseNodes: any = [];

  sonatelNodes: any[] = [];

  externesNodes: any[] = [];
  entreprisesExternes: any = [];

  selectedFile: File | null;
  eventFile: any = null;
  jambarUsers = [];

  // chart = {
  //   title: "Organigramme",
  //   type: "OrgChart",
  //   data: [],
  //   options: {
  //     allowHtml: true, // Autoriser HTML pour personnaliser le style
  //     nodeClass: "org-node", // Appliquer une classe CSS à chaque nœud
  //     size: "large", // Option de taille pour une meilleure visibilité
  //     orientation: "vertical",
  //   },
  // };

  sonatelTableData: any[] = [];
  externesTableData: any[] = [];

  @ViewChild("chart", { static: false }) chart: any;

  chartWrappers: { [key: string]: any } = {};

  // options = {
  //   allowHtml: true, // Permet d'ajouter du HTML pour les styles
  //   nodeClass: "org-node", // Classe CSS pour les nœuds
  //   orientation: "vertical", // 'vertical' ou 'horizontal'
  // };

  constructor(
    private notification: NotificationService,
    private router: Router,
    private jambarsService: BaseService,
    private metricService: metricService,
    private fb: FormBuilder
  ) {
    this.addAnimateurForm = this.fb.group({
      structures: ["", Validators.required],
      animateurs: [],
    });
  }

  onSNTChartReady(event) {
    const chartWrapper = this.chart.wrapper;
    const chart = chartWrapper.getChart();

    google.visualization.events.addListener(chart, "select", () => {
      const selection = chart.getSelection();
      if (selection.length > 0) {
        const selectedItem = selection[0];
        const selectedRow = selectedItem.row;

        if (selectedRow != null) {
          const selectedNode = this.sonatelTableData[selectedRow];
         
          this.router.navigate(["metric/structures", selectedNode[0].id]);
        }
      }
    });
  }

  onExterneChartReady(event: any, index: number) {
    const chartId = "chart_div" + index;
    const chartElement = document.getElementById(chartId);

    if (chartElement) {
      // Récupérer chartWrapper de l'événement "ready" et le stocker
      this.chartWrappers[chartId] = event.chartWrapper;

      const chart = this.chartWrappers[chartId].getChart();

      if (chart) {
        google.visualization.events.addListener(chart, "select", () => {
          const selection = chart.getSelection();
          if (selection.length > 0) {
            const selectedItem = selection[0];
            const selectedRow = selectedItem.row;

            if (selectedRow != null) {
              const selectedNode =
                this.externesTableData[index][selectedRow + 1]; // +1 pour ignorer les en-têtes
              console.log(
                "Nœud sélectionné dans " + chartId + ":",
                selectedNode
              );
              // Ajoutez la logique supplémentaire en fonction du nœud sélectionné
            }
          }
        });
      } else {
        console.error(`Le graphique n'a pas pu être récupéré pour ${chartId}`);
      }
    } else {
      console.error(`L'élément avec l'ID ${chartId} n'a pas pu être trouvé`);
    }
  }

  ngOnInit() {
    this.animateursdropdownSettings = {
      singleSelection: false,
      idField: "id",
      textField: "nomComplet",
      selectAllText: "Selectionner tout",
      unSelectAllText: "Deselectionner tout",

      noDataAvailablePlaceholderText:
        "Aucun animateur à définir poure cette structure",
      allowSearchFilter: true,
    };

    this.structuresdropdownSettings = {
      singleSelection: true,
      idField: "id",
      textField: "sigleComplet",

      allowSearchFilter: true,
    };
    this.metricService
      .get("structures?filter[include][]=structuresEnfants")
      .subscribe(
        (structures: any) => {
          structures.forEach((structure: any) => {
            switch (structure.type) {
              case "departement":
                let departementNode = {
                  name: structure.sigle,
                  // title: structure.fullName,
                  cssClass: "ngx-org-ceo",
                  image: "assets/img/ic_Ethernet.svg",
                  childs: [],
                  parentId: structure.parentId,
                  id: structure.id,
                };

                if (structure.structuresEnfants) {
                  structure.structuresEnfants.forEach((child: any) => {
                    let childNode = {
                      name: child.sigle,
                      // title: child.fullName,
                      cssClass: "ngx-org-ceo",
                      image: "assets/img/ic_Social_network.svg",
                      childs: [],
                      id: child.id,
                    };
                    departementNode.childs.push(childNode);
                  });
                }
                this.departementNodes.push(departementNode);

                break;
              case "pole":
                let poleNode = {
                  name: structure.sigle,
                  // title: structure.fullName,
                  cssClass: "ngx-org-ceo",
                  image: "assets/img/ic_My_Livebox.svg",
                  childs: [],
                  id: structure.id,
                  parentId: structure.parentId,
                };
                this.poleNodes.push(poleNode);

                break;
              case "direction":
                let directionNode = {
                  name: structure.sigle,
                  // title: structure.fullName,
                  cssClass: "ngx-org-ceo",
                  image: "assets/img/ic_Office.svg",
                  childs: [],
                  id: structure.id,
                  parentId: structure.parentId,
                };
                this.directionNodes.push(directionNode);

                break;
              case "entreprise":
                let entrepriseNode = {
                  name: structure.sigle,
                  // title: structure.fullName,
                  cssClass: "ngx-org-ceo",
                  image: "assets/img/ic_Office.svg",
                  childs: [],
                  id: structure.id,
                };
                if (structure.sigle == "SNT") {
                  this.sonatelEntrepriseNodes = entrepriseNode;
                } else {
                  this.entreprisesExternes.push(entrepriseNode);
                }

                break;
            }
          });

          this.poleNodes.forEach((poleNode: any) => {
            this.departementNodes.forEach((departement: any) => {
              if (departement.parentId == poleNode.id) {
                poleNode.childs.push(departement);
              }
            });

            this.directionNodes.forEach((direction: any) => {
              if (poleNode.parentId == direction.id) {
                direction.childs.push(poleNode);
              }
            });
          });

          let directionSonatelNodes = [];

          this.directionNodes.forEach((direction: any) => {
            if (direction.parentId == this.sonatelEntrepriseNodes.id) {
              directionSonatelNodes.push(direction);
              this.sonatelEntrepriseNodes.childs.push(direction);
            }
          });

          this.sonatelNodes.push(this.sonatelEntrepriseNodes);

          this.entreprisesExternes.forEach((entrepriseExterne: any) => {
            let entrepriseExterneNode = [];
            this.directionNodes.forEach((direction: any) => {
              if (direction.parentId == entrepriseExterne.id) {
                directionSonatelNodes.push(direction);
                entrepriseExterne.childs.push(direction);
              }
            });
            entrepriseExterneNode.push(entrepriseExterne);
            this.externesNodes.push(entrepriseExterneNode);
          });

          for (const externesNode of this.externesNodes) {
            this.generateTableData(externesNode[0], "", false);
          }

          this.generateTableData(this.sonatelNodes[0], "");
          console.log(this.sonatelTableData);
        },
        (err) => {
          console.log(err);
          let msg = `Erreur lors de la récupération des structures. Mettre à jour la base`;
          this.notification.showNotification(
            "top",
            "right",
            "danger",
            "METRIC",
            msg
          );
        }
      );
    this.metricService.get(`structures-sigle-complet`).subscribe(
      (res: any) => {
        this.structures = res;
      },
      (err: any) => {
        console.log(err);
      }
    );
    this.jambarsService.get("Accounts", true).subscribe(
      (res: any) => {
        res.forEach((element: any) => {
          element.nomComplet = element.prenom + " " + element.nom;
          this.jambarUsers.push(element);
        });

        this.structureUsers = this.jambarUsers;
      },
      (err) => {
        console.log(err);
        let msg = "Vérifier votre connexion internet";
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

  onSelectChart(event, snt) {
    console.log(event);
    console.log(event.selection[0].row);
    console.log(snt);
    const row = event.selection[0].row;
    let selectedNode: any;
    if (snt) {
      selectedNode = this.sonatelEntrepriseNodes[row];
    } else {
      selectedNode = this.externesTableData[row];
    }
    console.log(Array.isArray(this.externesTableData));
    console.log("selectedNode");
    console.log(selectedNode);
    this.router.navigate(["metric/structures", selectedNode.id]);
  }

  goToDetails(event) {
    this.router.navigate(["metric/structures", event.id]);
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];

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

  uploadFile() {
    if (this.selectedFile) {
      let fileReader = new FileReader();
      fileReader.readAsBinaryString(this.selectedFile);
      let data: any;
      fileReader.onload = (e) => {
        let workBook = XLSX.read(fileReader.result, { type: "binary" });
        let sheetsNames = workBook.SheetNames;
        data = XLSX.utils.sheet_to_json(workBook.Sheets[sheetsNames[0]]);

        let dataFromExcel = {
          structuresFromExcel: data,
        };
        let url = "structures/en-masse";

        this.metricService
          .post(url, dataFromExcel)
          .subscribe((response: any) => {
            if (response.success) {
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

              // this.downloadError('erreurs', response.data);
            }
          }),
          (error: any) => {
            console.log(error);
            let msg = "Erreur lors de l'importation des données";
            this.notification.showNotification(
              "top",
              "right",
              "danger",
              "METRIC",
              msg
            );
          };
      };

      this.eventFile.target.value = null;
    }
  }

  onStructureSelect(structure) {
    this.desactiverAnimateurs = true;

    this.metricService
      .get(`structures/${structure.id}/users`)
      .subscribe((res: any) => {
        this.structureUsers = [];
        if (res.success) {
          if (res.collaborateurs.length == 0) {
            const msg = `Cette structure n'a pas de collaborateurs`;
            this.notification.showNotification(
              "top",
              "right",
              "warning",
              "METRIC",
              msg
            );
            this.desactiverAnimateurs = true;
          } else {
            res.collaborateurs.forEach((collaborateur: any) => {
              this.structureUsers.push(
                this.jambarUsers.find((u) => u.id == collaborateur.id)
              );
            });
            this.desactiverAnimateurs = false;
          }
        } else {
          this.desactiverAnimateurs = true;

          this.notification.showNotification(
            "top",
            "right",
            "danger",
            "METRIC",
            res.message
          );
        }
      });
  }

  onStructureDeSelect(structure) {
    this.desactiverAnimateurs = true;
    this.structureUsers = this.jambarUsers;
  }

  addAnimateurs(formValues: any) {
    this.desactiverAnimateurs = true;

    this.metricService.post(`structures-add-animateurs`, formValues).subscribe(
      (res) => {
        this.notification.showNotification(
          "top",
          "right",
          "success",
          "METRIC",
          res.message
        );

        this.addAnimateurForm = this.fb.group({
          structures: ["", Validators.required],
          animateurs: [],
        });
      },
      (err) => {
        console.log(err);
        this.addAnimateurForm = this.fb.group({
          structures: ["", Validators.required],
          animateurs: [],
        });
      }
    );
  }

  generateTableData(node: any, parent: string, snt = true): void {
    const formattedNode = {
      v: node.name,
      f: `${node.name}<div style="color:${this.getColorForLevel(
        node.name
      )}">${this.getType(node.name)}</div>`,
      id: node.id,
      parentId: node.parentId ? node.parentId : "null",
    };
    if (snt) {
      this.sonatelTableData.push([
        formattedNode,
        parent,
        this.getType(node.name),
      ]);
    } else {
      this.externesTableData.push([
        [formattedNode, parent, this.getType(node.name)],
      ]);
    }

    if (node.childs && node.childs.length > 0) {
      node.childs.forEach((child) => this.generateTableData(child, node.name));
    }
  }

  getType(name: string): string {
    return "";
  }

  getColorForLevel(name: string): string {
    switch (name) {
      case "SNT":
        return "red";
      case "DRPS":
      case "BBI":
        return "red";
      case "DEP":
      case "DBF":
      case "PPC":
        return "blue";
      case "DDB":
      case "DRR":
        return "orange";
      default:
        return "black";
    }
  }
}
