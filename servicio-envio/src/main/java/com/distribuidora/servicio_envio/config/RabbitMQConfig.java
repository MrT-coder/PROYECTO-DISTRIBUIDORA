package com.distribuidora.servicio_envio.config;

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
    @Value("${rabbitmq.queue.shipping.name}")
    private String queueShippingName;
    @Bean
    public Queue queue() {
        return new Queue(queueShippingName, true); 
    }

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(exchangeName);
    }

    @Bean
    public Binding shippingBinding(Queue queue, TopicExchange exchange,
            @Value("${rabbitmq.routing.key.dispatch_ready}") String routingKey) {
        return BindingBuilder.bind(queue).to(exchange).with(routingKey);
    }
    
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}