package com.mega.warrantymanagementsystem.service.impl;

import com.mega.warrantymanagementsystem.entity.Customer;
import com.mega.warrantymanagementsystem.entity.Vehicle;
import com.mega.warrantymanagementsystem.exception.exception.DuplicateResourceException;
import com.mega.warrantymanagementsystem.exception.exception.ResourceNotFoundException;
import com.mega.warrantymanagementsystem.model.request.VehicleRequest;
import com.mega.warrantymanagementsystem.model.response.VehicleResponse;
import com.mega.warrantymanagementsystem.repository.CustomerRepository;
import com.mega.warrantymanagementsystem.repository.VehicleRepository;
import com.mega.warrantymanagementsystem.service.VehicleService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class VehicleServiceImpl implements VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private CustomerRepository customerRepository;

    @Override
    public VehicleResponse findByVin(String vin) {
        Vehicle vehicle = vehicleRepository.findByVin(vin);
        if (vehicle == null) {
            throw new ResourceNotFoundException("Vehicle not found with VIN: " + vin);
        }
        return modelMapper.map(vehicle, VehicleResponse.class);
    }

    @Override
    public List<VehicleResponse> findByCustomerPhone(String customerPhone) {
        List<Vehicle> vehicles = vehicleRepository.findByCustomer_CustomerPhone(customerPhone);
        if (vehicles.isEmpty()) {
            throw new ResourceNotFoundException("No vehicles found for customerPhone: " + customerPhone);
        }

        List<VehicleResponse> responses = new ArrayList<>();
        for (Vehicle v : vehicles) {
            responses.add(modelMapper.map(v, VehicleResponse.class));
        }
        return responses;
    }

    @Override
    public VehicleResponse createVehicle(VehicleRequest vehicleRequest) {
        if (vehicleRepository.findByVin(vehicleRequest.getVin()) != null) {
            throw new DuplicateResourceException("Vehicle with VIN already exists!");
        }

        Customer customer = customerRepository.findByCustomerPhone(vehicleRequest.getCustomerPhone());
        if (customer == null) {
            throw new ResourceNotFoundException("Customer not found with phone: " + vehicleRequest.getCustomerPhone());
        }

        Vehicle vehicle = modelMapper.map(vehicleRequest, Vehicle.class);
        vehicle.setCustomer(customer);

        int currentYear = LocalDate.now().getYear();
        int vehicleYear = vehicleRequest.getYear();
        if(vehicleYear > currentYear){
            throw new IllegalArgumentException("Vehicle year must be less than current year: " + currentYear);
        }

        Vehicle saved = vehicleRepository.save(vehicle);
        return modelMapper.map(saved, VehicleResponse.class);
    }

    @Override
    public List<VehicleResponse> getAllVehicles() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        List<VehicleResponse> responses = new ArrayList<>();
        for (Vehicle v : vehicles) {
            responses.add(modelMapper.map(v, VehicleResponse.class));
        }
        return responses;
    }

}
