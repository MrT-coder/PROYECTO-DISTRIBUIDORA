package com.distribuidora.servicio_ordenes.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration 
public class RabbitMQConfig {

    // Lee el nombre del application.properties
    @Value("${rabbitmq.exchange.name}")
    private String exchangeName;

    @Bean 
    public TopicExchange exchange() {
        return new TopicExchange(exchangeName);
    }
}