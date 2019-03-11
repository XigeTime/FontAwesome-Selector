// Developed by Harry K (xigeti.me/faselector)



// CONFIG

var FASconfig = {
  // Specify the version of font awesome you are running
  // NOTE: If you using the CDN, please make sure your version of font awesome is supported by FAS.
  //       If you're using a version of font awesome that is not supported, you will need to host a modified version of the icon json file.
	"iconVersion": "5.7.2",

  // Uses CDN to fetch icon class names, set to false to use your own local file.
  "useHostedJson": true,

  // If "useHostedJson" is set to false, you must specify the location of the local json file here.
  "fetchIconUrl": null,

  //
  "useFallbackCDN": true


}



var faElCount = false,
    selectedFaIconList,faIcons;

function selectFaIcon(icon,event) {

  // modify this to add your icon where desired

}

function openFaSelector(that,event) {

  if (event.target.parentElement.classList.contains("fa-child-container")) {

    if (event.target.getAttribute("onclick") != "selectFaIcon(this,event)") return false;

  } else if (!event.target.children.length) {

    event.target.classList.toggle('active');
    createFaElements(event);
    bindSearchTimers();

  } else if (event.target.classList.contains("active")) {

    event.target.classList.toggle('active');
    event.target.children[0].style.display = "none";

  } else {

    event.target.classList.toggle('active');
    if (event.target.offsetHeight != event.target.children[0].style.bottom) {
      event.target.children[0].style.bottom = (event.target.offsetHeight + 10);
    }
    event.target.children[0].style.display = "";
    event.target.children[0].children[0].focus();

  }

}

function toggleFaIconStyle(style,selectorNumber,event) {

  selectedFaIconList = style;

  var elem = document.querySelectorAll('.fa-child-container[data-num="' + selectorNumber + '"] > i');

  elem.forEach(function(elem){
    elem.parentNode.removeChild(elem)
  })

  faSearchInput = document.querySelector('.fa-child-container[data-num="' + selectorNumber + '"] > input');

  var search = false;
  if (faSearchInput.value != "") {

    var search = true;
    faIconSearchResults = [];

    selectedFaIconList.forEach(function(icon){

    	if (icon.includes(faSearchInput.value)) {
    	    faIconSearchResults.push(icon);
    	}

    })

    var style = faIconSearchResults;
  }

  populateFaIcons(search,faElCount,style)

}

async function createFaElements(event) {

  // Create container element
  createContainer(event);

  // Add icon search
  createFaIconSearch();

  await FASloadJSON(function(response){
    
    faIcons = JSON.parse(response);
    selectedFaIconList = JSON.parse(response).solid;

    // insert icons
    populateFaIcons(false,faElCount,selectedFaIconList);
  });

}


function createContainer(event) {
  var faNode = document.createElement("div"),
      faChildNode = document.createElement("div"),
      style = document.createElement('style'),
      faDropPos = "top";

  if (!faElCount) {
    faElCount = 1;
  } else {
    faElCount++;
  }

      // Add attributes and style
  faNode.setAttribute("class", "fa-selector-container");
  faChildNode.setAttribute("class", "fa-child-container");
  faChildNode.setAttribute("style", "bottom:" + (event.target.offsetHeight + 10) + "px;");
  faChildNode.setAttribute("data-num", faElCount);
  event.target.setAttribute("data-num", faElCount);

  faContainerNode = faNode.appendChild(faChildNode);

}


function populateFaIcons(search,selectorNumber,style) {

  if (search == true) {
    iconsToPopulate = faIconSearchResults;
  } else {
    iconsToPopulate = selectedFaIconList;
  }

  iconsToPopulate.forEach(function(icon){

    if (selectedFaIconList == faIcons.regular) {
      var prefix = "far";
    } else if (selectedFaIconList == faIcons.brands) {
      var prefix = "fab";
    } else {
      var prefix = "fas";
    }

    var i = document.createElement("i"),
        iconClassName = prefix + " fa-" + icon;

    i.setAttribute("class", iconClassName);
    i.setAttribute("onclick", "selectFaIcon(this,event)");

    faContainerNode.appendChild(i);

  })

  if (selectorNumber) {
    document.querySelector("#fa-selector[data-num='" + selectorNumber + "']").appendChild(faContainerNode);
  } else {
    document.querySelector("#fa-selector.active").appendChild(faContainerNode);
  }


}


function createFaIconSearch() {

  var searchNode = document.createElement("input");

  searchNode.setAttribute("class", "search-fa-selector");
  searchNode.setAttribute("placeholder", "Search icons...");
  searchNode.setAttribute("autofocus", "autofocus");

  faContainerNode.appendChild(searchNode);

}

function bindSearchTimers() {

  var faSearchTypingTimer;
  faSearchInterval = 500;

  document.querySelectorAll(".fa-child-container input").forEach(function(el){

    el.addEventListener('keyup', function(event) {
      clearTimeout(faSearchTypingTimer);
      faSearchTypingTimer = setTimeout(runFaIconSearch(event), faSearchInterval);
    });
    el.addEventListener('keydown', clearTimeout(faSearchTypingTimer));

  })
}

function runFaIconSearch(event) {

  faIconSearchResults = [];
  faSearchInput = event.target.value;

  var selectorNumber = event.target.parentElement.getAttribute("data-num");
  var elem = document.querySelectorAll('.fa-child-container[data-num="' + selectorNumber + '"] > i');

  elem.forEach(function(elem){
  	elem.parentNode.removeChild(elem)
  })

  selectedFaIconList.forEach(function(icon){

  	if (icon.includes(faSearchInput)) {
  	    faIconSearchResults.push(icon);
  	}

  })

  populateFaIcons(true,selectorNumber,selectedFaIconList);

  event.target.focus();

}

async function FASloadJSON(callback) {

  if (FASconfig.useHostedJson == true) {

    FASconfig.fetchIconUrl = "https://cdn.jsdelivr.net/gh/XigeTime/FontAwesome-Selector/cdn/faicons-v" + FASconfig.iconVersion +".json"

  } else if (FASconfig.fetchIconUrl == null) {

    alert("Please specify the location of the faicons.json file in your FAS config.");
    return false;

  }


   var getIcons = new XMLHttpRequest();
       getIcons.overrideMimeType("application/json");

   getIcons.open('GET', FASconfig.fetchIconUrl, true);

   getIcons.onreadystatechange = function () {
         if (getIcons.readyState == 4 && getIcons.status == "200") {
           // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
           callback(getIcons.responseText);
         }
   };
   getIcons.send(null);
}
