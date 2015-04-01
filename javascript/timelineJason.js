var numOfRoadmapItems = 22

var testJiraTicket = "POPS-203"

var dataRoadmapItemIndex = 0
var dataCategoryIndex = 1
var dataActive = 2
var dataStartDate = 3
var dataEndDate = 4
var dataJira = 5
var dataConfluence = 6
var dataStatus = 7
var dataProdMgr = 8
var dataEngMgr = 9
var dataEngLead = 10
var dataProgMgr = 11
var dataDocLead = 12
var dataProgJira = 13

var pmTicketString = ""

 WebFontConfig = {
    google: { families: [ 'Open+Sans::latin' ] }
  };
  (function() {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
      '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
  })(); 


//load up a google visualization, we about to get busy
google.load("visualization", "1");
google.setOnLoadCallback(grabRoadmapData);


//
function grabRoadmapData() {
	 
	//go and grab the raw data from the roadmap spreadsheet
	var query = new google.visualization.Query(
      'https://docs.google.com/a/bazaarvoice.com/spreadsheets/d/1M5CTvbZ_MZa5P-ieFrBCmy8T-nQ0VxDT123DhL8w4gM/edit?range=A2:Z' + numOfRoadmapItems + '#gid=305973899');
	query.send(buildRoadmap);
  
}

//
function buildRoadmap(response) {

	//handle an error when grabbing the spreadsheet
	if (response.isError()) {
		alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
		return;
	}

	//grab the roadpmap spreadsheet
	var data = response.getDataTable();
  
	//create a new visualization table
	var dataTable = new google.visualization.DataTable();
  
	//add the columns to the data table.  the order of these ties into the addRow function below
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
	dataTable.addColumn('string', 'dataProgJira');
	
	
	//loop through all tickets, create an array of them, and go get all the detail
	//----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	var ticketArray = []
	var pmTicketArray = []

	var roadmapItems = $(data.Lf)
	
	//Loop through each of the roadmap items
	//--------------------------------------
	roadmapItems.each(function(index2,row2){
	
		//if we have linked to a JIRA ticket in the spreadsheet, push it into the array for our API call
		if ( row2.c[dataJira].v.match("^PM-") ) { ticketArray.push(row2.c[dataJira].v) }
		pmTicketArray.push(row2.c[dataProgJira].v)
		
	
	})
	//END - Loop through each roadmap item
	//--------------------------------------
	
	
	//join all the JIRA tickets we have links to
	var ticketString = ticketArray.join(",")
	var pmTicketString = pmTicketArray.join(",")
	var storyQueryURL = "https://bv-roadmap.appspot.com/?ticket=" + ticketString
	var storyObj = []
	var epicObj = []
	
	
	
	
	
	
	//========================================
	pmTicketString2 = "POPS-203"
	console.log(pmTicketString)
	var commentQueryURL = "https://bv-roadmap.appspot.com/getTickets/?ticket=" + pmTicketString
	$.getJSON( commentQueryURL, function( epicData ) {
		console.log(data)
		
	//========================================
	
		var commentString = ""
		var authorString = ""
	
		$(epicData.issues).each(function(epicIndex,epic){
		
			console.log(epic.fields.comment.comments.length)
			console.log("********")
			if ( epic.fields.comment.comments.length > 0 ) { 
			
			commentString = epic.fields.comment.comments[epic.fields.comment.comments.length-1].body + " - " 
			authorString =  epic.fields.comment.comments[epic.fields.comment.comments.length-1].updateAuthor.displayName
			
			} else {
			
			commentString = "No comments"
			authorString = ""
			
			}
		
		
			epicObj.push({
				
				'epicId': epic.key,
				'lastComment': commentString,
				'commentAuthor' : authorString
				//'statusColor': setColor(issue.fields.status.name.replaceAll(" ","_")),
				//'lastupdated': issue.fields.updated,
				//'assigned': issue.fields.assignee.displayName,
				//'summary': issue.fields.summary
			});
		
		
		})
	
	
	
	
	
	
	
	
	
	
	
	  //go and grab all of the stories for each of the epics
	  $.getJSON( storyQueryURL, function( data ) {
	  
	  
		//loop through each of the stories and push it into a big all the relevant data into a object
		$(data.issues).each(function(issueIndex,issue){

			storyObj.push({
				'id': issue.fields.customfield_12620,
				'storyId': issue.key,
				'status': issue.fields.status.name.replaceAll(" ","_"),
				'statusColor': setColor(issue.fields.status.name.replaceAll(" ","_")),
				'lastupdated': issue.fields.updated,
				'assigned': issue.fields.assignee.displayName,
				'summary': issue.fields.summary
			});
			
		

		}) //END - looping through each story
		
	  
	storyObj.sort(compare);
	
	//END - grabbing all of the story tickets
	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
   
   
   
   
   
   
	//loop through each of the rows in the roadmap spreadsheet
	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	roadmapItems.each(function(index,row){
  
	
		
		//grab the start date of the roadmap item
		var startDate = new Date(row.c[dataStartDate].f)
		var startYear = startDate.getFullYear()
		var startMonth = startDate.getMonth()
		var startDay = startDate.getDate()
		
		var startSchedule = startMonth + "/" + startDay + "/" + startYear.toString().substr(2,2);
		

		//grab the end date of the roadmap item
		var endDate = new Date(row.c[dataEndDate].f)
		var endYear = endDate.getFullYear()
		var endMonth = endDate.getMonth()
		var endDay = endDate.getDate()
		
		var endSchedule = endMonth + "/" + endDay + "/" + endYear.toString().substr(2,2);
  
		//determine if this roadmap item is currently acitve and start building out the classes to style accordingly
		//var classString = row.c[dataActive].v + " " + row.c[dataActive].v + "On sameColor"
		var classString = row.c[dataActive].v + " sameColor"
		
  
  
		//set the color of the roadmap item based on the status
		switch(row.c[dataStatus].v) {
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
		} //END - set the color
	
		//also include the JIRA ticket number so we can grab it when we click it
		classString += " " + row.c[dataJira].v
	
	
	
		var totalTickets = 0
		var completedTickets = 0
		var completionPercentage = 0
		var roadmapItemString = ""
		
		
		//go and grab the stories for this particular epic
		//------------------------------------------------------------------------
		//------------------------------------------------------------------------
		$(getObjects(storyObj, 'id', row.c[dataJira].v)).each(function(storyIndex,story){
  
			var statusString = ""
  
			//set the color of the story item and start some calculations
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
  
  
 
	

			//calculate how many days it has been since a story was updated
			var todaysDate = new Date()
			var lastUpdatedDate = new Date(story.lastupdated)
			var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
			var diffDays = Math.round(Math.abs((todaysDate.getTime() - lastUpdatedDate.getTime())/(oneDay)));
  
			//go and build out the HTML for the story
			roadmapItemString += "<div class='storyBlock'><a href='javascript:;' class='storyLink'><span id='" + story.storyId + "' class='block " + statusString + "'></span></a>"
			roadmapItemString += "<span class='" + row.c[5].v + "_story hidden storyItem' id='" + story.storyId + "_details'><a target='_blank' href='https://bits.bazaarvoice.com/jira/browse/" + story.storyId + "'>" + story.storyId.split('-')[1] + "</a> - <a class='assignee' href='javascript:;'>" + story.assigned + "</a> - " + diffDays + "</span></div>"

  
		})
		//END - go and grab the stories for this particular epic
		//------------------------------------------------------------------------
		//------------------------------------------------------------------------
  
  
		//finish the math on the completion percentage
		if ( row.c[dataStatus].v == "b" ) { completionPercentage = "100%" } else {
		if ( totalTickets != 0 ) { 
			completionPercentage = Math.round(( completedTickets / totalTickets ) * 100) + "%" } 
		else {
			completionPercentage = "0%"
		}
		}
  
		
	
		finalRoadmapItemString = "<div class='roadmapItem'><h2 class='roadmapItemName'><a target='_blank' href='https://bits.bazaarvoice.com/jira/browse/" + row.c[dataJira].v + "'>" + row.c[dataRoadmapItemIndex].v + "</a></h2></div>"
		var schedule = startSchedule + " - " + endSchedule
		$(getObjects(epicObj, 'epicId', row.c[dataProgJira].v)).each(function(epicIndex,epic){
		
		//finalRoadmapItemString += "<div class='hidden detail'>"
		finalRoadmapItemString += "<table class='hidden detail'>"
		finalRoadmapItemString += "<tr><td class='timeline' colspan=3>" + schedule +  "</td></tr>"
		finalRoadmapItemString += "<tr><td class='label'>Prod Mgr:</td><td class='field'>" + row.c[dataProdMgr].v + "</td><td class='percent' rowspan=5>" + completionPercentage + "</td></tr>"
		finalRoadmapItemString += "<tr><td class='label'>Eng Mgr:</td><td class='field'>" + row.c[dataProgMgr].v + "</td></tr>"
		finalRoadmapItemString += "<tr><td class='label'>Tech Lead:</td><td class='field'>" + row.c[dataProgMgr].v + "</td></tr>"
		finalRoadmapItemString += "<tr><td class='label'>Doc Lead:</td><td class='field'>" + row.c[dataProgMgr].v + "</td></tr>"
		finalRoadmapItemString += "<tr><td class='label'>Prog Mgr:</td><td class='field'>" + row.c[dataProgMgr].v + "</td></tr>"
		finalRoadmapItemString += "</table>"
		finalRoadmapItemString += "<hr class='hidden divider' />"
		finalRoadmapItemString += "<p class='comments hidden small'><a target='_blank' href='https://bits.bazaarvoice.com/jira/browse/" + row.c[dataProgJira].v + "'>" + epic.lastComment + epic.commentAuthor + "</a></p>"
		
		})
  
		finalRoadmapItemString += "<div class='hidden stories'>" + roadmapItemString + "</div>"
		//finalRoadmapItemString += "</div>"
		
		//go and add a bunch of stuff to the timeline item in the visualization
		dataTable.addRow([
			new Date(startYear, startMonth, startDay), 
			new Date(endYear, endMonth, endDay),
			finalRoadmapItemString,row.c[dataCategoryIndex].v,
			classString,
			row.c[dataStatus].v,
			row.c[dataJira].v,
			row.c[dataConfluence].v,
			row.c[dataProgMgr].v,
			row.c[dataProdMgr].v,
			row.c[dataEngMgr].v,
			schedule,
			row.c[dataProgJira].v
		]);
  
  
		
  
	})
	//END - loop through each of the rows in the roadmap spreadsheet
	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
  
  
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

		}; // END - specify options

		
        // Instantiate our timeline object.
        timeline = new links.Timeline(document.getElementById('timeline'));
		//google.visualization.events.addListener(timeline, 'select', onselect);

        // Draw our timeline with the created data and options
		
		//var slidepos = $('#uilding').offset().left;
		
		var hidepos = $('.hide').offset().left;
		var slidepos = $('.slide').offset().left;

		var goto = ($('.slide').offset().left < slidepos) ? slidepos : hidepos;

		$('.slide').css({
			'left' : $('.slide').offset().left,
			'position' : 'fixed',
		}).animate({
			'left' : goto,
		}, function() {
			$(this).css('position', 'static');
		});

		$('.hide').animate({
			'opacity' : 'toggle',
		});
		
        
		
		
		$('#waiting').hide("slow");
		
		setTimeout(function(){$('.drill').fadeIn('fast');},650);
		
		
		
		timeline.draw(dataTable, options)
		
		$('.assignee').click(showWork)
		
		//$('.comments').click(launchTicket)
		$('.storyLink').click(onselect)
		
		//grabComments(pmTicketString)
		
		
	}) //END of our ajax call grabbing all the stories
	
	
  }) //END on the ajax call to grab the comments for the epics
  
  
    $('#simple').click(function(){
  
	//$('div.detail').hide()
	$('p.comments').hide()
	$('div.stories').hide()
	$('hr.divider').hide()
	$('table.detail').hide()
	timeline.zoom(0.1)
	timeline.zoom(-.1)
	$('div.timeline-event').addClass('sameColor')
	$('.currentOn').removeClass('currentOn')
	$('.horizonOn').removeClass('horizonOn')
	$('.futureOn').removeClass('futureOn')
	$('.drill').removeClass('selected')
	$(this).addClass('selected')
  
  })
  
  
  $('#summary').click(function(){
  
	//$('div.detail').hide()
	$('p.comments').hide()
	$('div.stories').hide()
	$('hr.divider').hide()
	$('table.detail').hide()
	timeline.zoom(0.1)
	timeline.zoom(-.1)
	$('div.timeline-event').removeClass('sameColor')
	$('.current').addClass('currentOn')
	$('.horizon').addClass('horizonOn')
	$('.future').addClass('futureOn')
	$('.drill').removeClass('selected')
	$(this).addClass('selected')
  
  }) 
  
  $('#status').click(function(){
  
	//$('div.detail').hide()
	$('p.comments').show()
	$('div.stories').show().removeClass('hidden')
	$('hr.divider').show()
	$('table.detail').hide()
	timeline.zoom(0.1)
	timeline.zoom(-.1)
	$('div.sameColor').removeClass('sameColor')
	$('.current').addClass('currentOn')
	$('.horizon').addClass('horizonOn')
	$('.future').addClass('futureOn')
	$('.drill').removeClass('selected')
	$(this).addClass('selected')
  
  })
  

 
  
  

$('#detail').click(function(){
  
	$('div.timeline-event').removeClass('sameColor')
	//$('div.detail').show().removeClass('hidden')
	$('p.comments').show()//.removeClass('hidden')
	$('div.stories').show()//.removeClass('hidden')
	$('hr.divider').show()//.removeClass('hidden')
	$('table.detail').show()//.removeClass('hidden')
	//setTimeout(function(){ timeline.redraw() }, 3000);
	//$('div#timeline').hide()
	//setTimeout(function(){ $('div#timeline').show() }, 3000);
	$('.current').addClass('currentOn')
	$('.horizon').addClass('horizonOn')
	$('.future').addClass('futureOn')
	$('.drill').removeClass('selected')
	$(this).addClass('selected')
	timeline.zoom(0.1)
	timeline.zoom(-.1)
	
  
  })  
  
  
} //END of our giant stupid ass function






//fire this when someone clicks a timeline item
function onselect() {
  var sel = timeline.getSelection();
  if (sel.length) {
  
	//if something was truly selected then
    if (sel[0].row != undefined) {
	
	  //grab the item and all the data we set for it
      var row = sel[0].row;
	  var timelineItem = timeline.getItem(row)
      console.log( "event " + row + " selected" )
	  
	  //set the color
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
	  
	  //go and set a bunch of values on the popup
	  //$('#roadmapItemPopup').removeClass()
	  //$('#roadmapItemPopup').addClass(lightboxClass)
	  //$('#schedule').html(timelineItem.schedule)
	  //$('#roadmapItem').html(timelineItem.content)
	  //$('#programmanager').html(timelineItem.programmanager)
	  //$('#productmanager').html(timelineItem.productmanager)
	  //$('#devmanager').html(timelineItem.devmanager)
	  //$('#jira').attr("href","https://bits.bazaarvoice.com/jira/browse/" + timelineItem.jira)
	  
	  
	  //go and grab all the story items and compress them and hide the detail
	  var oldStoryItems = $(".block")
	  var oldStoryItemsDetail = $(".storyItem")
	  oldStoryItems.css('float','left')
	  oldStoryItemsDetail.css('display','none')
	  
	  //go and grab all of the story items for the epic that was cliked
	  var storyItems = $("div." + timelineItem.jira + " .block")
	  var storyItemsDetail = $("span." + timelineItem.jira + "_story")
	  
	  //stack then and show the detail
	  storyItems.css('float','none')
	  storyItemsDetail.show()
	  
	  timeline.zoom(0.1)
		timeline.zoom(-.1)
	  
	  
    }
  }
} //end onselect


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


function compare(a,b) {

	order = [ 'blue','green','yellow','red'];
	return order.indexOf(a.statusColor) - order.indexOf(b.statusColor)
  
}

function setColor(storyStatus) {

//set the color of the roadmap item
	switch(storyStatus) {
		case "Code_Reviewing":
			return "yellow" 
			break;
		case "Blocked":
			return "red" 
			break;
		case "Deferred":
			return "red" 
			break;
		case "Closed":
			 return "blue" 
			break;
		case "Ready_For_Production":
			 return "blue" 
			break;
		case "Scheduled_for_Release":
			 return "blue" 
			break;
		case "Open":
			return "yellow" 
			break;
		default:
			return "green" 
			break;
	}


}


function grabComments(pmTicketString) {




}

function showWork() {

var workQueryURL = "https://bv-roadmap.appspot.com/getWork/?ticket=" + $(this).html()
	var storyObj = []
	
	//go and grab all of the stories for each of the epics
	$.getJSON( workQueryURL, function( data ) {
	
		workString = "<table width=100%>"
	
		$(data.issues).each(function(index,jiraTask){
		
		if ( jiraTask.fields.status.name != "Closed" ) {
			workString += "<tr><td width=100>" + jiraTask.key + "</td><td>" + jiraTask.fields.status.name + "</td><td>" + jiraTask.fields.summary + "</td></tr>"
		}
		})
		
		workString += "</table>"
		
		$('#workPopup').html(workString)
		 $('#workPopup').bPopup({
		 position: [10, 10], //x, y
            positionStyle: 'fixed' //'fixed' or 'absolute'
        });
	
	})

}