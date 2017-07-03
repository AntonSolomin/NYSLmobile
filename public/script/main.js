// pages navigation
$("#indexPage").click(indexNav);
$("#regPage").click(regNav);
$("#aboutPage").click(aboutNav);
$("#teamsPage").click(teamsNav);
$("#locationsPage").click(locationsNav);
$("#logInPage").click(logInNav);
// on pan and click open and close nav
$("#menu_btn").click(openNav);
$(".sidenav").click(closeNav);
$(".glass").click(closeNav);
$("#rightGlass").click(closeNav);
$("#success").css("display", "none");
//login
$("#logInBtn").on("click", logIn);
$("#logOutPage").on("click", logOut);
// enabling search
$("#search_field").keyup(search);
/*pan enabling needs to be first element because hammertime doesnt accept jquery selectors, it need html elemtnt*/
var hammertime = new Hammer($("#myContainer")[0]);
hammertime.get("pan").set({
	threshold: 60
});
hammertime.on('panleft', function (ev) {
	closeNav();
});
hammertime.on('panright', function (ev) {
	openNav();
});


//getting json and asigning values on docready  orientation
$(function () {
	checkCookie();
	$(".glass").css("height", document.documentElement.clientHeight);
	$("#myContainer").css("width", "100%");
	$("#myContainer").css("height", document.documentElement.clientHeight);

	$.getJSON("https://api.myjson.com/bins/pn8az", onDataReady);
	//listen to events as soon as you can but not efore the doc is raeady
	firebase.auth().onAuthStateChanged(onSuccessUserStateChange);

	//in landscape click and get the info on the right. only on accordion. disable accordion collapse. this enables search
	$(document).click(function (event) {
		if ($(event.target).attr("data-parent") == "#index" ||
			$(event.target).attr("data-parent") == "#teamsOutput" ||
			$(event.target).attr("data-parent") == "#locationsOutput") {
			var text = $(event.target.parentElement.parentElement.parentElement.children[1]).html();
			$("#right").html(text);
		}
	});

	// Listen for orientation changes
	window.addEventListener("orientationchange", function () {
		
		setTimeout(function () {
			if (window.matchMedia("(orientation: portrait)").matches) {
				// to be repeated for teams and locations
				$("#index").find("a").attr("data-toggle", "collapse");
				$("#teamsOutput").find("a").attr("data-toggle", "collapse");
				$("#locationsOutput").find("a").attr("data-toggle", "collapse");
				//11
				$("#rightGlass").css("height", document.documentElement.clientHeight);
				$(".glass").css("height", document.documentElement.clientHeight);
			}
			if (window.matchMedia("(orientation: landscape)").matches) {
				// you're in LANDSCAPE mode 
				//hiding rightGlass
				//11
				$("#rightGlass").css("height", document.documentElement.clientHeight);
				$("#right").css("height", document.documentElement.clientHeight);
				$("#index").find("a").attr("data-toggle", null);
				$("#teamsOutput").find("a").attr("data-toggle", null);
				$("#locationsOutput").find("a").attr("data-toggle", null);
				$(".panel-collapse").filter(".in").collapse("hide");
			}
			$("#myContainer").css("height", document.documentElement.clientHeight);
		}, 200);
	}, false);
});

function onDataReady(serverData) {
	$(".loading").css("display", "none");
	printGames(serverData);
	printTeams(serverData);
	printLocations(serverData);

	//initially display none comment section
	$(".commentSection").css("display", "");

	//checking if a panel is opened show comments
	$(".panel-collapse").on("show.bs.collapse", function (eventInfo) {
		var panelOpened = eventInfo.currentTarget;
		var gameId = panelOpened.getAttribute("id");
		//using jquery
		/*var gameId = $(panelOpened).attr("id");*/
		firebase.database().ref("games/" + gameId + "/comments/").on("value", function (snapshot) {

			var comments = snapshot.val();

			var output = "";
			$.each(comments, function (key) {
				var timestamp = comments[key].timestamp;
				comments[key].timestamp = new Date(timestamp).toLocaleString();
				output += Mustache.render($("#commentTemplate").html(), comments[key]);
			});
			$(".userCommentsOutput").html(output);
			$(".glass").css("height", "100%");
		});
	})


	//if a panel is closed stop listentng for comments
	$(".panel-collapse").on("hide.bs.collapse", function (eventInfo) {
		var panelOpened = eventInfo.currentTarget;
		var gameId = panelOpened.getAttribute("id");
		firebase.database().ref("games/" + gameId + "/comments/").off("value");
	});

	//after the page if printed by mustache
	$(".inputCommentBtn").click(function () {
		commentUp(this);
	});

	// tells the children who the daddy is
	$(".panel-collapse").collapse({
		"parent": "#index",
		//toggle to not display first 
		"toggle": false
	});

	// during the run of the programm
	if (window.matchMedia("(orientation: portrait)").matches) {
		$("#index").find("a").attr("data-toggle", "collapse");
		$("#teamsOutput").find("a").attr("data-toggle", "collapse");
		$("#locationsOutput").find("a").attr("data-toggle", "collapse");
	}
	if (window.matchMedia("(orientation: landscape)").matches) {
		$("#index").find("a").attr("data-toggle", null);
		$("#teamsOutput").find("a").attr("data-toggle", null);
		$("#locationsOutput").find("a").attr("data-toggle", null);
	}
}

function search() {
	var input, filter, pd, p, i;
	input = document.getElementById('search_field');
	filter = input.value.toUpperCase();
	pd = document.getElementsByClassName("panel");

	// Loop through all list items, and hide those who don't match the search query
	for (i = 0; i < pd.length; i++) {
		var ps = pd[i].getElementsByTagName("p");
		for (var j = 0; j < ps.length; j++) {
			if (ps[j].textContent.toUpperCase().indexOf(filter) > -1) {
				pd[i].style.display = "";
				break;
			} else {
				pd[i].style.display = "none";
			}
		}
	}
}

function makeBlock(divId) {
	// on page change clear the search and start it again
	$('#search_field').val("");
	search();
	$("#index").css("display", "none");
	$("#reg").css("display", "none");
	$("#about").css("display", "none");
	$("#teams").css("display", "none");
	$("#locations").css("display", "none");
	$("#logIn").css("display", "none");
	$(divId).css("display", "block");
}

// display and width are empty because we give the
function indexNav() {
	$("#right").css("display", "");
	$("#main").css("width", "");
	makeBlock("#index");
}

function regNav() {
	$("#right").css("display", "none");
	$("#main").css("width", "100%");
	makeBlock("#reg");
}

function aboutNav() {
	$("#right").css("display", "none");
	$("#main").css("width", "100%");
	makeBlock("#about");
}

function teamsNav() {
	$("#right").css("display", "");
	$("#main").css("width", "");
	makeBlock("#teams");
}

function locationsNav() {
	$("#right").css("display", "");
	$("#main").css("width", "");
	makeBlock("#locations");
}

function logInNav() {
	$("#right").css("display", "none");
	$("#main").css("width", "100%");
	makeBlock("#logIn");
}

function openNav(event) {
	
	$(".glass").show(0).css("background-color", "rgba(128, 128, 128, 0.44)");
	$(".glass").css("height", document.documentElement.clientHeight);
	$("#side_menu_section").css("left", "0");
	$("#main").css("left", "250px");
	$("#right").css("right", "-250px");
	$("#rightGlass").show(0).css({"right": "-250px","background-color": "rgba(128, 128, 128, 0.44)"});

	if (window.matchMedia("(orientation: portrait)").matches) {
		$("#search_section").css("visibility", "hidden");
	}

	if (window.matchMedia("(orientation: landscape)").matches) {
		$("#search_section").css("visibility", "hidden");
	}
}

function closeNav() {
	$(".glass").hide(0).css("background-color", "rgba(128, 128, 128, 0)");
	$("#side_menu_section").css("left", "-250px");
	$("#main").css("left", "0");
	$("#right").css("right", "0");
	$("#rightGlass").hide(0).css({"right": "0", "background-color": "rgba(128, 128, 128, 0)"});

	if (window.matchMedia("(orientation: portrait)").matches) {
		$("#search_section").css("visibility", "visible");
	}
	if (window.matchMedia("(orientation: landscape)").matches) {
		//$("#search_section").css("right", "10px");
		$("#search_section").css("visibility", "visible");
	}
}

function printGames(data) {
	var output = "";
	$.each(data.games, function (index) {
		output += Mustache.render($("#indexTemplate").html(), data.games[index]);
	});
	$(".gridIndex").html(output);
}

function printTeams(data) {
	var output = "";
	$.each(data.teams, function (index) {
		output += Mustache.render($("#teamsTemplate").html(), data.teams[index]);
	});
	$(".gridTeams").html(output);
}

// also possible to get index and element
function printLocations(data) {
	var output = "";
	$.each(data.locations, function (index, element) {
		output += Mustache.render($("#locationsTemplate").html(), element);
	});
	$(".gridLocations").html(output);
}

function logIn() {
	var email = $("#inputEmail").val();
	var password = $("#inputPassword").val();
	firebase.auth().signInWithEmailAndPassword(email, password).catch(
		function (error) {
			console.log("ERROR HORRIBLY: ", error);
			alert("incorrect email or password");
		}
	);
	//display block coments section on log in
	$(".commentSection").css("display", "block");
	$("#logInPage").css("display", "none");
	$("#logOutPage").css("display", "block");
	//11
	$("#right").css("display", "");
	$("#main").css("width", "");
	$("#index").css("display", "block");
	$("#success").css("display", "");
	$("#success").delay(1000).fadeOut();
}

function logOut() {
	firebase.auth().signOut();
	//display none coments section on log out
	$(".commentSection").css("display", "none");
	$("#logInPage").css("display", "block");
	$("#logOutPage").css("display", "none");
}

function onSuccessUserStateChange(user) {
	console.log("Statechanged to user>", user);
	if (user === null) {
		console.log("user is logged out ");
		$("#form-signin").css("display", "");
		$("#success").css("display", "none");
		$("#logInPage").css("display", "block");
		$("#logOutPage").css("display", "none");
	}
	if (user !== null) {
		console.log("user is logged in ");
		$("#form-signin").css("display", "none");

		$("#logInPage").css("display", "none");
		$("#logOutPage").css("display", "block");
	}
}

function commentUp(clickedButtonElement) {

	var gameId = $(clickedButtonElement).closest(".panel-collapse").attr("id");
	var comment = $(clickedButtonElement).siblings(".commentBody").children(".inputBody").val();
	var user = firebase.auth().currentUser.email;

	firebase.database().ref("games/" + gameId + "/comments/").push({
		"user": user,
		"comment": comment,
		"timestamp": (new Date()).getTime()
	})
}

//managing cookies
function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function checkCookie() {
	var visited = getCookie("visited");
	if (visited != "") {
	//if visited do this:
		//alert("Welcome again");
	} 
	//reseting cookie from the last instance
	//$("#intro").css("display","block");
	setCookie("visited", "true", 365);
}

function deleteCookie (name) {
	setCookie(name, "", -1);
}