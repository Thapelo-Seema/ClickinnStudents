import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResultsScanningPageRoutingModule } from './results-scanning-routing.module';

import { ResultsScanningPage } from './results-scanning.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResultsScanningPageRoutingModule
  ],
  declarations: [ResultsScanningPage]
})
export class ResultsScanningPageModule {}
