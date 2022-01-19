import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BannerDetailsPageRoutingModule } from './banner-details-routing.module';

import { BannerDetailsPage } from './banner-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BannerDetailsPageRoutingModule
  ],
  declarations: [BannerDetailsPage]
})
export class BannerDetailsPageModule {}
