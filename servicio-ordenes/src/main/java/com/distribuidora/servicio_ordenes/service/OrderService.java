package com.distribuidora.servicio_ordenes.service;


import org.springframework.stereotype.Service;

import com.distribuidora.servicio_ordenes.dto.OrdenCreadaEvent;
import com.distribuidora.servicio_ordenes.model.Order;
import com.distribuidora.servicio_ordenes.repository.OrderRepository;

import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderEventProducer orderEventProducer;

    public OrderService(OrderRepository orderRepository, OrderEventProducer orderEventProducer) {
        this.orderRepository = orderRepository;
        this.orderEventProducer = orderEventProducer;
    }

    public Order createOrder(OrdenCreadaEvent orderRequest) {
        // 1. Crear y mapear la entidad Order
        Order order = new Order();
        order.setId(UUID.randomUUID().toString());
        order.setClienteId(orderRequest.getClienteId());
        order.setMontoTotal(orderRequest.getMontoTotal());
        order.setStatus("PENDIENTE"); // Estado inicial

        // 2. Guardar la orden en la base de datos
        Order savedOrder = orderRepository.save(order);

        // 3. Preparar el evento con los datos finales (incluyendo el ID generado)
        OrdenCreadaEvent eventPayload = OrdenCreadaEvent.builder()
                .ordenId(savedOrder.getId())
                .clienteId(savedOrder.getClienteId())
                .montoTotal(savedOrder.getMontoTotal())
                .productos(orderRequest.getProductos())
                .build();

        // 4. Publicar el evento en RabbitMQ
        orderEventProducer.sendOrdenCreadaEvent(eventPayload);

        return savedOrder;
    }
}