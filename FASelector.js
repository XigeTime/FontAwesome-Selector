const FASDefaults = {
    // Selector specific options

    messages: {
        open: 'Open Selector', // button to open the selector.
        load_more: 'Show More Icons!', // button to load more icons.
        search_placeholder: 'Search...', // Placeholder text for the search field.
        no_results: selector => {
            let msg = document.createElement('div');
            msg.innerHTML = selector.icons.frown.svg.solid.raw + 'We were unable to find any results for that!';
            return msg;
        } // Message to show when no search results have been found. (Can be a function to return html, html string, or plain text string)
    },

    classes: {
        container_class: 'fa-container', // The container of the selector and button.
        button_class: 'btn', // Button that opens the selector.
        asset_class: 'fa-asset-container', // Container for elements like the search, results per page & category.
        results_container_class: 'fa-icon-results', // Container that holds the icon results.
        icon_container_class: 'fa-icon-container', // Container for each individual icon including labels.
        icon_class: 'fa-icon', // For the icon itself.
        search_class: 'fa-search', // For the search field.
        rpp_class: 'fa-results-per-page', // For the results per page field.
        cat_select_class: 'fa-select-category' // For the category select field.
        no_results_class: 'fa-no-results' // For the no results message.
    },

    categories: ['solid', 'brands'], // Available catagorys - set to false to disable catagorys.
    category: 'solid', // default icon category.

    search: true, // show the search field.

    labels: true, // show icon labels.
    unicodes: true, // show icon unicodes.

    icons_url: 'icons.json', // where the icon data is located.
    icon_count: 20, // default amount of icons to load at one time.

    results_per_page: [5, 20, 50, 100] // Available options for the results per page field, set to false to disable.
}

class FASelector {
    constructor (options) {
        const { messages, categories, category, search, labels, unicodes, icons_url, icon_count, results_per_page, classes } = (options) ? options : FASDefaults;

        this.isOpen = false;

        this.classes = (classes) ? classes : FASDefaults.classes;
        this.messages = (messages) ? messages : FASDefaults.messages;
        this.categories = (categories) ? categories : FASDefaults.categories;
        this.category = (category) ? category : FASDefaults.category;
        this.search - (search) ? search : FASDefaults.search;
        this.labels = (labels) ? labels : FASDefaults.labels;
        this.unicodes = (unicodes) ? unicodes : FASDefaults.unicodes;
        this.icons_url = (icons_url) ? icons_url : FASDefaults.icons_url;
        this.icon_count = (icon_count) ? icon_count : FASDefaults.icon_count;
        this.results_per_page = (results_per_page) ? results_per_page : FASDefaults.results_per_page;
    }

    // Initialise the selector as it's own object component.
    init () {
        const { open } = this.messages;
        const { container_class, button_class, asset_class, results_container_class } = this.classes;

        // Creating the basic elements that will build the selector.
        let container = document.createElement('div');
        container.classList.add(container_class);

        // You can only initialise a selector once to prevent them conflicting.
        if (this.initialised) {
            container.innerText = 'You can only initialise a selector once. Please declare a new selector for each element.';
            console.log('You can only initialise a selector once. Please declare a new selector for each element.');
            return container;
        } this.initialised = true; // Set the indicator that this selector has been initialised.

        let button = document.createElement('button');
        button.classList.add(button_class);
        button.innerText = open;

        // Add the opening function to our button so the magic will happen.
        button.addEventListener('click', () => this.openSelector());

        container.appendChild(button);

        let asset_container = document.createElement('div');
        asset_container.classList.add(asset_class);
        asset_container.style.display = 'none';
        asset_container.style.opacity = 0;
        asset_container.style.transition = 'opacity .5s';

        // We also need a child container to hold our icons!
        let icons_container = document.createElement('div');
        icons_container.classList.add(results_container_class);

        // add search if enabled
        let search;
        if (this.search) {
            search = this.renderSearch();
            asset_container.appendChild(search);
        }

        // add results per page field
        let results;
        if (this.results_per_page) {
            results = this.renderResultsPerPage();
            asset_container.appendChild(results);
        }

        // add category field
        let catagory_select;
        if (this.categories) {
            catagory_select = this.renderCategorySelect();
            asset_container.appendChild(catagory_select);
        }

        asset_container.appendChild(icons_container);
        container.appendChild(asset_container);

        // bind the elements so we have easy access later.
        this.els = {
            container: container,
            button: button,
            icons_container: icons_container,
            search: search,
            asset_container: asset_container,
            results_per_page: results,
            catagory_select: catagory_select
        };
        
        // Return our element so that it can be placed anywhere in the dom.
        return container;
    }

    async openSelector () {
        if (this.isOpen) return this.closeSelector();

        this.isOpen = true;
        
        // If the icons haven't been loaded in yet, we'll do that first.
        if (!this.icons) {
            this.icons = await this.loadIcon();
            this.total_results = Object.values(this.icons).length;
            this.completed_icons = [];
        }

        // remove no results message
        if (this.els.no_results) {
            this.els.no_results.outerHTML = null;
            this.els.no_results = null;
        }

        // reset search
        if (this.els.search) this.els.search.value = '';

        this.els.asset_container.style.display = '';
        setTimeout(() => this.els.asset_container.style.opacity = 1,1);

        this.displayIcons();

        document.addEventListener('click', () => this.closeSelector(), true);
    }

    loadIcon () {
        return fetch(this.icons_url)
            .then(response => response.json())
            .then(json => json);
    }

    displayIcons (icons) {
        const { icons_container } = this.els;
        const { icon_container_class } = this.classes;
        let x=0; // variable for storing the amount of displayed icons this round

        if (!icons) var icons = this.icons;

        if (icons.length === 0) return this.noResults();

        for (let icon of Object.values(icons)) {
            // Prevent duplicating icons
            if (this.completed_icons.includes(icon.label)) continue;

            // Render the icon
            let iconSvg = this.renderSvgIcon(icon.svg);

            // If there is no icon for the current style, or something has gone wrong, we'll skip to the next one!
            if (iconSvg === false) continue;

            // Create the icon container & append the icon svg
            let el = document.createElement('div');
            el.classList.add(icon_container_class);
            el.appendChild(iconSvg);
            ++x; // increment

            // if enabled, create the label
            if (this.labels) {
                const label = this.addLabel(icon.label);
                el.appendChild(label);
            }

            // we want to log this icon so we don't duplicate it & then display
            this.completed_icons.push(icon.label);
            icons_container.appendChild(el);

            // stop rendering icons when the limit has been reached.
            if (this.icon_count===x) break;
        }

        // check to see if all icons have been loaded.
        if (this.completed_icons.length < this.total_results) { 

            // remove the current load more button.
            if (this.els.load_more) {
                this.els.load_more.outerHTML = '';
                this.els.load_more = null;
            }

            // create the load more button
            let load_more = document.createElement('button');
            load_more.innerText = this.messages.load_more;

            // We need to bind the load more function, and append it to the bottom of the selector.
            load_more.addEventListener('click', () => {
                let searched_term = this.els.search.value;
                if (!searched_term || searched_term === '') {
                    this.displayIcons()
                } else {
                    this.search(true);
                }         
            });

            this.els.load_more = load_more;
            this.els.icons_container.appendChild(load_more);

        } else if (this.els.load_more) {
            // remove the load more button.
            this.els.load_more.outerHTML = '';
            this.els.load_more = null;
        }
    }

    addLabel (label) {
        // Add a label to the icon container
        let span = document.createElement('span');
        span.innerText = label;
        return span;
    }

    renderSvgIcon (icondata) {
        // render the icon using the svg data from the import
        icondata = icondata[this.category];
        if (!icondata) return false;

        const { raw } = icondata;
        const { icon_class } = this.classes;

        let icon = document.createElement('div');
        icon.classList.add(icon_class);
        icon.innerHTML = raw;

        return icon;
    }

    renderSearch () {
        const { search_class } = this.classes;
        const { search_placeholder } = this.messages;
        // create the search input field and bind the search function.
        let search = document.createElement('div');
        search.classList.add(search_class);
        
        let input = document.createElement('input');
        input.addEventListener('keyup', () => this.search());
        input.setAttribute('placeholder', search_placeholder);

        search.appendChild(input);

        return input;
    }

    search (page) {
        // grab the search term from the input
        const searched_term = this.els.search.value.toString();

        if (!page) {
            // empty the current icons and stored completed icons
            this.els.icons_container.innerHTML = null;
            this.completed_icons = [];
            this.total_results = Object.values(this.icons).length;

            if (!searched_term || searched_term === '') {
                // if we have no search term, show all results
                this.displayIcons();
                return;
            }
        }

        // filter each icons using the label and the search terms to determine a match
        const icons = Object.values(this.icons).filter(icon => {
            if (icon.styles.indexOf(this.category) < 0) return false;

            if (icon.label.toLowerCase().indexOf(searched_term) > -1) return true;

            for (let term of icon.search.terms) {
                if (term.toString().toLowerCase().indexOf(searched_term) > -1) return true;
            }

            return false;
        })

        this.total_results = icons.length;
        
        // display icons using the filtered set.
        this.displayIcons(icons);
    }

    changeIconCount (count) {
        // change the count variable, which will be reflected when we request new search results.
        this.icon_count = parseInt(count);
        this.search();
    }

    renderResultsPerPage () {
        const { rpp_class } = this.classes;
        // create the results per page field.
        let select = document.createElement('select');
        select.classList.add(rpp_class);

        for (let option of this.results_per_page) {
            let el = document.createElement('option');
            el.value = option;
            el.innerText = option;
            if (option === this.icon_count) el.selected = true;
            select.appendChild(el);
        }

        select.addEventListener('change', () => this.changeIconCount(this.els.results_per_page.value));

        return select;
    }

    changeCategory (category) {
        // change the category variable, which will be reflected when we request new search results.
        this.category = category;
        this.search();
    }

    renderCategorySelect () {
        const { cat_select_class } = this.classes;
        // create the category field.
        let select = document.createElement('select');
        select.classList.add(cat_select_class);

        for (let category of this.categories) {
            let el = document.createElement('option');
            el.value = category;
            el.innerText = category;
            if (category === this.category) el.selected = true;
            select.appendChild(el);
        }

        select.addEventListener('change', () => this.changeCategory(this.els.catagory_select.value));

        return select;
    }   

    closeSelector () {
        // if the selector isn't open, nothing to close
        if (!this.isOpen) return;
        const els = Object.values(this.els);

        // if the target is one of our elements, prevent closing.
        let isChild = false;
        els.forEach(el => (el === event.target) ? isChild = true : '');
        if (isChild) return;

        this.isOpen = false;
        this.els.asset_container.style.opacity = 0;
        setTimeout(() => this.els.asset_container.style.display = 'none', 510);
    }
    
    noResults () {
        const { no_results } = this.messages;
        const { no_results_class } = this.classes;

        let message = document.createElement('p');
        message.classList.add(no_results_class);

        if (typeof no_results === 'function') {
            message.appendChild(no_results(this));
        } else {
            message.innerHTML = no_results;
        }

        this.els.no_results = message;
        this.els.icons_container.appendChild(message);
    }
}

const IconSearch = new FASelector({
    categories: ['solid', 'light', 'regular', 'brands', 'duotone']
});

document.getElementById('fas1').appendChild(IconSearch.init());