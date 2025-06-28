package com.distribuidora.servicio_despacho.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.distribuidora.servicio_despacho.dto.OrdenListaParaEnvioEvent;

@Service
public class DispatchEventProducer {

    private static final Logger LOGGER = LoggerFactory.getLogger(DispatchEventProducer.class);

    @Value("${rabbitmq.exchange.name}")
    private String exchangeName;

    @Value("${rabbitmq.routing.key.dispatch_ready}")
    private String routingKeyDispatchReady;

    private final RabbitTemplate rabbitTemplate;

    public DispatchEventProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendOrdenListaParaEnvioEvent(OrdenListaParaEnvioEvent event) {
        LOGGER.info(String.format("Publicando evento OrdenListaParaEnvio -> %s", event.toString()));
        rabbitTemplate.convertAndSend(exchangeName, routingKeyDispatchReady, event);
    }
}
