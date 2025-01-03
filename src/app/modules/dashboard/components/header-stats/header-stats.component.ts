import { Component, OnInit } from "@angular/core";
import { CardStatsComponent } from "../cards/card-stats/card-stats.component";

@Component({
  selector: "app-header-stats",
  templateUrl: "./header-stats.component.html",
  imports:[CardStatsComponent],
  standalone:true
})
export class HeaderStatsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
