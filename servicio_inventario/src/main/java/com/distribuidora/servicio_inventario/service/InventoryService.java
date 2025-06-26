package com.distribuidora.servicio_inventario.service;

import com.distribuidora.servicio_inventario.dto.OrdenCreadaEvent;
import com.distribuidora.servicio_inventario.dto.StockDescontadoEvent;
import com.distribuidora.servicio_inventario.model.Product;
import com.distribuidora.servicio_inventario.repository.ProductRepository;

import java.util.NoSuchElementException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class InventoryService {

    private static final Logger LOGGER = LoggerFactory.getLogger(InventoryService.class);

    private final InventoryEventProducer inventoryEventProducer;
    private final ProductRepository productRepository;

    public InventoryService(InventoryEventProducer inventoryEventProducer, ProductRepository productRepository) {
        this.inventoryEventProducer = inventoryEventProducer;
        this.productRepository = productRepository;
    }

    // Escucha el evento de creación de orden desde RabbitMQ y procesa la lógica de
    // negocio para descontar el stock de los productos involucrados en la orden.
    @RabbitListener(queues = "${rabbitmq.queue.inventory.name}")
    public void handleOrderCreatedEvent(OrdenCreadaEvent event) {
        LOGGER.info(String.format("Evento OrdenCreada recibido en Inventario -> %s", event.toString()));

        // --- LÓGICA DE NEGOCIO ---

        try {
            // Iteramos sobre cada producto en la orden recibida
            for (OrdenCreadaEvent.ProductoItem item : event.getProductos()) {
                LOGGER.info(String.format("Procesando producto: %s, Cantidad: %d", item.getProductoId(),
                        item.getCantidad()));

                // Buscamos el producto en nuestra base de datos por su SKU
                Product product = productRepository.findById(item.getProductoId())
                        .orElseThrow(() -> new NoSuchElementException(
                                "Producto no encontrado con SKU: " + item.getProductoId()));

                // Verificamos si hay stock suficiente
                if (product.getStock() < item.getCantidad()) {
                    // En un caso real, aquí publicaríamos un evento de "StockInsuficiente"
                    // y la saga de compensación se activaría. Por ahora, lanzamos una excepción.
                    throw new RuntimeException("Stock insuficiente para el producto: " + product.getSku());
                }

                // Disminuimos el stock y guardamos el cambio en la BD
                product.setStock(product.getStock() - item.getCantidad());
                productRepository.save(product);
            }

            LOGGER.info("Stock descontado exitosamente para la orden: " + event.getOrdenId());

            // --- PUBLICAR EL SIGUIENTE EVENTO EN LA SAGA ---
            StockDescontadoEvent stockDescontadoEvent = StockDescontadoEvent.builder()
                    .ordenId(event.getOrdenId())
                    .build();

            inventoryEventProducer.sendStockDescontadoEvent(stockDescontadoEvent);

        } catch (Exception e) {
            // Si algo falla (ej. producto no encontrado, stock insuficiente), lo
            // registramos.
            // La transacción de la base de datos se revertirá automáticamente gracias a
            // @Transactional.
            // Y no se publicará el evento de éxito.
            LOGGER.error(String.format("Error al procesar el inventario para la orden %s: %s", event.getOrdenId(),
                    e.getMessage()));
        }
    }
}
