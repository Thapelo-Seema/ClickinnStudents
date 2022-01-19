import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccommodationSearchPage } from './accommodation-search.page';

const routes: Routes = [
  {
    path: '',
    component: AccommodationSearchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccommodationSearchPageRoutingModule {}
