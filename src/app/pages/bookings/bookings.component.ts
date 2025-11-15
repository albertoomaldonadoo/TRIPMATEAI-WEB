import { Component as Component5, inject as inject5 } from '@angular/core';
import { CommonModule as CommonModule5 } from '@angular/common';
import { Router as Router5 } from '@angular/router';
import { FirebaseAuthService as FirebaseAuthService5 } from '../../core/services/firebase-auth.service';

@Component5({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule5],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.scss'
})
export class BookingsComponent {
  auth = inject5(FirebaseAuthService5);
  router = inject5(Router5);
  user = this.auth.user;

  stats = {
    active: 3,
    completed: 12,
    cancelled: 2
  };

  mockBookings = [
    { route: 'MAD → BCN', date: '15 Dic 2024', flight: 'IB3456', status: 'confirmed', price: 120 },
    { route: 'BCN → PAR', date: '20 Dic 2024', flight: 'VY8912', status: 'confirmed', price: 180 },
    { route: 'PAR → LON', date: '10 Ene 2025', flight: 'AF1234', status: 'confirmed', price: 150 },
    { route: 'MAD → NYC', date: '05 Nov 2024', flight: 'IB6789', status: 'completed', price: 650 },
    { route: 'BCN → ROM', date: '15 Oct 2024', flight: 'VY4567', status: 'cancelled', price: 200 }
  ];

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}