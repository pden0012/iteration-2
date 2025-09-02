package com.example.main_tp40.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class GlobalCorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOriginPattern("*"); // 允许所有域名跨域
        config.setAllowCredentials(true); // 允许Cookie
        config.addAllowedMethod("*"); // 允许所有请求方法
        config.addAllowedHeader("*"); // 允许所有请求头
        config.setMaxAge(3600L); // 预检请求的缓存时间

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config); // 对所有路径生效
        return new CorsFilter(source);
    }
}
