import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { 
  Auth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  user,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  User as FirebaseUser
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { Credentials, RegisterInfo } from '../models/credentials';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);
  
  // Signal para el usuario actual
  user = signal<User | null>(null);
  
  // Observable del estado de autenticación de Firebase
  user$ = user(this.auth);

  constructor() {
    // Sincronizar el estado de Firebase con nuestro signal
    this.user$.subscribe((firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        this.user.set({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: this.extractName(firebaseUser.displayName),
          surname: this.extractSurname(firebaseUser.displayName)
        });
      } else {
        this.user.set(null);
      }
    });
  }

  /**
   * Registro con email y password
   */
  async register(registerInfo: RegisterInfo): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        registerInfo.email,
        registerInfo.password
      );

      // Actualizar el perfil con nombre y apellidos
      await updateProfile(userCredential.user, {
        displayName: `${registerInfo.name} ${registerInfo.surname}`
      });

      // Actualizar el signal manualmente después de updateProfile
      this.user.set({
        id: userCredential.user.uid,
        email: userCredential.user.email || '',
        name: registerInfo.name,
        surname: registerInfo.surname
      });

      console.log('Usuario registrado exitosamente');
      
    } catch (error: any) {
      this.handleAuthError(error);
      throw error;
    }
  }

  /**
   * Login con email y password
   */
  async login(credentials: Credentials): Promise<void> {
    try {
      await signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );
      
      console.log('Login exitoso');
      
    } catch (error: any) {
      this.handleAuthError(error);
      throw error;
    }
  }

  /**
   * Login con Google
   */
  async loginWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(this.auth, provider);
      
      console.log('Login con Google exitoso');
      
    } catch (error: any) {
      this.handleAuthError(error);
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.user.set(null);
      this.router.navigate(['/login']);
      console.log('Sesión cerrada');
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  /**
   * Manejo de errores de Firebase Auth
   */
  private handleAuthError(error: any): void {
    let message = 'Ha ocurrido un error';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'Este email ya está registrado';
        break;
      case 'auth/invalid-email':
        message = 'Email inválido';
        break;
      case 'auth/operation-not-allowed':
        message = 'Operación no permitida';
        break;
      case 'auth/weak-password':
        message = 'La contraseña es muy débil';
        break;
      case 'auth/user-disabled':
        message = 'Usuario deshabilitado';
        break;
      case 'auth/user-not-found':
        message = 'Usuario no encontrado';
        break;
      case 'auth/wrong-password':
        message = 'Contraseña incorrecta';
        break;
      case 'auth/invalid-credential':
        message = 'Credenciales inválidas';
        break;
      case 'auth/too-many-requests':
        message = 'Demasiados intentos. Intenta más tarde';
        break;
      case 'auth/network-request-failed':
        message = 'Error de conexión';
        break;
      case 'auth/popup-closed-by-user':
        message = 'Ventana de autenticación cerrada';
        break;
      default:
        message = error.message || 'Error de autenticación';
    }
    
    console.error('Error de autenticación:', message);
    alert(message); // Puedes reemplazar esto con un servicio de notificaciones
  }

  /**
   * Utilidades para extraer nombre y apellido del displayName
   */
  private extractName(displayName: string | null): string {
    if (!displayName) return '';
    const parts = displayName.split(' ');
    return parts[0] || '';
  }

  private extractSurname(displayName: string | null): string {
    if (!displayName) return '';
    const parts = displayName.split(' ');
    return parts.slice(1).join(' ') || '';
  }
}