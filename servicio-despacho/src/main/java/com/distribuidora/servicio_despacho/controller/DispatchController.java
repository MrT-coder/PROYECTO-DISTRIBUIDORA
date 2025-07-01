package com.distribuidora.servicio_despacho.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.distribuidora.servicio_despacho.service.DispatchService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/dispatch")
public class DispatchController {

    private final DispatchService dispatchService;
    public DispatchController(DispatchService dispatchService) {
        this.dispatchService = dispatchService;
    }

    @GetMapping("/list")
    public ResponseEntity<?> listarEnvios(@RequestParam(required = false) String estado) {
        if (estado != null) {
            return ResponseEntity.ok(dispatchService.findByEstado(estado));
        } else {
            return ResponseEntity.ok(dispatchService.findAll());
        }
    }
    
    

  
}
