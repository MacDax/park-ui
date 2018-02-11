package com.parkcompass.modules.microservices.address;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;;

public interface AddressRepository extends CrudRepository<Address, Long> {

	public List<Address> findByStreetContainingIgnoreCase(String partialStreet);
	public Address save(Address address);
	
	@Query("SELECT count(*) from Address")
	public int countAddresses();
} 
