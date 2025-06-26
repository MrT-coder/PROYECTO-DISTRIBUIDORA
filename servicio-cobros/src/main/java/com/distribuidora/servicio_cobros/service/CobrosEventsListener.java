package com.distribuidora.servicio_cobros.service;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.distribuidora.servicio_cobros.dto.OrdenCreadaEvent;

@Component
public class CobrosEventsListener {

    private static final Logger LOGGER = LoggerFactory.getLogger(CobrosEventsListener.class);
    private final PaymentService paymentService;

    public CobrosEventsListener(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @RabbitListener(queues = "${rabbitmq.queue.payments.name}")
    public void onOrdenCreada(OrdenCreadaEvent event) {
        LOGGER.info("Evento OrdenCreada recibido en Listener de Cobros -> {}", event);
        paymentService.procesarPago(event);
    }
}