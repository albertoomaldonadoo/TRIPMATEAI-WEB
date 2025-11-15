import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FirebaseAuthService } from '../../core/services/firebase-auth.service';
import { FirestoreService } from '../../core/services/firestore.service';

interface Trip {
  id: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  status: 'planned' | 'ongoing' | 'completed';
  userId: string;
  origin?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  auth = inject(FirebaseAuthService);
  firestore = inject(FirestoreService);
  router = inject(Router);
  
  user = this.auth.user;
  trips: Trip[] = [];
  isLoading = false;
  
  // Imágenes de destinos
  private destinationImages: { [key: string]: string } = {
    'Abu Dhabi': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop',
    'Athens': 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=600&auto=format&fit=crop',
    'París': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop',
    'Londres': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&auto=format&fit=crop',
    'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&auto=format&fit=crop',
    'Nueva York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&auto=format&fit=crop',
    'Barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&auto=format&fit=crop',
    'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop',
    'Mumbai': 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=600&auto=format&fit=crop',
    'Chennai': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&auto=format&fit=crop',
    'default': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&auto=format&fit=crop'
  };

  async ngOnInit() {
    try {
      await this.ensureUserProfile();
      await this.loadTrips();
    } catch (error) {
      console.error('Error en inicialización:', error);
    }
  }

  private async ensureUserProfile() {
    const userId = this.user()?.id;
    if (!userId) return;

    try {
      const userProfile = await this.firestore.getUserProfile(userId);
      if (!userProfile) {
        await this.firestore.createUserProfile(userId, {
          name: this.user()?.name,
          surname: this.user()?.surname,
          email: this.user()?.email
        });
      }
    } catch (error) {
      console.error('Error creando perfil de usuario:', error);
    }
  }

  // Navegación del sidebar
  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  // Navegación del header
  navigateToHeader(route: string) {
    this.router.navigate([route]);
  }

  async loadTrips() {
    const userId = this.user()?.id;
    if (!userId) {
      this.trips = [];
      return;
    }

    this.isLoading = true;
    try {
      const trips = await this.firestore.getFilteredCollection(
        'trips',
        [['userId', '==', userId]],
        'startDate'
      );
      
      this.trips = trips.map(trip => ({
        ...trip,
        startDate: trip.startDate?.toDate ? trip.startDate.toDate() : new Date(trip.startDate),
        endDate: trip.endDate?.toDate ? trip.endDate.toDate() : new Date(trip.endDate)
      }));
    } catch (error) {
      console.error('Error cargando viajes:', error);
      this.trips = [];
    } finally {
      this.isLoading = false;
    }
  }

  async createSampleTrip() {
    const userId = this.user()?.id;
    if (!userId) {
      alert('Debes estar autenticado para crear viajes');
      return;
    }

    const destinations = [
      { name: 'París', origin: 'Madrid' },
      { name: 'Londres', origin: 'Barcelona' },
      { name: 'Tokyo', origin: 'Madrid' },
      { name: 'Nueva York', origin: 'Barcelona' },
      { name: 'Barcelona', origin: 'Madrid' },
      { name: 'Dubai', origin: 'Mumbai' },
      { name: 'Abu Dhabi', origin: 'Chennai' },
      { name: 'Athens', origin: 'Mumbai' }
    ];
    
    const randomDest = destinations[Math.floor(Math.random() * destinations.length)];
    
    const tripId = `trip_${Date.now()}`;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 90) + 7);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 14) + 3);

    const statuses: ('planned' | 'ongoing' | 'completed')[] = ['planned', 'ongoing', 'completed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    try {
      await this.firestore.setDocument('trips', tripId, {
        userId,
        destination: randomDest.name,
        origin: randomDest.origin,
        startDate,
        endDate,
        status: randomStatus
      });
      
      await this.loadTrips();
      alert(`¡Viaje a ${randomDest.name} creado exitosamente!`);
    } catch (error) {
      console.error('Error creando viaje:', error);
      alert('Error al crear el viaje. Por favor, intenta de nuevo.');
    }
  }

  viewTrip(trip: Trip) {
    this.router.navigate(['/flight-details'], { 
      queryParams: { 
        tripId: trip.id,
        destination: trip.destination,
        origin: trip.origin
      } 
    });
  }

  async deleteTrip(tripId: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar este viaje?')) {
      return;
    }

    try {
      await this.firestore.deleteDocument('trips', tripId);
      await this.loadTrips();
      alert('Viaje eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando viaje:', error);
      alert('Error al eliminar el viaje. Por favor, intenta de nuevo.');
    }
  }

  getDestinationImage(destination: string): string {
    return this.destinationImages[destination] || this.destinationImages['default'];
  }

  formatDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  async logout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      try {
        await this.auth.logout();
        this.router.navigate(['/login']);
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Error al cerrar sesión. Por favor, intenta de nuevo.');
      }
    }
  }
}