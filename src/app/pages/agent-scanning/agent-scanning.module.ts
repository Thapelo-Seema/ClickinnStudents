import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgentScanningPageRoutingModule } from './agent-scanning-routing.module';

import { AgentScanningPage } from './agent-scanning.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgentScanningPageRoutingModule
  ],
  declarations: [AgentScanningPage]
})
export class AgentScanningPageModule {}
