## WARNING: Do not use on a production site. Wait for a stable release.

# FontAwesome-Selector
Vanilla JS Font Awesome icon selector widget with zero dependancies, easy installation & cross browser support.

[Check out the live demo here](http://xigeti.me/faselector/)

### Installation

1. First, make sure you have [FontAwesome](https://fontawesome.com/start) installed. I recommend using the latest version of FontAwesome in order to ensure all icons show up properly. 

2. Clone or download this repository.

3. Link to the FASelector CSS at the top of your HTML file.\
`<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/XigeTime/FontAwesome-Selector/cdn/vUNSTABLE/faSelectorStyle.min">`

4. Link to the FASelector JS just before the closing body tag in your HTML file.\
`<script src="https://cdn.jsdelivr.net/gh/XigeTime/FontAwesome-Selector/cdn/vUNSTABLE/faSelectorWidget-vUNSTABLE.min"></script>`

5. You will now be able to add your FASelectorWidget anywhere in your HTML file by using the onclick and ID attributes. *(Note, the widget element must be nestable. A, SPAN, DIV etc.. work for all browsers, some elements like BUTTON, don't work in firefox.)*\
`onclick="openFaSelector(this,event)" id="fa-selector"`

**Example Element**:\
`<span onclick="openFaSelector(this,event)" id="fa-selector">My Button</span>`

### Change Selector Theme

You can change the selector theme by adding the "data-theme" tag.\
`data-theme="modern"`

#### Supported Browsers (Latest)
- Google Chrome
- Mozilla Firefox
- Opera
- Microsoft Edge
- Internet Explorer
- Safari
