package com.demo.webhook.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * HMAC SHA256 signature utilities for webhook verification.
 * Similar to Stripe/Razorpay webhook security.
 */
public class SignatureUtil {
    
    private static final Logger logger = LoggerFactory.getLogger(SignatureUtil.class);
    private static final String HMAC_ALGORITHM = "HmacSHA256";
    
    public static String generateSignature(String payload, String secret) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                secret.getBytes(StandardCharsets.UTF_8), 
                HMAC_ALGORITHM
            );
            mac.init(secretKeySpec);
            
            byte[] signatureBytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(signatureBytes);
            
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            logger.error("Failed to generate signature: {}", e.getMessage(), e);
            throw new RuntimeException("Signature generation failed", e);
        }
    }
    
    /**
     * Verifies signature using constant-time comparison to prevent timing attacks.
     */
    public static boolean verifySignature(String payload, String receivedSignature, String secret) {
        if (receivedSignature == null || receivedSignature.isEmpty()) {
            logger.warn("Signature verification failed: No signature provided");
            return false;
        }
        
        try {
            String expectedSignature = generateSignature(payload, secret);
            
            // Constant-time comparison prevents timing attacks
            boolean isValid = MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.UTF_8),
                receivedSignature.getBytes(StandardCharsets.UTF_8)
            );
            
            if (!isValid) {
                logger.warn("Signature verification failed: Signature mismatch");
            }
            
            return isValid;
            
        } catch (Exception e) {
            logger.error("Signature verification error: {}", e.getMessage(), e);
            return false;
        }
    }
    
    private static String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
