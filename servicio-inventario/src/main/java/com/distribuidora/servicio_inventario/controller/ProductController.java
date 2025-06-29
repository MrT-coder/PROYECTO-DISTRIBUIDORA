package com.distribuidora.servicio_inventario.controller;

import org.springframework.web.bind.annotation.*;

import com.distribuidora.servicio_inventario.model.Product;
import com.distribuidora.servicio_inventario.repository.ProductRepository;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @PostMapping("/productos")
    public Product addProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }

    @GetMapping("/productos")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
}