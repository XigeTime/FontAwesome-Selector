// Developed by Harry K (xigeti.me/faselector)


const FAS = {

	config: {
		iconUrl: 'https://cdn.jsdelivr.net/gh/FortAwesome/Font-Awesome/metadata/icons.json',

		// This is the default category shown when the selector is first loaded.
		category: "regular",

		// If true, icon catagorys will be displayed at the top of the selector.
		// If false, default category is used and cannot be changed by user.
		// You can set the default category to "all" to display all icons uncategorised.
		show_categorys: true,

		// NOTE: When search is enabled, you MUST include "results" in this array!
		// NOTE: Your default icon category MUST be included in this array!
		// You can add "all" here to have a category containing all available icons.
		include_categorys: ["all","solid","regular","brands","results"],

		// Total icons to load at a time.
		total_load: 150,

		// Scroll threshhold before a new load is triggered.
		scroll_threshhold: 500,

		show_unicode: false, 	// Display the icons unicodes.
		show_labels: false, 	// Display the icons labels.

		// Enable debug mode to recieve time stamps and logs in the console
		debug: {
			enabled: false,

			lt1: null, 	// Used for storing timestamp values.
			lt2: null 	// Used for storing timestamp values.
		},

		search: {
			enabled: true, 					// Enable/disable the search for all selectors.
			use_alias_terms: true,	// If true, the search will return results for common aliases. E.g: Search; 'social', returns; 'facebook' etc..
			search_all_icons: false,// If true, the search will search through all categorys, reguardless of currentlly selected category.
			field_placeholder: "Search icons..." // Placeholder text for the selectors search box.
		}
	},

	icons: null,
	running: null,
	selectors: {},

	fetchIcons: selector_id => {

		if (FAS.config.debug.enabled) {
			console.log("FAS: Loading & sorting icons..");
		}

		return new Promise((resolve) => {
			FAS.config.debug.lt1 = null;
			if (FAS.config.debug.enabled) {
				FAS.config.debug.lt1 = performance.now();
			}

			let icons = new XMLHttpRequest();

			icons.overrideMimeType("application/json");
			icons.open('GET', FAS.config.iconUrl, true);

			icons.onreadystatechange = () => {

			  if (icons.readyState == 4 && icons.status == "200") {
			    FAS.icons = JSON.parse(icons.responseText);
					resolve();
			  }

			};
			icons.send(null);
	  });

	},

	sortIcons: (selector_id) => {
		Object.values(FAS.icons).forEach(i => {

			i.styles.forEach(style => {
				FAS.selectors[selector_id].sortedIcons[style].icons.push(i);
			})

		})

		if (FAS.config.debug.enabled) {
			FAS.config.debug.lt2 = performance.now();
			console.log("FAS: Icons loaded & sorted into categories in " + (FAS.config.debug.lt2 - FAS.config.debug.lt1).toFixed() + "ms.");
		}

	},

	outPutIcons: async (selector_id,is_search) => {
		FAS.running = true;

		if (FAS.config.debug.enabled) {
			FAS.config.debug.lt1 = performance.now();
			console.log("FAS: Outputting icons..");
		}

		let selector = null;
		if (is_search) {
			selector = document.querySelector("[data-fa-selector='" + selector_id + "'] .fa-child-container .results");
		} else {
			selector = document.querySelector("[data-fa-selector='" + selector_id + "'] .fa-child-container ." + FAS.selectors[selector_id].category);
		}

		let output = new Promise((resolve) => {
			let obj = null;
			let arr = null;
			if (is_search) {
				obj = is_search;
				arr = is_search.icons;
			} else {
				if (FAS.selectors[selector_id].category != "all") {
					obj = FAS.selectors[selector_id].sortedIcons[FAS.selectors[selector_id].category]
					arr = Object.values(obj.icons);
				} else {
					 if (FAS.icons.loaded == null) {
						 FAS.icons.loaded = 0;
					 }
					obj = FAS.icons;
					arr = Object.values(FAS.icons);
				}
			}

			for (let i=obj.loaded; i < arr.length; i++) {
				if (i >= (FAS.config.total_load + obj.loaded)) {
					// Stop loading icons once results meet the threshhold.
					obj.loaded = i;
					FAS.config.scroll_threshhold = FAS.config.scroll_threshhold - 500;
					resolve();
					break;

				} else {
					// delaying output by 1ms allows for a smooth flow of results.
					setTimeout(() => {
						if (is_search) {
							if (FAS.config.search.search_all_icons || FAS.selectors[selector_id].category == "all") {
								arr[i].styles.forEach(style => {
									let uni;
									let label;
									if (FAS.config.show_unicode) {
										uni = arr[i].unicode;
									}
									if (FAS.config.show_labels) {
										label = arr[i].label;
									}
									FAS.outputThis(selector,arr[i].svg[style].raw,uni,label)
								})
							} else {
								let uni;
								let label;
								if (FAS.config.show_unicode) {
									uni = arr[i].unicode;
								}
								if (FAS.config.show_labels) {
									label = arr[i].label;
								}
								if (arr[i].svg[FAS.selectors[selector_id].category]) {
									FAS.outputThis(selector,arr[i].svg[FAS.selectors[selector_id].category].raw,uni,label)
								}
							}
						} else {
							if (FAS.selectors[selector_id].category == "all") {
								if (arr[i].styles != null) {
									arr[i].styles.forEach(style => {
										let uni;
										let label;
										if (FAS.config.show_unicode) {
											uni = arr[i].unicode;
										}
										if (FAS.config.show_labels) {
											label = arr[i].label;
										}
										FAS.outputThis(selector,arr[i].svg[style].raw,uni,label)
									})
								}
							} else {
								let uni;
								let label;
								if (FAS.config.show_unicode) {
									uni = arr[i].unicode;
								}
								if (FAS.config.show_labels) {
									label = arr[i].label;
								}
								FAS.outputThis(selector,arr[i].svg[FAS.selectors[selector_id].category].raw,uni,label)
							}
						}

						if ((i+1) >= arr.length) {
							// All icons of this category have loaded.
							obj.all_loaded = true;
							obj.loaded = i;

							if (FAS.config.debug.enabled) {
								console.log("FAS: All icons loaded.");
							}

							resolve();
						}
					},1)
				}


			}
		})
		await output;
		if (FAS.config.debug.enabled) {
			console.log("FAS: Outputting icons completed in " + (performance.now() - FAS.config.debug.lt1).toFixed() + "ms");
		}
		setTimeout(() => {
		 	// Use timeout to prevent constant scrolling flooding the loading system.
			FAS.running = false;
		},100)
	},

	outputThis: (selector,svg,uni,label) => {
		if (uni || label) {
			let el = document.createElement("i");
			if (uni) {
				let uniCode = document.createElement("span");
				uniCode.innerText = "#" + uni;
				el.appendChild(uniCode);
			}

			if (label) {
				let name = document.createElement("strong");
				name.innerText = label;
				el.appendChild(name);
			}

			el.insertAdjacentHTML("beforeend",svg);
			selector.appendChild(el);
		} else {
			selector.insertAdjacentHTML("beforeend",svg);
		}

	},

	initSelector: async () => {

		let selector_id = event.target.dataset.faSelector;
		let sort_icons = false;

		if (FAS.icons == null) {
			// If we havent loaded the icons yet, load them in!
			sort_icons = true;
			await FAS.fetchIcons(selector_id);
		}

		FAS.selectors[selector_id] = {
			category: FAS.config.category,
			sortedIcons: {
				all: {
					all_loaded: false,
					loaded: 0,
					icons: FAS.icons
				},
				brands: {
					all_loaded: false,
					loaded: 0,
					icons: []
				},
				solid: {
					all_loaded: false,
					loaded: 0,
					icons: []
				},
				regular: {
					all_loaded: false,
					loaded: 0,
					icons: []
				}
			},
		};

		if (sort_icons) {
			FAS.sortIcons(selector_id);
		}

		if (Object.values(FAS.selectors).length > 1) {
			// if icons have already been loaded and sorted, use stored info..
			let sid;
			for (let i=0; i <= Object.values(FAS.selectors).length; i++) {
				if (Object.values(FAS.selectors)[i].sortedIcons.brands.icons.length > 0) {
					sid = i;
					break;
				}
			}

			FAS.selectors[event.target.dataset.faSelector].sortedIcons = {
				brands: {
					all_loaded: false,
					loaded: 0,
					icons: Object.values(FAS.selectors)[sid].sortedIcons.brands.icons
				},
				solid: {
					all_loaded: false,
					loaded: 0,
					icons: Object.values(FAS.selectors)[sid].sortedIcons.solid.icons
				},
				regular: {
					all_loaded: false,
					loaded: 0,
					icons: Object.values(FAS.selectors)[sid].sortedIcons.regular.icons
				}
			}
		}

		FAS.createChildren(selector_id);
		FAS.createCategorys(selector_id);
		FAS.outPutIcons(selector_id);

	},

	createChildren: selector_id => {
		let selector = document.querySelector("[data-fa-selector='" + selector_id + "']");

		let childContainer = document.createElement("span");
		childContainer.setAttribute("class", "fa-child-container");
		selector.appendChild(childContainer);

		if (FAS.config.search.enabled) {
			let searchField = document.createElement("input");
			searchField.setAttribute("placeholder", FAS.config.search.field_placeholder);
			searchField.setAttribute("onkeyup", "FAS.searchIcons()");
			selector.children[0].appendChild(searchField);
		}

		let el = document.querySelector("[data-fa-selector='" + selector_id + "'] .fa-child-container");
		el.addEventListener('scroll', () => {
			let selector_id = el.parentElement.dataset.faSelector;
			if (FAS.running != true && FAS.selectors[selector_id].sortedIcons[FAS.selectors[selector_id].category].all_loaded != true && el.scrollTop > FAS.config.scroll_threshhold) {
				FAS.config.scroll_threshhold = FAS.config.scroll_threshhold + (FAS.config.scroll_threshhold - 200);
				FAS.outPutIcons(selector_id);
			}
		})
	},

	createIconContainers: selector => {
		FAS.config.include_categorys.forEach(category => {
			let el = document.createElement("div");
			el.setAttribute("class", category);
			selector.appendChild(el);
		})
	},

	createCategorys: selector_id => {

		let categorys = [];
		let selector = document.querySelector("[data-fa-selector='" + selector_id + "'] .fa-child-container");

		if (FAS.config.show_categorys) {
			FAS.config.include_categorys.forEach(category => {

				if (category == "results") return false;

				let el = document.createElement("span");
				el.setAttribute("onclick", "FAS.setCategory('" + category + "'," + selector_id + ")");
				el.setAttribute("class", "FASCategory");
				el.innerText = category;

				categorys.push(el);

				let categoryContainer = document.createElement("div");
				categoryContainer.setAttribute("class", "FACatagorys");

				for (let i=0; i < categorys.length; i++) {
					categoryContainer.appendChild(categorys[i]);
				}

				selector.appendChild(categoryContainer);

			})
		}



		FAS.createIconContainers(selector);
	},

	setCategory: async (category,selector_id) => {
		let catContainer = document.querySelector("[data-fa-selector='" + selector_id + "'] .fa-child-container ." + category);

		if (catContainer.offsetHeight > 0) {
			// check if category is currently visible.
			return false;
		} else {


			FAS.clearSelector(selector_id);
			FAS.selectors[selector_id].category = category;
			FAS.outPutIcons(selector_id);
			catContainer.classList.remove("hidden");
			catContainer.style.display = "flex";

		}

	},

	clearSelector: selector_id => {
		document.querySelectorAll("[data-fa-selector='" + selector_id + "'] .fa-child-container > div").forEach(cat => {
			if (cat.classList.contains("FACatagorys") != true) {
				cat.style = "";
				cat.classList.add("hidden");
			}
		})
	},

	searchIcons: () => {
		let searchedFor = event.target.value.toLowerCase();
		let selector_id = event.target.parentElement.parentElement.dataset.faSelector;

		if (searchedFor.length == 0) {
			FAS.setCategory(FAS.selectors[selector_id].category,selector_id);
			return false;
		}

		let results = {
			all_loaded: false,
			loaded: 0,
			icons: []
		};
		results.icons.length = 0;
		let search;
		search = FAS.icons;
		if (!FAS.config.search.search_all_icons) {
			let search = FAS.selectors[selector_id].sortedIcons[FAS.selectors[selector_id].category].icons;
		}

		Object.values(search).forEach(icon => {
			if (icon.label) {
				if (icon.label.toLowerCase().includes(searchedFor)) {
					results.icons.push(icon);
					return;
				}
			}
			if (FAS.config.search.use_alias_terms) {
				if (icon.search && icon.search.terms.length > 0) {
					icon.search.terms.forEach(term => {
					  if (term && term.length > 0 && term.includes(searchedFor)) {
					  	results.icons.push(icon)
					  	return;
					  }
					})
				}
			}
			return;
		})
		FAS.clearSelector(selector_id);
		document.querySelector("[data-fa-selector='" + selector_id + "'] .fa-child-container .results").innerHTML = null;
		FAS.outPutIcons(selector_id, results);
		document.querySelector("[data-fa-selector='" + selector_id + "'] .fa-child-container .results").style.display = "flex";
	}

}





document.querySelectorAll("[data-fa-selector]").forEach(el => {
	el.addEventListener("click", () => {
		if (event.target.children.length == 0 && event.target.dataset.faSelector) {
			FAS.initSelector();
		} else if (event.target.dataset.faSelector && event.target.children[0].offsetHeight > 0) {
			event.target.children[0].style.display = "none";
		} else if (event.target.dataset.faSelector) {
			event.target.children[0].style.display = "block";
		}
		return false;
	})
})
