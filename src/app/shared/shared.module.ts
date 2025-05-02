import { NgModule } from "@angular/core";
import { ValidationMessageComponent } from "./validation-message/validation-message.component";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

@NgModule({
 imports:[ValidationMessageComponent],
 exports:[ValidationMessageComponent,CommonModule,RouterModule],
})
export class SharedModule{}