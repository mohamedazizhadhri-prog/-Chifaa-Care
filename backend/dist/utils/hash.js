"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hash = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class Hash {
    static async hashPassword(password) {
        return await bcrypt_1.default.hash(password, this.SALT_ROUNDS);
    }
    static async comparePassword(password, hashedPassword) {
        return await bcrypt_1.default.compare(password, hashedPassword);
    }
}
exports.Hash = Hash;
Hash.SALT_ROUNDS = 12;
//# sourceMappingURL=hash.js.map