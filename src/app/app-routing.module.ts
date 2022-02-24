import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomPreloadStrategyService } from './services/custom-preload-strategy.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    data: {preload: true},
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'banner-details',
    data: {preload: true, loadAfter: 23000},
    loadChildren: () => import('./pages/banner-details/banner-details.module').then( m => m.BannerDetailsPageModule)
  },
  {
    path: 'accommodation-search',
    data: {preload: true, loadAfter: 23000},
    loadChildren: () => import('./pages/accommodation-search/accommodation-search.module').then( m => m.AccommodationSearchPageModule)
  },
  {
    path: 'roles',
    data: {preload: true, loadAfter: 60000},
    loadChildren: () => import('./pages/roles/roles.module').then( m => m.RolesPageModule)
  },
  {
    path: 'results',
    data: {preload: true, loadAfter: 23000},
    loadChildren: () => import('./pages/results/results.module').then( m => m.ResultsPageModule)
  },
  {
    path: 'room',
    data: {preload: true},
    loadChildren: () => import('./pages/room/room.module').then( m => m.RoomPageModule)
  },
  {
    path: 'appointment',
    data: {preload: true, loadAfter: 60000},
    loadChildren: () => import('./pages/appointment/appointment.module').then( m => m.AppointmentPageModule)
  },
  {
    path: 'profile',
    data: {preload: true, loadAfter: 60000},
    loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: CustomPreloadStrategyService })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
