import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { CommonMessages } from '../utils/messages';
import UserModel from '../models/UserModel';
import envConfig from '../utils/envConfig';
import { IRequest } from '../utils/types';
import logger from '../../logger';
import { UserProjection } from '../utils/Projections/UserProjection';

const verifyToken = async (
    req: IRequest,
    res: Response,
    next: Function
): Promise<any> => {
    try {
        const authHeader = req.headers.authorization;
        const jwtFormat = /^Bearer\s(.+)$/;
        const jwtToken = authHeader?.match(jwtFormat)?.[1] as string;

        if (!jwtToken) {
            return res.status(401).json({
                error: true,
                code: 'INVALID_TOKEN',
                message: CommonMessages.INVALID_TOKEN,
            });
        } else {
            const decodedToken: any = jwt.verify(jwtToken, envConfig.jwtSecret);

            if (decodedToken?.email) {
                const user = await UserModel.findOne(
                    {
                        email: decodedToken.email,
                        isActive: true,
                    },
                    UserProjection
                );

                if (!user) {
                    return res.status(401).json({
                        error: true,
                        code: 'INVALID_TOKEN',
                        message: CommonMessages.INVALID_TOKEN,
                    });
                } else {
                    req.user = user;
                }
            }

            next();
        }
    } catch (error) {
        logger.error(error, '<<-- Error in verifing token');
        return res.status(401).json({
            error: true,
            code: 'INVALID_TOKEN',
            message: CommonMessages.INVALID_TOKEN,
        });
    }
};

export default verifyToken;
