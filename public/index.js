const loginBtn = document.getElementById("login");
const logoutBtn = document.getElementById("logout");
const form = document.getElementById("form");
const channelNameInput = document.getElementById("channel-name-input");
const table = document.getElementById("table");

const authorizeButton = loginBtn;
const signoutButton = logoutBtn;
// const  = document.getElementById('');
// https://www.googleapis.com/auth/youtube.readonly
const CLIENT_ID = "836548214787-m9muhc68m9kr68usnncskdd0to7bov4i.apps.googleusercontent.com";

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/youtube.readonly";

// function start() {
// 	// Initialize the JavaScript client library.
// 	gapi.client
// 		.init({
// 			// apiKey: 'YOUR_API_KEY',
// 			// discoveryDocs: ['https://people.googleapis.com/$discovery/rest'],
// 			discoveryDocs: DISCOVERY_DOCS,
// 			clientId: CLIENT_ID,
// 			scope: SCOPES,
// 		})
// 		.then(function () {
// 			// Initialize and make the API request.
// 			return gapi.client.people.people.get({
// 				resourceName: 'people/me',
// 				'requestMask.includeField': 'person.names',
// 			});
// 		})
// 		.then(
// 			function (response) {
// 				console.log(response.result);
// 			},
// 			function (reason) {
// 				console.log('Error: ' + reason.result.error.message);
// 			}
// 		);
// }
// // Load the JavaScript client library.
// gapi.load('client', start);

// `
// <tr>
// <td>Dave Gamache</td>
// <td>26</td>
// <td>Male</td>
// <td>San Francisco</td>
// </tr>
// `

// Load auth2 library
function handleClientLoad() {
	gapi.load("client:auth2", initClient);
}

// Init API client library and set up sign in listeners
function initClient() {
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
			authorizeButton.onclick = handleAuthClick;
			signoutButton.onclick = handleSignoutClick;
		});
}

// Update UI sign in state changes
function updateSigninStatus(isSignedIn) {
	if (isSignedIn) {
		authorizeButton.style.display = "none";
		signoutButton.style.display = "block";
		// content.style.display = 'block';
		// videoContainer.style.display = 'block';
		getChannel(defaultChannel);
	} else {
		authorizeButton.style.display = "block";
		signoutButton.style.display = "none";
		// content.style.display = 'none';
		// videoContainer.style.display = 'none';
	}
}

// Handle login
function handleAuthClick() {
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
				alert("Error signing in. Reload page and try again!");
			}
		);
}

// Handle logout
function handleSignoutClick() {
	gapi.auth2.getAuthInstance().signOut();
}

handleClientLoad();
