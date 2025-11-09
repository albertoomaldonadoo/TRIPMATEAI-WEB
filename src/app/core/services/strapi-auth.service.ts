import { inject, Injectable, signal } from '@angular/core';
import { Credentials, RegisterInfo } from '../models/credentials';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { User } from '../models/user';
import { ErrorService } from './error.service';
import { ErrorType } from '../models/app-error';

/**
 * Respuesta del endpoint de login de Strapi.
 */
export interface LoginResponse {
  jwt: string
  user: StrapiUser
}

/**
 * Respuesta del endpoint de registro de Strapi.
 */
export interface RegisterResponse {
  jwt: string
  user: StrapiUser
}

/**
 * Estructura completa de un usuario de Strapi.
 * 
 * Los campos name y surname son opcionales porque solo se añaden
 * después del registro mediante una actualización del perfil.
 */
export interface StrapiUser {
  id: number
  documentId: string
  username: string
  name?: string
  surname?: string
  email: string
  provider: string
  confirmed: boolean
  blocked: boolean
  createdAt: string
  updatedAt: string
  publishedAt: string
}

/**
 * Servicio de autenticación con backend Strapi.
 * 
 * Gestiona todas las operaciones relacionadas con autenticación:
 * - Login y registro de usuarios
 * - Persistencia de sesión con JWT en localStorage
 * - Recuperación automática de sesión al cargar la app
 * - Actualización de perfil con campos personalizados
 * 
 * El estado del usuario autenticado se expone mediante una señal reactiva
 * que permite a los componentes detectar cambios automáticamente.
 */
@Injectable({
  providedIn: 'root'
})
export class StrapiAuthService {
  
  /**
   * Señal que contiene el usuario autenticado actual.
   * null si no hay usuario autenticado.
   */
  public user: any | null;
  
  /**
   * Token JWT almacenado en localStorage.
   * Se usa para autenticar todas las peticiones al backend.
   */
  private token:string|null;
  
  private http:HttpClient = inject(HttpClient);
  private errorService = inject(ErrorService);

  /**
   * Inicializa el servicio de autenticación.
   * 
   * Al construirse:
   * 1. Inicializa la señal de usuario a null
   * 2. Recupera el token del localStorage si existe
   * 3. Intenta obtener los datos del usuario autenticado (me())
   */
  constructor() {
    this.user = signal<any>(null);
    this.token = localStorage.getItem('token');
    this.me();
  }

  /**
   * Obtiene los datos del usuario autenticado actual.
   * 
   * Hace una petición GET a /api/users/me usando el JWT almacenado.
   * Si tiene éxito, actualiza la señal user() con los datos del usuario.
   * 
   * Este método se llama automáticamente al iniciar la app para
   * recuperar la sesión si existe un token válido.
   * 
   * Si falla (token expirado, usuario eliminado, etc.), se maneja
   * el error mediante ErrorService y el usuario permanece null.
   */
  me(){
    if(this.token){
      this.http.get<StrapiUser>("http://localhost:1337/api/users/me",{
        headers:{
          "Authorization":`Bearer ${this.token}`
        }
      }).subscribe({
        next:(data)=>{
          const user:User = {
            name:data.name || '',
            surname:data.surname || '',
            email:data.email
          }
          this.setUser(user);
          
        },
        error:(err)=>{
          this.errorService.handleError(err);
        }
      });
    }    
  }

  /**
   * Actualiza la señal de usuario con nuevos datos.
   * 
   * Este método centraliza la actualización del estado del usuario
   * para mantener consistencia en toda la aplicación.
   * 
   * @param user - Datos del usuario a establecer
   */
  setUser(user:User){
    this.user.set(user);
  }

  /**
   * Autentica un usuario con email y contraseña.
   * 
   * Flujo:
   * 1. Envía credenciales a /api/auth/local
   * 2. Strapi retorna JWT y datos del usuario
   * 3. Guarda el JWT en localStorage
   * 4. Actualiza la señal user()
   * 5. Los componentes detectan el cambio y navegan automáticamente
   * 
   * Manejo de errores:
   * - 400: Muestra "Usuario o contraseña incorrectos"
   * - Otros: Delega al ErrorService
   * 
   * @param credentials - Email y contraseña del usuario
   * 
   * @example
   * this.authService.login({ email: 'user@example.com', password: 'pass123' });
   */
  login(credentials: Credentials){
    const body = {
      identifier:credentials.email,
      password:credentials.password
    };
    this.http.post<LoginResponse>("http://localhost:1337/api/auth/local", body).subscribe({
      next:(data)=>{
        localStorage.setItem('token',data.jwt);
        const newUser:User = {
          email:data.user.email,
          name:data.user.name || '',
          surname:data.user.surname || ''
        }
        this.setUser(newUser);
      },
      error:(err: HttpErrorResponse)=>{
        if (err.status === 400) {
          this.errorService.setError('Usuario o contraseña incorrectos', ErrorType.AUTH);
        } else {
          this.errorService.handleError(err);
        }
      }
    })
  }

  /**
   * Cierra la sesión del usuario actual.
   * 
   * Limpia:
   * - La señal user() (establece a null)
   * - El JWT del localStorage
   * - El token de la instancia del servicio
   * 
   * Los componentes detectan automáticamente el cambio en user()
   * y redirigen al login si es necesario (mediante guards).
   */
  logout() {
    this.user.set(null);
    localStorage.removeItem('token');
    this.token = null;
  }

  /**
   * Registra un nuevo usuario en la aplicación.
   * 
   * Proceso en dos pasos:
   * 1. Registro básico (POST /api/auth/local/register)
   *    - Strapi solo acepta username, email, password
   *    - Retorna JWT y datos básicos del usuario
   * 
   * 2. Actualización de perfil (PUT /api/users/me)
   *    - Añade campos personalizados: name, surname
   *    - Usa endpoint custom que solo permite actualizar propio perfil
   * 
   * Si el paso 2 falla:
   * - Igual autentica al usuario (el registro fue exitoso)
   * - Muestra advertencia de que nombre/apellidos no se guardaron
   * - Usuario puede actualizar su perfil más tarde
   * 
   * Manejo de errores del registro:
   * - 400 con 'Email': "El email ya está registrado"
   * - 400 con 'username': "El email ya está registrado"
   * - 400 genérico: "Error al registrar. Verifica los datos"
   * - Otros: Delega al ErrorService
   * 
   * @param userInfo - Datos completos del nuevo usuario (name, surname, email, password)
   * 
   * @example
   * this.authService.register({
   *   name: 'Juan',
   *   surname: 'García',
   *   email: 'juan@example.com',
   *   password: 'Pass123!',
   *   confirmPassword: 'Pass123!'
   * });
   */
  register(userInfo: RegisterInfo){
    const registerBody = {
      username: userInfo.email,
      email: userInfo.email,
      password: userInfo.password
    };
    
    this.http.post<RegisterResponse>("http://localhost:1337/api/auth/local/register", registerBody).subscribe({
      next:(data)=>{
        localStorage.setItem('token', data.jwt);
        this.token = data.jwt;
        
        const updateBody = {
          name: userInfo.name,
          surname: userInfo.surname
        };
        
        this.http.put<{data: StrapiUser}>(`http://localhost:1337/api/users/me`, updateBody, {
          headers: {
            "Authorization": `Bearer ${this.token}`
          }
        }).subscribe({
          next: (response) => {
            const updatedUser = response.data;
            const newUser:User = {
              email: updatedUser.email,
              name: updatedUser.name || userInfo.name,
              surname: updatedUser.surname || userInfo.surname
            }
            this.setUser(newUser);
          },
          error: (err) => {
            console.error('Error al actualizar perfil:', err);
            const newUser:User = {
              email: data.user.email,
              name: userInfo.name,
              surname: userInfo.surname
            }
            this.setUser(newUser);
            this.errorService.setError('Registro exitoso, pero no se pudieron guardar nombre y apellidos', ErrorType.VALIDATION);
          }
        });
      },
      error:(err: HttpErrorResponse)=>{
        if (err.status === 400) {
          if (err.error?.error?.message?.includes('Email') || err.error?.error?.message?.includes('email')) {
            this.errorService.setError('El email ya está registrado', ErrorType.VALIDATION);
          } else if (err.error?.error?.message?.includes('username')) {
            this.errorService.setError('El email ya está registrado', ErrorType.VALIDATION);
          } else {
            this.errorService.setError('Error al registrar. Verifica los datos', ErrorType.VALIDATION);
          }
        } else {
          this.errorService.handleError(err);
        }
      }
    })
  }
}
