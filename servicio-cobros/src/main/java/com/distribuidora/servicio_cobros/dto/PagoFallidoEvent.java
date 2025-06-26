package com.distribuidora.servicio_cobros.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class PagoFallidoEvent {
    private String ordenId;
    private String motivoFallo;
}
