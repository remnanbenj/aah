
// ====Temperature device settings====

var editTempDialogHtml = "";
editTempDialogHtml += '<span style="font-weight: 600;">Change Temperature</span>';
editTempDialogHtml += '<br>';
editTempDialogHtml += '<span>Max Temperature:</span>';
editTempDialogHtml += '<br>';
editTempDialogHtml += '<input id="deviceTempVar" value="'+device.variables[0]+'" type="number" step=".5" class="new-device-input"/>';
editTempDialogHtml += '<br>';
editTempDialogHtml += '<span>Range:</span>';
editTempDialogHtml += '<br>';
editTempDialogHtml += '<input id="deviceRangeVar" value="'+device.variables[1]+'" type="number" step=".5" class="new-device-input"/>';
editTempDialogHtml += '<br>';
editTempDialogHtml += '<div class="overlay-button" style="margin-right: 10px;" onclick="checkTempDialog('+device.id+')">Save</div>';
editTempDialogHtml += '<br>';
function editTempDialog(){
  $(".overlay-inner-title").html('Edit Device Temperatures');
  $('.overlay-inner-container').html(editTempDialogHtml);
  $(".overlay").fadeIn();
}

// Checks server if change is okay, then makes the change
function checkTempDialog(id){
  var newTemp = $("#deviceTempVar").val();
  var newRange = $("#deviceRangeVar").val();
  if(newTemp=="") { toast("Please enter a max temperature", 1200); return; }
  if(newRange=="") { toast("Please enter a temperature range", 1200); return; }

  // Check device info on server
  console.log('TODO: Check device info on server');

  // Edit on server
  var url = "/devices/changewtrtemp?id=" + id + "&newtemp=" + newTemp + "&newrange=" + newRange;
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {

      // Close dialog and edit device
      if(this.responseText == "Success") {
        toast('Device Temperatures Changed', 2400);
        $(".overlay").fadeOut();

        device.variables[0] = newTemp;
        device.variables[1] = newRange;

      } else {
        console.log(this.responseText);
      }

    }
  };
  xhttp.open("POST", url, true);
  xhttp.send();
}
