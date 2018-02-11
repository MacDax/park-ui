package com.parkcompass.modules.microservices.services.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Home page controller.
 *
 */
@Controller
public class HomeController {

	@RequestMapping("/")
	public String home() {
		return "index";
	}

	@RequestMapping("/parkit")
	public String sweepschedule() {
		return "sweepschedule";
	}
	
	
	
	
	
}
