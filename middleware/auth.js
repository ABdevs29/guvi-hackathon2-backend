import jwt from "jsonwebtoken";

//Custom middleware for validating JWT Tokens

export const auth = (request, response, next) => {
    try{
        const token= request.header('x-auth-token');
        jwt.verify(token, process.env.SECRET_KEY);
        next();
    } catch (err) {
        response.status(403).send({err: err.message});
    }

}