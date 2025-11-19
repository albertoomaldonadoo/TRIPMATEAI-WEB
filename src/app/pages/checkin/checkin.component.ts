import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FirebaseAuthService } from '../../core/services/firebase-auth.service';
import { FirestoreService } from '../../core/services/firestore.service';

@Component({
  selector: 'app-checkin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkin.component.html',
  styleUrl: './checkin.component.scss'
})
export class CheckinComponent implements OnInit {
  auth = inject(FirebaseAuthService);
  firestore = inject(FirestoreService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  user = this.auth.user;
  bookingFound = signal(false);
  selectedSeat = signal<string>('');
  checkinComplete = signal(false);
  searchCode = '';
  lastName = '';
  seatRows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  occupiedSeats = ['1A', '1B', '2C', '3D', '4E', '5F', '7A', '8B', '10C'];

  ngOnInit() {
    const bookingId = this.route.snapshot.queryParams['bookingId'];
    if (bookingId) this.bookingFound.set(true);
  }

  goBack() { this.router.navigate(['/dashboard']); }
  
  searchBooking() {
    if (!this.searchCode || !this.lastName) { alert('Por favor, completa todos los campos'); return; }
    this.bookingFound.set(true);
  }

  selectSeat(seat: string) { if (!this.isOccupied(seat)) this.selectedSeat.set(seat); }
  isOccupied(seat: string): boolean { return this.occupiedSeats.includes(seat); }
  
  confirmCheckin() {
    if (!this.selectedSeat()) { alert('Por favor, selecciona un asiento'); return; }
    this.checkinComplete.set(true);
    alert('¡Check-in completado exitosamente!');
  }

  downloadBoardingPass() { alert('Descargando tarjeta de embarque en PDF...'); }
  sendToEmail() { alert(`Tarjeta de embarque enviada a ${this.user()?.email}`); }
}