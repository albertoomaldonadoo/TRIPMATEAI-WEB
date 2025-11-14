import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '../../core/services/firebase-auth.service';
import { FirestoreService } from '../../core/services/firestore.service';

@Component({
  selector: 'app-update-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-contacts.component.html',
  styleUrl: './update-contacts.component.scss'
})
export class UpdateContactsComponent implements OnInit {
  auth = inject(FirebaseAuthService);
  firestore = inject(FirestoreService);
  router = inject(Router);
  user = this.auth.user;
  contacts = { primaryEmail: '', secondaryEmail: '', mobile: '', alternativePhone: '' };
  emergencyContact = { name: '', relationship: '', phone: '' };

  async ngOnInit() { await this.loadContacts(); }
  goBack() { this.router.navigate(['/dashboard']); }

  async loadContacts() {
    const userId = this.user()?.id;
    if (!userId) return;
    try {
      const profile = await this.firestore.getUserProfile(userId);
      if (profile?.contacts) this.contacts = { ...this.contacts, ...profile.contacts };
      if (profile?.emergencyContact) this.emergencyContact = { ...this.emergencyContact, ...profile.emergencyContact };
    } catch (error) {
      console.error('Error cargando contactos:', error);
    }
  }

  async saveContacts() {
    const userId = this.user()?.id;
    if (!userId) { alert('Debes estar autenticado'); return; }
    try {
      await this.firestore.updateDocument('users', userId, {
        contacts: this.contacts, emergencyContact: this.emergencyContact
      });
      alert('Contactos actualizados exitosamente');
    } catch (error) {
      console.error('Error guardando contactos:', error);
      alert('Error al guardar los contactos');
    }
  }
}