package com.medhelp.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "application.security.jwt")
public class JwtConfigProperties {
    
    private long accessTokenExpiration;
    private long refreshTokenExpiration;
    private Rsa rsa = new Rsa();
    
    @Data
    public static class Rsa {
        private String privateKey;
        private String publicKey;
    }
}
