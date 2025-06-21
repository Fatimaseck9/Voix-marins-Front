import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";

@Injectable()
export class metricService {
  //prod
  // serverURL = "https://apis.jambars.orange-sonatel.com/metric/";

  // local
  //serverURL = "http://127.0.0.1:3009/";
  serverURL = environment.serverURLMETRIC;

  constructor(private httpClient: HttpClient, private router: Router) {}

  download(file) {
    window.open(`${this.serverURL}` + "filesReporting/" + file, "_blank");
  }

  downloadById(fileId) {
    window.open(`${this.serverURL}` + "files/" + fileId, "_blank");
  }

  post(url, data): any {
    url = this.serverURL + url;
    return this.httpClient.post<any>(encodeURI(url), data);
  }

  get(url): any {
    url = this.serverURL + url;
    return this.httpClient.get<any>(encodeURI(url));
  }

  put(url, id, data): any {
    url = this.serverURL + url + "/" + id;
    return this.httpClient.put<any>(encodeURI(url), data);
  }

  patch(url, id, data): any {
    url = this.serverURL + url + "/" + id;
    return this.httpClient.patch<any>(encodeURI(url), data);
  }

  postFile(type, file) {
    return this.post("files/" + type, file);
  }

  delete(url, id): any {
    url = this.serverURL + url + "/" + id;
    return this.httpClient.delete<any>(encodeURI(url));
  }

  deleteFile(fileId): any {
    const url = `${this.serverURL}files/${fileId}/delete`;
    return this.httpClient.post<any>(encodeURI(url), {});
  }

  reloadRoute() {
    let currentUrl = `${this.router.url}`;
    this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  loadStyle(href: string, renderer): void {
    const link = renderer.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    renderer.appendChild(document.head, link);
  }
}
