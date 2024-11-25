import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.css'
})
export class CameraComponent implements OnInit {
  @ViewChild('video', { static: false }) video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;

  http = inject(HttpClient);
  message: string = "";

  videoWidth = 0;
  videoHeight = 0;

  ngOnInit(): void {
    this.startCamera();
  }

  startCamera() {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        this.video.nativeElement.srcObject = stream;
      })
      .catch((err) => {
        console.error("Error accessing the camera: ", err);
      });
  }

  captureImage(): void {
    const videoElement = this.video.nativeElement;
    const canvasElement = this.canvas.nativeElement;
    const context = canvasElement.getContext('2d')!;

    // Set canvas dimensions to match the video stream
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    // Draw the current video frame to the canvas
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    // Convert the canvas image to a JPEG Blob
    canvasElement.toBlob((blob:any) => {
      if (blob) {
        this.sendImage(blob);
      }
    }, 'image/jpeg');
  }

  sendImage(blob: Blob): void {
    const formData = new FormData();
    formData.append('image', blob, 'attendance.jpg');

    this.http.post("http://localhost:3000/images/", formData).subscribe((res) => {
      console.log(res)
      if(res){
        this.message = "User Found"
      }else{
        this.message = "User Not Found"
      }
    });

  }
}
