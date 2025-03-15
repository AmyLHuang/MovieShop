import com.google.gson.JsonArray;
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

        try (Connection conn = dataSource.getConnection()) {
            JsonArray jsonArray = new JsonArray();
            PreparedStatement statement = conn.prepareStatement(getQuery());
            statement.setString(1, request.getParameter("id"));

            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                JsonObject jsonObject = new JsonObject();
                jsonObject.addProperty("starName", resultSet.getString("name"));
                jsonObject.addProperty("starDoB", resultSet.getString("birthYear"));
                jsonObject.addProperty("movieId", resultSet.getString("movieId"));
                jsonObject.addProperty("movieTitle", resultSet.getString("title"));
                jsonObject.addProperty("movieYear", resultSet.getString("year"));
                jsonObject.addProperty("movieDirector", resultSet.getString("director"));
                jsonArray.add(jsonObject);
            }
            writer.write(jsonArray.toString());
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
        return "SELECT s.name AS name, s.birthYear AS birthYear, m.id AS movieId, " +
            "m.title AS title, m.year AS year, m.director AS director " +
            "FROM stars s " +
            "LEFT JOIN stars_in_movies sim ON s.id = sim.starId " +
            "LEFT JOIN movies m ON sim.movieId = m.id " +
            "WHERE s.id = ? " +
            "ORDER BY year DESC, title ASC;";
    }
}

