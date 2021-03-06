const loginBtn = document.getElementById("login");
const logoutBtn = document.getElementById("logout");
const form = document.getElementById("form");
const channelNameInput = document.getElementById("channel-name-input");
const table = document.getElementById("table");
const channelNames = document.querySelector(".channel-names");
const loginMsg = document.querySelector(".login-msg");
const channelNameLoader = document.getElementById("channel-name-loader");
const loadMoreChannelBtn = document.getElementById("load-more-c");
let ytState = {};
const channelStats = document.querySelector(".channel-stats");
const r1 = document.getElementById("r1");
const r2 = document.getElementById("r2");
const r3 = document.getElementById("r3");
const r4 = document.getElementById("r4");
const r5 = document.getElementById("r5");
const r6 = document.getElementById("r6");

const CLIENT_ID = "836548214787-m9muhc68m9kr68usnncskdd0to7bov4i.apps.googleusercontent.com";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/youtube.readonly";

// Load auth2 library
function handleClientLoad() {
	gapi.load("client:auth2", initClient);
}

// Init API client library and set up sign in listeners
function initClient() {
	// for testing purpose only - this is previously used key which will not be valid after sometime
	// gapi.client.setApiKey("AIzaSyAigEe3JjrP3IVsBfjVnl7U9Wg2qJ6g3DA");

	gapi.client
		.init({
			discoveryDocs: DISCOVERY_DOCS,
			clientId: CLIENT_ID,
			scope: SCOPES,
		})
		.then(() => {
			// Listen for sign in state changes
			gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
			// Handle initial sign in state
			updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
		});
}

// Update UI sign in state changes
function updateSigninStatus(isSignedIn) {
	loadMoreChannelBtn.style.display = "none";
	channelStats.style.display = "none";
	if (isSignedIn) {
		loginBtn.style.display = "none";
		logoutBtn.style.display = "block";
		form.style.display = "block";
		channelNames.style.display = "block";
		loginMsg.style.display = "none";
		channelNameLoader.style.display = "none";
	} else {
		loginBtn.style.display = "block";
		logoutBtn.style.display = "none";
		form.style.display = "none";
		channelNames.style.display = "none";
		loginMsg.style.display = "inline-block";
		channelNameLoader.style.display = "none";
	}
}

// Handle login
function handleSigninClick() {
	// gapi.auth2.getAuthInstance().signIn();
	gapi.auth2
		.getAuthInstance()
		.signIn({
			scope: SCOPES,
		})
		.then(
			function () {
				// console.log("Sign-in successful");
			},
			function (err) {
				// console.error("Error signing in", err);
				alert("Error signing in. Please reload page and try again!");
			}
		);
}

// Handle logout
function handleSignoutClick() {
	gapi.auth2.getAuthInstance().signOut();
}

function addNewCard(cardTitle, data, type, row, className = "four") {
	const card = document.createElement("div");
	card.classList = `columns card ${className}`;
	// ! add dynamic class to this(above) to show different card widths
	const el1 = document.createElement("p");
	el1.innerHTML = cardTitle;
	el1.style.textTransform = "capitalize";
	let el2;

	switch (type) {
		// 1 - text
		// 2 - image
		// 3 - url
		// 4 - date
		// 5 - keywords
		// 6 - wiki links
		case 1:
			el2 = document.createElement("p");
			if (typeof data != "undefined") el2.innerHTML = data;
			else el2.innerHTML = "N/A";
			break;
		case 2:
			el2 = document.createElement("a");
			el2.href = data;
			el2.target = "_blank";
			el3 = document.createElement("img");
			el3.src = data;
			el2.appendChild(el3);
			break;
		case 3:
			el2 = document.createElement("a");
			el2.href = data;
			el2.target = "_blank";
			el2.innerHTML = data;
			break;
		case 4:
			el2 = document.createElement("p");
			let year = data.substring(0, 4);
			let month = data.substring(5, 7);
			let day = data.substring(8, 10);
			el2.innerHTML = `${day}.${month}.${year} (DD.MM.YYYY)`;
			break;
		case 5:
			el2 = document.createElement("p");
			data = data.replace(/" /g, ", ");
			data = data.replace(/"/g, "");
			el2.innerHTML = data;
			break;
		case 6:
			el2 = document.createElement("p");
			el2.innerHTML = "";
			data.forEach((element) => {
				el2.innerHTML += `<a href="${element}" target="_blank" style="text-transform: lowercase;">${element}</a>`;
			});
			break;
	}
	if (el2.tagName != "A") el2.style.textTransform = "capitalize";
	card.appendChild(el1);
	card.appendChild(el2);
	row.appendChild(card);
}

// makes row height equal for better UI
function setRowStyle(flag) {
	// flag - 0 : reset row and it's divs' heights
	// flag - 1 : set row divs' height equal to max div height
	const rows = [r1, r2, r3, r4, r5, r6];
	if (flag == 0) {
		rows.forEach((row) => (row.innerHTML = ""));
	} else {
		rows.forEach((row) => {
			let divs = row.querySelectorAll("div");
			let maxHeight = 0;
			divs.forEach((div) => {
				maxHeight = div.clientHeight > maxHeight ? div.clientHeight : maxHeight;
			});
			divs.forEach((div) => (div.style.minHeight = maxHeight + "px"));
		});
	}
}

// fetch and show channel stats
async function showChannelStats(e) {
	// channelStats
	// reset row html/css
	setRowStyle(0);
	// r1.innerHTML = r2.innerHTML = r3.innerHTML = r4.innerHTML = r5.innerHTML = r6.innerHTML = "";
	channelStats.style.display = "block";

	// hiding channel names
	channelNames.style.display = "none";
	loadMoreChannelBtn.style.display = "none";
	// items(snippet(title, description, customUrl, publishedAt, thumbnails / high / url, country), statistics, topicDetails);
	// items(snippet / defaultLanguage);
	// youtube.com / c / traversymedia;

	const query = {
		part: ["snippet,statistics,topicDetails,status,brandingSettings"],
		id: [e.target.id],
		fields: "items(id,snippet(title,description,customUrl,publishedAt,thumbnails/high/url,country),statistics,topicDetails/topicCategories,status(privacyStatus,madeForKids),brandingSettings(channel/keywords,image))",
	};
	try {
		// items(snippet(title,description,customUrl,publishedAt,thumbnails/high/url,country),
		//  statistics,topicDetails/topicCategories,status(privacyStatus,madeForKids),
		// brandingSettings(channel/keywords,image))
		let result = await gapi.client.youtube.channels.list(query);
		result = result.result.items[0];
		// 1 - text
		// 2 - image
		// 3 - url
		// 4 - date
		// 5 - keywords
		// 6 - wiki links
		// channel name
		addNewCard("Channel name", result.snippet.title, 1, r1);
		// channel link
		if (result.snippet.customUrl) addNewCard("Channel link", `https://www.youtube.com/c/${result.snippet.customUrl}`, 3, r1);
		else addNewCard("Channel link", `youtube.com/channel/${result.id}`, 3, r1);
		// publish date
		addNewCard("Published date", result.snippet.publishedAt, 4, r1);
		// channel description
		addNewCard("Description", result.snippet.description, 1, r2, "");
		// channel country
		addNewCard("Country", result.snippet.country, 1, r3);
		// total videos
		addNewCard("Total videos", result.statistics.videoCount, 1, r3);
		// total subscribers
		if (!result.statistics.hiddenSubscriberCount) addNewCard("Total Subscribers", result.statistics.subscriberCount, 1, r3);
		else addNewCard("Total subscribers", "Private", 1, r3);
		// total views
		addNewCard("Total views", result.statistics.viewCount, 1, r4);
		// privacy status
		addNewCard("Privacy status", result.status.privacyStatus, 1, r4);
		// made for kids
		addNewCard("Made for kids", result.status.madeForKids, 1, r4);
		// wiki links
		if (result.topicDetails) addNewCard("Channel category wikipedia links", result.topicDetails.topicCategories, 6, r5, "six");
		else addNewCard("Channel category wikipedia links", "N/A", 1, r5, "six");
		// keywords associated with channel
		if (result.brandingSettings.channel.keywords) addNewCard("Keywords associated with channel", result.brandingSettings.channel.keywords, 5, r5, "six");
		else addNewCard("Keywords associated with channel", "N/A", 1, r5, "six");
		// channel icon image with its link
		addNewCard("Channel icon", result.snippet.thumbnails.high.url, 2, r6);
		// channel cover image with its link
		if (result.brandingSettings.image) addNewCard("Banner image", result.brandingSettings.image.bannerExternalUrl, 2, r6, "eight");
		else addNewCard("Banner Image", "https://via.placeholder.com/2048x1152?text=No+Banner+Image+Found", 2, r6, "eight");

		// making height of every row equal
		setRowStyle(1);
		// ! total likes
		// ! total comments
	} catch (err) {
		// console.log(err);
		alert("Something went wront in fetching channel stats.");
	}
}

function addChannelNames(items) {
	for (let i = 0; i < items.length; i++) {
		const li = document.createElement("li");
		li.classList.add("h-shadow");
		li.classList.add("grow");
		li.id = items[i].snippet.channelId;
		li.innerHTML = `<img src="${items[i].snippet.thumbnails.medium.url}"> ${items[i].snippet.title}`;
		setTimeout(() => {
			channelNames.appendChild(li);
			li.addEventListener("click", showChannelStats);
		}, i * 150);
	}
}

async function getChannels(q = ytState.q, pageToken = ytState.pageToken) {
	channelNameLoader.style.display = "block";
	ytState.q = q;

	// getting 5 channel IDs, title, thumbnails-medium
	const searchQuery = {
		part: ["snippet"],
		maxResults: 5,
		q,
		type: ["channel"],
		pageToken,
		// if next page token is empty then first page results are returned
		fields: "nextPageToken,pageInfo/totalResults,items(snippet(channelId,title,description,thumbnails/medium))",
	};
	try {
		const response = await gapi.client.youtube.search.list(searchQuery);
		ytState.pageToken = response.result.nextPageToken;
		ytState.totalResults = response.result.pageInfo.totalResults;
		return response.result.items;
	} catch (err) {
		if (err.result.error.code == 403) alert("Today's API quota had been exceeded.");
		else alert("Something went wront in fetching channels.");
		throw new Error("Some error orccured");
	} finally {
		channelNameLoader.style.display = "none";
	}
}

// search channel and display results
async function searchChannel(e) {
	e.preventDefault();
	ytState = {};
	channelStats.style.display = "none";
	channelNames.style.display = "block";
	// clearing all channels that may have been added before
	channelNames.innerHTML = "";

	const q = channelNameInput.value.trim();
	if (q.length == 0) {
		alert("Please enter a valid search query");
		channelNameLoader.style.display = "none";
		return;
	}
	try {
		const items = await getChannels(q);
		addChannelNames(items);
		loadMoreChannelBtn.style.display = "block";
		channelNameInput.textContent = "";
	} catch (err) {
		// console.log(err);
		// alert("Some error orccured");
	}
}

// load more channels
async function loadMoreChannels() {
	// check if there are more results to show
	if (typeof ytState.pageToken == "undefined") {
		loadMoreChannelBtn.style.display = "none";
		return;
	}
	try {
		const items = await getChannels();
		addChannelNames(items);
	} catch {
		// alert("Some error orccured");
	}
}

// adding event listeners

loginBtn.addEventListener("click", handleSigninClick);
logoutBtn.addEventListener("click", handleSignoutClick);
form.addEventListener("submit", searchChannel);
loadMoreChannelBtn.addEventListener("click", loadMoreChannels);
