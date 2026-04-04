import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
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
      return;
    }

    const payload = {
      age,
      bmi,
      smoking,
      exercise
    };

    console.log('Send this to backend:', payload);

    // Temporary frontend-only logic for now
    let score = 0;

    if (age > 50) score += 2;
    if (bmi > 30) score += 2;
    if (smoking === 'Yes') score += 2;
    if (exercise === 'Low') score += 1;

    if (score >= 5) {
      this.result = 'High Risk';
    } else if (score >= 3) {
      this.result = 'Medium Risk';
    } else {
      this.result = 'Low Risk';
    }
  }
}
