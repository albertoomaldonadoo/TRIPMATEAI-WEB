import { CommonModule } from '@angular/common';
import { Component, inject, signal, effect, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LocalStorageAuthService } from '../../core/services/local-storate-auth.service';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { StrapiAuthService } from '../../core/services/strapi-auth.service';
import { User } from '../../core/models/user';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  formLogin;
  private router:Router = inject(Router);
  readonly navigateTo:string;

  constructor(private formSvc:FormBuilder,
    private auth:StrapiAuthService
  ){
    this.formLogin = this.formSvc.group({
      'email':['', [Validators.required, Validators.email]],
      'password':['', [Validators.required]],
    });
    this.navigateTo = history.state?.['navigateTo'] || '/dashboard';
    effect(() => {
      const user = this.auth.user();
      if (user) {
        this.router.navigate([this.navigateTo]);
      }
    });
  }

  onSubmit(){
    this.auth.login(this.formLogin.value as any);
  }

  getError(control:string){
       
    switch(control){
      case 'email':
        if(this.formLogin.controls.email.errors!=null && 
           Object.keys(this.formLogin.controls.email.errors).includes('required'))
           return "El campo email es requerido";
        else if(this.formLogin.controls.email.errors!=null && 
           Object.keys(this.formLogin.controls.email.errors).includes('email'))
           return "El email no es correcto";
        
        break;
      case 'password': 
        if(this.formLogin.controls.password.errors!=null && 
           Object.keys(this.formLogin.controls.password.errors).includes('required'))
           return "El campo email es requerido";
        break;
      default:return "";
    }
    return "";
  }

}
