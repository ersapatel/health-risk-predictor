import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { ChangeDetectorRef } from '@angular/core';

export interface PredictResponse {
  age: number;
  bmi: number;
  riskLevel: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  constructor(private readonly http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  protected readonly title = signal('Health Risk Predictor');

  formData = {
    birthdate: '',
    age: null as number | null,
    height: null as number | null, // cm
    weight: null as number | null, // kg
    bmi: null as number | null,
    smoking: 'No',
    exercise: 'Low'
  };

  result = '';
  loading = false;

  onBirthdateChange() {
    if (!this.formData.birthdate) {
      this.formData.age = null;
      return;
    }

    const today = new Date();
    const birthDate = new Date(this.formData.birthdate);

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    this.formData.age = age >= 0 ? age : null;
  }

  calculateBMI() {
    const { height, weight } = this.formData;

    if (!height || !weight || height <= 0 || weight <= 0) {
      this.formData.bmi = null;
      return;
    }

    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    this.formData.bmi = parseFloat(bmi.toFixed(2));
  }

  predictRisk() {
    const { age, bmi, smoking, exercise } = this.formData;

    if (age === null || bmi === null) {
      this.result = 'Please enter valid birth date, height, and weight.';
      this.loading = false;
      return;
    }

    const payload = {
      age,
      bmi,
      smoking,
      exercise
    };

    this.loading = true;
    this.result = '';
    console.log('Send this to backend:', payload);
    const url = environment.apiUrl + '/predict';
    this.http.post<PredictResponse>(url, payload, { responseType: 'json' }).subscribe({
      next: (resp: PredictResponse) => {
        console.log('Response received:', resp);
        this.result = resp.riskLevel;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.result = 'Failed to get prediction from backend.';
        this.loading = false;
      }
    });
  }
}
