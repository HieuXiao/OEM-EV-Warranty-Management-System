package com.mega.warrantymanagementsystem.config;

import com.mega.warrantymanagementsystem.entity.Role;
import com.mega.warrantymanagementsystem.entity.entity.RoleName;
import com.mega.warrantymanagementsystem.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

@Component
//Nếu rỗng thì nó tự động insert tất cả RoleName enum vào DB.
public class RoleDataInitializer implements CommandLineRunner {//to initialize roles in database

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(String... args) {//this method will be executed when the application starts
        if (roleRepository.count() == 0) {//if no roles in database
            for (RoleName roleName : RoleName.values()) {//for each role in enum
                roleRepository.save(new Role(roleName, new ArrayList<>()));//save role to database
            }
            System.out.println("Initialized default roles in database.");
        }
    }
}

