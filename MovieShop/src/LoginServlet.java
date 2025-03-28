import com.google.gson.JsonObject;
import org.jasypt.util.password.StrongPasswordEncryptor;
import jakarta.servlet.ServletConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

@WebServlet(name = "LoginServlet", urlPatterns = "/api/login")
public class LoginServlet extends HttpServlet {
  private DataSource dataSource;

  public void init(ServletConfig config) {
    try {
      dataSource = (DataSource) new InitialContext().lookup("java:comp/env/jdbc/moviedb");
    } catch (NamingException e) {
      e.printStackTrace();
    }
  }

  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("application/json");
    HttpSession session = request.getSession();
    String username = request.getParameter("username");
    String password = request.getParameter("password");

    JsonObject responseJsonObject = new JsonObject();

    try (Connection conn = dataSource.getConnection()) {
      int option = isValidUser(username, password, conn);
      if (option == 2) {
        request.getServletContext().log("Login successful");
        request.getSession().setAttribute("user", username);
        responseJsonObject.addProperty("status", "success");
        responseJsonObject.addProperty("message", "success");
        session.setAttribute("customerId", getCustomerId(username, conn));
      } else if (option == 1) {
        request.getServletContext().log("Login failed: password did not match");
        responseJsonObject.addProperty("status", "fail");
        responseJsonObject.addProperty("message", "Incorrect password.");
      } else if (option == 0) {
        request.getServletContext().log("Login failed: username does not exist");
        responseJsonObject.addProperty("status", "fail");
        responseJsonObject.addProperty("message", "User " + username + " does not exist.");
      }
      response.setStatus(200);
    } catch (Exception e) {
      responseJsonObject.addProperty("status", "fail");
      responseJsonObject.addProperty("message", e.getMessage());
      request.getServletContext().log(e.getMessage());
      response.setStatus(500);
    }
    response.getWriter().write(responseJsonObject.toString());
  }

  private int isValidUser(String username, String password, Connection conn) throws SQLException {
    String query = "SELECT email, password FROM customers WHERE email=?;";
    PreparedStatement preparedStatement = conn.prepareStatement(query);
    preparedStatement.setString(1, username);
    ResultSet resultSet = preparedStatement.executeQuery();
    int isValid = 0;
    if (resultSet.next()) {
      isValid = 1;
      if (resultSet.getString("password").equals(password)) {
        return 2;
      }
    }
    return isValid;
  }

  private int getCustomerId(String username, Connection conn) throws SQLException {
    String query = "SELECT id FROM customers WHERE email=?;";
    PreparedStatement preparedStatement = conn.prepareStatement(query);
    preparedStatement.setString(1, username);
    ResultSet resultSet = preparedStatement.executeQuery();
    resultSet.next();
    return Integer.parseInt(resultSet.getString("id"));
  }
}
