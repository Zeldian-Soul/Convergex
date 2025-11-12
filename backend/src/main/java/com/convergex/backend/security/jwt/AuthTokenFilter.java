package com.convergex.backend.security.jwt;

import com.convergex.backend.security.services.UserDetailsServiceImpl;
import jakarta.annotation.Nonnull; // Import for @Nonnull
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

public class AuthTokenFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Override
    protected void doFilterInternal(
            @Nonnull HttpServletRequest request,
            @Nonnull HttpServletResponse response,
            @Nonnull FilterChain filterChain
    ) throws ServletException, IOException {

        String jwt = null; // Initialize jwt
        try {
            jwt = parseJwt(request);
            // --- ADDED LOGGING ---
            if (jwt != null) {
                logger.info("AuthTokenFilter: Received token: [{}]", jwt); // Log the token itself
                boolean isValid = jwtUtils.validateJwtToken(jwt);
                logger.info("AuthTokenFilter: Token validation result: {}", isValid); // Log validation result
                // --- END LOGGING ---

                if (isValid) {
                    String email = jwtUtils.getEmailFromJwtToken(jwt);
                    logger.info("AuthTokenFilter: Attempting to load user for email from token: [{}]", email);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    logger.info("AuthTokenFilter: User {} authenticated successfully.", email); // Log success
                } else {
                     logger.warn("AuthTokenFilter: Invalid JWT token received."); // Log invalid token explicitly
                }
            } else {
                 // Optionally log requests without tokens if needed for debugging
                 // logger.info("AuthTokenFilter: No JWT token found in Authorization header for {}", request.getRequestURI());
            }
        } catch (Exception e) {
            // Log the exception AND the token if available
            // Added stack trace logging for more detail
            logger.error("AuthTokenFilter: Cannot set user authentication. Token was [{}]. Error: {}", jwt, e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
}