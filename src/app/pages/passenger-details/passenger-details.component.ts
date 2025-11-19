import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '../../core/services/firebase-auth.service';
import { FirestoreService } from '../../core/services/firestore.service';

interface PassengerInfo {
  name: string;
  surname: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-passenger-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './passenger-details.component.html',
  styleUrl: './passenger-details.component.scss'
})
export class PassengerDetailsComponent implements OnInit {
  auth = inject(FirebaseAuthService);
  firestore = inject(FirestoreService);
  router = inject(Router);
  user = this.auth.user;
  
  passengerInfo: PassengerInfo = {
    name: '',
    surname: '',
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
    passportExpiry: '',
    email: '',
    phone: ''
  };

  isSaving = false;

  async ngOnInit() {
    await this.loadPassengerInfo();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  async loadPassengerInfo() {
    const userId = this.user()?.id;
    if (!userId) return;

    try {
      const profile = await this.firestore.getUserProfile(userId);
      if (profile) {
        this.passengerInfo = { ...this.passengerInfo, ...profile };
      }
    } catch (error) {
      console.error('Error cargando información:', error);
    }
  }

  async savePassengerInfo() {
    const userId = this.user()?.id;
    if (!userId) {
      alert('Debes estar autenticado');
      return;
    }

    this.isSaving = true;
    try {
      await this.firestore.updateDocument('users', userId, this.passengerInfo);
      alert('Información guardada exitosamente');
    } catch (error) {
      console.error('Error guardando información:', error);
      alert('Error al guardar la información');
    } finally {
      this.isSaving = false;
    }
  }
}