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
	
	
	//loop through all tickets, create an array of them, and go get all the detail
	//----------------------------------------------------------------------------
	var ticketArray = []
	
	var roadmapItems = $(data.Lf)
	//var rowz2 = $(data.Lf)
	
	roadmapItems.each(function(index2,row2){
	
	if ( row2.c[5].v.match("^PM-") ) { ticketArray.push(row2.c[5].v) }
	
	
	})
	
	
	var ticketString = ticketArray.join(",")
	var storyObj = []
		
		storyQueryURL = "https://bv-roadmap.appspot.com/?ticket=" + ticketString
	  $.getJSON( storyQueryURL, function( data ) {
	  
	  $(data.issues).each(function(issueIndex,issue){
	  
		storyObj.push({
        'id': issue.fields.customfield_12620,
        'storyId': issue.key,
		'status': issue.fields.status.name.replaceAll(" ","_"),
		'lastupdated': issue.fields.updated,
		'assigned': issue.fields.assignee.displayName,
		'summary': issue.fields.summary
    });
		console.log(issue.fields.customfield_12620)
	  
	  })
	  
	  
	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
   
   console.log("*******")
   
  //loop through each of the rows in the roadmap spreadsheet
  roadmapItems.each(function(index,row){
  
	console.log("*******")
		console.log(index)
  
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
	
	classString += " " + row.c[5].v
	
	
	
	var totalTickets = 0
	var completedTickets = 0
	var roadmapItemString = ""
	 var completionPercentage = 0
  
  $(getObjects(storyObj, 'id', row.c[5].v)).each(function(storyIndex,story){
  
	var statusString = ""
  
	//set the color of the roadmap item
	switch(story.status) {
		case "Code_Reviewing":
			statusString += "yellow " + story.status
			totalTickets++
			break;
		case "Blocked":
			statusString += "red " + story.status
			totalTickets++
			break;
		case "Deferred":
			statusString += "red " + story.status
			totalTickets++
			break;
		case "Closed":
			 statusString += "blue " + story.status
			 totalTickets++
			 completedTickets++
			break;
		case "Ready_For_Production":
			 statusString += "blue " + story.status
			 totalTickets++
			 completedTickets++
			break;
		case "Scheduled_for_Release":
			 statusString += "blue " + story.status
			 totalTickets++
			 completedTickets++
			break;
		case "Open":
			statusString += "yellow " + story.status
			totalTickets++
			break;
		default:
			totalTickets++
			statusString += "green " + story.status
			break;
	}
  
  
 
	

  
  var todaysDate = new Date()
  var lastUpdatedDate = new Date(story.lastupdated)
  var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
	var diffDays = Math.round(Math.abs((todaysDate.getTime() - lastUpdatedDate.getTime())/(oneDay)));
  
	roadmapItemString += "<a class='storyLink' target='_blank' href='https://bits.bazaarvoice.com/jira/browse/" + story.storyId + "'><div id='" + story.storyId + "' class='block " + statusString + "'>"
	roadmapItemString += "<span class='" + row.c[5].v + "_story hidden storyItem' id='" + story.storyId + "_details'>" + story.assigned + " - " + diffDays + "</span></div></a>"
  })
  
  if ( totalTickets != 0 ) { 
  
	completionPercentage = Math.round(( completedTickets / totalTickets ) * 100) + "%" } 
	
	else {
	
	completionPercentage = "0%"
	
	}
  
	roadmapItemString += "</div>"
	
	finalRoadmapItemString = row.c[0].v + " - " + completionPercentage + "<div>" + roadmapItemString
  
  var schedule = row.c[3].f + " - " + row.c[4].f
  dataTable.addRow([new Date(startYear, startMonth, startDay), new Date(endYear, endMonth, endDay),finalRoadmapItemString,row.c[1].v,classString,row.c[7].v,row.c[5].v,row.c[6].v,row.c[11].v,row.c[8].v,row.c[9].v,schedule]);
  
  
  })
  
  
	// specify options
        var options = {
    
			groupsOrder: function (a, b) {
	
				order = [ 'R&R','SEO','Q&A','Content','GSR','Tech' ];
				console.log(a.content + " - " + b.content)
				return order.indexOf(a.content) - order.indexOf(b.content)
				
			},
			
		editable: false,
		eventMargin : 2,
		eventMarginAxis : 0,
		axisOnTop : true
		
		};

        // Instantiate our timeline object.
        timeline = new links.Timeline(document.getElementById('timeline'));
		google.visualization.events.addListener(timeline, 'select', onselect);

        // Draw our timeline with the created data and options
        timeline.draw(dataTable, options);
		
		
		
		console.log(ticketString)
		
	})
  
  
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
	  
	  //console.log($(sel).attr("class"))
	  
	  /*
	  $("div#epicDetail").remove()
	  
	  storyQueryURL = "https://bv-roadmap.appspot.com/?ticket=" + timelineItem.jira
	  $.getJSON( storyQueryURL, function( data ) {
	  
	  $(data.issues).each(function(issueIndex,issue){
	  
		console.log(issue.customfield_12620)
	  
	  })
	  
	  var detailString = "<div id='epicDetail'>"
	  
	  $(data.issues).each(function(index,issue){
	  
		detailString += "<span>" + index + "</span>"
	  
	  })
	  
	  detailString += "</div>"
	  
	  
	  //$(timelineItem).append("<h5>sdlfkjdsfldsjflkj</h5>")
	  
	  $("div.timeline-event-selected").append(detailString)
	  
	  })
	  
	  */
	  
	  //$('#roadmapItemPopup').bPopup();
	  
	  console.log("div." + timelineItem.jira + " .block")
	  
	  var oldStoryItems = $(".block")
	  var oldStoryItemsDetail = $(".storyItem")
	  oldStoryItems.css('float','left')
	  oldStoryItemsDetail.css('display','none')
	  
	  var storyItems = $("div." + timelineItem.jira + " .block")
	  var storyItemsDetail = $("span." + timelineItem.jira + "_story")
	  
	  storyItems.css('float','none')
	  //storyItems.css('width','10px')
	  storyItemsDetail.show()
	  
	  
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


function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else if (i == key && obj[key] == val) {
            objects.push(obj);
        }
    }
    return objects;
}