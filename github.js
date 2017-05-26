chrome.storage.local.get('trello', function (result) {
	if (result.trello) {
		/*
			Push stored trello card information into Github's
			issue form. Remove `disabled` attr from submit button
		*/
		document.getElementById('issue_title').value = result.trello.title;
		document.getElementById('issue_body').value = result.trello.body;
		document.getElementsByClassName('btn-primary')[0].removeAttribute('disabled');
		
		/*
			Remove stored trello card information
		*/
		chrome.storage.local.remove('trello');
	}
		
});
