const crypto = require('crypto');

const {
    r2,
    PutObjectCommand
} = require('./r2');

const uploadToR2 = async (
    file,
    folder = 'uploads'
) => {

    const extension =
        file.originalname.split('.').pop();

    const fileName =
        `${folder}/${
            crypto.randomUUID()
        }.${extension}`;

    await r2.send(

        new PutObjectCommand({

            Bucket:
                process.env.R2_BUCKET,

            Key: fileName,

            Body: file.buffer,

            ContentType:
                file.mimetype

        })

    );

    return {

        key: fileName,

        url:
            `${process.env.R2_PUBLIC_URL}/${fileName}`

    };

};

module.exports = uploadToR2;