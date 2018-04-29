
      var transitionTime = 180;
      var selectedWidth = 400;
      var notSelectedWidth = (900 - selectedWidth) / 2;

      $(document).ready(function(){

        // Hovers

        $(".button-1").hover(function(){
          resetHover();
          $(".button-3").animate({width: notSelectedWidth + 'px'}, { duration: transitionTime, queue: false });
          $(".button-2").animate({width: notSelectedWidth + 'px'}, { duration: transitionTime, queue: false });
          $(this).animate({width: selectedWidth + 'px'}, { duration: transitionTime, queue: false });

          $(".button-title-1").animate({height: '70px'}, { duration: transitionTime, queue: false });
          $(".button-subtitle-1").animate({bottom: '10px'}, { duration: transitionTime, queue: false });
        });

        $(".button-2").hover(function(){
          resetHover();
          $(".button-3").animate({width: notSelectedWidth + 'px'}, { duration: transitionTime, queue: false });
          $(".button-1").animate({width: notSelectedWidth + 'px'}, { duration: transitionTime, queue: false });
          $(this).animate({width: selectedWidth + 'px'}, { duration: transitionTime, queue: false });

          $(".button-title-2").animate({height: '70px'}, { duration: transitionTime, queue: false });
          $(".button-subtitle-2").animate({bottom: '10px'}, { duration: transitionTime, queue: false });
        });

        $(".button-3").hover(function(){
          resetHover();
          $(".button-2").animate({width: notSelectedWidth + 'px'}, { duration: transitionTime, queue: false });
          $(".button-1").animate({width: notSelectedWidth + 'px'}, { duration: transitionTime, queue: false });
          $(this).animate({width: selectedWidth + 'px'}, { duration: transitionTime, queue: false });

          $(".button-title-3").animate({height: '70px'}, { duration: transitionTime, queue: false });
          $(".button-subtitle-3").animate({bottom: '10px'}, { duration: transitionTime, queue: false });
        });

        $(".button-holder").hover(function(){
        }, function(){
          resetHover();
        });

        // Clicks

        $(".button-1").click(function(){

          // Unbind hovers
          unbindHover();

          // Full Screen button
          $(".button-1").animate({width: '800px'}, { duration: transitionTime, queue: false });
          $(".button-subtitle-1").animate({bottom: '-30px'}, { duration: transitionTime, queue: false });
          $(".button-title-1").animate({height: '40px'}, { duration: transitionTime, queue: false });
          $(".button-2").animate({width: '0px'}, { duration: transitionTime, queue: false });
          $(".button-3").animate({width: '0px'}, { duration: transitionTime, queue: false });
          setTimeout(function(){$(".button-2").css('display', 'none');}, 180);
          setTimeout(function(){$(".button-3").css('display', 'none');}, 180);

          // Change url
          setTimeout(function(){window.location.assign("/statistics");}, 300);
        });

        $(".button-2").click(function(){

          // Unbind hovers
          unbindHover();

          // Full Screen button
          $(".button-2").animate({width: '800px'}, { duration: transitionTime, queue: false });
          $(".button-subtitle-2").animate({bottom: '-30px'}, { duration: transitionTime, queue: false });
          $(".button-title-2").animate({height: '40px'}, { duration: transitionTime, queue: false });
          $(".button-1").animate({width: '0px'}, { duration: transitionTime, queue: false });
          $(".button-3").animate({width: '0px'}, { duration: transitionTime, queue: false });
          setTimeout(function(){$(".button-1").css('display', 'none');}, 180);
          setTimeout(function(){$(".button-3").css('display', 'none');}, 180);

          // Change url
          setTimeout(function(){window.location.assign("/controls");}, 300);
        });

        $(".button-3").click(function(){

          // Unbind hovers
          unbindHover();

          // Full Screen button
          $(".button-3").animate({width: '800px'}, { duration: transitionTime, queue: false });
          $(".button-subtitle-3").animate({bottom: '-30px'}, { duration: transitionTime, queue: false });
          $(".button-title-3").animate({height: '40px'}, { duration: transitionTime, queue: false });
          $(".button-1").animate({width: '0px'}, { duration: transitionTime, queue: false });
          $(".button-2").animate({width: '0px'}, { duration: transitionTime, queue: false });
          setTimeout(function(){$(".button-1").css('display', 'none');}, 180);
          setTimeout(function(){$(".button-2").css('display', 'none');}, 180);

          // Change url
          setTimeout(function(){window.location.assign("/settings");}, 300);
        });

      });

      function resetHover(){
          $(".button-1").animate({width: '300px'}, { duration: transitionTime, queue: false });
          $(".button-2").animate({width: '300px'}, { duration: transitionTime, queue: false });
          $(".button-3").animate({width: '300px'}, { duration: transitionTime, queue: false });
          $(".button-title-1").animate({height: '40px'}, { duration: transitionTime, queue: false });
          $(".button-title-2").animate({height: '40px'}, { duration: transitionTime, queue: false });
          $(".button-title-3").animate({height: '40px'}, { duration: transitionTime, queue: false });
          $(".button-subtitle-1").animate({bottom: '-30px'}, { duration: transitionTime, queue: false });
          $(".button-subtitle-2").animate({bottom: '-30px'}, { duration: transitionTime, queue: false });
          $(".button-subtitle-3").animate({bottom: '-30px'}, { duration: transitionTime, queue: false });
      }

      function unbindHover(){
          $(".botnav").unbind(); 
          $(".button-1").unbind();  
          $(".button-2").unbind(); 
          $(".button-3").unbind();   
          $(".button-holder").unbind();  
          $(".button-1").css('cursor', 'default');
          $(".button-2").css('cursor', 'default');
          $(".button-3").css('cursor', 'default');
      }
