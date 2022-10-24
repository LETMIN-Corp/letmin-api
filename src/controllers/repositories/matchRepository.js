const User = require('../../models/User');

/**
 * Get candidates most suitable for a vacancy
 * @param {String} _id
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
    console.log(descriptionSpliced, roleSpliced, vacancySearchWords);
    const users = await User.aggregate([
        {
            $match: { blocked: false }
        },
        {
            $match: {
                $or: [
                    // match with regex insensitive case and with all words spliced
                    { description: { $regex: descriptionSpliced.join('|'), $options: 'i' } },
                    { role: { $regex: roleSpliced.join('|'), $options: 'i' } },
                    // skills are stored as an array of objects with the skill name and the level of proficiency as exither 'Iniciante', 'Intermediário', 'Avançado'
                    // so we need to match the skill name with the wanted skills level(string of the same tye)
                    { skills: { $elemMatch: { name: { $in: vacancy.wantedSkills }, level: vacancy.wantedSkillsLevel } } },
                    { experiences: { role: { $regex: roleSpliced.join('|'), $options: 'i' } } },
                    { experiences: { description: { $regex: descriptionSpliced.join('|'), $options: 'i' } } },
                    { formations: { institution: { $regex: descriptionSpliced.join('|'), $options: 'i' } } },
                    { formations: { description: { $regex: descriptionSpliced.join('|'), $options: 'i' } } },
                    { yearsOfExperience: { $gte: vacancy.yearsOfExperience } },
                ],
            },
        },
        {
            $project: {
                _id: 1,
                name: 1,
                role: 1,
                description: 1,
                skills: 1,
                yearsOfExperience: 1,
                profilePicture: 1,
                createdAt: 1,
            },
        }
    ]);

    // // WIP
    // // build a percentage of match for each user comparing the same things as que mongoose aggregation
    // users.forEach(user => {
    //     let matchedFeatures = 0;
    //     console.log(user.description, descriptionSpliced.join('|'));
    //     matchedFeatures += (user.description.match(new RegExp(descriptionSpliced.join('|'), 'i')) || []).length;


    //     if (user.description && user.description.match(new RegExp(descriptionSpliced.join('|'), 'i'))) matchedFeatures++;
    //     if (user.role && user.role.match(new RegExp(roleSpliced.join('|'), 'i'))) matchedFeatures += user.role.match(new RegExp(roleSpliced.join('|'), 'i')).length;
    //     if (user.skills && user.skills.find(skill => skill.name && skill.level && skill.name.match(new RegExp(vacancy.wantedSkills.join('|'), 'i')) && skill.level === vacancy.wantedSkillsLevel)) matchedFeatures++;
    //     if (user.experiences && user.experiences.find(experience => experience.role && experience.role.match(new RegExp(roleSpliced.join('|'), 'i')))) matchedFeatures++;
    //     if (user.experiences && user.experiences.find(experience => experience.description && experience.description.match(new RegExp(descriptionSpliced.join('|'), 'i')))) matchedFeatures++;
    //     if (user.formations && user.formations.find(formation => formation.institution && formation.institution.match(new RegExp(descriptionSpliced.join('|'), 'i')))) matchedFeatures++;
    //     if (user.formations && user.formations.find(formation => formation.description && formation.description.match(new RegExp(descriptionSpliced.join('|'), 'i')))) matchedFeatures++;
    //     if (user.yearsOfExperience && user.yearsOfExperience >= vacancy.yearsOfExperience) matchedFeatures++;

    //     user.matchedFeatures = matchedFeatures;
    //     user.matchPercentage = (matchedFeatures / vacancySearchWords) * 100;
    // });

    // sort the users by the match percentage
    return users
};

module.exports = {
    matchUsersWithVacancy,
};