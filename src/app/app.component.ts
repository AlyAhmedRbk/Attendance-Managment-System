import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CameraComponent } from "./camera/camera.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CameraComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'attendence-system';
  symbol = "@"
}
