const multer = require('multer');
const path = require('path');
const crypt = require('crypto');

module.exports = {
    // config the destination folder
    dest: path.resolve(__dirname, '..', '..', 'uploads'),
    // config the storage engine
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.resolve(__dirname, '..', '..',  'uploads'));
        },
        filename: (req, file, cb) => {
            crypt.randomBytes(16, (err, hash) => {
                if (err) {
                    cb(err);
                }

                file.key = `${hash.toString('hex')}-${file.originalname}`;

                cb(null, file.key);
            });
        }
    }),
    // config the file limits and filter
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'image/jpeg',
            'image/pjpeg',
            'image/png',
            'image/gif',
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type.'));
        }
    }
};