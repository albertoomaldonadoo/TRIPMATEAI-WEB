import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { BookTicketsComponent } from './pages/book-tickets/book-tickets.component';
import { CheckinComponent } from './pages/checkin/checkin.component';
import { PassengerDetailsComponent } from './pages/passenger-details/passenger-details.component';
import { UpdateContactsComponent } from './pages/update-contacts/update-contacts.component';
import { FlightDetailsComponent } from './pages/flight-details/flight-details.component';
import { ItinerariesComponent } from './pages/itineraries/itineraries.component';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard]
    },
    {
        path: 'book-tickets',
        component: BookTicketsComponent,
        canActivate: [authGuard]
    },
    {
        path: 'checkin',
        component: CheckinComponent,
        canActivate: [authGuard]
    },
    {
        path: 'passenger-details',
        component: PassengerDetailsComponent,
        canActivate: [authGuard]
    },
    {
        path: 'update-contacts',
        component: UpdateContactsComponent,
        canActivate: [authGuard]
    },
    {
        path: 'flight-details',
        component: FlightDetailsComponent,
        canActivate: [authGuard]
    },
    {
        path: 'itineraries',
        component: ItinerariesComponent,
        canActivate: [authGuard]
    },
    {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [authGuard]
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];