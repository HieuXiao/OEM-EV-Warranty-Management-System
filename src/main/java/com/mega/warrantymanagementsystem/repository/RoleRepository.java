package com.mega.warrantymanagementsystem.repository;

import com.mega.warrantymanagementsystem.entity.Role;
import com.mega.warrantymanagementsystem.entity.entity.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, RoleName> {
}
