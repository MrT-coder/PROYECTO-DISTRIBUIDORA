package com.distribuidora.servicio_envio.controller;

import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.distribuidora.servicio_envio.model.Shipment;
import com.distribuidora.servicio_envio.service.ShippingService;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/shipping")
public class ShippingController {

    private final ShippingService shippingService;

    public ShippingController(ShippingService shippingService) {
        this.shippingService = shippingService;
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Shipment> consultarEnvio(@PathVariable String orderId) {
        return ResponseEntity.ok(shippingService.findByOrdenId(orderId) // Asume que este método existe en el servicio
                .orElseThrow(() -> new NoSuchElementException("No se encontró envío")));
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<Shipment> actualizarEstadoManualmente(@PathVariable String orderId, @RequestBody Map<String, String> statusUpdate) {
        String newState = statusUpdate.get("status");
        return ResponseEntity.ok(shippingService.updateStatus(orderId, newState));
    }

    //Listar todos los envíos
    @GetMapping("/list")
    public ResponseEntity<?> listarEnvios(@RequestParam(required = false) String estado) {
        if (estado != null) {
            return ResponseEntity.ok(shippingService.findByEstado(estado));
        } else {
            return ResponseEntity.ok(shippingService.findAll());
        }
    }
    
}
