import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

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
    formData.append('image', blob, 'capture.jpg');

    console.log(formData);

    // Make HTTP POST request
    // fetch('https://your-api-endpoint.com/upload', {
    //   method: 'POST',
    //   body: formData,
    // })
    //   .then((response) => response.json())
    //   .then((result) => {
    //     console.log('Image uploaded successfully:', result);
    //   })
    //   .catch((error) => {
    //     console.error('Error uploading image:', error);
    //   });
  }
}
