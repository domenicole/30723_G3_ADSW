export class ServicioBaseDecorador {
  constructor(servicioBase) {
    this.servicioBase = servicioBase;
  }

  obtenerTodas() {
    return this.servicioBase.obtenerTodas();
  }
}
