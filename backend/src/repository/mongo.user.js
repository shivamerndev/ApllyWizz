import { User } from "../models/user.model.js";


class MongoUserRepository {

    async createUser(userData) {
        const user = new User(userData);
        const savedUser = await user.save();
        return savedUser;
    }

    async findUserByEmail(email) {
        return await User.findOne({ email });
    }

    async findUserByEmailWithPassword(email) {
        return await User.findOne({ email }).select("+password");
    }

    async findUserById(id) {
        return await User.findById(id);
    }

    async updateUser(userId, updates) {
        return await User.findByIdAndUpdate(userId, updates, { new: true });
    }

    async findAllManagers() {
        return await User.find({});
    }

    async findAllUsers() {
        return await User.find({});
    }
}

export default new MongoUserRepository();