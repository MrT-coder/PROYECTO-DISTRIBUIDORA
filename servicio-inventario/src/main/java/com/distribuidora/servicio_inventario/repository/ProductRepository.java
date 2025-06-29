package com.distribuidora.servicio_inventario.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.distribuidora.servicio_inventario.model.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    // Heredamos findById (que buscará por SKU), save, etc.
}