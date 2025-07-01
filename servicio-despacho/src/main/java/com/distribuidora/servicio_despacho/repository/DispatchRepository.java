package com.distribuidora.servicio_despacho.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.distribuidora.servicio_despacho.model.DispatchState;

@Repository
public interface DispatchRepository extends JpaRepository<DispatchState, String> {

    DispatchState findByEstado(String estado);
}