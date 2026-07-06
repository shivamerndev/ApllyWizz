import bcrypt from "bcrypt";
import MongoUserRepository from "../repository/mongo.user.js";
import { AppError } from "../utils/error.utils.js";
import { generateAccessToken } from "../utils/token.utils.js";


class AuthService {

    async register(userData) {
        const existingUser = await MongoUserRepository.findUserByEmail(userData.email);
        if (existingUser) throw new AppError(400, "Email already registered");

        let newUser = await MongoUserRepository.createUser(userData);
        if (!newUser) throw new AppError(500, "Registration Failed.");

        const accessToken = generateAccessToken(newUser._id);
        return accessToken;
    }

    async login(userData) {
        
        const { email, password } = userData;
        if (!email || !password) {
            throw new AppError(400, "Email and password are required");
        }

        const user = await MongoUserRepository.findUserByEmailWithPassword(email);
        if (!user) throw new AppError(400, "Invalid email or password");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new AppError(400, "Invalid email or password");

        const accessToken = generateAccessToken(user._id);
        return accessToken;
    }

    async getUser(userId) {
        const user = await MongoUserRepository.findUserById(userId);
        if (!user) throw new AppError(404, "User not found");
        return user;
    }

    async updateUser(userId, updates) {
        const user = await MongoUserRepository.updateUser(userId, updates);
        if (!user) throw new AppError(404, "User not found");
        return user;
    }

    async logout(userId) {

        return true;
    }

    async getManagers() {
        return await MongoUserRepository.findAllManagers();
    }

    async getAllUsers() {
        return await MongoUserRepository.findAllUsers();
    }
}

export default new AuthService();