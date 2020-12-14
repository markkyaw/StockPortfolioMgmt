# Project Repo Information

## Contributors

This project wouldn't have been made possible if it weren't for my amazing team mates: [Sai Allu](https://github.com/allusai), [Maggie Shi](https://github.com/maggiemshi), [Teddy Lee](https://github.com/leetheod), and [Tran Ngo](https://github.com/tranngo). 

* Sai made sure we're all on track and helped everyone on both front and back ends. 
* Maggie worked on backend ensuring everything regarding interacting with user is flawless. 
* Teddy handled all the interactions that happened with our API calls to Yahoo Finance as well as making sure we have our cucumber tests running smootly. 
* Tran did an amazing job with the front ends. 
* I handled interactions (front and back-end) related to account registration/login and getting our Google Charts (almost got HighCharts implemented) to work with our back-end and database.

## Project Info

This is my CSCI 310 Fall 2020 Final Project. The project is a web application that can help users track the value of their stock portfolio over time and make investment decisions. List of features are in [Features List.pdf](Features_List.pdf). Our features include: displaying stock graphs and changes via Google Charts, creating account and logging in, retrieving some stocks using [Yahoo Finance API](https://github.com/sstrickx/yahoofinance-api). Feature 1 wasn't implemented since it's not feasible. We've implemented all the features listed in Features List except: uploading a CSV file for user to import the stocks.

## Special Thanks

Special thanks to our CP/ShareHolders [Karthik Sivanadiyan](https://github.com/Karthik-Sivanadiyan), and [Emily Jin](https://github.com/jin914) for all the help they provdied us to troubleshoot and resolve all our technical and non-technical questions.

## Running the Project

Import this repository into Eclipse. This project provides everything needed to:

- Host the web application on a local web server
- Run unit tests with coverage
- Run acceptance tests

**To run JUnit tests:**

Right-click project -> Run As -> "Maven test"

**To generate coverage report for JUnit tests:**

Right-click "cobertura.launch" -> Run As -> "cobertura".

**To host your web application:**

Right-click "run.launch" -> Run As -> "run". It will be hosted on https://localhost:8080.

**To run Cucumber tests:**

Make sure the web server is running when you run the Cucumber tests. Right-click "cucumber.launch" -> Run As -> "cucumber".
