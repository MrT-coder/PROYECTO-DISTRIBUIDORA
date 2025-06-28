package com.distribuidora.servicio_despacho.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.MessageConverter;

@Configuration
public class RabbitMQConfig {

    // Lee el nombre del application.properties
    @Value("${rabbitmq.exchange.name}")
    private String exchangeName;
    @Value("${rabbitmq.queue.dispatch.name}")
    private String queueDispatchName;
    @Bean
    public Queue queue() {
        return new Queue(queueDispatchName);
    }

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(exchangeName);
    }

    // <- Binding para evento de Stock
    @Bean
    public Binding stockBinding(Queue queue, TopicExchange exchange,
            @Value("${rabbitmq.routing.key.stock_deducted}") String routingKey) {
        return BindingBuilder.bind(queue).to(exchange).with(routingKey);
    }

    // <- Binding para evento de Pago
    @Bean
    public Binding paymentBinding(Queue queue, TopicExchange exchange,
            @Value("${rabbitmq.routing.key.payment_successful}") String routingKey) {
        return BindingBuilder.bind(queue).to(exchange).with(routingKey);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}