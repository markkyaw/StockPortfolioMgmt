package csci310.servlets;

import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.junit.Test;
import org.mockito.Mockito;

public class GraphServletTest extends Mockito {

	@Test
	public void testDoGetHttpServletRequestHttpServletResponse() throws IOException {
		HttpServletRequest request = mock(HttpServletRequest.class);
		HttpServletResponse response = mock(HttpServletResponse.class);
		GraphServlet gs = new GraphServlet();
		when(response.getWriter()).thenReturn(new PrintWriter("Yo"));
		gs.doGet(request, response);
		gs.CreateArray();
		String result = gs.GetArray();
		System.out.println(result);
		assertTrue(!result.isEmpty());
	}

}
