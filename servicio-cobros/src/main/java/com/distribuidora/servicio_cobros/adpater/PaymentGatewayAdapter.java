package com.distribuidora.servicio_cobros.adpater;

public interface PaymentGatewayAdapter {
    boolean realizarCobro(double monto);
}