import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgentScanningPage } from './agent-scanning.page';

const routes: Routes = [
  {
    path: '',
    component: AgentScanningPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgentScanningPageRoutingModule {}
