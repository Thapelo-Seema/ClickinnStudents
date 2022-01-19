import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccommodationSearchPageRoutingModule } from './accommodation-search-routing.module';

import { AccommodationSearchPage } from './accommodation-search.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AccommodationSearchPageRoutingModule
  ],
  declarations: [AccommodationSearchPage]
})
export class AccommodationSearchPageModule {}
