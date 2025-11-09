import { CommonModule } from '@angular/common';
import { Component, inject, signal, effect, untracked } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StrapiAuthService } from '../../core/services/strapi-auth.service';
import { User } from '../../core/models/user';




function paswordMatches(control:AbstractControl):ValidationErrors | null{
  const group:FormGroup = control as FormGroup;
  if(group.controls['password'].value!=group.controls['confirmPassword'].value){
    group.controls['confirmPassword'].setErrors({'passwordMatch':null});
    return {'passwordMatch':null};
  }

  return null;
}

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  formRegister:FormGroup;
  builder:FormBuilder = inject(FormBuilder);
  auth:StrapiAuthService = inject(StrapiAuthService);
  router:Router = inject(Router);
  readonly navigateTo:string;

  constructor(){
    this.formRegister = this.builder.group({
      'name':['',[Validators.required, Validators.minLength(3)]],
      'surname':['',[Validators.required, Validators.minLength(3)]],
      'email':['', [Validators.required, Validators.email]],
      'password':['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)]],
      'confirmPassword':['', [Validators.required]]
    },{validators:[paswordMatches]});
    this.navigateTo = history.state?.['navigateTo'] || '/dashboard';
    effect(() => {
      const user = this.auth.user();
      if (user) {
        this.router.navigate([this.navigateTo]);
      }
    });
  }

  onSubmit(){
    this.auth.register(this.formRegister.value);
  }

   getError(control:string){
       
    switch(control){
      case 'name':
        if(this.formRegister.controls['name'].errors!=null && 
           Object.keys(this.formRegister.controls['name'].errors).includes('required'))
           return "El campo nombre es requerido";
        else if(this.formRegister.controls['name'].errors!=null && 
           Object.keys(this.formRegister.controls['name'].errors).includes('minlength'))
           return "Debe introducir al menos 3 caracteres";
        
        break;
      case 'surname':
        if(this.formRegister.controls['surname'].errors!=null && 
           Object.keys(this.formRegister.controls['surname'].errors).includes('required'))
           return "El campo apellidos es requerido";
        else if(this.formRegister.controls['surname'].errors!=null && 
           Object.keys(this.formRegister.controls['surname'].errors).includes('minlength'))
           return "Debe introducir al menos 3 caracteres";
        
        break;
      case 'email':
        if(this.formRegister.controls['email'].errors!=null && 
           Object.keys(this.formRegister.controls['email'].errors).includes('required'))
           return "El campo email es requerido";
        else if(this.formRegister.controls['email'].errors!=null && 
           Object.keys(this.formRegister.controls['email'].errors).includes('email'))
           return "El email no es correcto";
        
        break;
      case 'password': 
        if(this.formRegister.controls['password'].errors!=null && 
           Object.keys(this.formRegister.controls['password'].errors).includes('required'))
           return "El campo password es requerido";
        else if(this.formRegister.controls['password'].errors!=null && 
           Object.keys(this.formRegister.controls['password'].errors).includes('pattern'))
           return "Al menos una mayúscula, una minúscula, un número y 8 caracteres";
        break;
      case 'confirmPassword': 
        if(this.formRegister.controls['confirmPassword'].errors!=null && 
           Object.keys(this.formRegister.controls['confirmPassword'].errors).includes('required'))
           return "El campo password es requerido";
        if(this.formRegister.controls['confirmPassword'].errors!=null && 
           Object.keys(this.formRegister.controls['confirmPassword'].errors).includes('passwordMatch'))
           return "Las contranseñas no coinciden";
        break;
      default:return "";
    }
    return "";
  }
  
}
