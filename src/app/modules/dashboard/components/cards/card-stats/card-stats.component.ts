import { NgClass } from "@angular/common";
import { Component, OnInit, Input } from "@angular/core";
import { formatCurrency } from "src/app/common/utils/common";

@Component({
    selector: "app-card-stats",
    templateUrl: "./card-stats.component.html",
    imports: [NgClass]
})
export class CardStatsComponent implements OnInit {

  formatCurrency = formatCurrency;

  @Input()
  public borderColor: string = "border-blue-500";

  @Input()
  get statSubtitle(): string {
    return this._statSubtitle;
  }
  set statSubtitle(statSubtitle: string) {
    this._statSubtitle = statSubtitle === undefined ? "Traffic" : statSubtitle;
  }
  private _statSubtitle = "Traffic";

  @Input()
  get statTitle(): number {
    return this._statTitle;
  }
  set statTitle(statTitle: number|undefined) {
    this._statTitle = statTitle === undefined ? 0 : statTitle;
  }
  private _statTitle = 0;

  // The value must match one of up or down
  @Input()
  get statArrow(): string {
    return this._statArrow;
  }
  set statArrow(statArrow: string) {
    this._statArrow =
      statArrow !== "down" && statArrow !== "up" ? "up" : statArrow;
  }
  private _statArrow = "up";

  @Input()
  get statPercent(): string {
    return this._statPercent;
  }
  set statPercent(statPercent: string) {
    this._statPercent = statPercent === undefined ? "3.48" : statPercent;
  }
  private _statPercent = "3.48";

  // can be any of the text color utilities
  // from tailwindcss
  @Input()
  get statPercentColor(): string {
    return this._statPercentColor;
  }
  set statPercentColor(statPercentColor: string) {
    this._statPercentColor =
      statPercentColor === undefined ? "text-emerald-500" : statPercentColor;
  }
  private _statPercentColor = "text-emerald-500";

  @Input()
  get statDescripiron(): string {
    return this._statDescripiron;
  }
  set statDescripiron(statDescripiron: string) {
    this._statDescripiron =
      statDescripiron === undefined ? "Since last month" : statDescripiron;
  }
  private _statDescripiron = "Since last month";

  @Input()
  get statIconName(): string {
    return this._statIconName;
  }
  set statIconName(statIconName: string) {
    this._statIconName =
      statIconName === undefined ? "far fa-chart-bar" : statIconName;
  }
  private _statIconName = "far fa-chart-bar";

  // can be any of the background color utilities
  // from tailwindcss
  @Input()
  get statIconColor(): string {
    return this._statIconColor;
  }
  set statIconColor(statIconColor: string) {
    this._statIconColor =
      statIconColor === undefined ? "bg-red-500" : statIconColor;
  }
  private _statIconColor = "bg-red-500";

  constructor() {}

  ngOnInit(): void {}

  
}
