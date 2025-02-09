import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;

@WebFilter(filterName = "LoginFilter", urlPatterns = "/*")
public class LoginFilter implements Filter {
  private final ArrayList<String> allowedURIs = new ArrayList<>();

  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
    HttpServletRequest httpRequest = (HttpServletRequest) request;
    HttpServletResponse httpResponse = (HttpServletResponse) response;

    // Check if this URL is allowed to access without logging in
    if (this.isUrlAllowedWithoutLogin(httpRequest.getRequestURI())) {
      // Keep default action: pass along the filter chain
      chain.doFilter(request, response);
      return;
    }

    // Redirect to login page if the "user" attribute doesn't exist in session
    if (httpRequest.getSession().getAttribute("user") == null) {
      httpResponse.sendRedirect("login.html");
    } else {
      chain.doFilter(request, response);
    }

  }

  private boolean isUrlAllowedWithoutLogin(String requestURI) {
    return allowedURIs.stream().anyMatch(requestURI.toLowerCase()::endsWith);
  }

  public void init(FilterConfig fConfig) {
    allowedURIs.add("login.html");
    allowedURIs.add("login.js");
    allowedURIs.add("api/login");
    allowedURIs.add("styles.css");
  }

  public void destroy() {
    // ignored.
  }

}