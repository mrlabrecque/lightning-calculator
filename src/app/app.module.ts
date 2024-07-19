import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DropdownModule } from 'primeng/dropdown';

import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { FieldsetModule } from 'primeng/fieldset';
import { ListboxModule } from 'primeng/listbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectButtonModule } from 'primeng/selectbutton';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';





@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DropdownModule,
    BrowserAnimationsModule,
    ListboxModule,
    FieldsetModule,
    ChartModule,
    AutoCompleteModule,
    ButtonModule,
    MultiSelectModule,
    SelectButtonModule,
    FormsModule
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent],
    schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
],
})
export class AppModule { }
