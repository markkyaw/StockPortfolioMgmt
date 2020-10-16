package csci310;

import static org.junit.Assert.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;

import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import yahoofinance.histquotes.Interval;

public class ApiTest {
	
	private static Api api;
	private ArrayList<ArrayList<String>> smallFakeDataset;
	private ArrayList<ArrayList<String>> largeFakeDataset;
	
	@BeforeClass
	static public void apiSetup() {
		api = new Api();
	}
	
	@Before
	public void setup()
	{
		/* Set up a small dataset (fake, we might need an actual one)
		 * ["Date", "NTNX"]
		 * ["01-30-2020", "130.11"]
		 * ["02-02-2020", "133.59"]
		 */
		
		smallFakeDataset = new ArrayList<ArrayList<String>>();
		smallFakeDataset.add(new ArrayList<String>( Arrays.asList("Date", "NTNX") ));
		smallFakeDataset.add(new ArrayList<String>( Arrays.asList("01-30-2020", "130.11") ));
		smallFakeDataset.add(new ArrayList<String>( Arrays.asList("02-02-2020", "133.59") ));
		
		/* Set up a large dataset
		 * ["Date", "NTNX", "JNJ", "PORTFOLIO_1"]
		 * ["01-30-2020", "130.11", "NULL", "NULL"]
		 * ["02-02-2020", "133.59", "NULL", "6,765.94"]
	 	 * ["03-03-2020", "138.79", "91.2", "6,765.94"]
	 	 * ["04-04-2020", "139.99", "91.2", "6,765.94"]
		 */
		
		largeFakeDataset = new ArrayList<ArrayList<String>>();
		largeFakeDataset.add(new ArrayList<String>( Arrays.asList("Date", "NTNX", "JNJ", "PORTFOLIO_1") ));
		largeFakeDataset.add(new ArrayList<String>( Arrays.asList("01-30-2020", "130.11", "NULL", "NULL") ));
		largeFakeDataset.add(new ArrayList<String>( Arrays.asList("02-02-2020", "133.59", "NULL", "6,765.94") ));
		largeFakeDataset.add(new ArrayList<String>( Arrays.asList("03-03-2020", "138.79", "91.2", "6,765.94") ));
		largeFakeDataset.add(new ArrayList<String>( Arrays.asList("04-04-2020", "139.99", "91.2", "6,765.94") ));
	}

	@Test
	public void testGetCurrentPriceOf() throws IOException {
		assertTrue("incorrect current price", Api.isNumeric(Api.getCurrentPriceOf("TSLA")));
	}
	
	@Test
	public void testGetHistoricalPricesOf() throws IOException {
		String s = "TSLA@2020-01-01: 84.342003-130.600006, 84.900002->130.113998 (130.113998), "
				+ "TSLA@2020-02-01: 122.304001-193.798004, 134.738007->133.598007 (133.598007), "
				+ "TSLA@2020-03-01: 70.101997-161.395996, 142.251999->104.800003 (104.800003), ";
		assertTrue("incorrect historical price", api.getHistoricalPricesOf("TSLA").contains(s));
	}
	
	@Test
	public void testGetPriceOfStockOnSpecificDate() {
		String s = "[TSLA@2020-09-14: 373.299988-420.000000, 380.950012->419.619995 (419.619995)]";
		Calendar f = Calendar.getInstance();
		f.set(Calendar.YEAR, 2020);
		f.set(Calendar.MONTH, Calendar.SEPTEMBER);
		f.set(Calendar.DATE, 14);
		
		Calendar t = Calendar.getInstance();
		t.set(Calendar.YEAR, 2020);
		t.set(Calendar.MONTH, Calendar.SEPTEMBER);
		t.set(Calendar.DATE, 14);
		
		try {
			assertEquals("incorrect price of stock on specific date", api.getPriceOfStockOnSpecificDate("TSLA", f, t, Interval.DAILY), s);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	@Test
	public void testIsValidStock() throws IOException {
		//Nutanix stock ticker name
		boolean result = Api.isValidStock("NTNX");
		assertTrue(result);
		
		//S&P 500 (NOTE: not sure if this is the right ticker name)
		result = Api.isValidStock("SPX");
		assertFalse(result);
		
		//VMWare stock ticker name
		result = Api.isValidStock("VMW");
		assertTrue(result);
		
		//Invalid stock ticker name
		result = Api.isValidStock("INVALID");
		assertFalse(result);
		
	}
	
	@Test
	public void testDatasetToJSON() {
		//Test if we can convert the small fake dataset into JSON
		String json = Api.datasetToJSON(smallFakeDataset);
		assertEquals(json, "[[\"Date\",\"NTNX\"],[\"01-30-2020\",130.11],[\"02-02-2020\",133.59]]");
	}
	
	@Test
	public void testFetchAndParse() {
		//We have to still figure out how to validate the resulting data, maybe we can
		//just check if the number of rows returned is more than 5 and the width is 2
		ArrayList<ArrayList<String>> resultData = Api.fetchAndParse("NTNX");
		if(resultData == null) {
			System.out.println("ApiTest.java, testFetchAndParse, null");
			return;
		}
		
		boolean result = (resultData.size() > 5);
		assertTrue(result);
	}

	@Test
	public void testGetOneLineAllData() {
		//We have to still figure out how to validate the resulting data, maybe we can
		//just check if the number of rows returned is more than 5 and the width is 2
		ArrayList<ArrayList<String>> resultData = Api.getOneLineAllData("NTNX");
		if(resultData == null) {
			System.out.println("ApiTest.java, testGetOneLineAllData, null");
			return;
		}
		
		boolean result = (resultData.size() > 5);
		assertTrue(result);
	}
	
	@Test
	public void testGetMultipleLinesAllData() {
		//We have to still figure out how to validate the resulting data, maybe we can
		//just check if the number of rows returned is more than 5 and the width is stocks.size()
		ArrayList<String> stocks = new ArrayList<String>();
		stocks.add("NTNX");
		stocks.add("JNJ");
		stocks.add("PORTFOLIO_1");
		
		ArrayList<ArrayList<String>> resultData = Api.getMultipleLinesAllData(stocks);
		if(resultData == null) {
			System.out.println("ApiTest.java, testGetMultipleLinesAllData, null");
			return;
		}
		
		boolean result = (resultData.size() > 5);
		assertTrue(result);
	}
	
	@Test
	public void testGetOneLineWithDateRange() {
		ArrayList<ArrayList<String>> resultData = Api.getOneLineWithDateRange("NTNX", "01-01-2018", "01-01-2020");
		if(resultData == null) {
			System.out.println("ApiTest.java, testGetOneLineWithDateRange, null");
			return;
		}
		
		boolean result = (resultData.size() > 5);
		assertTrue(result);
	}
	
	@Test
	public void testGetMultipleLinesWithDateRange() throws IOException {
		ArrayList<String> stocks = new ArrayList<String>();
		stocks.add("NTNX");
		stocks.add("JNJ");
		stocks.add("PORTFOLIO_1");
		
		ArrayList<ArrayList<String>> resultData = Api.getMultipleLinesWithDateRange(stocks, "01-01-2018", "01-01-2020");
		if(resultData == null) {
			System.out.println("ApiTest.java, testGetMultipleLinesWithDateRange, null");
			return;
		}
		
		boolean result = (resultData.size() > 5);
		assertTrue(result);
	}

}