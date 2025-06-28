package com.distribuidora.servicio_envio.service;

import java.util.NoSuchElementException;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.distribuidora.servicio_envio.model.Shipment;
import com.distribuidora.servicio_envio.repository.ShippingRepository;

import jakarta.transaction.Transactional;

@Service
public class ShippingService {
    private final ShippingRepository repository;

    public ShippingService(ShippingRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void createShipment(String ordenId) {
        // Idempotencia: Verificar si ya existe un envío para esta orden
        if (repository.findByOrdenId(ordenId).isEmpty()) {
            Shipment shipment = new Shipment();
            shipment.setOrdenId(ordenId);
            shipment.setStatus("EN_PREPARACION"); // Estado inicial
            repository.save(shipment);
        }
    }

    @Transactional
    public Shipment updateStatus(String ordenId, String newStatus) {
        Shipment shipment = repository.findByOrdenId(ordenId)
                .orElseThrow(() -> new NoSuchElementException("No se encontró envío para la orden: " + ordenId));
        shipment.setStatus(newStatus);
        // Aquí se podría añadir un número de tracking si el estado es "ENVIADO"
        if ("ENVIADO".equals(newStatus)) {
            shipment.setTrackingNumber("TRACK-" + ordenId); // Generación simple de número de tracking
        }
        return repository.save(shipment);
    }

    public Optional<Shipment> findByOrdenId(String ordenId) {
        return repository.findByOrdenId(ordenId);
    }
}
