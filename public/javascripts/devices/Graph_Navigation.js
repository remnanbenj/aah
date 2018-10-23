

// =====GRAPH NAVIGATION=====

// Change the timescale
function changeTimeScale(timescale) {
  // Reset buttons
  $('#hourScale').css('background-color', '#777'); $('#hourScale').css('cursor', 'pointer'); $('#hourScale').css('font-weight', '500');
  $('#dayScale').css('background-color', '#777'); $('#dayScale').css('cursor', 'pointer'); $('#dayScale').css('font-weight', '500');

  if(timescale == 'hour') { 
    $('#hourScale').css('background-color', '#0092DB'); $('#hourScale').css('cursor', 'default'); $('#hourScale').css('font-weight', '600'); 

    var hours = new Date().getHours();
    var hoursSuffix = "AM";
    if(hours == 12) { hoursSuffix = "PM"; }
    else if(hours > 12) { hours -= 12; hoursSuffix = "PM"; }

    $(".graph-navigation-time-holder").css('height', '55px');
    $("#timepicker").val(hours);
    $("#ampmpicker").val(hoursSuffix);

  } else if(timescale == 'day') { 
    $('#dayScale').css('background-color', '#0092DB'); $('#dayScale').css('cursor', 'default'); $('#dayScale').css('font-weight', '600'); 

    $(".graph-navigation-time-holder").css('height', '0px');
  }

  getData();
}

// Move left according to timescale
function moveLeft() {
  var date = new Date($('#datepicker').val().split('-')[2] + '-' + $('#datepicker').val().split('-')[1] + '-' + $('#datepicker').val().split('-')[0]);

  var timescale = '';
  if($('#hourScale').css('background-color') == 'rgb(0, 146, 219)') timescale = 'hour';
  else if($('#dayScale').css('background-color') == 'rgb(0, 146, 219)') timescale = 'day';

  if(timescale == 'hour') {

    if($('#timepicker').val() == 1) {
      $('#timepicker').val(12);

    } else if($('#timepicker').val() == 12) {
      $('#timepicker').val(11);
      if($('#ampmpicker').val() == "PM"){
        $('#ampmpicker').val('AM');
      } else {
        date.setDate(date.getDate() - 1);
        $('#datepicker').val(date.getDate() + '-' + (date.getMonth()+1) + '-' + date.getFullYear());
        $('#ampmpicker').val('PM');
      }

    } else {
      $('#timepicker').val(Number($('#timepicker').val()) - 1);
    }

  } else if(timescale == 'day') {
    date.setDate(date.getDate() - 1);
    var dateString = "";
    dateString += String(date.getDate()).length == 1 ? "0" + date.getDate() + "-" : date.getDate() + "-";
    dateString += String((date.getMonth()+1)).length == 1 ? "0" + (date.getMonth()+1) + "-" : (date.getMonth()+1) + "-";
    dateString += date.getFullYear();
    $('#datepicker').val(dateString);
  }

  getData();
}

// Move right according to timescale
function moveRight() {
  var date = new Date($('#datepicker').val().split('-')[2] + '-' + $('#datepicker').val().split('-')[1] + '-' + $('#datepicker').val().split('-')[0]);

  var timescale = '';
  if($('#hourScale').css('background-color') == 'rgb(0, 146, 219)') timescale = 'hour';
  else if($('#dayScale').css('background-color') == 'rgb(0, 146, 219)') timescale = 'day';

  if(timescale == 'hour') {

    if($('#timepicker').val() == 12) {
      $('#timepicker').val(1);

    } else if($('#timepicker').val() == 11) {
      $('#timepicker').val(12);
      if($('#ampmpicker').val() == "PM"){
        date.setDate(date.getDate() + 1);
        $('#datepicker').val(date.getDate() + '-' + (date.getMonth()+1) + '-' + date.getFullYear());
        $('#ampmpicker').val('AM');
      } else {
        $('#ampmpicker').val('PM');
      }

    } else {
      $('#timepicker').val(Number($('#timepicker').val()) + 1);
    }

  } else if(timescale == 'day') {
    date.setDate(date.getDate() + 1);
    var dateString = "";
    dateString += String(date.getDate()).length == 1 ? "0" + date.getDate() + "-" : date.getDate() + "-";
    dateString += String((date.getMonth()+1)).length == 1 ? "0" + (date.getMonth()+1) + "-" : (date.getMonth()+1) + "-";
    dateString += date.getFullYear();
    $('#datepicker').val(dateString);
  }

  getData();
}

