google.load("visualization", "1");
google.setOnLoadCallback(drawChart);

function drawChart() {
	 

  var query = new google.visualization.Query(
      'https://docs.google.com/a/bazaarvoice.com/spreadsheets/d/1M5CTvbZ_MZa5P-ieFrBCmy8T-nQ0VxDT123DhL8w4gM/edit?range=A2:Z22#gid=305973899https://docs.google.com/spreadsheet/ccc?key=0Atw2BTU52lOCdEZpUlVIdmxGOWZBR2tuLXhYN2dQTWc&usp=drive_web&gid=0#');
  query.send(handleQueryResponse);
  
}

function handleQueryResponse(response) {

  if (response.isError()) {
    alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
    return;
  }

  //grab the roadpmap spreadsheet
  var data = response.getDataTable();
  
  //create a new visualization table
  var dataTable = new google.visualization.DataTable();
  
	dataTable.addColumn('datetime', 'start');
	dataTable.addColumn('datetime', 'end');
	dataTable.addColumn('string', 'content');
	dataTable.addColumn('string', 'group');
	dataTable.addColumn('string', 'className');
	dataTable.addColumn('string', 'status');
	dataTable.addColumn('string', 'jira');
	dataTable.addColumn('number', 'confluence');
	dataTable.addColumn('string', 'programmanager');
	dataTable.addColumn('string', 'productmanager');
	dataTable.addColumn('string', 'devmanager');
	dataTable.addColumn('string', 'schedule');
   
  //loop through each of the rows in the roadmap spreadsheet
  $(data.Lf).each(function(index,row){
  
		//grab the start date of the roadmap item
		var startDate = new Date(row.c[3].f)
		var startYear = startDate.getFullYear()
		var startMonth = startDate.getMonth()
		var startDay = startDate.getDate()
  
		//grab the end date of the roadmap item
		var endDate = new Date(row.c[4].f)
		var endYear = endDate.getFullYear()
		var endMonth = endDate.getMonth()
		var endDay = endDate.getDate()
  
  
  
  
	roadmapItem = row.c[0].v.replaceAll(" ","_")
	//console.log(roadmapItem)
	var classString = (row.c[2].v == 'y') ? "active" : "inactive";
  
  
	//set the color of the roadmap item
	switch(row.c[7].v) {
		case "y":
			classString += " yellow"
			break;
		case "r":
			 classString += " red"
			break;
		case "g":
			classString += " green"
			break;
		case "b":
			classString += " blue"
			break;
	}
  
  
  
  var schedule = row.c[3].f + " - " + row.c[4].f
  dataTable.addRow([new Date(startYear, startMonth, startDay), new Date(endYear, endMonth, endDay),row.c[0].v,row.c[1].v,classString,row.c[7].v,row.c[5].v,row.c[6].v,row.c[11].v,row.c[8].v,row.c[9].v,schedule]);
  
  
  })
  
  
	// specify options
        var options = {
    // option groupOrder can be a property name or a sort function
    // the sort function must compare two groups and return a value
    //     > 0 when a > b
    //     < 0 when a < b
    //       0 when a == b
    groupsOrder: function (a, b) {
	
		order = [ 'R&R','SEO','Q&A','Content','GSR','Tech' ];
		console.log(a.content + " - " + b.content)
		return order.indexOf(a.content) - order.indexOf(b.content)
		
		
	


	  
	  
    },
    editable: false,
	eventMargin : 2,
	eventMarginAxis : 10,
	axisOnTop : true
  };

        // Instantiate our timeline object.
        timeline = new links.Timeline(document.getElementById('timeline'));
		google.visualization.events.addListener(timeline, 'select', onselect);

        // Draw our timeline with the created data and options
        timeline.draw(dataTable, options);
  
  
  //var chart = new google.visualization.ColumnChart(document.getElementById('columnchart'));
  //chart.draw(data, { legend: { position: 'none' } });
}


function onselect() {
  var sel = timeline.getSelection();
  if (sel.length) {
    if (sel[0].row != undefined) {
      var row = sel[0].row;
	  var timelineItem = timeline.getItem(row)
      console.log( "event " + row + " selected" )
	  
	  
	  switch(timelineItem.status) {
    case "y":
        lightboxClass = "yellowLightbox"
        break;
    case "r":
         lightboxClass = "redLightbox"
        break;
	case "g":
        lightboxClass = "greenLightbox"
        break;
	case "b":
        lightboxClass = "blueLightbox"
        break;
}
	  
	  $('#roadmapItemPopup').removeClass()
	  $('#roadmapItemPopup').addClass(lightboxClass)
	  $('#schedule').html(timelineItem.schedule)
	  $('#roadmapItem').html(timelineItem.content)
	  $('#programmanager').html(timelineItem.programmanager)
	  $('#productmanager').html(timelineItem.productmanager)
	  $('#devmanager').html(timelineItem.devmanager)
	  $('#jira').attr("href","https://bits.bazaarvoice.com/jira/browse/" + timelineItem.jira)
	  
	  
	  storyQueryURL = "https://bits.bazaarvoice.com/jira/rest/api/2/search?jql=%22Epic%20Link%22%3D" + timelineItem.jira
	  $.getJSON( storyQueryURL, function( data ) {
	  
	  console.log(data)
	  
	  })
	  
	  
	  
	  $('#roadmapItemPopup').bPopup();
    }
  }
}


String.prototype.replaceAll = function (find, replace) {
    var str = this;
    return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};

function groupsOrder (a, b) {
    if (a.content > b.content) {
        return 1;
    }
    if (a.content < b.content) {
        return -1;
    }
    return 0;
};