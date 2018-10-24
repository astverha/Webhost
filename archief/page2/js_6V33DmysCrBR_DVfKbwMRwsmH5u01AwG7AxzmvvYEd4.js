jQuery.noConflict();

jQuery(document).ready(function ($) {
    function sendAjaxToLoadNewLOD(page, pid) {
        $.ajax({
            type: "POST",
            url: "/load/lodlist",
            dataType: "json",
            data: {page: page, pid: pid},
        }).done(function (data) {
            var $container = $(".js-load-linked-open-data");
            if (!data.length) {
                $container.parent().hide();
                return false;
            }

            var html = "",
                currentLocation = $(".in-popup__metadata").attr("data-base-url"),
                page = $("#pagechoice option:selected").attr("data-key");

            $.each(data, function (i, item) {
                var searchLink = currentLocation + "/" + page + "?search=" + item.name,
                    namenlijstLink = "https://database.namenlijst.be/#/person/_id=" + item.external_id,
                    qualityClass = "linked-open-data__icon--quality-";

                if (item.quality < 40) {
                    qualityClass += "red";
                } else if (item.quality >= 70) {
                    qualityClass += "green";
                } else {
                    qualityClass += "orange";
                }

                html += "<div><a title=\"Kwaliteitsindicator\" class='linked-open-data__icon " + qualityClass + "'></a>" +
                    "<a title=\"Highlight de persoon in de krant\" class='linked-open-data__icon linked-open-data__icon--search' href='" +
                    searchLink + "'></a>" +
                    "<a title='Open link' target='_blank' " +
                    "class='linked-open-data__icon linked-open-data__icon--link' href='" +
                    namenlijstLink + "'></a><div class='linked-open-data__name'>" +
                    item.meta.name + "</div></div>";
            });
            $container.parent().show();
            $container.html(html);
        });
    }

    if ($(".js-load-linked-open-data")[0]) {
        var page = $("#pagechoice option:selected").attr("data-key");
        var pid = $(".asset-detail").attr("data-pid");
        sendAjaxToLoadNewLOD(page, pid);

        $("#pagechoice").on("change", function () {
            var page = $("#pagechoice option:selected").attr("data-key");
            var pid = $(".asset-detail").attr("data-pid");
            sendAjaxToLoadNewLOD(page, pid);
        });
    }

    $("#mediamosa-detail-add-to-collection-form").submit(function (event) {

        event.preventDefault();

        var form = $(this);
        var action = form.attr('action');
        var formData = $(this).serialize();

        $('.frm-add-collection input[type="submit"]').addClass('loading');

        $.ajax(
        {
            type: "POST",
            url: form.attr('action'),
            dataType: "json",
            data: formData
        }).done(function (data) //empty boxes when comment was submitted
        {
            html = '<div class="ajax-success">' + data[0].message + '</div>';

            $('.frm-add-collection input[type="submit"]').before(html);
            $('.frm-add-collection input[type="submit"]').removeClass('loading');
           setTimeout(function(){
                $('.ajax-success').slideUp('fast');
            }, 5000);
        });

    });

    if ( $("#smallmap").length > 0 ) {

        var map;

        L.control.zoom.position = 'topright';

        var mapbox_map = Drupal.settings.mapbox_map;
        var mapbox_api = Drupal.settings.mapbox_api;

        var mapbox = L.tileLayer('https://{s}.tiles.mapbox.com/v4/' + mapbox_map + '/{z}/{x}/{y}.png?access_token=' + mapbox_api);

        map = new L.Map('smallmap', {
            layers: [mapbox],
            center: [Drupal.settings.geocodes[0]['geocode_lat'], Drupal.settings.geocodes[0]['geocode_lon']],
            zoom: 14,
            scrollWheelZoom: false,
            zoomControl: false
        });

        // Add zoom control to the right
        var zoomControl = L.control.zoom({
            position: 'topright'
        });
        map.addControl(zoomControl);

        var icon = new L.DivIcon({
            html: '<div></div>',
            className: 'marker-single',
            iconSize: new L.Point(40, 40)
        });

        var markers = [];

        for (var key in Drupal.settings.geocodes) {
            var marker = new L.Marker(new L.latLng(Drupal.settings.geocodes[key]['geocode_lat'], Drupal.settings.geocodes[key]['geocode_lon']), {icon: icon});
            map.addLayer(marker);
            markers.push(marker);
        }
        // If there are more than 2 markers ignore 'center' and 'zoom' and show 2 markers
        if (markers.length > 1) {
            var group = new L.featureGroup(markers);
            map.fitBounds(group.getBounds());
        }
    }

    $('.frm-flag-asset .close-overlay').click(function (e) {
        e.preventDefault();
        $('.flag-overlay').fadeOut('fast');
    });


    $('#btnFlagAsset').click(function (e) {
        e.preventDefault();

        var asset = $('.frm-flag-asset').attr('data-asset');
        var body = $('.frm-flag-asset textarea').val();
        var flag = $('.frm-flag-asset select').val();

        $.post('/assets/flag', {"toelichting": body, "asset": asset, "flag": flag}, function (data) {
            $('.video-overlay').hide();
            $('.flag-overlay').hide();
        }, "json");
    });

    $('.icon-flags').click(function (e) {
        e.preventDefault();
        $('.flag-overlay').fadeIn('fast');
    });

    $('.favourite-toggle').click(function(e){
        console.log('Toggle');
        e.preventDefault();
        var asset = $(this).attr('data-id');
        var title = $(this).attr('data-title');

        var status = $(this).closest('span').hasClass("checked");

        var action = "set";
        if(status){
            $(this).closest('span').removeClass("checked");
            action = "remove";
            //subtract one from counter
            var placeholder = $(this).find('#favourite-counter').text();
            var total = parseInt(placeholder);
            var new_total = total - 1;
            $(this).find('#favourite-counter').text(new_total);
        }
        else{
            $(this).closest('span').addClass("checked");

            //add one to counter
            var placeholder = $(this).find('#favourite-counter').text();
            var total = parseInt(placeholder);
            var new_total = total + 1;
            $(this).find('#favourite-counter').text(new_total);
        }
        $.getJSON("/coll/"+action+"/"+asset+"/favourite/" + title , function(data){
            console.log(data);
        });
    });
    
//show ocr text ---->
    $("#open-panel").toggle(function() {
        var id = $('#pagechoice').val();
        var p = $("p", $('#ocr_text_' + id));
        var ocr_text = p.html();

        $(".olControlZoom").animate({right:'420'},500);
        $("#open-panel").animate({right:'375'},500);
        $('#ocr_text_' + id).animate({"opacity": "show", left:'-220px'},500);
        $('#ocr_text_' + id).css('position','absolute');
        $('#ocr_text_' + id).css('z-index','1000');

    }, function() {
        var id = $('#pagechoice').val();

        $('#ocr_text_' + id).animate({"opacity": "hide", left:'200px'},500);
        $(".olControlZoom").animate({right:'40px'},500);
        $("#open-panel").animate({right:'-30'},500);
        $('#ocr_text_' + id).css('position','relative');
        $('#ocr_text_' + id).css('z-index','0');  
    }); 
    
    $('#pagechoice').change(function(e){
        $('.ocr_text').animate({"opacity": "hide",left:0},0);
        $("#open-panel").animate({right:'-30'},0);
        $('.ocr_text').css('position','relative');
        $('.ocr_text').css('z-index','0');
    });
//<--------  

    $.fn.wrapInTag = function(opts) {
        var tag = opts.tag || 'strong',
            words = opts.words || [],
            style = opts.style || 'background-color: #ffff00;',
            regex = RegExp(words.join('|'), 'gi'),
            replacement = '<'+ tag +' style="'+ style +'">$&</'+ tag +'>';

        return this.html(function() {
            return $(this).text().replace(regex, replacement);
        });
    };

    $('.ocr_text').each(function(index) {
      component_asset_id = $(this).attr("data-asset-id");
      len = $(this).attr("data-length");
      var language = Drupal.settings.current_language;
      var dataSearchId = '"#dataSearch_' + component_asset_id + '"';

      if (len != 0) {
        search_keyword = escape($(dataSearchId, this).attr("data-search"));

        $(dataSearchId, this).load("/"+ language + "/component/description/" + component_asset_id + "?search=" + search_keyword);
      } else {
        $(dataSearchId, this).load("/" + language + "/component/description/" + component_asset_id);
      }
    });

});


;
/**
 * @file
 * Attaches behaviors for the Contextual module.
 */

(function ($) {

Drupal.contextualLinks = Drupal.contextualLinks || {};

/**
 * Attaches outline behavior for regions associated with contextual links.
 */
Drupal.behaviors.contextualLinks = {
  attach: function (context) {
    // added the wrapper to the parent
    $(".contextual-links-wrapper").parent().addClass('contextual-links-region clearfix');

    $('div.contextual-links-wrapper', context).once('contextual-links', function () {
      var $wrapper = $(this);
      var $region = $wrapper.closest('.contextual-links-region');
      var $links = $wrapper.find('ul.contextual-links');
      var $trigger = $('<a class="contextual-links-trigger" href="#" />').text(Drupal.t('Configure')).click(
        function () {
          $links.stop(true, true).slideToggle(100);
          $wrapper.toggleClass('contextual-links-active');
          return false;
        }
      );
      // Attach hover behavior to trigger and ul.contextual-links.
      $trigger.add($links).hover(
        function () { $region.addClass('contextual-links-region-active'); },
        function () { $region.removeClass('contextual-links-region-active'); }
      );
      // Hide the contextual links when user clicks a link or rolls out of the .contextual-links-region.
      $region.bind('mouseleave click', Drupal.contextualLinks.mouseleave);
      // Prepend the trigger.
      $wrapper.prepend($trigger);
    });
  }
};

/**
 * Disables outline for the region contextual links are associated with.
 */
Drupal.contextualLinks.mouseleave = function () {
  $(this)
    .find('.contextual-links-active').removeClass('contextual-links-active')
    .find('ul.contextual-links').hide();
};

})(jQuery);
;
/**
 * jQuery FocusPoint; version: 1.1.1
 * Author: http://jonathonmenz.com
 * Source: https://github.com/jonom/jquery-focuspoint
 * Copyright (c) 2014 J. Menz; MIT License
 * @preserve
 */
!function($){var t={reCalcOnWindowResize:!0,throttleDuration:17},n=function(t){var n=t.find("img").attr("src");t.data("imageSrc",n),i(n,function(n,i){t.data({imageW:i.width,imageH:i.height}),r(t)})},i=function(t,n){$("<img />").one("load",function(){n(null,{width:this.width,height:this.height})}).attr("src",t)},a=function(t,n){var i=!1;return function(){var a=Array.prototype.slice.call(arguments,0);return i?!1:(i=!0,void setTimeout(function(){i=!1,t.apply(null,a)},n))}},o=function(t,n,i,a,o){var r=Math.floor(n/2),e=(a+1)/2,u=Math.floor(i/t),f=Math.floor(e*u);o&&(f=u-f);var c=f-r,s=u-f,h=n-r;return h>s&&(c-=h-s),0>c&&(c=0),-100*c/n+"%"},r=function(t){var i=t.data("imageW"),a=t.data("imageH"),r=t.data("imageSrc");if(!i&&!a&&!r)return n(t);var e=t.width(),u=t.height(),f=parseFloat(t.data("focusX")),c=parseFloat(t.data("focusY")),s=t.find("img").first(),h=0,d=0;if(!(e>0&&u>0&&i>0&&a>0))return!1;var l=i/e,w=a/u;s.css({"max-width":"","max-height":""}),i>e&&a>u&&s.css(l>w?"max-height":"max-width","100%"),l>w?h=o(w,e,i,f):w>l&&(d=o(l,u,a,c,!0)),s.css({top:d,left:h})},e=$(window),u=function(t,n){var i=n.throttleDuration?a(function(){r(t)},n.throttleDuration):function(){r(t)},o=!1;return r(t),{adjustFocus:function(){return r(t)},windowOn:function(){return o?void 0:(e.on("resize",i),o=!0)},windowOff:function(){return o?(e.off("resize",i),o=!1,!0):void 0}}};$.fn.focusPoint=function(n){if("string"==typeof n)return this.each(function(){var t=$(this);t.data("focusPoint")[n]()});var i=$.extend({},t,n);return this.each(function(){var t=$(this),n=u(t,i);t.data("focusPoint")&&t.data("focusPoint").windowOff(),t.data("focusPoint",n),i.reCalcOnWindowResize&&n.windowOn()})},$.fn.adjustFocus=function(){return this.each(function(){r($(this))})}}(jQuery);;
/* Modernizr 2.7.1 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-fontface-opacity-rgba-textshadow-generatedcontent-csstransforms-csstransforms3d-csstransitions-video-shiv-mq-cssclasses-teststyles-testprop-testallprops-prefixes-domprefixes-css_overflow_scrolling-css_pointerevents-load
 */
;window.Modernizr=function(a,b,c){function B(a){j.cssText=a}function C(a,b){return B(n.join(a+";")+(b||""))}function D(a,b){return typeof a===b}function E(a,b){return!!~(""+a).indexOf(b)}function F(a,b){for(var d in a){var e=a[d];if(!E(e,"-")&&j[e]!==c)return b=="pfx"?e:!0}return!1}function G(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:D(f,"function")?f.bind(d||b):f}return!1}function H(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+p.join(d+" ")+d).split(" ");return D(b,"string")||D(b,"undefined")?F(e,b):(e=(a+" "+q.join(d+" ")+d).split(" "),G(e,b,c))}var d="2.7.1",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k,l=":)",m={}.toString,n=" -webkit- -moz- -o- -ms- ".split(" "),o="Webkit Moz O ms",p=o.split(" "),q=o.toLowerCase().split(" "),r={},s={},t={},u=[],v=u.slice,w,x=function(a,c,d,e){var f,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),l.appendChild(j);return f=["&#173;",'<style id="s',h,'">',a,"</style>"].join(""),l.id=h,(m?l:n).innerHTML+=f,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=g.style.overflow,g.style.overflow="hidden",g.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),g.style.overflow=k),!!i},y=function(b){var c=a.matchMedia||a.msMatchMedia;if(c)return c(b).matches;var d;return x("@media "+b+" { #"+h+" { position: absolute; } }",function(b){d=(a.getComputedStyle?getComputedStyle(b,null):b.currentStyle)["position"]=="absolute"}),d},z={}.hasOwnProperty,A;!D(z,"undefined")&&!D(z.call,"undefined")?A=function(a,b){return z.call(a,b)}:A=function(a,b){return b in a&&D(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=v.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(v.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(v.call(arguments)))};return e}),r.rgba=function(){return B("background-color:rgba(150,255,150,.5)"),E(j.backgroundColor,"rgba")},r.textshadow=function(){return b.createElement("div").style.textShadow===""},r.opacity=function(){return C("opacity:.55"),/^0.55$/.test(j.opacity)},r.csstransforms=function(){return!!H("transform")},r.csstransforms3d=function(){var a=!!H("perspective");return a&&"webkitPerspective"in g.style&&x("@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}",function(b,c){a=b.offsetLeft===9&&b.offsetHeight===3}),a},r.csstransitions=function(){return H("transition")},r.fontface=function(){var a;return x('@font-face {font-family:"font";src:url("https://")}',function(c,d){var e=b.getElementById("smodernizr"),f=e.sheet||e.styleSheet,g=f?f.cssRules&&f.cssRules[0]?f.cssRules[0].cssText:f.cssText||"":"";a=/src/i.test(g)&&g.indexOf(d.split(" ")[0])===0}),a},r.generatedcontent=function(){var a;return x(["#",h,"{font:0/0 a}#",h,':after{content:"',l,'";visibility:hidden;font:3px/1 a}'].join(""),function(b){a=b.offsetHeight>=3}),a},r.video=function(){var a=b.createElement("video"),c=!1;try{if(c=!!a.canPlayType)c=new Boolean(c),c.ogg=a.canPlayType('video/ogg; codecs="theora"').replace(/^no$/,""),c.h264=a.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/,""),c.webm=a.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,"")}catch(d){}return c};for(var I in r)A(r,I)&&(w=I.toLowerCase(),e[w]=r[I](),u.push((e[w]?"":"no-")+w));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)A(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof f!="undefined"&&f&&(g.className+=" "+(b?"":"no-")+a),e[a]=b}return e},B(""),i=k=null,function(a,b){function l(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function m(){var a=s.elements;return typeof a=="string"?a.split(" "):a}function n(a){var b=j[a[h]];return b||(b={},i++,a[h]=i,j[i]=b),b}function o(a,c,d){c||(c=b);if(k)return c.createElement(a);d||(d=n(c));var g;return d.cache[a]?g=d.cache[a].cloneNode():f.test(a)?g=(d.cache[a]=d.createElem(a)).cloneNode():g=d.createElem(a),g.canHaveChildren&&!e.test(a)&&!g.tagUrn?d.frag.appendChild(g):g}function p(a,c){a||(a=b);if(k)return a.createDocumentFragment();c=c||n(a);var d=c.frag.cloneNode(),e=0,f=m(),g=f.length;for(;e<g;e++)d.createElement(f[e]);return d}function q(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return s.shivMethods?o(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+m().join().replace(/[\w\-]+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(s,b.frag)}function r(a){a||(a=b);var c=n(a);return s.shivCSS&&!g&&!c.hasCSS&&(c.hasCSS=!!l(a,"article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")),k||q(a,c),a}var c="3.7.0",d=a.html5||{},e=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,f=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,g,h="_html5shiv",i=0,j={},k;(function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",g="hidden"in a,k=a.childNodes.length==1||function(){b.createElement("a");var a=b.createDocumentFragment();return typeof a.cloneNode=="undefined"||typeof a.createDocumentFragment=="undefined"||typeof a.createElement=="undefined"}()}catch(c){g=!0,k=!0}})();var s={elements:d.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",version:c,shivCSS:d.shivCSS!==!1,supportsUnknownElements:k,shivMethods:d.shivMethods!==!1,type:"default",shivDocument:r,createElement:o,createDocumentFragment:p};a.html5=s,r(b)}(this,b),e._version=d,e._prefixes=n,e._domPrefixes=q,e._cssomPrefixes=p,e.mq=y,e.testProp=function(a){return F([a])},e.testAllProps=H,e.testStyles=x,g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+u.join(" "):""),e}(this,this.document),function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))},Modernizr.addTest("overflowscrolling",function(){return Modernizr.testAllProps("overflowScrolling")}),Modernizr.addTest("pointerevents",function(){var a=document.createElement("x"),b=document.documentElement,c=window.getComputedStyle,d;return"pointerEvents"in a.style?(a.style.pointerEvents="auto",a.style.pointerEvents="x",b.appendChild(a),d=c&&c(a,"").pointerEvents==="auto",b.removeChild(a),!!d):!1});;
/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 *
 * Open source under the BSD License.
 *
 * Copyright Â© 2008 George McGinley Smith
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
  {
    def: 'easeOutQuad',
    swing: function (x, t, b, c, d) {
      //alert(jQuery.easing.default);
      return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
    },
    easeInQuad: function (x, t, b, c, d) {
      return c*(t/=d)*t + b;
    },
    easeOutQuad: function (x, t, b, c, d) {
      return -c *(t/=d)*(t-2) + b;
    },
    easeInOutQuad: function (x, t, b, c, d) {
      if ((t/=d/2) < 1) return c/2*t*t + b;
      return -c/2 * ((--t)*(t-2) - 1) + b;
    },
    easeInCubic: function (x, t, b, c, d) {
      return c*(t/=d)*t*t + b;
    },
    easeOutCubic: function (x, t, b, c, d) {
      return c*((t=t/d-1)*t*t + 1) + b;
    },
    easeInOutCubic: function (x, t, b, c, d) {
      if ((t/=d/2) < 1) return c/2*t*t*t + b;
      return c/2*((t-=2)*t*t + 2) + b;
    },
    easeInQuart: function (x, t, b, c, d) {
      return c*(t/=d)*t*t*t + b;
    },
    easeOutQuart: function (x, t, b, c, d) {
      return -c * ((t=t/d-1)*t*t*t - 1) + b;
    },
    easeInOutQuart: function (x, t, b, c, d) {
      if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
      return -c/2 * ((t-=2)*t*t*t - 2) + b;
    },
    easeInQuint: function (x, t, b, c, d) {
      return c*(t/=d)*t*t*t*t + b;
    },
    easeOutQuint: function (x, t, b, c, d) {
      return c*((t=t/d-1)*t*t*t*t + 1) + b;
    },
    easeInOutQuint: function (x, t, b, c, d) {
      if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
      return c/2*((t-=2)*t*t*t*t + 2) + b;
    },
    easeInSine: function (x, t, b, c, d) {
      return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
    },
    easeOutSine: function (x, t, b, c, d) {
      return c * Math.sin(t/d * (Math.PI/2)) + b;
    },
    easeInOutSine: function (x, t, b, c, d) {
      return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
    },
    easeInExpo: function (x, t, b, c, d) {
      return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
    },
    easeOutExpo: function (x, t, b, c, d) {
      return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
    },
    easeInOutExpo: function (x, t, b, c, d) {
      if (t==0) return b;
      if (t==d) return b+c;
      if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
      return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeInCirc: function (x, t, b, c, d) {
      return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
    },
    easeOutCirc: function (x, t, b, c, d) {
      return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
    },
    easeInOutCirc: function (x, t, b, c, d) {
      if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
      return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
    },
    easeInElastic: function (x, t, b, c, d) {
      var s=1.70158;var p=0;var a=c;
      if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
      if (a < Math.abs(c)) { a=c; var s=p/4; }
      else var s = p/(2*Math.PI) * Math.asin (c/a);
      return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    },
    easeOutElastic: function (x, t, b, c, d) {
      var s=1.70158;var p=0;var a=c;
      if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
      if (a < Math.abs(c)) { a=c; var s=p/4; }
      else var s = p/(2*Math.PI) * Math.asin (c/a);
      return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
    },
    easeInOutElastic: function (x, t, b, c, d) {
      var s=1.70158;var p=0;var a=c;
      if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
      if (a < Math.abs(c)) { a=c; var s=p/4; }
      else var s = p/(2*Math.PI) * Math.asin (c/a);
      if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
      return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
    },
    easeInBack: function (x, t, b, c, d, s) {
      if (s == undefined) s = 1.70158;
      return c*(t/=d)*t*((s+1)*t - s) + b;
    },
    easeOutBack: function (x, t, b, c, d, s) {
      if (s == undefined) s = 1.70158;
      return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
    },
    easeInOutBack: function (x, t, b, c, d, s) {
      if (s == undefined) s = 1.70158;
      if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
      return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
    },
    easeInBounce: function (x, t, b, c, d) {
      return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
    },
    easeOutBounce: function (x, t, b, c, d) {
      if ((t/=d) < (1/2.75)) {
        return c*(7.5625*t*t) + b;
      } else if (t < (2/2.75)) {
        return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
      } else if (t < (2.5/2.75)) {
        return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
      } else {
        return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
      }
    },
    easeInOutBounce: function (x, t, b, c, d) {
      if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
      return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
    }
  });

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 *
 * Open source under the BSD License.
 *
 * Copyright Â© 2001 Robert Penner
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */;
/*!
	Autosize 1.18.14
	license: MIT
	http://www.jacklmoore.com/autosize
*/
!function(e){var t,o={className:"autosizejs",id:"autosizejs",append:"\n",callback:!1,resizeDelay:10,placeholder:!0},i='<textarea tabindex="-1" style="position:absolute; top:-999px; left:0; right:auto; bottom:auto; border:0; padding: 0; -moz-box-sizing:content-box; -webkit-box-sizing:content-box; box-sizing:content-box; word-wrap:break-word; height:0 !important; min-height:0 !important; overflow:hidden; transition:none; -webkit-transition:none; -moz-transition:none;"/>',n=["fontFamily","fontSize","fontWeight","fontStyle","letterSpacing","textTransform","wordSpacing","textIndent","whiteSpace"],s=e(i).data("autosize",!0)[0];s.style.lineHeight="99px","99px"===e(s).css("lineHeight")&&n.push("lineHeight"),s.style.lineHeight="",e.fn.autosize=function(i){return this.length?(i=e.extend({},o,i||{}),s.parentNode!==document.body&&e(document.body).append(s),this.each(function(){function o(){var t,o=window.getComputedStyle?window.getComputedStyle(u,null):!1;o?(t=u.getBoundingClientRect().width,(0===t||"number"!=typeof t)&&(t=parseInt(o.width,10)),e.each(["paddingLeft","paddingRight","borderLeftWidth","borderRightWidth"],function(e,i){t-=parseInt(o[i],10)})):t=p.width(),s.style.width=Math.max(t,0)+"px"}function a(){var a={};if(t=u,s.className=i.className,s.id=i.id,d=parseInt(p.css("maxHeight"),10),e.each(n,function(e,t){a[t]=p.css(t)}),e(s).css(a).attr("wrap",p.attr("wrap")),o(),window.chrome){var r=u.style.width;u.style.width="0px";{u.offsetWidth}u.style.width=r}}function r(){var e,n;t!==u?a():o(),s.value=!u.value&&i.placeholder?p.attr("placeholder")||"":u.value,s.value+=i.append||"",s.style.overflowY=u.style.overflowY,n=parseInt(u.style.height,10),s.scrollTop=0,s.scrollTop=9e4,e=s.scrollTop,d&&e>d?(u.style.overflowY="scroll",e=d):(u.style.overflowY="hidden",c>e&&(e=c)),e+=w,n!==e&&(u.style.height=e+"px",s.className=s.className,f&&i.callback.call(u,u),p.trigger("autosize.resized"))}function l(){clearTimeout(h),h=setTimeout(function(){var e=p.width();e!==g&&(g=e,r())},parseInt(i.resizeDelay,10))}var d,c,h,u=this,p=e(u),w=0,f=e.isFunction(i.callback),z={height:u.style.height,overflow:u.style.overflow,overflowY:u.style.overflowY,wordWrap:u.style.wordWrap,resize:u.style.resize},g=p.width(),y=p.css("resize");p.data("autosize")||(p.data("autosize",!0),("border-box"===p.css("box-sizing")||"border-box"===p.css("-moz-box-sizing")||"border-box"===p.css("-webkit-box-sizing"))&&(w=p.outerHeight()-p.height()),c=Math.max(parseInt(p.css("minHeight"),10)-w||0,p.height()),p.css({overflow:"hidden",overflowY:"hidden",wordWrap:"break-word"}),"vertical"===y?p.css("resize","none"):"both"===y&&p.css("resize","horizontal"),"onpropertychange"in u?"oninput"in u?p.on("input.autosize keyup.autosize",r):p.on("propertychange.autosize",function(){"value"===event.propertyName&&r()}):p.on("input.autosize",r),i.resizeDelay!==!1&&e(window).on("resize.autosize",l),p.on("autosize.resize",r),p.on("autosize.resizeIncludeStyle",function(){t=null,r()}),p.on("autosize.destroy",function(){t=null,clearTimeout(h),e(window).off("resize",l),p.off("autosize").off(".autosize").css(z).removeData("autosize")}),r())})):this}}(jQuery||$);;
/*<![CDATA[*/window.zEmbed||function(e,t){var n,o,d,i,s,a=[],r=document.createElement("iframe");window.zEmbed=function(){a.push(arguments)},window.zE=window.zE||window.zEmbed,r.src="javascript:false",r.title="",r.role="presentation",(r.frameElement||r).style.cssText="display:none",d=document.getElementsByTagName("script"),d=d[d.length-1],d.parentNode.insertBefore(r,d),i=r.contentWindow,s=i.document;try{o=s}catch(c){n=document.domain,r.src='javascript:var d=document.open();d.domain="'+n+'";void(0);',o=s}o.open()._l=function(){var o=this.createElement("script");n&&(this.domain=n),o.id="js-iframe-async",o.src=e,this.t=+new Date,this.zendeskHost=t,this.zEQueue=a,this.body.appendChild(o)},o.write('<body onload="document._l();">'),o.close()}("https://assets.zendesk.com/embeddable_framework/main.js","viaa.zendesk.com");/*]]>*/
zE(function() {
  if (typeof Drupal.settings.locale !== 'undefined') {
    zE.setLocale(Drupal.settings.locale);
  }
});
;
/*! Select2 4.0.3 | https://github.com/select2/select2/blob/master/LICENSE.md */!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):a("object"==typeof exports?require("jquery"):jQuery)}(function(a){var b=function(){if(a&&a.fn&&a.fn.select2&&a.fn.select2.amd)var b=a.fn.select2.amd;var b;return function(){if(!b||!b.requirejs){b?c=b:b={};var a,c,d;!function(b){function e(a,b){return u.call(a,b)}function f(a,b){var c,d,e,f,g,h,i,j,k,l,m,n=b&&b.split("/"),o=s.map,p=o&&o["*"]||{};if(a&&"."===a.charAt(0))if(b){for(a=a.split("/"),g=a.length-1,s.nodeIdCompat&&w.test(a[g])&&(a[g]=a[g].replace(w,"")),a=n.slice(0,n.length-1).concat(a),k=0;k<a.length;k+=1)if(m=a[k],"."===m)a.splice(k,1),k-=1;else if(".."===m){if(1===k&&(".."===a[2]||".."===a[0]))break;k>0&&(a.splice(k-1,2),k-=2)}a=a.join("/")}else 0===a.indexOf("./")&&(a=a.substring(2));if((n||p)&&o){for(c=a.split("/"),k=c.length;k>0;k-=1){if(d=c.slice(0,k).join("/"),n)for(l=n.length;l>0;l-=1)if(e=o[n.slice(0,l).join("/")],e&&(e=e[d])){f=e,h=k;break}if(f)break;!i&&p&&p[d]&&(i=p[d],j=k)}!f&&i&&(f=i,h=j),f&&(c.splice(0,h,f),a=c.join("/"))}return a}function g(a,c){return function(){var d=v.call(arguments,0);return"string"!=typeof d[0]&&1===d.length&&d.push(null),n.apply(b,d.concat([a,c]))}}function h(a){return function(b){return f(b,a)}}function i(a){return function(b){q[a]=b}}function j(a){if(e(r,a)){var c=r[a];delete r[a],t[a]=!0,m.apply(b,c)}if(!e(q,a)&&!e(t,a))throw new Error("No "+a);return q[a]}function k(a){var b,c=a?a.indexOf("!"):-1;return c>-1&&(b=a.substring(0,c),a=a.substring(c+1,a.length)),[b,a]}function l(a){return function(){return s&&s.config&&s.config[a]||{}}}var m,n,o,p,q={},r={},s={},t={},u=Object.prototype.hasOwnProperty,v=[].slice,w=/\.js$/;o=function(a,b){var c,d=k(a),e=d[0];return a=d[1],e&&(e=f(e,b),c=j(e)),e?a=c&&c.normalize?c.normalize(a,h(b)):f(a,b):(a=f(a,b),d=k(a),e=d[0],a=d[1],e&&(c=j(e))),{f:e?e+"!"+a:a,n:a,pr:e,p:c}},p={require:function(a){return g(a)},exports:function(a){var b=q[a];return"undefined"!=typeof b?b:q[a]={}},module:function(a){return{id:a,uri:"",exports:q[a],config:l(a)}}},m=function(a,c,d,f){var h,k,l,m,n,s,u=[],v=typeof d;if(f=f||a,"undefined"===v||"function"===v){for(c=!c.length&&d.length?["require","exports","module"]:c,n=0;n<c.length;n+=1)if(m=o(c[n],f),k=m.f,"require"===k)u[n]=p.require(a);else if("exports"===k)u[n]=p.exports(a),s=!0;else if("module"===k)h=u[n]=p.module(a);else if(e(q,k)||e(r,k)||e(t,k))u[n]=j(k);else{if(!m.p)throw new Error(a+" missing "+k);m.p.load(m.n,g(f,!0),i(k),{}),u[n]=q[k]}l=d?d.apply(q[a],u):void 0,a&&(h&&h.exports!==b&&h.exports!==q[a]?q[a]=h.exports:l===b&&s||(q[a]=l))}else a&&(q[a]=d)},a=c=n=function(a,c,d,e,f){if("string"==typeof a)return p[a]?p[a](c):j(o(a,c).f);if(!a.splice){if(s=a,s.deps&&n(s.deps,s.callback),!c)return;c.splice?(a=c,c=d,d=null):a=b}return c=c||function(){},"function"==typeof d&&(d=e,e=f),e?m(b,a,c,d):setTimeout(function(){m(b,a,c,d)},4),n},n.config=function(a){return n(a)},a._defined=q,d=function(a,b,c){if("string"!=typeof a)throw new Error("See almond README: incorrect module build, no module name");b.splice||(c=b,b=[]),e(q,a)||e(r,a)||(r[a]=[a,b,c])},d.amd={jQuery:!0}}(),b.requirejs=a,b.require=c,b.define=d}}(),b.define("almond",function(){}),b.define("jquery",[],function(){var b=a||$;return null==b&&console&&console.error&&console.error("Select2: An instance of jQuery or a jQuery-compatible library was not found. Make sure that you are including jQuery before Select2 on your web page."),b}),b.define("select2/utils",["jquery"],function(a){function b(a){var b=a.prototype,c=[];for(var d in b){var e=b[d];"function"==typeof e&&"constructor"!==d&&c.push(d)}return c}var c={};c.Extend=function(a,b){function c(){this.constructor=a}var d={}.hasOwnProperty;for(var e in b)d.call(b,e)&&(a[e]=b[e]);return c.prototype=b.prototype,a.prototype=new c,a.__super__=b.prototype,a},c.Decorate=function(a,c){function d(){var b=Array.prototype.unshift,d=c.prototype.constructor.length,e=a.prototype.constructor;d>0&&(b.call(arguments,a.prototype.constructor),e=c.prototype.constructor),e.apply(this,arguments)}function e(){this.constructor=d}var f=b(c),g=b(a);c.displayName=a.displayName,d.prototype=new e;for(var h=0;h<g.length;h++){var i=g[h];d.prototype[i]=a.prototype[i]}for(var j=(function(a){var b=function(){};a in d.prototype&&(b=d.prototype[a]);var e=c.prototype[a];return function(){var a=Array.prototype.unshift;return a.call(arguments,b),e.apply(this,arguments)}}),k=0;k<f.length;k++){var l=f[k];d.prototype[l]=j(l)}return d};var d=function(){this.listeners={}};return d.prototype.on=function(a,b){this.listeners=this.listeners||{},a in this.listeners?this.listeners[a].push(b):this.listeners[a]=[b]},d.prototype.trigger=function(a){var b=Array.prototype.slice,c=b.call(arguments,1);this.listeners=this.listeners||{},null==c&&(c=[]),0===c.length&&c.push({}),c[0]._type=a,a in this.listeners&&this.invoke(this.listeners[a],b.call(arguments,1)),"*"in this.listeners&&this.invoke(this.listeners["*"],arguments)},d.prototype.invoke=function(a,b){for(var c=0,d=a.length;d>c;c++)a[c].apply(this,b)},c.Observable=d,c.generateChars=function(a){for(var b="",c=0;a>c;c++){var d=Math.floor(36*Math.random());b+=d.toString(36)}return b},c.bind=function(a,b){return function(){a.apply(b,arguments)}},c._convertData=function(a){for(var b in a){var c=b.split("-"),d=a;if(1!==c.length){for(var e=0;e<c.length;e++){var f=c[e];f=f.substring(0,1).toLowerCase()+f.substring(1),f in d||(d[f]={}),e==c.length-1&&(d[f]=a[b]),d=d[f]}delete a[b]}}return a},c.hasScroll=function(b,c){var d=a(c),e=c.style.overflowX,f=c.style.overflowY;return e!==f||"hidden"!==f&&"visible"!==f?"scroll"===e||"scroll"===f?!0:d.innerHeight()<c.scrollHeight||d.innerWidth()<c.scrollWidth:!1},c.escapeMarkup=function(a){var b={"\\":"&#92;","&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#47;"};return"string"!=typeof a?a:String(a).replace(/[&<>"'\/\\]/g,function(a){return b[a]})},c.appendMany=function(b,c){if("1.7"===a.fn.jquery.substr(0,3)){var d=a();a.map(c,function(a){d=d.add(a)}),c=d}b.append(c)},c}),b.define("select2/results",["jquery","./utils"],function(a,b){function c(a,b,d){this.$element=a,this.data=d,this.options=b,c.__super__.constructor.call(this)}return b.Extend(c,b.Observable),c.prototype.render=function(){var b=a('<ul class="select2-results__options" role="tree"></ul>');return this.options.get("multiple")&&b.attr("aria-multiselectable","true"),this.$results=b,b},c.prototype.clear=function(){this.$results.empty()},c.prototype.displayMessage=function(b){var c=this.options.get("escapeMarkup");this.clear(),this.hideLoading();var d=a('<li role="treeitem" aria-live="assertive" class="select2-results__option"></li>'),e=this.options.get("translations").get(b.message);d.append(c(e(b.args))),d[0].className+=" select2-results__message",this.$results.append(d)},c.prototype.hideMessages=function(){this.$results.find(".select2-results__message").remove()},c.prototype.append=function(a){this.hideLoading();var b=[];if(null==a.results||0===a.results.length)return void(0===this.$results.children().length&&this.trigger("results:message",{message:"noResults"}));a.results=this.sort(a.results);for(var c=0;c<a.results.length;c++){var d=a.results[c],e=this.option(d);b.push(e)}this.$results.append(b)},c.prototype.position=function(a,b){var c=b.find(".select2-results");c.append(a)},c.prototype.sort=function(a){var b=this.options.get("sorter");return b(a)},c.prototype.highlightFirstItem=function(){var a=this.$results.find(".select2-results__option[aria-selected]"),b=a.filter("[aria-selected=true]");b.length>0?b.first().trigger("mouseenter"):a.first().trigger("mouseenter"),this.ensureHighlightVisible()},c.prototype.setClasses=function(){var b=this;this.data.current(function(c){var d=a.map(c,function(a){return a.id.toString()}),e=b.$results.find(".select2-results__option[aria-selected]");e.each(function(){var b=a(this),c=a.data(this,"data"),e=""+c.id;null!=c.element&&c.element.selected||null==c.element&&a.inArray(e,d)>-1?b.attr("aria-selected","true"):b.attr("aria-selected","false")})})},c.prototype.showLoading=function(a){this.hideLoading();var b=this.options.get("translations").get("searching"),c={disabled:!0,loading:!0,text:b(a)},d=this.option(c);d.className+=" loading-results",this.$results.prepend(d)},c.prototype.hideLoading=function(){this.$results.find(".loading-results").remove()},c.prototype.option=function(b){var c=document.createElement("li");c.className="select2-results__option";var d={role:"treeitem","aria-selected":"false"};b.disabled&&(delete d["aria-selected"],d["aria-disabled"]="true"),null==b.id&&delete d["aria-selected"],null!=b._resultId&&(c.id=b._resultId),b.title&&(c.title=b.title),b.children&&(d.role="group",d["aria-label"]=b.text,delete d["aria-selected"]);for(var e in d){var f=d[e];c.setAttribute(e,f)}if(b.children){var g=a(c),h=document.createElement("strong");h.className="select2-results__group";a(h);this.template(b,h);for(var i=[],j=0;j<b.children.length;j++){var k=b.children[j],l=this.option(k);i.push(l)}var m=a("<ul></ul>",{"class":"select2-results__options select2-results__options--nested"});m.append(i),g.append(h),g.append(m)}else this.template(b,c);return a.data(c,"data",b),c},c.prototype.bind=function(b,c){var d=this,e=b.id+"-results";this.$results.attr("id",e),b.on("results:all",function(a){d.clear(),d.append(a.data),b.isOpen()&&(d.setClasses(),d.highlightFirstItem())}),b.on("results:append",function(a){d.append(a.data),b.isOpen()&&d.setClasses()}),b.on("query",function(a){d.hideMessages(),d.showLoading(a)}),b.on("select",function(){b.isOpen()&&(d.setClasses(),d.highlightFirstItem())}),b.on("unselect",function(){b.isOpen()&&(d.setClasses(),d.highlightFirstItem())}),b.on("open",function(){d.$results.attr("aria-expanded","true"),d.$results.attr("aria-hidden","false"),d.setClasses(),d.ensureHighlightVisible()}),b.on("close",function(){d.$results.attr("aria-expanded","false"),d.$results.attr("aria-hidden","true"),d.$results.removeAttr("aria-activedescendant")}),b.on("results:toggle",function(){var a=d.getHighlightedResults();0!==a.length&&a.trigger("mouseup")}),b.on("results:select",function(){var a=d.getHighlightedResults();if(0!==a.length){var b=a.data("data");"true"==a.attr("aria-selected")?d.trigger("close",{}):d.trigger("select",{data:b})}}),b.on("results:previous",function(){var a=d.getHighlightedResults(),b=d.$results.find("[aria-selected]"),c=b.index(a);if(0!==c){var e=c-1;0===a.length&&(e=0);var f=b.eq(e);f.trigger("mouseenter");var g=d.$results.offset().top,h=f.offset().top,i=d.$results.scrollTop()+(h-g);0===e?d.$results.scrollTop(0):0>h-g&&d.$results.scrollTop(i)}}),b.on("results:next",function(){var a=d.getHighlightedResults(),b=d.$results.find("[aria-selected]"),c=b.index(a),e=c+1;if(!(e>=b.length)){var f=b.eq(e);f.trigger("mouseenter");var g=d.$results.offset().top+d.$results.outerHeight(!1),h=f.offset().top+f.outerHeight(!1),i=d.$results.scrollTop()+h-g;0===e?d.$results.scrollTop(0):h>g&&d.$results.scrollTop(i)}}),b.on("results:focus",function(a){a.element.addClass("select2-results__option--highlighted")}),b.on("results:message",function(a){d.displayMessage(a)}),a.fn.mousewheel&&this.$results.on("mousewheel",function(a){var b=d.$results.scrollTop(),c=d.$results.get(0).scrollHeight-b+a.deltaY,e=a.deltaY>0&&b-a.deltaY<=0,f=a.deltaY<0&&c<=d.$results.height();e?(d.$results.scrollTop(0),a.preventDefault(),a.stopPropagation()):f&&(d.$results.scrollTop(d.$results.get(0).scrollHeight-d.$results.height()),a.preventDefault(),a.stopPropagation())}),this.$results.on("mouseup",".select2-results__option[aria-selected]",function(b){var c=a(this),e=c.data("data");return"true"===c.attr("aria-selected")?void(d.options.get("multiple")?d.trigger("unselect",{originalEvent:b,data:e}):d.trigger("close",{})):void d.trigger("select",{originalEvent:b,data:e})}),this.$results.on("mouseenter",".select2-results__option[aria-selected]",function(b){var c=a(this).data("data");d.getHighlightedResults().removeClass("select2-results__option--highlighted"),d.trigger("results:focus",{data:c,element:a(this)})})},c.prototype.getHighlightedResults=function(){var a=this.$results.find(".select2-results__option--highlighted");return a},c.prototype.destroy=function(){this.$results.remove()},c.prototype.ensureHighlightVisible=function(){var a=this.getHighlightedResults();if(0!==a.length){var b=this.$results.find("[aria-selected]"),c=b.index(a),d=this.$results.offset().top,e=a.offset().top,f=this.$results.scrollTop()+(e-d),g=e-d;f-=2*a.outerHeight(!1),2>=c?this.$results.scrollTop(0):(g>this.$results.outerHeight()||0>g)&&this.$results.scrollTop(f)}},c.prototype.template=function(b,c){var d=this.options.get("templateResult"),e=this.options.get("escapeMarkup"),f=d(b,c);null==f?c.style.display="none":"string"==typeof f?c.innerHTML=e(f):a(c).append(f)},c}),b.define("select2/keys",[],function(){var a={BACKSPACE:8,TAB:9,ENTER:13,SHIFT:16,CTRL:17,ALT:18,ESC:27,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT:37,UP:38,RIGHT:39,DOWN:40,DELETE:46};return a}),b.define("select2/selection/base",["jquery","../utils","../keys"],function(a,b,c){function d(a,b){this.$element=a,this.options=b,d.__super__.constructor.call(this)}return b.Extend(d,b.Observable),d.prototype.render=function(){var b=a('<span class="select2-selection" role="combobox"  aria-haspopup="true" aria-expanded="false"></span>');return this._tabindex=0,null!=this.$element.data("old-tabindex")?this._tabindex=this.$element.data("old-tabindex"):null!=this.$element.attr("tabindex")&&(this._tabindex=this.$element.attr("tabindex")),b.attr("title",this.$element.attr("title")),b.attr("tabindex",this._tabindex),this.$selection=b,b},d.prototype.bind=function(a,b){var d=this,e=(a.id+"-container",a.id+"-results");this.container=a,this.$selection.on("focus",function(a){d.trigger("focus",a)}),this.$selection.on("blur",function(a){d._handleBlur(a)}),this.$selection.on("keydown",function(a){d.trigger("keypress",a),a.which===c.SPACE&&a.preventDefault()}),a.on("results:focus",function(a){d.$selection.attr("aria-activedescendant",a.data._resultId)}),a.on("selection:update",function(a){d.update(a.data)}),a.on("open",function(){d.$selection.attr("aria-expanded","true"),d.$selection.attr("aria-owns",e),d._attachCloseHandler(a)}),a.on("close",function(){d.$selection.attr("aria-expanded","false"),d.$selection.removeAttr("aria-activedescendant"),d.$selection.removeAttr("aria-owns"),d.$selection.focus(),d._detachCloseHandler(a)}),a.on("enable",function(){d.$selection.attr("tabindex",d._tabindex)}),a.on("disable",function(){d.$selection.attr("tabindex","-1")})},d.prototype._handleBlur=function(b){var c=this;window.setTimeout(function(){document.activeElement==c.$selection[0]||a.contains(c.$selection[0],document.activeElement)||c.trigger("blur",b)},1)},d.prototype._attachCloseHandler=function(b){a(document.body).on("mousedown.select2."+b.id,function(b){var c=a(b.target),d=c.closest(".select2"),e=a(".select2.select2-container--open");e.each(function(){var b=a(this);if(this!=d[0]){var c=b.data("element");c.select2("close")}})})},d.prototype._detachCloseHandler=function(b){a(document.body).off("mousedown.select2."+b.id)},d.prototype.position=function(a,b){var c=b.find(".selection");c.append(a)},d.prototype.destroy=function(){this._detachCloseHandler(this.container)},d.prototype.update=function(a){throw new Error("The `update` method must be defined in child classes.")},d}),b.define("select2/selection/single",["jquery","./base","../utils","../keys"],function(a,b,c,d){function e(){e.__super__.constructor.apply(this,arguments)}return c.Extend(e,b),e.prototype.render=function(){var a=e.__super__.render.call(this);return a.addClass("select2-selection--single"),a.html('<span class="select2-selection__rendered"></span><span class="select2-selection__arrow" role="presentation"><b role="presentation"></b></span>'),a},e.prototype.bind=function(a,b){var c=this;e.__super__.bind.apply(this,arguments);var d=a.id+"-container";this.$selection.find(".select2-selection__rendered").attr("id",d),this.$selection.attr("aria-labelledby",d),this.$selection.on("mousedown",function(a){1===a.which&&c.trigger("toggle",{originalEvent:a})}),this.$selection.on("focus",function(a){}),this.$selection.on("blur",function(a){}),a.on("focus",function(b){a.isOpen()||c.$selection.focus()}),a.on("selection:update",function(a){c.update(a.data)})},e.prototype.clear=function(){this.$selection.find(".select2-selection__rendered").empty()},e.prototype.display=function(a,b){var c=this.options.get("templateSelection"),d=this.options.get("escapeMarkup");return d(c(a,b))},e.prototype.selectionContainer=function(){return a("<span></span>")},e.prototype.update=function(a){if(0===a.length)return void this.clear();var b=a[0],c=this.$selection.find(".select2-selection__rendered"),d=this.display(b,c);c.empty().append(d),c.prop("title",b.title||b.text)},e}),b.define("select2/selection/multiple",["jquery","./base","../utils"],function(a,b,c){function d(a,b){d.__super__.constructor.apply(this,arguments)}return c.Extend(d,b),d.prototype.render=function(){var a=d.__super__.render.call(this);return a.addClass("select2-selection--multiple"),a.html('<ul class="select2-selection__rendered"></ul>'),a},d.prototype.bind=function(b,c){var e=this;d.__super__.bind.apply(this,arguments),this.$selection.on("click",function(a){e.trigger("toggle",{originalEvent:a})}),this.$selection.on("click",".select2-selection__choice__remove",function(b){if(!e.options.get("disabled")){var c=a(this),d=c.parent(),f=d.data("data");e.trigger("unselect",{originalEvent:b,data:f})}})},d.prototype.clear=function(){this.$selection.find(".select2-selection__rendered").empty()},d.prototype.display=function(a,b){var c=this.options.get("templateSelection"),d=this.options.get("escapeMarkup");return d(c(a,b))},d.prototype.selectionContainer=function(){var b=a('<li class="select2-selection__choice"><span class="select2-selection__choice__remove" role="presentation">&times;</span></li>');return b},d.prototype.update=function(a){if(this.clear(),0!==a.length){for(var b=[],d=0;d<a.length;d++){var e=a[d],f=this.selectionContainer(),g=this.display(e,f);f.append(g),f.prop("title",e.title||e.text),f.data("data",e),b.push(f)}var h=this.$selection.find(".select2-selection__rendered");c.appendMany(h,b)}},d}),b.define("select2/selection/placeholder",["../utils"],function(a){function b(a,b,c){this.placeholder=this.normalizePlaceholder(c.get("placeholder")),a.call(this,b,c)}return b.prototype.normalizePlaceholder=function(a,b){return"string"==typeof b&&(b={id:"",text:b}),b},b.prototype.createPlaceholder=function(a,b){var c=this.selectionContainer();return c.html(this.display(b)),c.addClass("select2-selection__placeholder").removeClass("select2-selection__choice"),c},b.prototype.update=function(a,b){var c=1==b.length&&b[0].id!=this.placeholder.id,d=b.length>1;if(d||c)return a.call(this,b);this.clear();var e=this.createPlaceholder(this.placeholder);this.$selection.find(".select2-selection__rendered").append(e)},b}),b.define("select2/selection/allowClear",["jquery","../keys"],function(a,b){function c(){}return c.prototype.bind=function(a,b,c){var d=this;a.call(this,b,c),null==this.placeholder&&this.options.get("debug")&&window.console&&console.error&&console.error("Select2: The `allowClear` option should be used in combination with the `placeholder` option."),this.$selection.on("mousedown",".select2-selection__clear",function(a){d._handleClear(a)}),b.on("keypress",function(a){d._handleKeyboardClear(a,b)})},c.prototype._handleClear=function(a,b){if(!this.options.get("disabled")){var c=this.$selection.find(".select2-selection__clear");if(0!==c.length){b.stopPropagation();for(var d=c.data("data"),e=0;e<d.length;e++){var f={data:d[e]};if(this.trigger("unselect",f),f.prevented)return}this.$element.val(this.placeholder.id).trigger("change"),this.trigger("toggle",{})}}},c.prototype._handleKeyboardClear=function(a,c,d){d.isOpen()||(c.which==b.DELETE||c.which==b.BACKSPACE)&&this._handleClear(c)},c.prototype.update=function(b,c){if(b.call(this,c),!(this.$selection.find(".select2-selection__placeholder").length>0||0===c.length)){var d=a('<span class="select2-selection__clear">&times;</span>');d.data("data",c),this.$selection.find(".select2-selection__rendered").prepend(d)}},c}),b.define("select2/selection/search",["jquery","../utils","../keys"],function(a,b,c){function d(a,b,c){a.call(this,b,c)}return d.prototype.render=function(b){var c=a('<li class="select2-search select2-search--inline"><input class="select2-search__field" type="search" tabindex="-1" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" role="textbox" aria-autocomplete="list" /></li>');this.$searchContainer=c,this.$search=c.find("input");var d=b.call(this);return this._transferTabIndex(),d},d.prototype.bind=function(a,b,d){var e=this;a.call(this,b,d),b.on("open",function(){e.$search.trigger("focus")}),b.on("close",function(){e.$search.val(""),e.$search.removeAttr("aria-activedescendant"),e.$search.trigger("focus")}),b.on("enable",function(){e.$search.prop("disabled",!1),e._transferTabIndex()}),b.on("disable",function(){e.$search.prop("disabled",!0)}),b.on("focus",function(a){e.$search.trigger("focus")}),b.on("results:focus",function(a){e.$search.attr("aria-activedescendant",a.id)}),this.$selection.on("focusin",".select2-search--inline",function(a){e.trigger("focus",a)}),this.$selection.on("focusout",".select2-search--inline",function(a){e._handleBlur(a)}),this.$selection.on("keydown",".select2-search--inline",function(a){a.stopPropagation(),e.trigger("keypress",a),e._keyUpPrevented=a.isDefaultPrevented();var b=a.which;if(b===c.BACKSPACE&&""===e.$search.val()){var d=e.$searchContainer.prev(".select2-selection__choice");if(d.length>0){var f=d.data("data");e.searchRemoveChoice(f),a.preventDefault()}}});var f=document.documentMode,g=f&&11>=f;this.$selection.on("input.searchcheck",".select2-search--inline",function(a){return g?void e.$selection.off("input.search input.searchcheck"):void e.$selection.off("keyup.search")}),this.$selection.on("keyup.search input.search",".select2-search--inline",function(a){if(g&&"input"===a.type)return void e.$selection.off("input.search input.searchcheck");var b=a.which;b!=c.SHIFT&&b!=c.CTRL&&b!=c.ALT&&b!=c.TAB&&e.handleSearch(a)})},d.prototype._transferTabIndex=function(a){this.$search.attr("tabindex",this.$selection.attr("tabindex")),this.$selection.attr("tabindex","-1")},d.prototype.createPlaceholder=function(a,b){this.$search.attr("placeholder",b.text)},d.prototype.update=function(a,b){var c=this.$search[0]==document.activeElement;this.$search.attr("placeholder",""),a.call(this,b),this.$selection.find(".select2-selection__rendered").append(this.$searchContainer),this.resizeSearch(),c&&this.$search.focus()},d.prototype.handleSearch=function(){if(this.resizeSearch(),!this._keyUpPrevented){var a=this.$search.val();this.trigger("query",{term:a})}this._keyUpPrevented=!1},d.prototype.searchRemoveChoice=function(a,b){this.trigger("unselect",{data:b}),this.$search.val(b.text),this.handleSearch()},d.prototype.resizeSearch=function(){this.$search.css("width","25px");var a="";if(""!==this.$search.attr("placeholder"))a=this.$selection.find(".select2-selection__rendered").innerWidth();else{var b=this.$search.val().length+1;a=.75*b+"em"}this.$search.css("width",a)},d}),b.define("select2/selection/eventRelay",["jquery"],function(a){function b(){}return b.prototype.bind=function(b,c,d){var e=this,f=["open","opening","close","closing","select","selecting","unselect","unselecting"],g=["opening","closing","selecting","unselecting"];b.call(this,c,d),c.on("*",function(b,c){if(-1!==a.inArray(b,f)){c=c||{};var d=a.Event("select2:"+b,{params:c});e.$element.trigger(d),-1!==a.inArray(b,g)&&(c.prevented=d.isDefaultPrevented())}})},b}),b.define("select2/translation",["jquery","require"],function(a,b){function c(a){this.dict=a||{}}return c.prototype.all=function(){return this.dict},c.prototype.get=function(a){return this.dict[a]},c.prototype.extend=function(b){this.dict=a.extend({},b.all(),this.dict)},c._cache={},c.loadPath=function(a){if(!(a in c._cache)){var d=b(a);c._cache[a]=d}return new c(c._cache[a])},c}),b.define("select2/diacritics",[],function(){var a={"Ⓐ":"A","Ａ":"A","À":"A","Á":"A","Â":"A","Ầ":"A","Ấ":"A","Ẫ":"A","Ẩ":"A","Ã":"A","Ā":"A","Ă":"A","Ằ":"A","Ắ":"A","Ẵ":"A","Ẳ":"A","Ȧ":"A","Ǡ":"A","Ä":"A","Ǟ":"A","Ả":"A","Å":"A","Ǻ":"A","Ǎ":"A","Ȁ":"A","Ȃ":"A","Ạ":"A","Ậ":"A","Ặ":"A","Ḁ":"A","Ą":"A","Ⱥ":"A","Ɐ":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ⓑ":"B","Ｂ":"B","Ḃ":"B","Ḅ":"B","Ḇ":"B","Ƀ":"B","Ƃ":"B","Ɓ":"B","Ⓒ":"C","Ｃ":"C","Ć":"C","Ĉ":"C","Ċ":"C","Č":"C","Ç":"C","Ḉ":"C","Ƈ":"C","Ȼ":"C","Ꜿ":"C","Ⓓ":"D","Ｄ":"D","Ḋ":"D","Ď":"D","Ḍ":"D","Ḑ":"D","Ḓ":"D","Ḏ":"D","Đ":"D","Ƌ":"D","Ɗ":"D","Ɖ":"D","Ꝺ":"D","Ǳ":"DZ","Ǆ":"DZ","ǲ":"Dz","ǅ":"Dz","Ⓔ":"E","Ｅ":"E","È":"E","É":"E","Ê":"E","Ề":"E","Ế":"E","Ễ":"E","Ể":"E","Ẽ":"E","Ē":"E","Ḕ":"E","Ḗ":"E","Ĕ":"E","Ė":"E","Ë":"E","Ẻ":"E","Ě":"E","Ȅ":"E","Ȇ":"E","Ẹ":"E","Ệ":"E","Ȩ":"E","Ḝ":"E","Ę":"E","Ḙ":"E","Ḛ":"E","Ɛ":"E","Ǝ":"E","Ⓕ":"F","Ｆ":"F","Ḟ":"F","Ƒ":"F","Ꝼ":"F","Ⓖ":"G","Ｇ":"G","Ǵ":"G","Ĝ":"G","Ḡ":"G","Ğ":"G","Ġ":"G","Ǧ":"G","Ģ":"G","Ǥ":"G","Ɠ":"G","Ꞡ":"G","Ᵹ":"G","Ꝿ":"G","Ⓗ":"H","Ｈ":"H","Ĥ":"H","Ḣ":"H","Ḧ":"H","Ȟ":"H","Ḥ":"H","Ḩ":"H","Ḫ":"H","Ħ":"H","Ⱨ":"H","Ⱶ":"H","Ɥ":"H","Ⓘ":"I","Ｉ":"I","Ì":"I","Í":"I","Î":"I","Ĩ":"I","Ī":"I","Ĭ":"I","İ":"I","Ï":"I","Ḯ":"I","Ỉ":"I","Ǐ":"I","Ȉ":"I","Ȋ":"I","Ị":"I","Į":"I","Ḭ":"I","Ɨ":"I","Ⓙ":"J","Ｊ":"J","Ĵ":"J","Ɉ":"J","Ⓚ":"K","Ｋ":"K","Ḱ":"K","Ǩ":"K","Ḳ":"K","Ķ":"K","Ḵ":"K","Ƙ":"K","Ⱪ":"K","Ꝁ":"K","Ꝃ":"K","Ꝅ":"K","Ꞣ":"K","Ⓛ":"L","Ｌ":"L","Ŀ":"L","Ĺ":"L","Ľ":"L","Ḷ":"L","Ḹ":"L","Ļ":"L","Ḽ":"L","Ḻ":"L","Ł":"L","Ƚ":"L","Ɫ":"L","Ⱡ":"L","Ꝉ":"L","Ꝇ":"L","Ꞁ":"L","Ǉ":"LJ","ǈ":"Lj","Ⓜ":"M","Ｍ":"M","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ɯ":"M","Ⓝ":"N","Ｎ":"N","Ǹ":"N","Ń":"N","Ñ":"N","Ṅ":"N","Ň":"N","Ṇ":"N","Ņ":"N","Ṋ":"N","Ṉ":"N","Ƞ":"N","Ɲ":"N","Ꞑ":"N","Ꞥ":"N","Ǌ":"NJ","ǋ":"Nj","Ⓞ":"O","Ｏ":"O","Ò":"O","Ó":"O","Ô":"O","Ồ":"O","Ố":"O","Ỗ":"O","Ổ":"O","Õ":"O","Ṍ":"O","Ȭ":"O","Ṏ":"O","Ō":"O","Ṑ":"O","Ṓ":"O","Ŏ":"O","Ȯ":"O","Ȱ":"O","Ö":"O","Ȫ":"O","Ỏ":"O","Ő":"O","Ǒ":"O","Ȍ":"O","Ȏ":"O","Ơ":"O","Ờ":"O","Ớ":"O","Ỡ":"O","Ở":"O","Ợ":"O","Ọ":"O","Ộ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Ɔ":"O","Ɵ":"O","Ꝋ":"O","Ꝍ":"O","Ƣ":"OI","Ꝏ":"OO","Ȣ":"OU","Ⓟ":"P","Ｐ":"P","Ṕ":"P","Ṗ":"P","Ƥ":"P","Ᵽ":"P","Ꝑ":"P","Ꝓ":"P","Ꝕ":"P","Ⓠ":"Q","Ｑ":"Q","Ꝗ":"Q","Ꝙ":"Q","Ɋ":"Q","Ⓡ":"R","Ｒ":"R","Ŕ":"R","Ṙ":"R","Ř":"R","Ȑ":"R","Ȓ":"R","Ṛ":"R","Ṝ":"R","Ŗ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꝛ":"R","Ꞧ":"R","Ꞃ":"R","Ⓢ":"S","Ｓ":"S","ẞ":"S","Ś":"S","Ṥ":"S","Ŝ":"S","Ṡ":"S","Š":"S","Ṧ":"S","Ṣ":"S","Ṩ":"S","Ș":"S","Ş":"S","Ȿ":"S","Ꞩ":"S","Ꞅ":"S","Ⓣ":"T","Ｔ":"T","Ṫ":"T","Ť":"T","Ṭ":"T","Ț":"T","Ţ":"T","Ṱ":"T","Ṯ":"T","Ŧ":"T","Ƭ":"T","Ʈ":"T","Ⱦ":"T","Ꞇ":"T","Ꜩ":"TZ","Ⓤ":"U","Ｕ":"U","Ù":"U","Ú":"U","Û":"U","Ũ":"U","Ṹ":"U","Ū":"U","Ṻ":"U","Ŭ":"U","Ü":"U","Ǜ":"U","Ǘ":"U","Ǖ":"U","Ǚ":"U","Ủ":"U","Ů":"U","Ű":"U","Ǔ":"U","Ȕ":"U","Ȗ":"U","Ư":"U","Ừ":"U","Ứ":"U","Ữ":"U","Ử":"U","Ự":"U","Ụ":"U","Ṳ":"U","Ų":"U","Ṷ":"U","Ṵ":"U","Ʉ":"U","Ⓥ":"V","Ｖ":"V","Ṽ":"V","Ṿ":"V","Ʋ":"V","Ꝟ":"V","Ʌ":"V","Ꝡ":"VY","Ⓦ":"W","Ｗ":"W","Ẁ":"W","Ẃ":"W","Ŵ":"W","Ẇ":"W","Ẅ":"W","Ẉ":"W","Ⱳ":"W","Ⓧ":"X","Ｘ":"X","Ẋ":"X","Ẍ":"X","Ⓨ":"Y","Ｙ":"Y","Ỳ":"Y","Ý":"Y","Ŷ":"Y","Ỹ":"Y","Ȳ":"Y","Ẏ":"Y","Ÿ":"Y","Ỷ":"Y","Ỵ":"Y","Ƴ":"Y","Ɏ":"Y","Ỿ":"Y","Ⓩ":"Z","Ｚ":"Z","Ź":"Z","Ẑ":"Z","Ż":"Z","Ž":"Z","Ẓ":"Z","Ẕ":"Z","Ƶ":"Z","Ȥ":"Z","Ɀ":"Z","Ⱬ":"Z","Ꝣ":"Z","ⓐ":"a","ａ":"a","ẚ":"a","à":"a","á":"a","â":"a","ầ":"a","ấ":"a","ẫ":"a","ẩ":"a","ã":"a","ā":"a","ă":"a","ằ":"a","ắ":"a","ẵ":"a","ẳ":"a","ȧ":"a","ǡ":"a","ä":"a","ǟ":"a","ả":"a","å":"a","ǻ":"a","ǎ":"a","ȁ":"a","ȃ":"a","ạ":"a","ậ":"a","ặ":"a","ḁ":"a","ą":"a","ⱥ":"a","ɐ":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ⓑ":"b","ｂ":"b","ḃ":"b","ḅ":"b","ḇ":"b","ƀ":"b","ƃ":"b","ɓ":"b","ⓒ":"c","ｃ":"c","ć":"c","ĉ":"c","ċ":"c","č":"c","ç":"c","ḉ":"c","ƈ":"c","ȼ":"c","ꜿ":"c","ↄ":"c","ⓓ":"d","ｄ":"d","ḋ":"d","ď":"d","ḍ":"d","ḑ":"d","ḓ":"d","ḏ":"d","đ":"d","ƌ":"d","ɖ":"d","ɗ":"d","ꝺ":"d","ǳ":"dz","ǆ":"dz","ⓔ":"e","ｅ":"e","è":"e","é":"e","ê":"e","ề":"e","ế":"e","ễ":"e","ể":"e","ẽ":"e","ē":"e","ḕ":"e","ḗ":"e","ĕ":"e","ė":"e","ë":"e","ẻ":"e","ě":"e","ȅ":"e","ȇ":"e","ẹ":"e","ệ":"e","ȩ":"e","ḝ":"e","ę":"e","ḙ":"e","ḛ":"e","ɇ":"e","ɛ":"e","ǝ":"e","ⓕ":"f","ｆ":"f","ḟ":"f","ƒ":"f","ꝼ":"f","ⓖ":"g","ｇ":"g","ǵ":"g","ĝ":"g","ḡ":"g","ğ":"g","ġ":"g","ǧ":"g","ģ":"g","ǥ":"g","ɠ":"g","ꞡ":"g","ᵹ":"g","ꝿ":"g","ⓗ":"h","ｈ":"h","ĥ":"h","ḣ":"h","ḧ":"h","ȟ":"h","ḥ":"h","ḩ":"h","ḫ":"h","ẖ":"h","ħ":"h","ⱨ":"h","ⱶ":"h","ɥ":"h","ƕ":"hv","ⓘ":"i","ｉ":"i","ì":"i","í":"i","î":"i","ĩ":"i","ī":"i","ĭ":"i","ï":"i","ḯ":"i","ỉ":"i","ǐ":"i","ȉ":"i","ȋ":"i","ị":"i","į":"i","ḭ":"i","ɨ":"i","ı":"i","ⓙ":"j","ｊ":"j","ĵ":"j","ǰ":"j","ɉ":"j","ⓚ":"k","ｋ":"k","ḱ":"k","ǩ":"k","ḳ":"k","ķ":"k","ḵ":"k","ƙ":"k","ⱪ":"k","ꝁ":"k","ꝃ":"k","ꝅ":"k","ꞣ":"k","ⓛ":"l","ｌ":"l","ŀ":"l","ĺ":"l","ľ":"l","ḷ":"l","ḹ":"l","ļ":"l","ḽ":"l","ḻ":"l","ſ":"l","ł":"l","ƚ":"l","ɫ":"l","ⱡ":"l","ꝉ":"l","ꞁ":"l","ꝇ":"l","ǉ":"lj","ⓜ":"m","ｍ":"m","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ɯ":"m","ⓝ":"n","ｎ":"n","ǹ":"n","ń":"n","ñ":"n","ṅ":"n","ň":"n","ṇ":"n","ņ":"n","ṋ":"n","ṉ":"n","ƞ":"n","ɲ":"n","ŉ":"n","ꞑ":"n","ꞥ":"n","ǌ":"nj","ⓞ":"o","ｏ":"o","ò":"o","ó":"o","ô":"o","ồ":"o","ố":"o","ỗ":"o","ổ":"o","õ":"o","ṍ":"o","ȭ":"o","ṏ":"o","ō":"o","ṑ":"o","ṓ":"o","ŏ":"o","ȯ":"o","ȱ":"o","ö":"o","ȫ":"o","ỏ":"o","ő":"o","ǒ":"o","ȍ":"o","ȏ":"o","ơ":"o","ờ":"o","ớ":"o","ỡ":"o","ở":"o","ợ":"o","ọ":"o","ộ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","ɔ":"o","ꝋ":"o","ꝍ":"o","ɵ":"o","ƣ":"oi","ȣ":"ou","ꝏ":"oo","ⓟ":"p","ｐ":"p","ṕ":"p","ṗ":"p","ƥ":"p","ᵽ":"p","ꝑ":"p","ꝓ":"p","ꝕ":"p","ⓠ":"q","ｑ":"q","ɋ":"q","ꝗ":"q","ꝙ":"q","ⓡ":"r","ｒ":"r","ŕ":"r","ṙ":"r","ř":"r","ȑ":"r","ȓ":"r","ṛ":"r","ṝ":"r","ŗ":"r","ṟ":"r","ɍ":"r","ɽ":"r","ꝛ":"r","ꞧ":"r","ꞃ":"r","ⓢ":"s","ｓ":"s","ß":"s","ś":"s","ṥ":"s","ŝ":"s","ṡ":"s","š":"s","ṧ":"s","ṣ":"s","ṩ":"s","ș":"s","ş":"s","ȿ":"s","ꞩ":"s","ꞅ":"s","ẛ":"s","ⓣ":"t","ｔ":"t","ṫ":"t","ẗ":"t","ť":"t","ṭ":"t","ț":"t","ţ":"t","ṱ":"t","ṯ":"t","ŧ":"t","ƭ":"t","ʈ":"t","ⱦ":"t","ꞇ":"t","ꜩ":"tz","ⓤ":"u","ｕ":"u","ù":"u","ú":"u","û":"u","ũ":"u","ṹ":"u","ū":"u","ṻ":"u","ŭ":"u","ü":"u","ǜ":"u","ǘ":"u","ǖ":"u","ǚ":"u","ủ":"u","ů":"u","ű":"u","ǔ":"u","ȕ":"u","ȗ":"u","ư":"u","ừ":"u","ứ":"u","ữ":"u","ử":"u","ự":"u","ụ":"u","ṳ":"u","ų":"u","ṷ":"u","ṵ":"u","ʉ":"u","ⓥ":"v","ｖ":"v","ṽ":"v","ṿ":"v","ʋ":"v","ꝟ":"v","ʌ":"v","ꝡ":"vy","ⓦ":"w","ｗ":"w","ẁ":"w","ẃ":"w","ŵ":"w","ẇ":"w","ẅ":"w","ẘ":"w","ẉ":"w","ⱳ":"w","ⓧ":"x","ｘ":"x","ẋ":"x","ẍ":"x","ⓨ":"y","ｙ":"y","ỳ":"y","ý":"y","ŷ":"y","ỹ":"y","ȳ":"y","ẏ":"y","ÿ":"y","ỷ":"y","ẙ":"y","ỵ":"y","ƴ":"y","ɏ":"y","ỿ":"y","ⓩ":"z","ｚ":"z","ź":"z","ẑ":"z","ż":"z","ž":"z","ẓ":"z","ẕ":"z","ƶ":"z","ȥ":"z","ɀ":"z","ⱬ":"z","ꝣ":"z","Ά":"Α","Έ":"Ε","Ή":"Η","Ί":"Ι","Ϊ":"Ι","Ό":"Ο","Ύ":"Υ","Ϋ":"Υ","Ώ":"Ω","ά":"α","έ":"ε","ή":"η","ί":"ι","ϊ":"ι","ΐ":"ι","ό":"ο","ύ":"υ","ϋ":"υ","ΰ":"υ","ω":"ω","ς":"σ"};return a}),b.define("select2/data/base",["../utils"],function(a){function b(a,c){b.__super__.constructor.call(this)}return a.Extend(b,a.Observable),b.prototype.current=function(a){throw new Error("The `current` method must be defined in child classes.")},b.prototype.query=function(a,b){throw new Error("The `query` method must be defined in child classes.")},b.prototype.bind=function(a,b){},b.prototype.destroy=function(){},b.prototype.generateResultId=function(b,c){var d=b.id+"-result-";return d+=a.generateChars(4),d+=null!=c.id?"-"+c.id.toString():"-"+a.generateChars(4)},b}),b.define("select2/data/select",["./base","../utils","jquery"],function(a,b,c){function d(a,b){this.$element=a,this.options=b,d.__super__.constructor.call(this)}return b.Extend(d,a),d.prototype.current=function(a){var b=[],d=this;this.$element.find(":selected").each(function(){var a=c(this),e=d.item(a);b.push(e)}),a(b)},d.prototype.select=function(a){var b=this;if(a.selected=!0,c(a.element).is("option"))return a.element.selected=!0,void this.$element.trigger("change");
if(this.$element.prop("multiple"))this.current(function(d){var e=[];a=[a],a.push.apply(a,d);for(var f=0;f<a.length;f++){var g=a[f].id;-1===c.inArray(g,e)&&e.push(g)}b.$element.val(e),b.$element.trigger("change")});else{var d=a.id;this.$element.val(d),this.$element.trigger("change")}},d.prototype.unselect=function(a){var b=this;if(this.$element.prop("multiple"))return a.selected=!1,c(a.element).is("option")?(a.element.selected=!1,void this.$element.trigger("change")):void this.current(function(d){for(var e=[],f=0;f<d.length;f++){var g=d[f].id;g!==a.id&&-1===c.inArray(g,e)&&e.push(g)}b.$element.val(e),b.$element.trigger("change")})},d.prototype.bind=function(a,b){var c=this;this.container=a,a.on("select",function(a){c.select(a.data)}),a.on("unselect",function(a){c.unselect(a.data)})},d.prototype.destroy=function(){this.$element.find("*").each(function(){c.removeData(this,"data")})},d.prototype.query=function(a,b){var d=[],e=this,f=this.$element.children();f.each(function(){var b=c(this);if(b.is("option")||b.is("optgroup")){var f=e.item(b),g=e.matches(a,f);null!==g&&d.push(g)}}),b({results:d})},d.prototype.addOptions=function(a){b.appendMany(this.$element,a)},d.prototype.option=function(a){var b;a.children?(b=document.createElement("optgroup"),b.label=a.text):(b=document.createElement("option"),void 0!==b.textContent?b.textContent=a.text:b.innerText=a.text),a.id&&(b.value=a.id),a.disabled&&(b.disabled=!0),a.selected&&(b.selected=!0),a.title&&(b.title=a.title);var d=c(b),e=this._normalizeItem(a);return e.element=b,c.data(b,"data",e),d},d.prototype.item=function(a){var b={};if(b=c.data(a[0],"data"),null!=b)return b;if(a.is("option"))b={id:a.val(),text:a.text(),disabled:a.prop("disabled"),selected:a.prop("selected"),title:a.prop("title")};else if(a.is("optgroup")){b={text:a.prop("label"),children:[],title:a.prop("title")};for(var d=a.children("option"),e=[],f=0;f<d.length;f++){var g=c(d[f]),h=this.item(g);e.push(h)}b.children=e}return b=this._normalizeItem(b),b.element=a[0],c.data(a[0],"data",b),b},d.prototype._normalizeItem=function(a){c.isPlainObject(a)||(a={id:a,text:a}),a=c.extend({},{text:""},a);var b={selected:!1,disabled:!1};return null!=a.id&&(a.id=a.id.toString()),null!=a.text&&(a.text=a.text.toString()),null==a._resultId&&a.id&&null!=this.container&&(a._resultId=this.generateResultId(this.container,a)),c.extend({},b,a)},d.prototype.matches=function(a,b){var c=this.options.get("matcher");return c(a,b)},d}),b.define("select2/data/array",["./select","../utils","jquery"],function(a,b,c){function d(a,b){var c=b.get("data")||[];d.__super__.constructor.call(this,a,b),this.addOptions(this.convertToOptions(c))}return b.Extend(d,a),d.prototype.select=function(a){var b=this.$element.find("option").filter(function(b,c){return c.value==a.id.toString()});0===b.length&&(b=this.option(a),this.addOptions(b)),d.__super__.select.call(this,a)},d.prototype.convertToOptions=function(a){function d(a){return function(){return c(this).val()==a.id}}for(var e=this,f=this.$element.find("option"),g=f.map(function(){return e.item(c(this)).id}).get(),h=[],i=0;i<a.length;i++){var j=this._normalizeItem(a[i]);if(c.inArray(j.id,g)>=0){var k=f.filter(d(j)),l=this.item(k),m=c.extend(!0,{},j,l),n=this.option(m);k.replaceWith(n)}else{var o=this.option(j);if(j.children){var p=this.convertToOptions(j.children);b.appendMany(o,p)}h.push(o)}}return h},d}),b.define("select2/data/ajax",["./array","../utils","jquery"],function(a,b,c){function d(a,b){this.ajaxOptions=this._applyDefaults(b.get("ajax")),null!=this.ajaxOptions.processResults&&(this.processResults=this.ajaxOptions.processResults),d.__super__.constructor.call(this,a,b)}return b.Extend(d,a),d.prototype._applyDefaults=function(a){var b={data:function(a){return c.extend({},a,{q:a.term})},transport:function(a,b,d){var e=c.ajax(a);return e.then(b),e.fail(d),e}};return c.extend({},b,a,!0)},d.prototype.processResults=function(a){return a},d.prototype.query=function(a,b){function d(){var d=f.transport(f,function(d){var f=e.processResults(d,a);e.options.get("debug")&&window.console&&console.error&&(f&&f.results&&c.isArray(f.results)||console.error("Select2: The AJAX results did not return an array in the `results` key of the response.")),b(f)},function(){d.status&&"0"===d.status||e.trigger("results:message",{message:"errorLoading"})});e._request=d}var e=this;null!=this._request&&(c.isFunction(this._request.abort)&&this._request.abort(),this._request=null);var f=c.extend({type:"GET"},this.ajaxOptions);"function"==typeof f.url&&(f.url=f.url.call(this.$element,a)),"function"==typeof f.data&&(f.data=f.data.call(this.$element,a)),this.ajaxOptions.delay&&null!=a.term?(this._queryTimeout&&window.clearTimeout(this._queryTimeout),this._queryTimeout=window.setTimeout(d,this.ajaxOptions.delay)):d()},d}),b.define("select2/data/tags",["jquery"],function(a){function b(b,c,d){var e=d.get("tags"),f=d.get("createTag");void 0!==f&&(this.createTag=f);var g=d.get("insertTag");if(void 0!==g&&(this.insertTag=g),b.call(this,c,d),a.isArray(e))for(var h=0;h<e.length;h++){var i=e[h],j=this._normalizeItem(i),k=this.option(j);this.$element.append(k)}}return b.prototype.query=function(a,b,c){function d(a,f){for(var g=a.results,h=0;h<g.length;h++){var i=g[h],j=null!=i.children&&!d({results:i.children},!0),k=i.text===b.term;if(k||j)return f?!1:(a.data=g,void c(a))}if(f)return!0;var l=e.createTag(b);if(null!=l){var m=e.option(l);m.attr("data-select2-tag",!0),e.addOptions([m]),e.insertTag(g,l)}a.results=g,c(a)}var e=this;return this._removeOldTags(),null==b.term||null!=b.page?void a.call(this,b,c):void a.call(this,b,d)},b.prototype.createTag=function(b,c){var d=a.trim(c.term);return""===d?null:{id:d,text:d}},b.prototype.insertTag=function(a,b,c){b.unshift(c)},b.prototype._removeOldTags=function(b){var c=(this._lastTag,this.$element.find("option[data-select2-tag]"));c.each(function(){this.selected||a(this).remove()})},b}),b.define("select2/data/tokenizer",["jquery"],function(a){function b(a,b,c){var d=c.get("tokenizer");void 0!==d&&(this.tokenizer=d),a.call(this,b,c)}return b.prototype.bind=function(a,b,c){a.call(this,b,c),this.$search=b.dropdown.$search||b.selection.$search||c.find(".select2-search__field")},b.prototype.query=function(b,c,d){function e(b){var c=g._normalizeItem(b),d=g.$element.find("option").filter(function(){return a(this).val()===c.id});if(!d.length){var e=g.option(c);e.attr("data-select2-tag",!0),g._removeOldTags(),g.addOptions([e])}f(c)}function f(a){g.trigger("select",{data:a})}var g=this;c.term=c.term||"";var h=this.tokenizer(c,this.options,e);h.term!==c.term&&(this.$search.length&&(this.$search.val(h.term),this.$search.focus()),c.term=h.term),b.call(this,c,d)},b.prototype.tokenizer=function(b,c,d,e){for(var f=d.get("tokenSeparators")||[],g=c.term,h=0,i=this.createTag||function(a){return{id:a.term,text:a.term}};h<g.length;){var j=g[h];if(-1!==a.inArray(j,f)){var k=g.substr(0,h),l=a.extend({},c,{term:k}),m=i(l);null!=m?(e(m),g=g.substr(h+1)||"",h=0):h++}else h++}return{term:g}},b}),b.define("select2/data/minimumInputLength",[],function(){function a(a,b,c){this.minimumInputLength=c.get("minimumInputLength"),a.call(this,b,c)}return a.prototype.query=function(a,b,c){return b.term=b.term||"",b.term.length<this.minimumInputLength?void this.trigger("results:message",{message:"inputTooShort",args:{minimum:this.minimumInputLength,input:b.term,params:b}}):void a.call(this,b,c)},a}),b.define("select2/data/maximumInputLength",[],function(){function a(a,b,c){this.maximumInputLength=c.get("maximumInputLength"),a.call(this,b,c)}return a.prototype.query=function(a,b,c){return b.term=b.term||"",this.maximumInputLength>0&&b.term.length>this.maximumInputLength?void this.trigger("results:message",{message:"inputTooLong",args:{maximum:this.maximumInputLength,input:b.term,params:b}}):void a.call(this,b,c)},a}),b.define("select2/data/maximumSelectionLength",[],function(){function a(a,b,c){this.maximumSelectionLength=c.get("maximumSelectionLength"),a.call(this,b,c)}return a.prototype.query=function(a,b,c){var d=this;this.current(function(e){var f=null!=e?e.length:0;return d.maximumSelectionLength>0&&f>=d.maximumSelectionLength?void d.trigger("results:message",{message:"maximumSelected",args:{maximum:d.maximumSelectionLength}}):void a.call(d,b,c)})},a}),b.define("select2/dropdown",["jquery","./utils"],function(a,b){function c(a,b){this.$element=a,this.options=b,c.__super__.constructor.call(this)}return b.Extend(c,b.Observable),c.prototype.render=function(){var b=a('<span class="select2-dropdown"><span class="select2-results"></span></span>');return b.attr("dir",this.options.get("dir")),this.$dropdown=b,b},c.prototype.bind=function(){},c.prototype.position=function(a,b){},c.prototype.destroy=function(){this.$dropdown.remove()},c}),b.define("select2/dropdown/search",["jquery","../utils"],function(a,b){function c(){}return c.prototype.render=function(b){var c=b.call(this),d=a('<span class="select2-search select2-search--dropdown"><input class="select2-search__field" type="search" tabindex="-1" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" role="textbox" /></span>');return this.$searchContainer=d,this.$search=d.find("input"),c.prepend(d),c},c.prototype.bind=function(b,c,d){var e=this;b.call(this,c,d),this.$search.on("keydown",function(a){e.trigger("keypress",a),e._keyUpPrevented=a.isDefaultPrevented()}),this.$search.on("input",function(b){a(this).off("keyup")}),this.$search.on("keyup input",function(a){e.handleSearch(a)}),c.on("open",function(){e.$search.attr("tabindex",0),e.$search.focus(),window.setTimeout(function(){e.$search.focus()},0)}),c.on("close",function(){e.$search.attr("tabindex",-1),e.$search.val("")}),c.on("focus",function(){c.isOpen()&&e.$search.focus()}),c.on("results:all",function(a){if(null==a.query.term||""===a.query.term){var b=e.showSearch(a);b?e.$searchContainer.removeClass("select2-search--hide"):e.$searchContainer.addClass("select2-search--hide")}})},c.prototype.handleSearch=function(a){if(!this._keyUpPrevented){var b=this.$search.val();this.trigger("query",{term:b})}this._keyUpPrevented=!1},c.prototype.showSearch=function(a,b){return!0},c}),b.define("select2/dropdown/hidePlaceholder",[],function(){function a(a,b,c,d){this.placeholder=this.normalizePlaceholder(c.get("placeholder")),a.call(this,b,c,d)}return a.prototype.append=function(a,b){b.results=this.removePlaceholder(b.results),a.call(this,b)},a.prototype.normalizePlaceholder=function(a,b){return"string"==typeof b&&(b={id:"",text:b}),b},a.prototype.removePlaceholder=function(a,b){for(var c=b.slice(0),d=b.length-1;d>=0;d--){var e=b[d];this.placeholder.id===e.id&&c.splice(d,1)}return c},a}),b.define("select2/dropdown/infiniteScroll",["jquery"],function(a){function b(a,b,c,d){this.lastParams={},a.call(this,b,c,d),this.$loadingMore=this.createLoadingMore(),this.loading=!1}return b.prototype.append=function(a,b){this.$loadingMore.remove(),this.loading=!1,a.call(this,b),this.showLoadingMore(b)&&this.$results.append(this.$loadingMore)},b.prototype.bind=function(b,c,d){var e=this;b.call(this,c,d),c.on("query",function(a){e.lastParams=a,e.loading=!0}),c.on("query:append",function(a){e.lastParams=a,e.loading=!0}),this.$results.on("scroll",function(){var b=a.contains(document.documentElement,e.$loadingMore[0]);if(!e.loading&&b){var c=e.$results.offset().top+e.$results.outerHeight(!1),d=e.$loadingMore.offset().top+e.$loadingMore.outerHeight(!1);c+50>=d&&e.loadMore()}})},b.prototype.loadMore=function(){this.loading=!0;var b=a.extend({},{page:1},this.lastParams);b.page++,this.trigger("query:append",b)},b.prototype.showLoadingMore=function(a,b){return b.pagination&&b.pagination.more},b.prototype.createLoadingMore=function(){var b=a('<li class="select2-results__option select2-results__option--load-more"role="treeitem" aria-disabled="true"></li>'),c=this.options.get("translations").get("loadingMore");return b.html(c(this.lastParams)),b},b}),b.define("select2/dropdown/attachBody",["jquery","../utils"],function(a,b){function c(b,c,d){this.$dropdownParent=d.get("dropdownParent")||a(document.body),b.call(this,c,d)}return c.prototype.bind=function(a,b,c){var d=this,e=!1;a.call(this,b,c),b.on("open",function(){d._showDropdown(),d._attachPositioningHandler(b),e||(e=!0,b.on("results:all",function(){d._positionDropdown(),d._resizeDropdown()}),b.on("results:append",function(){d._positionDropdown(),d._resizeDropdown()}))}),b.on("close",function(){d._hideDropdown(),d._detachPositioningHandler(b)}),this.$dropdownContainer.on("mousedown",function(a){a.stopPropagation()})},c.prototype.destroy=function(a){a.call(this),this.$dropdownContainer.remove()},c.prototype.position=function(a,b,c){b.attr("class",c.attr("class")),b.removeClass("select2"),b.addClass("select2-container--open"),b.css({position:"absolute",top:-999999}),this.$container=c},c.prototype.render=function(b){var c=a("<span></span>"),d=b.call(this);return c.append(d),this.$dropdownContainer=c,c},c.prototype._hideDropdown=function(a){this.$dropdownContainer.detach()},c.prototype._attachPositioningHandler=function(c,d){var e=this,f="scroll.select2."+d.id,g="resize.select2."+d.id,h="orientationchange.select2."+d.id,i=this.$container.parents().filter(b.hasScroll);i.each(function(){a(this).data("select2-scroll-position",{x:a(this).scrollLeft(),y:a(this).scrollTop()})}),i.on(f,function(b){var c=a(this).data("select2-scroll-position");a(this).scrollTop(c.y)}),a(window).on(f+" "+g+" "+h,function(a){e._positionDropdown(),e._resizeDropdown()})},c.prototype._detachPositioningHandler=function(c,d){var e="scroll.select2."+d.id,f="resize.select2."+d.id,g="orientationchange.select2."+d.id,h=this.$container.parents().filter(b.hasScroll);h.off(e),a(window).off(e+" "+f+" "+g)},c.prototype._positionDropdown=function(){var b=a(window),c=this.$dropdown.hasClass("select2-dropdown--above"),d=this.$dropdown.hasClass("select2-dropdown--below"),e=null,f=this.$container.offset();f.bottom=f.top+this.$container.outerHeight(!1);var g={height:this.$container.outerHeight(!1)};g.top=f.top,g.bottom=f.top+g.height;var h={height:this.$dropdown.outerHeight(!1)},i={top:b.scrollTop(),bottom:b.scrollTop()+b.height()},j=i.top<f.top-h.height,k=i.bottom>f.bottom+h.height,l={left:f.left,top:g.bottom},m=this.$dropdownParent;"static"===m.css("position")&&(m=m.offsetParent());var n=m.offset();l.top-=n.top,l.left-=n.left,c||d||(e="below"),k||!j||c?!j&&k&&c&&(e="below"):e="above",("above"==e||c&&"below"!==e)&&(l.top=g.top-n.top-h.height),null!=e&&(this.$dropdown.removeClass("select2-dropdown--below select2-dropdown--above").addClass("select2-dropdown--"+e),this.$container.removeClass("select2-container--below select2-container--above").addClass("select2-container--"+e)),this.$dropdownContainer.css(l)},c.prototype._resizeDropdown=function(){var a={width:this.$container.outerWidth(!1)+"px"};this.options.get("dropdownAutoWidth")&&(a.minWidth=a.width,a.position="relative",a.width="auto"),this.$dropdown.css(a)},c.prototype._showDropdown=function(a){this.$dropdownContainer.appendTo(this.$dropdownParent),this._positionDropdown(),this._resizeDropdown()},c}),b.define("select2/dropdown/minimumResultsForSearch",[],function(){function a(b){for(var c=0,d=0;d<b.length;d++){var e=b[d];e.children?c+=a(e.children):c++}return c}function b(a,b,c,d){this.minimumResultsForSearch=c.get("minimumResultsForSearch"),this.minimumResultsForSearch<0&&(this.minimumResultsForSearch=1/0),a.call(this,b,c,d)}return b.prototype.showSearch=function(b,c){return a(c.data.results)<this.minimumResultsForSearch?!1:b.call(this,c)},b}),b.define("select2/dropdown/selectOnClose",[],function(){function a(){}return a.prototype.bind=function(a,b,c){var d=this;a.call(this,b,c),b.on("close",function(a){d._handleSelectOnClose(a)})},a.prototype._handleSelectOnClose=function(a,b){if(b&&null!=b.originalSelect2Event){var c=b.originalSelect2Event;if("select"===c._type||"unselect"===c._type)return}var d=this.getHighlightedResults();if(!(d.length<1)){var e=d.data("data");null!=e.element&&e.element.selected||null==e.element&&e.selected||this.trigger("select",{data:e})}},a}),b.define("select2/dropdown/closeOnSelect",[],function(){function a(){}return a.prototype.bind=function(a,b,c){var d=this;a.call(this,b,c),b.on("select",function(a){d._selectTriggered(a)}),b.on("unselect",function(a){d._selectTriggered(a)})},a.prototype._selectTriggered=function(a,b){var c=b.originalEvent;c&&c.ctrlKey||this.trigger("close",{originalEvent:c,originalSelect2Event:b})},a}),b.define("select2/i18n/en",[],function(){return{errorLoading:function(){return"The results could not be loaded."},inputTooLong:function(a){var b=a.input.length-a.maximum,c="Please delete "+b+" character";return 1!=b&&(c+="s"),c},inputTooShort:function(a){var b=a.minimum-a.input.length,c="Please enter "+b+" or more characters";return c},loadingMore:function(){return"Loading more results…"},maximumSelected:function(a){var b="You can only select "+a.maximum+" item";return 1!=a.maximum&&(b+="s"),b},noResults:function(){return"No results found"},searching:function(){return"Searching…"}}}),b.define("select2/defaults",["jquery","require","./results","./selection/single","./selection/multiple","./selection/placeholder","./selection/allowClear","./selection/search","./selection/eventRelay","./utils","./translation","./diacritics","./data/select","./data/array","./data/ajax","./data/tags","./data/tokenizer","./data/minimumInputLength","./data/maximumInputLength","./data/maximumSelectionLength","./dropdown","./dropdown/search","./dropdown/hidePlaceholder","./dropdown/infiniteScroll","./dropdown/attachBody","./dropdown/minimumResultsForSearch","./dropdown/selectOnClose","./dropdown/closeOnSelect","./i18n/en"],function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C){function D(){this.reset()}D.prototype.apply=function(l){if(l=a.extend(!0,{},this.defaults,l),null==l.dataAdapter){if(null!=l.ajax?l.dataAdapter=o:null!=l.data?l.dataAdapter=n:l.dataAdapter=m,l.minimumInputLength>0&&(l.dataAdapter=j.Decorate(l.dataAdapter,r)),l.maximumInputLength>0&&(l.dataAdapter=j.Decorate(l.dataAdapter,s)),l.maximumSelectionLength>0&&(l.dataAdapter=j.Decorate(l.dataAdapter,t)),l.tags&&(l.dataAdapter=j.Decorate(l.dataAdapter,p)),(null!=l.tokenSeparators||null!=l.tokenizer)&&(l.dataAdapter=j.Decorate(l.dataAdapter,q)),null!=l.query){var C=b(l.amdBase+"compat/query");l.dataAdapter=j.Decorate(l.dataAdapter,C)}if(null!=l.initSelection){var D=b(l.amdBase+"compat/initSelection");l.dataAdapter=j.Decorate(l.dataAdapter,D)}}if(null==l.resultsAdapter&&(l.resultsAdapter=c,null!=l.ajax&&(l.resultsAdapter=j.Decorate(l.resultsAdapter,x)),null!=l.placeholder&&(l.resultsAdapter=j.Decorate(l.resultsAdapter,w)),l.selectOnClose&&(l.resultsAdapter=j.Decorate(l.resultsAdapter,A))),null==l.dropdownAdapter){if(l.multiple)l.dropdownAdapter=u;else{var E=j.Decorate(u,v);l.dropdownAdapter=E}if(0!==l.minimumResultsForSearch&&(l.dropdownAdapter=j.Decorate(l.dropdownAdapter,z)),l.closeOnSelect&&(l.dropdownAdapter=j.Decorate(l.dropdownAdapter,B)),null!=l.dropdownCssClass||null!=l.dropdownCss||null!=l.adaptDropdownCssClass){var F=b(l.amdBase+"compat/dropdownCss");l.dropdownAdapter=j.Decorate(l.dropdownAdapter,F)}l.dropdownAdapter=j.Decorate(l.dropdownAdapter,y)}if(null==l.selectionAdapter){if(l.multiple?l.selectionAdapter=e:l.selectionAdapter=d,null!=l.placeholder&&(l.selectionAdapter=j.Decorate(l.selectionAdapter,f)),l.allowClear&&(l.selectionAdapter=j.Decorate(l.selectionAdapter,g)),l.multiple&&(l.selectionAdapter=j.Decorate(l.selectionAdapter,h)),null!=l.containerCssClass||null!=l.containerCss||null!=l.adaptContainerCssClass){var G=b(l.amdBase+"compat/containerCss");l.selectionAdapter=j.Decorate(l.selectionAdapter,G)}l.selectionAdapter=j.Decorate(l.selectionAdapter,i)}if("string"==typeof l.language)if(l.language.indexOf("-")>0){var H=l.language.split("-"),I=H[0];l.language=[l.language,I]}else l.language=[l.language];if(a.isArray(l.language)){var J=new k;l.language.push("en");for(var K=l.language,L=0;L<K.length;L++){var M=K[L],N={};try{N=k.loadPath(M)}catch(O){try{M=this.defaults.amdLanguageBase+M,N=k.loadPath(M)}catch(P){l.debug&&window.console&&console.warn&&console.warn('Select2: The language file for "'+M+'" could not be automatically loaded. A fallback will be used instead.');continue}}J.extend(N)}l.translations=J}else{var Q=k.loadPath(this.defaults.amdLanguageBase+"en"),R=new k(l.language);R.extend(Q),l.translations=R}return l},D.prototype.reset=function(){function b(a){function b(a){return l[a]||a}return a.replace(/[^\u0000-\u007E]/g,b)}function c(d,e){if(""===a.trim(d.term))return e;if(e.children&&e.children.length>0){for(var f=a.extend(!0,{},e),g=e.children.length-1;g>=0;g--){var h=e.children[g],i=c(d,h);null==i&&f.children.splice(g,1)}return f.children.length>0?f:c(d,f)}var j=b(e.text).toUpperCase(),k=b(d.term).toUpperCase();return j.indexOf(k)>-1?e:null}this.defaults={amdBase:"./",amdLanguageBase:"./i18n/",closeOnSelect:!0,debug:!1,dropdownAutoWidth:!1,escapeMarkup:j.escapeMarkup,language:C,matcher:c,minimumInputLength:0,maximumInputLength:0,maximumSelectionLength:0,minimumResultsForSearch:0,selectOnClose:!1,sorter:function(a){return a},templateResult:function(a){return a.text},templateSelection:function(a){return a.text},theme:"default",width:"resolve"}},D.prototype.set=function(b,c){var d=a.camelCase(b),e={};e[d]=c;var f=j._convertData(e);a.extend(this.defaults,f)};var E=new D;return E}),b.define("select2/options",["require","jquery","./defaults","./utils"],function(a,b,c,d){function e(b,e){if(this.options=b,null!=e&&this.fromElement(e),this.options=c.apply(this.options),e&&e.is("input")){var f=a(this.get("amdBase")+"compat/inputData");this.options.dataAdapter=d.Decorate(this.options.dataAdapter,f)}}return e.prototype.fromElement=function(a){var c=["select2"];null==this.options.multiple&&(this.options.multiple=a.prop("multiple")),null==this.options.disabled&&(this.options.disabled=a.prop("disabled")),null==this.options.language&&(a.prop("lang")?this.options.language=a.prop("lang").toLowerCase():a.closest("[lang]").prop("lang")&&(this.options.language=a.closest("[lang]").prop("lang"))),null==this.options.dir&&(a.prop("dir")?this.options.dir=a.prop("dir"):a.closest("[dir]").prop("dir")?this.options.dir=a.closest("[dir]").prop("dir"):this.options.dir="ltr"),a.prop("disabled",this.options.disabled),a.prop("multiple",this.options.multiple),a.data("select2Tags")&&(this.options.debug&&window.console&&console.warn&&console.warn('Select2: The `data-select2-tags` attribute has been changed to use the `data-data` and `data-tags="true"` attributes and will be removed in future versions of Select2.'),a.data("data",a.data("select2Tags")),a.data("tags",!0)),a.data("ajaxUrl")&&(this.options.debug&&window.console&&console.warn&&console.warn("Select2: The `data-ajax-url` attribute has been changed to `data-ajax--url` and support for the old attribute will be removed in future versions of Select2."),a.attr("ajax--url",a.data("ajaxUrl")),a.data("ajax--url",a.data("ajaxUrl")));var e={};e=b.fn.jquery&&"1."==b.fn.jquery.substr(0,2)&&a[0].dataset?b.extend(!0,{},a[0].dataset,a.data()):a.data();var f=b.extend(!0,{},e);f=d._convertData(f);for(var g in f)b.inArray(g,c)>-1||(b.isPlainObject(this.options[g])?b.extend(this.options[g],f[g]):this.options[g]=f[g]);return this},e.prototype.get=function(a){return this.options[a]},e.prototype.set=function(a,b){this.options[a]=b},e}),b.define("select2/core",["jquery","./options","./utils","./keys"],function(a,b,c,d){var e=function(a,c){null!=a.data("select2")&&a.data("select2").destroy(),this.$element=a,this.id=this._generateId(a),c=c||{},this.options=new b(c,a),e.__super__.constructor.call(this);var d=a.attr("tabindex")||0;a.data("old-tabindex",d),a.attr("tabindex","-1");var f=this.options.get("dataAdapter");this.dataAdapter=new f(a,this.options);var g=this.render();this._placeContainer(g);var h=this.options.get("selectionAdapter");this.selection=new h(a,this.options),this.$selection=this.selection.render(),this.selection.position(this.$selection,g);var i=this.options.get("dropdownAdapter");this.dropdown=new i(a,this.options),this.$dropdown=this.dropdown.render(),this.dropdown.position(this.$dropdown,g);var j=this.options.get("resultsAdapter");this.results=new j(a,this.options,this.dataAdapter),this.$results=this.results.render(),this.results.position(this.$results,this.$dropdown);var k=this;this._bindAdapters(),this._registerDomEvents(),this._registerDataEvents(),this._registerSelectionEvents(),this._registerDropdownEvents(),this._registerResultsEvents(),this._registerEvents(),this.dataAdapter.current(function(a){k.trigger("selection:update",{data:a})}),a.addClass("select2-hidden-accessible"),a.attr("aria-hidden","true"),this._syncAttributes(),a.data("select2",this)};return c.Extend(e,c.Observable),e.prototype._generateId=function(a){var b="";return b=null!=a.attr("id")?a.attr("id"):null!=a.attr("name")?a.attr("name")+"-"+c.generateChars(2):c.generateChars(4),b=b.replace(/(:|\.|\[|\]|,)/g,""),b="select2-"+b},e.prototype._placeContainer=function(a){a.insertAfter(this.$element);var b=this._resolveWidth(this.$element,this.options.get("width"));null!=b&&a.css("width",b)},e.prototype._resolveWidth=function(a,b){var c=/^width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i;if("resolve"==b){var d=this._resolveWidth(a,"style");return null!=d?d:this._resolveWidth(a,"element")}if("element"==b){var e=a.outerWidth(!1);return 0>=e?"auto":e+"px"}if("style"==b){var f=a.attr("style");if("string"!=typeof f)return null;for(var g=f.split(";"),h=0,i=g.length;i>h;h+=1){var j=g[h].replace(/\s/g,""),k=j.match(c);if(null!==k&&k.length>=1)return k[1]}return null}return b},e.prototype._bindAdapters=function(){this.dataAdapter.bind(this,this.$container),this.selection.bind(this,this.$container),this.dropdown.bind(this,this.$container),this.results.bind(this,this.$container)},e.prototype._registerDomEvents=function(){var b=this;this.$element.on("change.select2",function(){b.dataAdapter.current(function(a){b.trigger("selection:update",{data:a})})}),this.$element.on("focus.select2",function(a){b.trigger("focus",a)}),this._syncA=c.bind(this._syncAttributes,this),this._syncS=c.bind(this._syncSubtree,this),this.$element[0].attachEvent&&this.$element[0].attachEvent("onpropertychange",this._syncA);var d=window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver;null!=d?(this._observer=new d(function(c){a.each(c,b._syncA),a.each(c,b._syncS)}),this._observer.observe(this.$element[0],{attributes:!0,childList:!0,subtree:!1})):this.$element[0].addEventListener&&(this.$element[0].addEventListener("DOMAttrModified",b._syncA,!1),this.$element[0].addEventListener("DOMNodeInserted",b._syncS,!1),this.$element[0].addEventListener("DOMNodeRemoved",b._syncS,!1))},e.prototype._registerDataEvents=function(){var a=this;this.dataAdapter.on("*",function(b,c){a.trigger(b,c)})},e.prototype._registerSelectionEvents=function(){var b=this,c=["toggle","focus"];this.selection.on("toggle",function(){b.toggleDropdown()}),this.selection.on("focus",function(a){b.focus(a)}),this.selection.on("*",function(d,e){-1===a.inArray(d,c)&&b.trigger(d,e)})},e.prototype._registerDropdownEvents=function(){var a=this;this.dropdown.on("*",function(b,c){a.trigger(b,c)})},e.prototype._registerResultsEvents=function(){var a=this;this.results.on("*",function(b,c){a.trigger(b,c)})},e.prototype._registerEvents=function(){var a=this;this.on("open",function(){a.$container.addClass("select2-container--open")}),this.on("close",function(){a.$container.removeClass("select2-container--open")}),this.on("enable",function(){a.$container.removeClass("select2-container--disabled")}),this.on("disable",function(){a.$container.addClass("select2-container--disabled")}),this.on("blur",function(){a.$container.removeClass("select2-container--focus")}),this.on("query",function(b){a.isOpen()||a.trigger("open",{}),this.dataAdapter.query(b,function(c){a.trigger("results:all",{data:c,query:b})})}),this.on("query:append",function(b){this.dataAdapter.query(b,function(c){a.trigger("results:append",{data:c,query:b})})}),this.on("keypress",function(b){var c=b.which;a.isOpen()?c===d.ESC||c===d.TAB||c===d.UP&&b.altKey?(a.close(),b.preventDefault()):c===d.ENTER?(a.trigger("results:select",{}),b.preventDefault()):c===d.SPACE&&b.ctrlKey?(a.trigger("results:toggle",{}),b.preventDefault()):c===d.UP?(a.trigger("results:previous",{}),b.preventDefault()):c===d.DOWN&&(a.trigger("results:next",{}),b.preventDefault()):(c===d.ENTER||c===d.SPACE||c===d.DOWN&&b.altKey)&&(a.open(),b.preventDefault())})},e.prototype._syncAttributes=function(){this.options.set("disabled",this.$element.prop("disabled")),this.options.get("disabled")?(this.isOpen()&&this.close(),this.trigger("disable",{})):this.trigger("enable",{})},e.prototype._syncSubtree=function(a,b){var c=!1,d=this;if(!a||!a.target||"OPTION"===a.target.nodeName||"OPTGROUP"===a.target.nodeName){if(b)if(b.addedNodes&&b.addedNodes.length>0)for(var e=0;e<b.addedNodes.length;e++){var f=b.addedNodes[e];f.selected&&(c=!0)}else b.removedNodes&&b.removedNodes.length>0&&(c=!0);else c=!0;c&&this.dataAdapter.current(function(a){d.trigger("selection:update",{data:a})})}},e.prototype.trigger=function(a,b){var c=e.__super__.trigger,d={open:"opening",close:"closing",select:"selecting",unselect:"unselecting"};if(void 0===b&&(b={}),a in d){var f=d[a],g={prevented:!1,name:a,args:b};if(c.call(this,f,g),g.prevented)return void(b.prevented=!0)}c.call(this,a,b)},e.prototype.toggleDropdown=function(){this.options.get("disabled")||(this.isOpen()?this.close():this.open())},e.prototype.open=function(){this.isOpen()||this.trigger("query",{})},e.prototype.close=function(){this.isOpen()&&this.trigger("close",{})},e.prototype.isOpen=function(){return this.$container.hasClass("select2-container--open")},e.prototype.hasFocus=function(){return this.$container.hasClass("select2-container--focus")},e.prototype.focus=function(a){this.hasFocus()||(this.$container.addClass("select2-container--focus"),this.trigger("focus",{}))},e.prototype.enable=function(a){this.options.get("debug")&&window.console&&console.warn&&console.warn('Select2: The `select2("enable")` method has been deprecated and will be removed in later Select2 versions. Use $element.prop("disabled") instead.'),(null==a||0===a.length)&&(a=[!0]);var b=!a[0];this.$element.prop("disabled",b)},e.prototype.data=function(){this.options.get("debug")&&arguments.length>0&&window.console&&console.warn&&console.warn('Select2: Data can no longer be set using `select2("data")`. You should consider setting the value instead using `$element.val()`.');var a=[];return this.dataAdapter.current(function(b){a=b}),a},e.prototype.val=function(b){if(this.options.get("debug")&&window.console&&console.warn&&console.warn('Select2: The `select2("val")` method has been deprecated and will be removed in later Select2 versions. Use $element.val() instead.'),null==b||0===b.length)return this.$element.val();var c=b[0];a.isArray(c)&&(c=a.map(c,function(a){return a.toString()})),this.$element.val(c).trigger("change")},e.prototype.destroy=function(){this.$container.remove(),this.$element[0].detachEvent&&this.$element[0].detachEvent("onpropertychange",this._syncA),null!=this._observer?(this._observer.disconnect(),this._observer=null):this.$element[0].removeEventListener&&(this.$element[0].removeEventListener("DOMAttrModified",this._syncA,!1),this.$element[0].removeEventListener("DOMNodeInserted",this._syncS,!1),this.$element[0].removeEventListener("DOMNodeRemoved",this._syncS,!1)),this._syncA=null,this._syncS=null,this.$element.off(".select2"),this.$element.attr("tabindex",this.$element.data("old-tabindex")),this.$element.removeClass("select2-hidden-accessible"),this.$element.attr("aria-hidden","false"),this.$element.removeData("select2"),this.dataAdapter.destroy(),this.selection.destroy(),this.dropdown.destroy(),this.results.destroy(),this.dataAdapter=null,this.selection=null,this.dropdown=null,this.results=null;
},e.prototype.render=function(){var b=a('<span class="select2 select2-container"><span class="selection"></span><span class="dropdown-wrapper" aria-hidden="true"></span></span>');return b.attr("dir",this.options.get("dir")),this.$container=b,this.$container.addClass("select2-container--"+this.options.get("theme")),b.data("element",this.$element),b},e}),b.define("jquery-mousewheel",["jquery"],function(a){return a}),b.define("jquery.select2",["jquery","jquery-mousewheel","./select2/core","./select2/defaults"],function(a,b,c,d){if(null==a.fn.select2){var e=["open","close","destroy"];a.fn.select2=function(b){if(b=b||{},"object"==typeof b)return this.each(function(){var d=a.extend(!0,{},b);new c(a(this),d)}),this;if("string"==typeof b){var d,f=Array.prototype.slice.call(arguments,1);return this.each(function(){var c=a(this).data("select2");null==c&&window.console&&console.error&&console.error("The select2('"+b+"') method was called on an element that is not using Select2."),d=c[b].apply(c,f)}),a.inArray(b,e)>-1?this:d}throw new Error("Invalid arguments for Select2: "+b)}}return null==a.fn.select2.defaults&&(a.fn.select2.defaults=d),c}),{define:b.define,require:b.require}}(),c=b.require("jquery.select2");return a.fn.select2.amd=b,c});;
/*! Hammer.JS - v1.0.5 - 2013-04-07
 * http://eightmedia.github.com/hammer.js
 *
 * Copyright (c) 2013 Jorik Tangelder <j.tangelder@gmail.com>;
 * Licensed under the MIT license */

(function(t,e){"use strict";function n(){if(!i.READY){i.event.determineEventTypes();for(var t in i.gestures)i.gestures.hasOwnProperty(t)&&i.detection.register(i.gestures[t]);i.event.onTouch(i.DOCUMENT,i.EVENT_MOVE,i.detection.detect),i.event.onTouch(i.DOCUMENT,i.EVENT_END,i.detection.detect),i.READY=!0}}var i=function(t,e){return new i.Instance(t,e||{})};i.defaults={stop_browser_behavior:{userSelect:"none",touchAction:"none",touchCallout:"none",contentZooming:"none",userDrag:"none",tapHighlightColor:"rgba(0,0,0,0)"}},i.HAS_POINTEREVENTS=navigator.pointerEnabled||navigator.msPointerEnabled,i.HAS_TOUCHEVENTS="ontouchstart"in t,i.MOBILE_REGEX=/mobile|tablet|ip(ad|hone|od)|android/i,i.NO_MOUSEEVENTS=i.HAS_TOUCHEVENTS&&navigator.userAgent.match(i.MOBILE_REGEX),i.EVENT_TYPES={},i.DIRECTION_DOWN="down",i.DIRECTION_LEFT="left",i.DIRECTION_UP="up",i.DIRECTION_RIGHT="right",i.POINTER_MOUSE="mouse",i.POINTER_TOUCH="touch",i.POINTER_PEN="pen",i.EVENT_START="start",i.EVENT_MOVE="move",i.EVENT_END="end",i.DOCUMENT=document,i.plugins={},i.READY=!1,i.Instance=function(t,e){var r=this;return n(),this.element=t,this.enabled=!0,this.options=i.utils.extend(i.utils.extend({},i.defaults),e||{}),this.options.stop_browser_behavior&&i.utils.stopDefaultBrowserBehavior(this.element,this.options.stop_browser_behavior),i.event.onTouch(t,i.EVENT_START,function(t){r.enabled&&i.detection.startDetect(r,t)}),this},i.Instance.prototype={on:function(t,e){for(var n=t.split(" "),i=0;n.length>i;i++)this.element.addEventListener(n[i],e,!1);return this},off:function(t,e){for(var n=t.split(" "),i=0;n.length>i;i++)this.element.removeEventListener(n[i],e,!1);return this},trigger:function(t,e){var n=i.DOCUMENT.createEvent("Event");n.initEvent(t,!0,!0),n.gesture=e;var r=this.element;return i.utils.hasParent(e.target,r)&&(r=e.target),r.dispatchEvent(n),this},enable:function(t){return this.enabled=t,this}};var r=null,o=!1,s=!1;i.event={bindDom:function(t,e,n){for(var i=e.split(" "),r=0;i.length>r;r++)t.addEventListener(i[r],n,!1)},onTouch:function(t,e,n){var a=this;this.bindDom(t,i.EVENT_TYPES[e],function(c){var u=c.type.toLowerCase();if(!u.match(/mouse/)||!s){(u.match(/touch/)||u.match(/pointerdown/)||u.match(/mouse/)&&1===c.which)&&(o=!0),u.match(/touch|pointer/)&&(s=!0);var h=0;o&&(i.HAS_POINTEREVENTS&&e!=i.EVENT_END?h=i.PointerEvent.updatePointer(e,c):u.match(/touch/)?h=c.touches.length:s||(h=u.match(/up/)?0:1),h>0&&e==i.EVENT_END?e=i.EVENT_MOVE:h||(e=i.EVENT_END),h||null===r?r=c:c=r,n.call(i.detection,a.collectEventData(t,e,c)),i.HAS_POINTEREVENTS&&e==i.EVENT_END&&(h=i.PointerEvent.updatePointer(e,c))),h||(r=null,o=!1,s=!1,i.PointerEvent.reset())}})},determineEventTypes:function(){var t;t=i.HAS_POINTEREVENTS?i.PointerEvent.getEvents():i.NO_MOUSEEVENTS?["touchstart","touchmove","touchend touchcancel"]:["touchstart mousedown","touchmove mousemove","touchend touchcancel mouseup"],i.EVENT_TYPES[i.EVENT_START]=t[0],i.EVENT_TYPES[i.EVENT_MOVE]=t[1],i.EVENT_TYPES[i.EVENT_END]=t[2]},getTouchList:function(t){return i.HAS_POINTEREVENTS?i.PointerEvent.getTouchList():t.touches?t.touches:[{identifier:1,pageX:t.pageX,pageY:t.pageY,target:t.target}]},collectEventData:function(t,e,n){var r=this.getTouchList(n,e),o=i.POINTER_TOUCH;return(n.type.match(/mouse/)||i.PointerEvent.matchType(i.POINTER_MOUSE,n))&&(o=i.POINTER_MOUSE),{center:i.utils.getCenter(r),timeStamp:(new Date).getTime(),target:n.target,touches:r,eventType:e,pointerType:o,srcEvent:n,preventDefault:function(){this.srcEvent.preventManipulation&&this.srcEvent.preventManipulation(),this.srcEvent.preventDefault&&this.srcEvent.preventDefault()},stopPropagation:function(){this.srcEvent.stopPropagation()},stopDetect:function(){return i.detection.stopDetect()}}}},i.PointerEvent={pointers:{},getTouchList:function(){var t=this,e=[];return Object.keys(t.pointers).sort().forEach(function(n){e.push(t.pointers[n])}),e},updatePointer:function(t,e){return t==i.EVENT_END?this.pointers={}:(e.identifier=e.pointerId,this.pointers[e.pointerId]=e),Object.keys(this.pointers).length},matchType:function(t,e){if(!e.pointerType)return!1;var n={};return n[i.POINTER_MOUSE]=e.pointerType==e.MSPOINTER_TYPE_MOUSE||e.pointerType==i.POINTER_MOUSE,n[i.POINTER_TOUCH]=e.pointerType==e.MSPOINTER_TYPE_TOUCH||e.pointerType==i.POINTER_TOUCH,n[i.POINTER_PEN]=e.pointerType==e.MSPOINTER_TYPE_PEN||e.pointerType==i.POINTER_PEN,n[t]},getEvents:function(){return["pointerdown MSPointerDown","pointermove MSPointerMove","pointerup pointercancel MSPointerUp MSPointerCancel"]},reset:function(){this.pointers={}}},i.utils={extend:function(t,n,i){for(var r in n)t[r]!==e&&i||(t[r]=n[r]);return t},hasParent:function(t,e){for(;t;){if(t==e)return!0;t=t.parentNode}return!1},getCenter:function(t){for(var e=[],n=[],i=0,r=t.length;r>i;i++)e.push(t[i].pageX),n.push(t[i].pageY);return{pageX:(Math.min.apply(Math,e)+Math.max.apply(Math,e))/2,pageY:(Math.min.apply(Math,n)+Math.max.apply(Math,n))/2}},getVelocity:function(t,e,n){return{x:Math.abs(e/t)||0,y:Math.abs(n/t)||0}},getAngle:function(t,e){var n=e.pageY-t.pageY,i=e.pageX-t.pageX;return 180*Math.atan2(n,i)/Math.PI},getDirection:function(t,e){var n=Math.abs(t.pageX-e.pageX),r=Math.abs(t.pageY-e.pageY);return n>=r?t.pageX-e.pageX>0?i.DIRECTION_LEFT:i.DIRECTION_RIGHT:t.pageY-e.pageY>0?i.DIRECTION_UP:i.DIRECTION_DOWN},getDistance:function(t,e){var n=e.pageX-t.pageX,i=e.pageY-t.pageY;return Math.sqrt(n*n+i*i)},getScale:function(t,e){return t.length>=2&&e.length>=2?this.getDistance(e[0],e[1])/this.getDistance(t[0],t[1]):1},getRotation:function(t,e){return t.length>=2&&e.length>=2?this.getAngle(e[1],e[0])-this.getAngle(t[1],t[0]):0},isVertical:function(t){return t==i.DIRECTION_UP||t==i.DIRECTION_DOWN},stopDefaultBrowserBehavior:function(t,e){var n,i=["webkit","khtml","moz","ms","o",""];if(e&&t.style){for(var r=0;i.length>r;r++)for(var o in e)e.hasOwnProperty(o)&&(n=o,i[r]&&(n=i[r]+n.substring(0,1).toUpperCase()+n.substring(1)),t.style[n]=e[o]);"none"==e.userSelect&&(t.onselectstart=function(){return!1})}}},i.detection={gestures:[],current:null,previous:null,stopped:!1,startDetect:function(t,e){this.current||(this.stopped=!1,this.current={inst:t,startEvent:i.utils.extend({},e),lastEvent:!1,name:""},this.detect(e))},detect:function(t){if(this.current&&!this.stopped){t=this.extendEventData(t);for(var e=this.current.inst.options,n=0,r=this.gestures.length;r>n;n++){var o=this.gestures[n];if(!this.stopped&&e[o.name]!==!1&&o.handler.call(o,t,this.current.inst)===!1){this.stopDetect();break}}return this.current&&(this.current.lastEvent=t),t.eventType==i.EVENT_END&&!t.touches.length-1&&this.stopDetect(),t}},stopDetect:function(){this.previous=i.utils.extend({},this.current),this.current=null,this.stopped=!0},extendEventData:function(t){var e=this.current.startEvent;if(e&&(t.touches.length!=e.touches.length||t.touches===e.touches)){e.touches=[];for(var n=0,r=t.touches.length;r>n;n++)e.touches.push(i.utils.extend({},t.touches[n]))}var o=t.timeStamp-e.timeStamp,s=t.center.pageX-e.center.pageX,a=t.center.pageY-e.center.pageY,c=i.utils.getVelocity(o,s,a);return i.utils.extend(t,{deltaTime:o,deltaX:s,deltaY:a,velocityX:c.x,velocityY:c.y,distance:i.utils.getDistance(e.center,t.center),angle:i.utils.getAngle(e.center,t.center),direction:i.utils.getDirection(e.center,t.center),scale:i.utils.getScale(e.touches,t.touches),rotation:i.utils.getRotation(e.touches,t.touches),startEvent:e}),t},register:function(t){var n=t.defaults||{};return n[t.name]===e&&(n[t.name]=!0),i.utils.extend(i.defaults,n,!0),t.index=t.index||1e3,this.gestures.push(t),this.gestures.sort(function(t,e){return t.index<e.index?-1:t.index>e.index?1:0}),this.gestures}},i.gestures=i.gestures||{},i.gestures.Hold={name:"hold",index:10,defaults:{hold_timeout:500,hold_threshold:1},timer:null,handler:function(t,e){switch(t.eventType){case i.EVENT_START:clearTimeout(this.timer),i.detection.current.name=this.name,this.timer=setTimeout(function(){"hold"==i.detection.current.name&&e.trigger("hold",t)},e.options.hold_timeout);break;case i.EVENT_MOVE:t.distance>e.options.hold_threshold&&clearTimeout(this.timer);break;case i.EVENT_END:clearTimeout(this.timer)}}},i.gestures.Tap={name:"tap",index:100,defaults:{tap_max_touchtime:250,tap_max_distance:10,tap_always:!0,doubletap_distance:20,doubletap_interval:300},handler:function(t,e){if(t.eventType==i.EVENT_END){var n=i.detection.previous,r=!1;if(t.deltaTime>e.options.tap_max_touchtime||t.distance>e.options.tap_max_distance)return;n&&"tap"==n.name&&t.timeStamp-n.lastEvent.timeStamp<e.options.doubletap_interval&&t.distance<e.options.doubletap_distance&&(e.trigger("doubletap",t),r=!0),(!r||e.options.tap_always)&&(i.detection.current.name="tap",e.trigger(i.detection.current.name,t))}}},i.gestures.Swipe={name:"swipe",index:40,defaults:{swipe_max_touches:1,swipe_velocity:.7},handler:function(t,e){if(t.eventType==i.EVENT_END){if(e.options.swipe_max_touches>0&&t.touches.length>e.options.swipe_max_touches)return;(t.velocityX>e.options.swipe_velocity||t.velocityY>e.options.swipe_velocity)&&(e.trigger(this.name,t),e.trigger(this.name+t.direction,t))}}},i.gestures.Drag={name:"drag",index:50,defaults:{drag_min_distance:10,drag_max_touches:1,drag_block_horizontal:!1,drag_block_vertical:!1,drag_lock_to_axis:!1,drag_lock_min_distance:25},triggered:!1,handler:function(t,n){if(i.detection.current.name!=this.name&&this.triggered)return n.trigger(this.name+"end",t),this.triggered=!1,e;if(!(n.options.drag_max_touches>0&&t.touches.length>n.options.drag_max_touches))switch(t.eventType){case i.EVENT_START:this.triggered=!1;break;case i.EVENT_MOVE:if(t.distance<n.options.drag_min_distance&&i.detection.current.name!=this.name)return;i.detection.current.name=this.name,(i.detection.current.lastEvent.drag_locked_to_axis||n.options.drag_lock_to_axis&&n.options.drag_lock_min_distance<=t.distance)&&(t.drag_locked_to_axis=!0);var r=i.detection.current.lastEvent.direction;t.drag_locked_to_axis&&r!==t.direction&&(t.direction=i.utils.isVertical(r)?0>t.deltaY?i.DIRECTION_UP:i.DIRECTION_DOWN:0>t.deltaX?i.DIRECTION_LEFT:i.DIRECTION_RIGHT),this.triggered||(n.trigger(this.name+"start",t),this.triggered=!0),n.trigger(this.name,t),n.trigger(this.name+t.direction,t),(n.options.drag_block_vertical&&i.utils.isVertical(t.direction)||n.options.drag_block_horizontal&&!i.utils.isVertical(t.direction))&&t.preventDefault();break;case i.EVENT_END:this.triggered&&n.trigger(this.name+"end",t),this.triggered=!1}}},i.gestures.Transform={name:"transform",index:45,defaults:{transform_min_scale:.01,transform_min_rotation:1,transform_always_block:!1},triggered:!1,handler:function(t,n){if(i.detection.current.name!=this.name&&this.triggered)return n.trigger(this.name+"end",t),this.triggered=!1,e;if(!(2>t.touches.length))switch(n.options.transform_always_block&&t.preventDefault(),t.eventType){case i.EVENT_START:this.triggered=!1;break;case i.EVENT_MOVE:var r=Math.abs(1-t.scale),o=Math.abs(t.rotation);if(n.options.transform_min_scale>r&&n.options.transform_min_rotation>o)return;i.detection.current.name=this.name,this.triggered||(n.trigger(this.name+"start",t),this.triggered=!0),n.trigger(this.name,t),o>n.options.transform_min_rotation&&n.trigger("rotate",t),r>n.options.transform_min_scale&&(n.trigger("pinch",t),n.trigger("pinch"+(1>t.scale?"in":"out"),t));break;case i.EVENT_END:this.triggered&&n.trigger(this.name+"end",t),this.triggered=!1}}},i.gestures.Touch={name:"touch",index:-1/0,defaults:{prevent_default:!1,prevent_mouseevents:!1},handler:function(t,n){return n.options.prevent_mouseevents&&t.pointerType==i.POINTER_MOUSE?(t.stopDetect(),e):(n.options.prevent_default&&t.preventDefault(),t.eventType==i.EVENT_START&&n.trigger(this.name,t),e)}},i.gestures.Release={name:"release",index:1/0,handler:function(t,e){t.eventType==i.EVENT_END&&e.trigger(this.name,t)}},"object"==typeof module&&"object"==typeof module.exports?module.exports=i:(t.Hammer=i,"function"==typeof t.define&&t.define.amd&&t.define("hammer",[],function(){return i}))})(this),function(t,e){"use strict";t!==e&&(Hammer.event.bindDom=function(n,i,r){t(n).on(i,function(t){var n=t.originalEvent||t;n.pageX===e&&(n.pageX=t.pageX,n.pageY=t.pageY),n.target||(n.target=t.target),n.which===e&&(n.which=n.button),n.preventDefault||(n.preventDefault=t.preventDefault),n.stopPropagation||(n.stopPropagation=t.stopPropagation),r.call(this,n)})},Hammer.Instance.prototype.on=function(e,n){return t(this.element).on(e,n)},Hammer.Instance.prototype.off=function(e,n){return t(this.element).off(e,n)},Hammer.Instance.prototype.trigger=function(e,n){var i=t(this.element);return i.has(n.target).length&&(i=t(n.target)),i.trigger({type:e,gesture:n})},t.fn.hammer=function(e){return this.each(function(){var n=t(this),i=n.data("hammer");i?i&&e&&Hammer.utils.extend(i.options,e):n.data("hammer",new Hammer(this,e||{}))})})}(window.jQuery||window.Zepto);;
/*!

   Flowplayer Commercial v5.4.6 (Monday, 04. November 2013 10:40AM) | flowplayer.org/license

*/
!function(e){function n(n,t){var o="obj"+(""+Math.random()).slice(2,15),i='<object class="fp-engine" id="'+o+'" name="'+o+'" ';i+=e.browser.msie?'classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">':' data="'+n+'" type="application/x-shockwave-flash">';var r={width:"100%",height:"100%",allowscriptaccess:"always",wmode:"transparent",quality:"high",flashvars:"",movie:n+(e.browser.msie?"?"+o:""),name:o};return e.each(t,function(e,n){r.flashvars+=e+"="+n+"&"}),e.each(r,function(e,n){i+='<param name="'+e+'" value="'+n+'"/>'}),i+="</object>",e(i)}function t(e,n){return n=n||100,Math.round(e*n)/n}function o(e){return/mpegurl/i.test(e)?"application/x-mpegurl":"video/"+e}function i(e){return/^(video|application)/.test(e)||(e=o(e)),!!h.canPlayType(e).replace("no","")}function r(n,t){var o=e.grep(n,function(e){return e.type===t});return o.length?o[0]:null}function a(e){var n=e.attr("src"),t=e.attr("type")||"",o=n.split(w)[1];return t=/mpegurl/.test(t)?"mpegurl":t.replace("video/",""),{src:n,suffix:o||t,type:t||o}}function s(n){var t=this,o=[];e("source",n).each(function(){o.push(a(e(this)))}),o.length||o.push(a(n)),t.initialSources=o,t.resolve=function(n){return n?(e.isArray(n)?n={sources:e.map(n,function(n){var t,o=e.extend({},n);return e.each(n,function(e){t=e}),o.type=t,o.src=n[t],delete o[t],o})}:"string"==typeof n&&(n={src:n,sources:[]},e.each(o,function(e,t){"flash"!=t.type&&n.sources.push({type:t.type,src:n.src.replace(w,"."+t.suffix+"$2")})})),n):{sources:o}}}function l(e){return e=parseInt(e,10),e>=10?e:"0"+e}function c(e){e=e||0;var n=Math.floor(e/3600),t=Math.floor(e/60);return e-=60*t,n>=1?(t-=60*n,n+":"+l(t)+":"+l(e)):l(t)+":"+l(e)}!function(e){if(!e.browser){var n=e.browser={},t=navigator.userAgent.toLowerCase(),o=/(chrome)[ \/]([\w.]+)/.exec(t)||/(safari)[ \/]([\w.]+)/.exec(t)||/(webkit)[ \/]([\w.]+)/.exec(t)||/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(t)||/(msie) ([\w.]+)/.exec(t)||t.indexOf("compatible")<0&&/(mozilla)(?:.*? rv:([\w.]+)|)/.exec(t)||[];o[1]&&(n[o[1]]=!0,n.version=o[2]||"0")}}(jQuery),e(function(){"function"==typeof e.fn.flowplayer&&e("video").parent(".flowplayer").flowplayer()});var d=[],u=[],f=window.navigator.userAgent;window.flowplayer=function(n){return e.isFunction(n)?u.push(n):"number"==typeof n||void 0===n?d[n||0]:e(n).data("flowplayer")},e(window).on("beforeunload",function(){e.each(d,function(n,t){t.conf.splash?t.unload():t.bind("error",function(){e(".flowplayer.is-error .fp-message").remove()})})});var p=!1;try{"object"==typeof window.localStorage&&(window.localStorage.flowplayerTestStorage="test",p=!0)}catch(m){}e.extend(flowplayer,{version:"5.4.6",engine:{},conf:{},support:{},defaults:{debug:!1,disabled:!1,engine:"html5",fullscreen:window==window.top,keyboard:!0,ratio:9/16,adaptiveRatio:1,key:'$197522565348345',flashfit:!1,rtmp:0,splash:!1,live:!1,swf:"/sites/all/themes/testbeeld/js/flowplayer.swf",speeds:[.25,.5,1,1.5,2],tooltip:!0,volume:p?"true"==localStorage.muted?0:isNaN(localStorage.volume)?1:localStorage.volume||1:1,errors:["","Video loading aborted","Network error","Video not properly encoded","Video file not found","Unsupported video","Skin not found","SWF file not found","Subtitles not found","Invalid RTMP URL","Unsupported video format. Try installing Adobe Flash."],errorUrls:["","","","","","","","","","","http://get.adobe.com/flashplayer/"],playlist:[]}});var g=1;e.fn.flowplayer=function(n,t){return"string"==typeof n&&(n={swf:n}),e.isFunction(n)&&(t=n,n={}),!n&&this.data("flowplayer")||this.each(function(){var o,i,r=e(this).addClass("is-loading"),a=e.extend({},flowplayer.defaults,flowplayer.conf,n,r.data()),l=e("video",r).addClass("fp-engine").removeAttr("controls"),c=l.length?new s(l):null,f={};if(a.playlist.length){var p,m=l.attr("preload");l.length&&l.replaceWith(p=e("<p />")),l=e("<video />").addClass("fp-engine"),p?p.replaceWith(l):r.prepend(l),flowplayer.support.video&&l.attr("preload",m),"string"==typeof a.playlist[0]?l.attr("src",a.playlist[0]):e.each(a.playlist[0],function(n,t){for(var o in t)t.hasOwnProperty(o)&&l.append(e("<source />").attr({type:"video/"+o,src:t[o]}))}),c=new s(l)}var v=r.data("flowplayer");v&&v.unload(),r.data("fp-player_id",r.data("fp-player_id")||g++);try{f=window.localStorage||f}catch(h){}var b=this.currentStyle&&"rtl"===this.currentStyle.direction||window.getComputedStyle&&"rtl"===window.getComputedStyle(this,null).getPropertyValue("direction");b&&r.addClass("is-rtl");var y=v||{conf:a,currentSpeed:1,volumeLevel:"undefined"==typeof a.volume?1*f.volume:a.volume,video:{},disabled:!1,finished:!1,loading:!1,muted:"true"==f.muted||a.muted,paused:!1,playing:!1,ready:!1,splash:!1,rtl:b,load:function(n,t){if(!(y.error||y.loading||y.disabled)){if(n=c.resolve(n),e.extend(n,i.pick(n.sources)),n.src){var o=e.Event("load");r.trigger(o,[y,n,i]),o.isDefaultPrevented()?y.loading=!1:(i.load(n),e.isFunction(n)&&(t=n),t&&r.one("ready",t))}return y}},pause:function(e){return!y.ready||y.seeking||y.disabled||y.loading||(i.pause(),y.one("pause",e)),y},resume:function(){return y.ready&&y.paused&&!y.disabled&&(i.resume(),y.finished&&(y.trigger("resume",[y]),y.finished=!1)),y},toggle:function(){return y.ready?y.paused?y.resume():y.pause():y.load()},seek:function(n,t){if(y.ready){if("boolean"==typeof n){var a=.1*y.video.duration;n=y.video.time+(n?a:-a)}n=o=Math.min(Math.max(n,0),y.video.duration).toFixed(1);var s=e.Event("beforeseek");r.trigger(s,[y,n]),s.isDefaultPrevented()?(y.seeking=!1,r.toggleClass("is-seeking",y.seeking)):(i.seek(n),e.isFunction(t)&&r.one("seek",t))}return y},seekTo:function(e,n){var t=void 0===e?o:.1*y.video.duration*e;return y.seek(t,n)},mute:function(e){return void 0===e&&(e=!y.muted),f.muted=y.muted=e,f.volume=isNaN(f.volume)?a.volume:f.volume,y.volume(e?0:f.volume,!0),y.trigger("mute",e),y},volume:function(e,n){return y.ready&&(e=Math.min(Math.max(e,0),1),n||(f.volume=e),i.volume(e)),y},speed:function(n,t){return y.ready&&("boolean"==typeof n&&(n=a.speeds[e.inArray(y.currentSpeed,a.speeds)+(n?1:-1)]||y.currentSpeed),i.speed(n),t&&r.one("speed",t)),y},stop:function(){return y.ready&&(y.pause(),y.seek(0,function(){r.trigger("stop")})),y},unload:function(){return r.hasClass("is-embedding")||(a.splash?(y.trigger("unload"),i.unload()):y.stop()),y},disable:function(e){return void 0===e&&(e=!y.disabled),e!=y.disabled&&(y.disabled=e,y.trigger("disable",e)),y}};y.conf=e.extend(y.conf,a),e.each(["bind","one","unbind"],function(e,n){y[n]=function(e,t){return r[n](e,t),y}}),y.trigger=function(e,n){return r.trigger(e,[y,n]),y},r.data("flowplayer")||r.bind("boot",function(){return e.each(["autoplay","loop","preload","poster"],function(e,n){var t=l.attr(n);void 0!==t&&(a[n]=t?t:!0)}),(a.splash||r.hasClass("is-splash")||!flowplayer.support.firstframe)&&(y.forcedSplash=!a.splash&&!r.hasClass("is-splash"),y.splash=a.splash=a.autoplay=!0,r.addClass("is-splash"),flowplayer.support.video&&l.attr("preload","none")),(a.live||r.hasClass("is-live"))&&(y.live=a.live=!0,r.addClass("is-live")),e.each(u,function(){this(y,r)}),i=flowplayer.engine[a.engine],i&&(i=i(y,r)),i.pick(c.initialSources)?y.engine=a.engine:e.each(flowplayer.engine,function(e){return e!=a.engine?(i=this(y,r),i.pick(c.initialSources)&&(y.engine=e),!1):void 0}),d.push(y),y.engine?(a.splash?y.unload():y.load(),a.disabled&&y.disable(),i.volume(y.volumeLevel),r.one("ready",t),void 0):y.trigger("error",{code:flowplayer.support.flashVideo?5:10})}).bind("load",function(n,t){a.splash&&e(".flowplayer").filter(".is-ready, .is-loading").not(r).each(function(){var n=e(this).data("flowplayer");n.conf.splash&&n.unload()}),r.addClass("is-loading"),t.loading=!0}).bind("ready",function(e,n,t){function o(){r.removeClass("is-loading"),n.loading=!1}t.time=0,n.video=t,a.splash?r.one("progress",o):o(),n.muted?n.mute(!0):n.volume(n.volumeLevel)}).bind("unload",function(){a.splash&&l.remove(),r.removeClass("is-loading"),y.loading=!1}).bind("ready unload",function(e){var n="ready"==e.type;r.toggleClass("is-splash",!n).toggleClass("is-ready",n),y.ready=n,y.splash=!n}).bind("progress",function(e,n,t){n.video.time=t}).bind("speed",function(e,n,t){n.currentSpeed=t}).bind("volume",function(e,n,t){n.volumeLevel=Math.round(100*t)/100,n.muted?t&&n.mute(!1):f.volume=t}).bind("beforeseek seek",function(e){y.seeking="beforeseek"==e.type,r.toggleClass("is-seeking",y.seeking)}).bind("ready pause resume unload finish stop",function(e,n,t){y.paused=/pause|finish|unload|stop/.test(e.type),"ready"==e.type&&(y.paused="none"==a.preload,t&&(y.paused=!t.duration||!a.autoplay&&"none"!=a.preload)),y.playing=!y.paused,r.toggleClass("is-paused",y.paused).toggleClass("is-playing",y.playing),y.load.ed||y.pause()}).bind("finish",function(){y.finished=!0}).bind("error",function(){l.remove()}),r.trigger("boot",[y,r]).data("flowplayer",y)})},!function(){var n=function(e){var n=/Version\/(\d\.\d)/.exec(e);return n&&n.length>1?parseFloat(n[1],10):0},t=flowplayer.support,o=e.browser,i=e("<video loop autoplay preload/>")[0],r=o.msie,a=navigator.userAgent,s=/iPad|MeeGo/.test(a)&&!/CriOS/.test(a),l=/iPad/.test(a)&&/CriOS/.test(a),c=/iP(hone|od)/i.test(a)&&!/iPad/.test(a),d=/Android/.test(a)&&!/Firefox/.test(a),u=/Android/.test(a)&&/Firefox/.test(a),f=/Silk/.test(a),p=/IEMobile/.test(a),m=(s?n(a):0,d?parseFloat(/Android\ (\d\.\d)/.exec(a)[1],10):0);e.extend(t,{subtitles:!!i.addTextTrack,fullscreen:!d&&("function"==typeof document.webkitCancelFullScreen&&!/Mac OS X 10_5.+Version\/5\.0\.\d Safari/.test(a)||document.mozFullScreenEnabled||"function"==typeof document.exitFullscreen),inlineBlock:!(r&&o.version<8),touch:"ontouchstart"in window,dataload:!s&&!c&&!p,zeropreload:!r&&!d,volume:!(s||d||c||f||l),cachedVideoTag:!(s||c||l||p),firstframe:!(c||s||d||f||l||p||u),inlineVideo:!c&&!p&&(!d||m>=3),hlsDuration:!o.safari||s||c||l,seekable:!s&&!l});try{var g=navigator.plugins["Shockwave Flash"],v=r?new ActiveXObject("ShockwaveFlash.ShockwaveFlash").GetVariable("$version"):g.description;r||g[0].enabledPlugin?(v=v.split(/\D+/),v.length&&!v[0]&&(v=v.slice(1)),t.flashVideo=v[0]>9||9==v[0]&&v[3]>=115):t.flashVideo=!1}catch(h){}try{t.video=!!i.canPlayType,t.video&&i.canPlayType("video/mp4")}catch(b){t.video=!1}t.animation=function(){for(var n=["","Webkit","Moz","O","ms","Khtml"],t=e("<p/>")[0],o=0;o<n.length;o++)if("undefined"!==t.style[n[o]+"AnimationName"])return!0}()}(),window.attachEvent&&window.attachEvent("onbeforeunload",function(){__flash_savedUnloadHandler=__flash_unloadHandler=function(){}}),flowplayer.engine.flash=function(t,o){var i,r,a,s=t.conf;t.video;var l={pick:function(n){if(flowplayer.support.flashVideo){var t=e.grep(n,function(e){return"flash"==e.type})[0];if(t)return t;for(var o,i=0;i<n.length;i++)if(o=n[i],/mp4|flv/.test(o.type))return o}},load:function(l){function c(e){return e.replace(/&amp;/g,"%26").replace(/&/g,"%26").replace(/=/g,"%3D")}var d=e("video",o),u=c(l.src);is_absolute=/^https?:/.test(u);try{d.length>0&&flowplayer.support.video&&d[0].pause()}catch(f){}var p=function(){d.remove()},m=function(n){return e.grep(n,function(e){return!!d[0].canPlayType("video/"+e.type)}).length>0};if(flowplayer.support.video&&d.prop("autoplay")&&m(l.sources)?d.one("timeupdate",p):p(),is_absolute||s.rtmp||(u=e("<img/>").attr("src",u)[0].src),a)a.__play(u);else{i="fp"+(""+Math.random()).slice(3,15);var g={hostname:s.embedded?s.hostname:location.hostname,url:u,callback:"jQuery."+i};o.data("origin")&&(g.origin=o.data("origin")),is_absolute&&delete s.rtmp,e.each(["key","autoplay","preload","rtmp","loop","debug","preload","splash","bufferTime"],function(e,n){s[n]&&(g[n]=s[n])}),g.rtmp&&(g.rtmp=c(g.rtmp)),r=n(s.swf,g),r.prependTo(o),a=r[0],setTimeout(function(){try{if(!a.PercentLoaded())return o.trigger("error",[t,{code:7,url:s.swf}])}catch(e){}},5e3),setTimeout(function(){"undefined"==typeof a.PercentLoaded&&o.trigger("flashdisabled",[t])},1e3),e[i]=function(n,o){s.debug&&"status"!=n&&console.log("--",n,o);var i=e.Event(n);switch(n){case"ready":o=e.extend(l,o);break;case"click":i.flash=!0;break;case"keydown":i.which=o;break;case"seek":l.time=o;break;case"status":t.trigger("progress",o.time),o.buffer<l.bytes&&!l.buffered?(l.buffer=o.buffer/l.bytes*l.duration,t.trigger("buffer",l.buffer)):l.buffered||(l.buffered=!0,t.trigger("buffered"))}"buffered"!=n&&setTimeout(function(){t.trigger(i,o)},1)}}},speed:e.noop,unload:function(){a&&a.__unload&&a.__unload(),delete e[i],e("object",o).remove(),a=0}};e.each("pause,resume,seek,volume".split(","),function(e,n){l[n]=function(e){try{t.ready&&("seek"==n&&t.video.time&&!t.paused&&t.trigger("beforeseek"),void 0===e?a["__"+n]():a["__"+n](e))}catch(i){if("undefined"==typeof a["__"+n])return o.trigger("flashdisabled",[t]);throw i}}});var c=e(window);return t.bind("ready fullscreen fullscreen-exit",function(n){var i=o.height(),r=o.width();if(t.conf.flashfit||/full/.test(n.type)){var a,s,l=t.isFullscreen,d=l&&E,u=!flowplayer.support.inlineBlock,f=l?d?screen.width:c.width():r,p=l?d?screen.height:c.height():i,m=0,g=0,v=u?r:"",h=u?i:"";(t.conf.flashfit||"fullscreen"===n.type)&&(a=t.video.width/t.video.height,s=t.video.height/t.video.width,h=Math.max(s*f),v=Math.max(a*p),h=h>p?v*s:h,h=Math.min(Math.round(h),p),v=v>f?h*a:v,v=Math.min(Math.round(v),f),g=Math.max(Math.round((p+g-h)/2),0),m=Math.max(Math.round((f+m-v)/2),0)),e("object",o).css({width:v,height:h,marginTop:g,marginLeft:m})}}),l};var v,h=e("<video/>")[0],b={ended:"finish",pause:"pause",play:"resume",progress:"buffer",timeupdate:"progress",volumechange:"volume",ratechange:"speed",seeked:"seek",loadeddata:"ready",error:"error",dataunavailable:"error"},y=function(n){return v?v.attr({type:o(n.type),src:n.src}):v=e("<video/>",{src:n.src,type:o(n.type),"class":"fp-engine",autoplay:"autoplay",preload:"none","x-webkit-airplay":"allow"})};flowplayer.engine.html5=function(n,o){function a(r,a,s){r.listeners&&r.listeners.hasOwnProperty(o.data("fp-player_id"))||((r.listeners||(r.listeners={}))[o.data("fp-player_id")]=!0,a.bind("error",function(t){try{if(t.originalEvent&&e(t.originalEvent.originalTarget).is("img"))return t.preventDefault();i(e(t.target).attr("type"))&&n.trigger("error",{code:4})}catch(o){}}),e.each(b,function(i,a){r.addEventListener(i,function(c){if("progress"==a&&c.srcElement&&0===c.srcElement.readyState&&setTimeout(function(){n.video.duration||(a="error",n.trigger(a,{code:4}))},1e4),p.debug&&!/progress/.test(a)&&console.log(i,"->",a,c),(n.ready||/ready|error/.test(a))&&a&&e("video",o).length){var d,f=e.Event(a);switch(a){case"ready":d=e.extend(s,{duration:r.duration,width:r.videoWidth,height:r.videoHeight,url:r.currentSrc,src:r.currentSrc});try{d.seekable=r.seekable&&r.seekable.end(null)}catch(m){}if(l=l||setInterval(function(){try{d.buffer=r.buffered.end(null)}catch(e){}d.buffer&&(t(d.buffer,1e3)<t(d.duration,1e3)&&!d.buffered?n.trigger("buffer",c):d.buffered||(d.buffered=!0,n.trigger("buffer",c).trigger("buffered",c),clearInterval(l),l=0))},250),!p.live&&!d.duration&&!u.hlsDuration&&"loadeddata"===i){var g=function(){d.duration=r.duration;try{d.seekable=r.seekable&&r.seekable.end(null)}catch(e){}n.trigger(f,d),r.removeEventListener("durationchange",g)};return r.addEventListener("durationchange",g),void 0}break;case"progress":case"seek":if(n.video.duration,r.currentTime>0){d=Math.max(r.currentTime,0);break}if("progress"==a)return;case"speed":d=t(r.playbackRate);break;case"volume":d=t(r.volume);break;case"error":try{d=(c.srcElement||c.originalTarget).error}catch(v){return}}n.trigger(f,d)}},!1)}))}var s,l,c,d=e("video",o),u=flowplayer.support,f=e("track",d),p=n.conf;return s={pick:function(e){if(u.video){if(p.videoTypePreference){var n=r(e,p.videoTypePreference);if(n)return n}for(var t=0;t<e.length;t++)if(i(e[t].type))return e[t]}},load:function(t){if(p.splash&&!c)d=y(t).prependTo(o),u.inlineVideo||d.css({position:"absolute",top:"-9999em"}),f.length&&d.append(f.attr("default","")),p.loop&&d.attr("loop","loop"),c=d[0];else{c=d[0];var i=d.find("source");!c.src&&i.length&&(c.src=t.src,i.remove()),n.video.src&&t.src!=n.video.src?(d.attr("autoplay","autoplay"),c.src=t.src):"none"!=p.preload&&u.dataload||(u.zeropreload?n.trigger("ready",t).trigger("pause").one("ready",function(){o.trigger("resume",[n])}):n.one("ready",function(){o.trigger("pause",[n])}))}a(c,e("source",d).add(d),t),"none"==p.preload&&u.zeropreload&&u.dataload||c.load(),p.splash&&c.load()},pause:function(){c.pause()},resume:function(){c.play()},speed:function(e){c.playbackRate=e},seek:function(e){try{var t=n.paused;c.currentTime=e,t&&c.pause()}catch(o){}},volume:function(e){c.volume=e},unload:function(){e("video.fp-engine",o).remove(),u.cachedVideoTag||(v=null),l=clearInterval(l),c=0}}};var w=/\.(\w{3,4})(\?.*)?$/i;e.throttle=function(e,n){var t;return function(){t||(e.apply(this,arguments),t=1,setTimeout(function(){t=0},n))}},e.fn.slider2=function(n){var t=/iPad/.test(navigator.userAgent)&&!/CriOS/.test(navigator.userAgent);return this.each(function(){var o,i,r,a,s,l,c,d,u=e(this),f=e(document),p=u.children(":last"),m=!1,g=function(){i=u.offset(),r=u.width(),a=u.height(),l=s?a:r,d=y(c)},v=function(e){o||e==w.value||c&&!(c>e)||(u.trigger("slide",[e]),w.value=e)},h=function(e){var t=e.pageX;!t&&e.originalEvent&&e.originalEvent.touches&&e.originalEvent.touches.length&&(t=e.originalEvent.touches[0].pageX);var o=s?e.pageY-i.top:t-i.left;o=Math.max(0,Math.min(d||l,o));var r=o/l;return s&&(r=1-r),n&&(r=1-r),b(r,0,!0)},b=function(e,n){void 0===n&&(n=0),e>1&&(e=1);var o=Math.round(1e3*e)/10+"%";return(!c||c>=e)&&(t||p.stop(),m?p.css("width",o):p.animate(s?{height:o}:{width:o},n,"linear")),e},y=function(e){return Math.max(0,Math.min(l,s?(1-e)*a:e*r))},w={max:function(e){c=e},disable:function(e){o=e},slide:function(e,n,t){g(),t&&v(e),b(e,n)},disableAnimation:function(e){m=e!==!1}};g(),u.data("api",w).bind("mousedown.sld touchstart",function(n){if(n.preventDefault(),!o){var t=e.throttle(v,100);g(),w.dragging=!0,u.addClass("is-dragging"),v(h(n)),f.bind("mousemove.sld touchmove",function(e){e.preventDefault(),t(h(e))}).one("mouseup touchend",function(){w.dragging=!1,u.removeClass("is-dragging"),f.unbind("mousemove.sld touchmove")})}})})},flowplayer(function(n,t){function o(n){return e(".fp-"+n,t)}function i(n){("0px"===t.css("width")||"0px"===t.css("height")||n!==flowplayer.defaults.ratio)&&(parseInt(b,10)||g.css("paddingTop",100*n+"%")),l.inlineBlock||e("object",t).height(t.height())}function r(e){t.toggleClass("is-mouseover",e).toggleClass("is-mouseout",!e)}var a,s=n.conf,l=flowplayer.support;t.find(".fp-ratio,.fp-ui").remove(),t.addClass("flowplayer").append('      <div class="ratio"/>      <div class="ui">         <div class="waiting"><em/><em/><em/></div>         <a class="fullscreen"/>         <a class="unload"/>         <p class="speed"/>         <div class="controls">            <a class="play"></a>            <div class="timeline">               <div class="buffer"/>               <div class="progress"/>            </div>            <div class="volume">               <a class="mute"></a>               <div class="volumeslider">                  <div class="volumelevel"/>               </div>            </div>         </div>         <div class="time">            <em class="elapsed">00:00</em>            <em class="remaining"/>            <em class="duration">00:00</em>         </div>         <div class="message"><h2/><p/></div>      </div>'.replace(/class="/g,'class="fp-'));var d=o("progress"),u=o("buffer"),f=o("elapsed"),p=o("remaining"),m=o("waiting"),g=o("ratio"),v=o("speed"),h=o("duration"),b=g.css("paddingTop"),y=o("timeline").slider2(n.rtl),w=y.data("api"),k=(o("volume"),o("fullscreen")),x=o("volumeslider").slider2(n.rtl),C=x.data("api"),T=t.is(".fixed-controls, .no-toggle");w.disableAnimation(t.hasClass("is-touch")),l.animation||m.html("<p>loading &hellip;</p>"),i(s.ratio);try{s.fullscreen||k.remove()}catch(S){k.remove()}n.bind("ready",function(){var e=n.video.duration;w.disable(n.disabled||!e),s.adaptiveRatio&&i(n.video.height/n.video.width),h.add(p).html(c(e)),e>=3600&&t.addClass("is-long")||t.removeClass("is-long"),C.slide(n.volumeLevel)}).bind("unload",function(){b||g.css("paddingTop","")}).bind("buffer",function(){var e=n.video,t=e.buffer/e.duration;!e.seekable&&l.seekable&&w.max(t),1>t?u.css("width",100*t+"%"):u.css({width:"100%"})}).bind("speed",function(e,n,t){v.text(t+"x").addClass("fp-hilite"),setTimeout(function(){v.removeClass("fp-hilite")},1e3)}).bind("buffered",function(){u.css({width:"100%"}),w.max(1)}).bind("progress",function(){var e=n.video.time,t=n.video.duration;w.dragging||w.slide(e/t,n.seeking?0:250),f.html(c(e)),p.html("-"+c(t-e))}).bind("finish resume seek",function(e){t.toggleClass("is-finished","finish"==e.type)}).bind("stop",function(){f.html(c(0)),w.slide(0,100)}).bind("finish",function(){f.html(c(n.video.duration)),w.slide(1,100),t.removeClass("is-seeking")}).bind("beforeseek",function(){d.stop()}).bind("volume",function(){C.slide(n.volumeLevel)}).bind("disable",function(){var e=n.disabled;w.disable(e),C.disable(e),t.toggleClass("is-disabled",n.disabled)}).bind("mute",function(e,n,o){t.toggleClass("is-muted",o)}).bind("error",function(n,o,i){if(t.removeClass("is-loading").addClass("is-error"),i){i.message=s.errors[i.code],o.error=!0;var r=e(".fp-message",t);e("h2",r).text((o.engine||"html5")+": "+i.message),e("p",r).text(i.url||o.video.url||o.video.src||s.errorUrls[i.code]),t.unbind("mouseenter click").removeClass("is-mouseover")}}).bind("mouseenter mouseleave",function(e){if(!T){var n,o="mouseenter"==e.type;r(o),o?(t.bind("pause.x mousemove.x volume.x",function(){r(!0),n=new Date}),a=setInterval(function(){new Date-n>5e3&&(r(!1),n=new Date)},100)):(t.unbind(".x"),clearInterval(a))}}).bind("mouseleave",function(){(w.dragging||C.dragging)&&t.addClass("is-mouseover").removeClass("is-mouseout")}).bind("click.player",function(t){return e(t.target).is(".fp-ui, .fp-engine")||t.flash?(t.preventDefault(),n.toggle()):void 0}).bind("contextmenu",function(n){n.preventDefault();var o=t.offset(),i=e(window),r=n.clientX-o.left,a=n.clientY-o.top+i.scrollTop(),s=t.find(".fp-context-menu").css({left:r+"px",top:a+"px",display:"block"}).on("click",function(e){e.stopPropagation()});e("html").on("click.outsidemenu",function(){s.hide(),e("html").off("click.outsidemenu")})}).bind("flashdisabled",function(){t.addClass("is-flash-disabled").one("ready",function(){t.removeClass("is-flash-disabled").find(".fp-flash-disabled").remove()}).append('<div class="fp-flash-disabled">Adobe Flash is disabled for this page, click player area to enable.</div>')}),s.poster&&t.css("backgroundImage","url("+s.poster+")");var F=t.css("backgroundColor"),_="none"!=t.css("backgroundImage")||F&&"rgba(0, 0, 0, 0)"!=F&&"transparent"!=F;!_||s.splash||s.autoplay||n.bind("ready stop",function(){t.addClass("is-poster").one("progress",function(){t.removeClass("is-poster")})}),!_&&n.forcedSplash&&t.css("backgroundColor","#555"),e(".fp-toggle, .fp-play",t).click(n.toggle),e.each(["mute","fullscreen","unload"],function(e,t){o(t).click(function(){n[t]()})}),y.bind("slide",function(e,t){n.seeking=!0,n.seek(t*n.video.duration)}),x.bind("slide",function(e,t){n.volume(t)}),o("time").click(function(){e(this).toggleClass("is-inverted")}),r(T)});var k,x,C="is-help";e(document).bind("keydown.fp",function(n){var t=k,o=n.ctrlKey||n.metaKey||n.altKey,i=n.which,r=t&&t.conf;if(t&&r.keyboard&&!t.disabled){if(-1!=e.inArray(i,[63,187,191]))return x.toggleClass(C),!1;if(27==i&&x.hasClass(C))return x.toggleClass(C),!1;if(!o&&t.ready){if(n.preventDefault(),n.shiftKey)return 39==i?t.speed(!0):37==i&&t.speed(!1),void 0;if(58>i&&i>47)return t.seekTo(i-48);switch(i){case 38:case 75:t.volume(t.volumeLevel+.15);break;case 40:case 74:t.volume(t.volumeLevel-.15);break;case 39:case 76:t.seeking=!0,t.seek(!0);break;case 37:case 72:t.seeking=!0,t.seek(!1);break;case 190:t.seekTo();break;case 32:t.toggle();break;case 70:r.fullscreen&&t.fullscreen();break;case 77:t.mute();break;case 81:t.unload()}}}}),flowplayer(function(n,t){n.conf.keyboard&&(t.bind("mouseenter mouseleave",function(e){k=n.disabled||"mouseenter"!=e.type?0:n,k&&(x=t)}),t.append('      <div class="fp-help">         <a class="fp-close"></a>         <div class="fp-help-section fp-help-basics">            <p><em>space</em>play / pause</p>            <p><em>q</em>unload | stop</p>            <p><em>f</em>fullscreen</p>            <p><em>shift</em> + <em>&#8592;</em><em>&#8594;</em>slower / faster <small>(latest Chrome and Safari)</small></p>         </div>         <div class="fp-help-section">            <p><em>&#8593;</em><em>&#8595;</em>volume</p>            <p><em>m</em>mute</p>         </div>         <div class="fp-help-section">            <p><em>&#8592;</em><em>&#8594;</em>seek</p>            <p><em>&nbsp;. </em>seek to previous            </p><p><em>1</em><em>2</em>&hellip;<em>6</em> seek to 10%, 20%, &hellip;60% </p>         </div>      </div>   '),n.conf.tooltip&&e(".fp-ui",t).attr("title","Hit ? for help").on("mouseout.tip",function(){e(this).removeAttr("title").off("mouseout.tip")}),e(".fp-close",t).click(function(){t.toggleClass(C)}))});var T,S=e.browser.mozilla?"moz":"webkit",F="fullscreen",_="fullscreen-exit",E=flowplayer.support.fullscreen,M="function"==typeof document.exitFullscreen,j=navigator.userAgent.toLowerCase(),A=/(safari)[ \/]([\w.]+)/.exec(j)&&!/(chrome)[ \/]([\w.]+)/.exec(j);e(document).bind(M?"fullscreenchange":S+"fullscreenchange",function(n){var t=e(document.webkitCurrentFullScreenElement||document.mozFullScreenElement||document.fullscreenElement||n.target);t.length&&!T?T=t.trigger(F,[t]):(T.trigger(_,[T]),T=null)}),flowplayer(function(n,t){if(n.conf.fullscreen){var o,i=e(window),r={index:0,pos:0,play:!1};n.isFullscreen=!1,n.fullscreen=function(a){return n.disabled?void 0:(void 0===a&&(a=!n.isFullscreen),a&&(o=i.scrollTop()),"webkit"!=S&&!A||"flash"!=n.engine||(r.index=n.video.index,n.conf.rtmp&&e.extend(r,{pos:n.video.time,play:n.playing})),E?a?M?t[0].requestFullscreen():(t[0][S+"RequestFullScreen"](Element.ALLOW_KEYBOARD_INPUT),!A||document.webkitCurrentFullScreenElement||document.mozFullScreenElement||t[0][S+"RequestFullScreen"]()):M?document.exitFullscreen():document[S+"CancelFullScreen"]():n.trigger(a?F:_,[n]),n)};var a;t.bind("mousedown.fs",function(){+new Date-a<150&&n.ready&&n.fullscreen(),a=+new Date}),n.bind(F,function(){t.addClass("is-fullscreen"),n.isFullscreen=!0}).bind(_,function(){var e;E||"html5"!==n.engine||(e=t.css("opacity")||"",t.css("opacity",0)),t.removeClass("is-fullscreen"),E||"html5"!==n.engine||setTimeout(function(){t.css("opacity",e)}),n.isFullscreen=!1,i.scrollTop(o)}).bind("ready",function(){if(r.index>0)n.play(r.index),r.index=0;else if(r.pos&&!isNaN(r.pos)){var t=function(){r.play||n.pause(),e.extend(r,{pos:0,play:!1})};n.conf.live?(n.resume(),t()):n.resume().seek(r.pos,t)}})}}),flowplayer(function(n,t){function o(){return e(r.query,t)}function i(){return e(r.query+"."+a,t)}var r=e.extend({active:"is-active",advance:!0,query:".fp-playlist a"},n.conf),a=r.active;n.play=function(t){return void 0===t?n.resume():"number"!=typeof t||n.conf.playlist[t]?("number"!=typeof t&&n.load.apply(null,arguments),n.unbind("resume.fromfirst"),n.video.index=t,n.load("string"==typeof n.conf.playlist[t]?n.conf.playlist[t].toString():e.map(n.conf.playlist[t],function(n){return e.extend({},n)})),n):n},n.next=function(e){e&&e.preventDefault();var t=n.video.index;return-1!=t&&(t=t===n.conf.playlist.length-1?0:t+1,n.play(t)),n},n.prev=function(e){e&&e.preventDefault();var t=n.video.index;return-1!=t&&(t=0===t?n.conf.playlist.length-1:t-1,n.play(t)),n},e(".fp-next",t).click(n.next),e(".fp-prev",t).click(n.prev),r.advance&&t.unbind("finish.pl").bind("finish.pl",function(e,n){var o=n.video.index+1;o<n.conf.playlist.length||r.loop?(o=o===n.conf.playlist.length?0:o,t.removeClass("is-finished"),setTimeout(function(){n.play(o)})):(t.addClass("is-playing"),n.conf.playlist.length>1&&n.one("resume.fromfirst",function(){return n.play(0),!1}))});var s=!1;if(n.conf.playlist.length){s=!0;var l=t.find(".fp-playlist");if(!l.length){l=e('<div class="fp-playlist"></div>');var c=e(".fp-next,.fp-prev",t);c.length?c.eq(0).before(l):e("video",t).after(l)}l.empty(),e.each(n.conf.playlist,function(n,t){var o;if("string"==typeof t)o=t;else for(var i in t[0])if(t[0].hasOwnProperty(i)){o=t[0][i];break}l.append(e("<a />").attr({href:o,"data-index":n}))})}if(o().length){s||(n.conf.playlist=[],o().each(function(){var t=e(this).attr("href");e(this).attr("data-index",n.conf.playlist.length),n.conf.playlist.push(t)})),t.on("click",r.query,function(t){t.preventDefault();var o=e(t.target).closest(r.query),i=Number(o.attr("data-index"));-1!=i&&n.play(i)});var d=o().filter("[data-cuepoints]").length;n.bind("load",function(o,r,s){var l=i().removeClass(a),c=l.attr("data-index"),u=s.index=n.video.index||0,f=e('a[data-index="'+u+'"]',t).addClass(a),p=u==n.conf.playlist.length-1;t.removeClass("video"+c).addClass("video"+u).toggleClass("last-video",p),s.index=r.video.index=u,s.is_last=r.video.is_last=p,d&&(n.cuepoints=f.data("cuepoints"))}).bind("unload.pl",function(){i().toggleClass(a)})}n.conf.playlist.length&&(n.conf.loop=!1)});var D=/ ?cue\d+ ?/;flowplayer(function(n,t){function o(e){t[0].className=t[0].className.replace(D," "),e>=0&&t.addClass("cue"+e)}var i=0;n.cuepoints=n.conf.cuepoints||[],n.bind("progress",function(e,r,a){if(i&&.015>a-i)return i=a;i=a;for(var s,l=n.cuepoints||[],c=0;c<l.length;c++)s=l[c],isNaN(s)||(s={time:s}),s.time<0&&(s.time=n.video.duration+s.time),s.index=c,Math.abs(s.time-a)<.125*n.currentSpeed&&(o(c),t.trigger("cuepoint",[n,s]))}).bind("unload seek",o),n.conf.generate_cuepoints&&n.bind("load",function(){e(".fp-cuepoint",t).remove()}).bind("ready",function(){var o=n.cuepoints||[],i=n.video.duration,r=e(".fp-timeline",t).css("overflow","visible");e.each(o,function(t,o){var a=o.time||o;0>a&&(a=i+o);var s=e("<a/>").addClass("fp-cuepoint fp-cuepoint"+t).css("left",100*(a/i)+"%");s.appendTo(r).mousedown(function(){return n.seek(a),!1})})})}),flowplayer(function(n,t){function o(e){var n=e.split(":");return 2==n.length&&n.unshift(0),60*60*n[0]+60*n[1]+parseFloat(n[2].replace(",","."))}var i=e("track",t),r=n.conf;if(!flowplayer.support.subtitles||(n.subtitles=i.length&&i[0].track,!r.nativesubtitles||"html5"!=r.engine)){i.remove();var a=/^(([0-9]{2}:)?[0-9]{2}:[0-9]{2}[,.]{1}[0-9]{3}) --\> (([0-9]{2}:)?[0-9]{2}:[0-9]{2}[,.]{1}[0-9]{3})(.*)/;n.subtitles=[];var s=i.attr("src");if(s){setTimeout(function(){e.get(s,function(t){for(var i,r,s,l,c=0,d=t.split("\n"),u=d.length,f={};u>c;c++)if(r=a.exec(d[c])){for(i=d[c-1],s="<p>"+d[++c]+"</p><br/>";e.trim(d[++c])&&c<d.length;)s+="<p>"+d[c]+"</p><br/>";f={title:i,startTime:o(r[1]),endTime:o(r[2]||r[3]),text:s},l={time:f.startTime,subtitle:f},n.subtitles.push(f),n.cuepoints.push(l),n.cuepoints.push({time:f.endTime,subtitleEnd:i}),0===f.startTime&&n.trigger("cuepoint",l)}}).fail(function(){return n.trigger("error",{code:8,url:s}),!1})});var l,c=e("<div class='fp-subtitle'/>").appendTo(t);n.bind("cuepoint",function(e,n,t){t.subtitle?(l=t.index,c.html(t.subtitle.text).addClass("fp-active")):t.subtitleEnd&&(c.removeClass("fp-active"),l=t.index)}).bind("seek",function(t,o,i){l&&n.cuepoints[l]&&n.cuepoints[l].time>i&&(c.removeClass("fp-active"),l=null),e.each(n.cuepoints||[],function(e,t){var o=t.subtitle;o&&l!=t.index?i>=t.time&&(!o.endTime||i<=o.endTime)&&n.trigger("cuepoint",t):t.subtitleEnd&&i>=t.time&&t.index==l+1&&n.trigger("cuepoint",t)})})}}}),flowplayer(function(n,t){function o(){if(r&&"undefined"!=typeof _gat){var e=_gat._getTracker(i),o=n.video;e._setAllowLinker(!0),e._trackEvent("Video / Seconds played",n.engine+"/"+o.type,t.attr("title")||o.src.split("/").slice(-1)[0].replace(w,""),Math.round(r/1e3)),r=0}}var i=n.conf.analytics,r=0,a=0;i&&("undefined"==typeof _gat&&e.getScript("//google-analytics.com/ga.js"),n.bind("load unload",o).bind("progress",function(){n.seeking||(r+=a?+new Date-a:0,a=+new Date)}).bind("pause",function(){a=0}),e(window).unload(o))});var P=/IEMobile/.test(f);(flowplayer.support.touch||P)&&flowplayer(function(n,t){var o=/Android/.test(f)&&!/Firefox/.test(f)&&!/Opera/.test(f),i=/Silk/.test(f),r=o?parseFloat(/Android\ (\d\.\d)/.exec(f)[1],10):0;
if(o&&(n.conf.videoTypePreference="mp4",!/Chrome/.test(f)&&4>r)){var a=n.load;n.load=function(){var e=a.apply(n,arguments);return n.trigger("ready",[n,n.video]),e}}flowplayer.support.volume||t.addClass("no-volume no-mute"),t.addClass("is-touch"),t.find(".fp-timeline").data("api").disableAnimation();var s=!1;t.bind("touchmove",function(){s=!0}).bind("touchend click",function(){return s?(s=!1,void 0):n.playing&&!t.hasClass("is-mouseover")?(t.addClass("is-mouseover").removeClass("is-mouseout"),!1):(n.paused&&t.hasClass("is-mouseout")&&!n.splash&&n.toggle(),n.paused&&P&&e("video.fp-engine",t)[0].play(),void 0)}),n.conf.native_fullscreen&&"function"==typeof e("<video />")[0].webkitEnterFullScreen&&(n.fullscreen=function(){var n=e("video.fp-engine",t);n[0].webkitEnterFullScreen(),n.one("webkitendfullscreen",function(){n.prop("controls",!0).prop("controls",!1)})}),(o||i)&&n.bind("ready",function(){var o=e("video.fp-engine",t);o.one("canplay",function(){o[0].play()}),o[0].play(),n.bind("progress.dur",function(){var i=o[0].duration;1!==i&&(n.video.duration=i,e(".fp-duration",t).html(c(i)),n.unbind("progress.dur"))})})}),flowplayer(function(n,t){if(n.conf.embed!==!1){var o=n.conf,i=e(".fp-ui",t),r=e("<a/>",{"class":"fp-embed",title:"Copy to your site"}).appendTo(i),a=e("<div/>",{"class":"fp-embed-code"}).append("<label>Paste this HTML code on your site to embed.</label><textarea/>").appendTo(i),s=e("textarea",a);n.embedCode=function(){var i=n.video,r=i.width||t.width(),a=i.height||t.height(),s=e("<div/>",{"class":"flowplayer",css:{width:r,height:a}}),l=e("<video/>").appendTo(s);e.each(["origin","analytics","key","rtmp"],function(e,n){o[n]&&s.attr("data-"+n,o[n])}),o.logo&&s.attr("data-logo",e("<img />").attr("src",o.logo)[0].src),e.each(i.sources,function(n,t){var i=t.src;(!/^https?:/.test(t.src)&&"flash"!==t.type||!o.rtmp)&&(i=e("<img/>").attr("src",t.src)[0].src),l.append(e("<source/>",{type:"video/"+t.type,src:i}))});var c={src:"//embed.flowplayer.org/5.4.6/embed.min.js"};e.isPlainObject(o.embed)&&(c["data-swf"]=o.embed.swf,c["data-library"]=o.embed.library,c.src=o.embed.script||c.src,o.embed.skin&&(c["data-skin"]=o.embed.skin));var d=e("<foo/>",c).append(s);return e("<p/>").append(d).html().replace(/<(\/?)foo/g,"<$1script")},t.fptip(".fp-embed","is-embedding"),s.click(function(){this.select()}),r.click(function(){s.text(n.embedCode()),s[0].focus(),s[0].select()})}}),e.fn.fptip=function(n,t){return this.each(function(){function o(){i.removeClass(t),e(document).unbind(".st")}var i=e(this);e(n||"a",this).click(function(n){n.preventDefault(),i.toggleClass(t),i.hasClass(t)&&e(document).bind("keydown.st",function(e){27==e.which&&o()}).bind("click.st",function(n){e(n.target).parents("."+t).length||o()})})})}}(jQuery),flowplayer(function(e,n){function t(e){var n=r("<a/>")[0];return n.href=e,n.hostname}function o(e){var n="ab.ca,ac.ac,ac.at,ac.be,ac.cn,ac.il,ac.in,ac.jp,ac.kr,ac.th,ac.uk,adm.br,adv.br,ah.cn,am.br,arq.br,art.br,arts.ro,asn.au,asso.fr,asso.mc,bc.ca,bio.br,biz.pl,biz.tr,bj.cn,br.com,cn.com,cng.br,cnt.br,co.ac,co.at,co.gl,co.id,co.il,co.in,co.jp,co.kr,com.ag,com.ai,com.ar,com.au,com.br,com.cn,com.cy,com.de,com.do,com.ec,com.es,com.fj,com.fr,co.mg,com.gl,com.gt,com.hk,com.hr,com.hu,com.kg,com.ki,com.lc,com.mg,com.mm,com.ms,com.mt,com.mu,com.mx,com.my,com.nf,com.ng,com.ni,com.pa,com.ph,com.pl,com.pt,com.qa,com.ro,com.ru,co.ms,com.sb,com.sc,com.sg,com.sv,com.tr,com.tw,com.ua,com.uy,com.ve,com.vn,co.nz,co.th,co.uk,co.ve,co.vi,co.za,cq.cn,de.com,de.org,ecn.br,edu.au,edu.cn,edu.hk,edu.mm,edu.my,edu.pt,edu.qa,edu.tr,eng.br,ernet.in,esp.br,etc.br,eti.br,eu.com,eu.int,eu.lv,firm.in,firm.ro,fm.br,fot.br,fst.br,g12.br,gb.com,gb.net,gd.cn,gen.in,go.jp,go.kr,go.th,gov.au,gov.az,gov.br,gov.cn,gov.il,gov.in,gov.mm,gov.my,gov.qa,gov.sg,gov.tr,gov.tw,gs.cn,gv.ac,gv.at,gx.cn,gz.cn,he.cn,hi.cn,hk.cn,hl.cn,hu.com,id.au,idv.tw,ind.br,ind.in,inf.br,info.pl,info.ro,info.tr,info.ve,in.ua,iwi.nz,jl.cn,jor.br,js.cn,k12.il,k12.tr,kr.com,lel.br,ln.cn,ltd.uk,maori.nz,mb.ca,med.br,me.uk,mil.br,mi.th,mo.cn,muni.il,nb.ca,ne.jp,ne.kr,net.ag,net.ai,net.au,net.br,net.cn,net.do,net.gl,net.hk,net.il,net.in,net.kg,net.ki,net.lc,net.mg,net.mm,net.mu,net.ni,net.nz,net.pl,net.ru,net.sb,net.sc,net.sg,net.th,net.tr,net.tw,net.uk,net.ve,nf.ca,nm.cn,nm.kr,no.com,nom.br,nom.ni,nom.ro,ns.ca,nt.ca,ntr.br,nt.ro,nx.cn,odo.br,off.ai,on.ca,or.ac,or.at,org.ag,org.ai,org.au,org.br,org.cn,org.do,org.es,org.gl,org.hk,org.in,org.kg,org.ki,org.lc,org.mg,org.mm,org.ms,org.nf,org.ni,org.nz,org.pl,org.ro,org.ru,org.sb,org.sc,org.sg,org.tr,org.tw,org.uk,org.ve,or.jp,or.kr,or.th,pe.ca,plc.uk,ppg.br,presse.fr,pro.br,psc.br,psi.br,qc.ca,qc.com,qh.cn,rec.br,rec.ro,res.in,sa.com,sc.cn,sch.ul,se.com,se.net,sh.cn,sk.ca,slg.br,sn.cn,store.ro,tj.cn,tm.fr,tm.mc,tmp.br,tm.ro,tur.br,tv.br,tv.tr,tw.cn,uk.com,uk.net,us.com,uy.com,vet.br,waw.pl,web.ve,www.ro,xj.cn,xz.cn,yk.ca,yn.cn,zj.cn,zlg.br".split(",");e=e.toLowerCase();var t=e.split("."),o=t.length;if(2>o)return e;var i=t.slice(-2).join(".");return o>=3&&r.inArray(i,n)>=0?t.slice(-3).join("."):i}function i(e,n){"localhost"==n||parseInt(n.split(".").slice(-1))||(n=o(n));for(var t=0,i=n.length-1;i>=0;i--)t+=2983723987*n.charCodeAt(i);for(t=(""+t).substring(0,7),i=0;i<e.length;i++)if(t===e[i].substring(1,8))return 1}var r=jQuery,a=e.conf,s=a.swf.indexOf("flowplayer.org")&&a.e&&n.data("origin"),l=s?t(s):location.hostname,c=a.key;if("file:"==location.protocol&&(l="localhost"),e.load.ed=1,a.hostname=l,a.origin=s||location.href,s&&n.addClass("is-embedded"),"string"==typeof c&&(c=c.split(/,\s*/)),c&&"function"==typeof i&&i(c,l))a.logo&&n.append(r("<a>",{"class":"fp-logo",href:s}).append(r("<img/>",{src:a.logo})));else{var d=r("<a/>").attr("href","http://flowplayer.org").appendTo(n);r(".fp-controls",n);var u=r('<div class="fp-context-menu"><ul><li class="copyright">&copy; 2013</li><li><a href="http://flowplayer.org">About Flowplayer</a></li><li><a href="http://flowplayer.org/license">GPL based license</a></li></ul></div>').appendTo(n);e.bind("pause resume finish unload",function(e,t){var o=-1;t.video.src&&r.each([["org","flowplayer","drive"],["org","flowplayer","my"]],function(e,n){return o=t.video.src.indexOf("://"+n.reverse().join(".")),-1===o}),/pause|resume/.test(e.type)&&"flash"!=t.engine&&4!=o&&5!=o?(d.show().css({position:"absolute",left:16,bottom:36,zIndex:99999,width:100,height:20,backgroundImage:"url("+[".png","logo","/",".net",".cloudfront","d32wqyuo10o653","//"].reverse().join("")+")"}),t.load.ed=d.is(":visible")&&r.contains(n[0],u[0]),t.load.ed||t.pause()):d.hide()})}});;
function formatTimes(secs) {
  if (null !== secs) {
    var sec_num = parseInt(secs, 10),
      hours = Math.floor(sec_num / 3600),
      minutes = Math.floor((sec_num - 3600 * hours) / 60),
      seconds = sec_num - 3600 * hours - 60 * minutes;
    10 > hours && (hours = "0" + hours), 10 > minutes && (minutes = "0" + minutes), 10 > seconds && (seconds = "0" + seconds);
    var time = hours + ":" + minutes + ":" + seconds;
    return time
  }
  return ""
}
flowplayer.conf = {
    native_fullscreen: !0
  },
  function($) {
    Drupal.behaviors.imageZoom = {}, Drupal.behaviors.imageZoom.attach = function() {
      var imageZoomer = function() {
          var scale = 1,
            tmpOffsetX = 0,
            tmpOffsetY = 0,
            saveOffsetX = 0,
            saveOffsetY = 0,
            init = function() {
              registerHandlers()
            };
          $(".imageZoomer").hammer().on("drag", ".img-zoom", function(event) {
            event.gesture.preventDefault(), tmpOffsetX = saveOffsetX + event.gesture.deltaX, tmpOffsetY = saveOffsetY + event.gesture.deltaY, tmpOffsetX /= scale, tmpOffsetY /= scale, $(".img-zoom").css({
              "-webkit-transform": "scale(" + scale + ") translate3d(" + tmpOffsetX + "px, " + tmpOffsetY + "px, 0)"
            })
          }).on("release", ".img-zoom", function(event) {
            event.gesture.preventDefault(), saveOffsetX = tmpOffsetX, saveOffsetY = tmpOffsetY
          });
          var registerHandlers = function() {
              $(".imageZoom_toggle").click(showOverlay), $(".btn-zoom").click(function() {
                switch ($(this).attr("data-zoom")) {
                  case "plus":
                    zoomIn();
                    break;
                  case "minus":
                    zoomOut()
                }
              })
            },
            showOverlay = function(e) {
              e.preventDefault(), $(".imageZoomer").show()
            },
            zoomIn = function() {
              scale += .15, $(".img-zoom").css({
                "-webkit-transform": "scale(" + scale + ") translate3d(" + tmpOffsetX + "px, " + tmpOffsetY + "px, 0)"
              })
            },
            zoomOut = function() {
              scale > .3 && (scale -= .15), $(".img-zoom").css({
                "-webkit-transform": "scale(" + scale + ") translate3d(" + tmpOffsetX + "px, " + tmpOffsetY + "px, 0)"
              })
            };
          return {
            init: init
          }
        },
        zoomer = new imageZoomer;
      zoomer.init()
    }
  }(jQuery),
  function($) {
    Drupal.behaviors.playlist = {}, Drupal.behaviors.playlist.attach = function() {
      $(".button-playlist").each(function() {
        var overlay = $(".playlist-overlay"),
          container = overlay.find(".padder"),
          wrapper = $(".playlist-wrapper");
        $(".button-playlist").click(function(e) {
          e.preventDefault();
          var assets = wrapper.find(".asset-wrapper");
          overlay.fadeIn("fast"), container.append(assets.first().html()), container.find(".flowplayer").append('<div class="fp-playlist"></div>'), $.each(assets, function() {
            var asset = $(this),
              image = asset.find(".flowplayer").css("backgroundImage");
            if ("undefined" != typeof image && "" != image) {
              var regExp = /\(([^)]+)\)/,
                matches = regExp.exec(image);
              image = matches[1], $(".fp-playlist").append('<a href="' + asset.find(".flowplayer video").attr("src") + '"><img src="' + image + '"/></a>')
            }
          }), container.find(".flowplayer").flowplayer()
        })
      })
    }
  }(jQuery),
  function($) {
    Drupal.behaviors.profile = {}, Drupal.behaviors.profile.attach = function() {
      $(".btn-edit-profile").click(function(e) {
        e.preventDefault(), $(".profile-info-data").hide(), $(".profile-info-picture").hide(), $(".profile-info-name").hide(), $(".profile-edit-form").show(), $(".profile-actions").hide(), $(".btn-show-profile").text("Toon meer")
      }), $(".profile-edit-form-close").click(function(e) {
        e.preventDefault(), $(".profile-info-picture").show(), $(".profile-info-name").show(), $(".profile-edit-form").hide(), $(".profile-actions").show()
      }), $(".btn-show-profile").toggle(function(e) {
        e.preventDefault(), $(".profile-edit-form").hide(), $(".profile-info-data").show(), $(this).text("Toon minder")
      }, function(e) {
        e.preventDefault(), $(".profile-info-data").hide(), $(this).text("Toon meer")
      }), $(".btn-click-upload").click(function(e) {
        e.preventDefault(), $(this).hide(), $("#edit-picture-upload").show().click()
      }), $(".profile-edit-cancel").click(function(e) {
        e.preventDefault(), $(".profile-edit-form").hide(), $(".profile-actions").show(), $(".profile-info-name").show(), $(".profile-info-picture").show()
      }), $('input[name="field_scholen"]').each(function() {
        $(".profile-edit-form div:last").after('<div class="add_school_form"><label>Scholen</label><div id="user-current-schools"><ul></ul><a class="button btn-bg-orange btn-txt-white triangle-right" id="add_school" href="#">School toevoegen</a><div class="add_school_toggle"><div id="select_gemeente"></div><div id="select_school"></div></div></div></div>');
        var schools = [],
          scholen_object = $(this);
        schools = "" == scholen_object.val() || void 0 == typeof scholen_object.val() ? [] : JSON.parse(scholen_object.val());
        var addedField = !1;
        $.each(schools, function(index, value) {
          addedField || $(".entity-profile2 .content").append('<div class="field field-type-text field-scholen-labels"><label>Scholen</label></div>'), addedField = !0, $("#user-current-schools ul").append('<li data-id="' + index + '">' + value.text + '<i class="remove"></i></li>'), $(".entity-profile2 .content .field-scholen-labels").append('<div class="field-item">' + value.text + "</div>")
        }), $("#select_gemeente").select2({
          placeholder: "Gemeente",
          data: Drupal.settings.onderwijsinstellingen_postcodes
        }).on("change", function(e) {
          $("#select_school").select2({
            data: Drupal.settings.onderwijsinstellingen_scholen[e.val]
          }).select2("open")
        }), $("#select_school").select2({
          minimumResultsForSearch: 8,
          placeholder: "School",
          data: []
        }).on("change", function(e) {
          schools[e.val.toString()] = {
            text: e.added.text
          }, $("#user-current-schools ul").append('<li data-id="' + e.val + '">' + e.added.text + '<i class="remove"></i></li>'), scholen_object.val(JSON.stringify(schools)), scholen_object.change(), $("#add_school").toggle(), $(".add_school_toggle").toggle()
        }), $("#add_school").click(function(e) {
          e.preventDefault(), $(this).toggle(), $(".add_school_toggle").toggle()
        }), $("#user-current-schools ul").on("click", "i.remove", function(e) {
          e.preventDefault(), $(this).closest("li"), delete schools[$(this).closest("li").attr("data-id")], scholen_object.val(JSON.stringify(schools)), scholen_object.change(), $(this).closest("li").remove()
        })
      }), $('textarea[name="profile_registratie[field_registratie_scholen][und][0][value]"]').each(function() {
        $("#edit-profile-registratie-field-registratie-scholen").after('<div class="add_school_form"><label>Scholen</label><div id="user-current-schools"><ul></ul><a class="button btn-bg-orange btn-txt-white triangle-right" id="add_school" href="#">School toevoegen</a><div class="add_school_toggle"><div id="select_gemeente"></div><div id="select_school"></div></div></div></div>');
        var schools = [],
          scholen_object = $('textarea[name="profile_registratie[field_registratie_scholen][und][0][value]"]');
        schools = "" == scholen_object.val() || void 0 == typeof scholen_object.val() ? [] : JSON.parse(scholen_object.val());
        var addedField = !1;
        $.each(schools, function(index, value) {
          addedField || $(".entity-profile2 .content").append('<div class="field field-type-text field-scholen-labels"><label>Scholen</label></div>'), addedField = !0, null != value && ($("#user-current-schools ul").append('<li data-id="' + index + '">' + value.text + '<i class="remove"></i></li>'), $(".entity-profile2 .content .field-scholen-labels").append('<div class="field-item">' + value.text + "</div>"))
        }), $("#select_gemeente").select2({
          minimumResultsForSearch: 8,
          placeholder: "Gemeente",
          data: Drupal.settings.onderwijsinstellingen_postcodes
        }).on("change", function(e) {
          $("#select_school").select2({
            data: Drupal.settings.onderwijsinstellingen_scholen[e.val]
          }).select2("open")
        }), $("#select_school").select2({
          placeholder: "School",
          data: []
        }).on("change", function(e) {
          schools[e.val.toString()] = {
            text: e.added.text
          }, $("#user-current-schools ul").append('<li data-id="' + e.val + '">' + e.added.text + '<i class="remove"></i></li>'), scholen_object.val(JSON.stringify(schools)), scholen_object.change(), $("#add_school").toggle(), $(".add_school_toggle").toggle()
        }), $("#add_school").click(function(e) {
          e.preventDefault(), $(this).toggle(), $(".add_school_toggle").toggle()
        }), $("#user-current-schools ul").on("click", "i.remove", function(e) {
          e.preventDefault(), $(this).closest("li"), delete schools[$(this).closest("li").attr("data-id")], scholen_object.val(JSON.stringify(schools)), scholen_object.change(), $(this).closest("li").remove()
        })
      })
    }
  }(jQuery),
  function($) {
    Drupal.behaviors.filters = {}, Drupal.behaviors.filters.attach = function() {
      $(".btn-toggle-filters").click(function(e) {
        e.preventDefault(), $("#mediamosa-search-form-filters").hasClass("visible") ? ($(".asset-grid-wrapper").removeClass("filtered"), $("#mediamosa-search-form-filters").removeClass("visible"), $.ajax({
          type: "GET",
          url: "/search_filter_preference/closed",
          dataType: "json"
        }).done(function() {})) : ($(".asset-grid-wrapper").addClass("filtered"), $("#mediamosa-search-form-filters").addClass("visible"), $.ajax({
          type: "GET",
          url: "/search_filter_preference/open",
          dataType: "json"
        }).done(function() {}))
      });
      var facets = [{
        selector: "edit-subject",
        show_more: Drupal.t("Show more"),
        show_less: Drupal.t("Show less")
      }, {
        selector: "edit-classificatie",
        show_more: Drupal.t("Show more"),
        show_less: Drupal.t("Show less")
      }, {
        selector: "edit-type",
        show_more: Drupal.t("Show more"),
        show_less: Drupal.t("Show less")
      }, {
        selector: "edit-serie",
        show_more: Drupal.t("Show more"),
        show_less: Drupal.t("Show less")
      }];
      for (var i in facets) $("#" + facets[i].selector).each(function() {
        var count = $(this).find("div").length,
          self = $(this);
        count > 15 && (self.find("div:gt(15)").hide(), $(this).closest("div.fieldset-wrapper").append('<div class="facets-show-more ' + facets[i].selector + " " + i + '">' + facets[i].show_more + "</div>"), $(".facets-show-more." + facets[i].selector).toggle(function(e) {
          e.preventDefault(), self.find("div").show();
          var classes = $(this).attr("class").split(/\s/);
          $(this).text(facets[parseInt(classes[classes.length - 1])].show_less)
        }, function(e) {
          e.preventDefault(), self.find("div:gt(15)").hide();
          var classes = $(this).attr("class").split(/\s/);
          $(this).text(facets[parseInt(classes[classes.length - 1])].show_more)
        }))
      })
    }, Drupal.behaviors.sorting = {}, Drupal.behaviors.sorting.attach = function() {
      $("#sort").select2({
        minimumResultsForSearch: Infinity,
        theme: 'archief'
      })
    }
  }(jQuery),
  function($) {
    $.fn.assetSlider = function() {
      return this.each(function() {
        function handleHammer(ev) {
          switch (ev.type) {
            case "dragright":
              ev.gesture.preventDefault(), container.offset = container.finalOffset + 1.3 * ev.gesture.deltaX, container.offset >= 0 && (container.offset = 0), container.find(".sled:visible .sled-rail").css({
                "-webkit-transform": "translate3d(" + container.offset + "px,0,0)",
                "-moz-transform": "translate3d(" + container.offset + "px,0,0)",
                "-ms-transform": "translateX(" + container.offset + "px)",
                transform: "translate3d(" + container.offset + "px,0,0)"
              });
              break;
            case "dragleft":
              ev.gesture.preventDefault(), container.offset = container.finalOffset + 1.5 * ev.gesture.deltaX, container.find(".sled:visible .sled-rail").css({
                "-webkit-transform": "translate3d(" + container.offset + "px,0,0)",
                "-moz-transform": "translate3d(" + container.offset + "px,0,0)",
                "-ms-transform": "translateX(" + container.offset + "px)",
                transform: "translate3d(" + container.offset + "px,0,0)"
              });
              break;
            case "release":
              container.finalOffset = container.offset, container.enabled = !1;
              var activeItem = Math.abs(Math.round(container.finalOffset / itemWidth));
              activeItem > container.find(".sled:visible .slider-item").length - 1 ? (container.find(".sled:visible").attr("data-active", container.find(".sled:visible .slider-item").length - 1), container.finalOffset = itemWidth * (container.find(".sled:visible .slider-item").length - 1) * -1, container.find(".sled:visible .sled-rail").css({
                "-webkit-transform": "translate3d(" + container.finalOffset + "px,0,0)",
                "-moz-transform": "translate3d(" + container.finalOffset + "px,0,0)",
                "-ms-transform": "translateX(" + container.finalOffset + "px)",
                transform: "translate3d(" + container.finalOffset + "px,0,0)"
              })) : container.find(".sled:visible").attr("data-active", activeItem)
          }
        }
        var container = $(this);
        container.offset = 0, container.finalOffset = 0;
        var itemWidth = parseInt(container.find(".slider-item").width()) + parseInt(container.find(".slider-item").css("marginRight")) + parseInt(container.find(".slider-item").css("marginLeft"));
        container.hasClass("block-themas") && (itemWidth += 25);
        var hammerTime = ("ontouchstart" in document.documentElement, $(this).find(".sled").hammer({
          drag_lock_to_axis: !0,
          stop_browser_behavior: !1
        }));
        hammerTime.on("dragright dragleft release touch", handleHammer);
        var init = function() {
            container.find(".sled-rail").css({
              width: itemWidth * container.find(".slider-item").length
            }), container.find(".slider_arrow.left").click(function(e) {
              e.preventDefault(), slideLeft()
            }), container.find(".slider_arrow.right").click(function(e) {
              e.preventDefault(), slideRight()
            }), $(".frontpage-block-tabs a").click(function(e) {
              e.preventDefault(), $(this).closest(".frontpage-block").find(".sled").hide(), $(this).addClass("active").siblings().removeClass("active"), $($(this).attr("href")).show()
            })
          },
          slideRight = function() {
            var current = parseInt(container.find(".sled:visible").attr("data-active"));
            current < container.find(".sled:visible .slider-item").length - 1 && (container.find(".sled:visible").attr("data-active", current + 1), container.finalOffset = itemWidth * (current + 1) * -1, container.find(".sled:visible .sled-rail").css({
              "-webkit-transform": "translate3d(" + container.finalOffset + "px,0,0)",
              "-moz-transform": "translate3d(" + container.finalOffset + "px,0,0)",
              "-ms-transform": "translateX(" + container.finalOffset + "px)",
              transform: "translate3d(" + container.finalOffset + "px,0,0)"
            }))
          },
          slideLeft = function() {
            var current = parseInt(container.find(".sled:visible").attr("data-active"));
            current > 0 && (container.find(".sled:visible").attr("data-active", current - 1), container.finalOffset = itemWidth * (current - 1) * -1, container.find(".sled:visible .sled-rail").css({
              "-webkit-transform": "translate3d(" + container.finalOffset + "px,0,0)",
              "-moz-transform": "translate3d(" + container.finalOffset + "px,0,0)",
              "-ms-transform": "translateX(" + container.finalOffset + "px)",
              transform: "translate3d(" + container.finalOffset + "px,0,0)"
            }))
          };
        init()
      })
    }
  }(jQuery),
  function($) {
    Drupal.behaviors.assetTabs = {}, Drupal.behaviors.assetTabs.attach = function() {
      var tabs = $(".tabs a[href]");
      tabs.live("click", function(e) {
        e.preventDefault(), $(".tabs a").removeClass("active"), $(this).addClass("active"), $(".tab").hide(), $($(this).attr("href")).show()
      });
      var hash = window.location.hash;
      "#comment" == hash ? $(".tabs .last").click() : $(".tabs .first").click()
    }
  }(jQuery),
  function($) {
    Drupal.behaviors.offCanvas = {}, Drupal.behaviors.offCanvas.attach = function() {
      var offCanvas = function() {
        var elements = {
          toggleButton: $(".toggle-nav"),
          navigation: $(".off-canvas"),
          container: $('.wrapper, header[role="banner"]')
        };
        elements.container.open = !1, elements.container.closed = !0;
        var init = function() {
            registerHandlers(), handleResize(), handleTouch()
          },
          registerHandlers = function() {
            elements.toggleButton.click(function(e) {
              e.preventDefault(), toggle()
            })
          },
          handleTouch = function() {
            function hammerHandler(ev) {
              switch (ev.stopPropagation(), ev.type) {
                case "dragleft":
                  elements.container.open && (ev.gesture.deltaX > -140 ? elements.container.slideTo(240 + ev.gesture.deltaX) : (elements.container.closed = !0, elements.container.open = !1, $(".toggle-nav").addClass("open"), elements.container.slideTo(0)));
                  break;
                case "dragright":
                  elements.container.closed && (ev.gesture.deltaX >= 140 ? elements.container.open || (elements.container.slideTo(240), elements.container.open = !0, elements.container.closed = !1, $(".toggle-nav").addClass("open")) : elements.container.open || elements.container.slideTo(ev.gesture.deltaX));
                  break;
                case "release":
                  elements.container.open ? (elements.container.slideTo(240), $(".toggle-nav").addClass("open")) : (elements.container.slideTo(0), $(".toggle-nav").removeClass("open"), $("body > .wrapper").removeAttr("style"))
              }
            }
            var hammerTime = $('header[role="banner"], .off-canvas').hammer({
              stop_browser_behavior: !1
            });
            elements.container.offset = 0, elements.container.oldie = $("html").hasClass("oldie"), elements.container.oldie && (elements.container.css({
              position: "relative"
            }), $(".off-canvas").css("left", 0)), elements.container.slideTo = function(x) {
              elements.container.css(elements.container.oldie ? {
                marginLeft: x + "px"
              } : {
                "-webkit-transform": "translate3d(" + x + "px,0,0)",
                "-moz-transform": "translate3d(" + x + "px,0,0)",
                "-ms-transform": "translateX(" + x + "px)",
                transform: "translate3d(" + x + "px,0,0)"
              })
            }, hammerTime.on("dragleft dragright release", hammerHandler)
          },
          toggle = function() {
            elements.container.open ? (elements.container.slideTo(0), elements.container.open = !1, elements.container.closed = !0, $("body > .wrapper").removeAttr("style"), $(".toggle-nav").removeClass("open")) : (elements.container.slideTo(240), elements.container.open = !0, elements.container.closed = !1, $(".toggle-nav").addClass("open"))
          },
          handleResize = function() {
            $(window).resize(function() {
              $('header[role="banner"], body > .wrapper').css(elements.navigation.hasClass("active") ? elements.container.width() <= 480 ? {
                width: "480"
              } : {
                width: "100%"
              } : {
                width: "100%"
              })
            })
          };
        return {
          init: init,
          toggle: toggle
        }
      };
      if ($(".off-canvas").length > 0) {
        var offcanvas = new offCanvas;
        offcanvas.init()
      } else $(".siteinfo h1").addClass("padded")
    }, Drupal.behaviors.header = {}, Drupal.behaviors.header.attach = function() {
      Modernizr.overflowscrolling ? $(".frontpage_block").on("touchstart", function() {}) : $(".frontpage-block").assetSlider();
      var Header = function() {
          var init = function() {
              registerHandlers(), $(".search_form .form-actions").hide(), $(".search_form .container-inline").append("<button>Submit</button>"), $(".search_form .container-inline button").click(function() {
                $(this).closest("form").submit()
              })
            },
            registerHandlers = function() {};
          return {
            init: init
          }
        },
        header = new Header;
      header.init(), $(".tab.comments, .tab#tab_leerobject").each(function() {
        var viewportHeight = $(window).height();
        $(this).css({
          minHeight: viewportHeight - 110
        })
      }), $(window).scroll(function() {
        $(".off-canvas").css({
          "padding-top": $(window).scrollTop() + "px"
        })
      })
    }, Drupal.behaviors.placeholders = {}, Drupal.behaviors.placeholders.attach = function() {
      $(".footer-newsletter, .frontpage-block.block-newsletter").each(function() {
        var form = $(this).find("form");
        if (!$("html").hasClass("oldie")) {
          var labels = form.find("label");
          labels.each(function() {
            var value = $(this).text();
            $("#" + $(this).attr("for")).attr("placeholder", value), $(this).hide()
          })
        }
      })
    }, Drupal.behaviors.license = {}, Drupal.behaviors.license.attach = function() {
      $(".flowplayer").each(function() {
        flowplayer($(this), "/sites/all/themes/testbeeld/js/flowplayer.swf", {
          key: "#$7162d2d730cf607ac6d"
        })
      })
    }
  }(jQuery), jQuery(document).ready(function($) {
    jQuery.noConflict(), $("#user-register-form .field-name-field-registratie-rol select").select2({
      placeholder: "-Maak een keuze-",
      minimumResultsForSearch: 8
    }), $("#user-register-form small").hide().before('<a href="#" class="toggle-info">i</a>'), $(".toggle-info").click(function() {
      $(this).next("small").slideToggle("fast")
    })
  }), jQuery(document).ready(function($) {
    jQuery.noConflict(), $(".collection").click(function(e) {
      e.preventDefault();
      var status = $(this).hasClass("checked"),
        action = "set";
      status ? ($(this).removeClass("checked"), action = "remove") : $(this).addClass("checked"), $.ajax({
        type: "GET",
        url: "/coll/" + action + "/" + $(this).attr("data-id") + "/" + $(this).attr("data-type") + "/" + encodeURIComponent($(this).attr("data-title")),
        dataType: "json"
      }).done(function() {})
    }), $(".clone-collection").click(function() {
      var nid = $(this).attr("data-id");
      $.ajax({
        type: "POST",
        url: "/copy/collection",
        dataType: "json",
        data: {
          nid: nid
        }
      }).done(function(data) {
        window.location.href = "/" + data.path
      })
    }), $(".grid-view").click(function() {
      if ($(this).hasClass("active-grid")) {
        var children = $(".asset-grid .asset-teaser");
        children.removeClass("slider-item").addClass("list"), children.each(function() {
          var still = $(this).find("img"),
            src = still.attr("src").replace(",teaser", ",square");
          src = src.replace("/search", "/square"), still.attr("src", src)
        }), $(this).removeClass("active-grid"), $(this).addClass("active-list"), $.ajax({
          type: "GET",
          url: "/user_preference/list",
          dataType: "json"
        }).done(function() {})
      } else {
        var children = $(".asset-grid .asset-teaser");
        children.removeClass("list").addClass("slider-item"), children.each(function() {
          var still = $(this).find("img"),
            src = still.attr("src").replace(",square", ",teaser");
          src = src.replace("/square", "/search"), still.attr("src", src)
        }), $(this).removeClass("active-list"), $(this).addClass("active-grid"), $.ajax({
          type: "GET",
          url: "/user_preference/grid",
          dataType: "json"
        }).done(function() {})
      }
    }), $(".header-help-button").click(function() {
      $(".testbeeld-welcome-block").slideToggle("fast")
    }), $(".header-help-button-front").click(function() {
      $.ajax({
        type: "GET",
        url: "/help_preference",
        dataType: "json"
      }).done(function() {})
    })
  });
;
/* Tooltipster v3.0.4 */;(function(e,t,n){function o(t,n){this.bodyOverflowX;this.checkInterval=null;this.content;this.$el=e(t);this.elProxyPosition;this.$elProxy;this.enabled=true;this.options=e.extend({},s,n);this.mouseIsOverProxy=false;this.namespace="tooltipster-"+Math.round(Math.random()*1e5);this.status="hidden";this.timerHide=null;this.timerShow=null;this.$tooltip;this.tooltipArrowReposition;this.options.iconTheme=this.options.iconTheme.replace(".","");this.options.theme=this.options.theme.replace(".","");this.init()}function u(t,n){var r=true;e.each(t,function(e,i){if(typeof n[e]==="undefined"||t[e]!==n[e]){r=false;return false}});return r}function l(){return!f&&a}function c(){var e=n.body||n.documentElement,t=e.style,r="transition";if(typeof t[r]=="string"){return true}v=["Moz","Webkit","Khtml","O","ms"],r=r.charAt(0).toUpperCase()+r.substr(1);for(var i=0;i<v.length;i++){if(typeof t[v[i]+r]=="string"){return true}}return false}var r="tooltipster",s={animation:"fade",arrow:true,arrowColor:"",autoClose:true,content:null,contentAsHTML:false,contentCloning:true,delay:200,fixedWidth:0,maxWidth:0,functionInit:function(e,t){},functionBefore:function(e,t){t()},functionReady:function(e,t){},functionAfter:function(e){},icon:"(?)",iconCloning:true,iconDesktop:false,iconTouch:false,iconTheme:"tooltipster-icon",interactive:false,interactiveTolerance:350,offsetX:0,offsetY:0,onlyOne:false,position:"top",positionTracker:false,speed:350,timer:0,theme:"tooltipster-default",touchDevices:true,trigger:"hover",updateAnimation:true};o.prototype={init:function(){var t=this;if(n.querySelector){if(t.options.content!==null){t.setContent(t.options.content)}else{var r=t.$el.attr("title");if(typeof r==="undefined")r=null;t.setContent(r)}var i=t.options.functionInit(t.$el,t.content);if(typeof i!=="undefined")t.setContent(i);t.$el.removeAttr("title").addClass("tooltipstered");if(!a&&t.options.iconDesktop||a&&t.options.iconTouch){if(typeof t.options.icon==="string"){t.$elProxy=e('<span class="'+t.options.iconTheme+'"></span>');t.$elProxy.text(t.options.icon)}else{if(t.options.iconCloning)t.$elProxy=t.options.icon.clone(true);else t.$elProxy=t.options.icon}t.$elProxy.insertAfter(t.$el)}else{t.$elProxy=t.$el}if(t.options.trigger=="hover"){t.$elProxy.on("mouseenter."+t.namespace,function(){if(!l()||t.options.touchDevices){t.mouseIsOverProxy=true;t.showTooltip()}}).on("mouseleave."+t.namespace,function(){if(!l()||t.options.touchDevices){t.mouseIsOverProxy=false}});if(a&&t.options.touchDevices){t.$elProxy.on("touchstart."+t.namespace,function(){t.showTooltipNow()})}}else if(t.options.trigger=="click"){t.$elProxy.on("click."+t.namespace,function(){if(!l()||t.options.touchDevices){t.showTooltip()}})}}},showTooltip:function(){var e=this;if(e.status!="shown"&&e.status!="appearing"){if(e.options.delay){e.timerShow=setTimeout(function(){if(e.options.trigger=="click"||e.options.trigger=="hover"&&e.mouseIsOverProxy){e.showTooltipNow()}},e.options.delay)}else e.showTooltipNow()}},showTooltipNow:function(){var n=this;clearTimeout(n.timerShow);n.timerShow=null;clearTimeout(n.timerHide);n.timerHide=null;if(n.enabled&&n.content!==null){if(n.options.onlyOne){e(".tooltipstered").not(n.$el).each(function(t,n){var i=e(n),s=i[r]("status"),o=i[r]("option","autoClose");if(s!=="hidden"&&s!=="disappearing"&&o){i[r]("hide")}})}n.options.functionBefore(n.$elProxy,function(){if(n.status!=="hidden"){var r=0;if(n.status==="disappearing"){n.status="appearing";if(c()){n.$tooltip.clearQueue().removeClass("tooltipster-dying").addClass("tooltipster-"+n.options.animation+"-show");if(n.options.speed>0)n.$tooltip.delay(n.options.speed);n.$tooltip.queue(function(){n.status="shown"})}else{n.$tooltip.stop().fadeIn(function(){n.status="shown"})}}}else{n.status="appearing";var r=n.options.speed;n.bodyOverflowX=e("body").css("overflow-x");e("body").css("overflow-x","hidden");var i="tooltipster-"+n.options.animation,s="-webkit-transition-duration: "+n.options.speed+"ms; -webkit-animation-duration: "+n.options.speed+"ms; -moz-transition-duration: "+n.options.speed+"ms; -moz-animation-duration: "+n.options.speed+"ms; -o-transition-duration: "+n.options.speed+"ms; -o-animation-duration: "+n.options.speed+"ms; -ms-transition-duration: "+n.options.speed+"ms; -ms-animation-duration: "+n.options.speed+"ms; transition-duration: "+n.options.speed+"ms; animation-duration: "+n.options.speed+"ms;",o=n.options.fixedWidth>0?"width:"+Math.round(n.options.fixedWidth)+"px;":"",u=n.options.maxWidth>0?"max-width:"+Math.round(n.options.maxWidth)+"px;":"",f=n.options.interactive?"pointer-events: auto;":"";n.$tooltip=e('<div class="tooltipster-base '+n.options.theme+'" style="'+o+" "+u+" "+f+" "+s+'"><div class="tooltipster-content"></div></div>');if(c())n.$tooltip.addClass(i);n.insertContent();n.$tooltip.appendTo("body");n.positionTooltip();n.options.functionReady(n.$el,n.$tooltip);if(c()){n.$tooltip.addClass(i+"-show");if(n.options.speed>0)n.$tooltip.delay(n.options.speed);n.$tooltip.queue(function(){n.status="shown"})}else{n.$tooltip.css("display","none").fadeIn(n.options.speed,function(){n.status="shown"})}n.setCheckInterval();e(t).on("orientationchange."+n.namespace,function(){n.hideTooltip()});e(t).on("scroll."+n.namespace+" resize."+n.namespace,function(){n.positionTooltip()});if(n.options.autoClose){e("body").off("."+n.namespace);if(n.options.trigger=="hover"){if(a){setTimeout(function(){e("body").on("touchstart."+n.namespace,function(){n.hideTooltip()})},0)}if(n.options.interactive){if(a){n.$tooltip.on("touchstart."+n.namespace,function(e){e.stopPropagation()})}var l=null;n.$elProxy.add(n.$tooltip).on("mouseleave."+n.namespace+"-autoClose",function(){clearTimeout(l);l=setTimeout(function(){n.hideTooltip()},n.options.interactiveTolerance)}).on("mouseenter."+n.namespace+"-autoClose",function(){clearTimeout(l)})}else{n.$elProxy.on("mouseleave."+n.namespace+"-autoClose",function(){n.hideTooltip()})}}else if(n.options.trigger=="click"){setTimeout(function(){e("body").on("click."+n.namespace+" touchstart."+n.namespace,function(){n.hideTooltip()})},0);if(n.options.interactive){n.$tooltip.on("click."+n.namespace+" touchstart."+n.namespace,function(e){e.stopPropagation()})}}}}if(n.options.timer>0){n.timerHide=setTimeout(function(){n.timerHide=null;n.hideTooltip()},n.options.timer+r)}})}},setCheckInterval:function(){var t=this;t.checkInterval=setInterval(function(){if(e("body").find(t.$el).length===0||e("body").find(t.$elProxy).length===0||t.status=="hidden"||e("body").find(t.$tooltip).length===0){if(t.status=="shown"||t.status=="appearing")t.hideTooltip();t.cancelCheckInterval()}else{if(t.options.positionTracker){var n=t.positionInfo(t.$elProxy),r=false;if(u(n.dimension,t.elProxyPosition.dimension)){if(t.$elProxy.css("position")==="fixed"){if(u(n.position,t.elProxyPosition.position))r=true}else{if(u(n.offset,t.elProxyPosition.offset))r=true}}if(!r){t.positionTooltip()}}}},200)},cancelCheckInterval:function(){clearInterval(this.checkInterval);this.checkInterval=null},hideTooltip:function(){var n=this;clearTimeout(n.timerShow);n.timerShow=null;clearTimeout(n.timerHide);n.timerHide=null;if(n.status=="shown"||n.status=="appearing"){n.status="disappearing";var r=function(){n.status="hidden";n.$tooltip.remove();n.$tooltip=null;e(t).off("."+n.namespace);e("body").off("."+n.namespace).css("overflow-x",n.bodyOverflowX);n.$elProxy.off("."+n.namespace+"-autoClose");n.options.functionAfter(n.$elProxy)};if(c()){n.$tooltip.clearQueue().removeClass("tooltipster-"+n.options.animation+"-show").addClass("tooltipster-dying");if(n.options.speed>0)n.$tooltip.delay(n.options.speed);n.$tooltip.queue(r)}else{n.$tooltip.stop().fadeOut(n.options.speed,r)}}},setContent:function(e){if(typeof e==="object"&&e!==null&&this.options.contentCloning){e=e.clone(true)}this.content=e},insertContent:function(){var e=this,t=this.$tooltip.find(".tooltipster-content");if(typeof e.content==="string"&&!e.options.contentAsHTML){t.text(e.content)}else{t.empty().append(e.content)}},updateTooltip:function(e){var t=this;t.setContent(e);if(t.content!==null){if(t.status!=="hidden"){t.insertContent();t.positionTooltip();if(t.options.updateAnimation){if(c()){t.$tooltip.css({width:"","-webkit-transition":"all "+t.options.speed+"ms, width 0ms, height 0ms, left 0ms, top 0ms","-moz-transition":"all "+t.options.speed+"ms, width 0ms, height 0ms, left 0ms, top 0ms","-o-transition":"all "+t.options.speed+"ms, width 0ms, height 0ms, left 0ms, top 0ms","-ms-transition":"all "+t.options.speed+"ms, width 0ms, height 0ms, left 0ms, top 0ms",transition:"all "+t.options.speed+"ms, width 0ms, height 0ms, left 0ms, top 0ms"}).addClass("tooltipster-content-changing");setTimeout(function(){if(t.status!="hidden"){t.$tooltip.removeClass("tooltipster-content-changing");setTimeout(function(){if(t.status!=="hidden"){t.$tooltip.css({"-webkit-transition":t.options.speed+"ms","-moz-transition":t.options.speed+"ms","-o-transition":t.options.speed+"ms","-ms-transition":t.options.speed+"ms",transition:t.options.speed+"ms"})}},t.options.speed)}},t.options.speed)}else{t.$tooltip.fadeTo(t.options.speed,.5,function(){if(t.status!="hidden"){t.$tooltip.fadeTo(t.options.speed,1)}})}}}}else{t.hideTooltip()}},positionInfo:function(e){return{dimension:{height:e.outerHeight(false),width:e.outerWidth(false)},offset:e.offset(),position:{left:parseInt(e.css("left")),top:parseInt(e.css("top"))}}},positionTooltip:function(){var n=this;if(e("body").find(n.$tooltip).length!==0){n.$tooltip.css("width","");n.elProxyPosition=n.positionInfo(n.$elProxy);var r=e(t).width(),s=n.elProxyPosition,o=n.$tooltip.outerWidth(false),u=n.$tooltip.innerWidth()+1,a=n.$tooltip.outerHeight(false),f=null;if(n.$elProxy.is("area")){var l=n.$elProxy.attr("shape"),c=n.$elProxy.parent().attr("name"),h=e('img[usemap="#'+c+'"]'),p=h.offset().left,d=h.offset().top,v=n.$elProxy.attr("coords")!==undefined?n.$elProxy.attr("coords").split(","):undefined;if(l=="circle"){var m=parseInt(v[0]),g=parseInt(v[1]),y=parseInt(v[2]);s.dimension.height=y*2;s.dimension.width=y*2;s.offset.top=d+g-y;s.offset.left=p+m-y}else if(l=="rect"){var m=parseInt(v[0]),g=parseInt(v[1]),b=parseInt(v[2]),w=parseInt(v[3]);s.dimension.height=w-g;s.dimension.width=b-m;s.offset.top=d+g;s.offset.left=p+m}else if(l=="poly"){var E=[],S=[],x=0,T=0,N=0,C=0,k="even";for(i=0;i<v.length;i++){var L=parseInt(v[i]);if(k=="even"){if(L>N){N=L;if(i===0){x=N}}if(L<x){x=L}k="odd"}else{if(L>C){C=L;if(i==1){T=C}}if(L<T){T=L}k="even"}}s.dimension.height=C-T;s.dimension.width=N-x;s.offset.top=d+T;s.offset.left=p+x}else{s.dimension.height=h.outerHeight(false);s.dimension.width=h.outerWidth(false);s.offset.top=d;s.offset.left=p}}if(n.options.fixedWidth===0){n.$tooltip.css({width:Math.round(u)+"px","padding-left":"0px","padding-right":"0px"})}var A=0,O=0,M=0,_=parseInt(n.options.offsetY),D=parseInt(n.options.offsetX),P=n.options.position;function H(){var i=e(t).scrollLeft();if(A-i<0){var s=A-i;A=i;n.tooltipArrowReposition=s}if(A+o-i>r){var s=A-(r+i-o);A=r+i-o;n.tooltipArrowReposition=s}}function B(n,r){if(s.offset.top-e(t).scrollTop()-a-_-12<0&&r.indexOf("top")>-1){P=n}if(s.offset.top+s.dimension.height+a+12+_>e(t).scrollTop()+e(t).height()&&r.indexOf("bottom")>-1){P=n;M=s.offset.top-a-_-12}}if(P=="top"){var j=s.offset.left+o-(s.offset.left+s.dimension.width);A=s.offset.left+D-j/2;M=s.offset.top-a-_-12;H();B("bottom","top")}if(P=="top-left"){A=s.offset.left+D;M=s.offset.top-a-_-12;H();B("bottom-left","top-left")}if(P=="top-right"){A=s.offset.left+s.dimension.width+D-o;M=s.offset.top-a-_-12;H();B("bottom-right","top-right")}if(P=="bottom"){var j=s.offset.left+o-(s.offset.left+s.dimension.width);A=s.offset.left-j/2+D;M=s.offset.top+s.dimension.height+_+12;H();B("top","bottom")}if(P=="bottom-left"){A=s.offset.left+D;M=s.offset.top+s.dimension.height+_+12;H();B("top-left","bottom-left")}if(P=="bottom-right"){A=s.offset.left+s.dimension.width+D-o;M=s.offset.top+s.dimension.height+_+12;H();B("top-right","bottom-right")}if(P=="left"){A=s.offset.left-D-o-12;O=s.offset.left+D+s.dimension.width+12;var F=s.offset.top+a-(s.offset.top+n.$elProxy.outerHeight(false));M=s.offset.top-F/2-_;if(A<0&&O+o>r){var I=parseFloat(n.$tooltip.css("border-width"))*2,q=o+A-I;n.$tooltip.css("width",q+"px");a=n.$tooltip.outerHeight(false);A=s.offset.left-D-q-12-I;F=s.offset.top+a-(s.offset.top+n.$elProxy.outerHeight(false));M=s.offset.top-F/2-_}else if(A<0){A=s.offset.left+D+s.dimension.width+12;n.tooltipArrowReposition="left"}}if(P=="right"){A=s.offset.left+D+s.dimension.width+12;O=s.offset.left-D-o-12;var F=s.offset.top+a-(s.offset.top+n.$elProxy.outerHeight(false));M=s.offset.top-F/2-_;if(A+o>r&&O<0){var I=parseFloat(n.$tooltip.css("border-width"))*2,q=r-A-I;n.$tooltip.css("width",q+"px");a=n.$tooltip.outerHeight(false);F=s.offset.top+a-(s.offset.top+n.$elProxy.outerHeight(false));M=s.offset.top-F/2-_}else if(A+o>r){A=s.offset.left-D-o-12;n.tooltipArrowReposition="right"}}if(n.options.arrow){var R="tooltipster-arrow-"+P;if(n.options.arrowColor.length<1){var U=n.$tooltip.css("background-color")}else{var U=n.options.arrowColor}var z=n.tooltipArrowReposition;if(!z){z=""}else if(z=="left"){R="tooltipster-arrow-right";z=""}else if(z=="right"){R="tooltipster-arrow-left";z=""}else{z="left:"+Math.round(z)+"px;"}if(P=="top"||P=="top-left"||P=="top-right"){var W=parseFloat(n.$tooltip.css("border-bottom-width")),X=n.$tooltip.css("border-bottom-color")}else if(P=="bottom"||P=="bottom-left"||P=="bottom-right"){var W=parseFloat(n.$tooltip.css("border-top-width")),X=n.$tooltip.css("border-top-color")}else if(P=="left"){var W=parseFloat(n.$tooltip.css("border-right-width")),X=n.$tooltip.css("border-right-color")}else if(P=="right"){var W=parseFloat(n.$tooltip.css("border-left-width")),X=n.$tooltip.css("border-left-color")}else{var W=parseFloat(n.$tooltip.css("border-bottom-width")),X=n.$tooltip.css("border-bottom-color")}if(W>1){W++}var V="";if(W!==0){var J="",K="border-color: "+X+";";if(R.indexOf("bottom")!==-1){J="margin-top: -"+Math.round(W)+"px;"}else if(R.indexOf("top")!==-1){J="margin-bottom: -"+Math.round(W)+"px;"}else if(R.indexOf("left")!==-1){J="margin-right: -"+Math.round(W)+"px;"}else if(R.indexOf("right")!==-1){J="margin-left: -"+Math.round(W)+"px;"}V='<span class="tooltipster-arrow-border" style="'+J+" "+K+';"></span>'}n.$tooltip.find(".tooltipster-arrow").remove();var Q='<div class="'+R+' tooltipster-arrow" style="'+z+'">'+V+'<span style="border-color:'+U+';"></span></div>';n.$tooltip.append(Q)}n.$tooltip.css({top:Math.round(M)+"px",left:Math.round(A)+"px"})}}};e.fn[r]=function(){var t=arguments;if(this.length===0){if(typeof t[0]==="string"){var n=true;switch(t[0]){case"setDefaults":e.extend(s,t[1]);break;default:n=false;break}if(n)return true;else return this}else{return this}}else{if(typeof t[0]==="string"){var r=null;this.each(function(){var n=e(this).data("tooltipster");if(n){switch(t[0]){case"content":case"update":if(typeof t[1]==="undefined"){r=n.content;return false}else{n.updateTooltip(t[1]);break};case"destroy":n.hideTooltip();if(n.$el[0]!==n.$elProxy[0])n.$elProxy.remove();var i=typeof n.content==="string"?n.content:e("<div></div>").append(n.content).html();n.$el.removeClass("tooltipstered").attr("title",i).removeData("tooltipster").off("."+n.namespace);break;case"disable":n.hideTooltip();n.enabled=false;break;case"elementIcon":r=n.$el[0]!==n.$elProxy[0]?n.$elProxy[0]:undefined;return false;case"elementTooltip":r=n.$tooltip?n.$tooltip[0]:undefined;return false;case"enable":n.enabled=true;break;case"hide":n.hideTooltip();break;case"option":r=n.options[t[1]];break;case"reposition":n.positionTooltip();break;case"show":n.showTooltipNow();break;case"status":r=n.status;return false;default:throw new Error('Unknown method .tooltipster("'+t[0]+'")');break}}else{throw new Error("You called Tooltipster's \""+t[0]+'" method on an unitialized element')}});return r!==null?r:this}else{return this.each(function(){if(!e(this).data("tooltipster")){e(this).data("tooltipster",new o(this,t[0]))}})}}};var a=!!("ontouchstart"in t);var f=false;e("body").one("mousemove",function(){f=true})})(jQuery,window,document);;
/*!
* MediaElement.js
* HTML5 <video> and <audio> shim and player
* http://mediaelementjs.com/
*
* Creates a JavaScript object that mimics HTML5 MediaElement API
* for browsers that don't understand HTML5 or can't play the provided codec
* Can play MP4 (H.264), Ogg, WebM, FLV, WMV, WMA, ACC, and MP3
*
* Copyright 2010-2014, John Dyer (http://j.hn)
* License: MIT
*
*/var mejs=mejs||{};mejs.version="2.14.2";mejs.meIndex=0;
mejs.plugins={silverlight:[{version:[3,0],types:["video/mp4","video/m4v","video/mov","video/wmv","audio/wma","audio/m4a","audio/mp3","audio/wav","audio/mpeg"]}],flash:[{version:[9,0,124],types:["video/mp4","video/m4v","video/mov","video/flv","video/rtmp","video/x-flv","audio/flv","audio/x-flv","audio/mp3","audio/m4a","audio/mpeg","video/youtube","video/x-youtube"]}],youtube:[{version:null,types:["video/youtube","video/x-youtube","audio/youtube","audio/x-youtube"]}],vimeo:[{version:null,types:["video/vimeo",
"video/x-vimeo"]}]};
mejs.Utility={encodeUrl:function(a){return encodeURIComponent(a)},escapeHTML:function(a){return a.toString().split("&").join("&amp;").split("<").join("&lt;").split('"').join("&quot;")},absolutizeUrl:function(a){var b=document.createElement("div");b.innerHTML='<a href="'+this.escapeHTML(a)+'">x</a>';return b.firstChild.href},getScriptPath:function(a){for(var b=0,c,d="",e="",g,f,i=document.getElementsByTagName("script"),k=i.length,h=a.length;b<k;b++){g=i[b].src;c=g.lastIndexOf("/");if(c>-1){f=g.substring(c+
1);g=g.substring(0,c+1)}else{f=g;g=""}for(c=0;c<h;c++){e=a[c];e=f.indexOf(e);if(e>-1){d=g;break}}if(d!=="")break}return d},secondsToTimeCode:function(a,b,c,d){if(typeof c=="undefined")c=false;else if(typeof d=="undefined")d=25;var e=Math.floor(a/3600)%24,g=Math.floor(a/60)%60,f=Math.floor(a%60);a=Math.floor((a%1*d).toFixed(3));return(b||e>0?(e<10?"0"+e:e)+":":"")+(g<10?"0"+g:g)+":"+(f<10?"0"+f:f)+(c?":"+(a<10?"0"+a:a):"")},timeCodeToSeconds:function(a,b,c,d){if(typeof c=="undefined")c=false;else if(typeof d==
"undefined")d=25;a=a.split(":");b=parseInt(a[0],10);var e=parseInt(a[1],10),g=parseInt(a[2],10),f=0,i=0;if(c)f=parseInt(a[3])/d;return i=b*3600+e*60+g+f},convertSMPTEtoSeconds:function(a){if(typeof a!="string")return false;a=a.replace(",",".");var b=0,c=a.indexOf(".")!=-1?a.split(".")[1].length:0,d=1;a=a.split(":").reverse();for(var e=0;e<a.length;e++){d=1;if(e>0)d=Math.pow(60,e);b+=Number(a[e])*d}return Number(b.toFixed(c))},removeSwf:function(a){var b=document.getElementById(a);if(b&&/object|embed/i.test(b.nodeName))if(mejs.MediaFeatures.isIE){b.style.display=
"none";(function(){b.readyState==4?mejs.Utility.removeObjectInIE(a):setTimeout(arguments.callee,10)})()}else b.parentNode.removeChild(b)},removeObjectInIE:function(a){if(a=document.getElementById(a)){for(var b in a)if(typeof a[b]=="function")a[b]=null;a.parentNode.removeChild(a)}}};
mejs.PluginDetector={hasPluginVersion:function(a,b){var c=this.plugins[a];b[1]=b[1]||0;b[2]=b[2]||0;return c[0]>b[0]||c[0]==b[0]&&c[1]>b[1]||c[0]==b[0]&&c[1]==b[1]&&c[2]>=b[2]?true:false},nav:window.navigator,ua:window.navigator.userAgent.toLowerCase(),plugins:[],addPlugin:function(a,b,c,d,e){this.plugins[a]=this.detectPlugin(b,c,d,e)},detectPlugin:function(a,b,c,d){var e=[0,0,0],g;if(typeof this.nav.plugins!="undefined"&&typeof this.nav.plugins[a]=="object"){if((c=this.nav.plugins[a].description)&&
!(typeof this.nav.mimeTypes!="undefined"&&this.nav.mimeTypes[b]&&!this.nav.mimeTypes[b].enabledPlugin)){e=c.replace(a,"").replace(/^\s+/,"").replace(/\sr/gi,".").split(".");for(a=0;a<e.length;a++)e[a]=parseInt(e[a].match(/\d+/),10)}}else if(typeof window.ActiveXObject!="undefined")try{if(g=new ActiveXObject(c))e=d(g)}catch(f){}return e}};
mejs.PluginDetector.addPlugin("flash","Shockwave Flash","application/x-shockwave-flash","ShockwaveFlash.ShockwaveFlash",function(a){var b=[];if(a=a.GetVariable("$version")){a=a.split(" ")[1].split(",");b=[parseInt(a[0],10),parseInt(a[1],10),parseInt(a[2],10)]}return b});
mejs.PluginDetector.addPlugin("silverlight","Silverlight Plug-In","application/x-silverlight-2","AgControl.AgControl",function(a){var b=[0,0,0,0],c=function(d,e,g,f){for(;d.isVersionSupported(e[0]+"."+e[1]+"."+e[2]+"."+e[3]);)e[g]+=f;e[g]-=f};c(a,b,0,1);c(a,b,1,1);c(a,b,2,1E4);c(a,b,2,1E3);c(a,b,2,100);c(a,b,2,10);c(a,b,2,1);c(a,b,3,1);return b});
mejs.MediaFeatures={init:function(){var a=this,b=document,c=mejs.PluginDetector.nav,d=mejs.PluginDetector.ua.toLowerCase(),e,g=["source","track","audio","video"];a.isiPad=d.match(/ipad/i)!==null;a.isiPhone=d.match(/iphone/i)!==null;a.isiOS=a.isiPhone||a.isiPad;a.isAndroid=d.match(/android/i)!==null;a.isBustedAndroid=d.match(/android 2\.[12]/)!==null;a.isBustedNativeHTTPS=location.protocol==="https:"&&(d.match(/android [12]\./)!==null||d.match(/macintosh.* version.* safari/)!==null);a.isIE=c.appName.toLowerCase().indexOf("microsoft")!=
-1||c.appName.toLowerCase().match(/trident/gi)!==null;a.isChrome=d.match(/chrome/gi)!==null;a.isFirefox=d.match(/firefox/gi)!==null;a.isWebkit=d.match(/webkit/gi)!==null;a.isGecko=d.match(/gecko/gi)!==null&&!a.isWebkit&&!a.isIE;a.isOpera=d.match(/opera/gi)!==null;a.hasTouch="ontouchstart"in window;a.svg=!!document.createElementNS&&!!document.createElementNS("http://www.w3.org/2000/svg","svg").createSVGRect;for(c=0;c<g.length;c++)e=document.createElement(g[c]);a.supportsMediaTag=typeof e.canPlayType!==
"undefined"||a.isBustedAndroid;try{e.canPlayType("video/mp4")}catch(f){a.supportsMediaTag=false}a.hasSemiNativeFullScreen=typeof e.webkitEnterFullscreen!=="undefined";a.hasNativeFullscreen=typeof e.requestFullscreen!=="undefined";a.hasWebkitNativeFullScreen=typeof e.webkitRequestFullScreen!=="undefined";a.hasMozNativeFullScreen=typeof e.mozRequestFullScreen!=="undefined";a.hasMsNativeFullScreen=typeof e.msRequestFullscreen!=="undefined";a.hasTrueNativeFullScreen=a.hasWebkitNativeFullScreen||a.hasMozNativeFullScreen||
a.hasMsNativeFullScreen;a.nativeFullScreenEnabled=a.hasTrueNativeFullScreen;if(a.hasMozNativeFullScreen)a.nativeFullScreenEnabled=document.mozFullScreenEnabled;else if(a.hasMsNativeFullScreen)a.nativeFullScreenEnabled=document.msFullscreenEnabled;if(a.isChrome)a.hasSemiNativeFullScreen=false;if(a.hasTrueNativeFullScreen){a.fullScreenEventName="";if(a.hasWebkitNativeFullScreen)a.fullScreenEventName="webkitfullscreenchange";else if(a.hasMozNativeFullScreen)a.fullScreenEventName="mozfullscreenchange";
else if(a.hasMsNativeFullScreen)a.fullScreenEventName="MSFullscreenChange";a.isFullScreen=function(){if(e.mozRequestFullScreen)return b.mozFullScreen;else if(e.webkitRequestFullScreen)return b.webkitIsFullScreen;else if(e.hasMsNativeFullScreen)return b.msFullscreenElement!==null};a.requestFullScreen=function(i){if(a.hasWebkitNativeFullScreen)i.webkitRequestFullScreen();else if(a.hasMozNativeFullScreen)i.mozRequestFullScreen();else a.hasMsNativeFullScreen&&i.msRequestFullscreen()};a.cancelFullScreen=
function(){if(a.hasWebkitNativeFullScreen)document.webkitCancelFullScreen();else if(a.hasMozNativeFullScreen)document.mozCancelFullScreen();else a.hasMsNativeFullScreen&&document.msExitFullscreen()}}if(a.hasSemiNativeFullScreen&&d.match(/mac os x 10_5/i)){a.hasNativeFullScreen=false;a.hasSemiNativeFullScreen=false}}};mejs.MediaFeatures.init();
mejs.HtmlMediaElement={pluginType:"native",isFullScreen:false,setCurrentTime:function(a){this.currentTime=a},setMuted:function(a){this.muted=a},setVolume:function(a){this.volume=a},stop:function(){this.pause()},setSrc:function(a){for(var b=this.getElementsByTagName("source");b.length>0;)this.removeChild(b[0]);if(typeof a=="string")this.src=a;else{var c;for(b=0;b<a.length;b++){c=a[b];if(this.canPlayType(c.type)){this.src=c.src;break}}}},setVideoSize:function(a,b){this.width=a;this.height=b}};
mejs.PluginMediaElement=function(a,b,c){this.id=a;this.pluginType=b;this.src=c;this.events={};this.attributes={}};
mejs.PluginMediaElement.prototype={pluginElement:null,pluginType:"",isFullScreen:false,playbackRate:-1,defaultPlaybackRate:-1,seekable:[],played:[],paused:true,ended:false,seeking:false,duration:0,error:null,tagName:"",muted:false,volume:1,currentTime:0,play:function(){if(this.pluginApi!=null){this.pluginType=="youtube"||this.pluginType=="vimeo"?this.pluginApi.playVideo():this.pluginApi.playMedia();this.paused=false}},load:function(){if(this.pluginApi!=null){this.pluginType=="youtube"||this.pluginType==
"vimeo"||this.pluginApi.loadMedia();this.paused=false}},pause:function(){if(this.pluginApi!=null){this.pluginType=="youtube"||this.pluginType=="vimeo"?this.pluginApi.pauseVideo():this.pluginApi.pauseMedia();this.paused=true}},stop:function(){if(this.pluginApi!=null){this.pluginType=="youtube"||this.pluginType=="vimeo"?this.pluginApi.stopVideo():this.pluginApi.stopMedia();this.paused=true}},canPlayType:function(a){var b,c,d,e=mejs.plugins[this.pluginType];for(b=0;b<e.length;b++){d=e[b];if(mejs.PluginDetector.hasPluginVersion(this.pluginType,
d.version))for(c=0;c<d.types.length;c++)if(a==d.types[c])return"probably"}return""},positionFullscreenButton:function(a,b,c){this.pluginApi!=null&&this.pluginApi.positionFullscreenButton&&this.pluginApi.positionFullscreenButton(Math.floor(a),Math.floor(b),c)},hideFullscreenButton:function(){this.pluginApi!=null&&this.pluginApi.hideFullscreenButton&&this.pluginApi.hideFullscreenButton()},setSrc:function(a){if(typeof a=="string"){this.pluginApi.setSrc(mejs.Utility.absolutizeUrl(a));this.src=mejs.Utility.absolutizeUrl(a)}else{var b,
c;for(b=0;b<a.length;b++){c=a[b];if(this.canPlayType(c.type)){this.pluginApi.setSrc(mejs.Utility.absolutizeUrl(c.src));this.src=mejs.Utility.absolutizeUrl(a);break}}}},setCurrentTime:function(a){if(this.pluginApi!=null){this.pluginType=="youtube"||this.pluginType=="vimeo"?this.pluginApi.seekTo(a):this.pluginApi.setCurrentTime(a);this.currentTime=a}},setVolume:function(a){if(this.pluginApi!=null){this.pluginType=="youtube"||this.pluginType=="vimeo"?this.pluginApi.setVolume(a*100):this.pluginApi.setVolume(a);
this.volume=a}},setMuted:function(a){if(this.pluginApi!=null){if(this.pluginType=="youtube"||this.pluginType=="vimeo"){a?this.pluginApi.mute():this.pluginApi.unMute();this.muted=a;this.dispatchEvent("volumechange")}else this.pluginApi.setMuted(a);this.muted=a}},setVideoSize:function(a,b){if(this.pluginElement.style){this.pluginElement.style.width=a+"px";this.pluginElement.style.height=b+"px"}this.pluginApi!=null&&this.pluginApi.setVideoSize&&this.pluginApi.setVideoSize(a,b)},setFullscreen:function(a){this.pluginApi!=
null&&this.pluginApi.setFullscreen&&this.pluginApi.setFullscreen(a)},enterFullScreen:function(){this.pluginApi!=null&&this.pluginApi.setFullscreen&&this.setFullscreen(true)},exitFullScreen:function(){this.pluginApi!=null&&this.pluginApi.setFullscreen&&this.setFullscreen(false)},addEventListener:function(a,b){this.events[a]=this.events[a]||[];this.events[a].push(b)},removeEventListener:function(a,b){if(!a){this.events={};return true}var c=this.events[a];if(!c)return true;if(!b){this.events[a]=[];return true}for(var d=
0;d<c.length;d++)if(c[d]===b){this.events[a].splice(d,1);return true}return false},dispatchEvent:function(a){var b,c,d=this.events[a];if(d){c=Array.prototype.slice.call(arguments,1);for(b=0;b<d.length;b++)d[b].apply(null,c)}},hasAttribute:function(a){return a in this.attributes},removeAttribute:function(a){delete this.attributes[a]},getAttribute:function(a){if(this.hasAttribute(a))return this.attributes[a];return""},setAttribute:function(a,b){this.attributes[a]=b},remove:function(){mejs.Utility.removeSwf(this.pluginElement.id);
mejs.MediaPluginBridge.unregisterPluginElement(this.pluginElement.id)}};
mejs.MediaPluginBridge={pluginMediaElements:{},htmlMediaElements:{},registerPluginElement:function(a,b,c){this.pluginMediaElements[a]=b;this.htmlMediaElements[a]=c},unregisterPluginElement:function(a){delete this.pluginMediaElements[a];delete this.htmlMediaElements[a]},initPlugin:function(a){var b=this.pluginMediaElements[a],c=this.htmlMediaElements[a];if(b){switch(b.pluginType){case "flash":b.pluginElement=b.pluginApi=document.getElementById(a);break;case "silverlight":b.pluginElement=document.getElementById(b.id);
b.pluginApi=b.pluginElement.Content.MediaElementJS}b.pluginApi!=null&&b.success&&b.success(b,c)}},fireEvent:function(a,b,c){var d,e;if(a=this.pluginMediaElements[a]){b={type:b,target:a};for(d in c){a[d]=c[d];b[d]=c[d]}e=c.bufferedTime||0;b.target.buffered=b.buffered={start:function(){return 0},end:function(){return e},length:1};a.dispatchEvent(b.type,b)}}};
mejs.MediaElementDefaults={mode:"auto",plugins:["flash","silverlight","youtube","vimeo"],enablePluginDebug:false,httpsBasicAuthSite:false,type:"",pluginPath:mejs.Utility.getScriptPath(["mediaelement.js","mediaelement.min.js","mediaelement-and-player.js","mediaelement-and-player.min.js"]),flashName:"flashmediaelement.swf",flashStreamer:"",enablePluginSmoothing:false,enablePseudoStreaming:false,pseudoStreamingStartQueryParam:"start",silverlightName:"silverlightmediaelement.xap",defaultVideoWidth:480,
defaultVideoHeight:270,pluginWidth:-1,pluginHeight:-1,pluginVars:[],timerRate:250,startVolume:0.8,success:function(){},error:function(){}};mejs.MediaElement=function(a,b){return mejs.HtmlMediaElementShim.create(a,b)};
mejs.HtmlMediaElementShim={create:function(a,b){var c=mejs.MediaElementDefaults,d=typeof a=="string"?document.getElementById(a):a,e=d.tagName.toLowerCase(),g=e==="audio"||e==="video",f=g?d.getAttribute("src"):d.getAttribute("href");e=d.getAttribute("poster");var i=d.getAttribute("autoplay"),k=d.getAttribute("preload"),h=d.getAttribute("controls"),j;for(j in b)c[j]=b[j];f=typeof f=="undefined"||f===null||f==""?null:f;e=typeof e=="undefined"||e===null?"":e;k=typeof k=="undefined"||k===null||k==="false"?
"none":k;i=!(typeof i=="undefined"||i===null||i==="false");h=!(typeof h=="undefined"||h===null||h==="false");j=this.determinePlayback(d,c,mejs.MediaFeatures.supportsMediaTag,g,f);j.url=j.url!==null?mejs.Utility.absolutizeUrl(j.url):"";if(j.method=="native"){if(mejs.MediaFeatures.isBustedAndroid){d.src=j.url;d.addEventListener("click",function(){d.play()},false)}return this.updateNative(j,c,i,k)}else if(j.method!=="")return this.createPlugin(j,c,e,i,k,h);else{this.createErrorMessage(j,c,e);return this}},
determinePlayback:function(a,b,c,d,e){var g=[],f,i,k,h={method:"",url:"",htmlMediaElement:a,isVideo:a.tagName.toLowerCase()!="audio"},j;if(typeof b.type!="undefined"&&b.type!=="")if(typeof b.type=="string")g.push({type:b.type,url:e});else for(f=0;f<b.type.length;f++)g.push({type:b.type[f],url:e});else if(e!==null){k=this.formatType(e,a.getAttribute("type"));g.push({type:k,url:e})}else for(f=0;f<a.childNodes.length;f++){i=a.childNodes[f];if(i.nodeType==1&&i.tagName.toLowerCase()=="source"){e=i.getAttribute("src");
k=this.formatType(e,i.getAttribute("type"));i=i.getAttribute("media");if(!i||!window.matchMedia||window.matchMedia&&window.matchMedia(i).matches)g.push({type:k,url:e})}}if(!d&&g.length>0&&g[0].url!==null&&this.getTypeFromFile(g[0].url).indexOf("audio")>-1)h.isVideo=false;if(mejs.MediaFeatures.isBustedAndroid)a.canPlayType=function(m){return m.match(/video\/(mp4|m4v)/gi)!==null?"maybe":""};if(c&&(b.mode==="auto"||b.mode==="auto_plugin"||b.mode==="native")&&!(mejs.MediaFeatures.isBustedNativeHTTPS&&
b.httpsBasicAuthSite===true)){if(!d){f=document.createElement(h.isVideo?"video":"audio");a.parentNode.insertBefore(f,a);a.style.display="none";h.htmlMediaElement=a=f}for(f=0;f<g.length;f++)if(a.canPlayType(g[f].type).replace(/no/,"")!==""||a.canPlayType(g[f].type.replace(/mp3/,"mpeg")).replace(/no/,"")!==""||a.canPlayType(g[f].type.replace(/m4a/,"mp4")).replace(/no/,"")!==""){h.method="native";h.url=g[f].url;break}if(h.method==="native"){if(h.url!==null)a.src=h.url;if(b.mode!=="auto_plugin")return h}}if(b.mode===
"auto"||b.mode==="auto_plugin"||b.mode==="shim")for(f=0;f<g.length;f++){k=g[f].type;for(a=0;a<b.plugins.length;a++){e=b.plugins[a];i=mejs.plugins[e];for(c=0;c<i.length;c++){j=i[c];if(j.version==null||mejs.PluginDetector.hasPluginVersion(e,j.version))for(d=0;d<j.types.length;d++)if(k==j.types[d]){h.method=e;h.url=g[f].url;return h}}}}if(b.mode==="auto_plugin"&&h.method==="native")return h;if(h.method===""&&g.length>0)h.url=g[0].url;return h},formatType:function(a,b){return a&&!b?this.getTypeFromFile(a):
b&&~b.indexOf(";")?b.substr(0,b.indexOf(";")):b},getTypeFromFile:function(a){a=a.split("?")[0];a=a.substring(a.lastIndexOf(".")+1).toLowerCase();return(/(mp4|m4v|ogg|ogv|webm|webmv|flv|wmv|mpeg|mov)/gi.test(a)?"video":"audio")+"/"+this.getTypeFromExtension(a)},getTypeFromExtension:function(a){switch(a){case "mp4":case "m4v":case "m4a":return"mp4";case "webm":case "webma":case "webmv":return"webm";case "ogg":case "oga":case "ogv":return"ogg";default:return a}},createErrorMessage:function(a,b,c){var d=
a.htmlMediaElement,e=document.createElement("div");e.className="me-cannotplay";try{e.style.width=d.width+"px";e.style.height=d.height+"px"}catch(g){}e.innerHTML=b.customError?b.customError:c!==""?'<a href="'+a.url+'"><img src="'+c+'" width="100%" height="100%" /></a>':'<a href="'+a.url+'"><span>'+mejs.i18n.t("Download File")+"</span></a>";d.parentNode.insertBefore(e,d);d.style.display="none";b.error(d)},createPlugin:function(a,b,c,d,e,g){c=a.htmlMediaElement;var f=1,i=1,k="me_"+a.method+"_"+mejs.meIndex++,
h=new mejs.PluginMediaElement(k,a.method,a.url),j=document.createElement("div"),m;h.tagName=c.tagName;for(m=0;m<c.attributes.length;m++){var q=c.attributes[m];q.specified==true&&h.setAttribute(q.name,q.value)}for(m=c.parentNode;m!==null&&m.tagName.toLowerCase()!=="body"&&m.parentNode!=null;){if(m.parentNode.tagName.toLowerCase()==="p"){m.parentNode.parentNode.insertBefore(m,m.parentNode);break}m=m.parentNode}if(a.isVideo){f=b.pluginWidth>0?b.pluginWidth:b.videoWidth>0?b.videoWidth:c.getAttribute("width")!==
null?c.getAttribute("width"):b.defaultVideoWidth;i=b.pluginHeight>0?b.pluginHeight:b.videoHeight>0?b.videoHeight:c.getAttribute("height")!==null?c.getAttribute("height"):b.defaultVideoHeight;f=mejs.Utility.encodeUrl(f);i=mejs.Utility.encodeUrl(i)}else if(b.enablePluginDebug){f=320;i=240}h.success=b.success;mejs.MediaPluginBridge.registerPluginElement(k,h,c);j.className="me-plugin";j.id=k+"_container";a.isVideo?c.parentNode.insertBefore(j,c):document.body.insertBefore(j,document.body.childNodes[0]);
d=["id="+k,"isvideo="+(a.isVideo?"true":"false"),"autoplay="+(d?"true":"false"),"preload="+e,"width="+f,"startvolume="+b.startVolume,"timerrate="+b.timerRate,"flashstreamer="+b.flashStreamer,"height="+i,"pseudostreamstart="+b.pseudoStreamingStartQueryParam];if(a.url!==null)a.method=="flash"?d.push("file="+mejs.Utility.encodeUrl(a.url)):d.push("file="+a.url);b.enablePluginDebug&&d.push("debug=true");b.enablePluginSmoothing&&d.push("smoothing=true");b.enablePseudoStreaming&&d.push("pseudostreaming=true");
g&&d.push("controls=true");if(b.pluginVars)d=d.concat(b.pluginVars);switch(a.method){case "silverlight":j.innerHTML='<object data="data:application/x-silverlight-2," type="application/x-silverlight-2" id="'+k+'" name="'+k+'" width="'+f+'" height="'+i+'" class="mejs-shim"><param name="initParams" value="'+d.join(",")+'" /><param name="windowless" value="true" /><param name="background" value="black" /><param name="minRuntimeVersion" value="3.0.0.0" /><param name="autoUpgrade" value="true" /><param name="source" value="'+
b.pluginPath+b.silverlightName+'" /></object>';break;case "flash":if(mejs.MediaFeatures.isIE){a=document.createElement("div");j.appendChild(a);a.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="//download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab" id="'+k+'" width="'+f+'" height="'+i+'" class="mejs-shim"><param name="movie" value="'+b.pluginPath+b.flashName+"?x="+new Date+'" /><param name="flashvars" value="'+d.join("&amp;")+'" /><param name="quality" value="high" /><param name="bgcolor" value="#000000" /><param name="wmode" value="transparent" /><param name="allowScriptAccess" value="always" /><param name="allowFullScreen" value="true" /><param name="scale" value="default" /></object>'}else j.innerHTML=
'<embed id="'+k+'" name="'+k+'" play="true" loop="false" quality="high" bgcolor="#000000" wmode="transparent" allowScriptAccess="always" allowFullScreen="true" type="application/x-shockwave-flash" pluginspage="//www.macromedia.com/go/getflashplayer" src="'+b.pluginPath+b.flashName+'" flashvars="'+d.join("&")+'" width="'+f+'" height="'+i+'" scale="default"class="mejs-shim"></embed>';break;case "youtube":if(a.url.lastIndexOf("youtu.be")!=-1){a=a.url.substr(a.url.lastIndexOf("/")+1);if(a.indexOf("?")!=
-1)a=a.substr(0,a.indexOf("?"))}else a=a.url.substr(a.url.lastIndexOf("=")+1);youtubeSettings={container:j,containerId:j.id,pluginMediaElement:h,pluginId:k,videoId:a,height:i,width:f};mejs.PluginDetector.hasPluginVersion("flash",[10,0,0])?mejs.YouTubeApi.createFlash(youtubeSettings):mejs.YouTubeApi.enqueueIframe(youtubeSettings);break;case "vimeo":b=k+"_player";h.vimeoid=a.url.substr(a.url.lastIndexOf("/")+1);j.innerHTML='<iframe src="//player.vimeo.com/video/'+h.vimeoid+"?api=1&portrait=0&byline=0&title=0&player_id="+
b+'" width="'+f+'" height="'+i+'" frameborder="0" class="mejs-shim" id="'+b+'"></iframe>';if(typeof $f=="function"){var l=$f(j.childNodes[0]);l.addEvent("ready",function(){function o(n,p,r,s){n={type:r,target:p};if(r=="timeupdate"){p.currentTime=n.currentTime=s.seconds;p.duration=n.duration=s.duration}p.dispatchEvent(n.type,n)}l.playVideo=function(){l.api("play")};l.pauseVideo=function(){l.api("pause")};l.seekTo=function(n){l.api("seekTo",n)};l.addEvent("play",function(){o(l,h,"play");o(l,h,"playing")});
l.addEvent("pause",function(){o(l,h,"pause")});l.addEvent("finish",function(){o(l,h,"ended")});l.addEvent("playProgress",function(n){o(l,h,"timeupdate",n)});h.pluginApi=l;mejs.MediaPluginBridge.initPlugin(k)})}else console.warn("You need to include froogaloop for vimeo to work")}c.style.display="none";c.removeAttribute("autoplay");return h},updateNative:function(a,b){var c=a.htmlMediaElement,d;for(d in mejs.HtmlMediaElement)c[d]=mejs.HtmlMediaElement[d];b.success(c,c);return c}};
mejs.YouTubeApi={isIframeStarted:false,isIframeLoaded:false,loadIframeApi:function(){if(!this.isIframeStarted){var a=document.createElement("script");a.src="//www.youtube.com/player_api";var b=document.getElementsByTagName("script")[0];b.parentNode.insertBefore(a,b);this.isIframeStarted=true}},iframeQueue:[],enqueueIframe:function(a){if(this.isLoaded)this.createIframe(a);else{this.loadIframeApi();this.iframeQueue.push(a)}},createIframe:function(a){var b=a.pluginMediaElement,c=new YT.Player(a.containerId,
{height:a.height,width:a.width,videoId:a.videoId,playerVars:{controls:0},events:{onReady:function(){a.pluginMediaElement.pluginApi=c;mejs.MediaPluginBridge.initPlugin(a.pluginId);setInterval(function(){mejs.YouTubeApi.createEvent(c,b,"timeupdate")},250)},onStateChange:function(d){mejs.YouTubeApi.handleStateChange(d.data,c,b)}}})},createEvent:function(a,b,c){c={type:c,target:b};if(a&&a.getDuration){b.currentTime=c.currentTime=a.getCurrentTime();b.duration=c.duration=a.getDuration();c.paused=b.paused;
c.ended=b.ended;c.muted=a.isMuted();c.volume=a.getVolume()/100;c.bytesTotal=a.getVideoBytesTotal();c.bufferedBytes=a.getVideoBytesLoaded();var d=c.bufferedBytes/c.bytesTotal*c.duration;c.target.buffered=c.buffered={start:function(){return 0},end:function(){return d},length:1}}b.dispatchEvent(c.type,c)},iFrameReady:function(){for(this.isIframeLoaded=this.isLoaded=true;this.iframeQueue.length>0;)this.createIframe(this.iframeQueue.pop())},flashPlayers:{},createFlash:function(a){this.flashPlayers[a.pluginId]=
a;var b,c="//www.youtube.com/apiplayer?enablejsapi=1&amp;playerapiid="+a.pluginId+"&amp;version=3&amp;autoplay=0&amp;controls=0&amp;modestbranding=1&loop=0";if(mejs.MediaFeatures.isIE){b=document.createElement("div");a.container.appendChild(b);b.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="//download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab" id="'+a.pluginId+'" width="'+a.width+'" height="'+a.height+'" class="mejs-shim"><param name="movie" value="'+
c+'" /><param name="wmode" value="transparent" /><param name="allowScriptAccess" value="always" /><param name="allowFullScreen" value="true" /></object>'}else a.container.innerHTML='<object type="application/x-shockwave-flash" id="'+a.pluginId+'" data="'+c+'" width="'+a.width+'" height="'+a.height+'" style="visibility: visible; " class="mejs-shim"><param name="allowScriptAccess" value="always"><param name="wmode" value="transparent"></object>'},flashReady:function(a){var b=this.flashPlayers[a],c=
document.getElementById(a),d=b.pluginMediaElement;d.pluginApi=d.pluginElement=c;mejs.MediaPluginBridge.initPlugin(a);c.cueVideoById(b.videoId);a=b.containerId+"_callback";window[a]=function(e){mejs.YouTubeApi.handleStateChange(e,c,d)};c.addEventListener("onStateChange",a);setInterval(function(){mejs.YouTubeApi.createEvent(c,d,"timeupdate")},250)},handleStateChange:function(a,b,c){switch(a){case -1:c.paused=true;c.ended=true;mejs.YouTubeApi.createEvent(b,c,"loadedmetadata");break;case 0:c.paused=false;
c.ended=true;mejs.YouTubeApi.createEvent(b,c,"ended");break;case 1:c.paused=false;c.ended=false;mejs.YouTubeApi.createEvent(b,c,"play");mejs.YouTubeApi.createEvent(b,c,"playing");break;case 2:c.paused=true;c.ended=false;mejs.YouTubeApi.createEvent(b,c,"pause");break;case 3:mejs.YouTubeApi.createEvent(b,c,"progress")}}};function onYouTubePlayerAPIReady(){mejs.YouTubeApi.iFrameReady()}function onYouTubePlayerReady(a){mejs.YouTubeApi.flashReady(a)}window.mejs=mejs;window.MediaElement=mejs.MediaElement;
(function(a,b){var c={locale:{language:"",strings:{}},methods:{}};c.getLanguage=function(){return(c.locale.language||window.navigator.userLanguage||window.navigator.language).substr(0,2).toLowerCase()};if(typeof mejsL10n!="undefined")c.locale.language=mejsL10n.language;c.methods.checkPlain=function(d){var e,g,f={"&":"&amp;",'"':"&quot;","<":"&lt;",">":"&gt;"};d=String(d);for(e in f)if(f.hasOwnProperty(e)){g=RegExp(e,"g");d=d.replace(g,f[e])}return d};c.methods.t=function(d,e){if(c.locale.strings&&
c.locale.strings[e.context]&&c.locale.strings[e.context][d])d=c.locale.strings[e.context][d];return c.methods.checkPlain(d)};c.t=function(d,e){if(typeof d==="string"&&d.length>0){var g=c.getLanguage();e=e||{context:g};return c.methods.t(d,e)}else throw{name:"InvalidArgumentException",message:"First argument is either not a string or empty."};};b.i18n=c})(document,mejs);(function(a){if(typeof mejsL10n!="undefined")a[mejsL10n.language]=mejsL10n.strings})(mejs.i18n.locale.strings);
(function(a){if(typeof a.de==="undefined")a.de={Fullscreen:"Vollbild","Go Fullscreen":"Vollbild an","Turn off Fullscreen":"Vollbild aus",Close:"Schlie\u00dfen"}})(mejs.i18n.locale.strings);(function(a){if(typeof a.zh==="undefined")a.zh={Fullscreen:"\u5168\u87a2\u5e55","Go Fullscreen":"\u5168\u5c4f\u6a21\u5f0f","Turn off Fullscreen":"\u9000\u51fa\u5168\u5c4f\u6a21\u5f0f",Close:"\u95dc\u9589"}})(mejs.i18n.locale.strings);

/*!
 * MediaElementPlayer
 * http://mediaelementjs.com/
 *
 * Creates a controller bar for HTML5 <video> add <audio> tags
 * using jQuery and MediaElement.js (HTML5 Flash/Silverlight wrapper)
 *
 * Copyright 2010-2013, John Dyer (http://j.hn/)
 * License: MIT
 *
 */if(typeof jQuery!="undefined")mejs.$=jQuery;else if(typeof ender!="undefined")mejs.$=ender;
(function(f){mejs.MepDefaults={poster:"",showPosterWhenEnded:false,defaultVideoWidth:480,defaultVideoHeight:270,videoWidth:-1,videoHeight:-1,defaultAudioWidth:400,defaultAudioHeight:30,defaultSeekBackwardInterval:function(a){return a.duration*0.05},defaultSeekForwardInterval:function(a){return a.duration*0.05},audioWidth:-1,audioHeight:-1,startVolume:0.8,loop:false,autoRewind:true,enableAutosize:true,alwaysShowHours:false,showTimecodeFrameCount:false,framesPerSecond:25,autosizeProgress:true,alwaysShowControls:false,
hideVideoControlsOnLoad:false,clickToPlayPause:true,iPadUseNativeControls:false,iPhoneUseNativeControls:false,AndroidUseNativeControls:false,features:["playpause","current","progress","duration","tracks","volume","fullscreen"],isVideo:true,enableKeyboard:true,pauseOtherPlayers:true,keyActions:[{keys:[32,179],action:function(a,b){b.paused||b.ended?a.play():a.pause()}},{keys:[38],action:function(a,b){b.setVolume(Math.min(b.volume+0.1,1))}},{keys:[40],action:function(a,b){b.setVolume(Math.max(b.volume-
0.1,0))}},{keys:[37,227],action:function(a,b){if(!isNaN(b.duration)&&b.duration>0){if(a.isVideo){a.showControls();a.startControlsTimer()}var c=Math.max(b.currentTime-a.options.defaultSeekBackwardInterval(b),0);b.setCurrentTime(c)}}},{keys:[39,228],action:function(a,b){if(!isNaN(b.duration)&&b.duration>0){if(a.isVideo){a.showControls();a.startControlsTimer()}var c=Math.min(b.currentTime+a.options.defaultSeekForwardInterval(b),b.duration);b.setCurrentTime(c)}}},{keys:[70],action:function(a){if(typeof a.enterFullScreen!=
"undefined")a.isFullScreen?a.exitFullScreen():a.enterFullScreen()}}]};mejs.mepIndex=0;mejs.players={};mejs.MediaElementPlayer=function(a,b){if(!(this instanceof mejs.MediaElementPlayer))return new mejs.MediaElementPlayer(a,b);this.$media=this.$node=f(a);this.node=this.media=this.$media[0];if(typeof this.node.player!="undefined")return this.node.player;else this.node.player=this;if(typeof b=="undefined")b=this.$node.data("mejsoptions");this.options=f.extend({},mejs.MepDefaults,b);this.id="mep_"+mejs.mepIndex++;
mejs.players[this.id]=this;this.init();return this};mejs.MediaElementPlayer.prototype={hasFocus:false,controlsAreVisible:true,init:function(){var a=this,b=mejs.MediaFeatures,c=f.extend(true,{},a.options,{success:function(d,g){a.meReady(d,g)},error:function(d){a.handleError(d)}}),e=a.media.tagName.toLowerCase();a.isDynamic=e!=="audio"&&e!=="video";a.isVideo=a.isDynamic?a.options.isVideo:e!=="audio"&&a.options.isVideo;if(b.isiPad&&a.options.iPadUseNativeControls||b.isiPhone&&a.options.iPhoneUseNativeControls){a.$media.attr("controls",
"controls");b.isiPad&&a.media.getAttribute("autoplay")!==null&&a.play()}else if(!(b.isAndroid&&a.options.AndroidUseNativeControls)){a.$media.removeAttr("controls");a.container=f('<div id="'+a.id+'" class="mejs-container '+(mejs.MediaFeatures.svg?"svg":"no-svg")+'"><div class="mejs-inner"><div class="mejs-mediaelement"></div><div class="mejs-layers"></div><div class="mejs-controls"></div><div class="mejs-clear"></div></div></div>').addClass(a.$media[0].className).insertBefore(a.$media);a.container.addClass((b.isAndroid?
"mejs-android ":"")+(b.isiOS?"mejs-ios ":"")+(b.isiPad?"mejs-ipad ":"")+(b.isiPhone?"mejs-iphone ":"")+(a.isVideo?"mejs-video ":"mejs-audio "));if(b.isiOS){b=a.$media.clone();a.container.find(".mejs-mediaelement").append(b);a.$media.remove();a.$node=a.$media=b;a.node=a.media=b[0]}else a.container.find(".mejs-mediaelement").append(a.$media);a.controls=a.container.find(".mejs-controls");a.layers=a.container.find(".mejs-layers");b=a.isVideo?"video":"audio";e=b.substring(0,1).toUpperCase()+b.substring(1);
a.width=a.options[b+"Width"]>0||a.options[b+"Width"].toString().indexOf("%")>-1?a.options[b+"Width"]:a.media.style.width!==""&&a.media.style.width!==null?a.media.style.width:a.media.getAttribute("width")!==null?a.$media.attr("width"):a.options["default"+e+"Width"];a.height=a.options[b+"Height"]>0||a.options[b+"Height"].toString().indexOf("%")>-1?a.options[b+"Height"]:a.media.style.height!==""&&a.media.style.height!==null?a.media.style.height:a.$media[0].getAttribute("height")!==null?a.$media.attr("height"):
a.options["default"+e+"Height"];a.setPlayerSize(a.width,a.height);c.pluginWidth=a.width;c.pluginHeight=a.height}mejs.MediaElement(a.$media[0],c);typeof a.container!="undefined"&&a.controlsAreVisible&&a.container.trigger("controlsshown")},showControls:function(a){var b=this;a=typeof a=="undefined"||a;if(!b.controlsAreVisible){if(a){b.controls.css("visibility","visible").stop(true,true).fadeIn(200,function(){b.controlsAreVisible=true;b.container.trigger("controlsshown")});b.container.find(".mejs-control").css("visibility",
"visible").stop(true,true).fadeIn(200,function(){b.controlsAreVisible=true})}else{b.controls.css("visibility","visible").css("display","block");b.container.find(".mejs-control").css("visibility","visible").css("display","block");b.controlsAreVisible=true;b.container.trigger("controlsshown")}b.setControlsSize()}},hideControls:function(a){var b=this;a=typeof a=="undefined"||a;if(!(!b.controlsAreVisible||b.options.alwaysShowControls))if(a){b.controls.stop(true,true).fadeOut(200,function(){f(this).css("visibility",
"hidden").css("display","block");b.controlsAreVisible=false;b.container.trigger("controlshidden")});b.container.find(".mejs-control").stop(true,true).fadeOut(200,function(){f(this).css("visibility","hidden").css("display","block")})}else{b.controls.css("visibility","hidden").css("display","block");b.container.find(".mejs-control").css("visibility","hidden").css("display","block");b.controlsAreVisible=false;b.container.trigger("controlshidden")}},controlsTimer:null,startControlsTimer:function(a){var b=
this;a=typeof a!="undefined"?a:1500;b.killControlsTimer("start");b.controlsTimer=setTimeout(function(){b.hideControls();b.killControlsTimer("hide")},a)},killControlsTimer:function(){if(this.controlsTimer!==null){clearTimeout(this.controlsTimer);delete this.controlsTimer;this.controlsTimer=null}},controlsEnabled:true,disableControls:function(){this.killControlsTimer();this.hideControls(false);this.controlsEnabled=false},enableControls:function(){this.showControls(false);this.controlsEnabled=true},
meReady:function(a,b){var c=this,e=mejs.MediaFeatures,d=b.getAttribute("autoplay");d=!(typeof d=="undefined"||d===null||d==="false");var g;if(!c.created){c.created=true;c.media=a;c.domNode=b;if(!(e.isAndroid&&c.options.AndroidUseNativeControls)&&!(e.isiPad&&c.options.iPadUseNativeControls)&&!(e.isiPhone&&c.options.iPhoneUseNativeControls)){c.buildposter(c,c.controls,c.layers,c.media);c.buildkeyboard(c,c.controls,c.layers,c.media);c.buildoverlays(c,c.controls,c.layers,c.media);c.findTracks();for(g in c.options.features){e=
c.options.features[g];if(c["build"+e])try{c["build"+e](c,c.controls,c.layers,c.media)}catch(k){}}c.container.trigger("controlsready");c.setPlayerSize(c.width,c.height);c.setControlsSize();if(c.isVideo){if(mejs.MediaFeatures.hasTouch)c.$media.bind("touchstart",function(){if(c.controlsAreVisible)c.hideControls(false);else c.controlsEnabled&&c.showControls(false)});else{c.clickToPlayPauseCallback=function(){if(c.options.clickToPlayPause)c.media.paused?c.play():c.pause()};c.media.addEventListener("click",
c.clickToPlayPauseCallback,false);c.container.bind("mouseenter mouseover",function(){if(c.controlsEnabled)if(!c.options.alwaysShowControls){c.killControlsTimer("enter");c.showControls();c.startControlsTimer(2500)}}).bind("mousemove",function(){if(c.controlsEnabled){c.controlsAreVisible||c.showControls();c.options.alwaysShowControls||c.startControlsTimer(2500)}}).bind("mouseleave",function(){c.controlsEnabled&&!c.media.paused&&!c.options.alwaysShowControls&&c.startControlsTimer(1E3)})}c.options.hideVideoControlsOnLoad&&
c.hideControls(false);d&&!c.options.alwaysShowControls&&c.hideControls();c.options.enableAutosize&&c.media.addEventListener("loadedmetadata",function(j){if(c.options.videoHeight<=0&&c.domNode.getAttribute("height")===null&&!isNaN(j.target.videoHeight)){c.setPlayerSize(j.target.videoWidth,j.target.videoHeight);c.setControlsSize();c.media.setVideoSize(j.target.videoWidth,j.target.videoHeight)}},false)}a.addEventListener("play",function(){for(var j in mejs.players){var m=mejs.players[j];m.id!=c.id&&
c.options.pauseOtherPlayers&&!m.paused&&!m.ended&&m.pause();m.hasFocus=false}c.hasFocus=true},false);c.media.addEventListener("ended",function(){if(c.options.autoRewind)try{c.media.setCurrentTime(0)}catch(j){}c.media.pause();c.setProgressRail&&c.setProgressRail();c.setCurrentRail&&c.setCurrentRail();if(c.options.loop)c.play();else!c.options.alwaysShowControls&&c.controlsEnabled&&c.showControls()},false);c.media.addEventListener("loadedmetadata",function(){c.updateDuration&&c.updateDuration();c.updateCurrent&&
c.updateCurrent();if(!c.isFullScreen){c.setPlayerSize(c.width,c.height);c.setControlsSize()}},false);setTimeout(function(){c.setPlayerSize(c.width,c.height);c.setControlsSize()},50);c.globalBind("resize",function(){c.isFullScreen||mejs.MediaFeatures.hasTrueNativeFullScreen&&document.webkitIsFullScreen||c.setPlayerSize(c.width,c.height);c.setControlsSize()});c.media.pluginType=="youtube"&&c.container.find(".mejs-overlay-play").hide()}d&&a.pluginType=="native"&&c.play();if(c.options.success)typeof c.options.success==
"string"?window[c.options.success](c.media,c.domNode,c):c.options.success(c.media,c.domNode,c)}},handleError:function(a){this.controls.hide();this.options.error&&this.options.error(a)},setPlayerSize:function(a,b){if(typeof a!="undefined")this.width=a;if(typeof b!="undefined")this.height=b;if(this.height.toString().indexOf("%")>0||this.$node.css("max-width")==="100%"||parseInt(this.$node.css("max-width").replace(/px/,""),10)/this.$node.offsetParent().width()===1||this.$node[0].currentStyle&&this.$node[0].currentStyle.maxWidth===
"100%"){var c=this.isVideo?this.media.videoWidth&&this.media.videoWidth>0?this.media.videoWidth:this.options.defaultVideoWidth:this.options.defaultAudioWidth,e=this.isVideo?this.media.videoHeight&&this.media.videoHeight>0?this.media.videoHeight:this.options.defaultVideoHeight:this.options.defaultAudioHeight,d=this.container.parent().closest(":visible").width();c=this.isVideo||!this.options.autosizeProgress?parseInt(d*e/c,10):e;if(isNaN(c))c=this.container.parent().closest(":visible").height();if(this.container.parent()[0].tagName.toLowerCase()===
"body"){d=f(window).width();c=f(window).height()}if(c!=0&&d!=0){this.container.width(d).height(c);this.$media.add(this.container.find(".mejs-shim")).width("100%").height("100%");this.isVideo&&this.media.setVideoSize&&this.media.setVideoSize(d,c);this.layers.children(".mejs-layer").width("100%").height("100%")}}else{this.container.width(this.width).height(this.height);this.layers.children(".mejs-layer").width(this.width).height(this.height)}d=this.layers.find(".mejs-overlay-play");c=d.find(".mejs-overlay-button");
d.height(this.container.height()-this.controls.height());c.css("margin-top","-"+(c.height()/2-this.controls.height()/2).toString()+"px")},setControlsSize:function(){var a=0,b=0,c=this.controls.find(".mejs-time-rail"),e=this.controls.find(".mejs-time-total");this.controls.find(".mejs-time-current");this.controls.find(".mejs-time-loaded");var d=c.siblings(),g=d.last(),k=null;if(!(!this.container.is(":visible")||!c.length||!c.is(":visible"))){if(this.options&&!this.options.autosizeProgress)b=parseInt(c.css("width"));
if(b===0||!b){d.each(function(){var j=f(this);if(j.css("position")!="absolute"&&j.is(":visible"))a+=f(this).outerWidth(true)});b=this.controls.width()-a-(c.outerWidth(true)-c.width())}do{c.width(b);e.width(b-(e.outerWidth(true)-e.width()));if(g.css("position")!="absolute"){k=g.position();b--}}while(k!=null&&k.top>0&&b>0);this.setProgressRail&&this.setProgressRail();this.setCurrentRail&&this.setCurrentRail()}},buildposter:function(a,b,c,e){var d=f('<div class="mejs-poster mejs-layer"></div>').appendTo(c);
b=a.$media.attr("poster");if(a.options.poster!=="")b=a.options.poster;b!==""&&b!=null?this.setPoster(b):d.hide();e.addEventListener("play",function(){d.hide()},false);a.options.showPosterWhenEnded&&a.options.autoRewind&&e.addEventListener("ended",function(){d.show()},false)},setPoster:function(a){var b=this.container.find(".mejs-poster"),c=b.find("img");if(c.length==0)c=f('<img width="100%" height="100%" />').appendTo(b);c.attr("src",a);b.css({"background-image":"url("+a+")"})},buildoverlays:function(a,
b,c,e){var d=this;if(a.isVideo){var g=f('<div class="mejs-overlay mejs-layer"><div class="mejs-overlay-loading"><span></span></div></div>').hide().appendTo(c),k=f('<div class="mejs-overlay mejs-layer"><div class="mejs-overlay-error"></div></div>').hide().appendTo(c),j=f('<div class="mejs-overlay mejs-layer mejs-overlay-play"><div class="mejs-overlay-button"></div></div>').appendTo(c).bind("click touchstart",function(){d.options.clickToPlayPause&&e.paused&&e.play()});e.addEventListener("play",function(){j.hide();
g.hide();b.find(".mejs-time-buffering").hide();k.hide()},false);e.addEventListener("playing",function(){j.hide();g.hide();b.find(".mejs-time-buffering").hide();k.hide()},false);e.addEventListener("seeking",function(){g.show();b.find(".mejs-time-buffering").show()},false);e.addEventListener("seeked",function(){g.hide();b.find(".mejs-time-buffering").hide()},false);e.addEventListener("pause",function(){mejs.MediaFeatures.isiPhone||j.show()},false);e.addEventListener("waiting",function(){g.show();b.find(".mejs-time-buffering").show()},
false);e.addEventListener("loadeddata",function(){g.show();b.find(".mejs-time-buffering").show()},false);e.addEventListener("canplay",function(){g.hide();b.find(".mejs-time-buffering").hide()},false);e.addEventListener("error",function(){g.hide();b.find(".mejs-time-buffering").hide();k.show();k.find("mejs-overlay-error").html("Error loading this resource")},false)}},buildkeyboard:function(a,b,c,e){this.globalBind("keydown",function(d){if(a.hasFocus&&a.options.enableKeyboard)for(var g=0,k=a.options.keyActions.length;g<
k;g++)for(var j=a.options.keyActions[g],m=0,q=j.keys.length;m<q;m++)if(d.keyCode==j.keys[m]){d.preventDefault();j.action(a,e,d.keyCode);return false}return true});this.globalBind("click",function(d){a.hasFocus=f(d.target).closest(".mejs-container").length!=0})},findTracks:function(){var a=this,b=a.$media.find("track");a.tracks=[];b.each(function(c,e){e=f(e);a.tracks.push({srclang:e.attr("srclang")?e.attr("srclang").toLowerCase():"",src:e.attr("src"),kind:e.attr("kind"),label:e.attr("label")||"",entries:[],
isLoaded:false})})},changeSkin:function(a){this.container[0].className="mejs-container "+a;this.setPlayerSize(this.width,this.height);this.setControlsSize()},play:function(){this.load();this.media.play()},pause:function(){try{this.media.pause()}catch(a){}},load:function(){this.isLoaded||this.media.load();this.isLoaded=true},setMuted:function(a){this.media.setMuted(a)},setCurrentTime:function(a){this.media.setCurrentTime(a)},getCurrentTime:function(){return this.media.currentTime},setVolume:function(a){this.media.setVolume(a)},
getVolume:function(){return this.media.volume},setSrc:function(a){this.media.setSrc(a)},remove:function(){var a,b;for(a in this.options.features){b=this.options.features[a];if(this["clean"+b])try{this["clean"+b](this)}catch(c){}}if(this.isDynamic)this.$node.insertBefore(this.container);else{this.$media.prop("controls",true);this.$node.clone().show().insertBefore(this.container);this.$node.remove()}this.media.pluginType!=="native"&&this.media.remove();delete mejs.players[this.id];typeof this.container==
"object"&&this.container.remove();this.globalUnbind();delete this.node.player}};(function(){function a(c,e){var d={d:[],w:[]};f.each((c||"").split(" "),function(g,k){var j=k+"."+e;if(j.indexOf(".")===0){d.d.push(j);d.w.push(j)}else d[b.test(k)?"w":"d"].push(j)});d.d=d.d.join(" ");d.w=d.w.join(" ");return d}var b=/^((after|before)print|(before)?unload|hashchange|message|o(ff|n)line|page(hide|show)|popstate|resize|storage)\b/;mejs.MediaElementPlayer.prototype.globalBind=function(c,e,d){c=a(c,this.id);
c.d&&f(document).bind(c.d,e,d);c.w&&f(window).bind(c.w,e,d)};mejs.MediaElementPlayer.prototype.globalUnbind=function(c,e){c=a(c,this.id);c.d&&f(document).unbind(c.d,e);c.w&&f(window).unbind(c.w,e)}})();if(typeof jQuery!="undefined")jQuery.fn.mediaelementplayer=function(a){a===false?this.each(function(){var b=jQuery(this).data("mediaelementplayer");b&&b.remove();jQuery(this).removeData("mediaelementplayer")}):this.each(function(){jQuery(this).data("mediaelementplayer",new mejs.MediaElementPlayer(this,
a))});return this};f(document).ready(function(){f(".mejs-player").mediaelementplayer()});window.MediaElementPlayer=mejs.MediaElementPlayer})(mejs.$);
(function(f){f.extend(mejs.MepDefaults,{playpauseText:mejs.i18n.t("Play/Pause")});f.extend(MediaElementPlayer.prototype,{buildplaypause:function(a,b,c,e){var d=f('<div class="mejs-button mejs-playpause-button mejs-play" ><button type="button" aria-controls="'+this.id+'" title="'+this.options.playpauseText+'" aria-label="'+this.options.playpauseText+'"></button></div>').appendTo(b).click(function(g){g.preventDefault();e.paused?e.play():e.pause();return false});e.addEventListener("play",function(){d.removeClass("mejs-play").addClass("mejs-pause")},
false);e.addEventListener("playing",function(){d.removeClass("mejs-play").addClass("mejs-pause")},false);e.addEventListener("pause",function(){d.removeClass("mejs-pause").addClass("mejs-play")},false);e.addEventListener("paused",function(){d.removeClass("mejs-pause").addClass("mejs-play")},false)}})})(mejs.$);
(function(f){f.extend(mejs.MepDefaults,{stopText:"Stop"});f.extend(MediaElementPlayer.prototype,{buildstop:function(a,b,c,e){f('<div class="mejs-button mejs-stop-button mejs-stop"><button type="button" aria-controls="'+this.id+'" title="'+this.options.stopText+'" aria-label="'+this.options.stopText+'"></button></div>').appendTo(b).click(function(){e.paused||e.pause();if(e.currentTime>0){e.setCurrentTime(0);e.pause();b.find(".mejs-time-current").width("0px");b.find(".mejs-time-handle").css("left",
"0px");b.find(".mejs-time-float-current").html(mejs.Utility.secondsToTimeCode(0));b.find(".mejs-currenttime").html(mejs.Utility.secondsToTimeCode(0));c.find(".mejs-poster").show()}})}})})(mejs.$);
(function(f){f.extend(MediaElementPlayer.prototype,{buildprogress:function(a,b,c,e){f('<div class="mejs-time-rail"><span class="mejs-time-total"><span class="mejs-time-buffering"></span><span class="mejs-time-loaded"></span><span class="mejs-time-current"></span><span class="mejs-time-handle"></span><span class="mejs-time-float"><span class="mejs-time-float-current">00:00</span><span class="mejs-time-float-corner"></span></span></span></div>').appendTo(b);b.find(".mejs-time-buffering").hide();var d=
this,g=b.find(".mejs-time-total");c=b.find(".mejs-time-loaded");var k=b.find(".mejs-time-current"),j=b.find(".mejs-time-handle"),m=b.find(".mejs-time-float"),q=b.find(".mejs-time-float-current"),p=function(h){h=h.originalEvent.changedTouches?h.originalEvent.changedTouches[0].pageX:h.pageX;var l=g.offset(),r=g.outerWidth(true),n=0,o=n=0;if(e.duration){if(h<l.left)h=l.left;else if(h>r+l.left)h=r+l.left;o=h-l.left;n=o/r;n=n<=0.02?0:n*e.duration;t&&n!==e.currentTime&&e.setCurrentTime(n);if(!mejs.MediaFeatures.hasTouch){m.css("left",
o);q.html(mejs.Utility.secondsToTimeCode(n));m.show()}}},t=false;g.bind("mousedown touchstart",function(h){if(h.which===1||h.which===0){t=true;p(h);d.globalBind("mousemove.dur touchmove.dur",function(l){p(l)});d.globalBind("mouseup.dur touchend.dur",function(){t=false;m.hide();d.globalUnbind(".dur")});return false}}).bind("mouseenter",function(){d.globalBind("mousemove.dur",function(h){p(h)});mejs.MediaFeatures.hasTouch||m.show()}).bind("mouseleave",function(){if(!t){d.globalUnbind(".dur");m.hide()}});
e.addEventListener("progress",function(h){a.setProgressRail(h);a.setCurrentRail(h)},false);e.addEventListener("timeupdate",function(h){a.setProgressRail(h);a.setCurrentRail(h)},false);d.loaded=c;d.total=g;d.current=k;d.handle=j},setProgressRail:function(a){var b=a!=undefined?a.target:this.media,c=null;if(b&&b.buffered&&b.buffered.length>0&&b.buffered.end&&b.duration)c=b.buffered.end(0)/b.duration;else if(b&&b.bytesTotal!=undefined&&b.bytesTotal>0&&b.bufferedBytes!=undefined)c=b.bufferedBytes/b.bytesTotal;
else if(a&&a.lengthComputable&&a.total!=0)c=a.loaded/a.total;if(c!==null){c=Math.min(1,Math.max(0,c));this.loaded&&this.total&&this.loaded.width(this.total.width()*c)}},setCurrentRail:function(){if(this.media.currentTime!=undefined&&this.media.duration)if(this.total&&this.handle){var a=Math.round(this.total.width()*this.media.currentTime/this.media.duration),b=a-Math.round(this.handle.outerWidth(true)/2);this.current.width(a);this.handle.css("left",b)}}})})(mejs.$);
(function(f){f.extend(mejs.MepDefaults,{duration:-1,timeAndDurationSeparator:"<span> | </span>"});f.extend(MediaElementPlayer.prototype,{buildcurrent:function(a,b,c,e){f('<div class="mejs-time"><span class="mejs-currenttime">'+(a.options.alwaysShowHours?"00:":"")+(a.options.showTimecodeFrameCount?"00:00:00":"00:00")+"</span></div>").appendTo(b);this.currenttime=this.controls.find(".mejs-currenttime");e.addEventListener("timeupdate",function(){a.updateCurrent()},false)},buildduration:function(a,b,
c,e){if(b.children().last().find(".mejs-currenttime").length>0)f(this.options.timeAndDurationSeparator+'<span class="mejs-duration">'+(this.options.duration>0?mejs.Utility.secondsToTimeCode(this.options.duration,this.options.alwaysShowHours||this.media.duration>3600,this.options.showTimecodeFrameCount,this.options.framesPerSecond||25):(a.options.alwaysShowHours?"00:":"")+(a.options.showTimecodeFrameCount?"00:00:00":"00:00"))+"</span>").appendTo(b.find(".mejs-time"));else{b.find(".mejs-currenttime").parent().addClass("mejs-currenttime-container");
f('<div class="mejs-time mejs-duration-container"><span class="mejs-duration">'+(this.options.duration>0?mejs.Utility.secondsToTimeCode(this.options.duration,this.options.alwaysShowHours||this.media.duration>3600,this.options.showTimecodeFrameCount,this.options.framesPerSecond||25):(a.options.alwaysShowHours?"00:":"")+(a.options.showTimecodeFrameCount?"00:00:00":"00:00"))+"</span></div>").appendTo(b)}this.durationD=this.controls.find(".mejs-duration");e.addEventListener("timeupdate",function(){a.updateDuration()},
false)},updateCurrent:function(){if(this.currenttime)this.currenttime.html(mejs.Utility.secondsToTimeCode(this.media.currentTime,this.options.alwaysShowHours||this.media.duration>3600,this.options.showTimecodeFrameCount,this.options.framesPerSecond||25))},updateDuration:function(){this.container.toggleClass("mejs-long-video",this.media.duration>3600);if(this.durationD&&(this.options.duration>0||this.media.duration))this.durationD.html(mejs.Utility.secondsToTimeCode(this.options.duration>0?this.options.duration:
this.media.duration,this.options.alwaysShowHours,this.options.showTimecodeFrameCount,this.options.framesPerSecond||25))}})})(mejs.$);
(function(f){f.extend(mejs.MepDefaults,{muteText:mejs.i18n.t("Mute Toggle"),hideVolumeOnTouchDevices:true,audioVolume:"horizontal",videoVolume:"vertical"});f.extend(MediaElementPlayer.prototype,{buildvolume:function(a,b,c,e){if(!((mejs.MediaFeatures.isAndroid||mejs.MediaFeatures.isiOS)&&this.options.hideVolumeOnTouchDevices)){var d=this,g=d.isVideo?d.options.videoVolume:d.options.audioVolume,k=g=="horizontal"?f('<div class="mejs-button mejs-volume-button mejs-mute"><button type="button" aria-controls="'+
d.id+'" title="'+d.options.muteText+'" aria-label="'+d.options.muteText+'"></button></div><div class="mejs-horizontal-volume-slider"><div class="mejs-horizontal-volume-total"></div><div class="mejs-horizontal-volume-current"></div><div class="mejs-horizontal-volume-handle"></div></div>').appendTo(b):f('<div class="mejs-button mejs-volume-button mejs-mute"><button type="button" aria-controls="'+d.id+'" title="'+d.options.muteText+'" aria-label="'+d.options.muteText+'"></button><div class="mejs-volume-slider"><div class="mejs-volume-total"></div><div class="mejs-volume-current"></div><div class="mejs-volume-handle"></div></div></div>').appendTo(b),
j=d.container.find(".mejs-volume-slider, .mejs-horizontal-volume-slider"),m=d.container.find(".mejs-volume-total, .mejs-horizontal-volume-total"),q=d.container.find(".mejs-volume-current, .mejs-horizontal-volume-current"),p=d.container.find(".mejs-volume-handle, .mejs-horizontal-volume-handle"),t=function(n,o){if(!j.is(":visible")&&typeof o=="undefined"){j.show();t(n,true);j.hide()}else{n=Math.max(0,n);n=Math.min(n,1);n==0?k.removeClass("mejs-mute").addClass("mejs-unmute"):k.removeClass("mejs-unmute").addClass("mejs-mute");
if(g=="vertical"){var s=m.height(),u=m.position(),v=s-s*n;p.css("top",Math.round(u.top+v-p.height()/2));q.height(s-v);q.css("top",u.top+v)}else{s=m.width();u=m.position();s=s*n;p.css("left",Math.round(u.left+s-p.width()/2));q.width(Math.round(s))}}},h=function(n){var o=null,s=m.offset();if(g=="vertical"){o=m.height();parseInt(m.css("top").replace(/px/,""),10);o=(o-(n.pageY-s.top))/o;if(s.top==0||s.left==0)return}else{o=m.width();o=(n.pageX-s.left)/o}o=Math.max(0,o);o=Math.min(o,1);t(o);o==0?e.setMuted(true):
e.setMuted(false);e.setVolume(o)},l=false,r=false;k.hover(function(){j.show();r=true},function(){r=false;!l&&g=="vertical"&&j.hide()});j.bind("mouseover",function(){r=true}).bind("mousedown",function(n){h(n);d.globalBind("mousemove.vol",function(o){h(o)});d.globalBind("mouseup.vol",function(){l=false;d.globalUnbind(".vol");!r&&g=="vertical"&&j.hide()});l=true;return false});k.find("button").click(function(){e.setMuted(!e.muted)});e.addEventListener("volumechange",function(){if(!l)if(e.muted){t(0);
k.removeClass("mejs-mute").addClass("mejs-unmute")}else{t(e.volume);k.removeClass("mejs-unmute").addClass("mejs-mute")}},false);if(d.container.is(":visible")){t(a.options.startVolume);a.options.startVolume===0&&e.setMuted(true);e.pluginType==="native"&&e.setVolume(a.options.startVolume)}}}})})(mejs.$);
(function(f){f.extend(mejs.MepDefaults,{usePluginFullScreen:true,newWindowCallback:function(){return""},fullscreenText:mejs.i18n.t("Fullscreen")});f.extend(MediaElementPlayer.prototype,{isFullScreen:false,isNativeFullScreen:false,isInIframe:false,buildfullscreen:function(a,b,c,e){if(a.isVideo){a.isInIframe=window.location!=window.parent.location;if(mejs.MediaFeatures.hasTrueNativeFullScreen){c=function(){if(a.isFullScreen)if(mejs.MediaFeatures.isFullScreen()){a.isNativeFullScreen=true;a.setControlsSize()}else{a.isNativeFullScreen=
false;a.exitFullScreen()}};mejs.MediaFeatures.hasMozNativeFullScreen?a.globalBind(mejs.MediaFeatures.fullScreenEventName,c):a.container.bind(mejs.MediaFeatures.fullScreenEventName,c)}var d=this,g=f('<div class="mejs-button mejs-fullscreen-button"><button type="button" aria-controls="'+d.id+'" title="'+d.options.fullscreenText+'" aria-label="'+d.options.fullscreenText+'"></button></div>').appendTo(b);if(d.media.pluginType==="native"||!d.options.usePluginFullScreen&&!mejs.MediaFeatures.isFirefox)g.click(function(){mejs.MediaFeatures.hasTrueNativeFullScreen&&
mejs.MediaFeatures.isFullScreen()||a.isFullScreen?a.exitFullScreen():a.enterFullScreen()});else{var k=null;if(function(){var h=document.createElement("x"),l=document.documentElement,r=window.getComputedStyle;if(!("pointerEvents"in h.style))return false;h.style.pointerEvents="auto";h.style.pointerEvents="x";l.appendChild(h);r=r&&r(h,"").pointerEvents==="auto";l.removeChild(h);return!!r}()&&!mejs.MediaFeatures.isOpera){var j=false,m=function(){if(j){for(var h in q)q[h].hide();g.css("pointer-events",
"");d.controls.css("pointer-events","");d.media.removeEventListener("click",d.clickToPlayPauseCallback);j=false}},q={};b=["top","left","right","bottom"];var p,t=function(){var h=g.offset().left-d.container.offset().left,l=g.offset().top-d.container.offset().top,r=g.outerWidth(true),n=g.outerHeight(true),o=d.container.width(),s=d.container.height();for(p in q)q[p].css({position:"absolute",top:0,left:0});q.top.width(o).height(l);q.left.width(h).height(n).css({top:l});q.right.width(o-h-r).height(n).css({top:l,
left:h+r});q.bottom.width(o).height(s-n-l).css({top:l+n})};d.globalBind("resize",function(){t()});p=0;for(c=b.length;p<c;p++)q[b[p]]=f('<div class="mejs-fullscreen-hover" />').appendTo(d.container).mouseover(m).hide();g.on("mouseover",function(){if(!d.isFullScreen){var h=g.offset(),l=a.container.offset();e.positionFullscreenButton(h.left-l.left,h.top-l.top,false);g.css("pointer-events","none");d.controls.css("pointer-events","none");d.media.addEventListener("click",d.clickToPlayPauseCallback);for(p in q)q[p].show();
t();j=true}});e.addEventListener("fullscreenchange",function(){d.isFullScreen=!d.isFullScreen;d.isFullScreen?d.media.removeEventListener("click",d.clickToPlayPauseCallback):d.media.addEventListener("click",d.clickToPlayPauseCallback);m()});d.globalBind("mousemove",function(h){if(j){var l=g.offset();if(h.pageY<l.top||h.pageY>l.top+g.outerHeight(true)||h.pageX<l.left||h.pageX>l.left+g.outerWidth(true)){g.css("pointer-events","");d.controls.css("pointer-events","");j=false}}})}else g.on("mouseover",
function(){if(k!==null){clearTimeout(k);delete k}var h=g.offset(),l=a.container.offset();e.positionFullscreenButton(h.left-l.left,h.top-l.top,true)}).on("mouseout",function(){if(k!==null){clearTimeout(k);delete k}k=setTimeout(function(){e.hideFullscreenButton()},1500)})}a.fullscreenBtn=g;d.globalBind("keydown",function(h){if((mejs.MediaFeatures.hasTrueNativeFullScreen&&mejs.MediaFeatures.isFullScreen()||d.isFullScreen)&&h.keyCode==27)a.exitFullScreen()})}},cleanfullscreen:function(a){a.exitFullScreen()},
containerSizeTimeout:null,enterFullScreen:function(){var a=this;if(!(a.media.pluginType!=="native"&&(mejs.MediaFeatures.isFirefox||a.options.usePluginFullScreen))){f(document.documentElement).addClass("mejs-fullscreen");normalHeight=a.container.height();normalWidth=a.container.width();if(a.media.pluginType==="native")if(mejs.MediaFeatures.hasTrueNativeFullScreen){mejs.MediaFeatures.requestFullScreen(a.container[0]);a.isInIframe&&setTimeout(function c(){if(a.isNativeFullScreen){var e=(window.devicePixelRatio||
1)*f(window).width(),d=screen.width;Math.abs(d-e)>d*0.0020?a.exitFullScreen():setTimeout(c,500)}},500)}else if(mejs.MediaFeatures.hasSemiNativeFullScreen){a.media.webkitEnterFullscreen();return}if(a.isInIframe){var b=a.options.newWindowCallback(this);if(b!=="")if(mejs.MediaFeatures.hasTrueNativeFullScreen)setTimeout(function(){if(!a.isNativeFullScreen){a.pause();window.open(b,a.id,"top=0,left=0,width="+screen.availWidth+",height="+screen.availHeight+",resizable=yes,scrollbars=no,status=no,toolbar=no")}},
250);else{a.pause();window.open(b,a.id,"top=0,left=0,width="+screen.availWidth+",height="+screen.availHeight+",resizable=yes,scrollbars=no,status=no,toolbar=no");return}}a.container.addClass("mejs-container-fullscreen").width("100%").height("100%");a.containerSizeTimeout=setTimeout(function(){a.container.css({width:"100%",height:"100%"});a.setControlsSize()},500);if(a.media.pluginType==="native")a.$media.width("100%").height("100%");else{a.container.find(".mejs-shim").width("100%").height("100%");
a.media.setVideoSize(f(window).width(),f(window).height())}a.layers.children("div").width("100%").height("100%");a.fullscreenBtn&&a.fullscreenBtn.removeClass("mejs-fullscreen").addClass("mejs-unfullscreen");a.setControlsSize();a.isFullScreen=true}},exitFullScreen:function(){clearTimeout(this.containerSizeTimeout);if(this.media.pluginType!=="native"&&mejs.MediaFeatures.isFirefox)this.media.setFullscreen(false);else{if(mejs.MediaFeatures.hasTrueNativeFullScreen&&(mejs.MediaFeatures.isFullScreen()||
this.isFullScreen))mejs.MediaFeatures.cancelFullScreen();f(document.documentElement).removeClass("mejs-fullscreen");this.container.removeClass("mejs-container-fullscreen").width(normalWidth).height(normalHeight);if(this.media.pluginType==="native")this.$media.width(normalWidth).height(normalHeight);else{this.container.find(".mejs-shim").width(normalWidth).height(normalHeight);this.media.setVideoSize(normalWidth,normalHeight)}this.layers.children("div").width(normalWidth).height(normalHeight);this.fullscreenBtn.removeClass("mejs-unfullscreen").addClass("mejs-fullscreen");
this.setControlsSize();this.isFullScreen=false}}})})(mejs.$);
(function(f){f.extend(mejs.MepDefaults,{startLanguage:"",tracksText:mejs.i18n.t("Captions/Subtitles"),hideCaptionsButtonWhenEmpty:true,toggleCaptionsButtonWhenOnlyOne:false,slidesSelector:""});f.extend(MediaElementPlayer.prototype,{hasChapters:false,buildtracks:function(a,b,c,e){if(a.tracks.length!=0){var d;if(this.domNode.textTracks)for(d=this.domNode.textTracks.length-1;d>=0;d--)this.domNode.textTracks[d].mode="hidden";a.chapters=f('<div class="mejs-chapters mejs-layer"></div>').prependTo(c).hide();a.captions=
f('<div class="mejs-captions-layer mejs-layer"><div class="mejs-captions-position mejs-captions-position-hover"><span class="mejs-captions-text"></span></div></div>').prependTo(c).hide();a.captionsText=a.captions.find(".mejs-captions-text");a.captionsButton=f('<div class="mejs-button mejs-captions-button"><button type="button" aria-controls="'+this.id+'" title="'+this.options.tracksText+'" aria-label="'+this.options.tracksText+'"></button><div class="mejs-captions-selector"><ul><li><input type="radio" name="'+
a.id+'_captions" id="'+a.id+'_captions_none" value="none" checked="checked" /><label for="'+a.id+'_captions_none">'+mejs.i18n.t("None")+"</label></li></ul></div></div>").appendTo(b);for(d=b=0;d<a.tracks.length;d++)a.tracks[d].kind=="subtitles"&&b++;this.options.toggleCaptionsButtonWhenOnlyOne&&b==1?a.captionsButton.on("click",function(){a.setTrack(a.selectedTrack==null?a.tracks[0].srclang:"none")}):a.captionsButton.hover(function(){f(this).find(".mejs-captions-selector").css("visibility","visible")},
function(){f(this).find(".mejs-captions-selector").css("visibility","hidden")}).on("click","input[type=radio]",function(){lang=this.value;a.setTrack(lang)});a.options.alwaysShowControls?a.container.find(".mejs-captions-position").addClass("mejs-captions-position-hover"):a.container.bind("controlsshown",function(){a.container.find(".mejs-captions-position").addClass("mejs-captions-position-hover")}).bind("controlshidden",function(){e.paused||a.container.find(".mejs-captions-position").removeClass("mejs-captions-position-hover")});
a.trackToLoad=-1;a.selectedTrack=null;a.isLoadingTrack=false;for(d=0;d<a.tracks.length;d++)a.tracks[d].kind=="subtitles"&&a.addTrackButton(a.tracks[d].srclang,a.tracks[d].label);a.loadNextTrack();e.addEventListener("timeupdate",function(){a.displayCaptions()},false);if(a.options.slidesSelector!=""){a.slidesContainer=f(a.options.slidesSelector);e.addEventListener("timeupdate",function(){a.displaySlides()},false)}e.addEventListener("loadedmetadata",function(){a.displayChapters()},false);a.container.hover(function(){if(a.hasChapters){a.chapters.css("visibility",
"visible");a.chapters.fadeIn(200).height(a.chapters.find(".mejs-chapter").outerHeight())}},function(){a.hasChapters&&!e.paused&&a.chapters.fadeOut(200,function(){f(this).css("visibility","hidden");f(this).css("display","block")})});a.node.getAttribute("autoplay")!==null&&a.chapters.css("visibility","hidden")}},setTrack:function(a){var b;if(a=="none"){this.selectedTrack=null;this.captionsButton.removeClass("mejs-captions-enabled")}else for(b=0;b<this.tracks.length;b++)if(this.tracks[b].srclang==a){this.selectedTrack==
null&&this.captionsButton.addClass("mejs-captions-enabled");this.selectedTrack=this.tracks[b];this.captions.attr("lang",this.selectedTrack.srclang);this.displayCaptions();break}},loadNextTrack:function(){this.trackToLoad++;if(this.trackToLoad<this.tracks.length){this.isLoadingTrack=true;this.loadTrack(this.trackToLoad)}else{this.isLoadingTrack=false;this.checkForTracks()}},loadTrack:function(a){var b=this,c=b.tracks[a];f.ajax({url:c.src,dataType:"text",success:function(e){c.entries=typeof e=="string"&&
/<tt\s+xml/ig.exec(e)?mejs.TrackFormatParser.dfxp.parse(e):mejs.TrackFormatParser.webvvt.parse(e);c.isLoaded=true;b.enableTrackButton(c.srclang,c.label);b.loadNextTrack();c.kind=="chapters"&&b.media.addEventListener("play",function(){b.media.duration>0&&b.displayChapters(c)},false);c.kind=="slides"&&b.setupSlides(c)},error:function(){b.loadNextTrack()}})},enableTrackButton:function(a,b){if(b==="")b=mejs.language.codes[a]||a;this.captionsButton.find("input[value="+a+"]").prop("disabled",false).siblings("label").html(b);
this.options.startLanguage==a&&f("#"+this.id+"_captions_"+a).click();this.adjustLanguageBox()},addTrackButton:function(a,b){if(b==="")b=mejs.language.codes[a]||a;this.captionsButton.find("ul").append(f('<li><input type="radio" name="'+this.id+'_captions" id="'+this.id+"_captions_"+a+'" value="'+a+'" disabled="disabled" /><label for="'+this.id+"_captions_"+a+'">'+b+" (loading)</label></li>"));this.adjustLanguageBox();this.container.find(".mejs-captions-translations option[value="+a+"]").remove()},
adjustLanguageBox:function(){this.captionsButton.find(".mejs-captions-selector").height(this.captionsButton.find(".mejs-captions-selector ul").outerHeight(true)+this.captionsButton.find(".mejs-captions-translations").outerHeight(true))},checkForTracks:function(){var a=false;if(this.options.hideCaptionsButtonWhenEmpty){for(i=0;i<this.tracks.length;i++)if(this.tracks[i].kind=="subtitles"){a=true;break}if(!a){this.captionsButton.hide();this.setControlsSize()}}},displayCaptions:function(){if(typeof this.tracks!=
"undefined"){var a,b=this.selectedTrack;if(b!=null&&b.isLoaded)for(a=0;a<b.entries.times.length;a++)if(this.media.currentTime>=b.entries.times[a].start&&this.media.currentTime<=b.entries.times[a].stop){this.captionsText.html(b.entries.text[a]);this.captions.show().height(0);return}this.captions.hide()}},setupSlides:function(a){this.slides=a;this.slides.entries.imgs=[this.slides.entries.text.length];this.showSlide(0)},showSlide:function(a){if(!(typeof this.tracks=="undefined"||typeof this.slidesContainer==
"undefined")){var b=this,c=b.slides.entries.text[a],e=b.slides.entries.imgs[a];if(typeof e=="undefined"||typeof e.fadeIn=="undefined")b.slides.entries.imgs[a]=e=f('<img src="'+c+'">').on("load",function(){e.appendTo(b.slidesContainer).hide().fadeIn().siblings(":visible").fadeOut()});else!e.is(":visible")&&!e.is(":animated")&&e.fadeIn().siblings(":visible").fadeOut()}},displaySlides:function(){if(typeof this.slides!="undefined"){var a=this.slides,b;for(b=0;b<a.entries.times.length;b++)if(this.media.currentTime>=
a.entries.times[b].start&&this.media.currentTime<=a.entries.times[b].stop){this.showSlide(b);break}}},displayChapters:function(){var a;for(a=0;a<this.tracks.length;a++)if(this.tracks[a].kind=="chapters"&&this.tracks[a].isLoaded){this.drawChapters(this.tracks[a]);this.hasChapters=true;break}},drawChapters:function(a){var b=this,c,e,d=e=0;b.chapters.empty();for(c=0;c<a.entries.times.length;c++){e=a.entries.times[c].stop-a.entries.times[c].start;e=Math.floor(e/b.media.duration*100);if(e+d>100||c==a.entries.times.length-
1&&e+d<100)e=100-d;b.chapters.append(f('<div class="mejs-chapter" rel="'+a.entries.times[c].start+'" style="left: '+d.toString()+"%;width: "+e.toString()+'%;"><div class="mejs-chapter-block'+(c==a.entries.times.length-1?" mejs-chapter-block-last":"")+'"><span class="ch-title">'+a.entries.text[c]+'</span><span class="ch-time">'+mejs.Utility.secondsToTimeCode(a.entries.times[c].start)+"&ndash;"+mejs.Utility.secondsToTimeCode(a.entries.times[c].stop)+"</span></div></div>"));d+=e}b.chapters.find("div.mejs-chapter").click(function(){b.media.setCurrentTime(parseFloat(f(this).attr("rel")));
b.media.paused&&b.media.play()});b.chapters.show()}});mejs.language={codes:{af:"Afrikaans",sq:"Albanian",ar:"Arabic",be:"Belarusian",bg:"Bulgarian",ca:"Catalan",zh:"Chinese","zh-cn":"Chinese Simplified","zh-tw":"Chinese Traditional",hr:"Croatian",cs:"Czech",da:"Danish",nl:"Dutch",en:"English",et:"Estonian",tl:"Filipino",fi:"Finnish",fr:"French",gl:"Galician",de:"German",el:"Greek",ht:"Haitian Creole",iw:"Hebrew",hi:"Hindi",hu:"Hungarian",is:"Icelandic",id:"Indonesian",ga:"Irish",it:"Italian",ja:"Japanese",
ko:"Korean",lv:"Latvian",lt:"Lithuanian",mk:"Macedonian",ms:"Malay",mt:"Maltese",no:"Norwegian",fa:"Persian",pl:"Polish",pt:"Portuguese",ro:"Romanian",ru:"Russian",sr:"Serbian",sk:"Slovak",sl:"Slovenian",es:"Spanish",sw:"Swahili",sv:"Swedish",tl:"Tagalog",th:"Thai",tr:"Turkish",uk:"Ukrainian",vi:"Vietnamese",cy:"Welsh",yi:"Yiddish"}};mejs.TrackFormatParser={webvvt:{pattern_identifier:/^([a-zA-z]+-)?[0-9]+$/,pattern_timecode:/^([0-9]{2}:[0-9]{2}:[0-9]{2}([,.][0-9]{1,3})?) --\> ([0-9]{2}:[0-9]{2}:[0-9]{2}([,.][0-9]{3})?)(.*)$/,
parse:function(a){var b=0;a=mejs.TrackFormatParser.split2(a,/\r?\n/);for(var c={text:[],times:[]},e,d;b<a.length;b++)if(this.pattern_identifier.exec(a[b])){b++;if((e=this.pattern_timecode.exec(a[b]))&&b<a.length){b++;d=a[b];for(b++;a[b]!==""&&b<a.length;){d=d+"\n"+a[b];b++}d=f.trim(d).replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig,"<a href='$1' target='_blank'>$1</a>");c.text.push(d);c.times.push({start:mejs.Utility.convertSMPTEtoSeconds(e[1])==0?0.2:mejs.Utility.convertSMPTEtoSeconds(e[1]),
stop:mejs.Utility.convertSMPTEtoSeconds(e[3]),settings:e[5]})}}return c}},dfxp:{parse:function(a){a=f(a).filter("tt");var b=0;b=a.children("div").eq(0);var c=b.find("p");b=a.find("#"+b.attr("style"));var e,d;a={text:[],times:[]};if(b.length){d=b.removeAttr("id").get(0).attributes;if(d.length){e={};for(b=0;b<d.length;b++)e[d[b].name.split(":")[1]]=d[b].value}}for(b=0;b<c.length;b++){var g;d={start:null,stop:null,style:null};if(c.eq(b).attr("begin"))d.start=mejs.Utility.convertSMPTEtoSeconds(c.eq(b).attr("begin"));
if(!d.start&&c.eq(b-1).attr("end"))d.start=mejs.Utility.convertSMPTEtoSeconds(c.eq(b-1).attr("end"));if(c.eq(b).attr("end"))d.stop=mejs.Utility.convertSMPTEtoSeconds(c.eq(b).attr("end"));if(!d.stop&&c.eq(b+1).attr("begin"))d.stop=mejs.Utility.convertSMPTEtoSeconds(c.eq(b+1).attr("begin"));if(e){g="";for(var k in e)g+=k+":"+e[k]+";"}if(g)d.style=g;if(d.start==0)d.start=0.2;a.times.push(d);d=f.trim(c.eq(b).html()).replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig,
"<a href='$1' target='_blank'>$1</a>");a.text.push(d);if(a.times.start==0)a.times.start=2}return a}},split2:function(a,b){return a.split(b)}};if("x\n\ny".split(/\n/gi).length!=3)mejs.TrackFormatParser.split2=function(a,b){var c=[],e="",d;for(d=0;d<a.length;d++){e+=a.substring(d,d+1);if(b.test(e)){c.push(e.replace(b,""));e=""}}c.push(e);return c}})(mejs.$);
(function(f){f.extend(mejs.MepDefaults,{contextMenuItems:[{render:function(a){if(typeof a.enterFullScreen=="undefined")return null;return a.isFullScreen?mejs.i18n.t("Turn off Fullscreen"):mejs.i18n.t("Go Fullscreen")},click:function(a){a.isFullScreen?a.exitFullScreen():a.enterFullScreen()}},{render:function(a){return a.media.muted?mejs.i18n.t("Unmute"):mejs.i18n.t("Mute")},click:function(a){a.media.muted?a.setMuted(false):a.setMuted(true)}},{isSeparator:true},{render:function(){return mejs.i18n.t("Download Video")},
click:function(a){window.location.href=a.media.currentSrc}}]});f.extend(MediaElementPlayer.prototype,{buildcontextmenu:function(a){a.contextMenu=f('<div class="mejs-contextmenu"></div>').appendTo(f("body")).hide();a.container.bind("contextmenu",function(b){if(a.isContextMenuEnabled){b.preventDefault();a.renderContextMenu(b.clientX-1,b.clientY-1);return false}});a.container.bind("click",function(){a.contextMenu.hide()});a.contextMenu.bind("mouseleave",function(){a.startContextMenuTimer()})},cleancontextmenu:function(a){a.contextMenu.remove()},
isContextMenuEnabled:true,enableContextMenu:function(){this.isContextMenuEnabled=true},disableContextMenu:function(){this.isContextMenuEnabled=false},contextMenuTimeout:null,startContextMenuTimer:function(){var a=this;a.killContextMenuTimer();a.contextMenuTimer=setTimeout(function(){a.hideContextMenu();a.killContextMenuTimer()},750)},killContextMenuTimer:function(){var a=this.contextMenuTimer;if(a!=null){clearTimeout(a);delete a}},hideContextMenu:function(){this.contextMenu.hide()},renderContextMenu:function(a,
b){for(var c=this,e="",d=c.options.contextMenuItems,g=0,k=d.length;g<k;g++)if(d[g].isSeparator)e+='<div class="mejs-contextmenu-separator"></div>';else{var j=d[g].render(c);if(j!=null)e+='<div class="mejs-contextmenu-item" data-itemindex="'+g+'" id="element-'+Math.random()*1E6+'">'+j+"</div>"}c.contextMenu.empty().append(f(e)).css({top:b,left:a}).show();c.contextMenu.find(".mejs-contextmenu-item").each(function(){var m=f(this),q=parseInt(m.data("itemindex"),10),p=c.options.contextMenuItems[q];typeof p.show!=
"undefined"&&p.show(m,c);m.click(function(){typeof p.click!="undefined"&&p.click(c);c.contextMenu.hide()})});setTimeout(function(){c.killControlsTimer("rev3")},100)}})})(mejs.$);
(function(f){f.extend(mejs.MepDefaults,{postrollCloseText:mejs.i18n.t("Close")});f.extend(MediaElementPlayer.prototype,{buildpostroll:function(a,b,c){var e=this.container.find('link[rel="postroll"]').attr("href");if(typeof e!=="undefined"){a.postroll=f('<div class="mejs-postroll-layer mejs-layer"><a class="mejs-postroll-close" onclick="$(this).parent().hide();return false;">'+this.options.postrollCloseText+'</a><div class="mejs-postroll-layer-content"></div></div>').prependTo(c).hide();this.media.addEventListener("ended",
function(){f.ajax({dataType:"html",url:e,success:function(d){c.find(".mejs-postroll-layer-content").html(d)}});a.postroll.show()},false)}}})})(mejs.$);

;
/*! Copyright (c) 2013 Brandon Aaron (http://brandon.aaron.sh)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Version: 3.1.9
 *
 * Requires: jQuery 1.2.2+
 */

(function (factory) {
  if ( typeof define === 'function' && define.amd ) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    // Node/CommonJS style for Browserify
    module.exports = factory;
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function ($) {

  var toFix  = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
    toBind = ( 'onwheel' in document || document.documentMode >= 9 ) ?
      ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
    slice  = Array.prototype.slice,
    nullLowestDeltaTimeout, lowestDelta;

  if ( $.event.fixHooks ) {
    for ( var i = toFix.length; i; ) {
      $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
    }
  }

  var special = $.event.special.mousewheel = {
    version: '3.1.9',

    setup: function() {
      if ( this.addEventListener ) {
        for ( var i = toBind.length; i; ) {
          this.addEventListener( toBind[--i], handler, false );
        }
      } else {
        this.onmousewheel = handler;
      }
      // Store the line height and page height for this particular element
      $.data(this, 'mousewheel-line-height', special.getLineHeight(this));
      $.data(this, 'mousewheel-page-height', special.getPageHeight(this));
    },

    teardown: function() {
      if ( this.removeEventListener ) {
        for ( var i = toBind.length; i; ) {
          this.removeEventListener( toBind[--i], handler, false );
        }
      } else {
        this.onmousewheel = null;
      }
    },

    getLineHeight: function(elem) {
      return parseInt($(elem)['offsetParent' in $.fn ? 'offsetParent' : 'parent']().css('fontSize'), 10);
    },

    getPageHeight: function(elem) {
      return $(elem).height();
    },

    settings: {
      adjustOldDeltas: true
    }
  };

  $.fn.extend({
    mousewheel: function(fn) {
      return fn ? this.bind('mousewheel', fn) : this.trigger('mousewheel');
    },

    unmousewheel: function(fn) {
      return this.unbind('mousewheel', fn);
    }
  });


  function handler(event) {
    var orgEvent   = event || window.event,
      args       = slice.call(arguments, 1),
      delta      = 0,
      deltaX     = 0,
      deltaY     = 0,
      absDelta   = 0;
    event = $.event.fix(orgEvent);
    event.type = 'mousewheel';

    // Old school scrollwheel delta
    if ( 'detail'      in orgEvent ) { deltaY = orgEvent.detail * -1;      }
    if ( 'wheelDelta'  in orgEvent ) { deltaY = orgEvent.wheelDelta;       }
    if ( 'wheelDeltaY' in orgEvent ) { deltaY = orgEvent.wheelDeltaY;      }
    if ( 'wheelDeltaX' in orgEvent ) { deltaX = orgEvent.wheelDeltaX * -1; }

    // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
    if ( 'axis' in orgEvent && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
      deltaX = deltaY * -1;
      deltaY = 0;
    }

    // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
    delta = deltaY === 0 ? deltaX : deltaY;

    // New school wheel delta (wheel event)
    if ( 'deltaY' in orgEvent ) {
      deltaY = orgEvent.deltaY * -1;
      delta  = deltaY;
    }
    if ( 'deltaX' in orgEvent ) {
      deltaX = orgEvent.deltaX;
      if ( deltaY === 0 ) { delta  = deltaX * -1; }
    }

    // No change actually happened, no reason to go any further
    if ( deltaY === 0 && deltaX === 0 ) { return; }

    // Need to convert lines and pages to pixels if we aren't already in pixels
    // There are three delta modes:
    //   * deltaMode 0 is by pixels, nothing to do
    //   * deltaMode 1 is by lines
    //   * deltaMode 2 is by pages
    if ( orgEvent.deltaMode === 1 ) {
      var lineHeight = $.data(this, 'mousewheel-line-height');
      delta  *= lineHeight;
      deltaY *= lineHeight;
      deltaX *= lineHeight;
    } else if ( orgEvent.deltaMode === 2 ) {
      var pageHeight = $.data(this, 'mousewheel-page-height');
      delta  *= pageHeight;
      deltaY *= pageHeight;
      deltaX *= pageHeight;
    }

    // Store lowest absolute delta to normalize the delta values
    absDelta = Math.max( Math.abs(deltaY), Math.abs(deltaX) );

    if ( !lowestDelta || absDelta < lowestDelta ) {
      lowestDelta = absDelta;

      // Adjust older deltas if necessary
      if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
        lowestDelta /= 40;
      }
    }

    // Adjust older deltas if necessary
    if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
      // Divide all the things by 40!
      delta  /= 40;
      deltaX /= 40;
      deltaY /= 40;
    }

    // Get a whole, normalized value for the deltas
    delta  = Math[ delta  >= 1 ? 'floor' : 'ceil' ](delta  / lowestDelta);
    deltaX = Math[ deltaX >= 1 ? 'floor' : 'ceil' ](deltaX / lowestDelta);
    deltaY = Math[ deltaY >= 1 ? 'floor' : 'ceil' ](deltaY / lowestDelta);

    // Add information to the event object
    event.deltaX = deltaX;
    event.deltaY = deltaY;
    event.deltaFactor = lowestDelta;
    // Go ahead and set deltaMode to 0 since we converted to pixels
    // Although this is a little odd since we overwrite the deltaX/Y
    // properties with normalized deltas.
    event.deltaMode = 0;

    // Add event and delta to the front of the arguments
    args.unshift(event, delta, deltaX, deltaY);

    // Clearout lowestDelta after sometime to better
    // handle multiple device types that give different
    // a different lowestDelta
    // Ex: trackpad = 3 and mouse wheel = 120
    if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
    nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);

    return ($.event.dispatch || $.event.handle).apply(this, args);
  }

  function nullLowestDelta() {
    lowestDelta = null;
  }

  function shouldAdjustOldDeltas(orgEvent, absDelta) {
    // If this is an older event and the delta is divisable by 120,
    // then we are assuming that the browser is treating this as an
    // older mouse wheel event and that we should divide the deltas
    // by 40 to try and get a more usable deltaFactor.
    // Side note, this actually impacts the reported scroll distance
    // in older browsers and can cause scrolling to be slower than native.
    // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
    return special.settings.adjustOldDeltas && orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
  }

}));



/*
 * jScrollPane - v2.0.20 - 2014-10-23
 * http://jscrollpane.kelvinluck.com/
 *
 * Copyright (c) 2014 Kelvin Luck
 * Dual licensed under the MIT or GPL licenses.
 */
(function(c,b){var a=function(d){return c(d,b)};if(typeof define==="function"&&define.amd){define(["jquery"],a)}else{if(typeof exports==="object"){module.exports=a}else{a(jQuery)}}}(function(b,a,c){b.fn.jScrollPane=function(e){function d(D,O){var ay,Q=this,Y,aj,v,al,T,Z,y,q,az,aE,au,i,I,h,j,aa,U,ap,X,t,A,aq,af,am,G,l,at,ax,x,av,aH,f,L,ai=true,P=true,aG=false,k=false,ao=D.clone(false,false).empty(),ac=b.fn.mwheelIntent?"mwheelIntent.jsp":"mousewheel.jsp";if(D.css("box-sizing")==="border-box"){aH=0;f=0}else{aH=D.css("paddingTop")+" "+D.css("paddingRight")+" "+D.css("paddingBottom")+" "+D.css("paddingLeft");f=(parseInt(D.css("paddingLeft"),10)||0)+(parseInt(D.css("paddingRight"),10)||0)}function ar(aQ){var aL,aN,aM,aJ,aI,aP,aO=false,aK=false;ay=aQ;if(Y===c){aI=D.scrollTop();aP=D.scrollLeft();D.css({overflow:"hidden",padding:0});aj=D.innerWidth()+f;v=D.innerHeight();D.width(aj);Y=b('<div class="jspPane" />').css("padding",aH).append(D.children());al=b('<div class="jspContainer" />').css({width:aj+"px",height:v+"px"}).append(Y).appendTo(D)}else{D.css("width","");aO=ay.stickToBottom&&K();aK=ay.stickToRight&&B();aJ=D.innerWidth()+f!=aj||D.outerHeight()!=v;if(aJ){aj=D.innerWidth()+f;v=D.innerHeight();al.css({width:aj+"px",height:v+"px"})}if(!aJ&&L==T&&Y.outerHeight()==Z){D.width(aj);return}L=T;Y.css("width","");D.width(aj);al.find(">.jspVerticalBar,>.jspHorizontalBar").remove().end()}Y.css("overflow","auto");if(aQ.contentWidth){T=aQ.contentWidth}else{T=Y[0].scrollWidth}Z=Y[0].scrollHeight;Y.css("overflow","");y=T/aj;q=Z/v;az=q>1;aE=y>1;if(!(aE||az)){D.removeClass("jspScrollable");Y.css({top:0,left:0,width:al.width()-f});n();E();R();w()}else{D.addClass("jspScrollable");aL=ay.maintainPosition&&(I||aa);if(aL){aN=aC();aM=aA()}aF();z();F();if(aL){N(aK?(T-aj):aN,false);M(aO?(Z-v):aM,false)}J();ag();an();if(ay.enableKeyboardNavigation){S()}if(ay.clickOnTrack){p()}C();if(ay.hijackInternalLinks){m()}}if(ay.autoReinitialise&&!av){av=setInterval(function(){ar(ay)},ay.autoReinitialiseDelay)}else{if(!ay.autoReinitialise&&av){clearInterval(av)}}aI&&D.scrollTop(0)&&M(aI,false);aP&&D.scrollLeft(0)&&N(aP,false);D.trigger("jsp-initialised",[aE||az])}function aF(){if(az){al.append(b('<div class="jspVerticalBar" />').append(b('<div class="jspCap jspCapTop" />'),b('<div class="jspTrack" />').append(b('<div class="jspDrag" />').append(b('<div class="jspDragTop" />'),b('<div class="jspDragBottom" />'))),b('<div class="jspCap jspCapBottom" />')));U=al.find(">.jspVerticalBar");ap=U.find(">.jspTrack");au=ap.find(">.jspDrag");if(ay.showArrows){aq=b('<a class="jspArrow jspArrowUp" />').bind("mousedown.jsp",aD(0,-1)).bind("click.jsp",aB);af=b('<a class="jspArrow jspArrowDown" />').bind("mousedown.jsp",aD(0,1)).bind("click.jsp",aB);if(ay.arrowScrollOnHover){aq.bind("mouseover.jsp",aD(0,-1,aq));af.bind("mouseover.jsp",aD(0,1,af))}ak(ap,ay.verticalArrowPositions,aq,af)}t=v;al.find(">.jspVerticalBar>.jspCap:visible,>.jspVerticalBar>.jspArrow").each(function(){t-=b(this).outerHeight()});au.hover(function(){au.addClass("jspHover")},function(){au.removeClass("jspHover")}).bind("mousedown.jsp",function(aI){b("html").bind("dragstart.jsp selectstart.jsp",aB);au.addClass("jspActive");var s=aI.pageY-au.position().top;b("html").bind("mousemove.jsp",function(aJ){V(aJ.pageY-s,false)}).bind("mouseup.jsp mouseleave.jsp",aw);return false});o()}}function o(){ap.height(t+"px");I=0;X=ay.verticalGutter+ap.outerWidth();Y.width(aj-X-f);try{if(U.position().left===0){Y.css("margin-left",X+"px")}}catch(s){}}function z(){if(aE){al.append(b('<div class="jspHorizontalBar" />').append(b('<div class="jspCap jspCapLeft" />'),b('<div class="jspTrack" />').append(b('<div class="jspDrag" />').append(b('<div class="jspDragLeft" />'),b('<div class="jspDragRight" />'))),b('<div class="jspCap jspCapRight" />')));am=al.find(">.jspHorizontalBar");
  G=am.find(">.jspTrack");h=G.find(">.jspDrag");if(ay.showArrows){ax=b('<a class="jspArrow jspArrowLeft" />').bind("mousedown.jsp",aD(-1,0)).bind("click.jsp",aB);x=b('<a class="jspArrow jspArrowRight" />').bind("mousedown.jsp",aD(1,0)).bind("click.jsp",aB);if(ay.arrowScrollOnHover){ax.bind("mouseover.jsp",aD(-1,0,ax));x.bind("mouseover.jsp",aD(1,0,x))}ak(G,ay.horizontalArrowPositions,ax,x)}h.hover(function(){h.addClass("jspHover")},function(){h.removeClass("jspHover")}).bind("mousedown.jsp",function(aI){b("html").bind("dragstart.jsp selectstart.jsp",aB);h.addClass("jspActive");var s=aI.pageX-h.position().left;b("html").bind("mousemove.jsp",function(aJ){W(aJ.pageX-s,false)}).bind("mouseup.jsp mouseleave.jsp",aw);return false});l=al.innerWidth();ah()}}function ah(){al.find(">.jspHorizontalBar>.jspCap:visible,>.jspHorizontalBar>.jspArrow").each(function(){l-=b(this).outerWidth()});G.width(l+"px");aa=0}function F(){if(aE&&az){var aI=G.outerHeight(),s=ap.outerWidth();t-=aI;b(am).find(">.jspCap:visible,>.jspArrow").each(function(){l+=b(this).outerWidth()});l-=s;v-=s;aj-=aI;G.parent().append(b('<div class="jspCorner" />').css("width",aI+"px"));o();ah()}if(aE){Y.width((al.outerWidth()-f)+"px")}Z=Y.outerHeight();q=Z/v;if(aE){at=Math.ceil(1/y*l);if(at>ay.horizontalDragMaxWidth){at=ay.horizontalDragMaxWidth}else{if(at<ay.horizontalDragMinWidth){at=ay.horizontalDragMinWidth}}h.width(at+"px");j=l-at;ae(aa)}if(az){A=Math.ceil(1/q*t);if(A>ay.verticalDragMaxHeight){A=ay.verticalDragMaxHeight}else{if(A<ay.verticalDragMinHeight){A=ay.verticalDragMinHeight}}au.height(A+"px");i=t-A;ad(I)}}function ak(aJ,aL,aI,s){var aN="before",aK="after",aM;if(aL=="os"){aL=/Mac/.test(navigator.platform)?"after":"split"}if(aL==aN){aK=aL}else{if(aL==aK){aN=aL;aM=aI;aI=s;s=aM}}aJ[aN](aI)[aK](s)}function aD(aI,s,aJ){return function(){H(aI,s,this,aJ);this.blur();return false}}function H(aL,aK,aO,aN){aO=b(aO).addClass("jspActive");var aM,aJ,aI=true,s=function(){if(aL!==0){Q.scrollByX(aL*ay.arrowButtonSpeed)}if(aK!==0){Q.scrollByY(aK*ay.arrowButtonSpeed)}aJ=setTimeout(s,aI?ay.initialDelay:ay.arrowRepeatFreq);aI=false};s();aM=aN?"mouseout.jsp":"mouseup.jsp";aN=aN||b("html");aN.bind(aM,function(){aO.removeClass("jspActive");aJ&&clearTimeout(aJ);aJ=null;aN.unbind(aM)})}function p(){w();if(az){ap.bind("mousedown.jsp",function(aN){if(aN.originalTarget===c||aN.originalTarget==aN.currentTarget){var aL=b(this),aO=aL.offset(),aM=aN.pageY-aO.top-I,aJ,aI=true,s=function(){var aR=aL.offset(),aS=aN.pageY-aR.top-A/2,aP=v*ay.scrollPagePercent,aQ=i*aP/(Z-v);if(aM<0){if(I-aQ>aS){Q.scrollByY(-aP)}else{V(aS)}}else{if(aM>0){if(I+aQ<aS){Q.scrollByY(aP)}else{V(aS)}}else{aK();return}}aJ=setTimeout(s,aI?ay.initialDelay:ay.trackClickRepeatFreq);aI=false},aK=function(){aJ&&clearTimeout(aJ);aJ=null;b(document).unbind("mouseup.jsp",aK)};s();b(document).bind("mouseup.jsp",aK);return false}})}if(aE){G.bind("mousedown.jsp",function(aN){if(aN.originalTarget===c||aN.originalTarget==aN.currentTarget){var aL=b(this),aO=aL.offset(),aM=aN.pageX-aO.left-aa,aJ,aI=true,s=function(){var aR=aL.offset(),aS=aN.pageX-aR.left-at/2,aP=aj*ay.scrollPagePercent,aQ=j*aP/(T-aj);if(aM<0){if(aa-aQ>aS){Q.scrollByX(-aP)}else{W(aS)}}else{if(aM>0){if(aa+aQ<aS){Q.scrollByX(aP)}else{W(aS)}}else{aK();return}}aJ=setTimeout(s,aI?ay.initialDelay:ay.trackClickRepeatFreq);aI=false},aK=function(){aJ&&clearTimeout(aJ);aJ=null;b(document).unbind("mouseup.jsp",aK)};s();b(document).bind("mouseup.jsp",aK);return false}})}}function w(){if(G){G.unbind("mousedown.jsp")}if(ap){ap.unbind("mousedown.jsp")}}function aw(){b("html").unbind("dragstart.jsp selectstart.jsp mousemove.jsp mouseup.jsp mouseleave.jsp");if(au){au.removeClass("jspActive")}if(h){h.removeClass("jspActive")}}function V(s,aI){if(!az){return}if(s<0){s=0}else{if(s>i){s=i}}if(aI===c){aI=ay.animateScroll}if(aI){Q.animate(au,"top",s,ad)}else{au.css("top",s);ad(s)}}function ad(aI){if(aI===c){aI=au.position().top}al.scrollTop(0);I=aI||0;var aL=I===0,aJ=I==i,aK=aI/i,s=-aK*(Z-v);if(ai!=aL||aG!=aJ){ai=aL;
  aG=aJ;D.trigger("jsp-arrow-change",[ai,aG,P,k])}u(aL,aJ);Y.css("top",s);D.trigger("jsp-scroll-y",[-s,aL,aJ]).trigger("scroll")}function W(aI,s){if(!aE){return}if(aI<0){aI=0}else{if(aI>j){aI=j}}if(s===c){s=ay.animateScroll}if(s){Q.animate(h,"left",aI,ae)}else{h.css("left",aI);ae(aI)}}function ae(aI){if(aI===c){aI=h.position().left}al.scrollTop(0);aa=aI||0;var aL=aa===0,aK=aa==j,aJ=aI/j,s=-aJ*(T-aj);if(P!=aL||k!=aK){P=aL;k=aK;D.trigger("jsp-arrow-change",[ai,aG,P,k])}r(aL,aK);Y.css("left",s);D.trigger("jsp-scroll-x",[-s,aL,aK]).trigger("scroll")}function u(aI,s){if(ay.showArrows){aq[aI?"addClass":"removeClass"]("jspDisabled");af[s?"addClass":"removeClass"]("jspDisabled")}}function r(aI,s){if(ay.showArrows){ax[aI?"addClass":"removeClass"]("jspDisabled");x[s?"addClass":"removeClass"]("jspDisabled")}}function M(s,aI){var aJ=s/(Z-v);V(aJ*i,aI)}function N(aI,s){var aJ=aI/(T-aj);W(aJ*j,s)}function ab(aV,aQ,aJ){var aN,aK,aL,s=0,aU=0,aI,aP,aO,aS,aR,aT;try{aN=b(aV)}catch(aM){return}aK=aN.outerHeight();aL=aN.outerWidth();al.scrollTop(0);al.scrollLeft(0);while(!aN.is(".jspPane")){s+=aN.position().top;aU+=aN.position().left;aN=aN.offsetParent();if(/^body|html$/i.test(aN[0].nodeName)){return}}aI=aA();aO=aI+v;if(s<aI||aQ){aR=s-ay.horizontalGutter}else{if(s+aK>aO){aR=s-v+aK+ay.horizontalGutter}}if(!isNaN(aR)){M(aR,aJ)}aP=aC();aS=aP+aj;if(aU<aP||aQ){aT=aU-ay.horizontalGutter}else{if(aU+aL>aS){aT=aU-aj+aL+ay.horizontalGutter}}if(!isNaN(aT)){N(aT,aJ)}}function aC(){return -Y.position().left}function aA(){return -Y.position().top}function K(){var s=Z-v;return(s>20)&&(s-aA()<10)}function B(){var s=T-aj;return(s>20)&&(s-aC()<10)}function ag(){al.unbind(ac).bind(ac,function(aM,aN,aK,aI){if(!aa){aa=0}if(!I){I=0}var aJ=aa,s=I,aL=aM.deltaFactor||ay.mouseWheelSpeed;Q.scrollBy(aK*aL,-aI*aL,false);return aJ==aa&&s==I})}function n(){al.unbind(ac)}function aB(){return false}function J(){Y.find(":input,a").unbind("focus.jsp").bind("focus.jsp",function(s){ab(s.target,false)})}function E(){Y.find(":input,a").unbind("focus.jsp")}function S(){var s,aI,aK=[];aE&&aK.push(am[0]);az&&aK.push(U[0]);Y.focus(function(){D.focus()});D.attr("tabindex",0).unbind("keydown.jsp keypress.jsp").bind("keydown.jsp",function(aN){if(aN.target!==this&&!(aK.length&&b(aN.target).closest(aK).length)){return}var aM=aa,aL=I;switch(aN.keyCode){case 40:case 38:case 34:case 32:case 33:case 39:case 37:s=aN.keyCode;aJ();break;case 35:M(Z-v);s=null;break;case 36:M(0);s=null;break}aI=aN.keyCode==s&&aM!=aa||aL!=I;return !aI}).bind("keypress.jsp",function(aL){if(aL.keyCode==s){aJ()}return !aI});if(ay.hideFocus){D.css("outline","none");if("hideFocus" in al[0]){D.attr("hideFocus",true)}}else{D.css("outline","");if("hideFocus" in al[0]){D.attr("hideFocus",false)}}function aJ(){var aM=aa,aL=I;switch(s){case 40:Q.scrollByY(ay.keyboardSpeed,false);break;case 38:Q.scrollByY(-ay.keyboardSpeed,false);break;case 34:case 32:Q.scrollByY(v*ay.scrollPagePercent,false);break;case 33:Q.scrollByY(-v*ay.scrollPagePercent,false);break;case 39:Q.scrollByX(ay.keyboardSpeed,false);break;case 37:Q.scrollByX(-ay.keyboardSpeed,false);break}aI=aM!=aa||aL!=I;return aI}}function R(){D.attr("tabindex","-1").removeAttr("tabindex").unbind("keydown.jsp keypress.jsp")}function C(){if(location.hash&&location.hash.length>1){var aK,aI,aJ=escape(location.hash.substr(1));try{aK=b("#"+aJ+', a[name="'+aJ+'"]')}catch(s){return}if(aK.length&&Y.find(aJ)){if(al.scrollTop()===0){aI=setInterval(function(){if(al.scrollTop()>0){ab(aK,true);b(document).scrollTop(al.position().top);clearInterval(aI)}},50)}else{ab(aK,true);b(document).scrollTop(al.position().top)}}}}function m(){if(b(document.body).data("jspHijack")){return}b(document.body).data("jspHijack",true);b(document.body).delegate("a[href*=#]","click",function(s){var aI=this.href.substr(0,this.href.indexOf("#")),aK=location.href,aO,aP,aJ,aM,aL,aN;if(location.href.indexOf("#")!==-1){aK=location.href.substr(0,location.href.indexOf("#"))}if(aI!==aK){return}aO=escape(this.href.substr(this.href.indexOf("#")+1));
  aP;try{aP=b("#"+aO+', a[name="'+aO+'"]')}catch(aQ){return}if(!aP.length){return}aJ=aP.closest(".jspScrollable");aM=aJ.data("jsp");aM.scrollToElement(aP,true);if(aJ[0].scrollIntoView){aL=b(a).scrollTop();aN=aP.offset().top;if(aN<aL||aN>aL+b(a).height()){aJ[0].scrollIntoView()}}s.preventDefault()})}function an(){var aJ,aI,aL,aK,aM,s=false;al.unbind("touchstart.jsp touchmove.jsp touchend.jsp click.jsp-touchclick").bind("touchstart.jsp",function(aN){var aO=aN.originalEvent.touches[0];aJ=aC();aI=aA();aL=aO.pageX;aK=aO.pageY;aM=false;s=true}).bind("touchmove.jsp",function(aQ){if(!s){return}var aP=aQ.originalEvent.touches[0],aO=aa,aN=I;Q.scrollTo(aJ+aL-aP.pageX,aI+aK-aP.pageY);aM=aM||Math.abs(aL-aP.pageX)>5||Math.abs(aK-aP.pageY)>5;return aO==aa&&aN==I}).bind("touchend.jsp",function(aN){s=false}).bind("click.jsp-touchclick",function(aN){if(aM){aM=false;return false}})}function g(){var s=aA(),aI=aC();D.removeClass("jspScrollable").unbind(".jsp");D.replaceWith(ao.append(Y.children()));ao.scrollTop(s);ao.scrollLeft(aI);if(av){clearInterval(av)}}b.extend(Q,{reinitialise:function(aI){aI=b.extend({},ay,aI);ar(aI)},scrollToElement:function(aJ,aI,s){ab(aJ,aI,s)},scrollTo:function(aJ,s,aI){N(aJ,aI);M(s,aI)},scrollToX:function(aI,s){N(aI,s)},scrollToY:function(s,aI){M(s,aI)},scrollToPercentX:function(aI,s){N(aI*(T-aj),s)},scrollToPercentY:function(aI,s){M(aI*(Z-v),s)},scrollBy:function(aI,s,aJ){Q.scrollByX(aI,aJ);Q.scrollByY(s,aJ)},scrollByX:function(s,aJ){var aI=aC()+Math[s<0?"floor":"ceil"](s),aK=aI/(T-aj);W(aK*j,aJ)},scrollByY:function(s,aJ){var aI=aA()+Math[s<0?"floor":"ceil"](s),aK=aI/(Z-v);V(aK*i,aJ)},positionDragX:function(s,aI){W(s,aI)},positionDragY:function(aI,s){V(aI,s)},animate:function(aI,aL,s,aK){var aJ={};aJ[aL]=s;aI.animate(aJ,{duration:ay.animateDuration,easing:ay.animateEase,queue:false,step:aK})},getContentPositionX:function(){return aC()},getContentPositionY:function(){return aA()},getContentWidth:function(){return T},getContentHeight:function(){return Z},getPercentScrolledX:function(){return aC()/(T-aj)},getPercentScrolledY:function(){return aA()/(Z-v)},getIsScrollableH:function(){return aE},getIsScrollableV:function(){return az},getContentPane:function(){return Y},scrollToBottom:function(s){V(i,s)},hijackInternalLinks:b.noop,destroy:function(){g()}});ar(O)}e=b.extend({},b.fn.jScrollPane.defaults,e);b.each(["arrowButtonSpeed","trackClickSpeed","keyboardSpeed"],function(){e[this]=e[this]||e.speed});return this.each(function(){var f=b(this),g=f.data("jsp");if(g){g.reinitialise(e)}else{b("script",f).filter('[type="text/javascript"],:not([type])').remove();g=new d(f,e);f.data("jsp",g)}})};b.fn.jScrollPane.defaults={showArrows:false,maintainPosition:true,stickToBottom:false,stickToRight:false,clickOnTrack:true,autoReinitialise:false,autoReinitialiseDelay:500,verticalDragMinHeight:0,verticalDragMaxHeight:99999,horizontalDragMinWidth:0,horizontalDragMaxWidth:99999,contentWidth:c,animateScroll:false,animateDuration:300,animateEase:"linear",hijackInternalLinks:false,verticalGutter:4,horizontalGutter:4,mouseWheelSpeed:3,arrowButtonSpeed:0,arrowRepeatFreq:50,arrowScrollOnHover:false,trackClickSpeed:0,trackClickRepeatFreq:70,verticalArrowPositions:"split",horizontalArrowPositions:"split",enableKeyboardNavigation:true,hideFocus:false,keyboardSpeed:0,initialDelay:300,speed:30,scrollPagePercent:0.8}},this));;
jQuery.noConflict();

(function ($) {

    Drupal.behaviors.tbp = {}
    Drupal.behaviors.tbp.attach = function (context, settings) {

        $('.focuspoint').focusPoint({
            throttleDuration: 5
        });

        var tooltipster_reload = function () {

            var watchlater = Drupal.settings.mediamosa_general.watch_later;

            $('.anon-user .tooltip').tooltipster();

            $(".auth-user .watch_later.checked").tooltipster({
                content: $("<span>" + watchlater + "</span>")
            });

            $(".auth-user .watch_later").tooltipster({
                content: $("<span>" + watchlater + "</span>")
            });

            $(".reply_btn").tooltipster({
                content: $("<div style='text-align:center'>Antwoorden op reactie</div>"),
                contentAsHTML: true
            });

            $("#download-image").tooltipster({
                content: $("<div style='min-width:130px;text-align:center;'>" + Drupal.t('Download this page') + "</div>")
            });

            $("#download-package").tooltipster({
                content: $("<div style='min-width:230px;text-align:center;'>" + Drupal.t('Download document as package') + "</div>")
            });
        };

        tooltipster_reload();

        $('a.watch_later').click(function (e) {
            $(".watch_later").tooltipster('destroy');
            tooltipster_reload();
        });

        var isActive = 0;
        $(".grid-action").each(function () {
            if ($(this).hasClass("active")) {
                return false;
            } else {
                isActive++;
                if (isActive == 3) {
                    $.ajax({
                        type: "post",
                        url: "/user_set_grid_preference",
                        dataType: "json",
                        data: {
                            view_mode: "detail"
                        }
                    }).done(function (data) {
                        window.location.reload();
                    });
                }
            }
        }).click(function (e) {
            e.preventDefault();
            $.ajax({
                type: "post",
                url: "/user_set_grid_preference",
                dataType: "json",
                data: {
                    view_mode: $(this).attr("data-viewmode")
                }
            }).done(function (data) {
                window.location.reload();
            });
        });

        $("body.auth-user .main-menu .main-menu li:last-of-type > a").click(function (e) {
            e.preventDefault();
            $('.user-dropdown').slideToggle('fast');
        });

        $(".edit-collection-button").click(function () {
            $('.collection-edit').toggle();
        });

        $(".show-collection-button").click(function () {
            $('.collection-edit').toggle();
        });

        $(".hulp-nodig, .search-help-text .close").click(function (e) {
            e.preventDefault();
            $('.search-help-text').toggle();
        });

        $('textarea').each(function () {
            if ($(this).val().length == 0) {
                $(this).trigger('autosize.destroy');
            }

            $(this).on('focus', function () {
                $(this).autosize();
            });

            $(this).on('focusout', function () {
                if ($(this).val().length == 0) {
                    $(this).trigger('autosize.destroy');
                }
            });
        });

        $('#search-block-form input[type="text"]').each(function () {
            if ($(this).val().length == 0) {
                $('.hulp-nodig').show();
                $(this).closest('form').find('input[type="submit"]').fadeOut('fast');
            } else {
                $('.hulp-nodig').hide();
                $(this).closest('form').find('input[type="submit"]').fadeIn('fast');
            }
        }).keyup(function () {
            if ($(this).val().length > 0) {
                $('.hulp-nodig').hide();
                $(this).closest('form').find('input[type="submit"]').fadeIn('fast');
            } else {
                $('.hulp-nodig').show();
                $(this).closest('form').find('input[type="submit"]').fadeOut('fast');
            }
        }).blur(function () {
            if ($(this).val().length == 0) {
                $('.hulp-nodig').fadeIn('fast');
            }
        });

        /* ·
         $('#mediamosa-search-form-filters').each(function(){
         var leftHeight = $('#mediamosa-search-form-filters').outerHeight();
         var rightHeight = $('.asset-grid').outerHeight();

         if(leftHeight != rightHeight){
         // Do nothing
         if(leftHeight > rightHeight){
         $('.asset-grid').css({height: leftHeight -80});
         } else {
         $('#mediamosa-search-form-filters').css({height: rightHeight +80});
         }
         }
         });*/

        $('.form-wrapper').each(function () {
            var $formWrapper = $(this);
            $formWrapper.find('label').each(function () {
                $(this).next('input').attr('placeholder', $(this).text());
                $(this).hide();
            });
        });

        $('.user-collections').each(function () {
            var leftHeight = $('.user-menu').outerHeight();
            var rightHeight = $('.user-collections').outerHeight();

            if (leftHeight != rightHeight) {
                // Do nothing
                if (leftHeight > rightHeight) {
                    $('.asset-grid-wrapper').css({
                        height: leftHeight
                    });
                } else {
                    $('.user-menu').css({
                        height: rightHeight
                    });
                }
            }
        });

        $('#user-profile-form').each(function () {
            var leftHeight = $('.user-menu').outerHeight();
            var rightHeight = $('#user-profile-form').outerHeight();

            if (leftHeight != rightHeight) {
                // Do nothing
                if (leftHeight > rightHeight) {
                    $('#user-profile-form').css({
                        height: leftHeight
                    });
                } else {
                    $('.user-menu').css({
                        height: rightHeight
                    });
                }
            }
        });

        var $win = $(window);
        $win.scroll(function () {
            if ($win.scrollTop() > 0) {
                if ($win.scrollTop() <= 53) {
                    if ($('.header-navigation .main-menu .user-dropdown').css('display') === 'block') {
                        $('.header-navigation .main-menu .user-dropdown').css('display', 'none');
                    }
                }
                $('.header-navigation').removeClass('scrollDown-reset').addClass('scrollDown');
                $('.search_form').addClass('scrollDown');
                $('.language-switcher').addClass('scrollDown');
                $('.header-navigation.scrollDown .main-menu nav ul.menu-visible').css('position', 'absolute');
                $('.hulp-nodig').addClass('scrollDown');
            } else {
                $('.header-navigation').removeClass('scrollDown').addClass('scrollDown-reset');
                $('.search_form').removeClass('scrollDown');
                $('.language-switcher').removeClass('scrollDown');
                $('.hulp-nodig').removeClass('scrollDown');
                $('.header-navigation ul').removeClass('menu-visible');
                $('.header-navigation .main-menu nav ul').css('position', 'inherit');
                $('.header-navigation .main-menu .user-dropdown').css('display', 'none');
            }
        });

        if ($('.header-navigation ul').length > 0) {
            $('.header-navigation h2.title').click(function () {
                $('.header-navigation ul').toggleClass("menu-visible").css('position', 'absolute');
                if ($('.header-navigation .main-menu .user-dropdown').css('display') === 'block') {
                    $('.header-navigation .main-menu .user-dropdown').css('display', 'none');
                }
                return false;
            });
        }

        $('select#pagechoice, select#flag-type, select#edit-selected-collection, select#edit-sort-by').select2({
            minimumResultsForSearch: 8,
            theme: 'archief',
            width: 'resolve'
        });

        $('.asset-teaser-content').each(function () {
            var container = $(this).parent();
            var asset = container.find(".asset-info");
            var assetHeight = asset.height();
            if (!container.hasClass("asset-teaser-detail")) {
                asset.addClass("asset-opacity").height(assetHeight - 13);
            }
            container.find(".asset-teaser-still .image").addClass("full-image");
        });

        /*************************************/
        // Show more reactions on blog page
        /*************************************/
        // author: JDG initially 5 reactions are shown
        // by the pressing "read more" button 10 more reactions appear

        var initcount = 5;
        var reactionsAmount = $("article.comment").length;

        $("#showmore").click(function () {
            initcount += 10;
            $(".comments-content > article.comment:lt(" + initcount + ")").show();
            if (initcount >= reactionsAmount) {
                $(this).hide();
            }
        });

        function init() {
            if (initcount >= reactionsAmount) {
                $("#showmore").hide();
            }
            $(".comments-content > article.comment:lt(" + initcount + ")").show();
        }

        init();
    }

// Add scroll for Anchor link
    function offsetAnchor() {
        var headerHeight = $('header').height() + 50;
        if (location.hash.length) {
            window.scrollTo(window.scrollX, window.scrollY - headerHeight);
        }
    }

    $(document).on('click', 'a[href^="#"]', function (e) {
        window.setTimeout(function () {
            offsetAnchor();
        }, 0);
    });

})(jQuery);


jQuery(document).ready(function($){

    // Moving an element in a DOM tree
    (function () {
        $('.user-dropdown').insertAfter('header nav > ul > li:nth-last-child(1)');
    })();

//  Add Class for column in page-blog
    (function () {
        var Class = 'enableNewsLatter';

        if ($('body').hasClass("page-blog") && !($('.col-md-3 >.blog-newsletter').length)) {
            $('.col-md-3').addClass(Class) && $('.col-md-6').addClass(Class);
        }
    })();
});
;
