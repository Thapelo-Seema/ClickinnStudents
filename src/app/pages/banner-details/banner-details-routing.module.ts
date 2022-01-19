import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BannerDetailsPage } from './banner-details.page';

const routes: Routes = [
  {
    path: '',
    component: BannerDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BannerDetailsPageRoutingModule {}
