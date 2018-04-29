var transitionTime = 180;
var selectedWidth = 400;
var notSelectedWidth = (900 - selectedWidth) / 2;

$(document).ready(function(){

  // Clicks

  $(".topnav-button-1").click(function(){
    //$(".page").animate({top: '100vh'}, { duration: 300, queue: false });
    $(".topnav-button-1").css('color', '#00aaff');
    $(".topnav-button-1").css('border-bottom', '1px solid #00aaff');
    $(".topnav-button-2").css('color', 'black');
    $(".topnav-button-2").css('border-bottom', '1px solid black');
    $(".topnav-button-3").css('color', 'black');
    $(".topnav-button-3").css('border-bottom', '1px solid black');
    setTimeout(function(){window.location.assign("/home");}, 400);
  });

  $(".topnav-button-2").click(function(){
    //$(".page").animate({top: '100vh'}, { duration: 300, queue: false });
    $(".topnav-button-1").css('color', 'black');
    $(".topnav-button-1").css('border-bottom', '1px solid black');
    $(".topnav-button-2").css('color', '#00aaff');
    $(".topnav-button-2").css('border-bottom', '1px solid #00aaff');
    $(".topnav-button-3").css('color', 'black');
    $(".topnav-button-3").css('border-bottom', '1px solid black');
    setTimeout(function(){window.location.assign("/controls");}, 400);
  });

  $(".topnav-button-3").click(function(){
    //$(".page").animate({top: '100vh'}, { duration: 300, queue: false });
    $(".topnav-button-1").css('color', 'black');
    $(".topnav-button-1").css('border-bottom', '1px solid black');
    $(".topnav-button-2").css('color', 'black');
    $(".topnav-button-2").css('border-bottom', '1px solid black');
    $(".topnav-button-3").css('color', '#00aaff');
    $(".topnav-button-3").css('border-bottom', '1px solid #00aaff');
    setTimeout(function(){window.location.assign("/devices");}, 400);
  });

  $(".botnav-button-1").click(function(){
    //$(".page").animate({top: '100vh'}, { duration: 300, queue: false });
    setTimeout(function(){window.location.assign("/home");}, 400);
  });

  $(".botnav-button-2").click(function(){
    //$(".page").animate({top: '100vh'}, { duration: 300, queue: false });
    setTimeout(function(){window.location.assign("/controls");}, 400);
  });

  $(".botnav-button-3").click(function(){
    //$(".page").animate({top: '100vh'}, { duration: 300, queue: false });
    setTimeout(function(){window.location.assign("/devices");}, 400);
  });

});
