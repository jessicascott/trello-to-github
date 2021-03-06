(global => {
	let title, message, checklists;
	const cardTitle = document.getElementsByClassName('card-detail-title-assist')[0];
	const cardDescription = document.getElementsByClassName('js-card-desc')[0];
	/*
		Add a footnote to the Github issue body
		to link back to the Trello card
	*/
	const appendMessageBody = (body) => {
		const cardUrl = window.location.href;
		const footnote = `

---
:information_source: [This card was copied from Trello](${cardUrl})`;
		return body + footnote;
	};

	/*
		Copy over any checklists
	*/
	const includeChecklists = (body) => {
		let markdown = [];
		for (let i = 0; i < checklists.length; i++) {
			let title = `
### ${checklists[i].getElementsByTagName('h3')[0].innerText} `;
			let items = checklists[i].getElementsByClassName('checklist-item');
			let markdownItems = [];
			for (let j = 0; j < items.length; j++) {
				let check = items[j].classList.value.includes('checklist-item-state-complete') ? 'x' : ' ';
				markdownItems.push(`
- [${check}] ${items[j].innerText}`);
			}
			markdown.push(`${title} ${markdownItems.join(' ')}`);
		}
		return body + markdown;
	};

	/*
		Copy title and markdown from 
		Trello card
	*/
	const copyCard = () => {
		

		/*
			Grab title from card
		*/
		const titleElement = cardTitle;
		title = titleElement.innerText;
		/*
			Simulate opening text area to get markdown
		*/
		document.getElementsByClassName('js-edit-desc')[0].click();
		cardDescription.classList.remove('hide-on-edit');

		/* 
			Get the value of the textarea 
			(the markdown)
		*/
		message = document.getElementsByClassName('card-detail-edit')[0].childNodes[1].value;
		if (document.getElementById('include_checklists') && document.getElementById('include_checklists').checked) {
			message = includeChecklists(message);
		}
		message = appendMessageBody(message);
		/*
			Simulate closing the area
			now we have the markdown
		*/
		cardDescription.classList.add('hide-on-edit');
		cardTitle.click();
	};
	
	/*
		Create a 'Copy to Github' button
		that will sit in the card template's sidebar
	*/
	const createSideButton = () => {
		const button = document.createElement('div');
		button.innerHTML= `
			<a class="button-link" href="#" style="margin-bottom: 10px;">
				<span class="icon-sm plugin-icon" style="background-image: url('https://github.trello.services/images/icon.svg?color=999');"></span> 
				Copy to Github
			</a>`;
		button.addEventListener("click", ()=> {
			// copyCard();

			if (!document.getElementById('include_checklists')) {
				checkForChecklists();
			}

			/*
				Open popup modal
			*/
			document.getElementsByClassName('copy-to-github')[0].classList.add("is-shown");
		});
		return button;
	};

	/*
		Create a modal popup where the user
		can enter their Github repo information
	*/
	const createPopup = () => {
		const popup = document.createElement('div');
		popup.innerHTML = `<div class="pop-over copy-to-github" style="position: absolute; left: 0; top: 0;">
			<div class="pop-over-header js-pop-over-header">
				<span class="pop-over-header-title">Copy to Github</span>
				<a href="#" class="pop-over-header-close-btn icon-sm icon-close copy-to-github-close"></a>
			</div>
			<div class="pop-over-content js-pop-over-content js-tab-parent">
					<div class="form-grid">
						<label>Owner/Repository name</label>
						<input class="js-short-url js-autofocus" id="repo_address" type="text" placeholder="twitter/bootstrap" style="background: transparent">
					</div>
					<input class="primary wide js-submit copy-to-github-submit" type="submit" value="Copy">
			</div>
		</div>`;
		popup.setAttribute("style", "position: relative");
		return popup;
	};

	const checkForChecklists = () => {
		checklists = document.getElementsByClassName('checklist');
		const checklistTemplate = `<div class="check-div u-clearfix">
			<input id="include_checklists" type="checkbox" name="checklists" checked="checked">
			<label for="include_checklists">Include checklist${checklists.length > 1 ? 's' : ''} <span class="quiet">(${checklists.length})</span></label>
		</div>`;
		if (checklists.length) {
			const popupForm = document.getElementsByClassName('copy-to-github')[0].children[1];
			let formGrid = popupForm.children[0];
			formGrid.innerHTML = formGrid.innerHTML + checklistTemplate;
		}
	}

	/*
		Insert the button and popup modal 
		into the dom
	*/
	const pushToView = (button, popup) => {
		let sidebar = document.getElementsByClassName('window-sidebar')[0];
		sidebar.insertBefore(button, sidebar.childNodes[0]);
		sidebar.insertBefore(popup, sidebar.childNodes[0]);
	};

	/*
		Store the users github `user/repo` details in 
		chrome's local storage and open github in a new tab.
		When this happens `github.js` will fire
	*/
	const openGithub = (title, message) => {
		let repo = document.getElementById('repo_address').value;
		const store = {title: title, body: message};
		chrome.storage.local.set({'trello': store});
		const win = window.open('https://github.com/' + repo +  '/issues/new', '_blank');
		win.focus();
		document.getElementById('repo_address').value = '';
		document.getElementsByClassName('copy-to-github')[0].classList.remove("is-shown");
	};

	const changeOverflow = () => {
		const cardWindow = document.getElementsByClassName('window')[0];
		const sidebar = document.getElementsByClassName('window-sidebar')[0];

		cardWindow.setAttribute("style", "overflow: visible; display: block;");
		sidebar.setAttribute("style", "overflow: visible");
	}

	/*
		Make sure the extension only fires when the user is looking at a trello card
		and that a button doesn't already exist
	*/
	if (window.location.href.includes('trello.com/c/') && !document.getElementsByClassName('copy-to-github')[0]) {
		/*
			Check to see if the dom has finished loading trello card information
		*/
		if (cardTitle) {
			
			let button = createSideButton();
			let popup = createPopup();
			pushToView(button, popup);

			changeOverflow();

			/*
				Assign click event to close button
			*/
			let close = document.getElementsByClassName('copy-to-github-close')[0];
			close.addEventListener("click", () => {
				document.getElementsByClassName('copy-to-github')[0].classList.remove("is-shown");
			});

			/*
				Hide popup if user clicks outside of element
			*/
			document.addEventListener('click', function(event) {
			  if (!popup.contains(event.target) && document.getElementsByClassName('copy-to-github')[0]) {
			    document.getElementsByClassName('copy-to-github')[0].classList.remove("is-shown");
			  }
			});

			/*
				Assign `openGithub()` to copy button
			*/
			let copy = document.getElementsByClassName('copy-to-github-submit')[0];
			copy.addEventListener("click", () => {
				copyCard();
				openGithub(title, message);
			});
		}
		
	}
		

})(window);