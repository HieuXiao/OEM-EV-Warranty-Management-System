package com.mega.warrantymanagementsystem.service.impl;

import com.mega.warrantymanagementsystem.entity.Account;
import com.mega.warrantymanagementsystem.entity.Customer;
import com.mega.warrantymanagementsystem.exception.exception.DuplicateResourceException;
import com.mega.warrantymanagementsystem.model.request.CustomerRequest;
import com.mega.warrantymanagementsystem.model.request.SearchCustomerRequest;
import com.mega.warrantymanagementsystem.repository.CustomerRepository;
import com.mega.warrantymanagementsystem.service.CustomerService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerServiceImpl implements CustomerService {

    @Autowired
    CustomerRepository customerRepository;

    @Autowired
    ModelMapper modelMapper;

    @Override
    public Customer findByPhone(String phone) {
        return customerRepository.findByCustomerPhone(phone);
    }

    @Override
    public Customer createCustomer(CustomerRequest customerRequest) {
        if (customerRepository.findByCustomerPhone(customerRequest.getCustomerPhone()) != null) {
            throw new DuplicateResourceException("Phone already exists!");
        }

        Customer customer = modelMapper.map(customerRequest, Customer.class);

        return customerRepository.save(customer);
    }

    @Override
    public Customer getCustomer(SearchCustomerRequest searchCustomerRequest) {
        return customerRepository.findByCustomerPhone(searchCustomerRequest.getCustomerPhone());
    }

    public List<Customer> getAllCustomer() {
        return customerRepository.findAll();
    }
}
