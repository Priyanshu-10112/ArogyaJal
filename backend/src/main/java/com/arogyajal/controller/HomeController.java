package com.arogyajal.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Collections;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, String> home() {
        return Collections.singletonMap("message", "Welcome to Arogyajal API. Use /api endpoints to interact with the system.");
    }
}
