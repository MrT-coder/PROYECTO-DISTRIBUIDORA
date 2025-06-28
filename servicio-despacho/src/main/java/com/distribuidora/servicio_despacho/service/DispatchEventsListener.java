package com.distribuidora.servicio_despacho.service;



import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.distribuidora.servicio_despacho.dto.PagoExitosoEvent;
import com.distribuidora.servicio_despacho.dto.StockDescontadoEvent;

@Component
public class DispatchEventsListener {
    private static final Logger LOGGER = LoggerFactory.getLogger(DispatchEventsListener.class);
    private final DispatchService dispatchService;

    public DispatchEventsListener(DispatchService dispatchService) {
        this.dispatchService = dispatchService;
    }

    @RabbitListener(queues = "${rabbitmq.queue.dispatch.name}")
    public void onStockDescontado(StockDescontadoEvent event) {
        LOGGER.info("Evento StockDescontado recibido -> {}", event);
        dispatchService.handleOrderState(event.getOrdenId(), "STOCK_OK");
    }

    @RabbitListener(queues = "${rabbitmq.queue.dispatch.name}")
    public void onPagoExitoso(PagoExitosoEvent event) {
        LOGGER.info("Evento PagoExitoso recibido -> {}", event);
        dispatchService.handleOrderState(event.getOrdenId(), "PAGO_OK");
    }
}