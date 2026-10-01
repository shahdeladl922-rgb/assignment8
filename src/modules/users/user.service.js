import userModel from "../../DB/models/user.model.js";
import * as dbSrevice from "../../DB/db.service.js"
import { Decrypt, Encrypt } from "../../common/security/encrypt.js";
import { Compare, Hash } from "../../common/security/hash.js";
import { OAuth2Client } from 'google-auth-library';
import jwt from "jsonwebtoken"
const client = new OAuth2Client();

// const asyncHandler = (fn) => {
//     return (req, res, next) => {
//         fn(req, res, next).catch((error) => {
//             // res.json({ message: error.message })
//             next(error)
//         })
//     }
// }



export const signup = async (req, res, next) => {

    const { fName, lName, age, email, gender, password, phone } = req.body;

    const emailExist = await userModel.findOne({ email: email.toLowerCase() });
    if (emailExist) {
        throw new Error("email already exist");
        // return res.status(409).json({ message: "email already exist" })
        // next(new Error("email already exist"));
    }

    const user = await dbSrevice.create({
        model: userModel,
        data: { fName, lName, age, email, gender, password: await Hash(password), phone: Encrypt(phone) }
    });
    return res.status(201).json({ message: "Done", user })
}


export const signupWithGmail = async (req, res, next) => {

    const { idToken } = req.body;
    const decoded = await client.verifyIdToken({
        idToken,
        audience: "281635038487-93fefb0vpo3kia1o4m50gi0jcjhjeoab.apps.googleusercontent.com"
    });
    const { family_name, given_name, picture, email_verified, email } = decoded.getPayload();
    let user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
        user = await userModel.create({
            fName: given_name,
            lName: family_name,
            email,
            profileiImage: picture,
            isConfirmed: email_verified,
            provider: "google"
        })
    }

    if (user.provider == "system") {
        throw new Error("login with system only");

    }


    const access_token = jwt.sign({ id: user._id, email: user.email }, "shahd1119", {
        expiresIn: 60 * 5
    });
    const refresh_token = jwt.sign({ id: user._id, email: user.email }, "shahd2002");


    return res.status(200).json({ message: "Done", tokens: { access_token, refresh_token } })

}



export const login = async (req, res, next) => {

    const { email, password } = req.body;
    const user = await dbSrevice.findOne(
        {
            model: userModel,
            filter: { email: email.toLowerCase(), provider: "system" }
        }
    );
    if (!user) {
        throw new Error("email not exist or you can signup first.");
        // return res.status(404).json({ message: "email not exist or you can signup first." })
        // next(new Error("email not exist or you can signup first."))
    }
    // if (user.isConfirmed !== true) {
    //     return res.status(404).json({ message: "email not confirmed." })
    // }
    if (!await Compare(password, user.password)) {
        throw new Error("inValid password.");
        // return res.status(404).json({ message: "inValid password." })
        // next(new Error("inValid password."))
    }

    const access_token = jwt.sign({ id: user._id, email: user.email }, "shahd1119", {
        expiresIn: 60 * 5,
        notBefore: 30,
        noTimestamp: true,
        audience: "http://localhost:4000",
        issuer: "http://localhost:3000"
    });
    const refresh_token = jwt.sign({ id: user._id, email: user.email }, "shahd2002");


    return res.status(200).json({ message: "Done", tokens: { access_token, refresh_token } })
}



export const getProfile = async (req, res, next) => {
    const { token } = req.body;
    if (!token) {
        throw new Error("token not exist");
    }

    const decoded = jwt.verify(token, "shahd1119");

    const user = await dbSrevice.findOne(
        {
            model: userModel,
            filter: { email: decoded.email.toLowerCase() }
        }
    );

    if (!user) {
        throw new Error("user not exist");
    }

    return res.status(200).json({ message: "Done", user })
}
