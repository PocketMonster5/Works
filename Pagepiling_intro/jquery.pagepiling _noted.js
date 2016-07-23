/*!
 * pagepiling.js 1.5.3
 *
 * https://github.com/alvarotrigo/pagePiling.js
 * MIT licensed
 *
 * Copyright (C) 2013 alvarotrigo.com - A project by Alvaro Trigo
 */
(function ($, document, window, undefined) {
    'use strict';

    $.fn.pagepiling = function (custom) {
        var PP = $.fn.pagepiling;
        var container = $(this);											//$(this)获取当前操作对象（经过jQuery包装支持的）
        var lastScrolledDestiny;											//上次滑动的目标
        var lastAnimation = 0;												//用于控制动画的时间记录变量，具体使用在后面
        var isTouch = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0) || (navigator.maxTouchPoints));	//有关触碰的变量，用在触碰事件函数中，ontouchstart是触摸事件的名称，msMaxTouchPoints给出触摸设备支持的同时触碰点的最大数量
        var touchStartY = 0, touchStartX = 0, touchEndY = 0, touchEndX = 0;						//触碰坐标，在touchStartHandler函数中使用
        var scrollings = [];												//用于记录鼠标滚轮事件数据的数组

        //Defines the delay to take place before being able to scroll to the next section
        //BE CAREFUL! Not recommened to change it under 400 for a good behavior in laptops and
        //Apple devices (laptops, mouses...)
        var scrollDelay = 600;												//延迟效果

        // Create some defaults, extending them with any options that were provided
        var options = $.extend(true, {
            direction: 'vertical',
            menu: null,
            verticalCentered: true,
            sectionsColor: [],
            anchors: [],
            scrollingSpeed: 700,
            easing: 'easeInQuart',
            loopBottom: false,
            loopTop: false,
            css3: true,
            navigation: {
                textColor: '#000',
                bulletsColor: '#000',
                position: 'right',
                tooltips: []
            },
            normalScrollElements: null,
            normalScrollElementTouchThreshold: 5,
            touchSensitivity: 5,
            keyboardScrolling: true,
            sectionSelector: '.section',
            animateAnchor: false,

            //events
            afterLoad: null,												//回调函数
            onLeave: null,
            afterRender: null
        }, custom);


        //easeInQuart animation included in the plugin
        $.extend($.easing,{ easeInQuart: function (x, t, b, c, d) { return c*(t/=d)*t*t*t + b; }});			//加入easing easeInQuart动画插件

        /**
        * Defines the scrolling speed
        */
        PP.setScrollingSpeed = function(value){										//滑动速率调节
           options.scrollingSpeed = value;
        };

        /**
        * Adds or remove the possiblity of scrolling through sections by using the mouse wheel or the trackpad.
        */
        PP.setMouseWheelScrolling = function (value){									//鼠标滚轮启用/禁用
            if(value){
                addMouseWheelHandler();											//这个函数写在后面
            }else{
                removeMouseWheelHandler();										//这个也写在后面
            }
        };

        /**
        * Adds or remove the possiblity of scrolling through sections by using the mouse wheel/trackpad or touch gestures.
        */
        PP.setAllowScrolling = function (value){									//这个函数和上面那个类似，但是还包括了对触摸的设定
            if(value){
                PP.setMouseWheelScrolling(true);
                addTouchHandler();
            }else{
                PP.setMouseWheelScrolling(false);
                removeTouchHandler();
            }
        };

        /**
        * Adds or remove the possiblity of scrolling through sections by using the keyboard arrow keys
        */
        PP.setKeyboardScrolling = function (value){									//键盘启用/禁用
            options.keyboardScrolling = value;
        };

        /**
        * Moves sectio up
        */
        PP.moveSectionUp = function () {										//上移
            var prev = $('.pp-section.active').prev('.pp-section');							//prev()是jquery的一个函数，在这里应该就是获得当前所在部分的上一个同胞元素（部分）；另外，pp-section是option的class，这一定义写在后面

            //looping to the bottom if there's no more sections above
            if (!prev.length && options.loopTop) {									//用loopTop来控制移动到最上面的部分的时候是否跳至最后一个部分
                prev = $('.pp-section').last();										//last()和prev()类似，将匹配到最后一个部分
            }

            if (prev.length) {
                scrollPage(prev);
            }
        };

        /**
        * Moves sectio down
        */
        PP.moveSectionDown = function () {										//下移，和上移对应
            var next = $('.pp-section.active').next('.pp-section');							//next()和prev()对应

            //looping to the top if there's no more sections below
            if(!next.length && options.loopBottom){									//loopBottom控制
                next = $('.pp-section').first();									//first()和last()对应
            }

            if (next.length) {
                scrollPage(next);
            }
        };

        /**
        * Moves the site to the given anchor or index
        */
        PP.moveTo = function (section){											//移到指定部分
            var destiny = '';												//定义并初始化目标变量

            if(isNaN(section)){												//isNaN()检查section是否为非数字值，如果是的话就返回true
                destiny = $(document).find('[data-anchor="'+section+'"]');						//这样的话就是其他链接了，这个数组的具体内容写在后面？
            }else{
                destiny = $('.pp-section').eq( (section -1) );								//eq()从0开始计数找到第section个部分将它赋给destiny
            }


            if(destiny.length > 0){
                scrollPage(destiny);
            }
        };

        //adding internal class names to void problem with common ones
        $(options.sectionSelector).each(function(){									//可以看到在这里option里面的相关元素都被添加上了pp-section这个class名
            $(this).addClass('pp-section');
        });

        //if css3 is not supported, it will use jQuery animations
        if(options.css3){
            options.css3 = support3d();											//就像注释说的，support3d()写在后面了
        }

        $(container).css({
            'overflow' : 'hidden',
            '-ms-touch-action': 'none',  /* Touch detection for Windows 8 */
            'touch-action': 'none'       /* IE 11 on Windows Phone 8.1*/
        });

        //init
        PP.setAllowScrolling(true);

        //creating the navigation dots
        if (!$.isEmptyObject(options.navigation) ) {									//判断是否为空对象，如果是就返回true，在这里如果不是空对象就执行if内的语句
            addVerticalNavigation();											//添加一个垂直方向的导航条。这个函数定义在后面
        }

         var zIndex = $('.pp-section').length;										//这个变量与页面覆盖有关

        $('.pp-section').each(function (index) {
            $(this).data('data-index', index);										//data()用来附加或取用元素的数据
            $(this).css('z-index', zIndex);										//css()用来匹配元素样式、属性

            //if no active section is defined, the 1st one will be the default one
            if (!index && $('.pp-section.active').length === 0) {							//以下应该是一些默认的初始化
                $(this).addClass('active');
            }

            if (typeof options.anchors[index] !== 'undefined') {
                $(this).attr('data-anchor', options.anchors[index]);
            }

            if (typeof options.sectionsColor[index] !== 'undefined') {
                $(this).css('background-color', options.sectionsColor[index]);
            }

            if(options.verticalCentered && !$(this).hasClass('pp-scrollable')){						//hasClass()检查是否包含指定的class
                addTableClass($(this));											//用于修改页面元素的样式有助于更好地显示的函数。定义在后面一点的地方
            }

            zIndex = zIndex - 1;
        }).promise().done(function(){											//语句完成后返回promise继续执行
            //vertical centered of the navigation + first bullet active
            if(options.navigation){
                $('#pp-nav').css('margin-top', '-' + ($('#pp-nav').height()/2) + 'px');
                $('#pp-nav').find('li').eq($('.pp-section.active').index('.pp-section')).find('a').addClass('active');
            }

            $(window).on('load', function() {
                scrollToAnchor();											//用于获取url中的链接的函数，定义见后
            });

            $.isFunction( options.afterRender ) && options.afterRender.call( this);					//call()实现对象的替换
        });

        /**
        * Enables vertical centering by wrapping the content and the use of table and table-cell
        */
        function addTableClass(element){
            element.addClass('pp-table').wrapInner('<div class="pp-tableCell" style="height:100%" />');			//wrapInner()使用指定的HTML内容或元素，来包裹每个被选元素中的所有内容 (inner HTML)，在这里相当于修改element里所有内容的样式
        }


       /**
        * Returns `up` or `down` depending on the scrolling movement to reach its destination
        * from the current section.
        */
        function getYmovement(destiny){											//判断需要上移还是下移
            var fromIndex = $('.pp-section.active').index('.pp-section');						//index()获得pp-section相对于pp-section.active的index位置
            var toIndex = destiny.index('.pp-section');									//同理

            if(fromIndex > toIndex){
                return 'up';
            }
            return 'down';
        }

        /**
        * Scrolls the page to the given destination
        */
        function scrollPage(destination, animated) {									//在前面出现多次的翻页函数
            var v ={													//对象创建
                destination: destination,
                animated: animated,
                activeSection: $('.pp-section.active'),
                anchorLink: destination.data('anchor'),
                sectionIndex: destination.index('.pp-section'),
                toMove: destination,
                yMovement: getYmovement(destination),
                leavingSection: $('.pp-section.active').index('.pp-section') + 1
            };

            //quiting when activeSection is the target element
            if(v.activeSection.is(destination)){ return; }								//如果在这一页就不用动了

            if(typeof v.animated === 'undefined'){
                v.animated = true;
            }

            if(typeof v.anchorLink !== 'undefined'){
                setURLHash(v.anchorLink, v.sectionIndex);								//修改url hash的内容，写在后面
            }

            v.destination.addClass('active').siblings().removeClass('active');						//siblings()查找所有同胞元素（不包括自己）

            v.sectionsToMove = getSectionsToMove(v);									//获得根据是向上还是向下移动返回部分section对象的函数，写在后面

            //scrolling down (moving sections up making them disappear)
            if (v.yMovement === 'down') {
                v.translate3d = getTranslate3d();									//用于获取CSS3的translated3d转换，写在后面
                v.scrolling = '-100%';

                if(!options.css3){
                    v.sectionsToMove.each(function(index){
                        if(index != v.activeSection.index('.pp-section')){
                            $(this).css(getScrollProp(v.scrolling));							//调用jQuery翻页动画效果，写在后面
                        }
                    });
                }

                v.animateSection = v.activeSection;
            }

            //scrolling up (moving section down to the viewport)
            else {
                v.translate3d = 'translate3d(0px, 0px, 0px)';
                v.scrolling = '0';

                v.animateSection = destination;
            }

            $.isFunction(options.onLeave) && options.onLeave.call(this, v.leavingSection, (v.sectionIndex + 1), v.yMovement);

            performMovement(v);												//动画效果函数，写在后面

            activateMenuElement(v.anchorLink);										//初始化menu中元素的函数，写在后面
            activateNavDots(v.anchorLink, v.sectionIndex);								//初始化navigation dots的函数写在后面
            lastScrolledDestiny = v.anchorLink;
            var timeNow = new Date().getTime();										//获得当前时间
            lastAnimation = timeNow;
        }

        /**
        * Performs the movement (by CSS3 or by jQuery)
        */
        function performMovement(v){											//动画发生函数
            if(options.css3){
                transformContainer(v.animateSection, v.translate3d, v.animated);					//transformContainer()为animateSection添加CSS3转换样式，写在后面
                v.sectionsToMove.each(function(){
                    transformContainer($(this), v.translate3d, v.animated);
                });

                setTimeout(function () {										//载入后延迟指定的时间，然后去执行指定的函数
                    afterSectionLoads(v);										//加载完指定的部分后执行afterLoad的事项，写在后面
                }, options.scrollingSpeed);
            }else{
                v.scrollOptions = getScrollProp(v.scrolling);

                if(v.animated){
                    v.animateSection.animate(										//animate()执行了动画过程
                        v.scrollOptions,
                    options.scrollingSpeed, options.easing, function () {
                        readjustSections(v);										//用于载入新的部分后重新调整背景的函数。写在后面
                        afterSectionLoads(v);
                    });
                }else{
                    v.animateSection.css(getScrollProp(v.scrolling));
                    setTimeout(function(){
                        readjustSections(v);
                        afterSectionLoads(v);
                    },400);
                }
            }
        }

        /**
        * Actions to execute after a secion is loaded
        */
        function afterSectionLoads(v){
            //callback (afterLoad) if the site is not just resizing and readjusting the slides
            $.isFunction(options.afterLoad) && options.afterLoad.call(this, v.anchorLink, (v.sectionIndex + 1));
        }


        function getSectionsToMove(v){
            var sectionToMove;

            if(v.yMovement === 'down'){
                sectionToMove = $('.pp-section').map(function(index){							//map()把每个元素通过函数传递到当前匹配集合中，生成包含返回值的新对象

                    if (index < v.destination.index('.pp-section')){
                        return $(this);
                    }
                });
            }else{
                sectionToMove = $('.pp-section').map(function(index){
                    if (index > v.destination.index('.pp-section')){
                        return $(this);
                    }
                });
            }

            return sectionToMove;
        }

        /**
        * Returns the sections to re-adjust in the background after the section loads.
        */
        function readjustSections(v){
            if(v.yMovement === 'up'){
                v.sectionsToMove.each(function(index){
                    $(this).css(getScrollProp(v.scrolling));
                });
            }
        }

        /**
        * Gets the property used to create the scrolling effect when using jQuery animations
        * depending on the plugin direction option.
        */
        function getScrollProp(propertyValue){										//这个函数调用了jquery的翻页动画效果
            if(options.direction === 'vertical'){
                return {'top': propertyValue};
            }
            return {'left': propertyValue};
        }

        /**
        * Scrolls the site without anymations (usually used in the background without the user noticing it)
        */
        function silentScroll(section, offset){										//不采用动画
            if (options.css3) {
                transformContainer(section, getTranslate3d(), false);
            }
            else{
                section.css(getScrollProp(offset));
            }
        }

        /**
        * Sets the URL hash for a section with slides
        */
        function setURLHash(anchorLink, sectionIndex){									//hash属性是一个可读可写的字符串，该字符串是URL的锚部分（从#号开始的部分）
            if(options.anchors.length){
                location.hash = anchorLink;

                setBodyClass(location.hash);
            }else{
                setBodyClass(String(sectionIndex));
            }
        }

        /**
        * Sets a class for the body of the page depending on the active section / slide
        */
        function setBodyClass(text){
            //removing the #
            text = text.replace('#','');

            //removing previous anchor classes
            $('body')[0].className = $('body')[0].className.replace(/\b\s?pp-viewing-[^\s]+\b/g, '');

            //adding the current anchor
            $('body').addClass('pp-viewing-' + text);
        }

        //TO DO
        function scrollToAnchor(){
            //getting the anchor link in the URL and deleting the `#`
            var value =  window.location.hash.replace('#', '');
            var sectionAnchor = value;
            var section = $(document).find('.pp-section[data-anchor="'+sectionAnchor+'"]');

            if(section.length > 0){  //if theres any #
                scrollPage(section, options.animateAnchor);
            }
        }

        /**
        * Determines if the transitions between sections still taking place.
        * The variable `scrollDelay` adds a "save zone" for devices such as Apple laptops and Apple magic mouses
        */
        function isMoving(){												//判断连续2次的翻页操作是否小于指定的时间，也就是说页面动画是否还在进行
            var timeNow = new Date().getTime();
            // Cancel scroll if currently animating or within quiet period
            if (timeNow - lastAnimation < scrollDelay + options.scrollingSpeed) {
                return true;
            }
            return false;
        }

        //detecting any change on the URL to scroll to the given anchor link
        //(a way to detect back history button as we play with the hashes on the URL)
        $(window).on('hashchange', hashChangeHandler);

        /**
        * Actions to do when the hash (#) in the URL changes.
        */
        function hashChangeHandler(){
            var value =  window.location.hash.replace('#', '').split('/');
            var sectionAnchor = value[0];

            if(sectionAnchor.length){
                /*in order to call scrollpage() only once for each destination at a time
                It is called twice for each scroll otherwise, as in case of using anchorlinks `hashChange`
                event is fired on every scroll too.*/
                if (sectionAnchor && sectionAnchor !== lastScrolledDestiny)  {
                    var section;

                    if(isNaN(sectionAnchor)){
                        section = $(document).find('[data-anchor="'+sectionAnchor+'"]');
                    }else{
                        section = $('.pp-section').eq( (sectionAnchor -1) );
                    }
                    scrollPage(section);
                }
            }
        }

        /**
        * Cross browser transformations
        */
        function getTransforms(translate3d) {
            return {
                '-webkit-transform': translate3d,									//分别是各浏览器的内核识别码
                    '-moz-transform': translate3d,
                    '-ms-transform': translate3d,
                    'transform': translate3d
            };
        }

        /**
         * Adds a css3 transform property to the container class with or without animation depending on the animated param.
         */
        function transformContainer(element, translate3d, animated) {
            element.toggleClass('pp-easing', animated);									//toggleClass()用来切换class(pp-easing)来设置动画

            element.css(getTransforms(translate3d));
        }

        /**
         * Sliding with arrow keys, both, vertical and horizontal
         */
        $(document).keydown(function (e) {										//这里可以更改键盘设置，keydown事件在按键按下时发生
            if(options.keyboardScrolling && !isMoving()){
                //Moving the main page with the keyboard arrows if keyboard scrolling is enabled
                switch (e.which) {
                        //up
                    case 38:
                    case 33:
                        PP.moveSectionUp();
                        break;

                        //down
                    case 40:
                    case 34:
                        PP.moveSectionDown();
                        break;

                        //Home
                    case 36:
                        PP.moveTo(1);
                        break;

                        //End
                    case 35:
                        PP.moveTo($('.pp-section').length);
                        break;

                        //left
                    case 37:
                        PP.moveSectionUp();
                        break;

                        //right
                    case 39:
                        PP.moveSectionDown();
                        break;

                    default:
                        return; // exit this handler for other keys
                }
            }
        });

        /**
        * If `normalScrollElements` is used, the mouse wheel scrolling will scroll normally
        * over the defined elements in the option.
        */
        if(options.normalScrollElements){
            $(document).on('mouseenter', options.normalScrollElements, function () {
                PP.setMouseWheelScrolling(false);
            });

            $(document).on('mouseleave', options.normalScrollElements, function(){
                PP.setMouseWheelScrolling(true);
            });
        }

        /**
         * Detecting mousewheel scrolling
         *
         * http://blogs.sitepointstatic.com/examples/tech/mouse-wheel/index.html
         * http://www.sitepoint.com/html5-javascript-mouse-wheel/
         */														//鼠标滚轮插件mousewheel
        var prevTime = new Date().getTime();

        function MouseWheelHandler(e) {											//鼠标移动检测
        	var curTime = new Date().getTime();

        	// cross-browser wheel delta
            e = e || window.event;											//这里有一些鼠标事件和参数，event区分滚动和点击，delta区分滚轮滚动方向，deltaX,deltaY分别为滚轮坐标值
            var value = e.wheelDelta || -e.deltaY || -e.detail;
            var delta = Math.max(-1, Math.min(1, value));

            var horizontalDetection = typeof e.wheelDeltaX !== 'undefined' || typeof e.deltaX !== 'undefined';
            var isScrollingVertically = (Math.abs(e.wheelDeltaX) < Math.abs(e.wheelDelta)) || (Math.abs(e.deltaX ) < Math.abs(e.deltaY) || !horizontalDetection);

			//Limiting the array to 150 (lets not waste memory!)
            if(scrollings.length > 149){
                scrollings.shift();											//shift()用于把第一个元素删除并返回其值，为了节省内存
            }

            //keeping record of the previous scrollings
            scrollings.push(Math.abs(value));										//push()向末尾添加元素并返回长度

            //time difference between the last scroll and the current one
            var timeDiff = curTime-prevTime;
            prevTime = curTime;

            //haven't they scrolled in a while?
            //(enough to be consider a different scrolling action to scroll another section)
            if(timeDiff > 200){												//重新检测判据
                //emptying the array, we dont care about old scrollings for our averages
                scrollings = [];											//置空
            }

            if(!isMoving()){
                var activeSection = $('.pp-section.active');
                var scrollable = isScrollable(activeSection);

                var averageEnd = getAverage(scrollings, 10);								//getAverage()定义见后
                var averageMiddle = getAverage(scrollings, 70);
                var isAccelerating = averageEnd >= averageMiddle;

                if(isAccelerating && isScrollingVertically){								//如果加速而且垂直移动
	                //scrolling down?
	                if (delta < 0) {
	                    scrolling('down', scrollable);

	                //scrolling up?
	                }else if(delta>0){
	                    scrolling('up', scrollable);
	                }
	            }

                return false;
            }
         }

        /**
        * Gets the average of the last `number` elements of the given array.
        */
        function getAverage(elements, number){										//获得倒数number个数的平均数
            var sum = 0;

            //taking `number` elements from the end to make the average, if there are not enought, 1
            var lastElements = elements.slice(Math.max(elements.length - number, 1));					//这里slice()将elements中的数分为2组，分界点就是max{elements.length-number,1}

            for(var i = 0; i < lastElements.length; i++){
                sum = sum + lastElements[i];
            }

            return Math.ceil(sum/number);										//注意结果向上取整
        }

        /**
        * Determines the way of scrolling up or down:
        * by 'automatically' scrolling a section or by using the default and normal scrolling.
        */
        function scrolling(type, scrollable){										//翻页样式
            var check;													//check参数定义为翻页是否到达最后/最前部分，在后面的isScrolled()函数被使用
            var scrollSection;

            if(type == 'down'){
                check = 'bottom';
                scrollSection = PP.moveSectionDown;
            }else{
                check = 'top';
                scrollSection = PP.moveSectionUp;
            }

            if(scrollable.length > 0 ){
                //is the scrollbar at the start/end of the scroll?
                if(isScrolled(check, scrollable)){
                    scrollSection();
                }else{
                    return true;
                }
            }else{
                //moved up/down
                scrollSection();
            }
        }

        /**
        * Return a boolean depending on whether the scrollable element is at the end or at the start of the scrolling
        * depending on the given type.
        */
        function isScrolled(type, scrollable){
            if(type === 'top'){
                return !scrollable.scrollTop();
            }else if(type === 'bottom'){
                return scrollable.scrollTop() + 1 + scrollable.innerHeight() >= scrollable[0].scrollHeight;
            }
        }

         /**
        * Determines whether the active section or slide is scrollable through and scrolling bar
        */
        function isScrollable(activeSection){
            return activeSection.filter('.pp-scrollable');								//filter()筛选带有'.pp-scrollable'的元素
        }

        /**
        * Removes the auto scrolling action fired by the mouse wheel and tackpad.
        * After this function is called, the mousewheel and trackpad movements won't scroll through sections.
        */
        function removeMouseWheelHandler(){
            if (container.get(0).addEventListener) {
                container.get(0).removeEventListener('mousewheel', MouseWheelHandler, false); //IE9, Chrome, Safari, Oper
                container.get(0).removeEventListener('wheel', MouseWheelHandler, false); //Firefox
            } else {
                container.get(0).detachEvent('onmousewheel', MouseWheelHandler); //IE 6/7/8
            }
        }

        /**
        * Adds the auto scrolling action for the mouse wheel and tackpad.
        * After this function is called, the mousewheel and trackpad movements will scroll through sections
        */
        function addMouseWheelHandler(){										//这个函数控制鼠标滚轮翻页的启用
            if (container.get(0).addEventListener) {									//addEventListener()向container.get(0)添加了'mousewheel'事件，false指这个事件句柄在冒泡阶段执行，冒泡和捕获指相对于DOM tree的触发顺序是由内至外还是由外至内
                container.get(0).addEventListener('mousewheel', MouseWheelHandler, false); //IE9, Chrome, Safari, Oper
                container.get(0).addEventListener('wheel', MouseWheelHandler, false); //Firefox
            } else {
                container.get(0).attachEvent('onmousewheel', MouseWheelHandler); //IE 6/7/8				//老版本IE对应的函数是attachEvent()
            }
        }

        /**
        * Adds the possibility to auto scroll through sections on touch devices.
        */
        function addTouchHandler(){											//针对触摸设备的函数
            if(isTouch){
                //Microsoft pointers
                var MSPointer = getMSPointer();										//获取指针事件的函数，写在后面

                container.off('touchstart ' +  MSPointer.down).on('touchstart ' + MSPointer.down, touchStartHandler);
                container.off('touchmove ' + MSPointer.move).on('touchmove ' + MSPointer.move, touchMoveHandler);
            }
        }

        /**
        * Removes the auto scrolling for touch devices.
        */
        function removeTouchHandler(){
            if(isTouch){
                //Microsoft pointers
                var MSPointer = getMSPointer();

                container.off('touchstart ' + MSPointer.down);
                container.off('touchmove ' + MSPointer.move);
            }
        }

        /*
        * Returns and object with Microsoft pointers (for IE<11 and for IE >= 11)
        * http://msdn.microsoft.com/en-us/library/ie/dn304886(v=vs.85).aspx
        */
        function getMSPointer(){											//指针事件适配函数，对老版本IE和其他版本兼容
            var pointer;

            //IE >= 11 & rest of browsers
            if(window.PointerEvent){
                pointer = { down: 'pointerdown', move: 'pointermove', up: 'pointerup'};
            }

            //IE < 11
            else{
                pointer = { down: 'MSPointerDown', move: 'MSPointerMove', up: 'MSPointerUp'};
            }

            return pointer;
        }

        /**
        * Gets the pageX and pageY properties depending on the browser.
        * https://github.com/alvarotrigo/fullPage.js/issues/194#issuecomment-34069854
        */
        function getEventsPage(e){											//获取pageX和pageY
            var events = new Array();

            events.y = (typeof e.pageY !== 'undefined' && (e.pageY || e.pageX) ? e.pageY : e.touches[0].pageY);
            events.x = (typeof e.pageX !== 'undefined' && (e.pageY || e.pageX) ? e.pageX : e.touches[0].pageX);

            return events;
        }

        /**
        * As IE >= 10 fires both touch and mouse events when using a mouse in a touchscreen
        * this way we make sure that is really a touch event what IE is detecting.
        */
        function isReallyTouch(e){
            //if is not IE   ||  IE is detecting `touch` or `pen`
            return typeof e.pointerType === 'undefined' || e.pointerType != 'mouse';
        }

        /**
        * Getting the starting possitions of the touch event
        */
        function touchStartHandler(event){										//感知到移动事件后，记录初始位置
            var e = event.originalEvent;

            if(isReallyTouch(e)){
                var touchEvents = getEventsPage(e);
                touchStartY = touchEvents.y;
                touchStartX = touchEvents.x;
            }
        }

        /* Detecting touch events
        */
        function touchMoveHandler(event){
            var e = event.originalEvent;

            // additional: if one of the normalScrollElements isn't within options.normalScrollElementTouchThreshold hops up the DOM chain
            if ( !checkParentForNormalScrollElement(event.target) && isReallyTouch(e) ) {				//递归检查选择的元素列是否至少有一个在options.normalScrollElements里面

                var activeSection = $('.pp-section.active');
                var scrollable = isScrollable(activeSection);

                if(!scrollable.length){
                    event.preventDefault();										//preventDefault()将通知 Web 浏览器不要执行与事件关联的默认动作（如果存在这样的动作）
                }

                if (!isMoving()) {
                    var touchEvents = getEventsPage(e);
                    touchEndY = touchEvents.y;
                    touchEndX = touchEvents.x;

                  //$('body').append('<span style="position:fixed; top: 250px; left: 20px; z-index:88; font-size: 25px; color: #000;">touchEndY: ' + touchEndY  + '</div>');

                    //X movement bigger than Y movement?
                    if (options.direction === 'horizontal' && Math.abs(touchStartX - touchEndX) > (Math.abs(touchStartY - touchEndY))) {
                        //is the movement greater than the minimum resistance to scroll?
                        if (Math.abs(touchStartX - touchEndX) > (container.width() / 100 * options.touchSensitivity)) {
                            if (touchStartX > touchEndX) {
                                scrolling('down', scrollable);
                            } else if (touchEndX > touchStartX) {
                                scrolling('up', scrollable);
                            }
                        }
                    } else {
                        if (Math.abs(touchStartY - touchEndY) > (container.height() / 100 * options.touchSensitivity)) {
                            if (touchStartY > touchEndY) {
                                scrolling('down', scrollable);
                            } else if (touchEndY > touchStartY) {
                                scrolling('up', scrollable);
                            }
                        }
                    }
                }
            }
        }

        /**
         * recursive function to loop up the parent nodes to check if one of them exists in options.normalScrollElements
         * Currently works well for iOS - Android might need some testing
         * @param  {Element} el  target element / jquery selector (in subsequent nodes)
         * @param  {int}     hop current hop compared to options.normalScrollElementTouchThreshold
         * @return {boolean} true if there is a match to options.normalScrollElements
         */
        function checkParentForNormalScrollElement (el, hop) {
            hop = hop || 0;
            var parent = $(el).parent();

            if (hop < options.normalScrollElementTouchThreshold &&
                parent.is(options.normalScrollElements) ) {								//这里is()检测是否有元素匹配给定的参数
                return true;
            } else if (hop == options.normalScrollElementTouchThreshold) {
                return false;
            } else {
                return checkParentForNormalScrollElement(parent, ++hop);
            }
        }


        /**
        * Creates a vertical navigation bar.
        */
        function addVerticalNavigation(){										//一些界面设定函数
            $('body').append('<div id="pp-nav"><ul></ul></div>');							//在选择的元素结尾插入指定内容
            var nav = $('#pp-nav');

            nav.css('color', options.navigation.textColor);

            nav.addClass(options.navigation.position);

            for(var cont = 0; cont < $('.pp-section').length; cont++){
                var link = '';
                if(options.anchors.length){
                    link = options.anchors[cont];
                }
                if(options.navigation.tooltips !== 'undefined'){
                    var tooltip = options.navigation.tooltips[cont];
                    if(typeof tooltip === 'undefined'){
                        tooltip = '';
                    }
                }

                nav.find('ul').append('<li data-tooltip="' + tooltip + '"><a href="#' + link + '"><span></span></a></li>');
            }

            nav.find('span').css('border-color', options.navigation.bulletsColor);
        }

        /**
        * Scrolls to the section when clicking the navigation bullet
        */
        $(document).on('click touchstart', '#pp-nav a', function(e){
            e.preventDefault();
            var index = $(this).parent().index();

            scrollPage($('.pp-section').eq(index));
        });

        /**
        * Navigation tooltips
        */
        $(document).on({
            mouseenter: function(){
                var tooltip = $(this).data('tooltip');
                $('<div class="pp-tooltip ' + options.navigation.position +'">' + tooltip + '</div>').hide().appendTo($(this)).fadeIn(200);
            },
            mouseleave: function(){
                $(this).find('.pp-tooltip').fadeOut(200, function() {
                    $(this).remove();
                });
            }
        }, '#pp-nav li');

         /**
         * Activating the website navigation dots according to the given slide name.
         */
        function activateNavDots(name, sectionIndex){
            if(options.navigation){
                $('#pp-nav').find('.active').removeClass('active');
                if(name){
                    $('#pp-nav').find('a[href="#' + name + '"]').addClass('active');
                }else{
                    $('#pp-nav').find('li').eq(sectionIndex).find('a').addClass('active');
                }
            }
        }

        /**
         * Activating the website main menu elements according to the given slide name.
         */
        function activateMenuElement(name){
            if(options.menu){
                $(options.menu).find('.active').removeClass('active');
                $(options.menu).find('[data-menuanchor="'+name+'"]').addClass('active');
            }
        }

        /**
        * Checks for translate3d support
        * @return boolean
        * http://stackoverflow.com/questions/5661671/detecting-transform-translate3d-support
        */
        function support3d(){
            var el = document.createElement('p'),
                has3d,
                transforms = {
                    'webkitTransform':'-webkit-transform',  								//-webkit代表chrome内核识别码
                    'OTransform':'-o-transform',									//-o代表opera内核识别码
                    'msTransform':'-ms-transform',									//-ms代表IE内核识别码
                    'MozTransform':'-moz-transform',									//-moz代表火狐内核识别码
                    'transform':'transform'
                };

            // Add it to the body to get the computed style.
            document.body.insertBefore(el, null);

            for (var t in transforms) {
                if (el.style[t] !== undefined) {
                    el.style[t] = 'translate3d(1px,1px,1px)';								//translate3d(x,y,z)用于定义3d转化
                    has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);				//getComputedStyle()用于获取当前元素所有最终使用的CSS样式对象，getPropertyValue()进一步获取元素的CSS属性值
                }
            }

            document.body.removeChild(el);										//removeChild()用于删除一个项目

            return (has3d !== undefined && has3d.length > 0 && has3d !== 'none');
        }

        /**
        * Gets the translate3d property to apply when using css3:true depending on the `direction` option.
        */
        function getTranslate3d(){
            if (options.direction !== 'vertical') {
                  return 'translate3d(-100%, 0px, 0px)';
            }

            return 'translate3d(0px, -100%, 0px)';
        }

    };
})(jQuery, document, window);
