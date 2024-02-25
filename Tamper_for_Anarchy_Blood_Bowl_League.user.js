// ==UserScript==
// @name         Viagra for Anarchy Blood Bowl League
// @namespace    http://www.anarchy.bloodbowlleague.net/
// @version      0.21
// @description  Convert onclick to anchor for bloodbowlleague.net
// @license      MIT
// @copyright 2024, ketilkn (https://openuserjs.org/users/ketilkn)
// @author       Ketil Nordstad
// @match        http://*.bloodbowlleague.net/*
// @match        https://*.bloodbowlleague.net/*
// @match        http://www.*.bloodbowlleague.net/*
// @match        https://www.*.bloodbowlleague.net/*
// @match        https://www.*.bbleague.net/*
// @match        https://*.bbleague.net/*
// @match        http://www.*.bbleague.net/*
// @match        http://*.bbleague.net/*
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
// 0.13: Added Sums row to team roster
// 0.14: Improved skill count. Added average for player characteristics
// 0.15: Changed URL matchers to use bloodbowlleague.net
// 0.16: Add link to show SPP details
// 0.17: Add back url matchers working with http
// 0.18: Add back url matchers working with http again
// 0.19: Always show player statistics in the team roster
// 0.20: Added MNG row and made rows selectable in the team roster
// 0.22: Fix bug in team roster select all/none toggle

(function() {
    const SELECTED_PLAYER_COLOR = "lightblue";
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
        var tooltip = "";
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

    var isPlayerTemporaryRetired = function(el) {
        const columns = el.children;
        if (columns[11].querySelector('img') && columns[11].querySelector('img').src.endsWith("retire.png")) {
            return true;
        }
        return false;
    };
    var isPlayerMng = function(el) {
        const columns = el.children;
        return el.children[9].innerText == "M"; // && !isPlayerTemporaryRetired(el);
    };

    var isPlayer = function(row) {
        return row.classList.containes("trlist");
    };

    var getPlayerName = function(row) {
        return row.children[2].children[1].childNodes[0].nodeValue;
    };
    var getPlayerSkillsBasic = function(row) {
        const skillsNodes = row.children[8].childNodes[1].childNodes[0].nodeValue;
        if(skillsNodes) {
            return skillsNodes.split(',').map((s) => s.trim()).filter((v) => v);
        }
        return [];
    };

    var getPlayerSkillsExtra = function(row) {
        return [...row.children[8].childNodes[1].children].map((s) => s.innerText.trim().split("(")[0]).filter((r) => r!="?");
    };
    var getPlayerSkillsImprovements = function(row) {
        if([...row.children[8].childNodes[1].children].map((s) => s.innerText.trim()).filter((r) => r=="?").length > 0) {
            return true;
        }
        return false;
    };

    var getPlayerPosition = function(row) {
        return row.children[2].children[1].childNodes[row.children[2].children[1].childNodes.length-1].innerText;
    };
    var getPlayerMa = function(row) {
        return parseInt(row.children[3].innerText);
    }
    var getPlayerSt = function(row) {
        return parseInt(row.children[4].innerText);
    }
    var getPlayerAg = function(row) {
        return parseInt(row.children[5].innerText);
    }
    var getPlayerPa = function(row) {
        let pa = parseInt(row.children[6].innerText);
        if(! pa ) {
            return 0;
        }
        return pa;
    }

    var getPlayerAv = function(row) {
        return parseInt(row.children[7].innerText);
    }
    var getPlayerNiggles = function(row) {
        var niggles = parseInt(row.children[10].innerText);
        if(niggles) {
            return niggles;
        }
        return 0;
    }

    var getPlayerSppTotal = function(row) {
        return parseInt(row.children[17].childNodes[1].childNodes[1].innerText.replace("(","").replace(")","").trim())
    }

    var getPlayerSppUnspent = function(row) {
        return parseInt(row.children[17].childNodes[1].childNodes[0].nodeValue)
    }

    var parsePlayer = function(row) {
        const playerInfo = {
            number: parseInt(row.children[0].innerText),
            name: getPlayerName(row),
            url: row.querySelector('a').href,
            position: getPlayerPosition(row),
            ma: getPlayerMa(row),
            st: getPlayerSt(row),
            ag: getPlayerAg(row),
            pa: getPlayerPa(row),
            av: getPlayerAv(row),
            skills: getPlayerSkillsBasic(row) + getPlayerSkillsExtra(row),
            skillsBasic: getPlayerSkillsBasic(row),
            skillsExtra: getPlayerSkillsExtra(row),
            skillsImprovementAvailable: getPlayerSkillsImprovements(row),
            missNextGame: isPlayerMng(row),
            niggles: getPlayerNiggles(row),
            temporaryRetired: isPlayerTemporaryRetired(row),
            interceptions: ~~parseInt(row.children[12].textContent),
            completions: ~~parseInt(row.children[13].textContent),
            touchdowns: ~~parseInt(row.children[14].textContent),
            casualties: ~~parseInt(row.children[15].textContent),
            mvp: ~~parseInt(row.children[16].textContent),
            spp: getPlayerSppTotal(row),
            sppUnspent: getPlayerSppUnspent(row),
            currentValue: parseInt(row.querySelectorAll('td')[16].innerText),
            theRow: row
        };
        return playerInfo;
    };

    var countPlayerSkills = function(players) {
        var extraSkills = players.map(p => p.skillImprovements);
        var extraSkillCount = {};
        players.forEach((player) => {
            player.skillsExtra.forEach((skill) => {
                if(! extraSkillCount[skill]) {
                    extraSkillCount[skill] = 1;
                } else {
                    extraSkillCount[skill] = extraSkillCount[skill] + 1;
                }
            });
        });
        return extraSkillCount;
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

    };

 var updateRosterSums = function (players, sums, sumAllPlayers) {
        let sumRow = document.querySelector("tr.totalSums");
        if(sums) {
            sumRow = sums;
        }

        var selectedPlayers = players.filter((p)=>!p.missNextGame);
        if(sumAllPlayers) {
            selectedPlayers = players;
        }
        var activePlayerCount = selectedPlayers.length;
        var playerCount = players.length;

        var meanMovement = selectedPlayers.map((p)=>p.ma).reduce((a, b) => a + b, 0) / selectedPlayers.length;
        var meanStrength = selectedPlayers.map((p)=>p.st).reduce((a, b) => a + b, 0) / selectedPlayers.length;
        var meanAgility = selectedPlayers.map((p)=>p.ag).reduce((a, b) => a + b, 0) / selectedPlayers.length;
        var meanPassing = selectedPlayers.map((p)=>p.pa).reduce((a, b) => a + b, 0) / selectedPlayers.length;
        var meanAv = selectedPlayers.map((p)=>p.av).reduce((a, b) => a + b, 0) / selectedPlayers.length;

        var playerPrices = selectedPlayers.map(p=>p.currentValue);
        var playersPriceTotal = playerPrices.reduce((totalValue, playerValue) => { return totalValue + playerValue}, 0);
        var playersSpp = selectedPlayers.map(p=>p.spp).reduce((totalSpp, playerSpp) => { return totalSpp + playerSpp}, 0);
        var skillCount = selectedPlayers.map((p)=>p.skillsExtra.length).reduce((totalSkills, playerSkills) => { return totalSkills + playerSkills}, 0) + " extra skills";
        var skillsImprovementCount = selectedPlayers.map(p=>p.skillsImprovementAvailable).reduce((totalImprovementsAvailable, playerImprovement) => { return totalImprovementsAvailable + playerImprovement}, 0);

        //skillCount = "";
        //var counts = countPlayerSkills(selectedPlayers).map((s)=> s[0] + "(" + s[1] + ")");
        //skillCount = counts.join(', ');
        var skills = Object.entries(countPlayerSkills(selectedPlayers))
        skills.sort(function(a, b) { return b[1] - a[1]; });
        var skillList = skills.map((s)=> s[0] + "(" + s[1] + ")").join(", ");
        if(skillsImprovementCount > 0) {
            skillList = skillList + " +available\u00a0("+ skillsImprovementCount + ")";
        }

        var mngCount = selectedPlayers.filter((p)=>p.missNextGame).length;
        var niggleSum = selectedPlayers.map((p)=>p.niggles).reduce((totalNiggle, playerNiggle) => { return totalNiggle + playerNiggle}, 0);
        var tempRetireCount = selectedPlayers.map((p)=>p.temporaryRetired?1:0).reduce((totalTemp, playerTemp) => { return totalTemp + playerTemp}, 0);

        var interceptionsSum = selectedPlayers.map((p)=>p.interceptions).reduce((totalInterceptions, playerInterceptions) => { return totalInterceptions + playerInterceptions}, 0);
        var completionsSum = selectedPlayers.map((p)=>p.completions).reduce((totalCompletions, playerCompletions) => { return totalCompletions + playerCompletions}, 0);
        var touchdownsSum = selectedPlayers.map((p)=>p.touchdowns).reduce((totalTouchdowns, playerTouchdowns) => { return totalTouchdowns + playerTouchdowns}, 0);
        var casualtiesSum = selectedPlayers.map((p)=>p.casualties).reduce((totalCasualties, playerCasualties) => { return totalCasualties + playerCasualties}, 0);
        var mvpSum = selectedPlayers.map((p)=>p.mvp).reduce((totalMvp, playerMvp) => { return totalMvp + playerMvp}, 0);

        //var borderRow = document.querySelector('tr.trborder:nth-child(18)');
        var borderRow = document.querySelector('table.tblist tr.trborder');
        var sumLabel = selectedPlayers.length +" "+sumAllPlayers;
        if(!sumAllPlayers) {
            sumLabel = activePlayerCount + " of " + playerCount + " ready";
        }

        //var sumRow = document.createElement("tr");
        //sumRow.innerHTML = playerRowHtml;
        //sumRow.className = "trlist sums";


        sumRow.children[0].align="center";
        sumRow.children[1].innerText="";
        sumRow.children[2].innerText= sumLabel;
        sumRow.children[2].align = "center";
        sumRow.children[3].innerText = Math.round(meanMovement*100)/100;
        sumRow.children[4].innerText = Math.round(meanStrength*100)/100;
        sumRow.children[5].innerText = Math.round(meanAgility*100)/100;
        sumRow.children[6].innerText = Math.round(meanPassing*100)/100;
        sumRow.children[7].innerText = Math.round(meanAv*100)/100;
        //sumRow.children[4].innerText=sumRow.children[5].innerText=sumRow.children[6].innerText=sumRow.children[7].innerText="";
        sumRow.children[8].textContent = skillCount;
        sumRow.children[8].id = 'SumOfSkills';
        sumRow.children[8].onclick = function(){ if(sumRow.children[8].textContent == skillCount) {
            sumRow.children[8].textContent = skillList;
        } else {
            sumRow.children[8].textContent = skillCount;
        }};

        sumRow.children[9].innerText = mngCount;
        sumRow.children[10].innerText = niggleSum;
        sumRow.children[11].innerText = tempRetireCount;
        sumRow.children[12].innerText = interceptionsSum;
        sumRow.children[13].innerText =completionsSum;
        sumRow.children[14].innerText =touchdownsSum;
        sumRow.children[15].textContent=casualtiesSum;
        sumRow.children[16].textContent=mvpSum;
        sumRow.children[17].innerText =playersSpp;
        sumRow.children[18].innerText = playersPriceTotal + " k ";

        borderRow.parentNode.insertBefore(sumRow, borderRow);
    };


    var addRosterSums = function(players, sumAllPlayers) {
        var playerRowHtml = players[players.length-1].theRow.innerHTML;

        var sumRow = document.createElement("tr");
        sumRow.innerHTML = playerRowHtml;
        sumRow.className = "trlist sums totalSums";
        sumRow.children[0].innerText="sum";

        updateRosterSums(players, sumRow, sumAllPlayers);

        return sumRow;
    };


    var addRosterSumsReady = function(players) {
        var playerRowHtml = players[players.length-1].theRow.innerHTML;
        var totalSumRow = addRosterSums(players);
        totalSumRow.className = "trlist sums totalSums";

        totalSumRow.children[2].onclick = function() {
            let selectedPlayers = players.filter((player) => player.theRow.style.backgroundColor && player.theRow.style.backgroundColor == SELECTED_PLAYER_COLOR);
            if(selectedPlayers.length < 1 ) {
                players.forEach((playerRow) => {playerRow.theRow.click();});
            } else {
                selectedPlayers.forEach((playerRow) => { playerRow.theRow.click()});
            }

        };
        //totalSumRow.children[2].innerText="aaa";
        return totalSumRow;
    };

      var addRosterSumsMng = function(players) {
        var playerRowHtml = players[players.length-1].theRow.innerHTML;
        var mngPlayers = players.filter((p)=>p.missNextGame);
        if( mngPlayers.length < 1 ) {
            return;
        }
        var mngRow = addRosterSums(mngPlayers, " missing");
        mngRow.className = "trlist sums mngSums";
        mngRow.children[0].innerText="mng";
        return mngRow;
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

    var fixLastTdColspan = function (roster) {
        for(let i = roster.querySelectorAll('tr').length - 8; i < roster.querySelectorAll('tr').length; i++) {
            let row = roster.querySelectorAll('tr')[i];
            if(row.children.length < 19) {
                let colSpan = row.children.length - 18;
                row.children[row.children.length-1].colSpan = 6;
            }
        }
    }

    var toggleRosterStats = function () {
        var roster = document.querySelector(".tblist");
        var rosterHeadingRow = document.querySelector(".tblist .trlisthead");
        var rosterRows = [...document.querySelectorAll(".tblist tr")].filter((row) => !row.classList.contains("trborder"));
        var teamBadgeColumn = document.querySelector(".trborder .esmall9");

        rosterRows.forEach((row) => {
            row.children[10].style.display="table-cell";
            row.children[11].style.display="table-cell";
            row.children[12].style.display="table-cell";
            row.children[13].style.display="table-cell";
            row.children[14].style.display="table-cell";
            if(!row.classList.contains(".trlist") && row.children.length == 17) {
                let missing1 = document.createElement("td");
                missing1.className = row.children[14].className;
                missing1.style = row.children[14].style.cssText;
                row.insertBefore(missing1, row.children[15]);

                let missing2 = document.createElement("td");
                missing2.className = row.children[14].className;
                missing2.style = row.children[14].style.cssText;
                row.insertBefore(missing2, row.children[15]);
            }
            row.children[15].style.display="table-cell";
            row.children[16].style.display="table-cell";

            row.children[17].style.display="table-cell";
            row.children[18].style.display="table-cell";
        });
        fixLastTdColspan(roster);

        return true;
    };

    var addStatsToggle = function (roster) {
        const statsToggle = document.createElement('a');
        statsToggle.textContent = "Show SPP details";
        statsToggle.href="#";
        statsToggle.onclick = function() { toggleRosterStats(); statsToggle.style.display="none"; return false;};
        roster.after(statsToggle);
    };

    var addPlayerSkillFunctionsToDocument = function(playerValues) {
        document.countPlayerSkills = countPlayerSkills;
        document.toogleRosterStats = toggleRosterStats;
        document.playerValues = playerValues;
    };

    var selectPlayerRow = function(row, rosterRows) {
        if(!row.style.backgroundColor || row.style.backgroundColor !== SELECTED_PLAYER_COLOR) {
            row.oldBackgroundColor = row.style.backgroundColor;
            row.style.backgroundColor = SELECTED_PLAYER_COLOR;
        } else if ( row.oldBackgroundColor ) {
            row.style.backgroundColor = row.oldBackgroundColor;
        } else {
            row.style.backgroundColor = null;
        }
        var selectedPlayers = rosterRows.filter((player) => player.theRow.style.backgroundColor && player.theRow.style.backgroundColor == SELECTED_PLAYER_COLOR);
        var selectedPlayersCount = selectedPlayers.length;
        document.selectedPlayers = selectedPlayers;
        console.log(selectedPlayers);
        console.log("Clicked row");
        console.log(row);
        console.log("There are " + selectedPlayersCount + " rows selected");
        if ( selectedPlayersCount > 0 ) {
            updateRosterSums(selectedPlayers, document.querySelector("tr.totalSums"), "selected");
        } else {
            updateRosterSums(rosterRows, document.querySelector("tr.totalSums"), false);
        }
    };

    var makeRosterRowsClickable = function(rosterRows) {
        rosterRows.forEach((player) => {
            let row = player.theRow;
            row.style.cursor = "crosshair";
            row.onclick = function() {selectPlayerRow(row, rosterRows)};
        });
    };

    addDropdownSearch("bountyspiller");
    addDropdownSearch("m0team1");
    addDropdownSearch("m0team2");

    if( document.URL.indexOf("default.asp?p=ro") > 0 ) {
        const roster = document.querySelector(".tblist");
        const players = [...document.querySelectorAll(".tblist tr")].filter((row) => {return row.classList.contains("trlist");});
        const playerValues = players.map((row) => parsePlayer(row));

        makeRosterRowsClickable(playerValues);
        addPlayerSkillFunctionsToDocument(playerValues);
        addRosterSumsMng(playerValues);
        addRosterSumsReady(playerValues);
        toggleRosterStats();

    } else {
        document.playerValues = {no_players: true};
    }

    //Remove javascript log out
    var timer_id = window.setTimeout(function() {}, 0);
    while (timer_id--) {
        window.clearTimeout(timer_id); // will do nothing if no timeout with id is present
    }

    //Keep alive
    window.setInterval(heartbeat, 600000);

})();
