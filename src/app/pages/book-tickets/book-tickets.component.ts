import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '../../core/services/firebase-auth.service';
import { FirestoreService } from '../../core/services/firestore.service';

interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  price: number;
  duration: string;
  stops: number;
  available: boolean;
}

@Component({
  selector: 'app-book-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200 px-8 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-4">
            <button (click)="goBack()" class="text-indigo-600 hover:text-indigo-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </button>
            <h1 class="text-3xl font-bold text-gray-800">Reservar Boletos</h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <img
              class="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-500"
              [src]="'https://ui-avatars.com/api/?name=' + (user()?.name || 'Usuario') + '&background=6366f1&color=fff'"
              [alt]="user()?.name || 'Usuario'"
            />
          </div>
        </div>
      </div>

      <!-- Contenido Principal -->
      <div class="max-w-7xl mx-auto p-8">
        <!-- Formulario de Búsqueda -->
        <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Buscar Vuelos</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Origen</label>
              <input
                [(ngModel)]="searchForm.from"
                type="text"
                placeholder="Ciudad de origen"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Destino</label>
              <input
                [(ngModel)]="searchForm.to"
                type="text"
                placeholder="Ciudad de destino"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
              <input
                [(ngModel)]="searchForm.date"
                type="date"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div class="flex items-end">
              <button
                (click)="searchFlights()"
                class="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Buscar Vuelos
              </button>
            </div>
          </div>
        </div>

        <!-- Resultados de Búsqueda -->
        <div *ngIf="searchResults().length > 0" class="space-y-4">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Vuelos Disponibles</h2>
          
          <div *ngFor="let flight of searchResults()" 
               class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div class="flex justify-between items-center">
              <div class="flex items-center space-x-6">
                <div class="text-center">
                  <p class="text-2xl font-bold text-gray-800">{{flight.departure}}</p>
                  <p class="text-sm text-gray-500">{{flight.from}}</p>
                </div>
                
                <div class="flex flex-col items-center">
                  <p class="text-sm text-gray-500 mb-2">{{flight.duration}}</p>
                  <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 bg-indigo-600 rounded-full"></div>
                    <div class="w-32 h-0.5 bg-gray-300"></div>
                    <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                    </svg>
                  </div>
                  <p class="text-xs text-gray-500 mt-2">
                    {{flight.stops === 0 ? 'Directo' : flight.stops + ' escala(s)'}}
                  </p>
                </div>
                
                <div class="text-center">
                  <p class="text-2xl font-bold text-gray-800">{{flight.arrival}}</p>
                  <p class="text-sm text-gray-500">{{flight.to}}</p>
                </div>
              </div>
              
              <div class="text-right">
                <p class="text-sm text-gray-500">{{flight.airline}} - {{flight.flightNumber}}</p>
                <p class="text-3xl font-bold text-indigo-600 mt-2">€{{flight.price}}</p>
                <button
                  (click)="bookFlight(flight)"
                  class="mt-4 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Reservar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sin Resultados -->
        <div *ngIf="searched && searchResults().length === 0" 
             class="bg-white rounded-2xl shadow-xl p-12 text-center">
          <svg class="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 class="text-xl font-bold text-gray-700 mb-2">No se encontraron vuelos</h3>
          <p class="text-gray-500">Intenta con otras fechas o destinos</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class BookTicketsComponent {
  auth = inject(FirebaseAuthService);
  firestore = inject(FirestoreService);
  router = inject(Router);
  
  user = this.auth.user;
  searchResults = signal<Flight[]>([]);
  searched = false;
  
  searchForm = {
    from: '',
    to: '',
    date: ''
  };

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  searchFlights() {
    this.searched = true;
    
    // Simulación de búsqueda de vuelos
    const mockFlights: Flight[] = [
      {
        id: '1',
        airline: 'Iberia',
        flightNumber: 'IB3456',
        from: this.searchForm.from || 'Madrid',
        to: this.searchForm.to || 'Barcelona',
        departure: '10:30',
        arrival: '12:00',
        price: 120,
        duration: '1h 30m',
        stops: 0,
        available: true
      },
      {
        id: '2',
        airline: 'Vueling',
        flightNumber: 'VY8912',
        from: this.searchForm.from || 'Madrid',
        to: this.searchForm.to || 'Barcelona',
        departure: '14:15',
        arrival: '15:50',
        price: 95,
        duration: '1h 35m',
        stops: 0,
        available: true
      },
      {
        id: '3',
        airline: 'Air Europa',
        flightNumber: 'UX2345',
        from: this.searchForm.from || 'Madrid',
        to: this.searchForm.to || 'Barcelona',
        departure: '18:00',
        arrival: '19:30',
        price: 110,
        duration: '1h 30m',
        stops: 0,
        available: true
      }
    ];
    
    this.searchResults.set(mockFlights);
  }

  async bookFlight(flight: Flight) {
    const userId = this.user()?.id;
    if (!userId) {
      alert('Debes estar autenticado para reservar vuelos');
      return;
    }

    const bookingId = `booking_${Date.now()}`;
    const bookingDate = new Date(this.searchForm.date || new Date());

    try {
      await this.firestore.setDocument('bookings', bookingId, {
        userId,
        flightId: flight.id,
        airline: flight.airline,
        flightNumber: flight.flightNumber,
        from: flight.from,
        to: flight.to,
        departure: flight.departure,
        arrival: flight.arrival,
        date: bookingDate,
        price: flight.price,
        status: 'confirmed',
        createdAt: new Date()
      });
      
      alert(`¡Vuelo ${flight.flightNumber} reservado exitosamente!`);
      this.router.navigate(['/manage-bookings']);
    } catch (error) {
      console.error('Error reservando vuelo:', error);
      alert('Error al reservar el vuelo. Por favor, intenta de nuevo.');
    }
  }
}