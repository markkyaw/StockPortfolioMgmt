package csci310;

import java.nio.charset.StandardCharsets;
import java.security.NoSuchAlgorithmException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import com.google.common.hash.Hashing;

/**
 *	In Register.java we implement all the helper methods we need to
 *	enter a new user into our database. Including hashing passwords,
 *	validating the info entered into the form, and lastly putting the
 *	user and the SHA-256 hash of their password into the database.
 */
public class Register {

	//Check that the username and password are valid
	public static boolean validateUserInfo(String username, String password)
	{
		return true;
	}
	
	//Hash a password with SHA 256
	public static String hashPasswordWithSHA256(String password) throws NoSuchAlgorithmException
	{
		// hash password and return as hex string
		String sha256hex = Hashing.sha256()
				  .hashString(password, StandardCharsets.UTF_8)
				  .toString();
		return sha256hex;
	}
	
	//Check if user is already in database
	public static boolean checkUsernameAlreadyTaken(String username)
	{
		// connect to mysql
		try {
			Class.forName("com.mysql.cj.jdbc.Driver");
			Connection con = DriverManager.getConnection("jdbc:mysql://localhost:3306/stocks?" + 
					"useUnicode=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=false&serverTimezone=PST",
					"root",
					"password");
			// query users table for username parameter
			PreparedStatement ps = con.prepareStatement("SELECT * FROM users WHERE BINARY username = ?");
			ps.setString(1, username);
			ResultSet rs = ps.executeQuery();

			return rs.next();
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return true;
	}
	
	//Put this registration info into the database
	public static boolean stickThisInfoIntoDatabase(String username, String hashed_password)
	{
		return true;
	}
}