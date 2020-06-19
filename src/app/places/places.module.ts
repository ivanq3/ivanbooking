import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlacesRoutingModule } from './places-routing.module';

import { PlacesPage } from './places.page';

@NgModule({
  imports: [
    CommonModule,
    // FormsModule,
    IonicModule,
    PlacesRoutingModule,
  ],
  declarations: [PlacesPage],
})
export class PlacesPageModule {}
