package com.distribuidora.servicio_cobros.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.distribuidora.servicio_cobros.model.PaymentTransaction;
import com.distribuidora.servicio_cobros.repository.PaymentTransactionRepository;


@RestController
@RequestMapping("/api/cobros")
public class CobrosController {

    private final PaymentTransactionRepository paymentService;

    public CobrosController(PaymentTransactionRepository paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public List<PaymentTransaction> obtenerCobros() {
        return paymentService.findAll();
    }

}
