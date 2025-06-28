package com.distribuidora.servicio_despacho.service;

import org.springframework.stereotype.Service;

import com.distribuidora.servicio_despacho.dto.OrdenListaParaEnvioEvent;
import com.distribuidora.servicio_despacho.model.DispatchState;
import com.distribuidora.servicio_despacho.repository.DispatchRepository;

import jakarta.transaction.Transactional;

@Service
public class DispatchService {
    private final DispatchRepository repository;
    private final DispatchEventProducer eventProducer;

    public DispatchService(DispatchRepository repository, DispatchEventProducer eventProducer) {
        this.repository = repository;
        this.eventProducer = eventProducer;
    }

    @Transactional
    public void handleOrderState(String ordenId, String eventType) {
        // Busca el estado de la orden o crea uno nuevo.
        DispatchState state = repository.findById(ordenId)
                .orElse(new DispatchState(ordenId, false, false, "ESPERANDO_CONFIRMACIONES"));

        // Si el estado ya está completado, no hacemos nada más para evitar duplicados.
        if ("LISTO_PARA_ENVIO".equals(state.getStatus())) {
            return;
        }

        if ("STOCK_OK".equals(eventType)) {
            state.setHasStockConfirmation(true);
        } else if ("PAGO_OK".equals(eventType)) {
            state.setHasPaymentConfirmation(true);
        }

        // VERIFICA SI AMBAS CONDICIONES SE CUMPLEN AHORA
        if (state.isHasStockConfirmation() && state.isHasPaymentConfirmation()) {
            state.setStatus("LISTO_PARA_ENVIO");
            eventProducer.sendOrdenListaParaEnvioEvent(
                new OrdenListaParaEnvioEvent(ordenId)
            );
        }

        repository.save(state); // Guarda el estado actualizado
    }
}