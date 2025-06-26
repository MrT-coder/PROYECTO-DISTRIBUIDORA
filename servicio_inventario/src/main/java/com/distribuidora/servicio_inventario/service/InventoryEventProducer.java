package com.distribuidora.servicio_inventario.service;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.distribuidora.servicio_inventario.dto.StockDescontadoEvent;

@Service
public class InventoryEventProducer {

    private static final Logger LOGGER = LoggerFactory.getLogger(InventoryEventProducer.class);

    @Value("${rabbitmq.exchange.name}")
    private String exchangeName;

    // Usamos la nueva routing key que acabamos de definir
    @Value("${rabbitmq.routing.key.stock_deducted}")
    private String stockDeductedRoutingKey;

    private final RabbitTemplate rabbitTemplate;

    public InventoryEventProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendStockDescontadoEvent(StockDescontadoEvent event) {
        LOGGER.info(String.format("Publicando evento StockDescontado -> %s", event.toString()));
        rabbitTemplate.convertAndSend(exchangeName, stockDeductedRoutingKey, event);
    }
}