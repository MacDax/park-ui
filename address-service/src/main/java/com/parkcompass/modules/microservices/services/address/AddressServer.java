package com.parkcompass.modules.microservices.services.address;

import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Import;

import com.parkcompass.modules.microservices.address.AddressConfiguration;
import com.parkcompass.modules.microservices.address.AddressRepository;

@EnableAutoConfiguration
@EnableDiscoveryClient
@Import(AddressConfiguration.class)
public class AddressServer {

	@Autowired
	protected AddressRepository addressRepository;
	
	protected Logger logger = Logger.getLogger(AddressServer.class.getName());
	public static void main(String[] args) {
		// Tell server to look for accounts-server.properties or
		// accounts-server.yml
		System.setProperty("spring.config.name", "address-server");

		SpringApplication.run(AddressServer.class, args);
	}
}
