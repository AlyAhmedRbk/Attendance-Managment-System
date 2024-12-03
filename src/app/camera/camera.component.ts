import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.css']
})
export class CameraComponent implements OnInit {
  @ViewChild('video', { static: false }) video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;

  http = inject(HttpClient);
  faceDetected = false;
  isUploading = false; // Prevent multiple uploads until the previous response is received

  ngOnInit(): void {
    this.loadFaceApiModels().then(() => {
      this.startCamera();
    });
  }

  // Load Face API models
  async loadFaceApiModels(): Promise<void> {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models'); // Tiny face detector
      console.log('Face API models loaded');
    } catch (error) {
      console.error('Error loading Face API models:', error);
    }
  }

  // Start the camera stream
  startCamera(): void {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        this.video.nativeElement.srcObject = stream;
        this.video.nativeElement.onplay = () => {
          this.detectFacesAndDrawOverlay();
        };
      })
      .catch((err) => {
        console.error('Error accessing the camera: ', err);
      });
  }

  // Detect faces, draw overlay, and send the image to the backend
  async detectFacesAndDrawOverlay(): Promise<void> {
    const videoElement = this.video.nativeElement;
    const canvasElement = this.canvas.nativeElement;

    // Match dimensions of the canvas to the video element
    faceapi.matchDimensions(canvasElement, {
      width: videoElement.videoWidth,
      height: videoElement.videoHeight
    });

    setInterval(async () => {
      // Detect faces in the video frame
      const detections = await faceapi.detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions());
      this.faceDetected = detections.length > 0;

      // Clear previous drawings
      const context = canvasElement.getContext('2d')!;
      context.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // Draw detection box if face is found
      if (this.faceDetected) {
        const resizedDetections = faceapi.resizeResults(detections, {
          width: videoElement.videoWidth,
          height: videoElement.videoHeight
        });

        resizedDetections.forEach((detection) => {
          // Draw green rectangle around the face
          context.strokeStyle = 'green';
          context.lineWidth = 2;
          const box = detection.box;
          context.strokeRect(box.x, box.y, box.width, box.height);
        });

        // Send the image to the backend once a face is detected
        if (!this.isUploading) {
          this.captureAndSendImage();
        }
      }
    }, 5000); // Check for faces every 500ms
  }

  // Capture the current frame and send it to the backend
  captureAndSendImage(): void {
    const videoElement = this.video.nativeElement;
    const canvasElement = this.canvas.nativeElement;
    const context = canvasElement.getContext('2d')!;

    // Set canvas dimensions to match the video stream
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    // Draw the current video frame to the canvas
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    // Convert the canvas to Blob and send to backend
    canvasElement.toBlob(
      (blob) => {
        if (blob) {
          this.sendBlobToBackend(blob);
        } else {
          console.error('Failed to convert canvas to Blob');
        }
      },
      'image/jpeg',
      0.9 // Quality factor for JPEG (0.0 - 1.0)
    );
  }

  // Send the captured Blob to the backend
  sendBlobToBackend(blob: Blob): void {
    const formData = new FormData();
    formData.append('image', blob, 'captured-image.jpg'); // Add blob as 'image' field with a name

    console.log('Sending Blob to backend:', blob);
    formData.forEach(val => console.log(val))
    this.isUploading = true; // Prevent multiple uploads
    // Replace with your backend endpoint
    // const backendUrl = 'https://your-backend-url.com/upload';

    // this.http.post(backendUrl, formData).subscribe(
    //   (response) => {
    //     console.log('Backend response:', response);
    //     this.isUploading = false; // Reset upload state after success
    //   },
    //   (error) => {
    //     console.error('Error sending Blob to backend:', error);
    //     this.isUploading = false; // Reset upload state on error
    //   }
    // );
  }
}
