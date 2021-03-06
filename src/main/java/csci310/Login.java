package csci310;

import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import com.google.common.hash.Hashing;


public class Login {	
	
	//Hash a password with SHA 256
	public static String hashPasswordWithSHA256(String password)
	{
		// hash password and return as hex string
		String sha256hex = Hashing.sha256()
				  .hashString(password, StandardCharsets.UTF_8)
				  .toString();
		return sha256hex;
	}
		
	public static boolean checkForLoginCredentials(String username, String password, String class_name, String connection1, String connection2, String connection3) {
		// connect to mysql
		JDBC db = new JDBC();
		Connection con = db.connectDB(class_name, connection1, connection2, connection3);
		
		if(con != null) {
			try {
				//Hash the password so we can check for it in the database
				String hashed_password = hashPasswordWithSHA256(password);
				
				// query users table for username parameter
				PreparedStatement ps = con.prepareStatement("SELECT * FROM users WHERE username = ? AND password = ?");
				ps.setString(1, username);
				ps.setString(2, hashed_password);
				ResultSet rs = ps.executeQuery();
	
				return rs.next();
	        } catch (SQLException e) {
	        	// System.out.println("Error querying user data from DB during registration.");
	        	e.printStackTrace();
	        }
			finally {
			    if (con != null) {
			        try {
			            con.close();
			        } catch (SQLException e) { /* ignored */}
			    }
			}
		}
		
		// error querying users table; for security, assume wrong credentials
		return false;
	}
	
	

}
