package com.distribuidora.servicio_ordenes.controller;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.distribuidora.servicio_ordenes.dto.OrdenCreadaEvent;
import com.distribuidora.servicio_ordenes.model.Order;
import com.distribuidora.servicio_ordenes.service.OrderService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

   
     @Operation(summary = "Crear una nueva orden",
               description = "Recibe los datos de una orden, la persiste en la base de datos y publica un evento 'OrdenCreada' para iniciar la saga.")
    @ApiResponse(responseCode = "201", description = "Orden creada exitosamente")
    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody OrdenCreadaEvent orderRequest) {
        Order nuevaOrden = orderService.createOrder(orderRequest);
        return new ResponseEntity<>(nuevaOrden, HttpStatus.CREATED);
    }
}