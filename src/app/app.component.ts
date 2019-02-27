import { Component } from "@angular/core";

import { jsonData } from "./d3-line-chart/state-populations";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  title = "d3-charts";
  data: any;

  constructor() {
    this.data = jsonData;
  }
}
