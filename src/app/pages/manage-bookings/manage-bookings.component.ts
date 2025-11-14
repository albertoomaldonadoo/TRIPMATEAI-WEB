import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '../../core/services/firebase-auth.service';
import { FirestoreService } from '../../core/services/firestore.service';

interface Booking {
  id: string; flightNumber: string; airline: string; from: string; to: string;
  date: Date; departure: string; arrival: string; price: number;
  status: 'confirmed' | 'cancelled' | 'completed';
}

@Component({
  selector: 'app-manage-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage-bookings.component.html',
  styleUrl: './manage-bookings.component.scss'
})
export class ManageBookingsComponent implements OnInit {
  auth = inject(FirebaseAuthService);
  firestore = inject(FirestoreService);
  router = inject(Router);
  user = this.auth.user;
  bookings = signal<Booking[]>([]);
  isLoading = false;

  async ngOnInit() { await this.loadBookings(); }
  goBack() { this.router.navigate(['/dashboard']); }

  async loadBookings() {
    const userId = this.user()?.id;
    if (!userId) return;
    this.isLoading = true;
    try {
      const bookings = await this.firestore.getFilteredCollection('bookings', [['userId', '==', userId]], 'date');
      this.bookings.set(bookings.map(b => ({ ...b, date: b.date?.toDate ? b.date.toDate() : new Date(b.date) })));
    } catch (error) {
      console.error('Error cargando reservas:', error);
      this.bookings.set([]);
    } finally {
      this.isLoading = false;
    }
  }

  viewDetails(booking: Booking) {
    this.router.navigate(['/flight-details'], { queryParams: { bookingId: booking.id } });
  }

  async cancelBooking(bookingId: string) {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) return;
    try {
      await this.firestore.updateDocument('bookings', bookingId, { status: 'cancelled' });
      await this.loadBookings();
      alert('Reserva cancelada exitosamente');
    } catch (error) {
      console.error('Error cancelando reserva:', error);
      alert('Error al cancelar la reserva');
    }
  }

  checkIn(booking: Booking) {
    this.router.navigate(['/checkin'], { queryParams: { bookingId: booking.id } });
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(date);
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = { 'confirmed': 'Confirmado', 'cancelled': 'Cancelado', 'completed': 'Completado' };
    return statusMap[status] || status;
  }
}