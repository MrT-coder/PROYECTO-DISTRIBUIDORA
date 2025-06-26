package com.distribuidora.servicio_cobros.adpater;

import org.springframework.stereotype.Component;

@Component // Le decimos a Spring que gestione este componente
public class SimulatedPaymentGateway implements PaymentGatewayAdapter {

    @Override
    public boolean realizarCobro(double monto) {
        // Lógica de simulación: los pagos cuyo monto termine en .50 fallarán.
        // Esto nos permite controlar el resultado para las pruebas.
        // Por ejemplo, un monto de 100.00 tendrá éxito, uno de 100.50 fallará.
        return monto % 1 != 0.5;
    }
}