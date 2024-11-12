import com.google.gson.JsonObject;
import jakarta.servlet.ServletConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

@WebServlet(name="StarServlet", urlPatterns = "/api/star")
public class StarServlet extends HttpServlet {
    private DataSource dataSource;

    public void init(ServletConfig config) {
        try {
            dataSource = (DataSource) new InitialContext().lookup("java:comp/env/jdbc/moviedb");
        } catch (NamingException e) {
            e.printStackTrace();
        }
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        PrintWriter writer = response.getWriter();
        String id = request.getParameter("id");

        try (Connection conn = dataSource.getConnection()) {
            JsonObject jsonObject = new JsonObject();
            PreparedStatement statement = conn.prepareStatement(getQuery());
            statement.setString(1, id);
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                jsonObject.addProperty("starName", resultSet.getString("sName"));
                jsonObject.addProperty("starYear", resultSet.getString("sYear"));
                jsonObject.addProperty("starMovies", resultSet.getString("sMovies"));
            }
            writer.write(jsonObject.toString());
            resultSet.close();
            statement.close();
            response.setStatus(200);
        } catch (Exception e) {
            JsonObject jsonObject = new JsonObject();
            jsonObject.addProperty("errorMessage", e.getMessage());
            writer.write(jsonObject.toString());
            request.getServletContext().log("Error:", e);
            response.setStatus(500);
        } finally {
            writer.close();
        }
    }

    private String getQuery() {
        return "SELECT s.name AS sName, s.birthYear AS sYear, " +
                "   GROUP_CONCAT(DISTINCT CONCAT(m.id, ',', m.title)) AS sMovies " +
                "FROM stars s " +
                "LEFT JOIN stars_in_movies sim ON s.id = sim.starId " +
                "LEFT JOIN movies m ON sim.movieId = m.id " +
                "WHERE s.id = ? " +
                "GROUP BY sName, sYear; ";
    }
}

