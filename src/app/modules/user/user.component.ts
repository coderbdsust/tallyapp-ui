import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    standalone: true,
    imports: [RouterOutlet],
})
export class UserComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
