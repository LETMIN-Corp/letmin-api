// middleware to just receive and return res with a message and a success boolean
module.exports = (message) => {
    if (typeof message === 'string') {
        return (req, res) => {
            return res.status(200).json({
                success: true,
                message: message
            });
        };
    }
    // check if message is an object
    else if (typeof message === 'object') {
        return (req, res) => {
            return res.status(200).json({
                success: true,
                ...message
            });
        };
    }
}