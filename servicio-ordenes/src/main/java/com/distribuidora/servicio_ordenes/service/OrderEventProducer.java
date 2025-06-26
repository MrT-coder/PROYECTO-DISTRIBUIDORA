package com.distribuidora.servicio_ordenes.service;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.distribuidora.servicio_ordenes.dto.OrdenCreadaEvent;

@Service
public class OrderEventProducer {

    private static final Logger LOGGER = LoggerFactory.getLogger(OrderEventProducer.class);

    @Value("${rabbitmq.exchange.name}")
    private String exchangeName;

    @Value("${rabbitmq.routing.key}")
    private String routingKey;

    private final RabbitTemplate rabbitTemplate;

    // Inyección de Dependencias por constructor (mejor práctica)
    public OrderEventProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendOrdenCreadaEvent(OrdenCreadaEvent event) {
        LOGGER.info(String.format("Publicando evento OrdenCreada -> %s", event.toString()));
        // Spring convierte automáticamente el objeto a JSON y lo envía
        rabbitTemplate.convertAndSend(exchangeName, routingKey, event);
    }
}