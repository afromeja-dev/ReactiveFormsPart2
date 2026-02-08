import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, FormArray, FormBuilder, Validators } from '@angular/forms';

@Component({
    selector: 'app-booking',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './booking.html',
    styleUrl: './booking.css',
})
export class Booking {

    // destinos y clases para los selects
    destinos = ['Barcelona', 'Madrid', 'Valencia', 'Sevilla', 'Bilbao', 'Mallorca'];
    clases = ['Turista', 'Business', 'Primera clase'];

    // filtro de busqueda (formcontrol independiente)
    searchControl = new FormControl('');
    filteredDestinos: string[] = [...this.destinos];

    // para calcular el precio
    precios: { [key: string]: number } = {
        'Turista': 100,
        'Business': 250,
        'Primera clase': 500
    };
    precioTotal = 0;

    formularioReserva: FormGroup;

    constructor(private fb: FormBuilder) {
        this.formularioReserva = this.fb.group({
            nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
            dni: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            telefono: ['', [Validators.required]],
            fechaNacimiento: ['', [Validators.required]],
            destino: ['', [Validators.required]],
            fechaSalida: ['', [Validators.required]],
            fechaRegreso: ['', [Validators.required]],
            tipoViaje: ['', [Validators.required]],
            clase: ['', [Validators.required]],
            numPasajeros: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
            // formarray de pasajeros adicionales
            pasajeros: this.fb.array([]),
            aceptarTerminos: [false, [Validators.requiredTrue]],
            newsletter: [false]
        });

        this.setupSearch();
        this.setupPassengersSync();
        this.calculatePrice();
    }

    // configurar el filtro
    setupSearch() {
        this.searchControl.valueChanges.subscribe(searchTerm => {
            this.filterDestinos(searchTerm || '');
        });
    }

    // filtrar destinos
    filterDestinos(searchTerm: string) {
        if (!searchTerm) {
            this.filteredDestinos = [...this.destinos];
        } else {
            this.filteredDestinos = this.destinos.filter(destino =>
                destino.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
    }

    // getter del formarray
    get pasajeros(): FormArray {
        return this.formularioReserva.get('pasajeros') as FormArray;
    }

    // sincronizar pasajeros con el numero
    setupPassengersSync() {
        this.formularioReserva.get('numPasajeros')?.valueChanges.subscribe(num => {
            this.adjustPassengers(num);
        });
    }

    // ajustar pasajeros automaticamente
    adjustPassengers(numTotal: number) {
        const necesito = numTotal - 1; // -1 porque el titular ya cuenta

        // Mientras tenga MENOS de los que necesito... AÑADO
        while (this.pasajeros.length < necesito) {
            this.addPasajero();
        }

        // Mientras tenga MÁS de los que necesito... QUITO el ultimo
        while (this.pasajeros.length > necesito) {
            this.pasajeros.removeAt(this.pasajeros.length - 1);
        }
    }

    // añadir pasajero al array
    addPasajero() {
        const pasajeroGroup = this.fb.group({
            nombre: ['', Validators.required],
            edad: ['', [Validators.required, Validators.min(0), Validators.max(120)]],
            relacion: ['', Validators.required]
        });
        this.pasajeros.push(pasajeroGroup);
    }

    // eliminar pasajero
    removePasajero(index: number) {
        this.pasajeros.removeAt(index);
        const nuevoTotal = this.pasajeros.length + 1;
        this.formularioReserva.get('numPasajeros')?.setValue(nuevoTotal);
    }

    // calcular precio en tiempo real
    calculatePrice() {
        this.formularioReserva.valueChanges.subscribe(values => {
            const clase = values.clase;
            const numPasajeros = values.numPasajeros || 1;

            if (clase && this.precios[clase]) {
                this.precioTotal = this.precios[clase] * numPasajeros;
            } else {
                this.precioTotal = 0;
            }
        });
    }

    enviarFormulario() {
        if (this.formularioReserva.valid) {
            console.log('Formulario enviado:', this.formularioReserva.value);
            alert('Reserva realizada con éxito!');
        }
    }

    getErrorMessage(fieldName: string): string {
        const control = this.formularioReserva.get(fieldName);
        if (!control || !control.errors || !control.touched) return '';

        const errors = control.errors;
        if (errors['required']) return 'Este campo es obligatorio';
        if (errors['email']) return 'Formato de email inválido';
        if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
        if (errors['min']) return `El valor mínimo es ${errors['min'].min}`;
        if (errors['max']) return `El valor máximo es ${errors['max'].max}`;

        return 'Error de validación';
    }

    isFieldInvalid(fieldName: string): boolean {
        const control = this.formularioReserva.get(fieldName);
        return !!(control && control.invalid && control.touched);
    }
}
