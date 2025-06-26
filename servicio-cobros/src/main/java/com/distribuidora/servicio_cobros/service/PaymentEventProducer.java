package com.distribuidora.servicio_cobros.service;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.distribuidora.servicio_cobros.dto.PagoExitosoEvent;
import com.distribuidora.servicio_cobros.dto.PagoFallidoEvent;

@Service
public class PaymentEventProducer {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.name}")
    private String exchangeName;

    @Value("${rabbitmq.routing.key.payment_successful}")
    private String routingKeyPaymentSuccessful;

    @Value("${rabbitmq.routing.key.payment_failed}")
    private String routingKeyPaymentFailed;

    public PaymentEventProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendPagoExitosoEvent(PagoExitosoEvent event) {
        rabbitTemplate.convertAndSend(exchangeName, routingKeyPaymentSuccessful, event);
    }

    public void sendPagoFallidoEvent(PagoFallidoEvent event) {
        rabbitTemplate.convertAndSend(exchangeName, routingKeyPaymentFailed, event);
    }
}
