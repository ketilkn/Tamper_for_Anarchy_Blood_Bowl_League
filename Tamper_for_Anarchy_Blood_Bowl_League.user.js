// ==UserScript==
// @name         Tamper for Anarchy Blood Bowl League
// @namespace    http://www.anarchy.bloodbowlleague.net/
// @version      0.23
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
// @updateURL    https://github.com/ketilkn/Tamper_for_Anarchy_Blood_Bowl_League/raw/master/Tamper_for_Anarchy_Blood_Bowl_League.meta.js
// @downloadURL  https://github.com/ketilkn/Tamper_for_Anarchy_Blood_Bowl_League/raw/master/Tamper_for_Anarchy_Blood_Bowl_League.user.js
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
// 0.23: Team roster has separate row for selected players + bugfixes

(function() {
    const SELECTED_PLAYER_COLOR = "lightblue";
    'use strict';

    //From: https://gist.github.com/niyazpk/f8ac616f181f6042d1e0
    // Add / Update a key-value pair in the URL query parameters
    function updateUrlParameter(uri, key, value) {
        // remove the hash part before operating on the uri
        let i = uri.indexOf('#');
        const hash = i === -1 ? '' : uri.substr(i);
        uri = i === -1 ? uri : uri.substr(0, i);

        let re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        let separator = uri.indexOf('?') !== -1 ? "&" : "?";
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
    styleProp = styleProp.replace(/-(\w)/g, function(str, letter) {
      return letter.toUpperCase();
    });
    value = el.currentStyle[styleProp];
    // convert other units to pixels on IE
    if (/^\d+(em|pt|%|ex)?$/i.test(value)) {
      return (function(value) {
        let oldLeft = el.style.left;
        let oldRsLeft = el.runtimeStyle.left;
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
    const heartbeat = function (){
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", "http://www.anarchy.bloodbowlleague.com/default.asp?p=adm", false );
        xmlHttp.send( null );
    };

    const wrapAnchor = function(el, link, title) {
        let tooltip = "";
        if( title && title.length > 0 ) {
            tooltip = title;
        }

        let text = el.innerHTML;
        el.innerHTML = "<a class='player-link' style='text-decoration: none; cursor: pointer;' href='"+link+"' title='"+tooltip+"'>"+text+"</a>";
        return el;
    };

    const skillNameToClass = function (skill) {
        if(skill.trim().startsWith('+')) {
            return "extra-"+skill.trim().toLowerCase().slice(1);
        }
        return skill.trim().replace(/\(.*\)/g,'').trim().replace(/\s/g, '-').toLowerCase().trim()
    }

    const addClassToSkills = function (playerRow) {
        const extraSkills = [...playerRow.children[8].childNodes];
        extraSkills.forEach(skill => {
            if(skill.textContent.trim() === '?') {
                skill.className = "skill-available";
            } else {
                let skillClass = skillNameToClass(skill.textContent);
                let improvementType = skill.style && skill.style.color ? "skill-improvement" : "skill-basic";
                skill.className = "skill " + improvementType + " " + skillClass;
            }
        });
    }

    const skillBasicToSpan = function(playerRow) {
        let skills = playerRow.children[8].firstChild.textContent.split(',').filter((s => s.trim().length > 0));
        let skillText = playerRow.children[8].firstChild;

        skills.forEach(skill => {
            let skillSpan = document.createElement('span');
            skillSpan.textContent = skill;

            skillText.parentNode.insertBefore(skillSpan, skillText);
            skillText.parentNode.insertBefore(document.createTextNode(","), skillText);
        });
        skillText.remove();
    }

    const extractLink = function(el) {
        if (! el ) {
            return "#feilExtractLink";
        }
        return el.onclick.toString().match(/'.*.*'/g).toString().slice(1,-1);
    };

    const isPlayerTemporaryRetired = function(el) {
        const columns = el.children;
        return columns[11].querySelector('img') && columns[11].querySelector('img').src.endsWith("retire.png");

    };

    const isPlayerMng = function(el) {
        return el.children[9].innerText === "M"; // && !isPlayerTemporaryRetired(el);
    };

    const isPlayer = function(row) {
        return row.classList.contains("trlist") && !row.classList.contains("sums");
    };

    const getPlayerName = function(row) {
        return row.children[2].firstChild.textContent;
    };
    const getPlayerSkillsBasic = function(row) {
        const skillsNodes = row.children[8].firstChild.textContent;
        if(skillsNodes) {
            return skillsNodes.split(',').map((s) => s.trim()).filter((v) => v);
        }
        return [];
    };

    const getPlayerSkillsExtra = function(row) {
        const extraSkills = [...row.children[8].children];
        return extraSkills.map((s) => s.textContent).filter((s) =>
            s.trim() !== "," && s.trim() !== "?");

    };
    const getPlayerSkillsImprovements = function(row) {
        const extraSkills = [...row.children[8].childNodes].slice(1)
        return extraSkills.filter((r) => r.textContent.indexOf(",")==-1).map((s) => s.innerText.trim().split("(")[0]).filter((r) => r!="?");

    };

    const getPlayerPosition = function(row) {
        return row.children[2].lastChild.textContent;
    };
    const getPlayerMa = function(row) {
        return parseInt(row.children[3].innerText);
    }
    const getPlayerSt = function(row) {
        return parseInt(row.children[4].innerText);
    }
    const getPlayerAg = function(row) {
        return parseInt(row.children[5].innerText);
    }
    const getPlayerPa = function(row) {
        let pa = parseInt(row.children[6].innerText);
        if(! pa ) {
            return 0;
        }
        return pa;
    }

    const getPlayerAv = function(row) {
        return parseInt(row.children[7].innerText);
    }
    const getPlayerNiggles = function(row) {
        const niggles = parseInt(row.children[10].innerText);
        if(niggles) {
            return niggles;
        }
        return 0;
    }

    const getPlayerSppTotal = function(row) {
        return parseInt(row.children[17].childNodes[1].textContent.replace("(","").replace(")","").trim());
    }

    const getPlayerSppUnspent = function(row) {
            return parseInt(row.children[17].childNodes[0].textContent);
    }

    const parsePlayer = function(row) {
        if(!isPlayer(row)) {
            return false;
        }
        return {
            number: parseInt(row.children[0].innerText),
            name: getPlayerName(row),
            url: extractLink(row), //row.querySelector('a').href,
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
    };

    const countPlayerSkills = function(players) {
        //var extraSkills = players.map(p => p.skillImprovements);
        let extraSkillCount = {};
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

    const processTdOnClick = function(td) {
        if(! td.hasAttribute("onclick")) {
            alert("I find your lack of onclick disturbing");
        }
        const onclick = td.getAttribute("onclick").toString();
        if(onclick.indexOf("gototeam") > -1 ) {
            if( (td.style.color=="rgb(32, 48, 64)" || td.style.color=="rgb(96, 96, 96)")) {
                let teamId = extractLink(td);
                let innerHtml = td.innerHTML;
                td.innerHTML = "";
                let a = document.createElement("a");

                td.appendChild(a);

                let tooltip ="open team info";
                let whereTo = "tm";
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

    const processTrOnClick = function(el) {
        let link = extractLink(el);
        let td = el.querySelectorAll("td");

        for(let j = 0; j < td.length; j++) {
            wrapAnchor(td[j], link);
            wrapAnchor(td[j], link);

        }
        if(td.length > 3 ) {
            wrapAnchor(td[2], link+"#2");
        }


    };

    const addLinkToParent = function(el, linkText) {
        let a = document.createElement("a");
        a.innerText=linkText;
        a.href = el.href;
        el.parentNode.appendChild(a);
        return a;
    };

    const processMenuTd = function(el) {
        //alert(el.getAttribute("onclick"));
        let link = extractLink(el);
        //alert(link);
        wrapAnchor(el, link);
        el.setAttribute("onclick", "");

        const leagueLink = el.querySelector('a');
        if(el.querySelector('a').href.indexOf('&s=') >= 0){
            let matchLink = addLinkToParent(leagueLink, '[m]');
            matchLink.href = updateUrlParameter(matchLink.href, 'p', 'ma');
            matchLink.href = updateUrlParameter(matchLink.href, 'so', 's');
            matchLink.title = 'Show matches';

            if(leagueLink.innerText.indexOf('Semi Pro') == 0) {
                let newLink = addLinkToParent(leagueLink, '[+]');
                newLink.href = updateUrlParameter(newLink.href, 'p', 'am');
                newLink.title = 'Create matches';
            }
        }
    };

    // CONVERT onclicks to link
    const tr_onclicks = document.querySelectorAll("tr[onclick]");
    for(let i = 0; i < tr_onclicks.length; i++) {
        if(tr_onclicks[i].classList.contains('trlist')) {
            continue;
        }
        processTrOnClick(tr_onclicks[i]);
        tr_onclicks[i].onclick="";
        tr_onclicks[i].style.cursor="default";
    }

    let td_onclicks = document.querySelectorAll("td[onclick]");
    for(let q = 0; q < td_onclicks.length; q++) {
        processTdOnClick(td_onclicks[q]);
    }


    td_onclicks = document.querySelectorAll("td.menu");
    for(let q = 0; q < td_onclicks.length; q++) {
        const menuTd = td_onclicks[q];
        if(menuTd.hasAttribute("onclick")) {
            processMenuTd(menuTd);
        }
    }

    const applyDropdownFilter = function (element) {
        element.dropdown.innerHTML = "";
        for(let j = 0; j < element.options.length; j++) {
            //console.log(this.options[j].name);
            if((element.value.length == 0) || element.options[j].name.search(new RegExp(element.value,"i")) >=0) {
                var foo = document.createElement("option");
                foo.value = element.options[j].id;
                foo.innerHTML = element.options[j].name;

                element.dropdown.appendChild(foo);
            }

        }
    };

    const updateDropdown = function(event) {
        if(event.keyCode === 38 ) {
            //up
            let index = this.dropdown.selectedIndex;
            if(index > 0 ) {
                this.dropdown.selectedIndex = index -1;
            }

        }else if (event.keyCode === 40 ) {
            //down
            const idx = this.dropdown.selectedIndex;
            if(idx < this.dropdown.length -1 ) {
                this.dropdown.selectedIndex =idx +1;
            }
        }else {
            applyDropdownFilter(this);
        }
    };

    const updateRosterSums = function (players, sums, sumAllPlayers) {
        let sumRow = document.querySelector("tr.totalSums");
        if(sums) {
            sumRow = sums;
        }

        let selectedPlayers = players.filter((p)=>!p.missNextGame);
        if(sumAllPlayers) {
            selectedPlayers = players;
        }
        let activePlayerCount = selectedPlayers.length;
        let playerCount = players.length;

        let meanMovement = selectedPlayers.map((p)=>p.ma).reduce((a, b) => a + b, 0) / selectedPlayers.length;
        let meanStrength = selectedPlayers.map((p)=>p.st).reduce((a, b) => a + b, 0) / selectedPlayers.length;
        let meanAgility = selectedPlayers.map((p)=>p.ag).reduce((a, b) => a + b, 0) / selectedPlayers.length;
        let meanPassing = selectedPlayers.map((p)=>p.pa).reduce((a, b) => a + b, 0) / selectedPlayers.length;
        let meanAv = selectedPlayers.map((p)=>p.av).reduce((a, b) => a + b, 0) / selectedPlayers.length;

        let playerPrices = selectedPlayers.map(p=>p.currentValue);
        let playersPriceTotal = playerPrices.reduce((totalValue, playerValue) => { return totalValue + playerValue}, 0);
        let playersSpp = selectedPlayers.map(p=>p.spp).reduce((totalSpp, playerSpp) => { return totalSpp + playerSpp}, 0);
        let skillCount = selectedPlayers.map((p)=>p.skillsExtra.length).reduce((totalSkills, playerSkills) => { return totalSkills + playerSkills}, 0) + " extra skills";
        let skillsImprovementCount = selectedPlayers.map(p=>p.skillsImprovementAvailable).reduce((totalImprovementsAvailable, playerImprovement) => { return totalImprovementsAvailable + playerImprovement}, 0);

        //skillCount = "";
        //let counts = countPlayerSkills(selectedPlayers).map((s)=> s[0] + "(" + s[1] + ")");
        //skillCount = counts.join(', ');
        let skills = Object.entries(countPlayerSkills(selectedPlayers))
        skills.sort(function(a, b) { return b[1] - a[1]; });
        let skillList = skills.map((s)=> s[0] + "(" + s[1] + ")").join(", ");
        if(skillsImprovementCount > 0) {
            skillList = skillList + " +available\u00a0("+ skillsImprovementCount + ")";
        }

        let mngCount = selectedPlayers.filter((p)=>p.missNextGame).length;
        let niggleSum = selectedPlayers.map((p)=>p.niggles).reduce((totalNiggle, playerNiggle) => { return totalNiggle + playerNiggle}, 0);
        let tempRetireCount = selectedPlayers.map((p)=>p.temporaryRetired?1:0).reduce((totalTemp, playerTemp) => { return totalTemp + playerTemp}, 0);

        let interceptionsSum = selectedPlayers.map((p)=>p.interceptions).reduce((totalInterceptions, playerInterceptions) => { return totalInterceptions + playerInterceptions}, 0);
        let completionsSum = selectedPlayers.map((p)=>p.completions).reduce((totalCompletions, playerCompletions) => { return totalCompletions + playerCompletions}, 0);
        let touchdownsSum = selectedPlayers.map((p)=>p.touchdowns).reduce((totalTouchdowns, playerTouchdowns) => { return totalTouchdowns + playerTouchdowns}, 0);
        let casualtiesSum = selectedPlayers.map((p)=>p.casualties).reduce((totalCasualties, playerCasualties) => { return totalCasualties + playerCasualties}, 0);
        let mvpSum = selectedPlayers.map((p)=>p.mvp).reduce((totalMvp, playerMvp) => { return totalMvp + playerMvp}, 0);

        //let borderRow = document.querySelector('tr.trborder:nth-child(18)');
        let borderRow = document.querySelector('table.tblist tr.trborder');
        let sumLabel = selectedPlayers.length +" "+sumAllPlayers;
        if(!sumAllPlayers) {
            sumLabel = activePlayerCount + " of " + playerCount + " ready";
        }

        //let sumRow = document.createElement("tr");
        //sumRow.innerHTML = playerRowHtml;
        //sumRow.className = "trlist sums";

        sumRow.children[0].align="center";
        sumRow.children[1].innerText="";
        sumRow.children[2].innerText= sumLabel;
        sumRow.children[2].align = "center";
        sumRow.children[3].innerText = (Math.round(meanMovement*100)/100).toFixed(2);
        sumRow.children[4].innerText = (Math.round(meanStrength*100)/100).toFixed(2);
        sumRow.children[5].innerText = (Math.round(meanAgility*100)/100).toFixed(2);
        sumRow.children[6].innerText = (Math.round(meanPassing*100)/100).toFixed(2);
        sumRow.children[7].innerText = (Math.round(meanAv*100)/100).toFixed(2);
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

    const addRosterSums = function(players, sumAllPlayers) {
        let selectionSums = document.querySelector('tr.selectionSums');
        if (selectionSums) {
            return selectionSums;
        }

        let playerRowHtml = players[players.length-1].theRow.innerHTML;
        let sumRow = document.createElement("tr");
        sumRow.innerHTML = playerRowHtml;
        sumRow.className = "trlist sums allSums";
        sumRow.children[0].innerText="sum";

        updateRosterSums(players, sumRow, sumAllPlayers);

        return sumRow;
    };

    const addRosterSelectionSum = function(players) {
        const rowLabel = "selected";
        let selectionSums = document.querySelector('tr.selectionSums');
        if (selectionSums) {
            updateRosterSums(players, selectionSums, rowLabel);
            return selectionSums;
        }

        const sumRow= addRosterSums(players, rowLabel);
        sumRow.id="selectedPlayers";
        sumRow.children[0].innerText="sel";
        sumRow.className = "trlist sums selectionSums";
        sumRow.style.backgroundColor = SELECTED_PLAYER_COLOR;
        return sumRow;
    };

    const addRosterSumsReady = function(players) {
        const totalSumRow = addRosterSums(players);
        totalSumRow.className = "trlist sums totalSums";
        totalSumRow.children[2].title = "Click to select/unselect all";

        totalSumRow.children[2].onclick = function() {
            let selectedPlayers = players.filter((player) => player.theRow.style.backgroundColor && player.theRow.style.backgroundColor == SELECTED_PLAYER_COLOR);
            if(selectedPlayers.length < 1 ) {
                players.forEach((playerRow) => {playerRow.theRow.click();});
            } else {
                selectedPlayers.forEach((playerRow) => { playerRow.theRow.click()});
            }

        };
        return totalSumRow;
    };

      const addRosterSumsMng = function(players) {
        const mngPlayers = players.filter((p)=>p.missNextGame);
        if( mngPlayers.length < 1 ) {
            return;
        }

        const mngRow = addRosterSums(mngPlayers, " missing");
        mngRow.className = "trlist sums mngSums";
        mngRow.children[0].innerText="mng";
        return mngRow;
    };
    const reformatMngPlayers = function(players) {
        const mngPlayers = players.filter((p) => p.missNextGame);
        if (mngPlayers.length < 1) {
            return;
        }
        mngPlayers.forEach((player) => {
            player.theRow.children[0].style.textDecoration = 'line-through';
            player.theRow.children[1].style.textDecoration = 'line-through';
        });
    }

    const addClickablePlayerName = function(players) {
        players.forEach((player) => {
            wrapAnchor(player.theRow.children[2], player.url, player.name);
        });
    }

    const addDropdownSearch = function(name) {
        let targets = document.getElementsByName(name);

        for(let i=0; i < targets.length; i++) {
            let target = targets[i];
            let targetWidth =  getStyle(target, "width");

            let dropdownSearch = document.createElement("input");
            //target.setAttribute("onchange", "");
            dropdownSearch.dropdown = target;
            dropdownSearch.setAttribute("class", "dropdown-search");
            target.width = targetWidth;
            dropdownSearch.style.width = targetWidth;
            dropdownSearch.type="text";
            dropdownSearch.addEventListener("keyup", updateDropdown);

            dropdownSearch.options = [];
            let previousId = 0;
            for(let j=0; j < target.childNodes.length; j++) {
                let option = target.childNodes[j];
                //console.log(option);
                if("OPTION" == target.childNodes[j].tagName && target.childNodes[j].value !== previousId) {
                    //console.log(target.childNodes[j].tagName +  "::" + target.childNodes[j].value+ "::" + previousId);
                    previousId = target.childNodes[j].value;
                    let nam = option.textContent || target.childNodes[j].innerText;
                    let player = {"id": target.childNodes[j].value, "name":nam};
                    dropdownSearch.options.push( player );
                }

            }
            target.parentNode.insertBefore(dropdownSearch, target);
            applyDropdownFilter(dropdownSearch);
            console.log("//onchange:"+target.getAttribute("onchange"));
        }
    };

    const fixLastTdColspan = function (roster) {
        for(let i = roster.querySelectorAll('tr').length - 8; i < roster.querySelectorAll('tr').length; i++) {
            let row = roster.querySelectorAll('tr')[i];
            if(row.children.length < 19) {
                row.children[row.children.length-1].colSpan = 6;
            }
        }
    }

    const toggleRosterStats = function () {
        const roster = document.querySelector(".tblist");
        const rosterRows = [...document.querySelectorAll(".tblist tr")].filter((row) => !row.classList.contains("trborder"));
        //var rosterHeadingRow = document.querySelector(".tblist .trlisthead");

        rosterRows.forEach((row) => {
            row.children[10].style.display="table-cell";
            row.children[11].style.display="table-cell";
            row.children[12].style.display="table-cell";
            row.children[13].style.display="table-cell";
            row.children[14].style.display="table-cell";
            if(!row.classList.contains(".trlist") && row.children.length === 17) {
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

    const addStatsToggle = function (roster) {
        const statsToggle = document.createElement('a');
        statsToggle.textContent = "Show SPP details";
        statsToggle.href="#";
        statsToggle.onclick = function() { toggleRosterStats(); statsToggle.style.display="none"; return false;};
        roster.after(statsToggle);
    };

    const addPlayerSkillFunctionsToDocument = function(playerValues) {
        document.countPlayerSkills = countPlayerSkills;
        document.toogleRosterStats = toggleRosterStats;
        document.playerValues = playerValues;
    };

    const selectPlayerRow = function(row, rosterRows) {
        if(!row.style.backgroundColor || row.style.backgroundColor !== SELECTED_PLAYER_COLOR) {
            row.oldBackgroundColor = row.style.backgroundColor;
            row.style.backgroundColor = SELECTED_PLAYER_COLOR;
        } else if ( row.oldBackgroundColor ) {
            row.style.backgroundColor = row.oldBackgroundColor;
        } else {
            row.style.backgroundColor = null;
        }
        const selectedPlayers = rosterRows.filter((player) => player.theRow.style.backgroundColor && player.theRow.style.backgroundColor == SELECTED_PLAYER_COLOR);
        const selectedPlayersCount = selectedPlayers.length;
        document.selectedPlayers = selectedPlayers;

        if ( selectedPlayersCount > 0 ) {
            addRosterSelectionSum(selectedPlayers);
        } else {
            let selectedPlayersSums = addRosterSelectionSum(selectedPlayers, 'Zelected');
            selectedPlayersSums.remove();
        }
    };

    const makeRosterRowsClickable = function(rosterRows) {
        rosterRows.forEach((player) => {
            let row = player.theRow;
            row.style.cursor = "crosshair";
            row.onclick = function() {selectPlayerRow(row, rosterRows)};
        });
    };

    addDropdownSearch("bountyspiller");
    addDropdownSearch("m0team1");
    addDropdownSearch("m0team2");

    if( document.URL.indexOf("default.asp?p=ro") > 0 || document.URL.indexOf("p=ro&t=") > 0) {
        //const roster = document.querySelector(".tblist");
        const players = [...document.querySelectorAll(".tblist tr")].filter((row) => {return row.classList.contains("trlist");});
        const playerValues = players.map((row) => parsePlayer(row));

        makeRosterRowsClickable(playerValues);
        addPlayerSkillFunctionsToDocument(playerValues);
        addRosterSumsMng(playerValues);
        addRosterSumsReady(playerValues);
        addClickablePlayerName(playerValues);
        reformatMngPlayers(playerValues);
        toggleRosterStats();

        playerValues.forEach(player => {
            skillBasicToSpan(player.theRow);
            addClassToSkills(player.theRow);
        });

        document.getPlayerSkillsExtra = getPlayerSkillsExtra;

    } else {
        document.playerValues = {no_players: true};
    }

    //Remove javascript log out
    let timer_id = window.setTimeout(function() {}, 0);
    while (timer_id--) {
        window.clearTimeout(timer_id); // will do nothing if no timeout with id is present
    }

    //Keep alive
    window.setInterval(heartbeat, 600000);
})();
