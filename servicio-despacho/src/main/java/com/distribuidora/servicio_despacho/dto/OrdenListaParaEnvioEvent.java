package com.distribuidora.servicio_despacho.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class OrdenListaParaEnvioEvent {
    private String ordenId;
}
