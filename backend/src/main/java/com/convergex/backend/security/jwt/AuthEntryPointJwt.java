package com.convergex.backend.security.jwt;
import jakarta.servlet.*; import jakarta.servlet.http.*; import org.slf4j.*;
import org.springframework.security.core.AuthenticationException; import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component; import java.io.IOException;
@Component
public class AuthEntryPointJwt implements AuthenticationEntryPoint {
    private static final Logger logger = LoggerFactory.getLogger(AuthEntryPointJwt.class);
    @Override public void commence(HttpServletRequest req, HttpServletResponse res, AuthenticationException e) throws IOException, ServletException {
        logger.error("Unauthorized error: {}", e.getMessage()); res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error: Unauthorized"); }
}