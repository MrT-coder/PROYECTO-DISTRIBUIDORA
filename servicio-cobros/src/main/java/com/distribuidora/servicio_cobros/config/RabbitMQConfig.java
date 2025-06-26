package com.distribuidora.servicio_cobros.config;


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
    @Value("${rabbitmq.queue.payments.name}")
    private String queuePaymentsName;
    @Value("${rabbitmq.routing.key.order_created}")
    private String routingKeyOrderCreated;

    @Bean
    public Queue queue() {
        return new Queue(queuePaymentsName);
    }

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(exchangeName);
    }

    /*
     * Binding entre la cola y el exchange con la clave de enrutamiento
     * Esto permite que el servicio de inventario reciba notificaciones sobre la
     * creación de órdenes
     * y pueda realizar las acciones necesarias, como actualizar el inventario.
     * La clave de enrutamiento es una forma de filtrar los mensajes que se envían a
     * la cola.
     * En este caso, cuando se envía un mensaje al exchange con la clave de
     * enrutamiento "order.created",
     * el mensaje se enviará a la cola "inventory.queue".
     * Esto permite que el servicio de inventario reciba notificaciones sobre la
     * creación de órdenes
     * y pueda realizar las acciones necesarias, como actualizar el inventario.
     * La clave de enrutamiento es una forma de filtrar los mensajes que se envían a
     * la cola.
     * En este caso, cuando se envía un mensaje al exchange con la clave de
     * enrutamiento "order.created",
     * el mensaje se enviará a la cola "inventory.queue".
     * Esto permite que el servicio de inventario reciba notificaciones sobre la
     * creación de órdenes
     * y pueda realizar las acciones necesarias, como actualizar el inventario.
     */
    @Bean
    public Binding binding() {
        return BindingBuilder
                .bind(queue())
                .to(exchange())
                .with(routingKeyOrderCreated);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}