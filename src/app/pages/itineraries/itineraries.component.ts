import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '../../core/services/firebase-auth.service';
import { FirestoreService } from '../../core/services/firestore.service';

interface Trip {
  id: string; destination: string; origin: string; startDate: Date; endDate: Date;
  status: 'planned' | 'ongoing' | 'completed'; userId: string;
}

@Component({
  selector: 'app-itineraries',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './itineraries.component.html',
  styleUrl: './itineraries.component.scss'
})
export class ItinerariesComponent implements OnInit {
  auth = inject(FirebaseAuthService);
  firestore = inject(FirestoreService);
  router = inject(Router);
  user = this.auth.user;
  trips = signal<Trip[]>([]);
  isLoading = false;

  private destinationImages: { [key: string]: string } = {
    'París': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop',
    'Londres': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&auto=format&fit=crop',
    'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&auto=format&fit=crop',
    'Nueva York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&auto=format&fit=crop',
    'Barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&auto=format&fit=crop',
    'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop',
    'default': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&auto=format&fit=crop'
  };

  async ngOnInit() { await this.loadTrips(); }
  goBack() { this.router.navigate(['/dashboard']); }

  async loadTrips() {
    const userId = this.user()?.id;
    if (!userId) return;
    this.isLoading = true;
    try {
      const trips = await this.firestore.getFilteredCollection('trips', [['userId', '==', userId]], 'startDate');
      this.trips.set(trips.map(t => ({
        ...t,
        startDate: t.startDate?.toDate ? t.startDate.toDate() : new Date(t.startDate),
        endDate: t.endDate?.toDate ? t.endDate.toDate() : new Date(t.endDate)
      })));
    } catch (error) {
      console.error('Error cargando viajes:', error);
      this.trips.set([]);
    } finally {
      this.isLoading = false;
    }
  }

  viewTrip(trip: Trip) {
    this.router.navigate(['/flight-details'], { queryParams: { tripId: trip.id } });
  }

  async deleteTrip(tripId: string) {
    if (!confirm('¿Eliminar este itinerario?')) return;
    try {
      await this.firestore.deleteDocument('trips', tripId);
      await this.loadTrips();
    } catch (error) {
      console.error('Error eliminando:', error);
    }
  }

  createNewTrip() { this.router.navigate(['/book-tickets']); }
  getDestinationImage(destination: string): string {
    return this.destinationImages[destination] || this.destinationImages['default'];
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  }

  getStatusText(status: string): string {
    const map: { [key: string]: string } = { 'planned': 'Planificado', 'ongoing': 'En Curso', 'completed': 'Completado' };
    return map[status] || status;
  }

  getDuration(start: Date, end: Date): number {
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }
}