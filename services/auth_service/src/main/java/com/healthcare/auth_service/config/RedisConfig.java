package com.healthcare.auth_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Redis Configuration
 *
 * Configures Redis for token blacklist storage:
 * - Sets up RedisTemplate for string-key, object-value pairs
 * - Uses JSON serialization for values
 * - String serialization for keys
 */
@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Use String serializer for keys (simple and readable)
        template.setKeySerializer(new StringRedisSerializer());

        // Use JSON serializer for values (supports complex objects)
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());

        // Same for hash operations (if needed)
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());

        return template;
    }
}