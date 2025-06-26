package com.distribuidora.servicio_ordenes.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data // Para generar getters, setters automáticamente.
@NoArgsConstructor // Constructor sin argumentos
@AllArgsConstructor // Constructor con todos los argumentos
@Entity
@Table(name = "orders") 
public class Order {

    @Id
    private String id; // Usaremos un UUID como String para la clave primaria

    private String clienteId;

    private double montoTotal;

    private String status; 
}