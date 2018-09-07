'use strict'
$(function(){
    var commonJs = {
        $window : $(window),
        $document : $(document),
        $wrap : $('.wrap'),
        $topButton : $('.top_button'),
        topButtonDefaultTop : 160
    };

    commonJs.$window.on('scroll', function(e){
        setTimeout(function(){
            commonJs.setAnimationByScroll();
        },200);
    });

    commonJs.getWindowHeight = function(){
        return commonJs.$window[0].innerHeight
    }

    commonJs.getWrapHeight = function(){
        return commonJs.$wrap[0].clientHeight
    }

    commonJs.getScrollY = function(){
        return commonJs.$window.scrollTop()
    }

    commonJs.setAnimationByScroll = function(){
        var scrollY = commonJs.getScrollY();


        if(scrollY < 10){
            commonJs.$topButton.css({
                opacity: 0
            });
            commonJs.$wrap.removeClass('sub');
        } else {
            commonJs.$topButton.css({
                opacity: 1,
                'top' : commonJs.getWindowHeight() + scrollY - commonJs.topButtonDefaultTop
            });
            commonJs.$wrap.addClass('sub');
        }
    }

    commonJs.getWindowWidth = function(){
        return commonJs.$window.width();
    }

    commonJs.$window.on('resize', function(){
        var w = commonJs.getWindowWidth();
        commonJs.topButtonDefaultTop = w < 768 ? 70 : 160;
    });

    commonJs.$window.trigger('resize');
    commonJs.setAnimationByScroll();

    // init
    commonJs.$document.on('click', '[data-modal]', function(e){
        var $this = $(this);
        switch($this.data('modal')){
            case 'alert' : 
                $("#alert").modal().find('.text').text($(this).attr('data-text'));
            break;
            case 'login' :
                $("#login").modal();
            break;
            case 'join' :
                $("#join").modal();
            break;
            case 'menu_m' :
                $("#menu_m").modal();
            break;
        }
        return false;
    });

    commonJs.setValidation = function(){
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        commonJs.forms = document.getElementsByClassName('needs-validation');
        // Loop over them and prevent submission
        commonJs.validation = Array.prototype.filter.call(commonJs.forms, function(form) {
            form.addEventListener('submit', function(event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }

    commonJs.setValidation();
});