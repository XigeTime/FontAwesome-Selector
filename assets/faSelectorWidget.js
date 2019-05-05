// Developed by Harry K (xigeti.me/faselector)


const FAS = {

	config: {
		iconUrl: 'https://cdn.jsdelivr.net/gh/FortAwesome/Font-Awesome/metadata/icons.json',

		// Allowing all icons to be generated and shown at once is not recommended as this may cause performance issues..
		allowAll: false,

		// When allowAll is set too false, the default category will be the first category of icons loaded.
		default_category: "brands",

		// Total icons to load at a time.
		total_load: 150,

		// Scroll threshhold before a new load is triggered.
		scroll_threshhold: 800 // 1100 is the reccomended setting for the [data-modern] theme.
	},

	icons: null,
	running: null,
	loadedSave: 0,
	allLoaded: false,
	sortedIcons: {
		brands: [],
		solid: [],
		regular: []
	},
	spinner: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" id="fas-spinner"><path d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z"/></svg>',

	fetchIcons: () => {
		console.log("FAS: Loading & sorting icons..");
		return new Promise((resolve) => {

			let lt1 = performance.now();
			let icons = new XMLHttpRequest();

			icons.overrideMimeType("application/json");
			icons.open('GET', FAS.config.iconUrl, true);

			icons.onreadystatechange = () => {

			  if (icons.readyState == 4 && icons.status == "200") {
			    FAS.icons = JSON.parse(icons.responseText);
					FAS.sortIcons(lt1);
					resolve();
			  }

			};
			icons.send(null);
	  });

	},

	sortIcons: lt1 => {
		Object.values(FAS.icons).forEach(i => {

			i.styles.forEach(style => {
				FAS.sortedIcons[style].push(i);
			})

		})
		let lt2 = performance.now();
		console.log("FAS: Icons loaded & sorted into categories in " + (lt2 - lt1).toFixed() + "ms.");
	},

	outPutIcons: async selector_id => {
		FAS.running = true;
		FAS.addLoader(selector_id);

		if (FAS.icons == null) {
			let icons = await FAS.fetchIcons();
		}

		let lt1 = performance.now();
		console.log("FAS: Outputting icons..");
		//..
		let selector = document.querySelector("[data-selector='" + selector_id + "'] .fa-child-container");

		let output = new Promise((resolve) => {
			if (FAS.config.allowAll) {
				console.log("FAS Error: AllowAll is currently not supported until pagination/infinite scroll is available..")
				//
				// Object.keys(FAS.sortedIcons).forEach(category => {
				// 	Object.values(FAS.sortedIcons[category]).forEach(icon => {
				// 		setTimeout(() => {
				// 			selector.innerHTML  += icon.svg[category].raw;
				// 		},5);
				// 	})
				// })
				resolve();
			} else {
				let arr = Object.values(FAS.sortedIcons[FAS.config.default_category]);
				for (let i=FAS.loadedSave; i < arr.length; i++) {
					if (i >= (FAS.config.total_load + FAS.loadedSave)) {
						FAS.loadedSave = i;
						resolve();
						break;
					} else if ((i+1) >= arr.length) {
						console.log("FAS: All icons loaded.");
						FAS.allLoaded = true;
						FAS.loadedSave = i;
						resolve();
						break;
					} else {
						setTimeout(() => {
							selector.innerHTML  += arr[i].svg[FAS.config.default_category].raw;
							if ((i+1) >= arr.length) {
								FAS.loadedSave = i;
								resolve();
							}
						},1)
					}


				}

			}
		})
		 await output;
		 FAS.removeLoader(selector_id);
		 console.log("FAS: Outputting icons completed in " + (performance.now() - lt1).toFixed() + "ms");
		 setTimeout(() => {
			 FAS.running = false;
		 },100)
	},

	addLoader: selector => {
		document.querySelector("[data-selector='" + selector + "'] .fa-child-container").innerHTML += FAS.spinner;
	},
	removeLoader: selector => {
		document.querySelector("[data-selector='" + selector + "'] .fa-child-container #fas-spinner").outerHTML = "";
	}


}





document.querySelectorAll("#fa-selector").forEach(el => {
	el.addEventListener("click", () => {
		if (event.target.id !== "fa-selector") return false;
		if (event.target.children[0].children.length <= 1) {
			FAS.outPutIcons(event.target.dataset.selector);
		}
	})
})


document.querySelectorAll(".fa-child-container").forEach(el => {
	el.addEventListener('scroll', () => {
		if (FAS.running != true && FAS.allLoaded != true && el.scrollTop > FAS.config.scroll_threshhold) {
			FAS.config.scroll_threshhold = FAS.config.scroll_threshhold + (FAS.config.scroll_threshhold - 500);
		  FAS.outPutIcons(el.parentElement.dataset.selector);
		}
  })
})

















//
// let FAV = {
// 	searchTypingTimer: null,
// 	selectedFaIconList: null,
// 	faIcons: null,
// 	faElCount: null,
// 	iconsToPopulate: null,
// 	faIconSearchResults: []
// };
//
//const FAS = {
// 	// CONFIG
// 	config: {
// 		// Specify the version of font awesome you are running
// 	  // NOTE: If you using the CDN, please make sure your version of font awesome is supported by FAS.
// 	  //       If you're using a version of font awesome that is not supported, you will need to host a modified version of the icon json file.
// 		iconVersion: "5.7.2",
//
// 	  // Uses CDN to fetch icon class names, set to false to use your own local file.
// 	  useHostedJson: true,
//
// 	  // If "useHostedJson" is set to false, you must specify the location of the local json file here.
// 	  fetchIconUrl: null,
//
// 	  // Enable icon search
// 	  search: true,
//
// 	  // Default icon style
// 	  iconStyle: "solid",
//
// 		searchInterval: 500
//
// 	},
//
// 	selectFaIcon: () => {
// 		// modify this to add your icon where desired
// 	},
//
// 	openFaSelector: (that,event) => {
//
// 	  if (event.target.parentElement.classList.contains("fa-child-container")) {
//
// 	    if (event.target.getAttribute("onclick") != "FAS.selectFaIcon(this,event)") return false;
//
// 	  } else if (!event.target.children.length) {
//
// 	    event.target.classList.toggle('active');
// 	    FAS.createFaElements(event);
//
// 	  } else if (event.target.classList.contains("active")) {
//
// 	    event.target.classList.toggle('active');
// 	    event.target.children[0].style.display = "none";
//
// 	  } else {
//
// 	    event.target.classList.toggle('active');
// 	    if (event.target.offsetHeight != event.target.children[0].style.bottom) {
// 	      event.target.children[0].style.bottom = (event.target.offsetHeight + 10);
// 	    }
// 	    event.target.children[0].style.display = "";
//
// 	  }
// 	},
//
// 	createFaElements: async event => {
// 		// Create container element
// 		FAS.createContainer(event);
//
// 		if (FAS.config.search) {
// 			// Add icon search
// 			FAS.createFaIconSearch();
// 		}
//
// 		await FAS.FASloadJSON(response => {
//
// 			FAV.faIcons = JSON.parse(response);
// 			FAV.selectedFaIconList = FAV.faIcons[FAS.config.iconStyle];
//
// 			// insert icons
// 			FAS.populateFaIcons(false,FAV.faElCount,true);
// 		});
// 	},
//
// 	createContainer: event => {
// 		let faNode = document.createElement("div");
// 	  let faChildNode = document.createElement("div");
// 	  let style = document.createElement('style');
//
// 	  if (!FAV.faElCount) {
// 	    FAV.faElCount = 1;
// 	  } else {
// 	    FAV.faElCount++;
// 	  }
//
// 	  // Add attributes and style
// 	  faNode.setAttribute("class", "fa-selector-container");
// 	  faChildNode.setAttribute("class", "fa-child-container");
// 	  faChildNode.setAttribute("style", "bottom:" + (event.target.offsetHeight + 10) + "px;");
// 	  faChildNode.setAttribute("data-num", FAV.faElCount);
// 	  event.target.setAttribute("data-num", FAV.faElCount);
//
// 	  faContainerNode = faNode.appendChild(faChildNode);
// 	},
//
// 	createFaIconSearch: () => {
// 		let searchNode = document.createElement("input");
//
// 	  searchNode.setAttribute("class", "search-fa-selector");
// 	  searchNode.setAttribute("placeholder", "Search icons...");
// 		searchNode.setAttribute("autofocus", "autofocus");
// 	  searchNode.setAttribute("onchange", "FAS.runFaIconSearch(event)");
//
// 	  faContainerNode.appendChild(searchNode);
// 	},
//
// 	populateFaIcons: (search,selectorNumber,all) => {
// 		if (!all) {
// 	    if (search == true) {
//
// 				if (FAV.faIconSearchResults.length > 0) {
// 					FAV.iconsToPopulate = FAV.faIconSearchResults;
// 				} else {
// 					let msg = document.createElement("span")
// 					msg.innerText = "No results found..";
// 					faContainerNode.appendChild(msg);
// 					if (selectorNumber) {
// 				    document.querySelector("#fa-selector[data-num='" + selectorNumber + "']").appendChild(faContainerNode);
// 				  } else {
// 				    document.querySelector("#fa-selector.active").appendChild(faContainerNode);
// 				  }
// 					return false;
// 				}
//
// 			} else {
// 	      FAV.iconsToPopulate = FAV.selectedFaIconList;
// 	    }
//
// 	    if (FAV.selectedFaIconList == FAV.faIcons.regular) {
// 	      var prefix = "far";
// 	    } else if (FAV.selectedFaIconList == FAV.faIcons.brands) {
// 	      var prefix = "fab";
// 	    } else {
// 	      var prefix = "fas";
// 	    }
//
// 	    FAS.populateThis(FAV.iconsToPopulate,prefix);
// 	  } else {
//
// 	    FAS.populateThis(FAV.faIcons.solid,"fas");
// 	    FAS.populateThis(FAV.faIcons.regular,"far");
// 	    FAS.populateThis(FAV.faIcons.brands,"fab");
//
// 	  }
//
// 	  if (selectorNumber) {
// 	    document.querySelector("#fa-selector[data-num='" + selectorNumber + "']").appendChild(faContainerNode);
// 	  } else {
// 	    document.querySelector("#fa-selector.active").appendChild(faContainerNode);
// 	  }
//
// 		//FAS.bindSearchTimers();
// 	},
//
// 	populateThis: (array,prefix) => {
// 		array.forEach(icon => {
//
// 	    let i = document.createElement("i");
// 	    let iconClassName = prefix + " fa-" + icon;
//
// 	    i.setAttribute("class", iconClassName);
// 	    i.setAttribute("onclick", "selectFaIcon(this,event)");
//
// 	    faContainerNode.appendChild(i);
//
// 	  })
// 	},
//
// 	bindSearchTimers: () => {
//
// 	  document.querySelectorAll(".fa-child-container input").forEach(el => {
//
// 	    el.addEventListener('keyup', event => {
// 	      clearTimeout(FAV.searchTypingTimer);
// 	      FAV.searchTypingTimer = setTimeout(FAS.runFaIconSearch(event), FAS.config.searchInterval);
// 	    });
// 	    el.addEventListener('keydown', clearTimeout(FAV.searchTypingTimer));
//
// 	  })
// 	},
//
// 	toggleFaIconStyle: (style,selectorNumber,event) => {
//
// 		FAV.selectedFaIconList = style;
//
// 	  let elem = document.querySelectorAll('.fa-child-container[data-num="' + selectorNumber + '"] > i');
//
// 	  elem.forEach(elem => {
// 	    elem.parentNode.removeChild(elem)
// 	  })
//
// 	  if (FAS.config.search) {
// 	    let faSearchInput = document.querySelector('.fa-child-container[data-num="' + selectorNumber + '"] > input');
//
// 	    var search = false;
// 	    if (faSearchInput.value != "") {
//
// 	      var search = true;
// 	      FAV.faIconSearchResults = [];
//
// 	      FAV.selectedFaIconList.forEach(icon => {
//
// 	      	if (icon.includes(faSearchInput.value)) {
// 	      	    FAV.faIconSearchResults.push(icon);
// 	      	}
//
// 	      })
//
// 	      style = FAV.faIconSearchResults;
// 	    }
// 	  }
//
// 	  FAS.populateFaIcons(search,FAV.faElCount);
// 	},
//
// 	runFaIconSearch: event => {
// 		let faSearchInput = event.target.value;
// 	 	let selectorNumber = event.target.parentElement.getAttribute("data-num");
// 		let elem = document.querySelectorAll('.fa-child-container[data-num="' + selectorNumber + '"] > i');
//
// 		FAV.faIconSearchResults = [];
//
// 		elem.forEach(elem => {
// 			elem.parentNode.removeChild(elem);
// 		})
//
// 		FAV.selectedFaIconList.forEach(icon => {
//
// 			if (icon.includes(faSearchInput)) {
// 					FAV.faIconSearchResults.push(icon);
// 			}
//
// 		})
//
// 		FAS.populateFaIcons(true,selectorNumber);
// 	},
// //
// 	FASloadJSON: callback => {
// 		if (FAS.config.useHostedJson == true) {
//
// 	    FAS.config.fetchIconUrl = "https://cdn.jsdelivr.net/gh/XigeTime/FontAwesome-Selector/cdn/faicons-v" + FAS.config.iconVersion +".json"
//
// 	  } else if (FAS.config.fetchIconUrl == null) {
//
// 	    alert("Please specify the location of the faicons.json file in your FAS config.");
// 	    return false;
//
// 	  }
// 		var getIcons = new XMLHttpRequest();
//         getIcons.overrideMimeType("application/json");
//
//     getIcons.open('GET', FAS.config.fetchIconUrl, true);
//
//     getIcons.onreadystatechange = function () {
//           if (getIcons.readyState == 4 && getIcons.status == "200") {
//             // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
//             callback(getIcons.responseText);
//           }
//     };
//     getIcons.send(null);
// 	}
//
// };
