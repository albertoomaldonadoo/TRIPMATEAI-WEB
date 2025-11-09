import { CommonModule } from '@angular/common';
import { Component, inject, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { FirebaseAuthService } from '../../core/services/firebase-auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  formLogin;
  private router: Router = inject(Router);
  auth: FirebaseAuthService = inject(FirebaseAuthService);
  readonly navigateTo: string;
  isLoading = false;

  constructor(private formSvc: FormBuilder) {
    this.formLogin = this.formSvc.group({
      'email': ['', [Validators.required, Validators.email]],
      'password': ['', [Validators.required]],
    });
    
    this.navigateTo = history.state?.['navigateTo'] || '/dashboard';
    
    effect(() => {
      const user = this.auth.user();
      if (user) {
        this.router.navigate([this.navigateTo]);
      }
    });
  }

  async onSubmit() {
    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    
    try {
      await this.auth.login(this.formLogin.value as any);
      // La navegación se maneja automáticamente con el effect
    } catch (error) {
      console.error('Error en login:', error);
      this.isLoading = false;
    }
  }

  async onGoogleSignIn() {
    this.isLoading = true;
    try {
      await this.auth.loginWithGoogle();
      // La navegación se maneja automáticamente con el effect
    } catch (error) {
      console.error('Error en login con Google:', error);
      this.isLoading = false;
    }
  }

  getError(control: string): string {
    switch (control) {
      case 'email':
        if (this.formLogin.controls.email.errors != null &&
          Object.keys(this.formLogin.controls.email.errors).includes('required'))
          return "El campo email es requerido";
        else if (this.formLogin.controls.email.errors != null &&
          Object.keys(this.formLogin.controls.email.errors).includes('email'))
          return "El email no es correcto";
        break;
        
      case 'password':
        if (this.formLogin.controls.password.errors != null &&
          Object.keys(this.formLogin.controls.password.errors).includes('required'))
          return "El campo password es requerido";
        break;
        
      default:
        return "";
    }
    return "";
  }
}