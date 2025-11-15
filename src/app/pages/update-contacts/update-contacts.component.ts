import { Component as Component2, inject as inject2, OnInit as OnInit2 } from '@angular/core';
import { CommonModule as CommonModule2 } from '@angular/common';
import { FormsModule as FormsModule2 } from '@angular/forms';
import { Router as Router2 } from '@angular/router';
import { FirebaseAuthService as FirebaseAuthService2 } from '../../core/services/firebase-auth.service';
import { FirestoreService as FirestoreService2 } from '../../core/services/firestore.service';

@Component2({
  selector: 'app-update-contacts',
  standalone: true,
  imports: [CommonModule2, FormsModule2],
  templateUrl: './update-contacts.component.html',
  styleUrl: './update-contacts.component.scss'
})
export class UpdateContactsComponent implements OnInit2 {
  auth = inject2(FirebaseAuthService2);
  firestore = inject2(FirestoreService2);
  router = inject2(Router2);
  user = this.auth.user;
  
  contacts = {
    primaryEmail: '',
    secondaryEmail: '',
    mobile: '',
    alternativePhone: ''
  };

  emergencyContact = {
    name: '',
    relationship: '',
    phone: ''
  };

  isSaving = false;

  async ngOnInit() {
    await this.loadContacts();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  async loadContacts() {
    const userId = this.user()?.id;
    if (!userId) return;

    try {
      const profile = await this.firestore.getUserProfile(userId);
      if (profile?.contacts) {
        this.contacts = { ...this.contacts, ...profile.contacts };
      }
      if (profile?.emergencyContact) {
        this.emergencyContact = { ...this.emergencyContact, ...profile.emergencyContact };
      }
    } catch (error) {
      console.error('Error cargando contactos:', error);
    }
  }

  async saveContacts() {
    const userId = this.user()?.id;
    if (!userId) {
      alert('Debes estar autenticado');
      return;
    }

    this.isSaving = true;
    try {
      await this.firestore.updateDocument('users', userId, {
        contacts: this.contacts,
        emergencyContact: this.emergencyContact
      });
      alert('Contactos actualizados exitosamente');
    } catch (error) {
      console.error('Error guardando contactos:', error);
      alert('Error al guardar los contactos');
    } finally {
      this.isSaving = false;
    }
  }
}