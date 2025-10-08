package com.mega.warrantymanagementsystem.controller;

import com.mega.warrantymanagementsystem.entity.Vehicle;
import com.mega.warrantymanagementsystem.exception.exception.ResourceNotFoundException;
import com.mega.warrantymanagementsystem.model.request.VehicleRequest;
import com.mega.warrantymanagementsystem.model.response.VehicleResponse;
import com.mega.warrantymanagementsystem.service.VehicleService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController//biểu thị đây là controller
@RequestMapping("/api/vehicle")//đường dẫn chung
@CrossOrigin//cho phép mọi nguồn truy cập
@SecurityRequirement(name = "api")
public class VehicleController {

    @Autowired
    VehicleService vehicleService;

    @PostMapping("/create")
    public ResponseEntity<VehicleResponse> createVehicle(@RequestBody @Valid VehicleRequest vehicleRequest) {
        VehicleResponse created = vehicleService.createVehicle(vehicleRequest);
        return ResponseEntity.ok(created);
    }



    @GetMapping("/{vin}")
    public ResponseEntity<VehicleResponse> getByVin(@PathVariable String vin){
        VehicleResponse vehicle = vehicleService.findByVin(vin);
        if(vehicle == null){
            throw new ResourceNotFoundException("Vehicle not found with VIN: " + vin);
        }
        return ResponseEntity.ok(vehicle);
    }

    @GetMapping("/customer/{customerPhone}")
    public ResponseEntity<List<VehicleResponse>> getVehicleByCustomer(@PathVariable String customerPhone) {
        List<VehicleResponse> vehicles = vehicleService.findByCustomerPhone(customerPhone);
        if (vehicles.isEmpty()) {
            throw new ResourceNotFoundException("No vehicles found for customerPhone: " + customerPhone);
        }
        return ResponseEntity.ok(vehicles);
    }

    @GetMapping("/")
    public ResponseEntity<List<VehicleResponse>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

}
