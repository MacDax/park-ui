package com.parkcompass.modules.microservices.address;

import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import javax.sql.DataSource;

import org.springframework.boot.orm.jpa.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseBuilder;

@Configuration
@ComponentScan
@EntityScan("com.parkcompass.modules.microservices.address")
@EnableJpaRepositories("com.parkcompass.modules.microservices.address")
@PropertySource("classpath:db-config.properties")
public class AddressConfiguration {
	
	protected Logger logger;
	
	public AddressConfiguration() {
		logger = Logger.getLogger(getClass().getName());
	}
	
	@Bean
	public DataSource dataSource() {
		logger.info("datasource invoked");
		
		DataSource dataSource = (new EmbeddedDatabaseBuilder()).addScript("classpath:testdb/schema.sql")
				.addScript("classpath:testdb/data.sql").build();

		logger.info("dataSource = " + dataSource);

		// Sanity check
		JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
		List<Map<String, Object>> accounts = jdbcTemplate.queryForList("SELECT street FROM T_ADDRESS");
		logger.info("System has " + accounts.size() + " accounts");
		
		return dataSource;
	}
}
