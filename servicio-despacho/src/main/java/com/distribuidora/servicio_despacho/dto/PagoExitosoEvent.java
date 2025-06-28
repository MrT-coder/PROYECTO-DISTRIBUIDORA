package com.distribuidora.servicio_despacho.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class PagoExitosoEvent {
    private String ordenId;
    private String transaccionId; // Un ID de la transacción de pago
}
