import { Component } from '@angular/core';
import { Booking } from './booking/booking';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [Booking],
    templateUrl: './app.html',
    styleUrl: './app.css'
})
export class App {
    title = 'reserva-viajes';
}
