package com.distribuidora.servicio_cobros.service;



import jakarta.transaction.Transactional;

import java.util.List;

import org.springframework.stereotype.Service;

import com.distribuidora.servicio_cobros.adpater.PaymentGatewayAdapter;
import com.distribuidora.servicio_cobros.dto.OrdenCreadaEvent;
import com.distribuidora.servicio_cobros.dto.PagoExitosoEvent;
import com.distribuidora.servicio_cobros.dto.PagoFallidoEvent;
import com.distribuidora.servicio_cobros.model.PaymentTransaction;
import com.distribuidora.servicio_cobros.repository.PaymentTransactionRepository;

@Service
public class PaymentService {

    private final PaymentGatewayAdapter paymentGateway;
    private final PaymentEventProducer eventProducer;
    private final PaymentTransactionRepository repository;

    public PaymentService(PaymentGatewayAdapter paymentGateway, PaymentEventProducer eventProducer, PaymentTransactionRepository repository) {
        this.paymentGateway = paymentGateway;
        this.eventProducer = eventProducer;
        this.repository = repository;
    }

    //mostrar la lista de cobros
    public List<PaymentTransaction> obtenerCobros() {
        return repository.findAll();
    }

    @Transactional
    public void procesarPago(OrdenCreadaEvent orderData) {

        boolean pagoExitoso = paymentGateway.realizarCobro(orderData.getMontoTotal());

        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setOrdenId(orderData.getOrdenId());
        transaction.setMonto(orderData.getMontoTotal());

        if (pagoExitoso) {
            transaction.setStatus("EXITOSO");
            PaymentTransaction savedTx = repository.save(transaction);
            transaction.setTransactionId("TXN-" + savedTx.getId());
            repository.save(transaction); // Guardar de nuevo con el ID de transacción

            eventProducer.sendPagoExitosoEvent(PagoExitosoEvent.builder()
                    .ordenId(orderData.getOrdenId())
                    .transaccionId(transaction.getTransactionId())
                    .build());
        } else {
            transaction.setStatus("FALLIDO");
            repository.save(transaction);

            eventProducer.sendPagoFallidoEvent(PagoFallidoEvent.builder()
                    .ordenId(orderData.getOrdenId())
                    .motivoFallo("Fondos insuficientes (simulado)")
                    .build());
        }
    }
}
