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
    JsonObject responseJsonObject = new JsonObject();

    String action = request.getParameter("action");
    System.out.println(action);

    if (action.equals("login")) {
      System.out.println("login condition");
      String username = request.getParameter("username");
      String password = request.getParameter("password");

      try (Connection conn = dataSource.getConnection()) {
        System.out.println("username: " + username + " password: " + password);
        int option = userExists(username, password, conn);
        System.out.println("option: " + option);
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

    }
    else {
      System.out.println("no condition");
    }

    response.getWriter().write(responseJsonObject.toString());
  }

  private int userExists(String username, String password, Connection conn) throws SQLException {
    int isValidUsername = 0;
    String query = "SELECT email, password FROM customers WHERE email=?;";
    try (PreparedStatement preparedStatement = conn.prepareStatement(query)) {
      preparedStatement.setString(1, username);
      try (ResultSet resultSet = preparedStatement.executeQuery()) {
        if (resultSet.next()) {
          isValidUsername = 1;
          if (resultSet.getString("password").equals(password)) {
            return 2;
          }
        }
      }
    }
    return isValidUsername;
  }

  private int getCustomerId(String username, Connection conn) throws SQLException {
    String query = "SELECT id FROM customers WHERE email=?;";
    try (PreparedStatement preparedStatement = conn.prepareStatement(query)) {
      preparedStatement.setString(1, username);
      try (ResultSet resultSet = preparedStatement.executeQuery()) {
        resultSet.next();
        return Integer.parseInt(resultSet.getString("id"));
      }
    }
  }
}
