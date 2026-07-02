package negocio;

public abstract class ServicioBaseDecorador<T extends IServicioFiCitas> implements IServicioFiCitas {
    protected T servicioBase;

    public ServicioBaseDecorador(T servicioBase) {
        this.servicioBase = servicioBase;
    }
}
