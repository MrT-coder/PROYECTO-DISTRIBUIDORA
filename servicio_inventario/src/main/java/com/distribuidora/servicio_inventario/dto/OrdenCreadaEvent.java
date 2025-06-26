package com.distribuidora.servicio_inventario.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data 
@Builder // Para usar el Patrón Builder
@AllArgsConstructor // Constructor con todos los argumentos
@NoArgsConstructor // Constructor sin argumentos
public class OrdenCreadaEvent  { // Importante para la serialización

    private String ordenId;
    private String clienteId;
    private double montoTotal;
    private List<ProductoItem> productos;

    // Clase anidada para los productos dentro de la orden
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProductoItem implements Serializable {
        private String productoId;
        private int cantidad;
    }
}