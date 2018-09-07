'use strict'
$(function(){
    var Slide = {
        $wrap : $('.wrap'),
        $slide : $('.slide'),
        $slideControl : $('.slide_control'),
        $imgs : $('.slide').find('img'),
        $left : $('.btn_left'),
        $right : $('.btn_right'),
        readyImgsWidth : {},
        readyImgsHeight : {},
        index : 7
    };

    Slide.initialize = function($imgs){
        var readyImgsHeight = {};
        var isLoadedAll = function(){//모든 이미지가 로드됬는지 height값을 통해 확인
            var isLoaded = false;
            for(var loaded in readyImgsHeight){
                if(!readyImgsHeight[loaded]){
                    isLoaded = false;
                    break;
                } else {
                    isLoaded = true;
                }
            }
            return isLoaded;
        }

        $imgs.each(function(num,ele){//각각의 이미지가 로드될때마다 height값을 저장 후 isLoadedAll호출
            readyImgsHeight[num] = 0;
            var $ele = $(ele);
            var img = new Image();

            img.onload = function(){
                readyImgsHeight[num] = img.height;
                if(isLoadedAll()){
                    Slide.readyImgsHeight = readyImgsHeight;
                    Slide.createDots(Slide.$imgs);
                    Slide.reset();
                }
            };
            img.src = $ele[0].src;
        });

    }

    Slide.reset = function(){
        Slide.setSlideWidth(Slide.getSlideWidth(Slide.$imgs));
        Slide.setPosition(Slide.index);
    }

    Slide.setSlideWidth = function(width){
        Slide.$slide.width(width);
    }

    Slide.getSlideWidth = function($imgs){
        var slideWidth = 1;
        $imgs.each(function(idx,ele){
            var w = $(ele).closest('li').outerWidth();
            Slide.readyImgsWidth[idx] = w;
            slideWidth += w
        });
        return slideWidth;
    }

    Slide.createDots = function($imgs){
        var $dotSection = Slide.$slideControl.children('.slide_dot');
        $dotSection.html('');
        $imgs.each(function(idx){
            $dotSection.append('<a href="#">'+idx+'</a>');
        });
    }

    Slide.setPosition = function(index){
        var w = Slide.$wrap.outerWidth()/2;
        var prevW = 0;
        for(var i=0,len=index; i<=len; i++){
            prevW -= Slide.readyImgsWidth[i-1] > 0 ? Slide.readyImgsWidth[i-1] : 0;
        }
        Slide.$slide.css('left', w+prevW-Slide.readyImgsWidth[index]/2);
        Slide.$slideControl.children('.slide_dot').children('a').removeClass('on').eq(index).addClass('on');
    }

    Slide.$left.on('click', function(e){
        Slide.index = (Slide.$imgs.length+Slide.index-1)%Slide.$imgs.length
        Slide.setPosition(Slide.index);
        return false;
    });
    
    Slide.$right.on('click', function(e){
        Slide.index = (Slide.index+=1)%Slide.$imgs.length;
        Slide.setPosition(Slide.index);
        return false;
    });

    Slide.$slideControl.on('click', 'a', function(e){
        var index = $(this).index();
        Slide.index = index;
        Slide.setPosition(index);
        return false;
    });

    Slide.initialize(Slide.$imgs);

    $(window).on('resize', function(){
        Slide.reset();
    });
});