package com.distribuidora.servicio_ordenes.service;


import org.springframework.stereotype.Service;

import com.distribuidora.servicio_ordenes.dto.OrdenCreadaEvent;
import com.distribuidora.servicio_ordenes.model.Order;
import com.distribuidora.servicio_ordenes.repository.OrderRepository;

import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderEventProducer orderEventProducer;

    public OrderService(OrderRepository orderRepository, OrderEventProducer orderEventProducer) {
        this.orderRepository = orderRepository;
        this.orderEventProducer = orderEventProducer;
    }

    //Listar todas las ordenes
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    //Editar orden
    public Order updateOrder(String id, OrdenCreadaEvent orderRequest) {
        // 1. Buscar la orden por ID
        Order existingOrder = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

        // 2. Actualizar los campos necesarios
        existingOrder.setClienteId(orderRequest.getClienteId());
        existingOrder.setMontoTotal(orderRequest.getMontoTotal());
        existingOrder.setStatus("ACTUALIZADA"); // Cambiar el estado si es necesario

        // 3. Guardar la orden actualizada en la base de datos
        return orderRepository.save(existingOrder);
    }
    //Eliminar orden
    public void deleteOrder(String id) {
        orderRepository.deleteById(id);
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