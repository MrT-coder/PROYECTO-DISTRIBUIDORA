package com.distribuidora.servicio_envio.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.distribuidora.servicio_envio.model.Shipment;

@Repository
public interface ShippingRepository extends JpaRepository<Shipment, Long> {
    Optional<Shipment> findByOrdenId(String ordenId);
    Iterable<Shipment> findByStatus(String status);
}
