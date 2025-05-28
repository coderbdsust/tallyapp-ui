import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MenuService } from '../layout/services/menu.service';
import { MatDialogModule } from '@angular/material/dialog';

@Component({ 
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss'],
    imports: [AngularSvgIconModule, RouterOutlet]
})
export class AuthComponent implements OnInit {
  constructor(public menuService: MenuService) {}

  ngOnInit(): void {}
}
