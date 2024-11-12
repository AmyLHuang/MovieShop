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

@WebServlet(name="MoviesListServlet", urlPatterns = "/api/movies")
public class MoviesListServlet extends HttpServlet {
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
        String action = request.getParameter("action");
        String value = request.getParameter("value");

        try (Connection conn = dataSource.getConnection()) {
            JsonArray jsonArray = new JsonArray();
            PreparedStatement statement = conn.prepareStatement(getQuery(action));

            switch(action) {
                case "browse-genre":
                    statement.setString(1, value);
                    break;
                case "browse-title":
                    statement.setString(1, value + '%');
                    statement.setString(2, value);
                    break;
                case "search":
                    StringBuilder words = new StringBuilder();
                    for (String word : value.split(" ")) {
                        words.append("+").append(word).append("* ");
                    }
                    statement.setString(1, words.toString());
                    break;
                case "advanced-search":
                    String title = request.getParameter("title");
                    String year = request.getParameter("year");
                    String director = request.getParameter("director");
                    String star = request.getParameter("star");
                    System.out.println("title: " + title + " year: " + year + " director: " + director + " star: " + star);
                    statement.setString(1, "%" + title.toLowerCase() + "%");
                    statement.setString(2, title);
                    statement.setString(3, year);
                    statement.setString(4, year);
                    statement.setString(5, "%" + director.toLowerCase() + "%");
                    statement.setString(6, director);
                    statement.setString(7, "%" + star.toLowerCase() + "%");
                    statement.setString(8, star);
                    break;
            }

            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                JsonObject jsonObject = new JsonObject();
                jsonObject.addProperty("movieId", resultSet.getString("mId"));
                jsonObject.addProperty("movieTitle", resultSet.getString("mTitle"));
                jsonObject.addProperty("movieYear", resultSet.getString("mYear"));
                jsonObject.addProperty("movieDirector", resultSet.getString("mDirector"));
                jsonObject.addProperty("movieRating", resultSet.getString("mRating"));
                jsonObject.addProperty("movieGenres", resultSet.getString("mGenres"));
                jsonObject.addProperty("movieStars", resultSet.getString("mStars"));
                jsonArray.add(jsonObject);
            }
            System.out.println(jsonArray);
            resultSet.close();
            statement.close();
            writer.write(jsonArray.toString());
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

    private String getQuery(String action) {
        String whereClause = "";
        switch (action) {
            case "browse-genre":
                whereClause = "WHERE m.id IN ( SELECT m.id FROM movies m " +
                        "LEFT JOIN genres_in_movies gim ON m.id = gim.movieId " +
                        "LEFT JOIN genres g ON gim.genreId = g.id " +
                        "WHERE g.name = ? ) ";
                break;
            case "browse-title":
                whereClause = "WHERE UPPER(m.title) LIKE ? OR (? = '*' AND NOT m.title REGEXP '^[A-Za-z0-9]') ";
                break;
            case "search":
                whereClause = "WHERE MATCH(m.title) AGAINST (? IN BOOLEAN MODE) ";
                break;
            case "advanced-search":
                whereClause = "WHERE (LOWER(m.title) LIKE ? OR ? = '') AND (CAST(m.year as char) LIKE ? OR ? = '') AND " +
                        "(LOWER(m.director) LIKE ? OR ? = '') AND (LOWER(s.name) LIKE ? OR ? = '') ";
                break;
        }

        return "SELECT m.id AS mId, m.title AS mTitle, m.year AS mYear, m.director AS mDirector, r.rating AS mRating, " +
                "   SUBSTRING_INDEX(GROUP_CONCAT(DISTINCT CONCAT(g.id, ',', g.name)), ',', 6) AS mGenres, " +
                "   SUBSTRING_INDEX(GROUP_CONCAT(DISTINCT CONCAT(s.id, ',', s.name)), ',', 6) AS mStars " +
                "FROM movies m " +
                "LEFT JOIN genres_in_movies gim ON m.id = gim.movieId " +
                "LEFT JOIN genres g ON gim.genreId = g.id " +
                "LEFT JOIN stars_in_movies sim ON m.id = sim.movieId " +
                "LEFT JOIN stars s ON sim.starId = s.id " +
                "LEFT JOIN ratings r ON m.id = r.movieId " +
                whereClause +
                "GROUP BY m.id, m.title, m.year, m.director, r.rating " +
                "ORDER BY r.rating DESC;";
    }
}

