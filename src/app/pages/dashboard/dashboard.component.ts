import { Component, inject, OnInit } from '@angular/core';
import { StrapiAuthService } from '../../core/services/strapi-auth.service';
import { CommonModule } from '@angular/common';
import { FirebaseAuthService } from '../../core/services/firebase-auth.service';
import { FirestoreService } from '../../core/services/firestore.service';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

interface Trip {
  id: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  status: 'planned' | 'ongoing' | 'completed';
  userId: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
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

  async ngOnInit() {
    await this.loadTrips();
    
    // Crear perfil de usuario en Firestore si no existe
    const userId = this.user()?.id;
    if (userId) {
      const userProfile = await this.firestore.getUserProfile(userId);
      if (!userProfile) {
        await this.firestore.createUserProfile(userId, {
          name: this.user()?.name,
          surname: this.user()?.surname,
          email: this.user()?.email
        });
      }
    }
  }

  async loadTrips() {
    const userId = this.user()?.id;
    if (!userId) return;

    this.isLoading = true;
    try {
      const trips = await this.firestore.getFilteredCollection(
        'trips',
        [['userId', '==', userId]],
        'startDate'
      );
      
      this.trips = trips.map(trip => ({
        ...trip,
        startDate: trip.startDate.toDate(),
        endDate: trip.endDate.toDate()
      }));
    } catch (error) {
      console.error('Error cargando viajes:', error);
      alert('Error al cargar los viajes');
    } finally {
      this.isLoading = false;
    }
  }

  async createSampleTrip() {
    const userId = this.user()?.id;
    if (!userId) return;

    const destinations = ['París', 'Londres', 'Tokyo', 'Nueva York', 'Barcelona'];
    const randomDestination = destinations[Math.floor(Math.random() * destinations.length)];
    
    const tripId = `trip_${Date.now()}`;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 30);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    try {
      await this.firestore.setDocument('trips', tripId, {
        userId,
        destination: randomDestination,
        startDate,
        endDate,
        status: 'planned'
      });
      
      await this.loadTrips();
      alert(`Viaje a ${randomDestination} creado!`);
    } catch (error) {
      console.error('Error creando viaje:', error);
      alert('Error al crear el viaje');
    }
  }

  async deleteTrip(tripId: string) {
    if (!confirm('¿Estás seguro de eliminar este viaje?')) return;

    try {
      await this.firestore.deleteDocument('trips', tripId);
      await this.loadTrips();
    } catch (error) {
      console.error('Error eliminando viaje:', error);
      alert('Error al eliminar el viaje');
    }
  }

  async logout() {
    await this.auth.logout();
  }
}
