const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.securePassword = async (password) => {
    try {
        return await bcrypt.hash(password, saltRounds);
    } catch (error) {
        console.log(error);
    }
};

