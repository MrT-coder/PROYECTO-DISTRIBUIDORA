package com.distribuidora.servicio_despacho.model;


import jakarta.persistence.Table;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor 
@Entity
@Table(name = "dispatch_states")
public class DispatchState {
    @Id
    private String ordenId;
    private boolean hasStockConfirmation = false;
    private boolean hasPaymentConfirmation = false;
    private String status; // Ej: "ESPERANDO_CONFIRMACIONES", "LISTO_PARA_ENVIO"
}
