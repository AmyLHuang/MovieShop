import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;

@WebFilter(filterName = "AuthenticationFilter", urlPatterns = "/*")
public class AuthenticationFilter implements Filter {
  private final ArrayList<String> allowedURIs = new ArrayList<>();

  public void init(FilterConfig fConfig) {
    allowedURIs.add("authentication.html");
    allowedURIs.add("authentication.css");
    allowedURIs.add("authentication.js");
    allowedURIs.add("api/login");
    allowedURIs.add("api/signup");
  }

  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
    HttpServletRequest httpRequest = (HttpServletRequest) request;
    HttpServletResponse httpResponse = (HttpServletResponse) response;

    // Check if this URL is allowed to access without logging in
    if (this.isUrlAllowedWithoutLogin(httpRequest.getRequestURI())) {
      // Keep default action: pass along the filter chain
      chain.doFilter(request, response);
      return;
    }

    // Redirect to auth page if the "user" attribute doesn't exist in session
    if (httpRequest.getSession().getAttribute("user") == null) {
      httpResponse.sendRedirect("authentication.html");
    } else {
      chain.doFilter(request, response);
    }
  }

  private boolean isUrlAllowedWithoutLogin(String requestURI) {
    return allowedURIs.stream().anyMatch(requestURI.toLowerCase()::endsWith);
  }

  public void destroy() {
    // ignored.
  }
}