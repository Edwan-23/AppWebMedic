import { describe, it, expect } from 'vitest';

// Función para generar PIN de 4 dígitos
function generarPIN(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Función para validar PIN
function validarPIN(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

describe('Utilidades - Generación de PIN', () => {
  it('✅ Genera PIN de 4 dígitos', () => {
    const pin = generarPIN();
    
    expect(pin).toHaveLength(4);
    expect(validarPIN(pin)).toBe(true);
  });

  it('✅ PIN está entre 1000 y 9999', () => {
    const pin = generarPIN();
    const pinNumber = parseInt(pin);
    
    expect(pinNumber).toBeGreaterThanOrEqual(1000);
    expect(pinNumber).toBeLessThanOrEqual(9999);
  });

  it('✅ Genera PINs diferentes en múltiples llamadas', () => {
    const pins = new Set();
    
    for (let i = 0; i < 100; i++) {
      pins.add(generarPIN());
    }
    
    // Probabilidad de tener al menos algunos PINs diferentes
    expect(pins.size).toBeGreaterThan(50);
  });

  it('❌ Rechaza PIN inválido (menos de 4 dígitos)', () => {
    expect(validarPIN('123')).toBe(false);
  });

  it('❌ Rechaza PIN inválido (más de 4 dígitos)', () => {
    expect(validarPIN('12345')).toBe(false);
  });

  it('❌ Rechaza PIN con letras', () => {
    expect(validarPIN('12A4')).toBe(false);
  });
});

// Función para formatear moneda colombiana
function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(precio);
}

describe('Utilidades - Formato de Precios', () => {
  it('✅ Formatea precio correctamente', () => {
    const precio = formatearPrecio(5000);
    expect(precio).toContain('5');
    expect(precio).toContain('000');
  });

  it('✅ Formatea precio con miles', () => {
    const precio = formatearPrecio(1500000);
    expect(precio).toContain('1');
    expect(precio).toContain('500');
    expect(precio).toContain('000');
  });
});

// Función para calcular total de factura
function calcularTotalFactura(cantidad: number, precioUnitario: number): number {
  return cantidad * precioUnitario;
}

describe('Utilidades - Cálculos de Facturación', () => {
  it('✅ Calcula total correctamente', () => {
    const total = calcularTotalFactura(10, 5000);
    expect(total).toBe(50000);
  });

  it('✅ Maneja cantidad cero', () => {
    const total = calcularTotalFactura(0, 5000);
    expect(total).toBe(0);
  });

  it('✅ Maneja precio cero', () => {
    const total = calcularTotalFactura(10, 0);
    expect(total).toBe(0);
  });
});
