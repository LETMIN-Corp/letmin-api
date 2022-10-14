const Complaint = require('../../models/Complaint');
// Get all complaints populating the target user/company and the envoy of the complaint
// If it's a company convert 'company.name' to 'name'

async function getAllComplaintsWithUsers() {
	return await Complaint.aggregate([
		{
			$lookup: {
				from: 'users',
				localField: 'envoy.foreignKey',
				foreignField: '_id',
				as: 'envoy.user'
			}
		},
		{
			$lookup: {
				from: 'companies',
				localField: 'envoy.foreignKey',
				foreignField: '_id',
				as: 'envoy.company'
			}
		},
		{
			$lookup: {
				from: 'admins',
				localField: 'envoy.foreignKey',
				foreignField: '_id',
				as: 'envoy.user'
			}
		},
		// Target
		{
			$lookup: {
				from: 'users',
				localField: 'target.foreignKey',
				foreignField: '_id',
				as: 'target.user'
			}
		},
		{
			$lookup: {
				from: 'companies',
				localField: 'target.foreignKey',
				foreignField: '_id',
				as: 'target.company'
			}
		},
		// Project
		{
			$project: {
				_id: 1,
				envoy: {
					$cond: {
						if: { $eq: [ '$envoy.user', [] ] },
						then: {
							$let: {
								vars: {
									company: { $arrayElemAt: [ '$envoy.company', 0 ] },
								},
								in: {
									_id: '$$company._id',
									name: '$$company.company.name',
									email: '$$company.company.email',
									role: '$envoy.role',
								}
							}
						},
						else: {
							$let: {
								vars: {
									user: { $arrayElemAt: [ '$envoy.user', 0 ] },
								},
								in: {
									_id: '$$user._id',
									name: '$$user.name',
									email: '$$user.email',
									role: '$envoy.role',
								}
							}
						}
					}
				},
				target: {
					$cond: {
						if: { $eq: [ '$target.user', [] ] },
						then: {
							$let: {
								vars: {
									company: { $arrayElemAt: [ '$target.company', 0 ] },
								},
								in: {
									_id: '$$company._id',
									name: '$$company.company.name',
									email: '$$company.company.email',
									role: '$envoy.role',
								}
							}
						},
						else: {
							$let: {
								vars: {
									user: { $arrayElemAt: [ '$target.user', 0 ] },
								},
								in: {
									_id: '$$user._id',
									name: '$$user.name',
									email: '$$user.email',
									role: '$envoy.role',
								}
							}
						}
					}
				},
				reason: 1,
				description: 1,
				pending: 1,
				createdAt: 1,
				updatedAt: 1
			}
		}
	]);
}

module.exports = {
	getAllComplaintsWithUsers
};