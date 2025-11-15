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

// Interfaz para el usuario (simulada)
interface User {
  id: string;
  name: string;
  email: string;
}

@Component({
  selector: 'app-book-tickets',
  standalone: true,
  // Asegúrate de que los imports se mantengan
  imports: [CommonModule, FormsModule],
  // Nota: Se ha eliminado el 'template' de aquí ya que estás usando un archivo 'book-tickets.component.html'
  templateUrl: './book-tickets.component.html', 
  styles: []
})
export class BookTicketsComponent {
  auth = inject(FirebaseAuthService);
  firestore = inject(FirestoreService);
  router = inject(Router);
  
  user = this.auth.user as () => User | null; // Tipado para user
  searchResults = signal<Flight[]>([]);
  searched = false;
  isSearching = false; // Añadida o asegurada para el estado de búsqueda
  isBooking = signal(false); // 👈 NUEVA: Estado para la reserva
  
  searchForm = {
    from: '',
    to: '',
    date: ''
  };

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  // Se mantiene la simulación de búsqueda de vuelos
  searchFlights() {
    this.isSearching = true; // Empieza a buscar
    this.searched = true;
    
    // Simulación de búsqueda de vuelos con un pequeño retraso
    setTimeout(() => {
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
        this.isSearching = false; // Termina la búsqueda
    }, 1500); // Simula un retraso de 1.5 segundos
  }

  // 👈 MODIFICADA: Función para la reserva de vuelo
  async bookFlight(flight: Flight) {
    const userId = this.user()?.id;
    if (!userId) {
      alert('Debes estar autenticado para reservar vuelos.');
      return;
    }

    if (this.isBooking()) { // Evita doble click
      return;
    }

    // --- ARREGLO INICIADO: Validar que no se pueda reservar en el pasado ---
    let bookingDate: Date;
    let isPastDate = false;

    if (this.searchForm.date) {
        // Crea un objeto Date desde el string 'YYYY-MM-DD' a medianoche UTC para la comparación
        bookingDate = new Date(this.searchForm.date + 'T00:00:00.000Z');
        
        // Obtiene la fecha de hoy a medianoche UTC
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        // Comprueba si la fecha del formulario es estrictamente anterior a hoy (pasada)
        if (bookingDate < today) {
            isPastDate = true;
        }
    } else {
        // Si no hay fecha en el formulario, usa la fecha actual (que no es pasada)
        bookingDate = new Date();
    }

    if (isPastDate) {
        alert('❌ Error al reservar el vuelo. No se puede reservar un vuelo con una fecha pasada.');
        return; // Detiene la ejecución antes de intentar la reserva en Firestore
    }
    // --- ARREGLO FINALIZADO: Validar que no se pueda reservar en el pasado ---

    this.isBooking.set(true); // Empieza la reserva

    const bookingId = `${userId}_${flight.id}_${Date.now()}`;
    
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
        date: bookingDate, // Usar la fecha procesada
        price: flight.price,
        status: 'confirmed',
        createdAt: new Date(),
        userName: this.user()?.name // Añadir nombre del usuario para mejor contexto
      });
      
      this.isBooking.set(false); // Finaliza la reserva (éxito)
      // 👈 ÉXITO: Alerta y redirección
      alert(`🎉 ¡Vuelo ${flight.flightNumber} reservado exitosamente! Revisa tus reservas.`);
      this.router.navigate(['/manage-bookings']);
    } catch (error) {
      this.isBooking.set(false); // Finaliza la reserva (error)
      console.error('Error reservando vuelo:', error);
      // 👈 ERROR: Alerta de error
      alert('❌ Error al reservar el vuelo. Por favor, intenta de nuevo.');
      // Opcionalmente, aquí puedes mostrar un modal/snackbar en lugar del alert nativo
    }
  }
}