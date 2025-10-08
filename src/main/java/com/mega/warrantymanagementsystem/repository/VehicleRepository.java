package com.mega.warrantymanagementsystem.repository;

import com.mega.warrantymanagementsystem.entity.Customer;
import com.mega.warrantymanagementsystem.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, String> {

    List<Vehicle> findByCustomer_CustomerPhone(String customerPhone);
    Vehicle findByVin(String Vin);

}
