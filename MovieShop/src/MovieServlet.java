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

@WebServlet(name="MovieServlet", urlPatterns = "/api/movie")
public class MovieServlet  extends HttpServlet {
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
                jsonObject.addProperty("movieId", resultSet.getString("mId"));
                jsonObject.addProperty("movieTitle", resultSet.getString("mTitle"));
                jsonObject.addProperty("movieYear", resultSet.getString("mYear"));
                jsonObject.addProperty("movieDirector", resultSet.getString("mDirector"));
                jsonObject.addProperty("movieRating", resultSet.getString("mRating"));
                jsonObject.addProperty("movieGenres", resultSet.getString("mGenres"));
                jsonObject.addProperty("movieStars", resultSet.getString("mStars"));
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
        return "SELECT m.id AS mId, m.title AS mTitle, m.year AS mYear, m.director AS mDirector, r.rating AS mRating, " +
                "   GROUP_CONCAT(DISTINCT g.name) AS mGenres, " +
                "   GROUP_CONCAT(DISTINCT CONCAT(s.id, ',', s.name)) AS mStars " +
                "FROM movies m " +
                "LEFT JOIN genres_in_movies gim ON m.id = gim.movieId " +
                "LEFT JOIN genres g ON gim.genreId = g.id " +
                "LEFT JOIN stars_in_movies sim ON m.id = sim.movieId " +
                "LEFT JOIN stars s ON sim.starId = s.id " +
                "LEFT JOIN ratings r ON m.id = r.movieId " +
                "WHERE m.id = ? " +
                "GROUP BY m.id, m.title, m.year, m.director, r.rating;";
    }
}

