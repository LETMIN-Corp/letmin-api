const User = require('../../models/User');

// Get all users not blocked to show to company
async function companySearchUsers(search) {
    return User.find({
		$and: [
			{ blocked: false },
			{
				$or: [
					{ 'user.name': { $regex: search, $options: 'i' } },
				]
			}
		]
    }).select('-blocked -password -createdAt -updatedAt -__v');
}

module.exports = {
    companySearchUsers,
}