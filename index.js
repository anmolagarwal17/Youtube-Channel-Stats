const loginBtn = document.getElementById("login");
const logoutBtn = document.getElementById("logout");
const form = document.getElementById("form");
const channelNameInput = document.getElementById("channel-name-input");
const table = document.getElementById("table");
const channelNames = document.querySelector(".channel-names");
const loginMsg = document.querySelector(".login-msg");
const channelNameLoader = document.getElementById("channel-name-loader");
const loadMoreChannelBtn = document.getElementById("load-more-c");
const ytState = {};

const CLIENT_ID = "836548214787-m9muhc68m9kr68usnncskdd0to7bov4i.apps.googleusercontent.com";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/youtube.readonly";

// Load auth2 library
function handleClientLoad() {
	gapi.load("client:auth2", initClient);
}

// Init API client library and set up sign in listeners
function initClient() {
	// ! only for testing
	// todo: remove below key
	gapi.client.setApiKey("AIzaSyAigEe3JjrP3IVsBfjVnl7U9Wg2qJ6g3DA");
	// todo: remove below key
	// ! only for testing

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
		// form.style.display = "none";
		// channelNames.style.display = "none";
		// loginMsg.style.display = "inline-block";
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
				console.log("Sign-in successful");
			},
			function (err) {
				console.error("Error signing in", err);
				alert("Error signing in. Please reload page and try again!");
			}
		);
}

// Handle logout
function handleSignoutClick() {
	gapi.auth2.getAuthInstance().signOut();
}

function addChannelNames(items) {
	for (let i = 0; i < items.length; i++) {
		const li = document.createElement("li");
		li.classList.add("h-shadow");
		li.classList.add("grow");
		li.id = items[i].id.channelId;
		li.innerHTML = `<img src="${items[i].snippet.thumbnails.medium.url}"> ${items[i].snippet.channelTitle}`;
		setTimeout(() => {
			channelNames.appendChild(li);
		}, i * 150);
	}
	setTimeout(() => {
		if (channelNames.querySelectorAll("li").length >= ytState.totalResults) loadMoreChannelBtn.disabled = true;
		console.log(channelNames.querySelectorAll("li").length);
		console.log(ytState.totalResults);
	}, 700);
}

async function getChannels(q = ytState.q, pageToken = ytState.pageToken) {
	channelNameLoader.style.display = "block";
	ytState.q = q;

	// getting 5 channel IDs, title, thumbnails-medium
	const searchQuery = {
		part: ["snippet"],
		q,
		type: ["channel"],
		pageToken,
		// if next page token is empty then first page results are returned
	};

	const response = await gapi.client.youtube.search.list(searchQuery);
	ytState.pageToken = response.result.nextPageToken;
	ytState.totalResults = response.result.pageInfo.totalResults;
	console.log(response);
	channelNameLoader.style.display = "none";

	return response.result.items;
}

// search channel and display results
async function searchChannel(e) {
	e.preventDefault();

	// clearing all channels that may have been added before
	channelNames.innerHTML = "";

	const q = channelNameInput.value.trim();
	if (q.length == 0) {
		alert("Please enter a valid search query");
		channelNameLoader.style.display = "none";
		return;
	}

	const items = await getChannels(q);
	addChannelNames(items);
}

// load more channels
async function loadMoreChannels() {
	const items = await getChannels();
	addChannelNames(items);
}

// adding event listeners

loginBtn.addEventListener("click", handleSigninClick);
logoutBtn.addEventListener("click", handleSignoutClick);
form.addEventListener("submit", searchChannel);
loadMoreChannelBtn.addEventListener("click", loadMoreChannels);
