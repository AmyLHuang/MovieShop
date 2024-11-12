import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import jakarta.servlet.ServletConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@WebServlet(name="MoviesListServlet", urlPatterns = "/api/movies-list")
public class MoviesListServlet extends HttpServlet {
    private DataSource dataSource;
    private static final HashMap<String, String> viewOrdering = new HashMap<>();

    public void init(ServletConfig config) {
        try {
            dataSource = (DataSource) new InitialContext().lookup("java:comp/env/jdbc/moviedb");
        } catch (NamingException e) {
            e.printStackTrace();
        }
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        HttpSession session = request.getSession();
        populateViewOrdering();

        PrintWriter writer = response.getWriter();
        setSessionAttributes(request, session, request.getParameter("action"));
        String action = (String) session.getAttribute("action");

        try (Connection connection = dataSource.getConnection()) {
            JsonArray results = getJsonElements(session, connection, action);
            session.setAttribute("numResults", results.size());

            // Add object with important session attributes into jsonArray
            JsonObject jsonObject = new JsonObject();
            jsonObject.addProperty("value", (String) session.getAttribute("value"));
            jsonObject.addProperty("limit", (int) session.getAttribute("limit"));
            jsonObject.addProperty("offset", (int) session.getAttribute("offset"));
            jsonObject.addProperty("numResults", (int) session.getAttribute("numResults"));
            for (Map.Entry<String, String> entry : viewOrdering.entrySet()) {
                if (entry.getValue().equals(session.getAttribute("order"))) {
                    jsonObject.addProperty("order",entry.getKey());
                    break;
                }
            }
            results.add(jsonObject);

            writer.write(results.toString());
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

    private static void populateViewOrdering() {
        viewOrdering.put("TascRasc", "mTitle ASC, mRating ASC");
        viewOrdering.put("TascRdsc", "mTitle ASC, mRating DESC");
        viewOrdering.put("TdscRasc", "mTitle DESC, mRating ASC");
        viewOrdering.put("TdscRdsc", "mTitle DESC, mRating DESC");
        viewOrdering.put("RascTasc", "mRating ASC, mTitle ASC");
        viewOrdering.put("RascTdsc", "mRating ASC, mTitle DESC");
        viewOrdering.put("RdscTasc", "mRating DESC, mTitle ASC");
        viewOrdering.put("RdscTdsc", "mRating DESC, mTitle DESC");
    }

    private static void setSessionAttributes(HttpServletRequest request, HttpSession session, String action) {
        switch (action) {
            case "browseGenre":
            case "browseTitle":
            case "search":
                session.setAttribute("action", action);
                session.setAttribute("value", request.getParameter("value"));
                session.setAttribute("limit", 10);
                session.setAttribute("order", viewOrdering.get("TascRasc"));
                session.setAttribute("offset", 0);
                break;
            case "advancedSearch":
                session.setAttribute("action", action);
                session.setAttribute("value", "Advanced Search");
                session.setAttribute("title", request.getParameter("title"));
                session.setAttribute("year", request.getParameter("year"));
                session.setAttribute("director", request.getParameter("director"));
                session.setAttribute("star", request.getParameter("star"));
                session.setAttribute("limit", 10);
                session.setAttribute("order", viewOrdering.get("TascRasc"));
                session.setAttribute("offset", 0);
                break;
            case "view": {
                int limit = Integer.parseInt(request.getParameter("limit"));
                String order = viewOrdering.get(request.getParameter("order"));
                session.setAttribute("limit", limit);
                session.setAttribute("order", order);
                session.setAttribute("offset", 0);
                break;
            }
            case "next": {
                int limit = (int) session.getAttribute("limit");
                if ((int) session.getAttribute("numResults") >= limit) {
                    int offset = (int) session.getAttribute("offset");
                    offset = offset + limit;
                    session.setAttribute("offset", offset);
                }
                break;
            }
            case "prev": {
                int limit = (int) session.getAttribute("limit");
                if ((int) session.getAttribute("offset") - limit >= 0) {
                    int offset1 = (int) session.getAttribute("offset") - limit;
                    session.setAttribute("offset", offset1);
                }
                break;
            }
        }
    }

    private JsonArray getJsonElements(HttpSession session, Connection conn, String sessionAction) throws SQLException {
        JsonArray jsonArray = null;
        String order = (String) session.getAttribute("order");
        String whereClause;
        if ("browseGenre".equals(sessionAction)) {
            whereClause = "WHERE m.id IN ( SELECT m.id FROM movies m LEFT JOIN genres_in_movies gim ON m.id = gim.movieId " +
                "LEFT JOIN genres g ON gim.genreId = g.id WHERE g.name = ? ) ";
            try (PreparedStatement preparedStatement = conn.prepareStatement(getQuery(whereClause, order))) {
                preparedStatement.setString(1, (String) session.getAttribute("value"));
                preparedStatement.setInt(2, (int) session.getAttribute("limit"));
                preparedStatement.setInt(3, (int) session.getAttribute("offset"));
                try(ResultSet resultSet = preparedStatement.executeQuery()) {
                    jsonArray = getJsonArray(resultSet);
                }
            }
        } else if ("browseTitle".equals(sessionAction)) {
            whereClause = "WHERE LOWER(m.title) LIKE ? OR (? = '*' AND NOT m.title REGEXP '^[A-Za-z0-9]') ";
            try (PreparedStatement preparedStatement = conn.prepareStatement(getQuery(whereClause, order))) {
                String tempVal = (String) session.getAttribute("value");
                preparedStatement.setString(1, tempVal.toLowerCase() + "%");
                preparedStatement.setString(2, tempVal);
                preparedStatement.setInt(3, (int) session.getAttribute("limit"));
                preparedStatement.setInt(4, (int) session.getAttribute("offset"));
                try(ResultSet resultSet = preparedStatement.executeQuery()) {
                    jsonArray = getJsonArray(resultSet);
                }
            }
        } else if (sessionAction.equals("search")) {
            whereClause = "WHERE MATCH(title) AGAINST (? IN BOOLEAN MODE) ";
            try (PreparedStatement preparedStatement = conn.prepareStatement(getQuery(whereClause, order))) {
                String tempQuery = (String) session.getAttribute("value");
                StringBuilder words = new StringBuilder();
                for (String word : tempQuery.split(" ")) {
                    words.append("+").append(word).append("* ");
                }

                preparedStatement.setString(1, words.toString());
                preparedStatement.setInt(2, (int) session.getAttribute("limit"));
                preparedStatement.setInt(3, (int) session.getAttribute("offset"));
                try (ResultSet resultSet = preparedStatement.executeQuery()) {
                    jsonArray = getJsonArray(resultSet);
                }
            }
        } else if (sessionAction.equals("advancedSearch")) {
            whereClause = "WHERE (LOWER(m.title) LIKE ? OR ? = '') AND (CAST(m.year as char) LIKE ? OR ? = '') AND " +
                "(LOWER(m.director) LIKE ? OR ? = '') AND (LOWER(s.name) LIKE ? OR ? = '') ";
            try (PreparedStatement preparedStatement = conn.prepareStatement(getQuery(whereClause, order))) {
                String tempTitle = (String) session.getAttribute("title");
                String tempYear = (String) session.getAttribute("year");
                String tempDirector = (String) session.getAttribute("director");
                String tempStar = (String) session.getAttribute("star");
                preparedStatement.setString(1, "%" + tempTitle.toLowerCase() + "%");
                preparedStatement.setString(2, tempTitle);
                preparedStatement.setString(3, tempYear);
                preparedStatement.setString(4, tempYear);
                preparedStatement.setString(5, "%" + tempDirector.toLowerCase() + "%");
                preparedStatement.setString(6, tempDirector);
                preparedStatement.setString(7, "%" + tempStar.toLowerCase() + "%");
                preparedStatement.setString(8, tempStar);
                preparedStatement.setInt(9, (int) session.getAttribute("limit"));
                preparedStatement.setInt(10, (int) session.getAttribute("offset"));
                try(ResultSet resultSet = preparedStatement.executeQuery()) {
                    jsonArray = getJsonArray(resultSet);
                }
            }
        }
        return jsonArray;
    }

    private String getQuery(String whereClause, String order) {
        return "SELECT m.id AS mId, m.title AS mTitle, m.year AS mYear, m.director AS mDirector, r.rating AS mRating, " +
            "GROUP_CONCAT(DISTINCT g.name ORDER BY g.name ASC) AS mGenres, " +
            "GROUP_CONCAT(DISTINCT s.name ORDER BY stars_in_movies_count DESC, s.name ASC) AS mStars, " +
            "GROUP_CONCAT(DISTINCT s.id ORDER BY stars_in_movies_count DESC, s.name ASC) AS mStarsId " +
            "FROM movies m " +
            "LEFT JOIN genres_in_movies gim ON m.id = gim.movieId " +
            "LEFT JOIN genres g ON gim.genreId = g.id " +
            "LEFT JOIN stars_in_movies sim ON m.id = sim.movieId " +
            "LEFT JOIN stars s ON sim.starId = s.id " +
            "LEFT JOIN ratings r ON m.id = r.movieId " +
            "LEFT JOIN " +
            "   (SELECT s.id AS starId, COUNT(sim.movieId) AS stars_in_movies_count" +
            "   FROM stars s LEFT JOIN stars_in_movies sim ON s.id = sim.starId" +
            "   GROUP BY s.id) " +
            "   smc ON s.id = smc.starId " +
            whereClause +
            "GROUP BY m.id, m.title, m.year, m.director, r.rating " +
            "ORDER BY " + order + " " +
            "LIMIT ? OFFSET ?;";
    }

    private static JsonArray getJsonArray(ResultSet resultSet) throws SQLException {
        JsonArray jsonArray = new JsonArray();
        try {
            while (resultSet.next()) {
                JsonObject jsonObject = new JsonObject();
                jsonObject.addProperty("movieId", resultSet.getString("mId"));
                jsonObject.addProperty("movieTitle", resultSet.getString("mTitle"));
                jsonObject.addProperty("movieYear", resultSet.getString("mYear"));
                jsonObject.addProperty("movieDirector", resultSet.getString("mDirector"));
                jsonObject.addProperty("movieRating", resultSet.getString("mRating"));
                jsonObject.addProperty("movieGenres", resultSet.getString("mGenres"));
                jsonObject.addProperty("movieStars", resultSet.getString("mStars"));
                jsonObject.addProperty("movieStarsId", resultSet.getString("mStarsId"));
                jsonArray.add(jsonObject);
            }
        } catch (SQLException e) {
            System.out.println("Error while processing ResultSet: " + e.getMessage());
            throw e;
        }
        return jsonArray;
    }
}

