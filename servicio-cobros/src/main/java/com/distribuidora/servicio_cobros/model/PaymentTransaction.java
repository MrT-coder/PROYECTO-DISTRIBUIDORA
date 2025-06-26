package com.distribuidora.servicio_cobros.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "payment_transactions")
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // ID interno de la transacción

    private String transactionId; // ID de cara al negocio (lo generaremos)

    private String ordenId;

    private String status; // "EXITOSO" o "FALLIDO"

    private double monto;
}