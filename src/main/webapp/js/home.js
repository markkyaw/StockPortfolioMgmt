google.charts.load("current", { packages: ["corechart"] });
google.charts.setOnLoadCallback(drawMainChart);
google.charts.setOnLoadCallback(refreshGraph);
window.setTimeout(timeout, 120000);

var jsonArray = [
  ["Year", "Example Stock"],
  ["2004", 1000],
  ["2005", 1170],
  ["2006", 660],
  ["2007", 1030],
];

//Explanation: the graph has a bunch of things going on. There's toggles that are on,
//toggles that are off. A certain start/end date that might have been selected. Maybe
//a few external stock lines that we need to display.
//At this point, let's say the user turns on the toggle for "NTNX", we want to send a
//request to GraphServlet saying "gimme all the stuff I had before and also take into
//account this NTNX toggle". The state of the graph which is tracked by the variables
//below is the "all the stuff I had before" piece. When "NTNX" is toggled on, you
//add it to the state_portfolioContributors array and then call refreshGraph().
//refreshGraph() will take the whole current state and magically fetch the right
//data for the graph.

//These are the state variables which affect the graph, setting default values
state_portfolioContributors = ["NTNX", "JNJ", "FB"];
state_externalStocks = ["NTNX"];
state_start = "-1";
state_end = "-1";
state_portfolioValue = "$0";
state_percentChange = "0.0%";
state_portfolioListToDisplay = ["NTNX"];

//Calling this function will take the "state" and pass it to GraphServlet as your request
function refreshGraph() {
  if (state_start === "-1") {
    //Referenced from: https://stackoverflow.com/questions/12409299/how-to-get-current-formatted-date-dd-mm-yyyy-in-javascript-and-append-it-to-an-i
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    let dateObj = new Date();
    let month = dateObj.getMonth() + 1;
    month = month - 3;
    if (month <= 0) {
      month = month + 12;
    }

    let day = String(dateObj.getDate()).padStart(2, "0");
    let year = dateObj.getFullYear();
    let opt = "";
    if (month < 10) {
      opt = "0";
    }
    let output = year + "-" + opt + month + "-" + day;
    // state_start = output;

    month = dateObj.getMonth() + 1;
    day = String(dateObj.getDate()).padStart(2, "0");
    year = dateObj.getFullYear();
    opt = "";
    if (month < 10) {
      opt = "0";
    }
    output = year + "-" + opt + month + "-" + day;
    state_end = output;
  }

  state_portfolioContributors_asAString = "";
  state_externalStocks_asAString = "";

  //Turn portfolio contributors from an array into a string
  var i = 0;
  for (i = 0; i < state_portfolioContributors.length; i++) {
    state_portfolioContributors_asAString +=
      state_portfolioContributors[i] + ",";
  }

  //Turn external stocks from an array into a string
  var j = 0;
  for (j = 0; j < state_externalStocks.length; j++) {
    state_externalStocks_asAString += state_externalStocks[j] + ",";
  }


  //Send the state as part of the request to GraphServlet
  $.ajax({
    url: "GraphServlet",
    type: "GET",
    data: {
      startDate: state_start,
      endDate: state_end,
      portfolioContributors: state_portfolioContributors_asAString,
      externalStocks: state_externalStocks_asAString,
    },

    success: function (result) {
      jsonArray = eval(result);

      for (let i = 1; i < jsonArray.length; ++i) {
        for (let j = 1; j < jsonArray[i].length; ++j) {
          if (jsonArray[i][j] === "null") {
            jsonArray[i][j] = null;
          } else {
            jsonArray[i][j] = parseInt(jsonArray[i][j]);
          }
        }
      }

      $("#graphservlet-error").text(""); // clear any existing error messages

      drawMainChart();
      getMyCurrentPortfolioValue();
      getPortfolioListAsAnArray();
      updateExternalStockList();
    },

    error: function (result) {
      $("#graphservlet-error").text(result.responseText);
    }
  });
  return false;
}

//These 8 functions should handle most of the work

//#1: Add to portfolio contributors
function addPortfolioContributor(stock) {
  state_portfolioContributors.push(stock);
  refreshGraph();
}

//#2: Remove from portfolio contributors
function removePortfolioContributor(stock) {

  //Find that portfolio contributor
  var pos = 0;
  var toRemoveIndex = -1;
  for (pos = 0; pos < state_portfolioContributors.length; pos++) {
    if (stock === state_portfolioContributors[pos]) {
      toRemoveIndex = pos;
    }
  }

  //Remove that portfolio contributor
  if (toRemoveIndex != -1) {
    state_portfolioContributors.splice(toRemoveIndex, 1);
  }

  refreshGraph();
}

//#3: Add an external stock
function addExternalStock(stock) {
  state_externalStocks.push(stock);
  refreshGraph();
}

//#4: Remove an external stock
function removeExternalStock(stock) {

  //Find that external stock in our list
  var pos = 0;
  var toRemoveIndex = -1;
  for (pos = 0; pos < state_externalStocks.length; pos++) {
    if (stock === state_externalStocks[pos]) {
      toRemoveIndex = pos;
    }
  }

  //Remove that external stock
  if (toRemoveIndex != -1) {
    state_externalStocks.splice(toRemoveIndex, 1);
  }

  refreshGraph();
}

//#5: Change the start date
function changeStartDate(newDate) {
  state_start = newDate;
}

//#6: Change the end date
function changeEndDate(newDate) {
  state_end = newDate;
}

//#7: Add S&P 500 to external stocks
function turnSpOn() {
  addExternalStock("^GSPC");
}

//#8: Remove S&P 500 from external stocks
function turnSpOff() {
  removeExternalStock("^GSPC");
}

//Left side panel (Portfolio related add/remove/upload)


//Check if a stock is valid
function isValidStock(stock) {

	var validStock = "EMPTY STRING";

	//First, call PortfolioServlet with type="isValidStock"
  $.ajax({
    url: "PortfolioServlet",
    type: "POST",
    async: false,
    data: {
      type: "isValidStock",
      stock: stock,
    },

    success: function (result) {
      validStock = result;
      
    },
  });
  
  return validStock;
}

//Retrieve my portfolio list so we can display it
function getPortfolioListAsAnArray() {
  //First, call PortfolioServlet with type="getPortfolioList"
  $.ajax({
    url: "PortfolioServlet",
    type: "POST",
    data: {
      type: "getPortfolioList",
    },

    success: function (result) {
      var portfolioListAsString = result;

      state_portfolioListToDisplay = portfolioListAsString.split(",");
    },
  });
}

function addToPortfolio(stock, quantity, dateOfPurchase, dateOfSelling) {
  //First, call the PortfolioServlet
  $.ajax({
    url: "PortfolioServlet",
    type: "POST",
    data: {
      type: "add",
      stock: stock,
      quantity: quantity,
      purchaseDate: dateOfPurchase,
      sellDate: dateOfSelling,
    },

    success: function (result) {

      //Next, add to portfolio contributors
      addPortfolioContributor(stock);

      //Fetch the new list to display
      getPortfolioListAsAnArray();

      //Update the portfolio value and percent
      getMyCurrentPortfolioValue();
    },
  });
}

//Call this with the red 'X'
function removeFromPortfolio(stock) {
  //First, call the PortfolioServlet
  $.ajax({
    url: "PortfolioServlet",
    type: "POST",
    data: {
      type: "remove",
      stock: stock,
    },

    success: function (result) {

      //Next, remove from portfolio contributors
      removePortfolioContributor(stock);

      //Fetch the new list to display
      getPortfolioListAsAnArray();

      //Update the portfolio value and percent
      getMyCurrentPortfolioValue();
    },
  });
}

//Read the CSV file
//Referenced from: https://stackoverflow.com/questions/7431268/how-to-read-data-from-csv-file-using-javascript
function readFile(file) {
  var fileData = file.split(/\r\n|\n/);
  var lines = [];
  var i = 1;

  //Skip the headers
  for (i = 1; i < fileData.length; i++) {
    //Get one line of data
    var data = fileData[i].split(",");

    //There should only be 4 entries
    if (data.length == 4) {
      var oneRow = [];
      var j = 0;

      for (j = 0; j < 4; j++) {
        oneRow.push(data[j]);
      }
      lines.push(oneRow);
    }
  }
}

//Get the portfolio value to display on the webpage
function getMyCurrentPortfolioValue() {
  //First, call PortfolioServlet with type="getPortfolioValue"
  $.ajax({
    url: "PortfolioServlet",
    type: "POST",
    data: {
      type: "getPortfolioValue",
    },

    success: function (result) {
      var value = result;
      state_portfolioValue = value;

      $.ajax({
        url: "PortfolioServlet",
        type: "POST",
        data: {
          type: "getPercentChange",
        },

        success: function (result) {
          var per = result;
          state_percentChange = per;
          updatePortfolioStockList();
        },
      });
    },
  });
}

//Security Feature X: Session timeout after 2 mins
function timeout() {

  //Referenced from: https://www.w3schools.com/js/tryit.asp?filename=tryjs_confirm
  var txt;
  if (
    confirm(
      "If you want to continue your session press OK. If you want to end it press Cancel!"
    )
  ) {
    txt = "You pressed OK!";
  } else {
    txt = "You pressed Cancel!";
  }

  if (txt === "You pressed OK!") {
    window.setTimeout(timeout, 120000);
    return;
  } else {
    //Call "LogoutServlet"
    $.ajax({
      url: "/LogoutServlet",
      type: "POST",

      success: function (data) {
        window.location.replace("../");
      },
    });
  }
}

//Security Feature X: user must be logged in to see home.html
//Referenced from: http://jsfiddle.net/MwKpP/2/
function getCookie(name) {
  var value = document.cookie;
  start = value.indexOf(name + "=");

  if (start == -1) {
    start = value.indexOf(name + "=");
    value = null;
  } else {
    start = value.indexOf("=", start) + 1;

    var end = value.indexOf(";", start);

    if (end == -1) {
      end = value.length;
    }

    value = unescape(value.substring(start, end));
  }

  return value;
}

$(document).ready(function () {
  var cookie = getCookie("user_id");
  if (!cookie) {
    window.location.replace("../");
  }
});

function drawMainChart() {
  var data = google.visualization.arrayToDataTable(jsonArray);

  var options = {
    title: "Stock Performance",
    curveType: "function",
    legend: { position: "bottom" },
    interpolateNulls: true,
    explorer: { actions: ['dragToZoom', 'rightClickToReset'] }
  };

  var chart = new google.visualization.LineChart(
    document.getElementById("main-chart")
  );

  chart.draw(data, options);

  // Used to make chart responsive
  $(document).ready(function () {
    $(window).resize(function () {
      drawMainChart();
    });
  });
}

function drawStockHistoryChart() {
  var data = google.visualization.arrayToDataTable(jsonArray);

  var options = {
    title: "Company Performance",
    curveType: "function",
    legend: { position: "bottom" },
  };

  var chart = new google.visualization.LineChart(
    document.getElementById("stock-history-chart")
  );

  chart.draw(data, options);

  // Used to make chart responsive
  $(document).ready(function () {
    $(window).resize(function () {
      draStockHistoryChart();
    });
  });
}

function submitForm(e) {
  //Read the form input for the calendar: from date and to date
  var startDate = document.getElementById("fromDate").value;
  var endDate = document.getElementById("toDate").value;

  //Update state and refresh graph
  changeStartDate(startDate);
  changeEndDate(endDate);
  refreshGraph();
  return false;
}

function externalStockConfirmation(){
  $("#confirmation-alert-source").text("external stocks");
  $("#confirmation-alert").removeClass("d-none");
  $("#confirmation-alert").addClass("show");
  $("#add-external-stock-name-input").removeClass("red-border");  
}

function modal(){
  $("#mainModal").modal({
    backdrop: true,
    keyboard: true,
    focus: true,
    show: true,
  });
}

$("#add-stock-button").on("click", function () {
  $(".modal-title").html("Add Stock Transaction");
  $("#modal-confirm-button").html("Confirm");
  $("#add-modal-content").attr("class", "display-block");
  $("#upload-file-modal-content").attr("class", "display-none");
  $("#add-external-stock-modal-content").attr("class", "display-none");
  $("#remove-external-stock-modal-content").attr("class", "display-none");

  $("#modal-confirm-button").data("type", "addStock");

  modal();
});

$("#upload-file-button").on("click", function () {
  $(".modal-title").html("Upload File");
  $("#modal-confirm-button").html("Upload");
  $("#add-modal-content").attr("class", "display-none");
  $("#upload-file-modal-content").attr("class", "display-block");
  $("#add-external-stock-modal-content").attr("class", "display-none");
  $("#remove-external-stock-modal-content").attr("class", "display-none");

  $("#modal-confirm-button").data("type", "uploadFile");

  modal();
});

$("#add-external-stock-button").on("click", function () {
  $(".modal-title").html("Add External Stock");
  $("#modal-confirm-button").html("View Stock");
  $("#add-modal-content").attr("class", "display-none");
  $("#upload-file-modal-content").attr("class", "display-none");
  $("#add-external-stock-modal-content").attr("class", "display-block");
  $("#remove-external-stock-modal-content").attr("class", "display-none");

  $("#modal-confirm-button").data("type", "addExternal");

  modal();
});

$("#remove-external-stock-button").on("click", function () {
  $(".modal-title").html("Remove External Stock");
  $("#modal-confirm-button").html("Remove Stock");
  $("#add-modal-content").attr("class", "display-none");
  $("#upload-file-modal-content").attr("class", "display-none");
  $("#add-external-stock-modal-content").attr("class", "display-none");
  $("#remove-external-stock-modal-content").attr("class", "display-block");

  $("#modal-confirm-button").data("type", "removeExternal");

  modal();
});

$("#modal-confirm-button").on("click", function () {
  if ($(this).data("type") === "addStock") {
    var stock = $("#stock-name-input").val();
    var quantity = $("#stock-quantity-input").val();
    var dateOfPurchase = $("#stock-purchase-date-input").val();
    var dateOfSelling = $("#stock-sell-date-input").val();
    
    var validInput = true;
    
    var isThisAValidStock = isValidStock(stock);
    if(isThisAValidStock === "BAD" || stock.length === 0) {
  		$("#stock-name-input").addClass("red-border");
  		validInput = false;
  	} else {
  		$("#stock-name-input").removeClass("red-border");
  	}
    
    if (parseInt(quantity) < 1 || quantity.length === 0) {
    	$("#stock-quantity-input").addClass("red-border");
    	validInput = false;
    } else {
  		$("#stock-quantity-input").removeClass("red-border");
  	}
    
    if (dateOfPurchase.length === 0) {
    	$("#stock-purchase-date-input").addClass("red-border");
    	validInput = false;
    } else {
    	$("#stock-purchase-date-input").removeClass("red-border");
    }
    
    if (dateOfSelling.length === 0) {
    	$("#stock-sell-date-input").addClass("red-border");
    	validInput = false;
    } else {
    	$("#stock-sell-date-input").removeClass("red-border");
    }
    
    if (dateOfPurchase > dateOfSelling) {
    	$("#stock-purchase-date-input").addClass("red-border");
    	$("#stock-sell-date-input").addClass("red-border");
    	validInput = false;
    } else {
  		$("#stock-purchase-date-input").removeClass("red-border");
  		$("#stock-sell-date-input").removeClass("red-border");
  	}
    
    if (validInput === true) {
    	addToPortfolio(stock, quantity, dateOfPurchase, dateOfSelling);
	    $("#confirmation-alert-stock-name").text(stock);
	    $("#confirmation-alert-add-remove").text("added");
	    $("#confirmation-alert-source").text("portfolio");
	    $("#confirmation-alert").removeClass("d-none");
	    $("#confirmation-alert").addClass("show");
	    $("#stock-name-input").removeClass("red-border");
	    $("#stock-quantity-input").removeClass("red-border");
	    $("#stock-purchase-date-input").removeClass("red-border");
	    $("#stock-sell-date-input").removeClass("red-border");
    } else {
    	$("#error-alert").removeClass("d-none");
    	$("#error-alert").addClass("show");
    }
    
  } else if ($(this).data("type") === "uploadFile") {
    var file = $("#fileUpload").val();
    readFile(file);
  } else if ($(this).data("type") === "addExternal") {
  
  	var isThisAValidStock = isValidStock($("#add-external-stock-name-input").val());
  	
  	var validInput = true;
  	if(isThisAValidStock === "BAD") {
  		$("#add-external-stock-name-input").addClass("red-border");
  		validInput = false;
  	} else {
  		$("#add-external-stock-name-input").removeClass("red-border");
  	}
  	
  	if (validInput === true) {
	    addExternalStock($("#add-external-stock-name-input").val());
	    $("#confirmation-alert-stock-name").text($("#add-external-stock-name-input").val());
	    $("#confirmation-alert-add-remove").text("added to");
	    externalStockConfirmation();
	} else {
    	$("#error-alert").removeClass("d-none");
    	$("#error-alert").addClass("show");
    }
  } else if ($(this).data("type") === "removeExternal") {
  
  	var isThisAValidStock = isValidStock($("#add-external-stock-name-input").val());
  
  	var validInput = true;
  	if(isThisAValidStock === "BAD") {
  		$("#remove-external-stock-name-input").addClass("red-border");
  		validInput = false;
  	} else {
  		$("#remove-external-stock-name-input").removeClass("red-border");
  	}
  	
  	
  	if (validInput === true) {
	    removeExternalStock($("#remove-external-stock-name-input").val());
	    $("#confirmation-alert-stock-name").text($("#remove-external-stock-name-input").val());
	    $("#confirmation-alert-add-remove").text("removed from");
	    externalStockConfirmation();
	} else {
		$("#error-alert").removeClass("d-none");
    	$("#error-alert").addClass("show");
	}
  }
  
  updatePortfolioStockList();

  $("#mainModal").modal({
    backdrop: true,
    keyboard: true,
    focus: true,
    show: true,
  });
});

$(".toggle-button").on("click", function() {
	if ($(this).attr("class").includes("fa-toggle-on")) {
		$(this).attr("class", $(this).attr("class").replace("fa-toggle-on", "fa-toggle-off"));
		removePortfolioContributor($(this).innerHTML);
	} else {
		$(this).attr("class", $(this).attr("class").replace("fa-toggle-off", "fa-toggle-on"));
		addPortfolioContributor($(this).innerHTML);
	}
});

$("#sp-button").on("click", function() {
	if ($(this).attr("class").includes("btn-primary")) {
		$(this).attr("class", $(this).attr("class").replace("btn-primary", "btn-secondary"));
		turnSpOn();
	} else {
		$(this).attr("class", $(this).attr("class").replace("btn-secondary", "btn-primary"));
		turnSpOff();
	}
})

$("#select-all").on("click", function() {
	$(".stock-name").each(function() {
		if($(this).next()[0].className.includes("fa-toggle-off")) {
			$(this).next().attr("class", "toggle-button fas fa-toggle-on fa-lg");
			addPortfolioContributor($(this).innerHTML);
		}  
	});
})

$("#deselect-all").on("click", function() {
	$(".stock-name").each(function() {
		if($(this).next()[0].className.includes("fa-toggle-on")) {
			$(this).next().attr("class", "toggle-button fas fa-toggle-off fa-lg");
			removePortfolioContributor($(this).innerHTML);
		}  
	});
})

function updateExternalStockList() {
	$("#external-stocks").empty();
	for (let i = 0; i < state_externalStocks.length; i++) {
		let liTag = document.createElement("li");
		liTag.innerHTML = state_externalStocks[i];
		
		document.querySelector("#external-stocks").appendChild(liTag);
	}
}

function updatePortfolioStockList() {
	document.querySelector("#portfolio-value").innerHTML = "";
	document.querySelector("#portfolio-value").className = "";
	document.querySelector("#portfolio-percent").innerHTML = "";
	document.querySelector("#portfolio-percent").className = "";
	$("#portfolio-stock-list").empty();
	
	
	for (let i = 0; i < state_portfolioListToDisplay.length; i++) {
		let divTag = document.createElement("div");
		divTag.className = "stock-item d-flex flex-row justify-content-around align-items-center";
		
		let deleteIcon = document.createElement("i");
		deleteIcon.className = "fas fa-times close-icon";
		
		let stockName = document.createElement("p");
		stockName.className = "m-0 p-0 stock-name";
		stockName.innerHTML = state_portfolioListToDisplay[i];
		
		let toggleButton = document.createElement("i");
		toggleButton.className = "toggle-button fas fa-toggle-on fa-lg";
		
		divTag.append(deleteIcon);
		divTag.append(stockName);
		divTag.append(toggleButton);
		document.querySelector("#portfolio-stock-list").appendChild(divTag);
		
	}
	
	$(".toggle-button").on("click", function() {
		if ($(this).attr("class").includes("fa-toggle-on")) {
			$(this).attr("class", $(this).attr("class").replace("fa-toggle-on", "fa-toggle-off"));
			removePortfolioContributor($(this).innerHTML);
		} else {
			$(this).attr("class", $(this).attr("class").replace("fa-toggle-off", "fa-toggle-on"));
			addPortfolioContributor($(this).innerHTML);
		}
	});
	
	document.querySelector("#portfolio-value").innerHTML = state_portfolioValue;
	document.querySelector("#portfolio-percent").innerHTML = "<span id='arrow'></span>" + state_percentChange;
	
	if (state_percentChange.includes("-")) {
		console.log()
		document.querySelector("#portfolio-percent").className = "red-text";
		document.querySelector("#arrow").innerHTML = "▼ ";
	} else {
		document.querySelector("#portfolio-percent").className = "green-text";
		document.querySelector("#arrow").innerHTML = "▲ ";
	}
	
	$(".close-icon").on("click", function() {
		removeFromPortfolio($(this).next()[0].innerHTML);
		$("#confirmation-alert-stock-name").text($(this).next()[0].innerHTML);
	    $("#confirmation-alert-add-remove").text("removed from");
	    $("#confirmation-alert-source").text("portfolio");
	    $("#confirmation-alert").removeClass("d-none");
	    $("#confirmation-alert").addClass("show");
		updatePortfolioStockList();
	})
	
}

$("#close-confirmation-alert").on("click", function() {
	$("#confirmation-alert").removeClass("show");
    $("#confirmation-alert").addClass("d-none");
});

$("#close-error-alert").on("click", function() {
	$("#error-alert").removeClass("show");
    $("#error-alert").addClass("d-none");
});

$(document).ready(function() {
	updatePortfolioStockList();
	updateExternalStockList();
});

