const User = require('../../models/User');

/**
 * Get candidates most suitable for a vacancy
 * @param {Vacancy} vacancy
 * @returns {Promise}
 * @example
 **/
const matchUsersWithVacancy = async (vacancy) => {
    // remove newlines from description
    const description = vacancy.description.replace(/(\r\n|\n|\r)/gm, " ");

    // trim the description, remove special characters(like .,;:?!), and split it into words
    descriptionSpliced = description.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").split(" ");
    roleSpliced = vacancy.role.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").split(" ");

    // agora remova as palavras comuns não relevantes em português apenas
    const irrelevantWords = ["de", "a", "o", "que", "e", "do", "da", "em", "um", "para", "é", "com", "não", "uma", "os", "no", "se", "na", "por", "mais", "as", "dos", "como", "mas", "ao", "ele", "das", "à", "seu", "sua", "ou", "quando", "muito", "nos", "já", "eu", "também", "só", "pelo", "pela", "até", "isso", "ela", "entre", "era", "depois", "sem", "mesmo", "aos", "ter", "seus", "quem", "nas", "me", "esse", "eles", "estão", "você", "tinha", "foram", "essa", "num", "nem", "suas", "meu", "às", "minha", "têm", "numa", "pelos", "elas", "havia", "seja", "qual", "será", "nós", "tenho", "lhe", "deles", "essas", "esses", "pelas", "este", "fosse", "dele", "tu", "te", "vocês", "vos", "lhes", "meus", "minhas", "teu", "tua", "teus", "tuas", "nosso", "nossa", "nossos", "nossas", "dela", "delas", "esta", "estes", "estas", "aquele", "aquela", "aqueles", "aquelas", "isto", "aquilo", "estou", "está", "estamos", "estão", "estive", "esteve", "estivemos", "estiveram", "estava", "estávamos", "estavam", "estivera", "estivéramos", "esteja", "estejamos", "estejam", "estivesse", "estivéssemos", "estivessem", "estiver", "estivermos",]

    // remove the irrelevant words from the description
    descriptionSpliced = descriptionSpliced.filter(word => !irrelevantWords.includes(word));

    // sum the number of words in the description and role
    const vacancySearchWords = descriptionSpliced.length + roleSpliced.length;
    //console.log(descriptionSpliced, roleSpliced, vacancySearchWords);

    const users = await User.aggregate([
        {
            // make regex search for each word in the vacancySearchWords
            $match: {
                $or: [
                    { description: { $regex: descriptionSpliced.join("|"), $options: "i" } },
                    { role: { $regex: roleSpliced.join("|"), $options: "i" } },
                    { skills: { $regex: descriptionSpliced.join("|"), $options: "i" } },
                    { skills: { $regex: roleSpliced.join("|"), $options: "i" } },
                    { formations: { $regex: descriptionSpliced.join("|"), $options: "i" } },    
                    { formations: { $regex: roleSpliced.join("|"), $options: "i" } },
                    { experiences: { $regex: descriptionSpliced.join("|"), $options: "i" } },
                    { experiences: { $regex: roleSpliced.join("|"), $options: "i" } },
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
                experiences: 1,
                profilePicture: 1,
                createdAt: 1,
            },
        }
    ]);

    // build a percentage of match for each user comparing the same things as the mongoose aggregation
    users.forEach(user => {
        user.matchedFeatures = 0;

        // regex search for each word in the vacancySearchWords
        if (user.description.match(new RegExp(descriptionSpliced.join("|"), "i"))) {
            user.matchedFeatures++;
        }
        if (user.role.match(new RegExp(roleSpliced.join("|"), "i"))) {
            user.matchedFeatures++;
        }
        if (user.skills)
        user.skills.forEach(skill => {
            if (skill.name.match(new RegExp(descriptionSpliced.join("|"), "i"))) {
                user.matchedFeatures++;
            }
            if (skill.level.match(new RegExp(roleSpliced.join("|"), "i"))) {
                user.matchedFeatures++;
            }
        });

        if (user.formations)
            user.formations.forEach(formation => {
                if (formation.name.match(new RegExp(descriptionSpliced.join("|"), "i"))) {
                    user.matchedFeatures++;
                }
                if (formation.level.match(new RegExp(roleSpliced.join("|"), "i"))) {
                    user.matchedFeatures++;
                }
            });

        if (user.experiences)
            user.experiences.forEach(experience => {
                if (experience.description.match(new RegExp(descriptionSpliced.join("|"), "i"))) {
                    user.matchedFeatures++;
                }
                if (experience.role.match(new RegExp(roleSpliced.join("|"), "i"))) {
                    user.matchedFeatures++;
                }
                if (experience.company.match(new RegExp(vacancy.company, "i"))) {
                    user.matchedFeatures++;
                }

                // match if user has equal or greater years of experience than the vacancy
                const experienceYears = experience.finish.getFullYear() - experience.start.getFullYear();
                if (experienceYears >= vacancy.yearsOfExperience) {
                    user.matchedFeatures++;
                }
            });

        // calculate the percentage of match
        user.matchedPercentage = (user.matchedFeatures / vacancySearchWords) * 100;
        if (user.matchedPercentage > 100) {
            user.matchedPercentage = 100;
        }
    });

    // sort the users by the match percentage
    return users.sort((a, b) => b.matchedPercentage - a.matchedPercentage);
};

module.exports = {
    matchUsersWithVacancy,
};