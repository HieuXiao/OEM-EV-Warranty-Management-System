package com.mega.warrantymanagementsystem;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@OpenAPIDefinition(info = @Info(title = "Warranty Management System API", version = "1.0", description = "API for managing warranty claims and product information"))//cấu hình swagger
@SecurityScheme(name = "api", scheme = "bearer", type = SecuritySchemeType.HTTP, in = SecuritySchemeIn.HEADER)//cấu hình bảo mật cho swagger
public class WarrantyManagementSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(WarrantyManagementSystemApplication.class, args);
	}

}
