import { Component, inject } from '@angular/core';
import { StrapiAuthService } from '../../core/services/strapi-auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  public auth:StrapiAuthService = inject(StrapiAuthService);
}
