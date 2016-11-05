// ==UserScript==
// @name         SteamGifts Giveaway Highlighter
// @namespace     https://github.com/Gaffi/SG-GA-Highlighter
// @version      0.01
// @description  Highlights SG site for easier management.
// @author       Gaffi
// icon
// @downloadURL   https://github.com/Gaffi/SG-GA-Highlighter/raw/master/SG-GA-Highlighter.user.js
// @updateURL     https://github.com/Gaffi/SG-GA-Highlighter/raw/master/SG-GA-Highlighter.meta.js
// @match        https://www.steamgifts.com/
// @grant        GM_log
// @connect		 www.steamgifts.com
// ==/UserScript==


if (window.location.href.match(".steamgifts.com/") !== null &&
    window.location.href.match(".steamgifts.com/discussion") === null &&
    window.location.href.match(".steamgifts.com/account*") === null) {

	var entries = getElementsByClassName(document, "giveaway__summary");
	var heading_entries = getElementsByClassName(document, "giveaway__heading__thin");
	var level_entries = getElementsByClassName(document, "giveaway__column--contributor-level giveaway__column--contributor-level--positive");
	var header_entries = getElementsByClassName(document, "nav__right-container");
	var entry_counts = getElementsByClassName(document, "giveaway__links");
	var wl_entries = getElementsByClassName(document, "giveaway__column--whitelist");
	var user_elements = getElementsByClassName(document, "nav__avatar-outer-wrap");

	var cur_user = null;
	var username_start_pos = user_elements[0].outerHTML.indexOf('<a href="/user/') + 15;
	var username_end_pos = user_elements[0].outerHTML.indexOf('" class=');
	cur_user = user_elements[0].outerHTML.slice(username_start_pos, username_end_pos);

	var l_color = ['#CC0000','#CC6600','#CCCC00','#66CC00','#00CC00','#00CC66','#00CCCC','#0066CC','#0000CC'];
	var b_color = ['#000000','#1F1F1F','#3F3F3F','#5F5F5F','#7F7F7F','#9F9F9F','#BFBFBF','#DFDFDF','#FFFFFF'];
	var e_counts = [-1,50,100,150,200,250,300,500,750,1000];


	for(var i=0; i < header_entries.length; i++) {
		if(header_entries[i].innerHTML.indexOf("Account")>-1) {
			level_node=header_entries[i];
		}
	}

	var featured = document.getElementsByClassName('featured__container')[0];
	var featuredChild = featured.getElementsByClassName('featured__outer-wrap featured__outer-wrap--home');
	if (featuredChild.length > 0) {
		featured.parentElement.removeChild(featured);
	}

	var level_text = level_node.innerHTML.substr(level_node.innerHTML.indexOf("Level") + 5);
	var cur_level = level_text.substr(0,level_text.indexOf("</span>"));
	var cur_points = getElementsByClassName(document, "nav__points")[0].innerHTML;
	//console.log(level_node.innerHTML);
	//console.log(cur_points);

	for(var i=0; i < heading_entries.length; i++) {
		/*if(heading_entries[i].innerHTML.indexOf("Copies")>-1) {
			heading_entries[i].style='background-color:green';
			//console.log(heading_entries[i].innerHTML);
		}*/
		/// CHECK FOR ENOUGH POINTS TO ENTER
		var p_pos = heading_entries[i].innerHTML.indexOf("P");
		if(p_pos>0) {
			//console.log(p_pos + ', ' + cur_points + ', ' + parseInt(heading_entries[i].innerHTML.substr(1,p_pos - 1)));
			var pts = parseInt(heading_entries[i].innerHTML.substr(1,p_pos - 1));
			if(pts > cur_points) {
				heading_entries[i].style='background-color:red';
			}
			/// FREE TO ENTER!
			if(pts === 0) {
				heading_entries[i].style='background-color:#FF00FF';
			}
		}
	}

	for (var e=0;e<entries.length;e++){
		var node_parent = null;

		/// READ COPIES DATA TO CALCULATE/FLAG ODDS
		var copies_txt = null;
		var copies_node = null;
		var copies = null;
		for (var i = 0; i < entries[e].childNodes.length; i++) {
			if (entries[e].childNodes[i].className == "giveaway__heading") {
				for (var j=0; j<entries[e].childNodes[i].childNodes.length;j++) {
					//console.log(entries[e].childNodes[i].childNodes[j].innerHTML);
					if (entries[e].childNodes[i].childNodes[j].className == "giveaway__heading__thin") {
						copies_node = entries[e].childNodes[i].childNodes[j];
						copies_txt = copies_node.innerHTML;
						//console.log(copies_txt);
						copies = 1;
						//console.log(copies_txt.indexOf('Copies'));
						if (copies_txt.indexOf('Copies')>-1){
							//console.log("found copies text");
							copies = parseInt(removeCommas(copies_txt.substr(copies_txt.indexOf("(")+1,copies_txt.indexOf("Copies")-(copies_txt.indexOf("(")+1))));
						}
						//console.log("Copies: " + copies);
						break;
					}
				}
			}
		}

		/// READ ENTRY DATA TO FLAG FOR LOW # OF ENTRIES/BETTER ODDS
		var entry_txt = null;
		var entry_node = null;
		var ent_tot = null;
		var odds = null;
		for (var i = 0; i < entries[e].childNodes.length; i++) {
			if (entries[e].childNodes[i].className == "giveaway__links") {
				entry_node = entries[e].childNodes[i];
				entry_txt = entry_node.innerHTML;
				//console.log(entry_txt);
				ent_tot = parseInt(removeCommas(entry_txt.substr(entry_txt.indexOf("<span>")+6,entry_txt.indexOf("entries<")-(entry_txt.indexOf("<span>")+6))));
				odds = parseInt(ent_tot/copies);

				break;
			}
		}

		/// CHECK FOR WHITELIST GIVEAWAYS
		for (var i = 0; i < entries[e].childNodes.length; i++) {
			if (entries[e].childNodes[i].className == "giveaway__columns") {
				for (var j=0; j<entries[e].childNodes[i].childNodes.length;j++) {
					if (entries[e].childNodes[i].childNodes[j].className == "giveaway__column--whitelist") {
						entries[e].style='background-color:#FF00FF';
						break;
					}
				}
			}
		}

		/// CHECK FOR SELF GIVEAWAYS (SHOULD NEVER HAPPEN)
		if (entries[e].innerHTML.indexOf('by ' + cur_user) > 0) {
			entries[e].style='background-color:#FF0000';
		}


		/// READ LEVEL DATA TO FLAG FOR HIGHEST (ENTERABLE) LEVELS
		var lvl_txt = null;
		var lvl_entry = null;
		var chk_lvl;
		for (var i = 0; i < entries[e].childNodes.length; i++) {
			if (entries[e].childNodes[i].className == "giveaway__columns") {
				for (var j=0; j<entries[e].childNodes[i].childNodes.length;j++) {
					//console.log(entries[e].childNodes[i].childNodes[j].innerHTML);
					if (entries[e].childNodes[i].childNodes[j].className == "giveaway__column--contributor-level giveaway__column--contributor-level--positive") {
						lvl_entry = entries[e].childNodes[i].childNodes[j];
						lvl_txt = lvl_entry.innerHTML;

						chk_lvl = l_color.length - (cur_level - lvl_txt.slice(0, -1).substr(5)) - 1;
						//console.log("lvl_txt: " + lvl_txt);
						//console.log("lvl_txt.slice: " + lvl_txt.slice(0, -1));
						//console.log("lvl_txt.slice.substr: " + lvl_txt.slice(0, -1).substr(5));
						node_parent = getElementsByClassName(lvl_entry.parentNode.parentNode,"giveaway__heading")[0];
						node_parent.style='background-color:' + l_color[chk_lvl];
						break;
					}
				}
			}
		}

		var odds_txt = null;
		var start = null;
		var stop = null;

		odds_txt = '<strong>1 : '+ odds +'</strong>';

		start = entry_txt.indexOf('<span>') + 6;
		stop = entry_txt.indexOf('</span>');
		if (odds === 0 || isNaN(odds)) {
			entry_txt = entry_txt.slice(0, start) + '<font color=#FF00FF>*****</font>' + entry_txt.slice(stop);
		}
		else {
			entry_txt = entry_txt.slice(0, start) + '<font color=' + l_color[8-getBucket(odds)] + '>' + odds_txt + '</font>' + entry_txt.slice(stop);
		}
		//console.log(l_color[8-getBucket(odds)]) + ' - ' + odds;

		//console.log(entry_txt);
		entry_node.innerHTML = entry_txt;
	}
}

if (window.location.href.match(".steamgifts.com/user/") !== null) {
	var elems = document.getElementsByTagName('*'), i;
	var sgt_host = 'http://www.sgtools.info';
	var steamgift=/.*www.steamgifts.com\/user\/([^/]*)(\/|$).*/.exec(window.location.href)[1];

	var steam_user_elements = getElementsByClassName(document, "sidebar__shortcut-inner-wrap");
	var steam_cur_user = null;
	var steam_username_start_pos = steam_user_elements[0].outerHTML.indexOf('href="http://steamcommunity.com/profiles/') + 6;
	var steam_username_end_pos = steam_user_elements[0].outerHTML.indexOf('" data-tooltip="Visit Steam Profile">');
	steam_cur_user = steam_user_elements[0].outerHTML.slice(steam_username_start_pos, steam_username_end_pos);

	for (i in elems) {
		if((' ' + elems[i].className + ' ').indexOf(' ' + "sidebar__navigation" + ' ') > -1) {
			var current=elems[i];
			current.parentElement.appendChild(buildHeader("sgtools"));

			var list = buildList();
			current.parentElement.appendChild(list);

			list.appendChild(buildItem("Real CV sent",sgt_host+"/sent/"+steamgift+"/newestfirst"));
			list.appendChild(buildItem("Real CV won",sgt_host+"/won/"+steamgift+"/newestfirst"));
			list.appendChild(buildItem("Not activated",sgt_host+"/nonactivated/"+steamgift));
			list.appendChild(buildItem("Multiple Wins",sgt_host+"/multiple/"+steamgift));
			list.appendChild(buildItem("View All Games",steam_cur_user+"/games/?tab=all"));

			break;
		}
	}
}




function getElementsByClassName(node,classname) {
  if (node.getElementsByClassName) { // use native implementation if available
    return node.getElementsByClassName(classname);
  } else {
    return (function getElementsByClass(searchClass,node) {
        if ( node === null )
          node = document;
        var classElements = [],
            els = node.getElementsByTagName("*"),
            elsLen = els.length,
            pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)"), i, j;

        for (i = 0, j = 0; i < elsLen; i++) {
          if ( pattern.test(els[i].className) ) {
              classElements[j] = els[i];
              j++;
          }
        }
        return classElements;
    })(classname, node);
  }
}

function removeCommas(str) {
    while (str.search(",") >= 0) {
        str = (str + "").replace(',', '');
    }
    return str;
}

function buildItem(displayText, linkTarget){
	var item = document.createElement("li");
	item.className += " sidebar__navigation__item";

	var link = document.createElement("a");
	link.className += " sidebar__navigation__item__link";
	link.href=linkTarget;
	link.target="_blank";
	item.appendChild(link);

	var div = document.createElement("div");
	div.className += " sidebar__navigation__item__name";
	t = document.createTextNode(displayText);
	div.appendChild(t);
	link.appendChild(div);

	div = document.createElement("div");
	div.className += " sidebar__navigation__item__underline";
	link.appendChild(div);

	return item;
}

function buildHeader(displayText){
	var heading = document.createElement("h3");
	heading.className += " sidebar__heading";
	var t = document.createTextNode(displayText);
	heading.appendChild(t);
	return heading;
}

function buildList(){
	var list=document.createElement("ul");
	list.className += " sidebar__navigation";
	return list;
}

function getBucket(value) {
	var minp = 0;
	var maxp = 8;

	var minv = Math.log(50);
	var maxv = Math.log(1000);

	// calculate adjustment factor
	var scale = (maxv-minv) / (maxp-minp);

	var retVal = parseInt((Math.log(value)-minv) / scale + minp);

	if (retVal<0){retVal=0;}
	if (retVal>maxp){retVal=maxp;}

	return retVal;
}
