// ==UserScript==
// @name         Viagra for Anarchy Blood Bowl League
// @namespace    http://www.anarchy.bloodbowlleague.com/
// @version      0.12
// @description  Convert onclick to anchor for bloodbowlleague.com
// @license      MIT
// @author       Ketil Nordstad
// @match        http://*.bloodbowlleague.com/*
// @match        http://*.bloodbowlleague.net/*
// @match        https://www.anarchy.bloodbowlleague.net/*
// @match        http://www.arosbb.dk/*
// @grant        none
// @updateURL    https://openuserjs.org/meta/ketilkn/Viagra_for_Anarchy_Blood_Bowl_League.meta.js  
// @downloadURL  https://openuserjs.org/src/scripts/ketilkn/Viagra_for_Anarchy_Blood_Bowl_League.user.js
// ==/UserScript==

// 0.1: Initial version. Replace onclick player, match with anchor. Remove timeout and add keep alive
// 0.2: Replace tournament table onclick with anchor. Team name link to team. Team value link to roster.
// 0.3: Replace menu onclick with a href 
// 0.4: Support all leagues at bloodbowlleague.com
// 0.5: Added tooltip to league standings. Click on team value to open roster directly.
// 0.6: Auto update test
// 0.7: Searchable bounty selector, support for arosbb.dk.
// 0.8: Improved bounty selector. Support for arrowkeys. Fixed empty search text bug.
// 0.9: Added search to new match 
// 0.10: Added link to quickly go to league matches (and new match for semi pro)
// 0.11: Added bloodbowlleauge.net
// 0.12: Added https://www.anarchy.bloodbowlleauge.net

(function() {
    'use strict';

    //From: https://gist.github.com/niyazpk/f8ac616f181f6042d1e0
    // Add / Update a key-value pair in the URL query parameters
    function updateUrlParameter(uri, key, value) {
        // remove the hash part before operating on the uri
        var i = uri.indexOf('#');
        var hash = i === -1 ? '' : uri.substr(i);
        uri = i === -1 ? uri : uri.substr(0, i);

        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
            uri = uri.replace(re, '$1' + key + "=" + value + '$2');
        } else {
            uri = uri + separator + key + "=" + value;
        }
        return uri + hash; // finally append the hash as well
    }

    function getStyle(el, styleProp) {
  var value, defaultView = (el.ownerDocument || document).defaultView;
  // W3C standard way:
  if (defaultView && defaultView.getComputedStyle) {
    // sanitize property name to css notation
    // (hypen separated words eg. font-Size)
    styleProp = styleProp.replace(/([A-Z])/g, "-$1").toLowerCase();
    return defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
  } else if (el.currentStyle) { // IE
    // sanitize property name to camelCase
    styleProp = styleProp.replace(/\-(\w)/g, function(str, letter) {
      return letter.toUpperCase();
    });
    value = el.currentStyle[styleProp];
    // convert other units to pixels on IE
    if (/^\d+(em|pt|%|ex)?$/i.test(value)) { 
      return (function(value) {
        var oldLeft = el.style.left, oldRsLeft = el.runtimeStyle.left;
        el.runtimeStyle.left = el.currentStyle.left;
        el.style.left = value || 0;
        value = el.style.pixelLeft + "px";
        el.style.left = oldLeft;
        el.runtimeStyle.left = oldRsLeft;
        return value;
      })(value);
    }
    return value;
  }
}
    
    function hasClass( target, className ) {
        return new RegExp('(\\s|^)' + className + '(\\s|$)').test(target.className);
    }
    var heartbeat = function (){
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", "http://www.anarchy.bloodbowlleague.com/default.asp?p=adm", false );
        xmlHttp.send( null );
    };

    var wrapAnchor = function(el, link, title) {
        var tooltip = "tra la la";
        if( title && title.length > 0 ) {
            tooltip = title;
        }

        var text = el.innerHTML;
        el.innerHTML = "<a class='player-link' style='text-decoration: none; cursor: pointer;' href='"+link+"' title='"+tooltip+"'>"+text+"</a>";
        return el;
    };

    var extractLink = function(el) {
        if (! el ) {
            return "#feilExtractLink";
        }
        return el.onclick.toString().match(/\'.*.*\'/g).toString().slice(1,-1);


    };

    var processTdOnClick = function(td) {
        if(! td.hasAttribute("onclick")) {
            alert("I find your lack of onclick disturbing");
        }
        var onclick = td.getAttribute("onclick").toString();
        if(onclick.indexOf("gototeam") > -1 ) {
            if( (td.style.color=="rgb(32, 48, 64)" || td.style.color=="rgb(96, 96, 96)")) {
                var teamId = extractLink(td);
                var innerHtml = td.innerHTML;
                td.innerHTML = "";
                var a = document.createElement("a");

                td.appendChild(a);

                var tooltip ="open team info";
                var whereTo = "tm";
                if(hasClass(td,"td10")) {
                    whereTo = "ro";
                    tooltip = "open roster";
                }
                a.setAttribute("href", "/default.asp?p="+whereTo+"&t=" + teamId);
                if(tooltip.length > 0 ) {
                    a.setAttribute("title", tooltip);
                }
                a.innerHTML = innerHtml;
                a.style.cursor="pointer";
                td.appendChild(a);
            }

            td.removeAttribute("onclick");
            td.style.cursor = "default";
        }
        return "";

    };

    var processTrOnClick = function(el) {
        var link = extractLink(el);
        var td = el.querySelectorAll("td");

        for(var j = 0; j < td.length; j++) {
            wrapAnchor(td[j], link);  
            wrapAnchor(td[j], link);

        }
        if(td.length > 3 ) {
            wrapAnchor(td[2], link+"#2");
        }


    };

    var addLinkToParent = function(el, linkText) {
        var a = document.createElement("a");
        a.innerText=linkText;
        a.href = el.href;
        el.parentNode.appendChild(a);
        return a;
    };

    var processMenuTd = function(el) {
        //alert(el.getAttribute("onclick"));
        var link = extractLink(el);
        //alert(link);
        wrapAnchor(el, link);
        el.setAttribute("onclick", "");

        var leagueLink = el.querySelector('a');
        if(el.querySelector('a').href.indexOf('&s=') >= 0){
            var matchLink = addLinkToParent(leagueLink, '[m]');
            matchLink.href = updateUrlParameter(matchLink.href, 'p', 'ma');
            matchLink.href = updateUrlParameter(matchLink.href, 'so', 's');
            matchLink.title = 'Show matches';

            if(leagueLink.innerText.indexOf('Semi Pro') == 0) {
                var newLink = addLinkToParent(leagueLink, '[+]');
                newLink.href = updateUrlParameter(newLink.href, 'p', 'am');
                newLink.title = 'Create matches';
            }
        }
    };


    // CONVERT onclicks to link
    var tr_onclicks = document.querySelectorAll("tr[onclick]");
    for(var i = 0; i < tr_onclicks.length; i++) {
        processTrOnClick(tr_onclicks[i]);
        tr_onclicks[i].onclick="";
        tr_onclicks[i].style.cursor="default";
    }

    var td_onclicks = document.querySelectorAll("td[onclick]");
    for(var q = 0; q < td_onclicks.length; q++) {
        processTdOnClick(td_onclicks[q]);
    }


    td_onclicks = document.querySelectorAll("td.menu");
    for(q = 0; q < td_onclicks.length; q++) {
        var menuTd = td_onclicks[q];
        if(menuTd.hasAttribute("onclick")) {
            processMenuTd(menuTd);
        }
    }

    var applyDropdownFilter = function (element) {
        element.dropdown.innerHTML = "";
        for(var j = 0; j < element.options.length; j++) {
            //console.log(this.options[j].name);
            if((element.value.length == 0) || element.options[j].name.search(new RegExp(element.value,"i")) >=0) {
                var foo = document.createElement("option");
                foo.value = element.options[j].id;
                foo.innerHTML = element.options[j].name;

                element.dropdown.appendChild(foo);
            }

        }  
    };

    var updateDropdown = function(event, el) {
        var time = new Date().getTime();
        console.log("Søk:"+this.value + ":" +this.dropdown.options.length);

        if(event.keyCode == 38 ) {
            //up   
            var index = this.dropdown.selectedIndex;
            if(index > 0 ) {
                this.dropdown.selectedIndex = index -1;
            }

        }else if (event.keyCode == 40 ) {
            //down    
            var idx = this.dropdown.selectedIndex;
            if(idx < this.dropdown.length -1 ) {
                this.dropdown.selectedIndex =idx +1;
            }



        }else {
            applyDropdownFilter(this);
        }

        console.log(event.keyCode + " " +this.value +" Added " + this.dropdown.size + " in " + (new Date().getTime() - time)+ "ms");

    };

    var addDropdownSearch = function(name) {
        var targets = document.getElementsByName(name);
    
        for(var i=0; i < targets.length; i++) {
            var target = targets[i];
            var targetWidth =  getStyle(target, "width");

            var dropdownSearch = document.createElement("input");
            //target.setAttribute("onchange", "");
            dropdownSearch.dropdown = target;
            dropdownSearch.setAttribute("class", "dropdown-search");
            target.width = targetWidth;
            dropdownSearch.style.width = targetWidth;
            dropdownSearch.type="text";
            dropdownSearch.addEventListener("keyup", updateDropdown);

            dropdownSearch.options = [];
            var previousId = 0;
            for(var j=0; j < target.childNodes.length; j++) {
                var option = target.childNodes[j];
                //console.log(option);
                if("OPTION" == target.childNodes[j].tagName && target.childNodes[j].value !== previousId) {
                    //console.log(target.childNodes[j].tagName +  "::" + target.childNodes[j].value+ "::" + previousId);
                    previousId = target.childNodes[j].value;
                    var nam = option.textContent || target.childNodes[j].innerText;
                    var player = {"id": target.childNodes[j].value, "name":nam};
                    dropdownSearch.options.push( player );
                }

            }
            target.parentNode.insertBefore(dropdownSearch, target);
            applyDropdownFilter(dropdownSearch);
            console.log("//onchange:"+target.getAttribute("onchange"));
        }
    };

    addDropdownSearch("bountyspiller");
    addDropdownSearch("m0team1"); 
    addDropdownSearch("m0team2");
     

    //Remove javascript log out
    var timer_id = window.setTimeout(function() {}, 0);
    while (timer_id--) {
        window.clearTimeout(timer_id); // will do nothing if no timeout with id is present
    }

    //Keep alive
    window.setInterval(heartbeat, 600000);

})();
