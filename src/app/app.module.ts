import { CdkDrag } from '@angular/cdk/drag-drop';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
  NgModule,
} from '@angular/core';
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

import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { DataViewModule } from 'primeng/dataview';
import { MenubarModule } from 'primeng/menubar';
import { OrderListModule } from 'primeng/orderlist';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { HeaderComponent } from './header/header.component';
import { LineupComponent } from './lineup/lineup.component';
import { ManageTeamPlayerComponent } from './manage-team-player/manage-team-player.component';
import { ManageTeamComponent } from './manage-team/manage-team.component';
import { TeamSelectorComponent } from './team-selector/team-selector.component';
import { TrendsComponent } from './trends/trends.component';

import { AccordionModule } from 'primeng/accordion';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RatingModule } from 'primeng/rating';
import { SliderModule } from 'primeng/slider';
import { PitcherSelectionComponent } from './pitcher-selection/pitcher-selection.component';

import { FileUploadModule } from 'primeng/fileupload';
import { SidebarModule } from 'primeng/sidebar';
import { ImageUploadWidgetComponent } from './image-upload-widget/image-upload-widget.component';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuBarComponent,
    HeaderComponent,
    TrendsComponent,
    LineupComponent,
    TeamSelectorComponent,
    ManageTeamComponent,
    ManageTeamPlayerComponent,
    PitcherSelectionComponent,
    LoginComponent,
    SignUpComponent,
    ImageUploadWidgetComponent,
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
    ReactiveFormsModule,
    InputSwitchModule,
    MenubarModule,
    BadgeModule,
    AvatarModule,
    InputTextModule,
    RippleModule,
    OrderListModule,
    CdkDrag,
    CardModule,
    ToastModule,
    SplitButtonModule,
    ChipModule,
    ProgressSpinnerModule,
    OverlayPanelModule,
    TableModule,
    DataViewModule,
    InputTextareaModule,
    AccordionModule,
    RatingModule,
    SliderModule,
    InputNumberModule,
    SidebarModule,
    FileUploadModule,
  ],
  providers: [DatePipe, MessageService],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AppModule {}
