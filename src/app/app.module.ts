import { CdkDrag } from '@angular/cdk/drag-drop';
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
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { RippleModule } from 'primeng/ripple';
import { SelectButtonModule } from 'primeng/selectbutton';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';

import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { MenubarModule } from 'primeng/menubar';
import { OrderListModule } from 'primeng/orderlist';
import { HeaderComponent } from './header/header.component';
import { LineupComponent } from './lineup/lineup.component';
import { TrendsComponent } from './trends/trends.component';



@NgModule({
  declarations: [
    AppComponent,
    MenuBarComponent,
    HeaderComponent,
    TrendsComponent,
    LineupComponent
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
    FormsModule,
    InputSwitchModule,
    MenubarModule,
    BadgeModule,
    AvatarModule,
    InputTextModule,
    RippleModule,
    OrderListModule,
    CdkDrag
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent],
    schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
],
})
export class AppModule { }
