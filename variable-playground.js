var person = {
	name: 'Gene',
	age: 21
};

function updatePerson(obj) {
	// this doesn't work...
	/*obj = {
		name: 'Gene',
		age: 55
	}*/

	// this does
	obj.age = 55;
}

updatePerson(person);
console.log(person);

var grades = [15, 88];

function addGrade(grades, grade) {
	// this doesn't work...
	// grades = [15, 88, 99];

	// this does
	grades.push(grade);
	debugger;
}

addGrade(grades, 77);
console.log(grades);

// testing...
