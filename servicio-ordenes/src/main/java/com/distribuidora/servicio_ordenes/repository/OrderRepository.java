package com.distribuidora.servicio_ordenes.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.distribuidora.servicio_ordenes.model.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    // Spring Data JPA nos da los métodos CRUD 
}