import { Component as Component3, inject as inject3 } from '@angular/core';
import { CommonModule as CommonModule3 } from '@angular/common';
import { Router as Router3 } from '@angular/router';
import { FirebaseAuthService as FirebaseAuthService3 } from '../../core/services/firebase-auth.service';

@Component3({
  selector: 'app-flight-details',
  standalone: true,
  imports: [CommonModule3],
  templateUrl: './flight-details.component.html',
  styleUrl: './flight-details.component.scss'
})
export class FlightDetailsComponent {
  auth = inject3(FirebaseAuthService3);
  router = inject3(Router3);
  user = this.auth.user;

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}