package com.distribuidora.servicio_envio.service;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.distribuidora.servicio_envio.dto.OrdenListaParaEnvioEvent;

@Component
public class ShippingEventsListener {
    private static final org.slf4j.Logger LOGGER = org.slf4j.LoggerFactory.getLogger(ShippingEventsListener.class);
    private final ShippingService shippingService;

    public ShippingEventsListener(ShippingService shippingService) {
        this.shippingService = shippingService;
    }

    @RabbitListener(queues = "${rabbitmq.queue.shipping.name}")
    public void onOrdenListaParaEnvio(OrdenListaParaEnvioEvent event) {
        LOGGER.info("Evento OrdenListaParaEnvio recibido -> {}", event);
        shippingService.createShipment(event.getOrdenId());
    }
}