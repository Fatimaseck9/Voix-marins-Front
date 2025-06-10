import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register-cmp',
  templateUrl: './register.component.html' // ou ./add-admin.component.html si tu renommes
})
export class RegisterComponent implements OnInit, OnDestroy {
  form = {
    name: '',
    email: '',
    password: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('register-page');
    body.classList.add('off-canvas-sidebar');
  }

  ngOnDestroy() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('register-page');
    body.classList.remove('off-canvas-sidebar');
  }

  onRegister() {
    const payload = {
      name: this.form.name,
      email: this.form.email,
      password: this.form.password,
      role: 'admin',
      isActive: true 
    };

    this.http.post('http://localhost:3001/users/admin', payload).subscribe({
      next: (res) => {
        console.log('Administrateur ajouté', res);
        alert('Administrateur ajouté avec succès !');
        this.resetForm();
      },
      error: (err) => {
        console.error("Erreur lors de l'ajout", err);
        alert("Erreur lors de l'ajout : " + (err.error?.message || 'Inconnue'));
      }
    });
  }

  resetForm() {
    this.form = {
      name: '',
      email: '',
      password: ''
    };
  }
}
