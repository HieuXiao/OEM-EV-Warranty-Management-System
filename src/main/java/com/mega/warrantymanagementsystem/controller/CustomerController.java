package com.mega.warrantymanagementsystem.controller;

import com.mega.warrantymanagementsystem.entity.Customer;
import com.mega.warrantymanagementsystem.entity.Vehicle;
import com.mega.warrantymanagementsystem.exception.exception.ResourceNotFoundException;
import com.mega.warrantymanagementsystem.model.request.CustomerRequest;
import com.mega.warrantymanagementsystem.model.request.VehicleRequest;
import com.mega.warrantymanagementsystem.service.CustomerService;
import com.mega.warrantymanagementsystem.service.VehicleService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController//biểu thị đây là controller
@RequestMapping("/api/customer")//đường dẫn chung
@CrossOrigin//cho phép mọi nguồn truy cập
@SecurityRequirement(name = "api")
    public class CustomerController {
        @Autowired
        CustomerService customerService;

        @Autowired
        VehicleService vehicleService;

        @PostMapping("/create")
        public ResponseEntity<Customer> createCustomer(@RequestBody CustomerRequest customerRequest) {
            Customer created = customerService.createCustomer(customerRequest);
            return ResponseEntity.ok(created);
        }


        @GetMapping("/")
        public ResponseEntity<List<Customer>> getAllCustomer(){
            List<Customer> customers = customerService.getAllCustomer();
            return ResponseEntity.ok(customers);
        }

        @GetMapping("/search")
        public ResponseEntity<Customer> searchCustomer(@RequestParam("phone") String phone) {
            Customer customer = customerService.findByPhone(phone);
            if (customer == null) {
                throw new ResourceNotFoundException("Customer not found with phone: " + phone);
            }
            return ResponseEntity.ok(customer);
        }


    }
