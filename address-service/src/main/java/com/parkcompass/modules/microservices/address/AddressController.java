package com.parkcompass.modules.microservices.address;

import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AddressController {

	protected Logger logger = Logger.getLogger(AddressController.class.getName());
	protected AddressRepository addressRepository;

	/**
	 * Create an instance plugging in the respository of Accounts.
	 * 
	 * @param accountRepository
	 *            An account repository implementation.
	 */
	@Autowired
	public AddressController(AddressRepository addressRepository) {
		this.addressRepository = addressRepository;

		logger.info("AddressRepository says system has "
				+ addressRepository.countAddresses() + " accounts");
	}
}
