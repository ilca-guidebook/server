import UserModel from '../../models/User';
import { roles as userRoles } from '../../enums/Users';

export default {
    write: async (req, res, next) => {
        const {
            user: { id },
        } = req;

        const user = await UserModel.findById(id);

        if (user.role !== userRoles.ADMIN && user.role !== userRoles.EDITOR) {
            return res.sendStatus(401);
        }

        next();
    },
};
