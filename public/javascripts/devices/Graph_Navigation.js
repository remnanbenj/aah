

// =====GRAPH NAVIGATION=====

// Change the timescale
function changeTimeScale(timescale) {
  // Reset buttons
  $('#hourScale').css('background-color', '#777');
  $('#dayScale').css('background-color', '#777');

  if(timescale == 'hour') { 
    setupHourChart();
    $('#hourScale').css('background-color', '#0092DB'); 

    var hours = new Date().getHours();
    var hoursSuffix = "AM";
    if(hours == 12) { hoursSuffix = "PM"; }
    else if(hours > 12) { hours -= 12; hoursSuffix = "PM"; }
    else if(hours == 0) { hours = 12; }

    $(".graph-navigation-time-holder").css('height', '55px');
    $("#timepicker").val(hours);
    $("#ampmpicker").val(hoursSuffix);

  } else if(timescale == 'day') { 
    setupDayChart();
    $('#dayScale').css('background-color', '#0092DB'); 

    $(".graph-navigation-time-holder").css('height', '0px');
  }

  getData();
}

// Move time backwards
function moveTimeLeft() {
  var date = new Date($('#datepicker').val().split('-')[2] + '-' + $('#datepicker').val().split('-')[1] + '-' + $('#datepicker').val().split('-')[0]);

  if($('#timepicker').val() == 1) { // From 1 to 12
    $('#timepicker').val(12);

  } else if($('#timepicker').val() == 12) { // From 12 to 11
    $('#timepicker').val(11);
    if($('#ampmpicker').val() == "PM"){ // Swap from PM to AM
      $('#ampmpicker').val('AM');
    } else { // Swap from AM to PM of the day before
      date.setDate(date.getDate() - 1);
      $('#datepicker').val(date.getDate() + '-' + (date.getMonth()+1) + '-' + date.getFullYear());
      $('#ampmpicker').val('PM');
    }

  } else { // Else just take a number off
    $('#timepicker').val(Number($('#timepicker').val()) - 1);
  }

  getData();
}

// Move time forward
function moveTimeRight() {
  var date = new Date($('#datepicker').val().split('-')[2] + '-' + $('#datepicker').val().split('-')[1] + '-' + $('#datepicker').val().split('-')[0]);

  if($('#timepicker').val() == 12) { // From 12 to 1
    $('#timepicker').val(1);

  } else if($('#timepicker').val() == 11) { // From 11 to 12 
    $('#timepicker').val(12);
    if($('#ampmpicker').val() == "PM"){ // Swap from PM to AM of the day after
      date.setDate(date.getDate() + 1);
      $('#datepicker').val(date.getDate() + '-' + (date.getMonth()+1) + '-' + date.getFullYear());
      $('#ampmpicker').val('AM');
    } else { // Swap from AM to PM
      $('#ampmpicker').val('PM');
    }

  } else { // Else just add a number
    $('#timepicker').val(Number($('#timepicker').val()) + 1);
  }

  getData();
}

// Move date backward
function moveDateLeft() {
  var date = new Date($('#datepicker').val().split('-')[2] + '-' + $('#datepicker').val().split('-')[1] + '-' + $('#datepicker').val().split('-')[0]);
  date.setDate(date.getDate() - 1);
  $('#datepicker').val(getDatepickerDate(date));
  getData();
}

// Move date forward
function moveDateRight() {
  var date = new Date($('#datepicker').val().split('-')[2] + '-' + $('#datepicker').val().split('-')[1] + '-' + $('#datepicker').val().split('-')[0]);
  date.setDate(date.getDate() + 1);
  $('#datepicker').val(getDatepickerDate(date));
  getData();
}

function setupHourChart(){
  var startDate = new Date();
  startDate.setMinutes(0);
  startDate.setSeconds(0);
  var endDate = new Date();
  endDate.setMinutes(60);
  endDate.setSeconds(0);
  drawChart(startDate, endDate, google.visualization.arrayToDataTable([['t','t','t','t'],[startDate,0,0,0]]), getHourTicks(startDate));
}

function setupDayChart(){
  var startDate = new Date();
  startDate.setHours(0);
  startDate.setMinutes(0);
  startDate.setSeconds(0);
  var endDate = new Date();
  endDate.setHours(24);
  endDate.setMinutes(0);
  endDate.setSeconds(0);
  drawChart(startDate, endDate, google.visualization.arrayToDataTable([['t','t','t','t'],[startDate,0,0,0]]), getDayTicks(startDate));
}

