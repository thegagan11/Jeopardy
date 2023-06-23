const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;
const jeopardyBoard = $("#jeopardy");
let categories = [];

// get ids from categories used in the game
function getCategoryIds(catIds) {
	// selects random categories from list provided
	let randomIds = _.sampleSize(catIds.data, NUM_CATEGORIES);
	let categoryIds = [];
	// push each id into an array
	for (cat of randomIds) {
		categoryIds.push(cat.id);
	}
	return categoryIds;
}

// gets data from each id provided
function getCategory(catIds) {
	let cat = catIds.data;
	// gets the amount of questions needed from the category
	let clues = _.sampleSize(cat, NUM_QUESTIONS_PER_CAT);
	// gets titles from categories
	let catData = {
		title: cat[0].category.title,
		clues: []
	};
	// gets questions and answers from categories
	clues.map((arr) => {
		let cluesArr = {
			question: arr.question,
			answer: arr.answer,
			showing: null
		};
		catData.clues.push(cluesArr);
	});
	// pushes data into categories array
	categories.push(catData);
}

// fills jeopardy table with data
function fillTable() {
	// makes new array of each title
	let titles = categories.map((title) => {
		return title.title;
	});
	// loops through each title and makes table headers of each
	$("thead").add("tr");
	for (let x = 0; x < NUM_CATEGORIES; x++) {
		const catHeader = document.createElement("th");
		catHeader.innerText = titles[x];
		$("thead").append(catHeader);
	}
	//makes the rest of the table and gives each an id of its location
	for (let y = 0; y < NUM_QUESTIONS_PER_CAT; y++) {
		const row = document.createElement("tr");
		for (let x = 0; x < NUM_CATEGORIES; x++) {
			const cell = document.createElement("td");
			cell.innerHTML = `<div id=${x}-${y}>?</div>`;
			row.append(cell);
		}
		jeopardyBoard.append(row);
	}
}

function handleClick(e) {
	// x and y are used to change the data displayed into the correct questions and answers
	let x = e.target.id[0];
	let y = e.target.id[2];
	// if answer is displayed, do nothing
	if (e.target.classList.contains("answer")) {
		return;
		// if question is displayed, display answer instead
	} else if (e.target.classList.contains("question")) {
		e.target.innerText = categories[x].clues[y].answer;
		e.target.classList.remove("question");
		e.target.classList.add("answer");
		// if nothing is displayed yet, display question
	} else {
		e.target.innerText = categories[x].clues[y].question;
		e.target.classList.add("question");
	}
}

async function setupAndStart() {
	// get 100 categories from jservice.io
	const resCategories = await axios.get("http://jservice.io/api/categories", {
		params: {
			count: 100
		}
	});
	let catIds = getCategoryIds(resCategories);

	for (id of catIds) {
		// for each id, get clue data from jservoce.io
		const resTitles = await axios.get("http://jservice.io/api/clues", {
			params: {
				category: id
			}
		});
		getCategory(resTitles);
	}
	fillTable();
}

// reload page when restart button is pushed
$("#restart").on("click", function() {
	location.reload();
});

// when document is loaded, start game and add event listener for jeopardy board
$(document).ready(function() {
	setupAndStart();
	$("#jeopardy").on("click", "div", handleClick);
});