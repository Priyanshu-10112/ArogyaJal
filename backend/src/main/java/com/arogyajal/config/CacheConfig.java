package com.arogyajal.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
            "sensors",
            "sensorReadings",
            "alerts",
            "symptoms",
            "clusters",
            "dashboard"
        );
        
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .expireAfterWrite(30, TimeUnit.SECONDS)  // Cache for 30 seconds only
            .maximumSize(1000)                       // Max 1000 entries per cache
            .recordStats());                         // Enable cache statistics
        
        return cacheManager;
    }
}
