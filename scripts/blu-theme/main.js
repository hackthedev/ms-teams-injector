try{
	let marker = document.createElement('div');
	marker.id = 'injected-kind-theme';
	document.head.appendChild(marker);
} catch(err) { console.log(err) } 


		  
applyCSS()



function applyCSS(){
	// Inject CSS here
	
	let style = document.getElementById("css-test") || document.createElement('style')
	style.id = "css-test";
	
	
	style.textContent = `
		/* Your CSS rules here */
		/* Body Background */
		body {
			background: linear-gradient(rgba(31, 31, 31, 0.2), rgba(31, 31, 31, 0.2)), url('${imageBase64Background}'); /* Replace with your base64 image or leave empty */
			background-size: cover;
			background-repeat: no-repeat;
			background-attachment: fixed;
		}
		
		:root {
		  --colorNeutralForeground3: red; /* Change to your desired color */
		  --plugin-font-color: white;
		}

		/* Titlebar */
		[data-tid="entity-header"] {
			background-color: transparent !important;
		}
		div[data-tid^="app-layout-area--title-bar"] span {
			color: var(--plugin-font-color) !important;
		}
		
		[data-testid="title-bar"], [data-tid="app-layout-area--nav"] div div,
		[data-tid="app-layout-area--nav"] span {
			color: var(--plugin-font-color) !important;
			background-color: transparent !important;
		}

		/* Searchbox */
		div[id^='ms-searchux-search-box-'] {
			background-color: transparent !important;
		}
		div[id^='ms-searchux-search-box-'] input {
			color: var(--plugin-font-color) !important;
		}

		/* Nav Header Buttons */
		[data-tid=default-rail-header] button {
			color: var(--plugin-font-color);
		}
		
		/* Nav header '/
		[data-tid="default-rail-header"]{
			border-right: 1px solid var(--plugin-font-color);
		}

		/* Message Pane */
		#message-pane-layout-a11y {
			background-color: transparent;
		}

		/* Divider Wrapper */
		.fui-Divider__wrapper {
			color: var(--plugin-font-color) !important;
		}

		/* Timestamp Labels */
		time[id^="timestamp-"] {
			color: var(--plugin-font-color) !important;
		}

		/* Importance Labels */
		div[id^="importance-"],
		div[id^="important-badge-"] {
			color: red !important;
		}

		/* Read Status Icons */
		span[id^="read-status-icon-"] {
			color: var(--plugin-font-color) !important;
		}

		/* Chat List Categories */
		[role="treeitem"] span[class^="ui-tree__title"] {
			color: var(--plugin-font-color) !important;
		}

		/* chat list container */
		[data-tid="chat-list-layout"], div[class^="chatListItem_buttonsWrapper"] button {
			background-color: transparent !important;
			color: var(--plugin-font-color) !important;
		}

		/* Chat List Single Chat Entry */
		div[id^="chat-list-item"] span {
			color: var(--plugin-font-color) !important;
		}
		div[id^="chat-list-item"] {
			margin-top: 20px !important;
			margin-bottom: 20px !important;
			background-color: rgba(31, 31, 31, 0.3) !important;
			border-radius: 8px;
						
		}
		div[id^="chat-list-item"]:hover {
			background-color: rgba(31, 31, 31, 0.4) !important;
		}

		/* Chat Author Name */
		div[class^="fui-unstable-ChatItem"] span {
			color: var(--plugin-font-color) !important;
			font-weight: bold !important;
		}

		/* App Layout Area */
		.fui-AppLayoutArea,
		.fui-AppLayoutArea > * {
			background-color: transparent !important;
		}

		/* Chat Header */
		div[id^="chat-header"] {
			background-color: transparent;
		}
		div[id^="chat-header"] span {
			color: var(--plugin-font-color) !important;
		}
		
		div[id^="message-body-"] img,
		div[id^="new-message-"] img		{
			width: auto !important;
			height: auto !important;
		}

			`;
	document.head.appendChild(style);
	
	
	if(!document.querySelector("#css-test")){
		setTimeout(() => {
		  applyCSS();
		}, "1000");
	}
		
		
	console.log("Applied CSS")
}


document.addEventListener('click', function(event) {
  try {
    let chatItem = event.target.closest('div[id^="chat-list-item"]');
    if (chatItem) {
      // Your code here
      console.log('Chat list item clicked:', chatItem);
      document.querySelectorAll(`[data-tid="ams-gif-control-button"]`).forEach(gif => { if(gif) gif.click() })
    }
  } catch (error) {
    console.error('Error occurred:', error);
  }
});