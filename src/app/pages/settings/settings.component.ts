import { Component as Component6, inject as inject6, OnInit as OnInit6 } from '@angular/core';
import { CommonModule as CommonModule6 } from '@angular/common';
import { FormsModule as FormsModule6 } from '@angular/forms';
import { Router as Router6 } from '@angular/router';
import { FirebaseAuthService as FirebaseAuthService6 } from '../../core/services/firebase-auth.service';
import { FirestoreService as FirestoreService6 } from '../../core/services/firestore.service';

@Component6({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule6, FormsModule6],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit6 {
  auth = inject6(FirebaseAuthService6);
  firestore = inject6(FirestoreService6);
  router = inject6(Router6);
  user = this.auth.user;

  settings = {
    name: '',
    email: '',
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false
  };

  isSaving = false;

  async ngOnInit() {
    this.settings.name = this.user()?.name || '';
    this.settings.email = this.user()?.email || '';
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  async saveSettings() {
    const userId = this.user()?.id;
    if (!userId) return;

    this.isSaving = true;
    try {
      await this.firestore.updateDocument('users', userId, {
        settings: this.settings
      });
      alert('Ajustes guardados exitosamente');
    } catch (error) {
      console.error('Error guardando ajustes:', error);
      alert('Error al guardar los ajustes');
    } finally {
      this.isSaving = false;
    }
  }
}