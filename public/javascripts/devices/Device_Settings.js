
// ====Basic settings====

var editDeviceDialogHtml = "";
editDeviceDialogHtml += '<span style="font-weight: 600;">Rename Device</span>';
editDeviceDialogHtml += '<br>';
editDeviceDialogHtml += '<span>What you want to call this device:</span>';
editDeviceDialogHtml += '<br>';
editDeviceDialogHtml += '<input id="deviceName" value="'+device.name+'" class="new-device-input"/>';
editDeviceDialogHtml += '<br>';
editDeviceDialogHtml += '<div class="overlay-button" style="margin-right: 10px;" onclick="renameDevice('+device.id+')">Rename</div>';
editDeviceDialogHtml += '<br>';
function editDeviceDialog(){
  $(".overlay-inner-title").html('Device Settings');
  $('.overlay-inner-container').html(editDeviceDialogHtml);
  $(".overlay").fadeIn();
}

// Changes the name of a device
function renameDevice(id){
  var deviceName = $("#deviceName").val();
  if(deviceName=="") { toast("Please enter a device name", 1200); return; }

  // Check device info on server
  console.log('TODO: Check device info on server');

  // Edit on server
  var url = "/devices/editdevice?id=" + id + "&name=" + deviceName;
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {

      // Close dialog and edit device
      if(this.responseText == "Success") {
        toast('Device name changed', 2400);
        $(".overlay").fadeOut();

        // Edits the device on the page to reflect the changes
        $('.device-name').html(deviceName);

      } else {
        console.log(this.responseText);
      }

    }
  };
  xhttp.open("POST", url, true);
  xhttp.send();
}

// Hides current settings panel 
function cancel(){
  $(".overlay").fadeOut();
}

