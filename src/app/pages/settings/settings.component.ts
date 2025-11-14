import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '../../core/services/firebase-auth.service';
import { FirestoreService } from '../../core/services/firestore.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  auth = inject(FirebaseAuthService);
  firestore = inject(FirestoreService);
  router = inject(Router);
  user = this.auth.user;
  settings = {
    name: '', email: '', emailNotifications: true,
    pushNotifications: false, darkMode: false
  };

  async ngOnInit() {
    this.settings.name = this.user()?.name || '';
    this.settings.email = this.user()?.email || '';
  }

  goBack() { this.router.navigate(['/dashboard']); }

  async saveSettings() {
    const userId = this.user()?.id;
    if (!userId) return;
    try {
      await this.firestore.updateDocument('users', userId, { settings: this.settings });
      alert('Ajustes guardados exitosamente');
    } catch (error) {
      console.error('Error guardando ajustes:', error);
      alert('Error al guardar los ajustes');
    }
  }
}