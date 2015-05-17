

function plotAnimation(file, criteriaX, criteriaY) {
    //remove the previous SVG
	d3.select("svg")
       .remove();
    
    //Decides the global variables
	var height = 500;
	var width = 500;
	var padding = 10;

	var svg = d3.select("#points").append("svg").attr("height", height).attr("width", width);
		
	var lines, circles, centroids;

	var xScale, yScale, points;

	var universities;

    //starts the plot
	d3.csv(file, function (error, data) {

		universities = data;
	    
	    
		points = universities.map(function (university) {
			// Map variables to the file
			return {
				x: Math.log(Number(university[criteriaX])),
			 	y: (Number(university[criteriaY])*2),
				label: university["Name"],
				rank2014: university["Rank 2014"],
				AcademicReputationScore: university["Academic Reputation Score"],
				EmployerReputationScore: university["Employer Reputation Score"],
				FacultyStudentScore: university["Faculty Student Score"],
				CitationsPerFacultyScore: university["Citations Per Faculty Score"],
				InternationalStudentsScore: university["International Students Score"],
				InternationalFacultyScore: university["International Faculty Score"],
				Overall: university["Overall"]
			};
		})
		.filter(function (point) {
			//eliminates entries without some of the x-y information
				return ! isNaN(point.x) && ! isNaN(point.y);
		});
	    
	    
	    //y and x scale related to width and heigh
		xScale = d3.scale.linear()
		.domain(d3.extent(points, function (point) {
			return point.x;
		})).range([padding, width - padding]);
		yScale = d3.scale.linear()
		.domain(d3.extent(points, function (point) {
			return point.y;
		})).range([height - padding, padding]);

		lines = svg.selectAll("line").data(points);

		// Each point has a line that is initially pointing to itself
		lines.enter().append("line")
		.attr("x1", function(d) { return xScale(d.x); })
		.attr("y1", function(d) { return yScale(d.y); })
		.attr("x2", function(d) { return xScale(d.x); })
		.attr("y2", function(d) { return yScale(d.y); })
		.style("stroke", "#aaa");

		circles = svg.selectAll(".point").data(points);

		// Create a onclick callback that lists university data
		circles.enter().append("circle")
		.attr("class", "point")
		.attr("cx", function(d) { return xScale(d.x); })
		.attr("cy", function(d) { return yScale(d.y); })
		.attr("r", 9)
		.style("fill", "green")
		.style("opacity", 0.5)
		.on("click", function (d) {
			d3.select("#loc0").text("World Rank 2014");
			d3.select("#loc1").text(d.label + " ("+d.rank2014+")");
			d3.select("#loc2").text("Academic Reputation Score: "+d.AcademicReputationScore);
			d3.select("#loc3").text("Employer Reputation Score: "+d.EmployerReputationScore);
			d3.select("#loc4").text("Faculty Student Score: "+d.FacultyStudentScore);
			d3.select("#loc5").text("Citations Per Faculty Score: "+d.CitationsPerFacultyScore);
			d3.select("#loc6").text("International Students Score: "+d.InternationalStudentsScore);
			d3.select("#loc7").text("International Faculty Score: "+d.InternationalFacultyScore);
			d3.select("#loc8").text("Overall Rank: " + d.Overall);

		});

		circles2 = svg.selectAll(".point2").data(points);

		// Create a little circle in the middle of each one
		circles2.enter().append("circle")
		.attr("class", "point2")
		.attr("cx", function(d) { return xScale(d.x); })
		.attr("cy", function(d) { return yScale(d.y); })
		.attr("r", 1)
		.style("fill", "green")
		.style("opacity", 0.8)
		.on("click", function (d) {
			d3.select("#loc0").text("World Rank 2014");
			d3.select("#loc1").text(d.label + " ("+d.rank2014+")");
			d3.select("#loc2").text("Academic Reputation Score: "+d.AcademicReputationScore);
			d3.select("#loc3").text("Employer Reputation Score: "+d.EmployerReputationScore);
			d3.select("#loc4").text("Faculty Student Score: "+d.FacultyStudentScore);
			d3.select("#loc5").text("Citations Per Faculty Score: "+d.CitationsPerFacultyScore);
			d3.select("#loc6").text("International Students Score: "+d.InternationalStudentsScore);
			d3.select("#loc7").text("International Faculty Score: "+d.InternationalFacultyScore);
			d3.select("#loc8").text("Overall Rank: " + d.Overall);
		});


		// 4 Cluster, can be changed
		centroids = new Array(4);
		for (var i = 0; i < centroids.length; i++) {
			// Initialize from a randomly chosen point
			var randomPoint = points[Math.floor(Math.random() * points.length)];
			centroids[i] = { x: randomPoint.x, y: randomPoint.y };

		}

		findClosest();


	});
	  
    //animation itself
	for (var i = 0; i < 25; i++)  {
	   waitAndChangeMeans(i+1);

	}



	function waitAndChangeMeans(time) {
	setTimeout(function (time){
			for (var k = 0; k < 60; k++)  {
			moveMeans();
			}
			findClosest();
	}, (time*1700));  
	}





   //support functions for the animation
	function moveMeans() {
		centroids.forEach(function (centroid, i) {
			var assignedPoints = 
				points.filter(function (point) { return point.cluster == i; });
			
			centroid.x = d3.mean(assignedPoints, function (point) { return point.x; });
			centroid.y = d3.mean(assignedPoints, function (point) { return point.y; });
		});
		 
        //color of the circles depending on the cluster
		circles.style("fill", function (point) {
          if(point.cluster == 0){
          	return "red";
          } else if (point.cluster == 1){
          	return "green";
          } else if(point.cluster == 2){
            return "blue";
          } else{
          	return "orange";
          }
		});
       
        //color of the little middle circles depending on the cluster
		circles2.style("fill", function (point) {
          if(point.cluster == 0){
          	return "red";
          } else if (point.cluster == 1){
          	return "green";
          } else if(point.cluster == 2){
            return "blue";
          } else{
          	return "orange";
          }
		});

		lines.transition().duration(1000).attr("x2", function (point) {
			return xScale(centroids[point.cluster].x);
		})
		.attr("y2", function (point) {
			return yScale(centroids[point.cluster].y);
		});
	}

	function findClosest() {

		points.forEach(function (point) {
			var nearest;
			var shortestDistance = Number.MAX_VALUE;
			for (var i = 0; i < centroids.length; i++) {
				var c = centroids[i];
				var distance = Math.sqrt( 
					(c.x - point.x) * (c.x - point.x) +
					(c.y - point.y) * (c.y - point.y)
				);
			
				if (distance < shortestDistance) {
					shortestDistance = distance;
					nearest = i;
				}
			}

				point.cluster = nearest;
				
			
		});
        
        //color of the circles depending on the cluster
		circles.style("fill", function (point) {
          if(point.cluster == 0){
          	return "red";
          } else if (point.cluster == 1){
          	return "green";
          } else if(point.cluster == 2){
            return "blue";
          } else{
          	return "orange";
          }
		});
        //color of the little middle circles depending on the cluster
		circles2.style("fill", function (point) {
          if(point.cluster == 0){
          	return "red";
          } else if (point.cluster == 1){
          	return "green";
          } else if(point.cluster == 2){
            return "blue";
          } else{
          	return "orange";
          }
		});

		lines.transition().duration(1000).attr("x2", function (point) {
			return xScale(centroids[point.cluster].x);
		})
		.attr("y2", function (point) {
			return yScale(centroids[point.cluster].y);
		});

	}
}