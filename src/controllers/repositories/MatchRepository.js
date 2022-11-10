const User = require('../../models/User');
const Vacancy = require('../../models/Vacancy');
const consola = require('consola');

const irrelevantWords = ['de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'ao', 'ele', 'das', 'à', 'seu', 'sua', 'ou', 'quando', 'muito', 'nos', 'já', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'quem', 'nas', 'me', 'esse', 'eles', 'estão', 'você', 'tinha', 'foram', 'essa', 'num', 'nem', 'suas', 'meu', 'às', 'minha', 'têm', 'numa', 'pelos', 'elas', 'havia', 'seja', 'qual', 'será', 'nós', 'tenho', 'lhe', 'deles', 'essas', 'esses', 'pelas', 'este', 'fosse', 'dele', 'tu', 'te', 'vocês', 'vos', 'lhes', 'meus', 'minhas', 'teu', 'tua', 'teus', 'tuas', 'nosso', 'nossa', 'nossos', 'nossas', 'dela', 'delas', 'esta', 'estes', 'estas', 'aquele', 'aquela', 'aqueles', 'aquelas', 'isto', 'aquilo', 'estou', 'está', 'estamos', 'estão', 'estive', 'esteve', 'estivemos', 'estiveram', 'estava', 'estávamos', 'estavam', 'estivera', 'estivéramos', 'esteja', 'estejamos', 'estejam', 'estivesse', 'estivéssemos', 'estivessem', 'estiver', 'estivermos',];

/**
 * Get candidates most suitable for a vacancy
 * @param {Vacancy} vacancy
 * @returns {Promise}
 * @example
 **/
const matchUsersWithVacancy = async (vacancy) => {

	const {
		descriptionSpliced,
		roleSpliced,
		SearchWords
	} = spliceVacancyData(vacancy);

	const users = await User.aggregate([
		{
			// make regex search for each word in the vacancySearchWords
			$match: {
				$or: [
					{ description: { $regex: descriptionSpliced.join('|'), $options: 'i' } },
					{ role: { $regex: roleSpliced.join('|'), $options: 'i' } },
					{ skills: { $regex: descriptionSpliced.join('|'), $options: 'i' } },
					{ skills: { $regex: roleSpliced.join('|'), $options: 'i' } },
					{ formations: { $regex: descriptionSpliced.join('|'), $options: 'i' } },    
					{ formations: { $regex: roleSpliced.join('|'), $options: 'i' } },
					{ experiences: { $regex: descriptionSpliced.join('|'), $options: 'i' } },
					{ experiences: { $regex: roleSpliced.join('|'), $options: 'i' } },
					// match if any experience has the same company as the vacancy (which is referenced by company reference)
					{ experiences: { $elemMatch: { 'company.name': vacancy.company } } },  
					// match if user has any experience which the finish date minus the start date number is equal or greater than yearsOfExperience
					//@todo: this is not working
				]
			}
		},
		{
			$match: { blocked: false }
		},
		{
			$project: {
				_id: 1,
				name: 1,
				role: 1,
				description: 1,
				skills: 1,
				picture: 1,
				experiences: 1,
				profilePicture: 1,
				createdAt: 1,
			},
		}
	]);

	// build a percentage of match for each user using matchVacancyDataWithUser(user, vacancy);
	users.map(user => {
		user.matchPercentage = matchVacancyDataWithUser(user, vacancy, SearchWords);
	});

	// sort the users by the match percentage and remove percentages lower than 50%
	return users.sort((a, b) => b.matchPercentage - a.matchPercentage).filter(user => user.matchPercentage >= 50);
};

/**
 * Check user Compatibility and return percentage
 * @param {user} ObjectId
 * @param {vacancy} ObjectId
 * @returns {string}
 **/
const checkUserCompatibility = async (user_id, vacancy_id) => {

	const user = await User.findById(user_id);

	const vacancy = await Vacancy.findById(vacancy_id);

	if (!user || !vacancy) {
		consola.error('ERROR finding user or vacancy');
		return 0;
	}

	return matchVacancyDataWithUser(
		user, 
		vacancy,
	);
};

function spliceVacancyData(vacancy) {
	// remove newlines from description, trim the description, 
	// remove special characters(like .,;:?!), and split it into words and remove irrelevant words
	let descriptionSpliced = vacancy.description.replace(/(\r\n|\n|\r)/gm, ' ')
		.trim()
		.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,'').split(' ')
		.filter(word => !irrelevantWords.includes(word));

	let roleSpliced = vacancy.role.trim()
		.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,'').split(' ');

	let SearchWords = [...descriptionSpliced, ...roleSpliced];

	return { descriptionSpliced, roleSpliced, SearchWords };
}

function matchVacancyDataWithUser(user, vacancy) {
	const {
		descriptionSpliced,
		roleSpliced,
		SearchWords
	} = spliceVacancyData(vacancy);

	let matchedFeatures = 0;
	console.log(user);
	// regex search for each word in the vacancySearchWords
	if (user.description.match(new RegExp(descriptionSpliced.join('|'), 'i'))) {
		matchedFeatures++;
	}
	if (user.role.match(new RegExp(roleSpliced.join('|'), 'i'))) {
		matchedFeatures++;
	}
	if (user.skills)
		user.skills.forEach(skill => {
			if (skill.name.match(new RegExp(descriptionSpliced.join('|'), 'i'))) {
				matchedFeatures++;
			}
			if (skill.level.match(new RegExp(roleSpliced.join('|'), 'i'))) {
				matchedFeatures++;
			}
		});

	if (user.formations)
		user.formations.forEach(formation => {
			if (formation.name.match(new RegExp(descriptionSpliced.join('|'), 'i'))) {
				matchedFeatures++;
			}
			if (formation.description.match(new RegExp(roleSpliced.join('|'), 'i'))) {
				matchedFeatures++;
			}
		});

	if (user.experiences)
		user.experiences.forEach(experience => {
			if (experience.description.match(new RegExp(descriptionSpliced.join('|'), 'i'))) {
				matchedFeatures++;
			}
			if (experience.role.match(new RegExp(roleSpliced.join('|'), 'i'))) {
				matchedFeatures++;
			}
			if (experience.company.match(new RegExp(vacancy.company, 'i'))) {
				matchedFeatures++;
			}

			// match if user has equal or greater years of experience than the vacancy
			const experienceYears = experience.finish.getFullYear() - experience.start.getFullYear();
			if (experienceYears >= vacancy.yearsOfExperience) {
				matchedFeatures++;
			}
		});

	let searchLenght = Object.keys(SearchWords).length;

	// calculate the percentage of match
	let matchedPercentage = ((matchedFeatures / searchLenght ) * 100).toFixed(2);
	if (matchedPercentage > 100) {
		matchedPercentage = 100;
	}
	//console.log('matched', matchedFeatures, 'percentage', searchLenght );

	return matchedPercentage;
}

module.exports = {
	matchUsersWithVacancy,
	checkUserCompatibility,
};